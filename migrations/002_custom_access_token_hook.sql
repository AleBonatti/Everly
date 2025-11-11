-- Migration: Custom Access Token Hook
-- Description: Creates a hook that injects user_role into JWT claims
-- This must be configured in Supabase Dashboard after running this migration

-- Create the custom access token hook function
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Fetch the user's role from user_roles table
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = (event->>'user_id')::uuid;

  -- Get existing claims from the event
  claims := event->'claims';

  -- If user has a role, inject it into claims
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  ELSE
    -- Default to 'user' if no role found
    claims := jsonb_set(claims, '{user_role}', to_jsonb('user'));
  END IF;

  -- Update the claims in the event
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

-- Grant execute permission to supabase_auth_admin
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Revoke from public for security
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM anon;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated;

-- Grant to service role (for testing/admin operations)
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO service_role;

-- Note: After running this migration, you must configure the hook in Supabase Dashboard:
-- 1. Go to Authentication > Hooks in Supabase Dashboard
-- 2. Enable "Custom Access Token Hook"
-- 3. Select the function: public.custom_access_token_hook
-- 4. Save the configuration
--
-- The hook will now run automatically on:
-- - User login
-- - Token refresh
-- - Any operation that generates a new access token
