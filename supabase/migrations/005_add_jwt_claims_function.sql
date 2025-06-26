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