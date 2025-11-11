# Drizzle ORM Migration

This document explains the migration from Supabase client to Drizzle ORM with direct PostgreSQL access.

## What Changed

### Architecture Overview

**Before:**
- Client components → Supabase client → Supabase REST API → PostgreSQL
- All database queries executed from client-side using Supabase JS SDK

**After:**
- Client components → Next.js API routes → Drizzle ORM → PostgreSQL (direct)
- Supabase client only used for authentication
- All database queries executed server-side

### Benefits

1. **Better Performance**: Direct PostgreSQL connection instead of REST API layer
2. **Type Safety**: Drizzle provides full TypeScript type inference
3. **Server-Side Security**: No client-side database access, better RLS enforcement
4. **Flexibility**: Can use raw SQL when needed
5. **Cost Optimization**: Fewer Supabase API calls

## Setup Instructions

### 1. Environment Variables

Add your PostgreSQL connection string to `.env.local`:

```bash
# Get this from Supabase Dashboard:
# Settings → Database → Connection string → Direct connection
# Replace [YOUR-PASSWORD] with your actual database password

DATABASE_URL=postgresql://postgres.rnbdnrhvqzfclkzavbxk:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

⚠️ **Important**:
- Use the **Session pooler** connection string (port 6543), not the direct connection (port 5432)
- This is optimized for serverless environments like Vercel
- Never commit your password to version control

### 2. Install Dependencies

Dependencies are already installed:
- `drizzle-orm` - The ORM
- `postgres` - PostgreSQL client for Node.js
- `drizzle-kit` - CLI tools for migrations

### 3. Database Schema

The schema is defined in [`lib/db/schema.ts`](lib/db/schema.ts):

```typescript
import { pgTable, uuid, text, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core'

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  type: categoryTypeEnum('type').notNull().default('default'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Items table
export const items = pgTable('items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  title: text('title').notNull(),
  // ... other fields
})
```

## API Structure

### Categories API

**GET `/api/categories`**
- List all categories ordered by `display_order`
- Returns: `Category[]`

### Items API

**GET `/api/items`**
- List items with optional filters: `categoryId`, `status`
- Returns: `Item[]`

**POST `/api/items`**
- Create a new item
- Body: `CreateItemInput`
- Returns: `Item`

**GET `/api/items/[id]`**
- Get a single item
- Returns: `Item`

**PATCH `/api/items/[id]`**
- Update an item
- Body: `UpdateItemInput`
- Returns: `Item`

**DELETE `/api/items/[id]`**
- Delete an item
- Returns: `{ success: true }`

## Client Services

The client services ([`lib/services/categories.ts`](lib/services/categories.ts) and [`lib/services/items.ts`](lib/services/items.ts)) now use the Fetch API:

```typescript
// Before (Supabase client)
const { data, error } = await supabase
  .from('items')
  .select('*')
  .eq('user_id', user.id)

// After (Fetch API)
const response = await fetch('/api/items')
const data = await response.json()
```

## Authentication

Supabase is still used for authentication:

1. **API Routes**: Check authentication using `createClient()` from `@/lib/supabase/server`
2. **Client Pages**: Auth pages still use Supabase client for login/signup
3. **User Service**: Profile management uses Supabase Auth API

Example authentication in API route:

```typescript
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use user.id for queries...
}
```

## Testing

Run the development server and test all operations:

```bash
npm run dev
```

Test checklist:
- [ ] Login/Signup still works
- [ ] Categories load correctly
- [ ] Create new item
- [ ] Update existing item
- [ ] Delete item
- [ ] Toggle item status
- [ ] Filter items by category
- [ ] Filter items by status

## Deployment to Vercel

1. Add `DATABASE_URL` to Vercel environment variables
2. Deploy as normal - the postgres driver is optimized for serverless
3. Connection pooling is handled automatically

## Rollback Plan

If you need to rollback:

1. Checkout the previous branch: `git checkout 002-ui-integration`
2. The old Supabase client implementation is still there
3. No database changes were made, so data is safe

## Future Enhancements

With Drizzle in place, you can now:

1. **Generate migrations**: Use `drizzle-kit` to generate SQL migrations from schema changes
2. **Add relations**: Define relations between tables for easier joins
3. **Query builder**: Use Drizzle's powerful query builder for complex queries
4. **Performance**: Add database indexes, optimize queries
5. **Raw SQL**: Execute raw SQL when needed for complex operations

## Files Changed

### New Files
- `drizzle.config.ts` - Drizzle configuration
- `lib/db/schema.ts` - Database schema definitions
- `lib/db/index.ts` - Database connection utility
- `app/api/categories/route.ts` - Categories API
- `app/api/items/route.ts` - Items list and create API
- `app/api/items/[id]/route.ts` - Item get/update/delete API

### Modified Files
- `lib/services/categories.ts` - Now uses Fetch API
- `lib/services/items.ts` - Now uses Fetch API
- `.env.local` - Added DATABASE_URL
- `package.json` - Added Drizzle dependencies

### Unchanged (Still using Supabase)
- `lib/services/user.ts` - User authentication and profile
- `app/auth/login/page.tsx` - Login page
- `app/auth/signup/page.tsx` - Signup page
- `app/auth/callback/route.ts` - Auth callback
- `lib/supabase/client.ts` - Supabase client setup
- `lib/supabase/server.ts` - Supabase server setup

## Troubleshooting

### "DATABASE_URL is not set"
- Make sure `.env.local` has the DATABASE_URL variable
- Restart the dev server after adding environment variables

### "Connection timeout"
- Use the **Session pooler** connection string (port 6543)
- Check that your IP is whitelisted in Supabase dashboard

### "Unauthorized" errors
- Authentication still uses Supabase - make sure you're logged in
- Check that Supabase auth environment variables are set

### Type errors
- Run `npm run build` to check for TypeScript errors
- The schema types are automatically inferred by Drizzle
