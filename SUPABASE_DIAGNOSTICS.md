# Supabase "Database error saving new user" - Diagnostics & Fixes

## Step 1: Check Your Supabase Dashboard Logs

1. Go to your Supabase project dashboard
2. Navigate to **Logs** → **Postgres Logs** (or **Database Logs**)
3. Look for errors around the time you tried to sign up
4. Common errors you might see:
   - Function errors
   - Trigger failures
   - Permission denied
   - Constraint violations

## Step 2: Check for Database Triggers

Run these queries in your Supabase **SQL Editor**:

### Query 1: List all triggers on auth.users

```sql
SELECT
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth';
```

**What to look for:**
- If you see triggers listed, one of them might be failing
- Common trigger: `on_auth_user_created` or similar

### Query 2: Check if you have a profiles table

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'profiles'
) as profiles_table_exists;
```

### Query 3: Check all functions that might run on user creation

```sql
SELECT
  n.nspname as schema,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname LIKE '%user%';
```

## Step 3: Common Fixes

### Fix 1: Disable All Triggers Temporarily (for testing)

If you have triggers that are failing, temporarily disable them to test signup:

```sql
-- List and disable triggers (TEMPORARY FIX FOR TESTING ONLY)
ALTER TABLE auth.users DISABLE TRIGGER ALL;
```

**⚠️ IMPORTANT:** This is only for testing! Re-enable after you fix the issue:

```sql
ALTER TABLE auth.users ENABLE TRIGGER ALL;
```

### Fix 2: Fix Broken Profile Creation Trigger

If you have a `handle_new_user` function that's failing:

**Delete the old trigger and function:**

```sql
-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing function
DROP FUNCTION IF EXISTS public.handle_new_user();
```

**Option A: Don't auto-create profiles** (simplest for now)

Just remove the trigger and function. You don't need a profiles table for basic auth to work.

**Option B: Recreate profile trigger correctly**

```sql
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Could not create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Fix 3: Check Email Provider Settings

1. Go to **Authentication** → **Settings** in Supabase
2. Under **Email** section:
   - ✅ **Confirm email**: Should be **DISABLED** for testing
   - ✅ **Secure email change**: Can be enabled or disabled
   - ✅ **Email provider**: Should be set (default is fine for testing)

### Fix 4: Check Rate Limiting

1. Go to **Authentication** → **Rate Limits**
2. Make sure you haven't hit the rate limit
3. Temporarily increase limits for testing:
   - Per hour limit: 100
   - Per second limit: 10

### Fix 5: Reset User Table State

If all else fails, check if there are orphaned users:

```sql
-- Check for users in auth.users
SELECT id, email, created_at, confirmed_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- If you see test users you want to delete:
-- DELETE FROM auth.users WHERE email = 'your-test-email@example.com';
```

## Step 4: Test Signup Again

After applying fixes:

1. **Clear your browser cache and cookies**
2. Try signing up with a **new email** (not one you've tried before)
3. Check the browser console for detailed error logs
4. Check Supabase Postgres logs again

## Step 5: Verify Supabase Configuration

Run this health check query:

```sql
-- Check auth configuration
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM information_schema.triggers WHERE event_object_schema = 'auth') as auth_triggers,
  (SELECT EXISTS(SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles')) as has_profiles_table;
```

## Alternative: Minimal Setup (No Triggers)

If you just want authentication to work without any extra setup:

```sql
-- Remove all triggers from auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remove profile-related functions
DROP FUNCTION IF EXISTS public.handle_new_user();

-- You can delete the profiles table if you don't need it
-- DROP TABLE IF EXISTS public.profiles CASCADE;
```

This will give you basic authentication without any database complications.

## Still Not Working?

If none of the above works, share the following information:

1. **Supabase Postgres Logs** output (from when you attempt signup)
2. **Browser Console** output (the detailed error we're now logging)
3. Results of this query:

```sql
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth';
```

## Quick Test: Try This Minimal Signup

To isolate the issue, try signing up without the email redirect option:

```typescript
// Test signup without redirect
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  // Remove options temporarily
});
```

If this works, the issue might be with the callback URL configuration.
