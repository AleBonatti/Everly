# Migration Steps: Global Categories with Custom Ordering

## Overview
This migration converts categories from user-specific to global (shared) and adds custom ordering capability.

## What Changed

### Database Schema
- ✅ Removed `user_id` column from categories table
- ✅ Added `display_order` INTEGER column for custom sorting
- ✅ Updated RLS policies to allow global read access
- ✅ Added unique constraint on category `name`

### Application Code
- ✅ Updated `Category` interface to include `displayOrder`
- ✅ Updated `listCategories()` to order by `display_order`
- ✅ Removed user authentication from category queries

---

## Step-by-Step Migration

### 1. Run the Migration SQL

Go to Supabase Dashboard → SQL Editor and run:
```bash
/Users/alessandro/Work/AI/SpecToDo/migration-make-categories-global.sql
```

Or copy/paste the entire file contents into the SQL Editor.

### 2. Regenerate TypeScript Types

After the migration succeeds, regenerate your types:

```bash
npx supabase gen types typescript --linked > lib/supabase/types.ts
```

Or with project ID:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
```

### 3. Remove the TypeScript Ignore Comment

Once types are regenerated, remove the `@ts-ignore` comment from:
- `lib/services/categories.ts` line 32

The code will then be fully type-safe!

---

## Migration Details

### What the Migration Does

1. **Drops RLS Policies** - Removes user-specific policies
2. **Consolidates Duplicates** - Keeps oldest category per name
3. **Updates Item References** - Points all items to canonical categories
4. **Removes user_id** - Drops the column and constraint
5. **Adds display_order** - Adds ordering column with initial values
6. **Creates Global Policies** - Allows all authenticated users to read
7. **Seeds Categories** - Adds default categories with order values

### Default Categories (in order)

1. Movies
2. Restaurants
3. Books
4. Places
5. Music
6. Games
7. Travel
8. Shopping
9. Health
10. Other

---

## Verification

After migration, run this query to verify:

```sql
SELECT
  name,
  type,
  display_order,
  (SELECT COUNT(*) FROM items WHERE items.category_id = categories.id) as items_count
FROM categories
ORDER BY display_order ASC;
```

Expected output: 10 categories ordered by `display_order` with item counts.

---

## Rollback (If Needed)

⚠️ **Warning**: Rolling back will require restoring user-specific categories!

If you need to rollback:

1. Re-add `user_id` column
2. Re-create RLS policies
3. Restore user-category associations

This is complex, so **backup your database** before running the migration!

---

## Next Steps (Future Enhancements)

With the `display_order` column in place, you can now:

- Allow admins to reorder categories via UI
- Add drag-and-drop category ordering
- Create a categories management page
- Add more custom categories

The infrastructure is ready for these features! 🚀
