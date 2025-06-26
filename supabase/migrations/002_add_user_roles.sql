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