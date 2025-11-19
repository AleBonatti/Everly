# AI Enrichment Feature - Bug Fixes

## Issues Fixed

### 1. **Data Not Persisting to Database** ✅

**Problem:** Enriched data (imageUrl and metadata) was being fetched by the API but not saved to the database.

**Root Cause:** The PATCH and POST endpoints for `/api/items` didn't include the new `imageUrl` and `metadata` fields in their update/insert logic.

**Solution:**
- Added `imageUrl` and `metadata` to the PATCH endpoint destructuring and updateData object
- Added `imageUrl` and `metadata` to the POST endpoint destructuring and values object
- Both endpoints now properly persist enrichment data

**Files Modified:**
- `app/api/items/[id]/route.ts` - PATCH endpoint
- `app/api/items/route.ts` - POST endpoint

**Commit:** `fix: Add imageUrl and metadata fields to items API endpoints`

---

### 2. **Images Always Showing as Placeholders** ✅

**Problem:** The enrichment API was returning placeholder images instead of actual images from the various API sources (TMDB, Spotify, Google Places, Unsplash, etc.).

**Root Cause:** The `imageToolRegistry` in the enrich endpoint was empty because the tools were never registered. The tool registration code only existed in the suggestions endpoint.

**Solution:**
- Created a shared `lib/ai/register-tools.ts` module that registers all image tools once
- Updated both `/api/ai/enrich` and `/api/ai/suggestions` to import this module
- Tools are now auto-initialized on first import (singleton pattern)

**Files Created:**
- `lib/ai/register-tools.ts` - Centralized tool registration

**Files Modified:**
- `app/api/ai/enrich/route.ts` - Import shared registration
- `app/api/ai/suggestions/route.ts` - Use shared registration

**Commit:** `fix: Initialize image tool registry in enrichment endpoint`

---

## Testing Checklist

To verify the fixes work correctly:

- [ ] **Test 1: Database Persistence**
  1. Open any item in detail view
  2. Click "Enrich with AI"
  3. Wait for enrichment to complete
  4. Refresh the page
  5. ✅ Verify image and metadata are still present (persisted)

- [ ] **Test 2: Image Fetching - Movies**
  1. Create item: "Inception" in Cinema category
  2. Enrich the item
  3. ✅ Verify it shows actual TMDB movie poster (not placeholder)

- [ ] **Test 3: Image Fetching - Books**
  1. Create item: "The Great Gatsby" in Books category
  2. Enrich the item
  3. ✅ Verify it shows actual Google Books cover (not placeholder)

- [ ] **Test 4: Image Fetching - Places**
  1. Create item: "Eiffel Tower" with location "Paris" in Places category
  2. Enrich the item
  3. ✅ Verify it shows actual Google Places photo (not placeholder)

- [ ] **Test 5: Image Fetching - Generic**
  1. Create item: "Running shoes" in any generic category
  2. Enrich the item
  3. ✅ Verify it shows actual Unsplash photo (not placeholder)

- [ ] **Test 6: Metadata Extraction**
  1. Create item: "Pulp Fiction" in Cinema category
  2. Enrich the item
  3. ✅ Verify metadata shows: Year (1994), Creator (Quentin Tarantino), Genre, Rating, Duration

- [ ] **Test 7: List View Thumbnails**
  1. After enriching items, go back to list view
  2. ✅ Verify thumbnail images (96x96px) appear next to enriched items

---

## API Flow Verification

**Enrichment Flow:**
```
1. User clicks "Enrich with AI" button
   ↓
2. POST /api/ai/enrich
   - Extracts metadata using OpenAI
   - Fetches image using imageToolRegistry
   - Returns { metadata, imageUrl }
   ↓
3. PATCH /api/items/[id]
   - Updates item with imageUrl and metadata
   - Persists to database
   ↓
4. UI refreshes to show enriched data
```

**Key Points:**
- Tool registry must be initialized before calling `imageToolRegistry.getImage()`
- Metadata is stored as JSON string
- Image URLs are stored as plain text
- Both fields are nullable (optional)

---

## Migration Status

**Required Migration:** `migrations/005_add_item_enrichment_fields.sql`

```sql
ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS metadata TEXT;
```

**To Apply:**
```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard SQL Editor
# Paste the contents of migrations/005_add_item_enrichment_fields.sql
```

---

## Debugging Tips

If enrichment still isn't working:

1. **Check API Keys:**
   ```bash
   # .env.local should have:
   OPENAI_API_KEY=...
   TMDB_API_KEY=...
   SPOTIFY_CLIENT_ID=...
   SPOTIFY_CLIENT_SECRET=...
   GOOGLE_PLACES_API_KEY=...
   UNSPLASH_ACCESS_KEY=...
   ```

2. **Check Browser Console:**
   - Look for fetch errors
   - Verify API responses contain imageUrl and metadata

3. **Check Server Logs:**
   ```bash
   npm run dev
   # Look for:
   # - "Failed to fetch image" errors
   # - Tool registration messages
   # - Database update errors
   ```

4. **Check Database:**
   ```sql
   SELECT id, title, image_url, metadata
   FROM items
   WHERE image_url IS NOT NULL;
   ```

5. **Test Individual Tools:**
   ```typescript
   // In a test file
   import { registerImageTools } from '@/lib/ai/register-tools';
   import { imageToolRegistry } from '@/lib/ai/image-tools';

   registerImageTools();

   const url = await imageToolRegistry.getImage(
     'cinema',
     'Inception',
     '2010'
   );

   console.log('Image URL:', url);
   ```

---

## Known Limitations

1. **Rate Limits:** Free tier API limits may cause failures:
   - TMDB: 40 requests per 10 seconds
   - Spotify: Varies by endpoint
   - Google Places: Requires billing (includes $200 free credit)
   - Unsplash: 50 requests/hour (Demo), 5000/hour (Production)

2. **Placeholder Fallback:** If all tools fail, placeholder images are returned

3. **Metadata Quality:** AI-generated metadata accuracy depends on:
   - Item title clarity
   - OpenAI API availability
   - Content type specificity

---

## Commits Summary

1. ✅ `feat: Add AI-powered item enrichment with images and metadata`
   - Initial implementation of enrichment feature

2. ✅ `fix: Add imageUrl and metadata fields to items API endpoints`
   - Fixed data persistence issue

3. ✅ `fix: Initialize image tool registry in enrichment endpoint`
   - Fixed placeholder image issue

**Branch:** `feature/ai-item-enrichment`
**Status:** 🟢 All known issues resolved
**Ready for:** Testing and merge

---

## Next Steps

1. Run the database migration
2. Test all scenarios from the checklist
3. Deploy to staging/production
4. Monitor for any edge cases or errors
5. Consider adding:
   - Retry logic for failed enrichments
   - Batch enrichment for multiple items
   - User preference for auto-enrichment on creation

