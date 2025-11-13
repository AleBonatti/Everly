-- ============================================================================
-- Migration: Add Icons to Categories
-- ============================================================================
-- This script:
-- 1. Adds icon column to categories table
-- 2. Sets default icons for existing categories
-- ============================================================================

-- Step 1: Add icon column (nullable to allow for backward compatibility)
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS icon TEXT;

-- Step 2: Set default icons for existing categories
UPDATE categories SET icon = 'Film' WHERE name = 'Movies' AND icon IS NULL;
UPDATE categories SET icon = 'Utensils' WHERE name = 'Restaurants' AND icon IS NULL;
UPDATE categories SET icon = 'Book' WHERE name = 'Books' AND icon IS NULL;
UPDATE categories SET icon = 'MapPin' WHERE name = 'Places' AND icon IS NULL;
UPDATE categories SET icon = 'Music' WHERE name = 'Music' AND icon IS NULL;
UPDATE categories SET icon = 'Gamepad2' WHERE name = 'Games' AND icon IS NULL;
UPDATE categories SET icon = 'Plane' WHERE name = 'Travel' AND icon IS NULL;
UPDATE categories SET icon = 'ShoppingBag' WHERE name = 'Shopping' AND icon IS NULL;
UPDATE categories SET icon = 'Heart' WHERE name = 'Health' AND icon IS NULL;
UPDATE categories SET icon = 'Package' WHERE name = 'Other' AND icon IS NULL;

-- Step 3: Verify the results
SELECT
  name,
  icon,
  type,
  display_order
FROM categories
ORDER BY display_order ASC;
