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