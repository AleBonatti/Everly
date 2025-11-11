# Database Migrations

## Overview

This directory contains SQL migrations for the SpecToDo application. These migrations add role-based access control (RBAC) to the application.

## Migrations

### 001_add_user_roles.sql
Creates the `user_roles` table and related infrastructure:
- `user_role` enum type (`'user'`, `'admin'`)
- `user_roles` table with foreign key to `auth.users`
- Row Level Security (RLS) policies
- Automatic user role creation on signup (defaults to 'user')
- Automatic `updated_at` timestamp updates

### 002_custom_access_token_hook.sql
Creates the Custom Access Token Hook function:
- Injects `user_role` claim into JWT tokens
- Runs automatically on login and token refresh
- Requires configuration in Supabase Dashboard

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `001_add_user_roles.sql`
4. Click **Run**
5. Repeat for `002_custom_access_token_hook.sql`

### Option 2: Supabase CLI

```bash
# Make sure you're logged in
supabase login

# Link your project (if not already linked)
supabase link --project-ref rnbdnrhvqzfclkzavbxk

# Run migrations
supabase db execute --file migrations/001_add_user_roles.sql
supabase db execute --file migrations/002_custom_access_token_hook.sql
```

### Option 3: psql (Direct Connection)

```bash
# Get your connection string from Supabase Dashboard
# Settings → Database → Connection string (Direct connection)

psql "postgresql://postgres:[YOUR-PASSWORD]@db.rnbdnrhvqzfclkzavbxk.supabase.co:5432/postgres" \
  -f migrations/001_add_user_roles.sql

psql "postgresql://postgres:[YOUR-PASSWORD]@db.rnbdnrhvqzfclkzavbxk.supabase.co:5432/postgres" \
  -f migrations/002_custom_access_token_hook.sql
```

## Post-Migration Configuration

### Configure Custom Access Token Hook

After running the migrations, you **must** configure the hook in Supabase Dashboard:

1. Go to **Authentication** → **Hooks** in Supabase Dashboard
2. Find **"Custom Access Token Hook"** section
3. Click **Enable Hook**
4. Select the function: `public.custom_access_token_hook`
5. Click **Save**

The hook will now automatically inject the `user_role` claim into JWT tokens.

### Test the Hook

To verify the hook is working:

1. Log in to your application
2. Check the JWT token in your browser's developer tools (Application → Cookies)
3. Decode the JWT at [jwt.io](https://jwt.io)
4. Look for the `user_role` claim in the token payload

## Creating Your First Admin User

All new users are created with the `'user'` role by default. To create an admin:

### Option 1: Using API Endpoint (After Implementation)

```bash
# First, promote your user to admin manually (see Option 2)
# Then use the admin API endpoint

curl -X PATCH http://localhost:3000/api/admin/users/[USER_ID]/role \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

### Option 2: Direct Database Update

```sql
-- Run this in Supabase SQL Editor
UPDATE user_roles
SET role = 'admin'
WHERE user_id = 'YOUR-USER-ID';
```

To find your user ID:
```sql
SELECT id, email FROM auth.users;
```

### Option 3: Create Admin Setup Script

See `app/api/admin/setup/route.ts` (if implemented) for a one-time setup endpoint.

## Rollback

To rollback these migrations:

```sql
-- Drop the trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Drop the custom access token hook
DROP FUNCTION IF EXISTS public.custom_access_token_hook(jsonb);

-- Drop the table
DROP TABLE IF EXISTS user_roles;

-- Drop the enum
DROP TYPE IF EXISTS user_role;
```

**Warning**: This will delete all role data. Make sure to backup first if needed.

## Verifying Migrations

Check that everything was created correctly:

```sql
-- Check if user_roles table exists
SELECT * FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'user_roles';

-- Check if enum exists
SELECT * FROM pg_type
WHERE typname = 'user_role';

-- Check if function exists
SELECT * FROM pg_proc
WHERE proname = 'custom_access_token_hook';

-- View all user roles
SELECT * FROM user_roles;
```

## Troubleshooting

### "role user_role already exists"
This is expected if you ran the migration before. The `DO $$ BEGIN ... END $$` block handles this gracefully.

### "function custom_access_token_hook already exists"
Use `CREATE OR REPLACE FUNCTION` (already in the migration).

### Hook not working / role not in JWT
1. Make sure you enabled the hook in Supabase Dashboard
2. Log out and log back in to get a new token
3. Check Supabase logs for any errors

### Permission denied errors
Make sure you're running migrations with the postgres role or service role key, not the anon key.
