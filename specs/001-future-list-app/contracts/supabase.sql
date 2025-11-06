-- ============================================================================
-- FutureList Database Schema
-- ============================================================================
-- Description: PostgreSQL schema for FutureList wishlist app
-- Database: Supabase (PostgreSQL 15+)
-- Date: 2025-11-06
-- Feature: 001-future-list-app
--
-- Tables:
--   - categories: User-defined categories (Movies, Restaurants, Trips, Books, custom)
--   - items: Wishlist items with optional enrichment fields
--
-- Security: Row-Level Security (RLS) enabled on all tables
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable trigram indexing for partial text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Category types: default (built-in) or custom (user-created)
CREATE TYPE category_type AS ENUM ('default', 'custom');

-- Item status: todo (not yet done) or done (completed)
CREATE TYPE item_status AS ENUM ('todo', 'done');

-- Item priority: low, medium (default), or high
CREATE TYPE item_priority AS ENUM ('low', 'medium', 'high');

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: categories
-- ----------------------------------------------------------------------------
-- Description: User-defined categories for organizing items
-- Includes 4 default categories (Movies, Restaurants, Trips, Books)
-- Users can create unlimited custom categories with unique names
-- ----------------------------------------------------------------------------

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(name) >= 1 AND length(name) <= 50),
  type category_type NOT NULL DEFAULT 'custom',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Unique category names per user (case-insensitive)
CREATE UNIQUE INDEX idx_categories_name_user ON categories(user_id, LOWER(name));

-- Index for user-level queries
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Index for type filtering (if needed)
CREATE INDEX idx_categories_type ON categories(type);

-- ----------------------------------------------------------------------------
-- Table: items
-- ----------------------------------------------------------------------------
-- Description: User's wishlist items with optional enrichment fields
-- Required fields: title, category
-- Optional fields: description, url, location, note, priority, target_date
-- Status: todo (default) or done
-- ----------------------------------------------------------------------------

CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
  description text CHECK (description IS NULL OR length(description) <= 1000),
  status item_status NOT NULL DEFAULT 'todo',
  priority item_priority DEFAULT 'medium',
  url text,
  location text,
  note text,
  target_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Primary indexes for filtering and sorting
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_priority ON items(priority);

-- Composite index for combined filters (user + category + status)
-- Optimizes queries like: "Show me my todo items in Restaurants category"
CREATE INDEX idx_items_combined ON items(user_id, category_id, status);

-- Sorting index (newest first by default)
CREATE INDEX idx_items_created_at ON items(created_at DESC);

-- Full-text search indexes (case-insensitive, partial matching)
-- Trigram indexes enable partial matching: "sush" matches "Sushi Restaurant"
CREATE INDEX idx_items_title_trgm ON items USING gin(title gin_trgm_ops);
CREATE INDEX idx_items_description_trgm ON items USING gin(description gin_trgm_ops);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Trigger: Auto-update updated_at timestamp
-- ----------------------------------------------------------------------------
-- Description: Automatically update updated_at column on row updates
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Trigger: Create default categories on user signup
-- ----------------------------------------------------------------------------
-- Description: Automatically create 4 default categories for new users
-- Categories: Movies, Restaurants, Trips, Books
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name, type) VALUES
    (NEW.id, 'Movies', 'default'),
    (NEW.id, 'Restaurants', 'default'),
    (NEW.id, 'Trips', 'default'),
    (NEW.id, 'Books', 'default');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================================
-- Description: Ensure users can only access their own data
-- All queries are automatically filtered by user_id
-- ============================================================================

-- ----------------------------------------------------------------------------
-- RLS: categories table
-- ----------------------------------------------------------------------------

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Users can view their own categories
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own categories
CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own custom categories (not default categories)
CREATE POLICY "Users can update own custom categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id AND type = 'custom')
  WITH CHECK (auth.uid() = user_id AND type = 'custom');

-- Users can delete their own empty custom categories
-- Prevents deletion if category has items (ON DELETE RESTRICT on foreign key)
CREATE POLICY "Users can delete own empty custom categories"
  ON categories FOR DELETE
  USING (
    auth.uid() = user_id
    AND type = 'custom'
    AND NOT EXISTS (SELECT 1 FROM items WHERE items.category_id = categories.id)
  );

-- ----------------------------------------------------------------------------
-- RLS: items table
-- ----------------------------------------------------------------------------

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Users can view their own items
CREATE POLICY "Users can view own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own items
CREATE POLICY "Users can insert own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own items
CREATE POLICY "Users can update own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own items
CREATE POLICY "Users can delete own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS (OPTIONAL)
-- ============================================================================
-- Description: Utility functions for common queries
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: Search items by keyword (case-insensitive, partial matching)
-- ----------------------------------------------------------------------------
-- Description: Search items by title or description using trigram similarity
-- Parameters:
--   - search_query: keyword to search for
--   - user_uuid: user ID (for RLS)
-- Returns: items matching the search query
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION search_items(
  search_query text,
  user_uuid uuid
)
RETURNS SETOF items AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM items
  WHERE user_id = user_uuid
    AND (
      title ILIKE '%' || search_query || '%'
      OR description ILIKE '%' || search_query || '%'
    )
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Function: Get items with category details (JOIN helper)
-- ----------------------------------------------------------------------------
-- Description: Returns items with their category information
-- Parameters:
--   - user_uuid: user ID (for RLS)
-- Returns: items with category name and type
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_items_with_categories(
  user_uuid uuid
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  category_id uuid,
  category_name text,
  category_type category_type,
  title text,
  description text,
  status item_status,
  priority item_priority,
  url text,
  location text,
  note text,
  target_date date,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.user_id,
    i.category_id,
    c.name AS category_name,
    c.type AS category_type,
    i.title,
    i.description,
    i.status,
    i.priority,
    i.url,
    i.location,
    i.note,
    i.target_date,
    i.created_at,
    i.updated_at
  FROM items i
  JOIN categories c ON i.category_id = c.id
  WHERE i.user_id = user_uuid
  ORDER BY i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SAMPLE QUERIES (FOR REFERENCE)
-- ============================================================================
-- Description: Common query patterns for the application
-- ============================================================================

-- Get all user's items with categories (newest first)
-- SELECT * FROM get_items_with_categories(auth.uid());

-- Get items filtered by category
-- SELECT * FROM items WHERE user_id = auth.uid() AND category_id = 'category-uuid' ORDER BY created_at DESC;

-- Get items filtered by status
-- SELECT * FROM items WHERE user_id = auth.uid() AND status = 'todo' ORDER BY created_at DESC;

-- Get items with combined filters (category + status)
-- SELECT * FROM items WHERE user_id = auth.uid() AND category_id = 'category-uuid' AND status = 'todo' ORDER BY created_at DESC;

-- Search items by keyword
-- SELECT * FROM search_items('sushi', auth.uid());

-- Or using manual ILIKE (equivalent to search_items function)
-- SELECT * FROM items WHERE user_id = auth.uid() AND (title ILIKE '%sushi%' OR description ILIKE '%sushi%') ORDER BY created_at DESC;

-- Get all categories for a user
-- SELECT * FROM categories WHERE user_id = auth.uid() ORDER BY type DESC, name ASC;

-- Get category with item count
-- SELECT c.id, c.name, c.type, COUNT(i.id) AS item_count
-- FROM categories c
-- LEFT JOIN items i ON c.id = i.category_id
-- WHERE c.user_id = auth.uid()
-- GROUP BY c.id
-- ORDER BY c.type DESC, c.name ASC;

-- Toggle item status
-- UPDATE items SET status = CASE WHEN status = 'todo' THEN 'done' ELSE 'todo' END WHERE id = 'item-uuid' AND user_id = auth.uid();

-- Mark item as done
-- UPDATE items SET status = 'done' WHERE id = 'item-uuid' AND user_id = auth.uid();

-- Create custom category
-- INSERT INTO categories (user_id, name, type) VALUES (auth.uid(), 'Podcasts', 'custom');

-- Delete empty custom category
-- DELETE FROM categories WHERE id = 'category-uuid' AND user_id = auth.uid() AND type = 'custom';
-- (Will fail if category has items due to RLS policy)

-- ============================================================================
-- PERFORMANCE NOTES
-- ============================================================================
-- - Indexes are optimized for common query patterns (filter by user, category, status)
-- - Trigram indexes enable fast partial matching search
-- - Composite index (user_id, category_id, status) optimizes combined filters
-- - RLS policies automatically filter queries by user_id for security
-- - Use LIMIT and OFFSET for pagination on large datasets
-- - Monitor query performance in Supabase dashboard (Query Performance tab)
-- ============================================================================

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
-- To apply this schema to Supabase:
--
-- 1. Local Development:
--    - Run `supabase db reset` to apply schema locally
--    - Generate TypeScript types: `supabase gen types typescript --local > lib/supabase/types.ts`
--
-- 2. Production:
--    - Apply via Supabase Dashboard: SQL Editor → paste schema → Run
--    - Or use Supabase CLI: `supabase db push`
--    - Generate TypeScript types: `supabase gen types typescript --project-id <id> > lib/supabase/types.ts`
--
-- 3. Verify:
--    - Check tables created: Supabase Dashboard → Table Editor
--    - Test RLS policies: Try querying as different users
--    - Verify triggers work: Create a test user, check default categories created
-- ============================================================================
