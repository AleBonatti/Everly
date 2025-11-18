-- Add content_type column to categories table
-- This field defines the search type for AI image fetching (cinema, music, place, generic, etc.)

ALTER TABLE categories
ADD COLUMN content_type TEXT DEFAULT 'generic';

-- Add comment to document the column purpose
COMMENT ON COLUMN categories.content_type IS 'Defines the type of content for AI image search (cinema, music, place, generic, etc.)';
