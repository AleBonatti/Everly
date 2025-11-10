# Migration TODO

## Before Testing

### 1. Set Database Password

The `.env.local` file currently has a placeholder `[YOUR-PASSWORD]`. You need to:

1. Go to Supabase Dashboard → Settings → Database
2. Find your database password (or reset it if you don't have it)
3. Update `.env.local`:

```bash
# Replace [YOUR-PASSWORD] with your actual database password
DATABASE_URL=postgresql://postgres.rnbdnrhvqzfclkzavbxk:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

4. Restart the dev server: `npm run dev`

### 2. Fix Pre-existing Issue

There's a type error in `app/account/page.tsx` (line 201) about the `icon` prop on the Input component. This error existed before the migration and is unrelated to Drizzle.

To fix:
- Either remove the `icon` props from the Input components in the account page
- Or add the `icon` prop to the Input component definition

## Testing Checklist

Once DATABASE_URL is set:

- [ ] Start dev server: `npm run dev`
- [ ] Test login
- [ ] Test that categories load
- [ ] Create a new item
- [ ] Edit an existing item
- [ ] Delete an item
- [ ] Toggle item status (todo/done)
- [ ] Filter items by category
- [ ] Toggle "Hide done items"

## Deployment

When ready to deploy:

1. Add `DATABASE_URL` to Vercel environment variables
2. Make sure to use the **pooler** connection string (port 6543)
3. Deploy normally

## Migration Complete

Once tested, the migration is complete! You now have:

- ✅ Drizzle ORM for database operations
- ✅ Server-side API routes
- ✅ Supabase only for authentication
- ✅ Type-safe database queries
- ✅ Direct PostgreSQL access
