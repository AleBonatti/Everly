-- Migration: Add AI enrichment fields to items table
-- Description: Adds image_url and metadata fields for AI-powered item enrichment
-- Date: 2025-11-19

-- Add image_url field for storing item images
ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add metadata field for storing AI-enriched data as JSON
ALTER TABLE items ADD COLUMN IF NOT EXISTS metadata TEXT;

-- Add comment to metadata column explaining its purpose
COMMENT ON COLUMN items.metadata IS 'JSON string containing AI-enriched data such as year, creator, genre, etc.';
COMMENT ON COLUMN items.image_url IS 'URL of the item image fetched via AI-powered image search';
