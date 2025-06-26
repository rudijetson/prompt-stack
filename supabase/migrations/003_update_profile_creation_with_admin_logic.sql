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