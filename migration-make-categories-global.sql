-- ============================================================================
-- Migration: Make Categories Global (Remove user_id, Add display_order)
-- ============================================================================
-- This script:
-- 1. Drops RLS policies that depend on user_id
-- 2. Updates items to reference canonical categories
-- 3. Removes duplicate categories
-- 4. Drops foreign key constraint
-- 5. Drops user_id column
-- 6. Adds display_order column for custom ordering
-- 7. Creates new global RLS policies
-- 8. Adds unique constraint on name
-- 9. Seeds default categories if needed
--
-- IMPORTANT: After running this migration, regenerate TypeScript types:
-- npx supabase gen types typescript --linked > lib/supabase/types.ts
-- ============================================================================

-- Step 1: Drop existing RLS policies that depend on user_id
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own custom categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own empty custom categories" ON categories;

-- Step 2: Update all items to point to the canonical category (keeping the oldest one per name)
-- Using a CTE to identify which category to keep for each name
WITH canonical_categories AS (
  SELECT DISTINCT ON (name)
    id,
    name
  FROM categories
  ORDER BY name, created_at ASC  -- Keep the oldest category for each name
)
UPDATE items
SET category_id = cc.id
FROM canonical_categories cc
WHERE items.category_id IN (
  SELECT c.id
  FROM categories c
  WHERE c.name = cc.name
  AND c.id != cc.id
);

-- Step 3: Delete duplicate categories (keep only the oldest one of each name)
DELETE FROM categories
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id
  FROM categories
  ORDER BY name, created_at ASC
);

-- Step 4: Drop the foreign key constraint
ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_user_id_fkey;

-- Step 5: Drop the user_id column
ALTER TABLE categories
DROP COLUMN IF EXISTS user_id;

-- Step 5.5: Add order column for custom ordering
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set initial order based on alphabetical name
UPDATE categories
SET display_order = row_number
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name ASC) as row_number
  FROM categories
) AS numbered
WHERE categories.id = numbered.id;

-- Step 6: Create new global RLS policies (allow all authenticated users to read)
-- Enable RLS if not already enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read all categories
CREATE POLICY "Anyone can view all categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Optional: Only allow admins to insert/update/delete categories
-- For now, we'll make categories read-only for regular users
CREATE POLICY "Only service role can modify categories"
  ON categories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 7: Add unique constraint on category name
ALTER TABLE categories
ADD CONSTRAINT categories_name_unique UNIQUE (name);

-- Step 8: Seed default categories if the table is empty or missing standard ones
INSERT INTO categories (name, type, display_order, created_at, updated_at)
SELECT name, 'default', display_order, NOW(), NOW()
FROM (VALUES
  ('Movies', 1),
  ('Restaurants', 2),
  ('Books', 3),
  ('Places', 4),
  ('Music', 5),
  ('Games', 6),
  ('Travel', 7),
  ('Shopping', 8),
  ('Health', 9),
  ('Other', 10)
) AS v(name, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE categories.name = v.name
)
ON CONFLICT (name) DO NOTHING;

-- Step 9: Verify the results
SELECT
  name,
  type,
  display_order,
  COUNT(*) OVER() as total_categories,
  (SELECT COUNT(*) FROM items WHERE items.category_id = categories.id) as items_count
FROM categories
ORDER BY display_order ASC;
