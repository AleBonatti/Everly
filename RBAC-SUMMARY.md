# RBAC Implementation Summary

## What Was Implemented

A complete Role-Based Access Control (RBAC) system has been added to your application. The system uses a hybrid approach combining database storage with JWT claims for optimal performance and security.

## Architecture

```
User Login → Supabase Auth → Custom Access Token Hook → JWT with role claim
                                      ↓
                                Database (user_roles table)
                                      ↓
                            API Routes check JWT role
```

## Components Created

### 1. Database Layer

**Files:**
- `lib/db/schema.ts` (modified) - Added `userRoleEnum` and `user_roles` table
- `migrations/001_add_user_roles.sql` - Database migration
- `migrations/002_custom_access_token_hook.sql` - JWT hook function
- `migrations/README.md` - Migration instructions

**Features:**
- `user_roles` table with automatic creation on signup
- Default role: `'user'`
- Available roles: `'user'`, `'admin'`
- RLS policies for security
- Automatic timestamp updates

### 2. Auth Middleware

**Files:**
- `lib/auth/middleware.ts` - Reusable auth guards
- `types/auth.ts` - TypeScript types and helpers

**Functions:**
- `requireAuth(request)` - Require any authenticated user
- `requireRole(request, roles[])` - Require specific roles
- `requireAdmin(request)` - Require admin role (shortcut)
- `handleAuthError(error)` - Unified error handling

### 3. Updated API Routes

**Modified Files:**
- `app/api/categories/route.ts`
- `app/api/items/route.ts`
- `app/api/items/[id]/route.ts`

**Changes:**
- Replaced manual auth checks with middleware functions
- Consistent error handling
- Cleaner, more maintainable code
- Extract user info from `AuthContext`

### 4. Admin Endpoints

**New Files:**
- `app/api/admin/users/route.ts` - List all users
- `app/api/admin/users/[id]/role/route.ts` - Get/update user role

**Features:**
- Admin-only access (403 for non-admins)
- Get user role by ID
- Update user role (promote/demote)
- Self-demotion protection
- Input validation

### 5. Documentation

**Files:**
- `RBAC-GUIDE.md` - Comprehensive usage guide
- `RBAC-SUMMARY.md` - This file (quick reference)
- `migrations/README.md` - Database setup instructions

## Setup Required

### Step 1: Run Database Migrations

Open Supabase SQL Editor and run these files in order:

1. `migrations/001_add_user_roles.sql`
2. `migrations/002_custom_access_token_hook.sql`

### Step 2: Enable Custom Access Token Hook

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Hooks**
3. Find **"Custom Access Token Hook"**
4. Enable it and select: `public.custom_access_token_hook`
5. Save

### Step 3: Create Your First Admin

Run this SQL (replace `YOUR-USER-ID`):

```sql
-- Find your user ID
SELECT id, email FROM auth.users;

-- Promote to admin
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR-USER-ID', 'admin')
ON CONFLICT (user_id)
DO UPDATE SET role = 'admin', updated_at = NOW();
```

### Step 4: Test

1. **Log out and log back in** (to get new JWT with role)
2. Test admin endpoint: `GET /api/admin/users`
3. Verify JWT at [jwt.io](https://jwt.io) - should contain `user_role` claim

## Usage Examples

### Protect Any Route (Require Auth)

```typescript
import { requireAuth, handleAuthError } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    const context = await requireAuth(request)
    // context.user.id, context.user.email, context.user.role

    return NextResponse.json({ data: 'protected' })
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    // Handle other errors
  }
}
```

### Admin-Only Route

```typescript
import { requireAdmin, handleAuthError } from '@/lib/auth/middleware'

export async function POST(request: NextRequest) {
  try {
    const context = await requireAdmin(request)
    // Only admins reach here

    return NextResponse.json({ message: 'Admin action' })
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    // Handle other errors
  }
}
```

### Conditional Logic Based on Role

```typescript
import { requireAuth } from '@/lib/auth/middleware'
import { isAdmin } from '@/types/auth'

export async function GET(request: NextRequest) {
  try {
    const context = await requireAuth(request)

    if (isAdmin(context.user.role)) {
      return getAllData() // Admin sees everything
    } else {
      return getUserData(context.user.id) // User sees only their data
    }
  } catch (error) {
    // Error handling
  }
}
```

## Admin API Endpoints

### List All Users

```bash
GET /api/admin/users
```

Returns all users with their roles.

### Get User Role

```bash
GET /api/admin/users/{userId}/role
```

Returns role for specific user.

### Update User Role

```bash
PATCH /api/admin/users/{userId}/role
Content-Type: application/json

{
  "role": "admin"
}
```

Promotes or demotes user. Admins cannot demote themselves.

## How It Works

1. **User Signs Up**: Trigger automatically creates `user_roles` record with default `'user'` role
2. **User Logs In**: Custom Access Token Hook runs and injects `user_role` claim into JWT
3. **API Request**: Middleware extracts role from JWT (no database query needed!)
4. **Authorization**: Middleware checks if user has required role
5. **Response**: 200 (success), 401 (not authenticated), or 403 (insufficient permissions)

## Security Features

- ✅ Roles stored in database (source of truth)
- ✅ Roles injected into JWT by server (cannot be tampered with)
- ✅ RLS policies prevent unauthorized access
- ✅ Admins cannot demote themselves
- ✅ Type-safe role checks
- ✅ Consistent error handling
- ✅ No extra database queries per request

## Benefits

### For Developers

- **Type Safety**: Full TypeScript support
- **DRY Code**: Reusable middleware functions
- **Maintainable**: Clear separation of concerns
- **Extensible**: Easy to add new roles/permissions
- **Testable**: Middleware functions are easy to test

### For Users

- **Secure**: Industry-standard RBAC pattern
- **Fast**: Zero performance overhead (role in JWT)
- **Reliable**: Database is source of truth
- **Flexible**: Admins can manage user roles

## Extending the System

### Add New Role

1. Update enum: `export const userRoleEnum = pgEnum('user_role', ['user', 'moderator', 'admin'])`
2. Update types: `types/auth.ts`
3. Run SQL: `ALTER TYPE user_role ADD VALUE 'moderator';`
4. Create middleware: `requireModerator()`

### Add Permissions

See `RBAC-GUIDE.md` → "Adding Permissions System" for detailed instructions on implementing fine-grained permissions.

## Troubleshooting

### Role not appearing in JWT

**Problem**: User promoted to admin but still has `'user'` role

**Solution**: Log out and log back in to get new JWT

### 403 on admin endpoint

**Problem**: Admin gets forbidden error

**Solutions**:
1. Check database: `SELECT * FROM user_roles WHERE user_id = 'your-id'`
2. Decode JWT at [jwt.io](https://jwt.io) - look for `user_role` claim
3. Verify hook is enabled in Supabase Dashboard

### Hook not working

**Problem**: JWT doesn't contain `user_role` claim

**Solutions**:
1. Check hook function exists: `SELECT * FROM pg_proc WHERE proname = 'custom_access_token_hook'`
2. Verify hook is enabled in Dashboard: Authentication → Hooks
3. Check Supabase logs for errors

## Testing Checklist

- [ ] Migrations run successfully
- [ ] Custom Access Token Hook enabled in Dashboard
- [ ] First admin user created
- [ ] Admin can access `/api/admin/users`
- [ ] Regular user gets 403 on admin endpoints
- [ ] JWT contains `user_role` claim (check at jwt.io)
- [ ] Admin can promote users
- [ ] Admin cannot demote themselves
- [ ] Build succeeds: `npm run build`

## Files Modified

### New Files
- `lib/auth/middleware.ts`
- `types/auth.ts`
- `app/api/admin/users/route.ts`
- `app/api/admin/users/[id]/role/route.ts`
- `migrations/001_add_user_roles.sql`
- `migrations/002_custom_access_token_hook.sql`
- `migrations/README.md`
- `RBAC-GUIDE.md`
- `RBAC-SUMMARY.md` (this file)

### Modified Files
- `lib/db/schema.ts` - Added user_roles table
- `app/api/categories/route.ts` - Uses new middleware
- `app/api/items/route.ts` - Uses new middleware
- `app/api/items/[id]/route.ts` - Uses new middleware

### No Changes Required
- Client-side code (React components, hooks)
- Supabase auth flow (login/signup still works as before)
- Existing user data (all backward compatible)

## Next Steps

1. **Setup** (15 minutes):
   - Run migrations
   - Enable hook
   - Create admin user

2. **Test** (10 minutes):
   - Verify admin access
   - Test role updates
   - Check JWT claims

3. **Deploy** (5 minutes):
   - Push to production
   - Run migrations on production database
   - Enable hook on production Supabase

4. **Optional**:
   - Add more roles (moderator, etc.)
   - Implement permissions system
   - Create admin UI for user management
   - Add audit logging

## Support

For detailed information, see:
- **Usage Guide**: `RBAC-GUIDE.md`
- **Migration Instructions**: `migrations/README.md`
- **Code Examples**: Check the files in `app/api/` for reference implementations

## Summary

You now have a production-ready RBAC system! The implementation follows security best practices and is designed to be:

- **Secure**: Database-backed with JWT claims
- **Fast**: No extra queries (role in JWT)
- **Flexible**: Easy to extend with new roles/permissions
- **Type-Safe**: Full TypeScript support
- **Maintainable**: Clean, reusable middleware

Complete the setup steps above to start using role-based authorization in your application.
