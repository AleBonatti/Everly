# Setup Guide - FutureList

## Current Status

✅ **Completed Phases**:
- Phase 1: Project initialization (10/10 tasks)
- Phase 2: Foundation (14/17 tasks - 3 require manual setup)

⚠️ **Remaining Setup Steps** (Required before development):

### Step 1: Set up Supabase Project (T011)

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details:
   - **Name**: `futurelist-dev` (or any name)
   - **Database Password**: Generate and save a strong password
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is sufficient
4. Wait ~2 minutes for project setup to complete
5. Note your credentials:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: Found in Settings → API

### Step 2: Configure Environment Variables (T012)

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Important**: Never commit `.env.local` to version control (already in .gitignore)

### Step 3: Apply Database Schema (T013)

1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy the entire schema from `specs/001-future-list-app/contracts/supabase.sql`
4. Paste into SQL Editor
5. Click "Run" to execute
6. Verify tables created:
   - Go to Table Editor
   - You should see `categories` and `items` tables
   - Go to Authentication → Policies
   - Verify RLS policies are enabled

### Step 4: Generate TypeScript Types (Optional but Recommended)

The placeholder types are already in place, but for full type accuracy:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref <your-project-ref>

# Generate types
supabase gen types typescript --linked > lib/supabase/types.ts
```

**Alternative** (if CLI has issues):
- Go to Supabase Dashboard → Settings → API Docs
- Copy the TypeScript types
- Replace contents of `lib/supabase/types.ts`

### Step 5: Verify Setup

Run the development server:

```bash
pnpm dev
```

Expected behavior:
- Server starts on http://localhost:3000
- No environment variable errors
- Opening browser shows redirect to /todos (then to /login if not authenticated)

## Next Steps After Setup

Once Steps 1-3 are complete, you can:

1. **Continue implementation** with Phase 3 (User Story 1 - Quick Item Capture)
2. **Test the foundation**:
   ```bash
   pnpm dev  # Start dev server
   pnpm lint # Check for linting errors
   ```

## Troubleshooting

### Issue: "Invalid API key" error

**Solution**:
- Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and key
- Verify Supabase project is active (not paused)
- Restart dev server: `Ctrl+C` then `pnpm dev`

### Issue: "relation does not exist" error

**Solution**:
- Database schema not applied
- Go back to Step 3 and run the SQL script

### Issue: RLS policy blocks queries

**Solution**:
- Verify user is authenticated
- Check RLS policies in Supabase Dashboard → Authentication → Policies
- Ensure policies match those in `contracts/supabase.sql`

## What's Already Done

✅ **Project Structure**:
- Next.js 15 configured with TypeScript
- Tailwind CSS 4 configured
- ESLint and Prettier configured
- All dependencies installed

✅ **Foundation Code**:
- Supabase clients (browser & server) created
- Utility functions (cn, formatDate, debounce, etc.)
- LocalStorage utilities with caching
- Base UI components (Button, Input, Card, Select, Tag)
- Layout components (Header, Container)
- Root layout and global styles

✅ **Documentation**:
- README.md with project overview
- .gitignore, .eslintignore, .prettierignore configured
- This SETUP_GUIDE.md

## Ready to Code?

Once you've completed Steps 1-3 above, the foundation is ready and you can proceed with implementing user stories.

The next phases are:
- **Phase 3**: User Story 1 - Quick Item Capture (P1 - MVP)
- **Phase 4**: User Story 2 - Authentication & Privacy (P1 - MVP)
- **Phases 5-9**: Additional user stories (P2 and P3)
- **Phase 10**: Polish and optimization

---

**Need Help?** Check:
- Quickstart guide: `specs/001-future-list-app/quickstart.md`
- Task breakdown: `specs/001-future-list-app/tasks.md`
- Technical plan: `specs/001-future-list-app/plan.md`
