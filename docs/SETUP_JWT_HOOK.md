# Setting Up JWT Custom Access Token Hook

This guide explains how to configure the Custom Access Token Hook in Supabase to inject user roles into JWT tokens for better performance.

## Current State

The application uses a **hybrid approach** for role checking:

1. **Fast Path (JWT)**: First checks `user.app_metadata.user_role` from the JWT token
2. **Fallback (Database)**: Falls back to database query if JWT doesn't contain the role yet

This means the app works immediately, but setting up the hook will improve performance by avoiding database queries.

## Benefits of Setting Up the Hook

- ✅ **Faster role checks** - No database query needed
- ✅ **Reduced database load** - Role stored in JWT
- ✅ **Better scalability** - JWT can be cached/validated without DB access
- ✅ **Real-time updates** - Role changes reflected on next login/token refresh

## Setup Steps

### 1. Run the Migration

The SQL function is already in the migration file:

```bash
# Apply the migration to your Supabase database
psql YOUR_DATABASE_URL -f migrations/002_custom_access_token_hook.sql
```

Or run it manually in the Supabase SQL Editor: Copy the contents of `migrations/002_custom_access_token_hook.sql`

### 2. Enable the Hook in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Hooks** (in the left sidebar)
3. Find **Custom Access Token Hook** section
4. Click **Enable Hook**
5. In the dropdown, select: `public.custom_access_token_hook`
6. Click **Save**

![Supabase Hooks Configuration](https://supabase.com/docs/img/auth-hooks.png)

### 3. Verify the Hook is Working

After enabling the hook, test it by:

1. **Log out** from the application
2. **Log back in** with an admin user
3. Open browser DevTools → Console
4. Run this in the console:

```javascript
// Get the current user and check app_metadata
const supabase = window.supabaseClient; // or however you access supabase client
const { data } = await supabase.auth.getUser();
console.log('User role in JWT:', data.user.app_metadata.user_role);
```

You should see the role (e.g., `"admin"` or `"user"`) in the JWT claims.

## How It Works

### Before Setup (Database Fallback)
```
User request → Check JWT → No role found → Query database → Return role
└─ Slower (requires DB query every time)
```

### After Setup (JWT Fast Path)
```
User request → Check JWT → Role found → Return role
└─ Fast (no DB query needed)
```

### The Hook Function

The hook runs automatically on:
- User login
- Token refresh
- Any operation that generates a new access token

It queries the `user_roles` table and injects the role into the JWT:

```sql
-- Simplified version
SELECT role FROM user_roles WHERE user_id = <current_user_id>;
-- Inject into JWT: app_metadata.user_role = <role>
```

## Troubleshooting

### Role not appearing in JWT after enabling hook

1. **Clear browser cache and cookies**
2. **Log out completely** (not just refresh)
3. **Log back in** to get a new JWT
4. **Check token expiry** - Old tokens won't have the role until they expire and refresh

### Hook function not found

Make sure you ran the migration:
```bash
psql YOUR_DATABASE_URL -f migrations/002_custom_access_token_hook.sql
```

### Permission errors

The migration already sets the correct permissions:
```sql
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC;
```

## Code Changes

The following files implement the hybrid approach:

- [`lib/auth/client.ts`](../lib/auth/client.ts) - Client-side role checking
- [`lib/auth/middleware.ts`](../lib/auth/middleware.ts) - Server-side authentication
- [`app/api/auth/me/route.ts`](../app/api/auth/me/route.ts) - Fallback API endpoint

## Performance Comparison

| Scenario | JWT Hook Enabled | JWT Hook Disabled |
|----------|------------------|-------------------|
| Role check on authenticated request | ~0.1ms | ~5-20ms |
| Database queries per request | 0 | 1 |
| Scales to | Millions of requests | Thousands of requests |

## Optional: Force Token Refresh

If you want to test the JWT immediately without logging out, you can force a token refresh:

```javascript
const supabase = window.supabaseClient;
const { data, error } = await supabase.auth.refreshSession();
console.log('Refreshed token:', data.user.app_metadata.user_role);
```

## Next Steps

After setting up the hook:
1. Monitor application logs to confirm database queries are reduced
2. Consider removing the fallback code in a future version (once all users have re-authenticated)
3. Use JWT roles for other custom claims as needed
