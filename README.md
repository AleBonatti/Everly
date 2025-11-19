# FutureList - Personal Wishlist App

A minimalist and delightful app to keep track of future activities—movies to watch, restaurants to try, places to visit, books to read. Blending the immediacy of a to-do list with the spirit of a wishlist.

## Features

- **Quick Capture**: Add items with title and category in under 10 seconds
- **AI-Powered Suggestions**: Get personalized content recommendations with images (movies, books, music, etc.)
- **Secure & Private**: Email/password authentication with row-level security
- **Smart Organization**: Default categories (Movies, Restaurants, Trips, Books) plus custom categories
- **Search & Filter**: Find items quickly with case-insensitive partial matching
- **Status Tracking**: Mark items as done/todo with visual distinction
- **Fully Responsive**: Optimized for mobile, tablet, and desktop (320px-2560px)
- **Cross-Device Sync**: Access your list from any device

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth
- **AI Integration**: OpenAI GPT-4o-mini (via Vercel AI SDK)
- **Image APIs**: TMDB (movies), IGDB (games), Spotify (music), Google Books (books)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Supabase account (free tier)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SpecToDo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Supabase**
   - Create a Supabase project at https://supabase.com
   - Copy your project URL and anon key
   - Apply the database schema from `specs/001-future-list-app/contracts/supabase.sql`
   - Run migrations in order:
     ```bash
     # Apply migrations from the migrations/ directory
     migrations/004_add_category_content_type.sql
     ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

   # AI Features (optional but recommended)
   OPENAI_API_KEY=your-openai-api-key-here
   TMDB_API_KEY=your-tmdb-api-key-here
   IGDB_CLIENT_ID=your-twitch-client-id-here
   IGDB_CLIENT_SECRET=your-twitch-client-secret-here
   SPOTIFY_CLIENT_ID=your-spotify-client-id-here
   SPOTIFY_CLIENT_SECRET=your-spotify-client-secret-here
   GOOGLE_BOOKS_API_KEY=your-google-books-api-key-here  # Optional: works without key (1000 req/day)
   ```

   **API Key Setup:**
   - OpenAI: Get your API key from https://platform.openai.com/api-keys
   - TMDB: Get your API key from https://www.themoviedb.org/settings/api
   - IGDB: Register your app at https://dev.twitch.tv/console/apps (requires Twitch account)
   - Spotify: Register your app at https://developer.spotify.com/dashboard
   - Google Books: Optional, works without key. For higher limits: https://console.cloud.google.com/apis/credentials

5. **Generate TypeScript types from Supabase**
   ```bash
   pnpm supabase gen types typescript --project-id <your-project-id> > lib/supabase/types.ts
   ```

6. **Set up AI content types (optional)**
   - Login as admin user
   - Navigate to Admin > Categories
   - For each category, set the appropriate content type:
     - Cinema/Movies → `cinema`
     - Music/Albums → `music`
     - Books → `book`
     - Restaurants → `food`
     - Travel/Places → `place`
     - Games/Video Games → `game`
     - Default → `generic`

7. **Start development server**
   ```bash
   pnpm dev
   ```

8. **Open in browser**
   Navigate to http://localhost:3000

### Development Workflow

- **Dev server**: `pnpm dev` (with Turbopack for fast refresh)
- **Build**: `pnpm build` (verify production build)
- **Start production**: `pnpm start`
- **Lint**: `pnpm lint`
- **Format**: `pnpm format`

### Manual Testing

Per project constitution, all testing is manual. Test scenarios are documented in `specs/001-future-list-app/quickstart.md` (lines 222-271).

Key testing checklist:
- ✓ Create account, login, logout
- ✓ Add item with title + category (<10 seconds)
- ✓ Mark items as done/todo
- ✓ Filter by category
- ✓ Search with partial matching
- ✓ Test on mobile (375px), tablet (768px), desktop (1280px)
- ✓ Verify touch targets ≥44px on mobile
- ✓ Test cross-device sync

## Project Structure

```
/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   ├── (app)/               # Protected app routes
│   └── layout.tsx           # Root layout
├── components/              # Reusable UI components
│   ├── ui/                  # Base components (Button, Input, etc.)
│   └── layout/              # Layout components (Header, Container)
├── features/                # Feature-specific logic
│   ├── auth/                # Authentication feature
│   └── todos/               # Todo/wishlist feature
├── lib/                     # Utilities and shared logic
│   ├── supabase/            # Supabase clients and types
│   ├── storage.ts           # LocalStorage utilities
│   └── utils.ts             # General utilities
├── public/                  # Static assets
└── specs/                   # SpecKit documentation
```

## Architecture

- **Feature-based organization**: Each feature (auth, todos) is self-contained
- **Server Components**: Default for data fetching and SEO
- **Client Components**: Only for interactivity (forms, modals, animations)
- **Server Actions**: For mutations (create, update, delete)
- **Row-Level Security**: Database-level authorization via Supabase RLS
- **LocalStorage caching**: Optimistic UI updates for perceived performance

## Constitution

This project follows 5 core principles (`.specify/memory/constitution.md`):

1. **Clean Code**: Readable, consistent, maintainable
2. **Simple & Intuitive UX**: Minimal friction, obvious actions
3. **Fully Responsive Design**: Mobile-first, 320px-2560px support
4. **Manual Testing Only**: No automated tests (manual QA only)
5. **Privacy Through Authentication**: Required auth, RLS enforcement

## Documentation

- **Specification**: `specs/001-future-list-app/spec.md` (what to build)
- **Plan**: `specs/001-future-list-app/plan.md` (how to build)
- **Tasks**: `specs/001-future-list-app/tasks.md` (implementation breakdown)
- **Data Model**: `specs/001-future-list-app/data-model.md` (database schema)
- **Quickstart**: `specs/001-future-list-app/quickstart.md` (dev setup guide)

## Deployment

Deploy to Vercel (recommended):

1. Push to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy (automatic on push to main)

## License

Private project - All rights reserved.

## Contributing

This is a personal project. For questions or suggestions, contact Alessandro Bonatti.
