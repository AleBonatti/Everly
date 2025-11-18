---
title: BucketBits Image Fetching Architecture
slug: bucketbits-image-fetching-architecture-tools
type: spec
status: draft
owner: Alessandro
createdAt: 2025-11-18
updatedAt: 2025-11-18
tags:
  - bucketbits
  - ai-sdk
  - nextjs
  - image-fetching
  - tools
stack:
  - Next.js
  - Node.js
  - Vercel AI SDK
  - Supabase
  - TMDB
---

# BucketBits — Image Fetching Architecture (Tool-Based)

## 1. Context

BucketBits is an application where users save small activities or wishes (“bits”), such as:

- watching a specific movie,
- listening to an album,
- visiting a place,
- reading a book.

The AI currently suggests related items based on a saved bit and attempts to return both **textual suggestions** and **image URLs** (e.g. posters, album covers, etc.).  
However, URLs generated directly by the model are often unreliable and may return `404` or other errors.

This spec defines a **tool-based architecture** to obtain **reliable images from external providers**.

## 2. Problem Statement

- The AI model invents image URLs or returns stale links.
- The UI may render broken images (404 / non-200 responses).
- There is no systematic mapping between a **category type** and the **external API** used for that type.

We want a robust, extensible system that:

- avoids URL hallucination,
- uses well-known APIs (TMDB, etc.) for fetching media,
- can be extended with new providers via tools.

## 3. Goals

- Add a **category type** to drive which image search tool is used.
- Introduce **AI tools** (Vercel AI SDK) responsible for fetching images from external APIs.
- Make the **AI choose the appropriate tool** based on the category type.
- Enrich base search results with structured metadata (e.g. year, creator, searchQuery).
- Only call external APIs when `searchQuery` is valid.
- Validate external image URLs before returning them to the client.
- Implement the **movie-specific tool** (`searchMovieTool`) as the first concrete tool.

## 4. Non-Goals

- Implement tools for all media types (music, places, generic) in this phase.
- Redesign the entire suggestion logic or UI.
- Introduce complex caching layers (can be considered later).

## 5. Domain Concepts

### 5.1 Bit

A user-saved entity, e.g. “watch Pulp Fiction”, “visit Tokyo”, “listen to OK Computer”.  
Bits belong to a **category**.

### 5.2 Category

Represents a classification for bits (e.g. Movies, Music, Places).

New field:

- `type` (text):
  - Defines the **search type** used by the AI and tools.
  - Examples: `cinema`, `music`, `place`, `generic`, `book`, etc.

The `type` field MUST be editable in the **Category Edit Form**.

### 5.3 Suggestion

An AI-generated related item based on a bit.  
Suggestions will be enriched with:

- media metadata (title, year, creator),
- search metadata (`searchQuery`),
- validated `imageUrl` (or a placeholder).

## 6. High-Level Architecture

1. User saves or opens a bit.
2. Frontend calls `POST /api/suggestions` with the bit text and category type.
3. Backend (Next.js route handler) calls the AI model via Vercel AI SDK.
4. Model:
   - generates a list of suggestions,
   - based on `type` decides which **tool** to call (e.g. `searchMovieTool` for `cinema`),
   - calls the tool with `searchQuery` (and optional metadata like `year`).
5. Tool calls the external API (e.g. TMDB) and returns metadata + candidate `imageUrl`.
6. Backend validates the URL (check HTTP status).
7. Backend returns enriched suggestions to the frontend:
   - if URL valid → use it,
   - if invalid / missing → use placeholder image.

## 7. Data Model Changes

### 7.1 Category Table

Add new column:

- `type`: `text`
  - Example values:
    - `"cinema"` → indicates movie / film content.
    - `"music"` → albums / tracks / artists.
    - `"place"` → locations (cities, restaurants, etc.).
    - `"generic"` → fallback / default type.
  - The list is open-ended for future extensions.

### 7.2 Suggestion Object Shape

Base suggestion object (as expected from the AI final JSON):

```ts
type BucketBitsSuggestion = {
  title: string;
  type: "cinema" | "music" | "place" | "generic" | string;
  description: string | null;
  year?: number | null;
  creator?: string | null;
  searchQuery: string | null;
  imageUrl: string | null; // filled by tools or placeholder
  source: "ai-only" | "tmdb" | "music-api" | "place-api" | "generic-api";
};
```

Notes:

- `type` usually mirrors the category type, but can be refined by the AI if needed.
- `searchQuery` is **required** to call a specific tool; if empty/invalid, skip external API calls.
- `imageUrl` is set only after a successful tool call + URL validation, otherwise `null` or placeholder.
- `source` tracks where the image comes from.

## 8. AI Tooling Design

### 8.1 Planned Tools

- `searchMovieTool` → TMDB (The Movie Database)
- `searchMusicTool` → music provider (e.g. Spotify / iTunes) — **future**
- `searchPlaceTool` → place provider (e.g. Google Places / Yelp) — **future**
- `searchGenericTool` → generic provider (e.g. Unsplash) — **future**

Each tool MUST:

- Accept a structured input (e.g. `{ query, year }`).
- Call a specific external API.
- Return an object containing:
  - `found` (boolean),
  - standardized metadata (title, year, overview/description),
  - `imageUrl` (or `null`).

### 8.2 Tool Selection Logic (AI Side)

Based on the `type` field:

- `type = "cinema"` → `searchMovieTool`
- `type = "music"` → `searchMusicTool` (later)
- `type = "place"` → `searchPlaceTool` (later)
- anything else → `searchGenericTool` (later, optional)

The selection is handled in the **system prompt** and examples for the AI, not in static backend logic.  
The backend passes `type` to the model, and the model decides which tool to invoke.

## 9. `searchMovieTool` Specification

### 9.1 Purpose

Given a movie-related `searchQuery` (and optional `year`), fetch data from TMDB and return a validated poster image URL and basic metadata.

### 9.2 Input

```ts
type SearchMovieToolInput = {
  query: string; // e.g. "Pulp Fiction 1994 movie Quentin Tarantino"
  year?: number;
};
```

### 9.3 Output

```ts
type SearchMovieToolOutput = {
  found: boolean;
  id?: number;
  title: string;
  year: number | null;
  overview: string | null;
  imageUrl: string | null;
};
```

### 9.4 Behavior

1. Build a TMDB Search API URL using `query` and `year` (if provided).
2. Call TMDB with the configured `TMDB_API_KEY`.
3. Take the first result (or best match).
4. Extract:
   - `title`,
   - `release_date` → convert to year (number),
   - `overview`,
   - `poster_path` → convert to `imageUrl` using TMDB image base path.
5. If there is no result:
   - return `found = false`,
   - `imageUrl = null`.

### 9.5 URL Validation

Before returning the final `imageUrl`:

1. Perform a `HEAD` or lightweight `GET` request to the URL.
2. If status is `200` → URL is valid.
3. If status is `404` or any non-2xx:
   - treat as not found,
   - set `imageUrl = null`,
   - the calling code will use a placeholder.

## 10. Backend Route Behavior

### 10.1 Endpoint

`POST /api/suggestions`

### 10.2 Input

```json
{
  "text": "watch Pulp Fiction",
  "categoryType": "cinema"
}
```

### 10.3 Flow

1. Validate request body.
2. Call `streamText` (Vercel AI SDK) with:
   - model (e.g. `gpt-4.1-mini`),
   - tools: `{ searchMovie: searchMovieTool }`,
   - system prompt explaining:
     - how to interpret `categoryType`,
     - how to construct `searchQuery`,
     - when to call `searchMovieTool`,
     - required JSON output format.
3. The AI:
   - generates suggestions,
   - for each `cinema` item with a valid `searchQuery`, calls `searchMovieTool`,
   - receives tool results and composes the final JSON.
4. Backend collects the final text output from the AI and parses it as JSON.
5. Backend returns JSON to client:

```json
{
  "suggestions": [ /* BucketBitsSuggestion[] */ ]
}
```

If JSON parsing fails, return a 500 error with `raw` content for debugging.

## 11. Handling `searchQuery`

Rules:

- If `searchQuery` is **empty**, `null`, or obviously invalid:
  - Do **not** call any external tools.
  - Mark `imageUrl = null`, `source = "ai-only"`.
- Only when `searchQuery` is a usable string, the AI/tool chain proceeds with tool invocation.

This reduces unnecessary API calls and improves robustness.

## 12. Frontend Behavior

- The UI consumes `BucketBitsSuggestion[]` from `/api/suggestions`.
- It displays:
  - title,
  - type,
  - year,
  - creator,
  - description,
  - image (if available).

Image rendering rule:

- If `imageUrl` is present → use it in `<img>`.
- If `imageUrl` is `null` → show a **placeholder asset** (e.g. `/images/placeholders/generic-item.png`).

Example (React):

```tsx
<img
  src={suggestion.imageUrl ?? "/images/placeholders/generic-item.png"}
  alt={suggestion.title}
  onError={(e) => {
    e.currentTarget.src = "/images/placeholders/generic-item.png";
  }}
/>
```

## 13. Acceptance Criteria

- [ ] Category table has a `type` column and it is editable in the Category Edit Form.
- [ ] `searchMovieTool` is implemented and wired to TMDB.
- [ ] AI can call `searchMovieTool` when `categoryType = "cinema"`.
- [ ] Suggestions returned from `/api/suggestions` include:
  - `title`, `type`, `description`, `year`, `creator`, `searchQuery`, `imageUrl`, `source`.
- [ ] No broken external images are visible in the UI (invalid URLs result in placeholders).
- [ ] When `searchQuery` is missing or invalid, no external API calls are made.
- [ ] The system is ready to add `searchMusicTool`, `searchPlaceTool`, and `searchGenericTool` in later iterations.

## 14. Future Work

- Implement `searchMusicTool` using a music provider (Spotify, iTunes, or similar).
- Implement `searchPlaceTool` for locations (Google Places, Yelp, etc.).
- Implement `searchGenericTool` for generic images (e.g. Unsplash).
- Add caching and rate limiting for external API calls.
- Extend the frontend to show the `source` (e.g. “Poster from TMDB”).
