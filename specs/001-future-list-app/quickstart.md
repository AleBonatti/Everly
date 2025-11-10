# Quickstart: FutureList Local Development

**Date**: 2025-11-06
**Feature**: 001-future-list-app
**Phase**: Phase 1 - Design & Contracts

## Overview

This guide walks through setting up the FutureList development environment from scratch. Follow these steps to get the app running locally with Supabase backend.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js**: v20.x or later ([download](https://nodejs.org/))
- **pnpm**: v8.x or later (install: `npm install -g pnpm`)
- **Git**: Version control ([download](https://git-scm.com/))
- **Supabase Account**: Free tier ([sign up](https://supabase.com/))
- **Code Editor**: VS Code recommended with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

**System Requirements**:
- macOS, Linux, or Windows (WSL2 recommended for Windows)
- 4GB RAM minimum, 8GB recommended
- 2GB free disk space

---

## Step 1: Clone Repository

```bash
# Clone the repository (replace with your repo URL)
git clone https://github.com/yourusername/SpecToDo.git
cd SpecToDo

# Checkout feature branch
git checkout 001-future-list-app
```

---

## Step 2: Install Dependencies

```bash
# Install all project dependencies with pnpm
pnpm install

# This installs:
# - Next.js 15
# - React 19
# - Tailwind CSS 4
# - Supabase Client SDK
# - TypeScript 5.x
# - Lucide Icons
# - Framer Motion
# - ESLint + Prettier
```

**Expected output**:
```
Packages: +XXX
++++++++++++++++++++++++++++++++++++++++
Progress: resolved XXX, reused XXX, downloaded X, added XXX, done
Done in Xs
```

---

## Step 3: Create Supabase Project

1. **Go to Supabase Dashboard**: https://app.supabase.com/
2. **Create New Project**:
   - Organization: Select or create
   - Name: `futurelist-dev` (or any name)
   - Database Password: Generate strong password (save it!)
   - Region: Choose closest to you
   - Pricing Plan: Free
3. **Wait for setup**: Takes ~2 minutes
4. **Note your project details**:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon/Public Key: Found in Settings → API

---

## Step 4: Configure Environment Variables

Create `.env.local` in project root:

```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

Add your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to find these**:
- Supabase Dashboard → Settings → API
- `URL`: Project URL
- `anon` key: anon public key (safe for client-side)
- `service_role` key: service role key (keep secret, server-side only)

**Security Note**:
- `.env.local` is gitignored - never commit to version control
- `NEXT_PUBLIC_*` variables are exposed to browser
- `SUPABASE_SERVICE_ROLE_KEY` is server-side only (no `NEXT_PUBLIC_` prefix)

---

## Step 5: Set Up Database Schema

1. **Open Supabase SQL Editor**:
   - Supabase Dashboard → SQL Editor → New Query

2. **Copy schema from contracts**:
   ```bash
   cat specs/001-future-list-app/contracts/supabase.sql
   ```

3. **Paste into SQL Editor** and click **Run**

4. **Verify tables created**:
   - Table Editor → Should see `categories` and `items` tables
   - Authentication → Policies → Verify RLS policies enabled

5. **Test trigger**:
   - Create a test user via Authentication → Add User
   - Check Table Editor → categories → Should see 4 default categories for that user

---

## Step 6: Generate TypeScript Types

Generate TypeScript types from database schema:

```bash
# Install Supabase CLI if not already installed
pnpm add -g supabase

# Login to Supabase (will open browser)
supabase login

# Link to your project
supabase link --project-ref xxxxx

# Generate types from remote database
supabase gen types typescript --linked > lib/supabase/types.ts
```

**Expected output**:
```typescript
// lib/supabase/types.ts
export type Json = string | number | boolean | null | ...
export interface Database { ... }
```

**Alternative (if CLI issues)**:
- Supabase Dashboard → Settings → API Docs → Copy TypeScript types
- Paste into `lib/supabase/types.ts`

---

## Step 7: Start Development Server

```bash
# Start Next.js dev server
pnpm dev

# Expected output:
# ▲ Next.js 15.0.0
# - Local:        http://localhost:3000
# - Ready in 2.3s
```

Open browser to http://localhost:3000

**What to expect**:
- Redirect to `/login` (not authenticated)
- Clean login/signup form
- Fast hot reload on code changes

---

## Step 8: Create Test User

### Via Supabase Dashboard (Recommended for first user)

1. Supabase Dashboard → Authentication → Add User
2. Email: `test@example.com`
3. Password: `testpassword` (6+ characters)
4. Click **Send Magic Link** or **Create User**
5. User appears in Users table with 4 default categories

### Via App Signup (Once running)

1. Go to http://localhost:3000/signup
2. Enter email and password (6+ characters)
3. Click **Sign Up**
4. Should redirect to `/todos` after successful signup
5. Default categories (Movies, Restaurants, Trips, Books) created automatically

---

## Step 9: Verify Everything Works

### Manual Testing Checklist

#### Authentication Flow
- [ ] Navigate to `/signup`
- [ ] Create account with email + password (6+ chars)
- [ ] Automatically logged in and redirected to `/todos`
- [ ] Logout button works (redirects to `/login`)
- [ ] Login with created credentials works

#### Item Management (User Story 1 - P1)
- [ ] Click "Add Item" button
- [ ] Enter title "Watch Oppenheimer" and select "Movies"
- [ ] Item appears in list within 1 second
- [ ] Try adding without title → See validation message
- [ ] Try adding without category → See validation message

#### Categories
- [ ] See default categories: Movies, Restaurants, Trips, Books
- [ ] Create custom category "Podcasts"
- [ ] Select custom category when adding item
- [ ] Cannot delete category with items (error/disabled)

#### Status Tracking (User Story 4 - P2)
- [ ] Click checkbox/button to mark item as done
- [ ] Item visually changes (strikethrough, checkmark, different color)
- [ ] Click again to mark as todo
- [ ] Item reverts to original style

#### Search & Filter (User Story 3 - P2)
- [ ] Add items in multiple categories
- [ ] Filter by category "Movies" → See only movie items
- [ ] Type "opp" in search → Find "Oppenheimer" (partial match)
- [ ] Search "OPPENHEIMER" → Still finds it (case-insensitive)
- [ ] Combine filters: Category=Restaurants + Status=done + Search=sushi
- [ ] Clear filters → See all items

#### Responsive Design
- [ ] Open DevTools (F12) → Toggle Device Toolbar (Ctrl+Shift+M)
- [ ] Test mobile (375px): Single column, thumb-friendly buttons
- [ ] Test tablet (768px): Adapted layout
- [ ] Test desktop (1280px): Optimal spacing
- [ ] All touch targets ≥44px on mobile

#### Data Persistence
- [ ] Add items, logout, login again
- [ ] Items still present (database persistence)
- [ ] Open in incognito window, login
- [ ] Same items visible (cross-session sync)

---

## Step 10: Optional Enhancements

### Enable Real-time Subscriptions (Optional)

Real-time updates when data changes (e.g., across multiple devices):

```typescript
// features/todos/hooks/useTodos.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useTodos() {
  // ... existing code

  useEffect(() => {
    // Subscribe to item changes
    const channel = supabase
      .channel('items_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        (payload) => {
          console.log('Item changed:', payload);
          // Refetch items or update local state
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
```

### Add Loading States

Show loading indicators for better UX:

```tsx
// features/todos/components/TodoList.tsx
const { data: items, isLoading } = useTodos();

if (isLoading) {
  return <div>Loading your items...</div>;
}
```

### Add Error Boundaries

Catch React errors gracefully:

```tsx
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}
```

---

## Development Workflow

### Daily Development

```bash
# 1. Start dev server
pnpm dev

# 2. Make code changes
# - Files auto-reload on save
# - Check browser for updates
# - Check terminal for errors

# 3. Manual testing
# - Test feature in browser
# - Check mobile responsive (DevTools)
# - Verify across scenarios

# 4. Commit changes
git add .
git commit -m "feat: add item filtering by category"

# 5. Push to remote (triggers Vercel preview deployment)
git push origin 001-future-list-app
```

### Code Quality Checks

```bash
# Lint code (ESLint)
pnpm lint

# Format code (Prettier)
pnpm format

# Type check (TypeScript)
pnpm type-check

# Build for production (verify no errors)
pnpm build
```

### Manual Testing Routine (Before Each Commit)

1. **Happy path**: Test main user flow (add item → mark done → filter → search)
2. **Error cases**: Try invalid inputs (empty title, no category)
3. **Responsive**: Test mobile (375px), tablet (768px), desktop (1280px)
4. **Cross-browser**: Chrome, Firefox, Safari (if available)
5. **Performance**: Check page load <1s, interactions <100ms
6. **Edge cases**: Long titles, many items, special characters in search

**No automated tests per constitution** - rely on thorough manual testing.

---

## Troubleshooting

### Issue: `pnpm install` fails

**Solution**:
```bash
# Clear pnpm cache
pnpm store prune

# Delete node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

### Issue: Supabase connection error

**Symptoms**: "Failed to fetch" or "Invalid API key"

**Solution**:
1. Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Verify Supabase project is active (not paused)
3. Restart dev server: `Ctrl+C` then `pnpm dev`

### Issue: RLS policies block queries

**Symptoms**: Empty results even though data exists

**Solution**:
1. Verify user is authenticated: `supabase.auth.getSession()`
2. Check RLS policies in Supabase Dashboard → Authentication → Policies
3. Test queries with service role key (bypasses RLS) to isolate issue

### Issue: TypeScript errors

**Solution**:
```bash
# Regenerate types from database
supabase gen types typescript --linked > lib/supabase/types.ts

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Issue: Build fails

**Symptoms**: `pnpm build` errors

**Solution**:
1. Check terminal for specific error
2. Verify all imports are correct (no missing files)
3. Run `pnpm lint` to catch linting errors
4. Run `pnpm type-check` to catch TypeScript errors

### Issue: Slow performance

**Solution**:
1. Check Supabase dashboard for slow queries (Performance tab)
2. Verify indexes are created (see `contracts/supabase.sql`)
3. Limit results with pagination (e.g., `LIMIT 50`)
4. Check browser DevTools → Network tab for slow requests

---

## Next Steps

With local development running:

1. **Implement User Stories**:
   - Start with P1 stories (Item Capture, Authentication)
   - Then P2 stories (Filter/Search, Status Tracking)
   - Finally P3 stories (Enrichment, Edit/Delete, Custom Categories)

2. **Deploy to Vercel**:
   - Connect GitHub repo to Vercel
   - Configure environment variables in Vercel dashboard
   - Push to `main` branch for production deployment

3. **Manual QA**:
   - Test on real devices (phone, tablet)
   - Test across browsers (Chrome, Firefox, Safari)
   - Test edge cases (long titles, many items, slow network)

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **Lucide Icons**: https://lucide.dev/
- **Framer Motion**: https://www.framer.com/motion/

---

## Development Best Practices

### Clean Code (Constitution Principle I)

- Use descriptive variable names: `userItems` not `data`
- Extract repeated logic into utility functions
- Keep components small and focused (<200 lines)
- Add comments only for non-obvious logic

### Simple UX (Constitution Principle II)

- Test every feature yourself before committing
- Ask: "Is this the fewest possible clicks?"
- Provide immediate feedback on all actions
- Use helpful, non-technical error messages

### Responsive Design (Constitution Principle III)

- Always develop mobile-first
- Test all breakpoints (sm, md, lg, xl)
- Ensure touch targets ≥44px on mobile
- Use relative units (rem, %, vw) not fixed pixels

### Manual Testing (Constitution Principle IV)

- No test files, no test frameworks
- Test manually across key scenarios before commit
- Visual QA on multiple screen sizes
- Trust your judgment and tactile feedback

### Privacy (Constitution Principle V)

- Never expose sensitive data in client code
- Verify RLS policies enforce user isolation
- No third-party analytics or tracking
- HTTPS enforced in production (automatic with Vercel)

---

## Getting Help

- **Project Issues**: Check `/specs/001-future-list-app/` documentation
- **Supabase Issues**: https://github.com/supabase/supabase/discussions
- **Next.js Issues**: https://github.com/vercel/next.js/discussions
- **General Questions**: Review constitution in `.specify/memory/constitution.md`

