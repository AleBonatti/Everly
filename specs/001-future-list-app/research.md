# Research: FutureList Technology Decisions

**Date**: 2025-11-06
**Feature**: 001-future-list-app
**Phase**: Phase 0 - Outline & Research

## Overview

This document consolidates research findings and technology decisions for FutureList. All "NEEDS CLARIFICATION" items from Technical Context have been resolved through analysis of requirements, best practices, and alignment with project constitution.

---

## Decision 1: Frontend Framework - Next.js 15

**Decision**: Use Next.js 15 with App Router + React 19 + TypeScript 5.x

**Rationale**:
- **App Router** provides modern React Server Components, reducing client bundle size
- **Built-in optimizations**: Automatic code splitting, image optimization, font optimization
- **Excellent DX**: Fast refresh, TypeScript support out of the box, great error messages
- **Vercel deployment**: Zero-config deployment with preview branches
- **SEO-ready**: Server-side rendering for auth pages improves initial load
- **Active ecosystem**: Large community, excellent documentation, frequent updates

**Alternatives Considered**:
- **Vite + React Router**: More manual setup, no built-in server components, requires separate backend
- **Create React App**: Deprecated, slow build times, less optimization
- **Remix**: Similar to Next.js but smaller ecosystem, newer, less mature

**Best Practices**:
- Use App Router (not Pages Router) for new projects
- Implement Server Components for data fetching
- Use Client Components only for interactivity
- Leverage Server Actions for mutations
- Follow Next.js 15 caching strategies (revalidate, cache tags)

**References**:
- Next.js 15 Docs: https://nextjs.org/docs
- App Router Migration: https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration

---

## Decision 2: Styling - Tailwind CSS 4

**Decision**: Use Tailwind CSS 4 for utility-first styling

**Rationale**:
- **Utility-first approach**: Rapid UI development with consistent design tokens
- **Mobile-first responsive**: Built-in breakpoints (sm, md, lg, xl, 2xl)
- **Tree-shaking**: Only includes used styles in production bundle
- **No CSS conflicts**: Scoped utilities prevent naming collisions
- **Dark mode ready**: Easy to add later if needed (class-based or media-based)
- **Great ecosystem**: Tailwind UI, Headless UI for accessible components

**Alternatives Considered**:
- **CSS Modules**: More boilerplate, manual responsive breakpoints
- **Styled-components**: Runtime overhead, CSS-in-JS performance cost
- **Vanilla CSS/SCSS**: More manual work, harder to maintain consistency

**Best Practices**:
- Define custom colors/spacing in `tailwind.config.ts`
- Use `@apply` sparingly (only for repeated patterns)
- Implement mobile-first responsive design (`sm:`, `md:`, `lg:` prefixes)
- Use Tailwind's arbitrary values for one-offs (`w-[247px]`)
- Extract common patterns into reusable components (Button, Input, Card)

**Configuration Example**:
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {...},
        accent: {...},
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
}
```

**References**:
- Tailwind CSS 4 Docs: https://tailwindcss.com/docs
- Responsive Design: https://tailwindcss.com/docs/responsive-design

---

## Decision 3: Backend Service - Supabase

**Decision**: Use Supabase for authentication, database, and real-time sync

**Rationale**:
- **All-in-one BaaS**: Auth + Postgres + Storage + Real-time in one service
- **Row-Level Security (RLS)**: Database-level authorization, users can only access their own data
- **Built-in Auth**: Email/password, magic links, OAuth providers (future)
- **Real-time subscriptions**: Automatic UI updates when data changes
- **Type-safe**: Generate TypeScript types from database schema
- **Free tier**: Generous limits for MVP (500MB database, 50k monthly active users)
- **Easy migration**: If needed, can self-host Supabase or migrate to raw Postgres

**Alternatives Considered**:
- **Firebase**: Less flexible database (NoSQL), proprietary lock-in, pricing scales poorly
- **Raw Postgres + Auth0**: More manual setup, separate auth service, higher complexity
- **Custom backend (Express/Fastify)**: Requires building auth, session management, hosting

**Best Practices**:
- Enable RLS on all tables with user data
- Use Supabase client-side SDK for browser auth state
- Use Supabase server-side SDK for server components and API routes
- Store secrets in environment variables (.env.local)
- Use database triggers for `updated_at` timestamps
- Index foreign keys and frequently queried columns

**Security Configuration**:
```sql
-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Users can only see their own items
CREATE POLICY "Users can view own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);
```

**References**:
- Supabase Docs: https://supabase.com/docs
- Row-Level Security: https://supabase.com/docs/guides/auth/row-level-security
- Next.js Integration: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs

---

## Decision 4: Icons - Lucide Icons

**Decision**: Use Lucide Icons for all UI icons

**Rationale**:
- **React components**: First-class React support with TypeScript types
- **Tree-shakeable**: Only bundle used icons
- **Consistent design**: Clean, modern icon set
- **Well-maintained**: Active development, 1000+ icons
- **Customizable**: Easy to adjust size, color, stroke width
- **Small bundle**: ~1KB per icon when tree-shaken

**Alternatives Considered**:
- **Heroicons**: Good alternative, smaller set (~290 icons)
- **React Icons**: Larger bundle, includes many icon sets (overkill)
- **Font Awesome**: Legacy font-based approach, larger bundle

**Best Practices**:
- Import only needed icons: `import { Plus, Search, Check } from 'lucide-react'`
- Use consistent sizing: `<Plus size={20} />` or `className="w-5 h-5"`
- Pass `aria-label` for screen reader accessibility
- Use semantic icon names in components

**Usage Example**:
```tsx
import { Plus } from 'lucide-react';

<button>
  <Plus size={20} aria-label="Add item" />
</button>
```

**References**:
- Lucide Icons: https://lucide.dev/
- React Usage: https://lucide.dev/guide/packages/lucide-react

---

## Decision 5: Animation - Framer Motion

**Decision**: Use Framer Motion for subtle UI transitions

**Rationale**:
- **Declarative API**: Intuitive animation syntax
- **Production-ready**: Used by major companies (Vercel, Stripe, Coinbase)
- **Performance**: Hardware-accelerated animations via CSS transforms
- **Gesture support**: Drag, tap, hover animations
- **Layout animations**: Automatic animations when elements change position
- **Small bundle**: ~30KB gzipped for core functionality

**Alternatives Considered**:
- **CSS transitions**: Less powerful, harder to orchestrate complex animations
- **React Spring**: More physics-based, steeper learning curve
- **GSAP**: Larger bundle, overkill for subtle transitions

**Best Practices**:
- Use `<motion.div>` for animated elements
- Keep animations subtle (200-300ms duration)
- Use `initial`, `animate`, `exit` props for enter/exit animations
- Wrap lists in `<AnimatePresence>` for exit animations
- Use `layout` prop for automatic layout animations

**Usage Example**:
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2 }}
>
  <TodoItem />
</motion.div>
```

**References**:
- Framer Motion Docs: https://www.framer.com/motion/
- Animation Examples: https://www.framer.com/motion/examples/

---

## Decision 6: Code Quality - ESLint + Prettier

**Decision**: Use ESLint for linting and Prettier for formatting

**Rationale**:
- **ESLint**: Catches bugs, enforces best practices, ensures consistency
- **Prettier**: Automatic code formatting, no bike-shedding on style
- **Next.js integration**: `eslint-config-next` includes React/Next.js rules
- **TypeScript support**: `@typescript-eslint` for TS-specific rules
- **CI-ready**: Can run in pre-commit hooks and CI pipelines

**Configuration**:
```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "no-console": "warn",
    "prefer-const": "error"
  }
}

// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 80
}
```

**Best Practices**:
- Run ESLint + Prettier in pre-commit hook (via Husky + lint-staged)
- Configure editor to format on save
- Use `eslint-plugin-tailwindcss` for Tailwind class ordering

**References**:
- ESLint Next.js: https://nextjs.org/docs/app/building-your-application/configuring/eslint
- Prettier: https://prettier.io/docs/en/

---

## Decision 7: Package Manager - pnpm

**Decision**: Use pnpm for package management

**Rationale**:
- **Fast**: Up to 2x faster than npm/yarn
- **Disk efficient**: Hard links to global store, saves disk space
- **Strict**: Enforces correct dependency resolution (no phantom dependencies)
- **Monorepo-ready**: Built-in workspace support if project grows
- **Drop-in replacement**: Same commands as npm (`pnpm install`, `pnpm run dev`)

**Alternatives Considered**:
- **npm**: Slower, less efficient disk usage
- **yarn**: Good alternative, but pnpm is faster and more strict

**Best Practices**:
- Lock file (pnpm-lock.yaml) should be committed
- Use `pnpm add -D` for dev dependencies
- Run `pnpm dlx` for one-off executables (like `create-next-app`)

**References**:
- pnpm Docs: https://pnpm.io/

---

## Decision 8: Deployment - Vercel

**Decision**: Deploy to Vercel with production on `main`, previews on feature branches

**Rationale**:
- **Next.js creators**: Best integration with Next.js features
- **Zero-config**: Automatic builds, preview deployments, HTTPS
- **Edge network**: Global CDN for fast page loads
- **Preview deployments**: Automatic URL for every push (great for manual testing)
- **Generous free tier**: Unlimited hobby projects, 100GB bandwidth/month
- **Environment variables**: Easy to manage secrets (Supabase keys, etc.)

**Alternatives Considered**:
- **Netlify**: Good alternative, slightly less Next.js-optimized
- **Self-hosted (VPS)**: More manual work, requires DevOps knowledge
- **AWS Amplify**: More complex, steeper learning curve

**Best Practices**:
- Connect GitHub repo for automatic deployments
- Set environment variables in Vercel dashboard
- Use preview deployments for manual QA before merging to main
- Enable HTTPS enforcement (automatic with Vercel)

**Deployment Workflow**:
1. Push to feature branch → Vercel creates preview deployment
2. Manual testing on preview URL
3. Merge to `main` → Vercel deploys to production

**References**:
- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/app/building-your-application/deploying

---

## Decision 9: Local State Management - React Hooks

**Decision**: Use built-in React hooks (`useState`, `useReducer`) for state management

**Rationale**:
- **No external dependencies**: React hooks are sufficient for this app
- **Simple mental model**: Co-located state with components
- **Performance**: Built-in optimizations (useMemo, useCallback)
- **Context API**: For global state (auth user, theme) if needed

**When NOT to use external state management**:
- **Redux/Zustand/Jotai**: Overkill for small apps, adds complexity
- **This app**: Only needs local state (filters, form inputs) + Supabase for server state

**Best Practices**:
- Keep state as local as possible (component-level > page-level > global)
- Use `useReducer` for complex state logic (e.g., filter combinations)
- Use Context API sparingly (only for truly global state like auth)
- Supabase SDK manages server state (items, categories) automatically

**References**:
- React Hooks: https://react.dev/reference/react/hooks
- State Management: https://react.dev/learn/managing-state

---

## Decision 10: LocalStorage Caching Strategy

**Decision**: Use LocalStorage for optimistic UI and offline caching

**Rationale**:
- **Perceived performance**: Instant UI updates before server confirms
- **Offline resilience**: Show cached data if Supabase is unreachable
- **Simple API**: `localStorage.setItem()`, `localStorage.getItem()`
- **Sufficient capacity**: 5-10MB limit is plenty for text-based items

**Strategy**:
1. **Read**: Load from LocalStorage first, then fetch from Supabase in background
2. **Write**: Update LocalStorage immediately (optimistic), then sync to Supabase
3. **Sync conflicts**: Last-write-wins (acceptable for single-user app per spec)

**Best Practices**:
- Namespace keys: `futurelist:items`, `futurelist:categories`
- Parse/stringify JSON carefully (handle errors)
- Clear cache on logout
- Expire stale cache (e.g., after 7 days)

**Implementation Example**:
```typescript
// lib/storage.ts
export const storage = {
  getItems: (): Item[] => {
    const json = localStorage.getItem('futurelist:items');
    return json ? JSON.parse(json) : [];
  },
  setItems: (items: Item[]) => {
    localStorage.setItem('futurelist:items', JSON.stringify(items));
  },
  clear: () => {
    localStorage.removeItem('futurelist:items');
    localStorage.removeItem('futurelist:categories');
  },
};
```

**References**:
- LocalStorage MDN: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

## Decision 11: Database Indexing Strategy

**Decision**: Index foreign keys, user_id, and frequently filtered columns

**Rationale**:
- **Performance**: Indexes speed up queries, critical for search/filter features
- **Unlimited items**: No hard limits means large datasets possible
- **Search requirement**: Case-insensitive partial matching requires trigram index

**Indexes to Create**:
```sql
-- User-level queries (most common)
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Filtering by status (todo/done)
CREATE INDEX idx_items_status ON items(status);

-- Filtering by category
CREATE INDEX idx_items_category_id ON items(category_id);

-- Full-text search on title + description (case-insensitive, partial matching)
CREATE INDEX idx_items_search ON items USING gin(to_tsvector('english', title || ' ' || description));

-- Alternative: Trigram index for exact partial matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_items_title_trgm ON items USING gin(title gin_trgm_ops);
CREATE INDEX idx_items_description_trgm ON items USING gin(description gin_trgm_ops);

-- Composite index for combined filters (user + category + status)
CREATE INDEX idx_items_combined ON items(user_id, category_id, status);

-- Created_at for sorting (newest first)
CREATE INDEX idx_items_created_at ON items(created_at DESC);
```

**Best Practices**:
- Monitor query performance in Supabase dashboard
- Use `EXPLAIN ANALYZE` to verify index usage
- Add indexes after initial development (premature optimization)

**References**:
- Postgres Indexing: https://www.postgresql.org/docs/current/indexes.html
- Trigram Search: https://www.postgresql.org/docs/current/pgtrgm.html

---

## Decision 12: Error Handling Strategy

**Decision**: Use React Error Boundaries + toast notifications for user-facing errors

**Rationale**:
- **Error Boundaries**: Catch React rendering errors, prevent white screen
- **Toast notifications**: Non-intrusive error messages for API failures
- **Graceful degradation**: Show cached data if Supabase is down

**Implementation**:
- Use `react-hot-toast` or `sonner` for toast notifications
- Wrap app in Error Boundary component
- Log errors to console (no external error tracking per constitution)

**Best Practices**:
- Show user-friendly messages ("Something went wrong") not technical errors
- Provide actionable guidance ("Please try again" or "Check your connection")
- Preserve user input on errors (don't clear forms)

**References**:
- Error Boundaries: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- React Hot Toast: https://react-hot-toast.com/

---

## Summary of Resolved Clarifications

All "NEEDS CLARIFICATION" items from Technical Context have been resolved:

| Item | Resolution |
|------|-----------|
| Language/Version | TypeScript 5.x + Node.js 20+ |
| Primary Dependencies | Next.js 15, React 19, Tailwind CSS 4, Supabase, Lucide, Framer Motion |
| Storage | Postgres (Supabase) + LocalStorage |
| Testing | None (manual only per constitution) |
| Target Platform | Modern browsers (2-year support window) |
| Project Type | Web application (frontend + BaaS) |
| Performance Goals | <1s loads, <100ms feedback, <1s search |
| Constraints | Solo dev, manual testing, no analytics |
| Scale/Scope | ~100 users, unlimited items, 7 user stories |

---

## Next Steps

With research complete, proceed to **Phase 1: Design & Contracts**:

1. Generate `data-model.md` (database schema, entities, relationships)
2. Generate `contracts/supabase.sql` (table definitions, RLS policies, indexes)
3. Generate `quickstart.md` (local dev setup instructions)
4. Update agent context file with technology stack

