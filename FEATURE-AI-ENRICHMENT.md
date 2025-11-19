# AI Item Enrichment Feature

## Overview

This feature adds AI-powered enrichment capabilities to items, automatically fetching additional metadata and images based on the item's title, category, and location.

## Branch

`feature/ai-item-enrichment`

## Features

### 1. **Automatic Metadata Extraction**
- Fetches year, creator, genre, rating, and duration information
- Context-aware based on item category (movies, books, places, etc.)
- Uses OpenAI GPT-4-mini for intelligent data extraction

### 2. **Image Fetching**
- Retrieves high-quality images using content-type-specific tools:
  - **Movies**: TMDB API
  - **Music**: Spotify API
  - **Games**: IGDB API
  - **Books**: Google Books API
  - **Places/Travel/Restaurants**: Google Places API (location-aware)
  - **Generic**: Unsplash API
- Displays images in both list view (thumbnail) and detail view (full-size)
- Fallback to placeholder images when no image is found

### 3. **User Interface**
- **"Enrich with AI" button** in item detail panel
- Loading states with spinner animation
- Success confirmation with checkmark
- Error handling with user-friendly messages
- Metadata display in organized grid layout
- Responsive image thumbnails in list items

## Database Changes

### New Fields in `items` Table

```sql
-- Migration: 004_add_item_enrichment_fields.sql

ALTER TABLE items ADD COLUMN image_url TEXT;
ALTER TABLE items ADD COLUMN metadata TEXT; -- JSON string
```

### Metadata Structure

```typescript
interface ItemMetadata {
  year?: string;
  creator?: string;
  genre?: string;
  rating?: string;
  duration?: string;
  [key: string]: string | undefined; // Extensible
}
```

## API Endpoints

### POST `/api/ai/enrich`

Enriches an item with AI-generated metadata and fetches an image.

**Request Body:**
```json
{
  "title": "Inception",
  "categoryId": "uuid",
  "location": "optional"
}
```

**Response:**
```json
{
  "metadata": {
    "year": "2010",
    "creator": "Christopher Nolan",
    "genre": "Sci-Fi, Thriller",
    "rating": "8.8/10",
    "duration": "2h 28m"
  },
  "imageUrl": "https://image.tmdb.org/..."
}
```

## Components

### 1. **AIEnrichment Component**
Location: `components/features/AIEnrichment.tsx`

A standalone component that handles the enrichment process:
- Calls `/api/ai/enrich` endpoint
- Updates item via `/api/items/:id` PATCH request
- Manages loading, error, and success states
- Provides callback for parent component to refresh data

**Props:**
```typescript
interface AIEnrichmentProps {
  itemId: string;
  title: string;
  categoryId?: string;
  location?: string;
  onEnriched: (data: { imageUrl?: string; metadata?: ItemMetadata }) => void;
}
```

### 2. **ItemDetailPanel Updates**
Location: `components/ui/ItemDetailPanel.tsx`

Added:
- Image display section (when `imageUrl` is present)
- Metadata display section with grid layout
- AIEnrichment button integration
- `onRefresh` callback prop for data updates

### 3. **ListItem Updates**
Location: `components/ui/ListItem.tsx`

Added:
- `imageUrl` prop
- 24x24px thumbnail display
- Flexbox layout to accommodate image + content
- Lazy loading for images

## How to Use

### Manual Enrichment

1. Open an item in the detail panel
2. Click the **"Enrich with AI"** button
3. Wait for the enrichment process to complete
4. View the enriched metadata and image

### Programmatic Enrichment

You can also call the enrichment API directly from your code:

```typescript
const response = await fetch('/api/ai/enrich', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: itemTitle,
    categoryId: itemCategoryId,
    location: itemLocation,
  }),
});

const { metadata, imageUrl } = await response.json();

// Update the item
await fetch(`/api/items/${itemId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageUrl,
    metadata: JSON.stringify(metadata),
  }),
});
```

### Auto-Enrichment on Creation (Optional)

To automatically enrich items when they're created, you can add a call to the enrichment API in the item creation flow:

```typescript
// After creating an item
const newItem = await createItem(itemData);

// Optionally enrich it
fetch('/api/ai/enrich', {
  method: 'POST',
  body: JSON.stringify({
    title: newItem.title,
    categoryId: newItem.categoryId,
    location: newItem.location,
  }),
}).then(async (res) => {
  const { metadata, imageUrl } = await res.json();

  // Update the item with enriched data
  await updateItem(newItem.id, {
    imageUrl,
    metadata: JSON.stringify(metadata),
  });
});
```

## Configuration

No additional configuration is required. The feature uses the existing API keys:
- `OPENAI_API_KEY` - for metadata extraction
- Image tool API keys (TMDB, Spotify, Google Places, Unsplash, etc.)

## Migration Steps

1. **Apply the database migration:**
   ```bash
   # Using Supabase CLI
   supabase db push

   # Or manually run the SQL in migrations/004_add_item_enrichment_fields.sql
   ```

2. **Deploy the changes:**
   ```bash
   git checkout feature/ai-item-enrichment
   npm run build
   npm run deploy
   ```

3. **Test the feature:**
   - Create or open an existing item
   - Click "Enrich with AI"
   - Verify metadata and image are displayed

## Error Handling

The feature includes comprehensive error handling:
- API errors are displayed to the user with helpful messages
- Failed image fetches fallback to placeholders
- Malformed metadata is gracefully ignored
- Rate limit errors are logged and reported

## Performance Considerations

- Images use lazy loading (`loading="lazy"`)
- Thumbnail images are sized appropriately (96x96px in list view)
- Metadata is cached in the database
- Enrichment is opt-in (manual button click)

## Future Enhancements

Potential improvements for future iterations:
1. **Batch enrichment** - Enrich multiple items at once
2. **Auto-enrichment toggle** - Optional setting to enrich on creation
3. **Re-enrichment** - Update enriched data if source changes
4. **Custom metadata fields** - Allow users to add custom fields
5. **Image gallery** - Support multiple images per item
6. **Metadata editing** - Allow manual correction of AI-generated data

## Testing

To test the feature:

1. **Create a test item** for each content type:
   - Movie: "Inception"
   - Book: "The Great Gatsby"
   - Place: "Eiffel Tower, Paris"
   - Restaurant: "Le Jules Verne, Paris"
   - Generic: "Running shoes"

2. **Verify enrichment** produces appropriate metadata and images

3. **Test error cases**:
   - Invalid titles
   - Missing API keys
   - Network errors

## Files Changed

```
app/api/ai/enrich/route.ts                 (new)
components/features/AIEnrichment.tsx       (new)
components/ui/ItemDetailPanel.tsx          (modified)
components/ui/ListItem.tsx                 (modified)
lib/db/schema.ts                           (modified)
lib/services/items.ts                      (modified)
migrations/004_add_item_enrichment_fields.sql (new)
```

## Commit

```
feat: Add AI-powered item enrichment with images and metadata

Implements comprehensive AI enrichment feature that fetches additional
metadata and images for items using OpenAI and specialized image tools.
```

---

**Created:** 2025-11-19
**Branch:** `feature/ai-item-enrichment`
**Status:** ✅ Ready for review
