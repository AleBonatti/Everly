# Role-Based Access Control (RBAC) Guide

This guide explains how to use and extend the RBAC system in SpecToDo.

## Overview

The application uses a hybrid RBAC approach:
- **Database**: Drizzle ORM stores user roles in `user_roles` table (source of truth)
- **JWT**: Custom Access Token Hook injects roles into JWT claims for zero-overhead auth checks
- **Middleware**: Reusable auth guards protect API routes

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Client Request                                                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  API Route Handler                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  requireAuth(request) or requireAdmin(request)            │  │
│  │  ↓                                                         │  │
│  │  Extracts JWT → Reads user_role claim                     │  │
│  │  ↓                                                         │  │
│  │  Returns AuthContext { user: { id, email, role } }        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Business Logic with authContext.user.role                      │
└─────────────────────────────────────────────────────────────────┘

JWT Claims contain user_role (injected by Supabase Custom Access Token Hook)
Database is source of truth (updated via admin endpoints)
```

## Roles

### Available Roles

- **`user`** (default): Regular user with access to their own data
- **`admin`**: Administrator with access to admin endpoints and user management

### Role Hierarchy

Currently, roles are flat (no hierarchy). To add hierarchy:

```typescript
// types/auth.ts
export enum UserRole {
  USER = 0,
  ADMIN = 10,
}

export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return userRole >= requiredRole
}
```

## Usage

### Protecting API Routes

#### Require Authentication (Any Role)

```typescript
import { requireAuth, handleAuthError } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    const context = await requireAuth(request)

    // context.user.id - User ID
    // context.user.email - User email
    // context.user.role - User role ('user' | 'admin')

    // Your business logic here
    return NextResponse.json({ data: 'Protected data' })
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    // Handle other errors
  }
}
```

#### Require Admin Role

```typescript
import { requireAdmin, handleAuthError } from '@/lib/auth/middleware'

export async function POST(request: NextRequest) {
  try {
    const context = await requireAdmin(request)

    // Only admins can reach this code
    // Your admin logic here

    return NextResponse.json({ message: 'Admin action completed' })
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    // Handle other errors
  }
}
```

#### Require Specific Roles

```typescript
import { requireRole, handleAuthError } from '@/lib/auth/middleware'
import { USER_ROLES } from '@/types/auth'

export async function PATCH(request: NextRequest) {
  try {
    const context = await requireRole(request, [USER_ROLES.ADMIN, USER_ROLES.MODERATOR])

    // Admins and moderators can access this

    return NextResponse.json({ message: 'Success' })
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
import { USER_ROLES, isAdmin } from '@/types/auth'

export async function GET(request: NextRequest) {
  try {
    const context = await requireAuth(request)

    if (isAdmin(context.user.role)) {
      // Admin-specific logic
      return getAllItems() // Admins see all items
    } else {
      // Regular user logic
      return getUserItems(context.user.id) // Users see only their items
    }
  } catch (error) {
    // Error handling
  }
}
```

## Admin Endpoints

### List All Users with Roles

```bash
GET /api/admin/users
Authorization: Bearer <admin-jwt-token>
```

Response:
```json
{
  "users": [
    {
      "userId": "uuid",
      "role": "admin",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Get User Role

```bash
GET /api/admin/users/{userId}/role
Authorization: Bearer <admin-jwt-token>
```

Response:
```json
{
  "userId": "uuid",
  "role": "user",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### Update User Role

```bash
PATCH /api/admin/users/{userId}/role
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "role": "admin"
}
```

Response:
```json
{
  "userId": "uuid",
  "role": "admin",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z",
  "message": "User role updated to admin"
}
```

**Note**: Admins cannot demote themselves. Another admin must change their role.

## Setup Instructions

### 1. Run Database Migrations

See [`migrations/README.md`](migrations/README.md) for detailed instructions.

```bash
# Run migrations in Supabase SQL Editor
# 1. migrations/001_add_user_roles.sql
# 2. migrations/002_custom_access_token_hook.sql
```

### 2. Enable Custom Access Token Hook

1. Go to Supabase Dashboard → **Authentication** → **Hooks**
2. Find **"Custom Access Token Hook"**
3. Click **Enable Hook**
4. Select function: `public.custom_access_token_hook`
5. Click **Save**

### 3. Create Your First Admin

Run this SQL in Supabase SQL Editor:

```sql
-- Find your user ID
SELECT id, email FROM auth.users;

-- Update your role to admin
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id-here', 'admin')
ON CONFLICT (user_id)
DO UPDATE SET role = 'admin', updated_at = NOW();
```

### 4. Log Out and Log Back In

The role is injected into the JWT on login. Log out and log back in to get a new token with the admin role.

### 5. Verify Admin Access

```bash
# Test admin endpoint (replace with your token)
curl http://localhost:3000/api/admin/users \
  -H "Cookie: your-session-cookie"
```

## Testing

### Test Authentication

```typescript
// Test file: __tests__/auth.test.ts
import { authenticate, requireAuth, requireAdmin } from '@/lib/auth/middleware'

describe('Auth Middleware', () => {
  it('should authenticate valid user', async () => {
    const request = new NextRequest('http://localhost/api/test')
    // Add auth cookies to request
    const context = await authenticate(request)
    expect(context).not.toBeNull()
    expect(context?.user.role).toBe('user')
  })

  it('should reject unauthenticated request', async () => {
    const request = new NextRequest('http://localhost/api/test')
    await expect(requireAuth(request)).rejects.toThrow('Unauthorized')
  })

  it('should reject non-admin user', async () => {
    const request = new NextRequest('http://localhost/api/test')
    // Add regular user auth
    await expect(requireAdmin(request)).rejects.toThrow('Forbidden')
  })
})
```

### Manual Testing Checklist

- [ ] Regular user can access their own items
- [ ] Regular user cannot access admin endpoints
- [ ] Admin can access admin endpoints
- [ ] Admin can view all users
- [ ] Admin can promote user to admin
- [ ] Admin cannot demote themselves
- [ ] Unauthenticated requests are rejected
- [ ] JWT contains `user_role` claim

## Extending the System

### Adding New Roles

1. **Update the enum in database schema:**

```typescript
// lib/db/schema.ts
export const userRoleEnum = pgEnum('user_role', ['user', 'moderator', 'admin'])
```

2. **Update TypeScript types:**

```typescript
// types/auth.ts
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const
```

3. **Run migration:**

```sql
ALTER TYPE user_role ADD VALUE 'moderator';
```

4. **Create role-specific middleware:**

```typescript
// lib/auth/middleware.ts
export async function requireModerator(request: NextRequest): Promise<AuthContext> {
  return requireRole(request, [USER_ROLES.MODERATOR, USER_ROLES.ADMIN])
}
```

### Adding Permissions System

For fine-grained permissions, extend the system:

1. **Create permissions table:**

```typescript
// lib/db/schema.ts
export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(), // e.g., "items:create", "users:delete"
  description: text('description'),
})

export const rolePermissions = pgTable('role_permissions', {
  role: userRoleEnum('role').notNull(),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id),
})
```

2. **Create permission checker:**

```typescript
// lib/auth/permissions.ts
export async function hasPermission(
  role: UserRole,
  permission: string
): Promise<boolean> {
  const db = getDb()
  const result = await db
    .select()
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(
      eq(rolePermissions.role, role),
      eq(permissions.name, permission)
    ))
    .limit(1)

  return result.length > 0
}
```

## Security Best Practices

1. **Always use middleware**: Never manually check auth in route handlers
2. **Validate JWT server-side**: Don't trust client-side role claims
3. **Use service role sparingly**: Only use Supabase service role for admin operations
4. **Audit role changes**: Log all role modifications (add audit table)
5. **Rate limit admin endpoints**: Prevent brute force attacks
6. **Don't expose user emails**: Return minimal user info in API responses

## Troubleshooting

### Role not in JWT

**Problem**: `authContext.user.role` is always 'user' even after promotion

**Solutions**:
1. Log out and log back in (JWT is cached)
2. Check hook is enabled in Supabase Dashboard
3. Verify hook function exists: `SELECT * FROM pg_proc WHERE proname = 'custom_access_token_hook'`
4. Check Supabase logs for hook errors

### 403 Forbidden on admin endpoint

**Problem**: Admin user gets 403 on `/api/admin/*`

**Solutions**:
1. Verify role in database: `SELECT * FROM user_roles WHERE user_id = 'your-id'`
2. Check JWT at [jwt.io](https://jwt.io) - look for `user_role` claim
3. Ensure you logged out and back in after role change

### Migration errors

**Problem**: `role user_role already exists`

**Solution**: This is normal if re-running migrations. The migration handles this gracefully.

## API Reference

### Auth Middleware Functions

#### `authenticate(request: NextRequest): Promise<AuthContext | null>`
Authenticates request and returns user context, or null if unauthenticated.

#### `requireAuth(request: NextRequest): Promise<AuthContext>`
Requires authentication. Throws `AuthError` (401) if unauthenticated.

#### `requireRole(request: NextRequest, allowedRoles: UserRole[]): Promise<AuthContext>`
Requires user to have one of the specified roles. Throws `AuthError` (403) if insufficient permissions.

#### `requireAdmin(request: NextRequest): Promise<AuthContext>`
Requires admin role. Convenience function for `requireRole(request, ['admin'])`.

#### `handleAuthError(error: unknown): NextResponse`
Handles auth errors and returns appropriate HTTP response (401 or 403).

### Type Definitions

```typescript
interface AuthUser {
  id: string
  email?: string
  role: UserRole
}

interface AuthContext {
  user: AuthUser
}

type UserRole = 'user' | 'admin'
```

## Further Reading

- [Supabase Custom Access Token Hooks](https://supabase.com/docs/guides/auth/auth-hooks)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
