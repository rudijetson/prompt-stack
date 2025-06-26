-- Combined Supabase migrations
-- Generated: Thu Jun 26 18:18:54 EDT 2025
-- Run this file in Supabase SQL Editor


-- ================================================
-- Migration: 001_initial_schema.sql
-- ================================================
-- Prompt-Stack Minimal Schema
-- Just enough to make authentication work properly

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table - extends Supabase auth with basic user info
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can see all profiles but only edit their own
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Keep updated_at current
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION touch_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- ================================================
-- Migration: 002_add_user_roles.sql
-- ================================================
-- Add role system to profiles table

-- Add role column with check constraint
ALTER TABLE public.profiles 
ADD COLUMN role TEXT DEFAULT 'user' 
CHECK (role IN ('user', 'admin', 'super_admin'));

-- Create index on role for performance
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Update RLS policies to consider roles

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile" 
  ON profiles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Allow admins to delete profiles (except their own)
CREATE POLICY "Admins can delete other profiles" 
  ON profiles FOR DELETE 
  USING (
    auth.uid() != id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND (
      (required_role = 'user' AND role IN ('user', 'admin', 'super_admin')) OR
      (required_role = 'admin' AND role IN ('admin', 'super_admin')) OR
      (required_role = 'super_admin' AND role = 'super_admin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;

-- ================================================
-- Migration: 003_update_profile_creation_with_admin_logic.sql
-- ================================================
-- Update the profile creation trigger to include admin role logic

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create updated function with admin logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_count INTEGER;
  user_role TEXT;
BEGIN
  -- Count existing users to determine if this is the first user
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Default role is 'user'
  user_role := 'user';
  
  -- First user becomes admin
  IF user_count = 0 THEN
    user_role := 'admin';
  END IF;
  
  -- Check if email is in ADMIN_EMAILS environment variable
  -- Note: This requires a custom function to access app settings from the database
  -- For now, we'll handle this in the backend API during signup
  
  -- Insert the profile with determined role
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_role
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to promote user to admin (can be called from backend)
CREATE OR REPLACE FUNCTION public.promote_to_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.profiles 
  SET role = 'admin', updated_at = NOW()
  WHERE email = user_email AND role = 'user';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check and update admin status based on email
-- This can be called after user creation to handle ADMIN_EMAILS logic
CREATE OR REPLACE FUNCTION public.check_admin_email(user_email TEXT, admin_emails TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  -- If email is in admin list and user is not already admin, promote them
  IF user_email = ANY(admin_emails) THEN
    UPDATE public.profiles 
    SET role = 'admin', updated_at = NOW()
    WHERE email = user_email AND role = 'user';
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.promote_to_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_admin_email TO service_role;

-- ================================================
-- Migration: 004_fix_role_security.sql
-- ================================================
-- Fix security issues with role management

-- First, drop the existing update policy that's too permissive
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create a more secure update policy that excludes the role field
CREATE POLICY "Users can update own profile except role" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Ensure role hasn't changed
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- Create a separate policy for role updates (admin only)
CREATE POLICY "Only admins can update roles"
  ON profiles FOR UPDATE
  USING (
    -- Current user must be admin or super_admin
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    -- Can't demote yourself if you're the last admin
    CASE 
      WHEN auth.uid() = id AND 
           (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin') AND 
           role = 'user' THEN
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id != auth.uid() 
          AND role IN ('admin', 'super_admin')
        )
      ELSE true
    END
  );

-- Update the handle_new_user function to use atomic operation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_count INTEGER;
  user_role TEXT;
  is_first BOOLEAN;
BEGIN
  -- Use advisory lock to prevent race condition
  PERFORM pg_advisory_xact_lock(1);
  
  -- Check if this is the first user
  SELECT COUNT(*) = 0 INTO is_first FROM public.profiles;
  
  -- Default role is 'user'
  user_role := 'user';
  
  -- First user becomes admin
  IF is_first THEN
    user_role := 'admin';
  END IF;
  
  -- Insert the profile with determined role
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_role
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit table for role changes
CREATE TABLE IF NOT EXISTS public.role_audit (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  changed_by UUID REFERENCES auth.users NOT NULL,
  old_role TEXT,
  new_role TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit table
ALTER TABLE role_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view role audit" 
  ON role_audit FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Create trigger to audit role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if role actually changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.role_audit (user_id, changed_by, old_role, new_role)
    VALUES (
      NEW.id,
      auth.uid(),
      OLD.role,
      NEW.role
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role change auditing
CREATE TRIGGER on_profile_role_change
  AFTER UPDATE OF role ON profiles
  FOR EACH ROW 
  EXECUTE FUNCTION audit_role_changes();

-- Drop the old version of promote_to_admin function
DROP FUNCTION IF EXISTS public.promote_to_admin(TEXT);

-- Add function to safely promote user (with audit trail)
CREATE OR REPLACE FUNCTION public.promote_to_admin(
  user_email TEXT,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  target_user_id UUID;
  updated_count INTEGER;
BEGIN
  -- Get user ID
  SELECT id INTO target_user_id FROM profiles WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;
  
  -- Update role
  UPDATE profiles 
  SET role = 'admin', updated_at = NOW()
  WHERE id = target_user_id AND role = 'user';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Log the reason if provided
  IF updated_count > 0 AND reason IS NOT NULL THEN
    UPDATE role_audit 
    SET reason = reason
    WHERE user_id = target_user_id 
    AND created_at = (
      SELECT MAX(created_at) 
      FROM role_audit 
      WHERE user_id = target_user_id
    );
  END IF;
  
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the permissions
GRANT EXECUTE ON FUNCTION public.promote_to_admin TO authenticated;
GRANT SELECT ON TABLE public.role_audit TO authenticated;

-- ================================================
-- Migration: 005_add_jwt_claims_function.sql
-- ================================================
-- Add custom claims to JWT tokens
-- This function is called by Supabase to add custom data to JWT tokens

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  user_role TEXT;
BEGIN
  -- Get the current claims
  claims := event->'claims';
  
  -- Get user's role from profiles table
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;
  
  -- Add custom claims
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    claims := jsonb_set(claims, '{is_admin}', to_jsonb(user_role IN ('admin', 'super_admin')));
  ELSE
    -- Default to user role if profile doesn't exist yet
    claims := jsonb_set(claims, '{user_role}', '"user"'::jsonb);
    claims := jsonb_set(claims, '{is_admin}', 'false'::jsonb);
  END IF;
  
  -- Update the event with new claims
  event := jsonb_set(event, '{claims}', claims);
  
  RETURN event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Note: You need to configure this in Supabase Dashboard:
-- 1. Go to Authentication > Hooks
-- 2. Enable "Custom access token hook"
-- 3. Select the function: custom_access_token_hook

-- Alternative: Add app_metadata during signup
-- This ensures role is available even before custom claims
CREATE OR REPLACE FUNCTION public.set_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's raw_app_meta_data with their role
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync role to user metadata
DROP TRIGGER IF EXISTS sync_role_to_metadata ON profiles;
CREATE TRIGGER sync_role_to_metadata
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_user_metadata();
