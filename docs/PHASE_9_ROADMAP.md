# Everly — Post-MVP Roadmap (Phase 9+)

Analysis of the requested updates/fixes, plus additional suggestions. The original `docs/PLANNING.md` already flagged several of these as deferred stretch goals — this doc is where they actually get scoped for real.

## 1. Shared infrastructure two requests depend on

Two separate requests — forgot/reset password (§2) and email confirmation (§3) — both require the same new piece of infrastructure this project has never needed before: **an email-sending provider**. Worth setting up once, used by both.

**Decided: Mailtrap** (user already has an account) via plain SMTP, using Node's `nodemailer` to send. Mailtrap sandboxes outgoing mail — nothing actually reaches a real inbox, emails just land in Mailtrap's testing inbox UI for inspection — so there's no domain/deliverability setup needed for this stage. This is explicitly a placeholder: once a real domain is bought, this gets swapped for that domain's real SMTP credentials. Since the integration is just SMTP config (host/port/user/pass) behind a small `sendEmail()` helper, that later swap is a config change, not a rewrite.

This also means §2 and §3 should be built together, sharing this email setup, rather than as two unrelated tickets.

## 2. Forgot / reset password — make it real

Phase 5 built the *UI* for this already (`ForgotPasswordPage`, `ResetPasswordPage`), deliberately non-functional, with the explicit plan to wire it up "later, alongside email verification." This is that moment.

**New schema**: a `password_reset_tokens` table (`id`, `user_id` FK, `token`, `expires_at`, `created_at`) — same shape already anticipated in `docs/PLANNING.md` for email verification tokens.

**New endpoints**: `POST /auth/forgot-password` (generate a token, email a reset link), `POST /auth/reset-password` (validate token + expiry, update password, invalidate the token so it can't be reused).

**A real security detail worth building correctly, not glossing over**: `forgot-password` must return the same generic response (`"If that email exists, we've sent a reset link"`) regardless of whether the email actually matches a user. Returning a different response for "email exists" vs "email doesn't exist" would let an attacker enumerate which emails have accounts on this system — the same principle already applied to login's identical error messages back in Phase 2.

**Frontend**: replace the existing fake local-state transitions in both pages with real API calls to the endpoints above.

## 3. Email confirmation to activate accounts

`users.email_verified` has existed in the schema since Phase 0/1, specifically seeded for this feature. Now it gets used for real.

**New schema**: `email_verification_tokens` (`id`, `user_id` FK, `token`, `expires_at`, `created_at`) — already documented as the planned pairing table.

**New endpoints**: a way to confirm a code (`POST /auth/verify-email`), and a "resend verification email" endpoint for when the first one is lost or expires.

**Decided**: full lockout until verified — login is rejected outright for an unverified account, with a message directing the user to check their email or resend verification.

## 4. Image upload — WebP conversion + temporary original-file comparison

Current pipeline: `sharp` resizes and converts to JPEG at quality 80. Change the output format:
```ts
sharp(buffer).resize(...).webp({ quality: ... })
```
WebP is a straightforward, well-supported `sharp` output format — better compression-to-quality ratio than JPEG, and a reasonable modern default to learn.

**Storing the original alongside it**: upload both the original buffer and the converted WebP to Supabase Storage under a clear naming convention (e.g. `original-<id>.<ext>` vs `<id>.webp`), viewable directly via the Supabase dashboard for manual comparison. Recommend **not** adding a DB column or any UI for this — you explicitly said it's temporary/for comparison only, and a schema change for a debugging-only feature is churn worth avoiding. Storage usage temporarily doubles per upload; acceptable given it's explicitly short-lived. When you're done comparing, this is a one-line revert (remove the original upload call) with no schema cleanup needed.

## 5. Search — debounce + loading indicator

Right now every keystroke in the search box immediately updates state, which is also part of the query key — meaning every keystroke fires a real network request. Two fixes:

- **Debounce**: delay actually triggering the query until typing pauses (~300–400ms) — a small custom hook (`useDebouncedValue`) wrapping the raw input state.
- **Loading indicator**: use TanStack Query's `isFetching` (not `isLoading`) — genuinely the right tool here, and a concept not yet used in this project. `isLoading` is only true on the very first load; `isFetching` is true on *any* fetch, including background refetches triggered by typing — exactly what a search spinner needs to reflect.

## 6. Map — draggable marker + address search

**Draggable marker**: `react-leaflet`'s `<Marker>` supports a `draggable` prop and a `dragend` event handler — a small, contained addition to the existing `LocationPicker`.

**Address search**: this needs a geocoding service (turning typed text into coordinates) — a genuinely new kind of external dependency. Recommend **Nominatim**, OpenStreetMap's own free geocoding service — pairs naturally with the Leaflet+OSM setup already in place, no API key needed. Worth knowing its free public endpoint has real rate limits meant for light use, not high-traffic production — fine for this project, worth knowing if this ever needed to scale.

**This overlaps with §8 (AI item info) below** — same geocoding need, worth building once and reusing.

## 7. New `notes` field on items — done

Added a nullable `notes` text column, same category of change as `importance`/`isArchived` back in Phase 6 — migration, shared Zod schema update, a form field in `ItemModal`. The generic object-spread pattern already used in the update route meant the API layer itself needed no changes.

**Decided**: from a DB standpoint they're identical (both plain text) — the distinction is purely about where/how each is shown. `description` is shown in the grid/list view. `notes` is extra free text the user can add separately, editable only in the item modal — e.g. jotted down once an item is marked done. `ItemCard` intentionally does not display `notes`.

## 8. "User settings" — make the link real

Currently an inert placeholder in the avatar menu since Phase 5. **Decided — two sections**:
1. **Update profile data**: name only for this initial phase (room to add more fields later). Email is shown but locked/disabled — not editable here.
2. **Update password**: change password while logged in, requiring the current password as confirmation — distinct from the forgot-password flow in §2, which instead uses an emailed token and doesn't require knowing the old password.

## 9. AI integration — auto-fetch item info

The most open-ended item here, worth being precise about what's realistically achievable rather than treating "AI" as one undifferentiated capability.

- **Description generation**: a genuinely good fit for an LLM (e.g., the Claude API) — given a title like "Tasting menu at Lumen," asking a model to draft a plausible description is straightforward and reliable enough.
- **Location**: **not** a good LLM task — language models are notoriously unreliable at precise coordinates. This should reuse the Nominatim geocoding service from §6 instead — the same "look up a place, get real coordinates" problem, solved with the right tool rather than asking an LLM to guess.
- **Image**: an LLM cannot "fetch a real photo of a real restaurant" — a generic image-generation model would produce a plausible-looking but *fake* image, not an actual photo of the actual place. A real photo would need a dedicated Places API (e.g., Google Places), a separate, likely paid, integration.

**Decided: this entire feature is on hold.** Not part of the current build order — revisit later once the rest of the roadmap is done.

## Bugs

**10. Remove the artificial delay from Mark done / Restore; add a confirmation to Mark done specifically**

The archive-toggle action reuses the same `useUpdateItem` mutation as the full item-edit save in `ItemModal` — which is correctly wrapped in `withDelay` for that modal's spinner UX. But the quick inline card action has no spinner to make visible, so the same delay just makes a simple toggle feel sluggish for no reason. Fix: give archive-toggle its own call path that doesn't go through `withDelay` (a new hook, or just calling the API function directly).

Add a `ConfirmDialog` (same component already used for delete) specifically for **Mark done**, not Restore — worth naming that asymmetry explicitly: archiving gets a confirm step, restoring doesn't, since un-archiving is lower-stakes and more freely reversible.

**11. Cold-start delay after inactivity**

This is Render's free tier specifically — free web services spin down after a period of inactivity and take tens of seconds to restart on the next request. (Not Vercel — static hosting has no "cold start" concept at all. Not really Supabase either — its free-tier pause window is much longer and would manifest as a failed DB connection, not a slow-but-working page load.)

**Decided**: accept the cold start as a known limitation (consistent with how `docs/PLANNING.md` already accepted Supabase's own inactivity pause), and add a "waking up" loading state on the frontend — a clear "Waking up the server, this may take a moment" message during that first slow request, replacing what would otherwise look like a frozen page. Doesn't eliminate the delay, just makes it legible. No keep-alive ping — that's a gray-area workaround against the free tier's intended use, and Render's free tier likely has a monthly usage-hour cap regardless, so it could just shift the problem rather than solve it.

## Additional suggestions not on your list

- **Rate limiting** — already a Phase 9 stretch item in the original plan, and now more clearly needed: an AI-backed endpoint (§8) is a realistic target for abuse/cost if left unprotected.
- **Postgres full-text search** — also already planned; more relevant now given the search UX work in §5.
- **Structured logging** — genuinely useful now that the app is live; the last few production bugs (CORS, cookies) would have been easier to diagnose with real structured logs instead of piecing it together live.
- **Tests for every new feature** — Phase 7 established real test coverage as a norm; each item above should get at least basic coverage as it's built, not bolted on afterward as a separate pass.
- **Accessibility pass on new components** — Phase 5 spent real effort getting `jsx-a11y` genuinely right (label associations, keyboard alternatives, fieldset/legend); worth holding new components (the settings page, the AI-fetch button, the map's address search) to the same bar rather than letting that rigor quietly lapse.

## Suggested build order

Given the shared dependencies above, roughly:
1. ~~SMTP/Mailtrap setup (serves §2 and §3 together)~~ — done
2. ~~Email verification (§3)~~ — done
3. ~~Forgot/reset password (§2)~~ — done
4. ~~Bug fixes (§10, §11)~~ — done
5. ~~Search debounce + spinner (§5)~~ — done
6. ~~Notes field (§7)~~ — done
7. Map improvements (§6) — introduces Nominatim
8. User settings (§8) — benefits from password-change infra already built in step 3
9. AI integration (§9) — **on hold**, revisit after the above ships
