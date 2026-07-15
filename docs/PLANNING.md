# Everly — Planning Document

*"A list of things worth doing"*

## 1. Goal of this project

This is a learning project aimed at strengthening your CV. Priority order:

1. Learn how a **professional TypeScript full-stack project is structured**, not syntax.
2. Learn **CI/CD** end-to-end (you have zero experience here — this is the highest-value new skill).
3. Get hands-on with **Postgres** (coming from deep MySQL experience) and **Drizzle**.
4. Ship something that actually works, as a portfolio piece.

You write all code yourself. I provide instructions, file-by-file structure, and review-style guidance — not generated source files.

## 2. Confirmed interpretations

- "Desktop app" means a **responsive web app used in a desktop browser** — not an Electron app. "Convert to native later" means a future React Native/Capacitor wrapper, which just means we shouldn't couple business logic to browser-only DOM APIs unnecessarily. No action needed now.
- Registration collects **name, email, password** only — no email verification flow **in the MVP**. It's coming later though, so the `users` table is built for it from the start (see §5) to avoid a painful migration once it's needed.
- "Categories" are **per-user**, not global — each user gets `food`, `travel`, `free time` seeded on registration, and can both edit the defaults and add their own.
- MVP scope = auth + item CRUD + category CRUD + grid view + filters. Picture upload and geolocation are real but come in a later phase, not blocking the first deploy.

## 3. Tech stack & rationale

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript everywhere | Shared types between frontend/backend via a shared package |
| Frontend | React 18 + **Vite** | No meta-framework, as requested — Vite is the standard professional build tool for plain React SPAs |
| Styling | Tailwind CSS v4 | As requested; v4 also teaches the new CSS-first config (no `tailwind.config.js`) |
| Routing | React Router v6 | De facto standard for SPA routing |
| Data fetching | TanStack Query | Industry-standard pattern for server-state (caching, retries, invalidation) — much more "real world" than raw `fetch` in `useEffect` |
| Forms/validation | React Hook Form + Zod | Zod schemas shared with the backend — one source of truth for validation rules |
| Backend framework | **Fastify** | Chosen over Express: TS-first, built-in schema validation/serialization, better perf, and increasingly what modern TS shops use. Express is still more common in job postings, but Fastify demonstrates you know the current direction of the ecosystem — worth noting on your CV either way. |
| ORM | Drizzle | As requested — SQL-first, lightweight, great TS inference |
| Database | Postgres via **Supabase** (managed) + local Postgres via Docker for dev | Learn managed Postgres ops without running your own box; Docker Compose locally is itself a real-world skill |
| File storage | Supabase Storage | For item pictures — avoids hand-rolling S3, still teaches signed-URL upload patterns |
| Auth | Custom (bcrypt/argon2 + JWT), **not** Supabase Auth | Your choice — you learn how auth actually works instead of delegating it |
| Backend hosting | **Render** | Persistent Node container — real server lifecycle, not serverless functions |
| Frontend hosting | **Vercel** | Git-integrated deploys, preview environments per PR — this is where most of your CI/CD learning happens |
| CI | **GitHub Actions** | Industry standard — lint, typecheck, test, build on every PR |
| Monorepo | npm workspaces | Your choice — simplest option, one less tool to learn |

## 4. Repository structure

```
everly/
├─ apps/
│  ├─ web/            # React + Vite + Tailwind SPA
│  └─ api/             # Fastify + Drizzle server
├─ packages/
│  └─ shared/          # Zod schemas + shared TS types (User, Category, Item DTOs)
├─ docker-compose.yml   # local Postgres for dev
├─ .github/workflows/   # CI/CD pipelines
└─ package.json         # npm workspaces root
```

Why a monorepo: it's the most common real-world pattern for "one team owns frontend + backend + shared types" and lets you practice workspace-aware CI (only rebuild/deploy what changed).

## 5. Data model (first pass)

**users**
`id, name, email (unique), password_hash, email_verified (bool, default false), created_at`

**categories**
`id, user_id (FK), name, is_default (bool), created_at`

**items**
`id, user_id (FK), category_id (FK), title, description, image_url (nullable), latitude (nullable), longitude (nullable), location_label (nullable), created_at, updated_at`

Notes:
- Categories are per-user so users can rename/edit/delete their own without affecting others — this also means a "default" category can't just be a global row, it has to be seeded per user at registration (a small transaction: insert user → insert 3 default categories).
- `email_verified` is added to `users` now even though verification is post-MVP: every user row will simply have it `false` at first (or you can default new MVP users to `true` if you don't want a fake "unverified" state blocking nothing — worth deciding when the feature actually lands). The point is the column exists from the first migration, so adding real verification later is "add a token table + an endpoint," not "ALTER a live table users already depend on." A natural pairing table for later: `email_verification_tokens (id, user_id FK, token, expires_at, created_at)`.
- Free-text filtering: start with a simple `ILIKE` on `title`/`description` for MVP. Once that works, upgrading to Postgres **full-text search** (`tsvector` + GIN index) is a great "new to Postgres" learning milestone and a legitimate CV bullet point (MySQL's fulltext search works very differently).

## 6. API surface (first pass)

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | name, email, password → creates user + 3 default categories |
| POST | `/auth/login` | email, password → issues JWT |
| POST | `/auth/logout` | clears session |
| GET | `/categories` | current user's categories |
| POST | `/categories` | create |
| DELETE | `/categories/:id` | delete — blocked (409) if any item still references this category |
| GET | `/items?category=&q=` | list with filters |
| POST | `/items` | create |
| PATCH | `/items/:id` | update |
| DELETE | `/items/:id` | delete |
| POST | `/items/:id/image` | upload picture (Supabase Storage) |

## 7. Open design flaw to resolve before Auth phase

**Cross-domain auth.** Frontend on Vercel and API on Render live on **different domains**. This has real consequences:
- If you use an `httpOnly` cookie for the JWT (more secure against XSS, the "correct" pattern), it must be sent cross-site, which requires `SameSite=None; Secure` on the cookie **and** `credentials: 'include'` + proper CORS (`Access-Control-Allow-Origin` = exact frontend origin, `Access-Control-Allow-Credentials: true`) on the API. This is a very common real-world gotcha worth deliberately learning.
- The simpler alternative is a Bearer token in `Authorization` header, stored in memory (not localStorage, to reduce XSS blast radius) — easier cross-domain, slightly different security tradeoffs.

**Recommendation:** do the httpOnly cookie + CORS version. It's more representative of production auth and the exact kind of "gotcha I debugged once" story that's good in an interview. We'll implement it in the Auth phase — flagging now so it doesn't surprise you later.

## 8. Environments & secrets

You'll end up managing secrets in **four** places — this multiplicity is itself a real-world CI/CD lesson:

- **Local `.env`** (gitignored) — local Postgres URL, JWT secret
- **GitHub Actions secrets** — used only if CI needs to run migrations/tests against a real DB, or to trigger deploys
- **Render env vars** — production `DATABASE_URL` (Supabase), `JWT_SECRET`, Supabase Storage keys
- **Vercel env vars** — `VITE_API_URL` pointing at the Render backend

## 9. CI/CD plan

**CI (GitHub Actions, on every PR):**
1. Install deps (npm workspaces cache)
2. Lint (ESLint)
3. Typecheck (`tsc --noEmit` in each workspace)
4. Unit tests (Vitest)
5. Build both apps

**CD:**
- **Frontend:** Vercel's native GitHub integration — auto-deploys `main` to production, every PR gets a **preview URL**. This preview-per-PR behavior is worth exploring deliberately, it's a major reason real teams use Vercel.
- **Backend:** Render auto-deploy on push to `main` initially (simplest). As a stretch improvement once CI is solid: gate the deploy behind CI success by disabling Render's auto-deploy and instead calling Render's **deploy hook** from a GitHub Actions job that only runs `if: success()` after the test job — this teaches the "don't deploy broken code" pattern that plain platform auto-deploy doesn't give you.

## 10. Build phases (roadmap)

| Phase | What you build | Primary skill learned |
|---|---|---|
| 0 | Repo scaffold, npm workspaces, TS configs, ESLint/Prettier, Docker Compose Postgres | Professional repo setup |
| 1 | Drizzle schema + migrations, Fastify server skeleton | Drizzle + Postgres, Fastify basics |
| 2 | Register/login, password hashing, JWT, auth hook/middleware | Backend security fundamentals |
| 3 | Categories + Items CRUD API with filters | Fastify routing, Zod validation, Postgres queries |
| 4 | Vite + React scaffold, Tailwind v4, routing, API client, TanStack Query | Modern React app structure |
| 5 | Auth pages, protected routes, item grid, filters UI, create/edit forms | React Hook Form + Zod, real UI state |
| 6 | Image upload + server-side resize/compress (Supabase Storage), geolocation capture | File upload UX, image processing (`sharp`), browser Geolocation API |
| 7 | Tests: Vitest (API), React Testing Library (web) | Testing real-world apps |
| 8 | GitHub Actions CI, Vercel deploy, Render deploy, secrets wiring | **CI/CD end-to-end** |
| 9 (stretch) | Postgres full-text search, rate limiting, structured logging, gated CD, **email verification flow** (schema already supports it) | Polish for CV bullet points |

We'll go phase by phase — I give you the structure/checklist for a phase, you implement it, we review before moving on.

## 11. Other risks to keep in mind

- **Image upload**: validate both file type and size on the client (fast UX feedback) *and* re-validate on the server (client checks are trivially bypassable, never trust them alone). Beyond validation, uploaded images also need to be **resized** — both quality (re-compressed) and width/height (capped to a max dimension) — before they're written to Supabase Storage, to keep storage/bandwidth costs down and the grid view fast. Recommended approach: do the resizing server-side with `sharp` (a Node image-processing library with native bindings) rather than client-side — this is also a nice concrete payoff from choosing Render over serverless functions, since native-binding libraries like `sharp` run far more smoothly in a persistent container than in ephemeral serverless environments. Lands in Phase 6.
- **Category deletion**: confirmed — block deletion (return a 409) while any item still references that category, rather than cascading. See §6 for the corresponding API behavior.
- **Supabase free tier** pauses inactive projects after a period of inactivity. Acknowledged and accepted — this is a test/portfolio project, not aiming for always-on availability, so the occasional cold-start delay on demo is a fine tradeoff.

## 12. Next step

If this looks right, next I'll walk you through **Phase 0** (repo scaffold + tooling) as a concrete checklist — no code written for you, just what files/configs to create and why.
