# Everly — Native Mobile App: Requirements & Planning

Companion to `docs/PLANNING.md` (web MVP) and `docs/PHASE_9_ROADMAP.md` (post-MVP web work). This document scopes the **first native mobile client** for Everly. Same spirit as those docs: decisions are made and justified here, with open questions called out explicitly rather than glossed over.

Written 2026-08-10. Web app and API are feature-complete through Phase 9 (Postgres, Fastify, custom cookie/JWT auth, Supabase Storage, Leaflet maps, image upload with WebP conversion).

---

## 0. Why this doc exists

The web app already proves the product idea and the API is stable. The mobile app is a **new client** against an **existing backend** — this is a much smaller problem than "build Everly again," but it is not zero-risk. The biggest risk is architectural, not visual: **the current auth mechanism (httpOnly cookies) does not transfer cleanly to a native app**, and that has to be decided before any UI work starts. See §5.

This doc is written for someone with zero native app experience but strong TS/React/Node background — explanations lean on that existing knowledge rather than starting from scratch on JS/React concepts.

---

## 1. Where does the code live?

**Decision: same monorepo, new sibling app — `apps/mobile`.**

```
everly/
  apps/
    web/       (existing)
    api/       (existing)
    mobile/    (new)
  packages/
    shared/    (existing — reused by mobile)
```

### Why not a separate repo?

- `packages/shared` already holds the Zod schemas for `auth`, `items`, `categories`, `common` — these are the request/response contracts with the API. A mobile app hitting the same API needs the *exact same* contracts. In the same npm workspace, mobile just adds `"@everly/shared": "*"` as a dependency, same as `apps/web` and `apps/api` already do. In a separate repo, you'd either duplicate these types (drift risk — the whole reason `packages/shared` exists) or publish it as a versioned package, which is real infrastructure overhead for a learning project.
- One `git log`, one PR history, one place to reason about a full-stack change (e.g. adding a field to `items` touches API + shared + web + mobile in one commit instead of four coordinated repos).
- The root `package.json` already declares `"workspaces": ["apps/*", "packages/*"]` — `apps/mobile` is picked up with zero config changes.
- Downsides are minor at this scale: mobile's dependency tree (React Native, Expo, native tooling) is large and unrelated to web/api's, but npm workspaces isolate `node_modules` resolution per-package well enough that this isn't a real problem. If the repo ever felt genuinely too heavy, splitting later is still possible — this isn't a one-way door.

### What mobile will *not* share with web

React Native does not render HTML/CSS or run in a browser DOM, so nothing UI-level is shared:
- No shared components (Tailwind classes, `<div>`-based components, react-leaflet — none of it works in React Native).
- No React Router (React Native uses a completely different navigation model — see §2).
- No shared build tooling (Vite is a web bundler; RN apps ship via Metro, Expo's bundler).

What **is** shared: `packages/shared`'s Zod schemas and TS types, and conceptually the API client pattern (though the actual HTTP client code will differ — see §5).

---

## 2. Tooling: Expo vs. bare React Native

**Decision: Expo (managed workflow), not bare React Native.**

You already know of both — here's the actual distinction, since "React Native" is the framework and "Expo" is a layer on top, not a competing choice:

- **React Native** is the core framework: JS/TS code that renders to real native UI components (not a WebView) on iOS and Android from one codebase.
- **Expo** is a toolchain and set of libraries built on top of React Native. "Bare React Native" means you configure the native iOS (Xcode/Swift) and Android (Gradle/Kotlin) projects yourself. Expo abstracts that away — you mostly never open Xcode or Android Studio for day-to-day work.

Why Expo, specifically for this project:

- **Zero native experience is the stated starting point.** Bare RN means learning Gradle and Xcode project internals *in addition to* React Native itself — that's two new skill trees at once. Expo removes the native-build-config layer so the learning surface is React Native itself, not native tooling.
- **Expo Go** lets you run the app on a real physical phone (iOS or Android) within seconds, no cables, no build step — install the Expo Go app from the App/Play Store, scan a QR code from your terminal, done. This is a genuinely fast feedback loop for learning.
- **Managed workflow today is not a dead end.** Modern Expo (SDK 50+, "Expo Prebuild" / continuous native generation) lets you eject into bare native code later if you ever need a native module Expo doesn't support — this used to be a real limitation years ago, it mostly isn't anymore. The vast majority of apps (camera, location, image picker, push notifications, secure storage — everything this app needs) has an official Expo library.
- **EAS (Expo Application Services)** — Expo's companion cloud service — handles cloud-based builds and app store submission without owning a Mac for iOS builds. Relevant for you specifically since app store submission is unfamiliar territory; see §6.
- Industry-relevant: Expo has become the de facto default for new React Native projects industry-wide, not a toy abstraction — this is a legitimate, current, professional skill to list on a CV, not a simplified-for-learning detour.

### Navigation

React Native has no DOM, so React Router doesn't apply. The standard library is **React Navigation** (or Expo Router, which is React Navigation under the hood with file-based routing, similar in spirit to Next.js's app router). Recommend **Expo Router** specifically — it mirrors the file-based routing mental model, and Expo's own docs and starter templates are built around it, so it's the path of least friction for a first project.

### Suggested initial dependency set

- `expo` + `expo-router` (app shell, navigation)
- `nativewind` — **confirmed 2026-08-10, used from the start rather than added later.** Worth being honest about the tradeoff being accepted: NativeWind only reuses Tailwind's *class-name syntax* — RN's underlying layout model is still fundamentally different from CSS (Flexbox-only, no grid, no cascade/inheritance for most properties, `View`/`Text`/`ScrollView` instead of `div`/`span`, every element defaults to `flex` layout) and has to be learned regardless of which styling API sits on top of it. NativeWind also adds one more moving part (a babel plugin + class-to-style compiler, with its own version-compatibility surface against new Expo SDK releases) on top of the newest, least-familiar part of the stack. The case for taking it on anyway: avoiding a mid-project migration (styling touches every screen, so switching later means rewriting everything already built) and one less unfamiliar syntax to context-switch into while everything else about RN is already new. Revisit only if NativeWind itself becomes a recurring source of confusing bugs — at that point plain `StyleSheet.create` is always available as a fallback for new components without needing to migrate what's already working.
- `@tanstack/react-query` (same library already used on web — data-fetching/caching patterns transfer directly)
- `react-hook-form` + `zod` (same as web, and directly reuses `packages/shared` schemas)
- `expo-secure-store` (secure token storage — see §5)
- `expo-image-picker` (camera/gallery access for item photos)

**Deferred, not needed for v1** (revised 2026-08-14 — see §7's location note): `react-native-maps` (interactive map picker) and `expo-location` (device GPS) were both in the original dependency list, but v1's location field is address-search-via-Nominatim only, matching desktop — a plain HTTP fetch, no native map or GPS library required. Add both back to this list whenever the v1.1 interactive map picker is actually scoped.

---

## 3. iOS vs. Android: parallel or sequential?

**Decision: build for both in parallel from day one — this is not extra work with Expo/RN, it's the default.**

This is the part most likely to be misunderstood coming from native-per-platform assumptions (Swift for iOS, Kotlin for Android as two separate codebases). With React Native, there is **one codebase** that renders to both platforms simultaneously. You are not choosing "iOS first, Android later" as a scoping decision the way you might sequence "web first, then mobile" — with RN, sequencing platforms would mean deliberately ignoring one target for a codebase that already runs on both.

What actually differs by platform:
- **Testing device access**: Expo Go runs on both iOS and Android phones/simulators equally. If you own an iPhone and an Android phone, test on both as you go — bugs occasionally are platform-specific (safe-area insets, back-button behavior on Android, permission prompt wording) and are easiest to catch immediately rather than in a batch at the end.
- **iOS builds require a Mac** for anything beyond Expo Go (i.e., for the final "real app" build/store submission) — Apple's tooling (Xcode) is Mac-only. Android builds have no such restriction. This affects §6 (deployment), not day-to-day development, since EAS Build (cloud) sidesteps needing a local Mac.
- **App store accounts cost differently**: Apple Developer Program is $99/year; Google Play Console is a one-time $25 fee. Relevant when you're ready to actually publish (§6), not for development.
- **Design conventions differ slightly** (iOS uses bottom tab bars + swipe-back gestures; Android has a hardware/gesture back button and different Material Design defaults) but Expo/React Navigation handle sensible per-platform defaults automatically — you don't hand-build two UIs.

**Practical recommendation**: develop against whichever physical device you personally own day-to-day (fastest feedback loop), but treat "does this work on the other platform too" as a recurring checkpoint (e.g. before ending each work session), not a separate future phase.

---

## 4. Development, debugging, and testing workflow

### Local development loop

1. `npx expo start` runs Metro (RN's bundler, conceptually parallel to Vite) and prints a QR code.
2. Scan it with the **Expo Go** app on a physical phone (same WiFi network) — the app loads over-the-air, no cable, no build.
3. **Fast Refresh** (RN's equivalent of Vite HMR) applies most JS edits live without losing component state.
4. Simulators/emulators (Xcode iOS Simulator on Mac; Android Studio's emulator, cross-platform) are the alternative to a physical device — useful for automated testing later, but for day-to-day early learning, a real device via Expo Go is simpler to set up and closer to reality (real touch input, real camera, real GPS).

### Debugging

- **React Native DevTools** (bundled with recent Expo/RN versions) gives Chrome/React-DevTools-style component inspection, console logs, and network request inspection — a direct equivalent of browser DevTools, launched from the terminal that's running `expo start`.
- **Error overlays**: RN shows a red full-screen error overlay with stack trace on uncaught JS errors during development — analogous to Vite's error overlay.
- Standard `console.log` debugging works and streams to the terminal running `expo start`, same as any Node process.

### Testing, professionally

Layered the same way the web app's Phase 7 test suite was likely structured (unit → integration → e2e), with RN-specific tools substituted:

- **Unit/component tests**: `jest` + `@testing-library/react-native` (the RN sibling of `@testing-library/react`, which is presumably what web already uses — same query-by-role philosophy, DOM assertions swapped for RN component-tree assertions).
- **E2E tests**: `Maestro` (recommended) or `Detour`/`Detox` — Maestro is the more modern, notably easier-to-adopt choice (YAML test flows, no native build step required to run tests against Expo Go), and is what most new RN projects reach for today over the older, native-build-dependent Detox.
- **Manual QA before any release build**: a basic device matrix worth keeping in mind — one recent iOS device, one recent Android device, one older/smaller-screen Android device if available (Android fragmentation is real; iOS far less so).

### CI

Given CI/CD is an explicit learning goal for this whole project ([[user_background]]): the same GitHub Actions setup already running for `apps/web`/`apps/api` extends naturally — add a job that runs `npm run lint`/`typecheck`/`test` scoped to `apps/mobile` on PRs. **EAS Build** can also run from GitHub Actions (`eas build` in a workflow step) to produce installable builds automatically, which is the mobile equivalent of Vercel's preview-per-PR — worth treating as a stretch goal once the core app works, not a day-one requirement.

---

## 5. The auth problem (read this before writing any mobile code)

This is the one architectural piece that must be decided before mobile work starts, because it changes the API, not just the client.

### The current mechanism

`apps/api/src/routes/auth.ts` sets an **httpOnly cookie** named `token` containing a JWT (`reply.setCookie('token', ...)`), with `sameSite: 'none'` and presumably `secure: true` in production (needed for a cross-origin cookie between the Vercel frontend and Render backend to be accepted by browsers at all). `apps/api/src/app.ts` registers `@fastify/cookie` and CORS with `credentials: true`. Every subsequent request relies on the browser automatically attaching that cookie.

### Why this doesn't work for React Native

React Native's `fetch` is not a browser. There is no cookie jar that automatically persists a `Set-Cookie` response header and reattaches it to future requests the way Safari/Chrome do. Some RN HTTP libraries *can* be configured with cookie-jar behavior via extra packages, but relying on that is fighting the platform rather than working with it — mobile apps overwhelmingly do not use cookie auth, for this exact reason.

### The decision — confirmed 2026-08-10: dual mechanism, not a replacement

Discussed and deliberately chosen over unifying on tokens for both platforms. The alternative (drop the cookie, put web on Bearer tokens too) was considered explicitly: it would mean one auth code path instead of two, but at the real cost of losing httpOnly's XSS protection on web (the token would have to live somewhere web JS can read — memory or `sessionStorage` — to attach it to requests), which was the whole reason `docs/PLANNING.md` §7 chose cookies originally. **Decided to keep web's existing security posture and only add what mobile actually needs**, accepting two code paths in `authenticate.ts` as a small, worthwhile cost.

Concretely:

- Keep the existing `/auth/login`, `/auth/register` etc. cookie-setting behavior untouched — the web app keeps working exactly as-is, same httpOnly cookie, same protection.
- Those same endpoints **additionally return the JWT in the JSON response body, but only when the request signals it's a mobile client** (e.g. a header like `X-Client: mobile`, or a body flag) — **not on every login unconditionally**. This matters: if the token were included in *every* login response regardless of caller, it would sit in a JS-readable variable on the web client too, even if the web code never stores it — a real "the boundary got softer" concern raised and worth avoiding outright rather than relying on "the web client just doesn't read that field." Gating it on an explicit client signal means a plain web login response never contains the token at all — the cookie remains the *only* thing web ever receives.
- The mobile app sends that signal on every login/register call, and stores the returned token in **`expo-secure-store`** (wraps iOS Keychain / Android Keystore — the native-secure equivalent of an httpOnly cookie; do *not* use plain `AsyncStorage` for a token, that's unencrypted).
- The mobile app attaches it manually on every subsequent request as `Authorization: Bearer <token>`, rather than relying on an automatic cookie jar (which React Native's `fetch` doesn't have).
- `apps/api/src/plugins/authenticate.ts` needs a small update to accept **either** the existing cookie **or** an `Authorization: Bearer` header — check header first, fall back to cookie (or vice versa), so one middleware serves both clients without duplicating route logic. This is the one deliberately-accepted "two paths" cost from the decision above — kept intentionally small (a single branch, not a duplicated auth system).

This is the standard, well-trodden pattern (cookie for browser clients, bearer token for native/API clients, same backend) — not a workaround specific to this project.

### Secondary implications

- **Token refresh / expiry — decided: re-login on expiry for v1, refresh tokens deferred.** Since mobile has no silent "browser resend the cookie" behavior, an expired token just means the app's next authenticated request fails — the app should catch that (a 401 response) and route the user back to the login screen, rather than showing a confusing generic error. **Flagged for later**: a real refresh-token flow (short-lived access token + longer-lived refresh token, silently re-issued) is the standard fix for this being annoying in practice, but is explicitly out of scope for v1 — matching this project's existing pattern of shipping the simple version first and coming back (e.g. email verification was deferred the same way in the original web MVP). Revisit once forced-re-login friction is actually felt, not preemptively.
- **Logout**: currently likely clears the cookie server-side (`reply.clearCookie`). Mobile logout is simpler — just delete the token from `expo-secure-store` client-side; no server round-trip is strictly required (though keeping the existing server endpoint for the web client is still correct).
- **CORS**: mobile apps don't send an `Origin` header the way browsers do, so `CORS_ORIGIN`/`credentials: true` config is a non-issue for the mobile client itself — this only continues to matter for the web client, unaffected by this change.

---

## 6. Hosting: reuse existing infrastructure?

**Decision: yes, entirely, with zero new backend infrastructure for v1.**

| Piece | Current (web) | Mobile |
|---|---|---|
| API | Render (Fastify) | **Same API, same Render deployment** — mobile is just another HTTP client hitting the same REST endpoints. No separate mobile backend. |
| Database | Supabase Postgres | **Unchanged** — mobile never talks to Postgres directly, only through the API, exactly like web does. |
| File storage | Supabase Storage | **Unchanged** — image upload flow is the same `multipart/form-data` POST to the API; Supabase Storage is invisible to the client either way. |
| Frontend hosting | Vercel | **Not applicable to mobile** — there is no "hosting" step for the app UI the way Vercel hosts static web assets. The mobile app *is* a downloadable binary; distribution is via app stores (or Expo's own channels — next row). |

### What's actually new: app distribution, not server hosting

This is the one genuinely new piece of infrastructure, and it's specific to mobile — it has no web equivalent to reuse:

- **EAS Build** (Expo's cloud build service): compiles the app into an installable `.ipa` (iOS) / `.apk`/`.aab` (Android) without needing local Xcode/Android Studio setup. Free tier exists with usage limits; paid tiers add priority/concurrency.
- **EAS Submit**: automates pushing a build to the Apple App Store / Google Play Console.
- **EAS Update** (OTA updates): pushes JS-only changes (not native code changes) directly to already-installed apps without an app-store review cycle — the closest mobile equivalent to Vercel's instant redeploys, though narrower in scope (native dependency changes still require a full store submission).
- **Store accounts**: Apple Developer Program ($99/yr), Google Play Console ($25 one-time) — only needed when you're ready to actually publish publicly, not for development or even for sharing a build with a few testers (TestFlight for iOS and Play Internal Testing for Android both allow limited-audience distribution without a public listing).

**Decided (2026-08-10): store publication is an explicit v1 goal**, targeted for right after the MVP (§9) is built and tested — not deferred indefinitely. Two things follow from that:

- **Enroll early, not at the finish line.** Apple Developer Program enrollment can take a few days (identity verification, occasionally longer for individual accounts), and it gates everything downstream (TestFlight, EAS Submit, App Store Connect app records). Recommendation: create both the Apple Developer and Google Play Console accounts once the MVP feature set (§9) is roughly mid-build and clearly heading toward "done soon" — not on day one (nothing to submit yet, and paid enrollment sitting idle isn't useful), but early enough that account approval isn't the thing blocking the actual release.
- **Store-readiness is part of the MVP checklist, not a separate later phase**: app icon, splash screen, a handful of real screenshots, a short store listing description, a privacy-policy URL (both stores require one — even a simple static page is enough, and Everly already has a Vercel-hosted web app that can host it as a route), and accurate permission-usage strings (iOS requires a human-readable reason string for camera/location/photo-library access — e.g. "Everly uses your camera to add photos to your items" — shown to the user in the permission prompt itself). Build these alongside the app rather than scrambling for them after the code is "done."
- Development still goes through Expo Go / EAS Build's free internal-distribution builds first, as before — store submission is the *last* step of the MVP, not the development method throughout.

---

## 7. The MVP: what's actually in v1

"Baby steps" scoped concretely, so the build order in the last section has a real target instead of an open-ended feature list. Cut against two questions: (a) does this prove a *new* piece of the RN/Expo learning surface, and (b) is it required for a genuinely usable, store-submittable app — not "nice to have."

**In scope for v1:**

- **Auth**: login + register + logout only. No forgot-password, no email verification, no in-app settings/profile editing on mobile v1 — those already exist on web, and re-implementing them is the least novel part of the mobile learning curve. (Users who need those flows can still use the web app; the accounts are shared, same backend.)
- **Items — read**: list view of the logged-in user's items (matches web's core screen), with basic category filter. Skip free-text search for v1 — it's an additive UX layer, not core.
- **Items — create**: add a new item with title, description, category, and a photo via `expo-image-picker` (camera or gallery). This is the single feature most worth building on mobile specifically, since camera-first item capture is where mobile genuinely beats web.
- **Items — update (partial)**: mark done / restore (the archive toggle) — small, high-value, low-complexity. Full edit-everything screen can wait.
- **Items — delete**: with the same confirm-dialog pattern as web.
- **Importance**: 1–5 dot selector on the item-edit screen, matching the existing `items.importance` API field. **Added to MVP scope 2026-08-14** (originally left undecided during initial planning) — small, self-contained, and reuses a field the API already has, so no backend change needed.
- **Location — decided 2026-08-14, revised from the original GPS-capture-only plan**: matches desktop exactly — a text field that searches/geocodes via Nominatim (the same service and behavior as web's `apps/web/src/lib/api/geocoding.ts`), not a GPS "use my current location" button. **Still explicitly excluding the interactive drag-to-place map** (`react-native-maps`) from v1 — the address-search field alone geocodes to coordinates on submit, without needing a map component rendered at all. This keeps the original reasoning intact (avoid `react-native-maps`, a heavier native-code-adjacent dependency, in the first milestone) while matching desktop's actual input pattern (search box, not device GPS) rather than the GPS-first approach originally assumed during planning before the real desktop behavior was cross-checked against the design mockups.
- **Notes field**: skip for v1 — it's a secondary field even on web (`ItemCard` doesn't show it), not worth mobile screen real estate this early.

**Explicitly out of scope for v1** (candidates for a v1.1 once the MVP is store-published and validated):

- Search (item list), the interactive map/location picker, grid view + sort menu, the archived-items filter switch, a dedicated categories management screen (list/add/edit/delete categories — mobile v1 only lets you *select* an existing category when creating/editing an item), in-app settings/password-change, forgot-password, email verification, push notifications, offline support, deep linking.

This keeps the MVP's novel-surface list focused: Expo Router navigation, bearer-token auth + secure storage, TanStack Query against the real API, and one real native-only capability (camera) — enough to be a genuine, complete "installed on my phone and useful" app without trying to port all of web's Phase 1–9 scope at once.

### Mockup-to-MVP mapping — reviewed 2026-08-14

Design mockups for mobile were reviewed at `../Everly bucket list app/` (one level above the repo root, same location as the existing desktop mockups referenced in `docs/PLANNING.md` §12): `Everly Mobile Auth.dc.html` (login/register/forgot/reset, iPhone-frame prototype) and `Everly Mobile.dc.html` (items list, item edit, categories management, category edit — all mobile-native layouts, not resized desktop). Also `everly-logo-dark.png` — the same logo asset, to be used first on mobile, then rolled out to desktop web too as a later, separate change.

The mockups define the **full eventual app**, broader than the MVP scoped above — expected, since they're the design source of truth for everything, not phase-scoped. Mapping what actually gets built in v1 vs. deferred to v1.1:

**Build for v1** (from `Everly Mobile Auth.dc.html`): login screen, register screen only. The other four auth views in that file's state machine (forgot password, reset-link-sent, set-new-password, password-updated) exist in the mockup but must not be wired up yet — no "Forgot password?" link target — since forgot/reset-password is explicitly out of MVP scope (§7).

**Build for v1** (from `Everly Mobile.dc.html`): items list in **list mode only** (no grid mode, no list/grid toggle, no sort menu); a simple category-chip filter row (not the full bottom-sheet filter modal with multi-select + archived switch); item create/edit screen with title, description, real photo picker (`expo-image-picker`, replacing the mockup's placeholder), category chips (select-only, populated from the API — no add/edit/delete of categories from mobile), importance dots (1–5), an address-search text field that geocodes via Nominatim (no map rendered — see §7's location note), and delete-when-editing; mark done / restore action on item cards; logout via the avatar menu.

**Deferred to v1.1** (present in the mockup, not built now): free-text search bar, grid view + sort menu, the filter modal's multi-select categories and "show archived" switch, infinite scroll, the entire categories management screen (list/add/edit/delete categories — mockup's dedicated `categories` screen and `categoryEdit` screen), the interactive tap-to-drop-pin map, forgot/reset-password (all four related auth views).

---

## 8. Feature-parity notes (web → mobile translation)

Not a full feature spec — just flagging where a web concept doesn't port 1:1 and needs a different implementation, so scoping doesn't assume a straight copy:

- **Maps**: the interactive drag-to-place map (`react-native-maps`) is deferred past v1 per §7 — only becomes relevant once that picker is built post-MVP.
- **Image upload**: `expo-image-picker` replaces the web `<input type="file">` / drag-drop. It gives camera **or** gallery choice natively — arguably a better UX than web here, worth leaning into (a phone's camera is a first-class input the web app never had). In scope for v1.
- **Location — revised 2026-08-14**: matches desktop, not the browser Geolocation API. The v1 item-edit screen has an address-search text field that calls Nominatim (the same free geocoding service web already uses, `apps/web/src/lib/api/geocoding.ts`) — a plain HTTP fetch, works unchanged from RN with no new library needed. `expo-location` (device GPS) is **not** used in v1 — that was the original plan during initial mobile scoping, revised once the desktop behavior was actually cross-checked against the design mockups and found to be search-based, not GPS-based.
- **Forms**: `react-hook-form` + `zod` work in RN, but form *inputs* differ — no native browser `<input>`/`<select>`; RN's `TextInput` and community picker components stand in.
- **Routing/deep links**: out of scope for v1 (§7) — the password-reset flow isn't in the mobile MVP at all, so this only becomes relevant in a later pass.
- **Auth**: see §5 — the biggest non-cosmetic difference.

---

## 9. Open questions — answered 2026-08-10

1. **Devices**: physical iPhones (iOS 14 through latest) available; no physical Android device. **Development/testing will lean on iOS via Expo Go** as the primary day-to-day loop, purely because that's what's on hand — this is a testing-convenience choice, not a build-order one (see the callout below; the RN codebase still targets both platforms from day one, per §3). Android will run only in the Android Studio emulator until/unless a physical device becomes available — worth knowing that emulator testing alone tends to miss real-device quirks (actual camera/GPS behavior, performance on lower-end hardware), so treat pre-store-submission Android testing as a real checklist item, not a formality.
2. **Scope for v1: small, real MVP — "baby steps."** Learning is the explicit primary goal here too, same as the rest of Everly. See §7 for the concrete MVP feature cut.
3. **Auth**: **accept forced re-login on token expiry for v1.** Refresh-token flow is explicitly deferred, not forgotten — tracked as a flagged follow-up in §5.
4. **Store publication is a real goal**, on this timeline: "as soon as the app is ready and tested." This changes §6/§8's framing — Apple Developer ($99/yr) and Google Play Console ($25 one-time) enrollment should happen early enough to not block the finish line (Apple's review/enrollment can take a few days), and store-readiness (icons, screenshots, privacy-policy links, permission-usage strings) belongs in the MVP checklist, not a someday-stretch section.

---

## Suggested build order

Revised against the answered questions above: iOS-first *testing* (not iOS-only development — §3's parallel-codebase point still holds), the §7 MVP cut, re-login-only auth, and store publication as a real near-term milestone rather than a stretch goal.

1. **Auth API changes** (§5) — additive bearer-token support in `apps/api`: login/register return the JWT in the response body alongside the existing cookie, `authenticate.ts` accepts either cookie or `Authorization: Bearer`. Testable via curl/Postman independent of mobile, before any mobile code exists.
2. **Expo project scaffold** — `apps/mobile`, Expo Router shell, NativeWind configured, `@everly/shared` wired in as a workspace dependency. Confirm it runs in Expo Go on a physical iPhone; sanity-check it also boots in the Android emulator before going further, so a platform-breaking mistake is caught on day one rather than at the end.
3. **Auth screens** — login/register/logout only (no forgot-password, no email verification — out of MVP scope per §7) against the real API, token stored in `expo-secure-store`, confirm a session persists across app restarts, and confirm an expired/invalid token correctly redirects to the login screen rather than erroring silently (this is the re-login-on-expiry behavior from §5/§9.3 — worth proving deliberately, not just assuming it works).
4. **Items list (read-only)** — logged-in user's items with basic category filter (no search — §7). First real data screen, proves TanStack Query + shared Zod schemas work end-to-end from RN.
5. **Item create** — title, description, category, importance dots, photo via `expo-image-picker`, address-search location field via Nominatim (no map picker — §7). The MVP's core "why build this on mobile" feature.
6. **Item update/delete (partial)** — mark done / restore toggle, delete with confirm dialog. Full multi-field edit screen is not required for v1 (§7).
7. **iPhone-driven manual QA pass** — since iOS is the primary device on hand, do a real device pass here across all iOS versions available (14 through latest) before moving to Android, catching real bugs while the feature set is still small.
8. **Android emulator pass** — same feature set, Android Studio emulator (no physical device available per §9.1). Flag anything that needs verification on a real Android device later, rather than assuming emulator parity is sufficient for store submission.
9. **Testing pass** — component tests + at least a smoke-level Maestro e2e flow (login → add item with photo → see it in list → mark done).
10. **CI** — extend existing GitHub Actions with a mobile lint/typecheck/test job.
11. **Store readiness + account enrollment** (§6) — app icon, splash screen, screenshots, privacy-policy page (hostable on the existing Vercel web app), permission-usage strings. Start Apple Developer + Google Play Console enrollment here, in parallel with step 12, since Apple's review can take days.
12. **Internal distribution build** — EAS Build, installed directly on your own iPhone(s) outside Expo Go, proving the real build pipeline before involving a store.
13. **Store submission** — EAS Submit to TestFlight/App Store and Play Console, once steps 11–12 are both done. First real milestone where "published on stores" (§9.4) is achieved.
14. **(Post-MVP, v1.1+)** — interactive map/location picker (`react-native-maps`), search, in-app settings, forgot-password + email verification, refresh-token auth, push notifications, offline support, deep linking.
