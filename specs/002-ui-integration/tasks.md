# Tasks: Complete UI Integration for FutureList

**Input**: Design documents from `/specs/002-ui-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Per project constitution, NO automated tests will be created. Manual testing only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

This is a Next.js 15 web application:
- Components: `components/ui/`
- Pages: `app/`
- Utilities: `lib/`
- Configuration: root directory (`tailwind.config.js`, `postcss.config.mjs`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, configure build tools, and set up design system foundation

- [ ] T001 Install required dependencies: `npm install lucide-react framer-motion clsx tailwind-merge`
- [ ] T002 [P] Install Tailwind CSS 4: `npm install -D tailwindcss@next @tailwindcss/postcss@next`
- [ ] T003 [P] Verify/update PostCSS configuration in postcss.config.mjs for Tailwind 4 compatibility
- [ ] T004 Configure Tailwind theme in tailwind.config.js (colors: slate/sky, spacing: 4/8/12/16, typography, max-width: 1024px, breakpoints)
- [ ] T005 [P] Create cn() utility function in lib/utils.ts using clsx and tailwind-merge
- [ ] T006 [P] Import Inter variable font in lib/fonts.ts using next/font/google
- [ ] T007 Update app/globals.css with Tailwind directives (@tailwind base, components, utilities) and custom focus ring utilities
- [ ] T008 Create components/ui/ directory for UI component library

**Checkpoint**: Build system and design tokens ready - component development can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI components and layout structure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until these foundational components exist

- [ ] T009 [P] Create Button component in components/ui/Button.tsx (variants: primary/secondary/ghost/danger, sizes: sm/md/lg, loading state, with TypeScript props from contracts/components.ts)
- [ ] T010 [P] Create Input component in components/ui/Input.tsx (label, error, helper text, focus states, with TypeScript props)
- [ ] T011 [P] Create Textarea component in components/ui/Textarea.tsx (similar to Input, auto-expand optional)
- [ ] T012 [P] Create Checkbox component in components/ui/Checkbox.tsx (with label, indeterminate state support)
- [ ] T013 [P] Create Toggle component in components/ui/Toggle.tsx (switch-style boolean toggle)
- [ ] T014 [P] Create Card component in components/ui/Card.tsx (generic container with border, shadow, padding variants)
- [ ] T015 [P] Create Loader component in components/ui/Loader.tsx (spinner variant with sizes, skeleton variant optional)
- [ ] T016 Create Modal component in components/ui/Modal.tsx (overlay, backdrop, AnimatePresence, close on escape/backdrop, focus trap, sizes: sm/md/lg, with TypeScript props)
- [ ] T017 [P] Create Dialog component in components/ui/Dialog.tsx (modal content wrapper with title, description, actions footer)
- [ ] T018 Update app/layout.tsx to apply Inter font, add root container structure, and prepare for top bar
- [ ] T019 [P] Create shared layout wrapper component (max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 pattern) if needed

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse and Manage Items with Polished Interface (Priority: P1) 🎯 MVP

**Goal**: Users can view, add, edit, delete, and filter their items through a clean, responsive interface with smooth animations

**Independent Test**: Log in, view items list with proper styling, add a new item via inline form, edit an item in modal, delete an item, toggle "Hide done", filter by single category, verify empty state displays when no items exist

### Implementation for User Story 1

- [ ] T020 [P] [US1] Create Select component in components/ui/Select.tsx (dropdown with options, placeholder, error state, keyboard navigation)
- [ ] T021 [P] [US1] Create CategoryPicker component in components/ui/CategoryPicker.tsx (single-select radio-style chips, active state visual feedback, maps to contracts/components.ts CategoryPickerProps)
- [ ] T022 [P] [US1] Create EmptyState component in components/ui/EmptyState.tsx (Lucide icon, title, description, optional action button, following design from data-model.md)
- [ ] T023 [P] [US1] Create ListItem component in components/ui/ListItem.tsx (item card showing title/category/done status, edit/delete/toggle-done action buttons with icons, hover states, TypeScript props from contracts/components.ts ListItemProps)
- [ ] T024 [US1] Update app/page.tsx - Part 1: Add top bar with app title "FutureList", user menu icon (Lucide User), logout button
- [ ] T025 [US1] Update app/page.tsx - Part 2: Implement inline "Add Item" form at top of list (title input, category picker, submit button, cancel/reset, validation feedback, loading state during submission)
- [ ] T026 [US1] Update app/page.tsx - Part 3: Implement item list rendering using ListItem components (responsive grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4)
- [ ] T027 [US1] Update app/page.tsx - Part 4: Add "Hide done" Toggle component above item list (state management, filter items, Framer Motion exit animation for hidden items)
- [ ] T028 [US1] Update app/page.tsx - Part 5: Add CategoryPicker for filtering (single selection, "All" option to clear filter, visual active state, filter items by selected category)
- [ ] T029 [US1] Update app/page.tsx - Part 6: Implement EmptyState display when no items exist (Lucide Inbox icon, encouraging message, "Add your first item" guidance)
- [ ] T030 [US1] Update app/page.tsx - Part 7: Implement edit item modal (use Modal + Dialog components, form with title/category/description/dueDate/notes fields, optional fields in collapsible section, save/cancel buttons, loading state, optimistic UI update with useOptimistic if applicable)
- [ ] T031 [US1] Update app/page.tsx - Part 8: Implement delete item functionality (confirmation dialog optional, delete button in ListItem, optimistic removal, error handling with user-friendly message)
- [ ] T032 [US1] Update app/page.tsx - Part 9: Add Framer Motion animations (fadeIn for page content, stagger for list items, exit animation for deleted/filtered items, layout animation for list reordering, respect prefers-reduced-motion)
- [ ] T033 [US1] Update app/page.tsx - Part 10: Handle edge cases (long item titles truncate with ellipsis, long category names wrap, 50+ items scroll smoothly, loading states for data fetching, error states display user-friendly messages)

**Checkpoint**: User Story 1 is fully functional and testable independently - MVP ready!

---

## Phase 4: User Story 2 - Seamless Authentication Experience (Priority: P2)

**Goal**: Users experience polished, accessible login and signup forms with clear validation feedback and loading states

**Independent Test**: Navigate to /auth/login, view styled form with clear labels, attempt invalid login (see error message), submit valid credentials (see loading indicator), navigate to signup page (consistent layout), tab through forms (focus states visible)

### Implementation for User Story 2

- [ ] T034 [P] [US2] Update app/auth/login/page.tsx - Part 1: Replace placeholder UI with styled form using Input and Button components (email field, password field, proper labels, spacing following design system)
- [ ] T035 [US2] Update app/auth/login/page.tsx - Part 2: Add form validation (client-side validation, error messages using Input error prop, prevent submission with invalid data, clear error messages)
- [ ] T036 [US2] Update app/auth/login/page.tsx - Part 3: Implement loading state using useFormStatus (disable button, show Loader component inside button, prevent double-submission)
- [ ] T037 [US2] Update app/auth/login/page.tsx - Part 4: Display user-friendly error messages for auth failures (invalid credentials, network errors, consistent error styling, no technical jargon)
- [ ] T038 [US2] Update app/auth/login/page.tsx - Part 5: Add "Sign up instead" link with consistent styling to /auth/signup
- [ ] T039 [US2] Update app/auth/login/page.tsx - Part 6: Ensure keyboard accessibility (tab order logical, Enter submits form, focus states visible with ring-2 ring-sky-500)
- [ ] T040 [US2] Update app/auth/login/page.tsx - Part 7: Add Framer Motion fade-in animation for page content (300ms duration, respect prefers-reduced-motion)
- [ ] T041 [P] [US2] Update app/auth/signup/page.tsx - Part 1: Replace placeholder UI with styled form using Input and Button components (email, password, confirm password fields, proper labels, consistent spacing)
- [ ] T042 [US2] Update app/auth/signup/page.tsx - Part 2: Add form validation (email format, password strength hint optional, password confirmation match, clear error messages)
- [ ] T043 [US2] Update app/auth/signup/page.tsx - Part 3: Implement loading state and error handling (same pattern as login page, useFormStatus, Loader component, user-friendly messages)
- [ ] T044 [US2] Update app/auth/signup/page.tsx - Part 4: Add "Log in instead" link to /auth/login, ensure keyboard accessibility, add fade-in animation
- [ ] T045 [US2] Verify consistent layout between login and signup pages (same container width, centering, padding, typography, visual hierarchy)

**Checkpoint**: User Story 2 complete - authentication UI is polished and accessible

---

## Phase 5: User Story 3 - Edit Items with Polished Form Experience (Priority: P2)

**Goal**: Users can edit item details through a well-organized modal form with optional fields in a collapsible section

**Independent Test**: From item list, click edit button on an item, modal opens with form containing all item fields, modify title/category/description/dueDate/notes, save changes (modal closes, item updates), cancel editing (modal closes, no changes), verify optional fields are in collapsible section

**Note**: This story builds on the edit modal created in User Story 1 (T030). Tasks here focus on refining the form experience.

### Implementation for User Story 3

- [ ] T046 [US3] Refine edit item modal form - Part 1: Ensure required fields (title, category) are prominently displayed at top of form with clear visual hierarchy
- [ ] T047 [US3] Refine edit item modal form - Part 2: Implement collapsible section for optional fields (description Textarea, dueDate Input type="date", notes Textarea) using details/summary or custom toggle (Lucide ChevronDown icon, smooth expand/collapse animation with Framer Motion)
- [ ] T048 [US3] Refine edit item modal form - Part 3: Add "Advanced" or "More details" label for collapsible section with clear affordance (icon rotation on expand, default to collapsed for new items, expanded if optional fields have values)
- [ ] T049 [US3] Refine edit item modal form - Part 4: Ensure CategoryPicker in modal has clear visual styling (consistent with filter chips, selected state obvious, keyboard navigable)
- [ ] T050 [US3] Refine edit item modal form - Part 5: Add form validation for edit modal (title required and non-empty, category required, date format validation if provided, character limits with counters optional)
- [ ] T051 [US3] Refine edit item modal form - Part 6: Implement optimistic UI update on save (item updates in list immediately, revert if server error, show success feedback briefly, modal closes smoothly with exit animation)
- [ ] T052 [US3] Refine edit item modal form - Part 7: Ensure modal close behavior is intuitive (Escape key closes, backdrop click closes optional, X button visible, "Cancel" button obvious, confirm unsaved changes optional)
- [ ] T053 [US3] Refine edit item modal form - Part 8: Verify edit modal works consistently for both add (new item) and edit (existing item) scenarios (form resets properly, initial values load correctly, validation consistent)

**Checkpoint**: User Story 3 complete - edit form experience is polished and intuitive

---

## Phase 6: User Story 4 - Account Management Interface (Priority: P3)

**Goal**: Users have access to a clean account settings page with logout functionality

**Independent Test**: Navigate to /account from user menu, view account page with clean layout, see logout button clearly labeled, click logout (session ends, redirect to login)

### Implementation for User Story 4

- [ ] T054 [US4] Update app/account/page.tsx - Part 1: Replace placeholder UI with Card component containing account information section (user email display, account created date optional, clean typography)
- [ ] T055 [US4] Update app/account/page.tsx - Part 2: Style layout with consistent container (max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8, proper spacing, centered content)
- [ ] T056 [US4] Update app/account/page.tsx - Part 3: Add logout Button with clear label "Log out" or "Sign out" (danger or secondary variant, Lucide LogOut icon optional, positioned consistently - bottom or top-right)
- [ ] T057 [US4] Update app/account/page.tsx - Part 4: Implement logout functionality (call Supabase signOut, handle loading state with Loader, redirect to /auth/login on success, error handling with user-friendly message)
- [ ] T058 [US4] Update app/account/page.tsx - Part 5: Add page title "Account Settings" or "My Account" with proper heading hierarchy (text-2xl font-semibold mb-6)
- [ ] T059 [US4] Update app/account/page.tsx - Part 6: Add Framer Motion fade-in animation for page content, ensure keyboard accessibility (logout button accessible via Tab)
- [ ] T060 [US4] Update top bar user menu in app/page.tsx (and other pages if applicable) to link to /account page (Lucide User icon, dropdown or direct link, consistent positioning)

**Checkpoint**: User Story 4 complete - account management is accessible and functional

---

## Phase 7: User Story 5 - Smooth Visual Transitions and Feedback (Priority: P3)

**Goal**: Subtle animations provide visual feedback and make the app feel responsive

**Independent Test**: Perform various actions (add item, delete item, navigate pages, open modal) and observe smooth animations (fade-in, slide, exit transitions), verify animations respect prefers-reduced-motion browser setting

**Note**: Many animations already implemented in previous stories. This phase adds polish and ensures consistency.

### Implementation for User Story 5

- [ ] T061 [US5] Audit all page transitions (home, auth, account) and ensure consistent Framer Motion fade-in animation (opacity 0→1, 300ms duration, ease-out timing)
- [ ] T062 [US5] Audit all modal/dialog appearances and ensure smooth entrance animation (scale 0.95→1 with opacity 0→1, 200ms duration, backdrop fade-in)
- [ ] T063 [US5] Ensure item addition to list has smooth fade-in animation (new item appears with opacity 0→1 and slight slide-up, 300ms, integrates into list layout smoothly)
- [ ] T064 [US5] Ensure item deletion has smooth exit animation (fade-out with slide-down or scale-down, 200ms, AnimatePresence handles removal, list items reflow smoothly with layout animation)
- [ ] T065 [US5] Implement stagger animation for initial item list load (items appear sequentially with 50ms delay between each, subtle and not distracting, skip if more than 20 items for performance)
- [ ] T066 [US5] Add micro-interactions to buttons (subtle scale 0.98 on press, 100ms, spring animation optional, enhances tactile feedback)
- [ ] T067 [US5] Ensure all animations respect prefers-reduced-motion media query (use Framer Motion's useReducedMotion hook or CSS @media (prefers-reduced-motion: reduce), fallback to instant transitions if motion disabled)
- [ ] T068 [US5] Test animations on various devices and browsers (Chrome, Firefox, Safari, Edge, mobile browsers, ensure 60fps performance, no jank, adjust durations if needed for perceived smoothness)
- [ ] T069 [US5] Document animation variants in app/globals.css or lib/animations.ts for consistency (fadeIn, slideIn, scaleIn, exitAnimation variants per data-model.md, reusable across components)

**Checkpoint**: User Story 5 complete - animations are polished, consistent, and performant

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, edge case handling, and validation across all user stories

- [ ] T070 [P] Verify all components use correct WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text/UI components, use browser DevTools contrast checker)
- [ ] T071 [P] Verify all interactive elements have visible focus states (ring-2 ring-offset-2 ring-sky-500 pattern, test with Tab navigation, ensure focus order is logical)
- [ ] T072 [P] Verify all touch targets are ≥44x44px (buttons, checkboxes, category chips, especially on mobile, use min-h-11 min-w-11 Tailwind classes)
- [ ] T073 Test responsive behavior at key breakpoints (320px, 375px, 640px, 768px, 1024px, 1440px using Chrome DevTools, ensure no horizontal scroll, text readable, layout doesn't break)
- [ ] T074 Test edge cases across all user stories (100+ items list performance, very long item title truncation, long category names wrapping, slow network with loading states, backend errors with user-friendly messages)
- [ ] T075 Verify Inter font loads correctly (check app/layout.tsx font application, CSS variable in globals.css, fallback to sans-serif, no FOUT/FOIT flash)
- [ ] T076 [P] Code cleanup and consistency pass (remove unused imports, consistent component export patterns, TypeScript strict mode compliance, ESLint warnings addressed)
- [ ] T077 [P] Accessibility audit with keyboard-only navigation (Tab through all pages, Enter/Space activate buttons, Escape closes modals, no keyboard traps, screen reader landmarks optional)
- [ ] T078 Performance check (Lighthouse audit, bundle size review, tree-shaking verification for lucide-react and framer-motion, lazy load heavy components if needed)
- [ ] T079 [P] Update quickstart.md with any new patterns or gotchas discovered during implementation
- [ ] T080 Manual testing checklist from plan.md - Execute all items (responsive, accessibility, interactions, animations, edge cases) and document results

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational (Phase 2) completion
  - User Story 1 (P1) can start after Foundational
  - User Story 2 (P2) can start after Foundational - independent of US1
  - User Story 3 (P2) depends on User Story 1 T030 (edit modal base)
  - User Story 4 (P3) can start after Foundational - independent of US1/US2/US3
  - User Story 5 (P3) should start after US1-US4 are mostly complete (adds polish to existing features)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P2)**: Depends on User Story 1 T030 (edit modal already created in US1, US3 refines it)
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2/US3
- **User Story 5 (P3)**: Should start after US1-US4 mostly complete - Adds animations to existing features

### Within Each User Story

- Tasks marked [P] can run in parallel if working on different files
- Sequential tasks within a story follow logical implementation order (components before pages, basic functionality before polish)
- Each story should reach its checkpoint before moving to next priority

### Parallel Opportunities

- **Phase 1 Setup**: T001, T002, T003 can run in parallel (different operations), T005, T006, T007 can run in parallel
- **Phase 2 Foundational**: T009-T017 can all run in parallel (different component files), T018-T019 sequential with T009-T017
- **User Story 1**: T020-T023 can run in parallel (different component files), then T024-T033 are mostly sequential (same file app/page.tsx)
- **User Story 2**: T034-T040 (login page) and T041-T044 (signup page) can run in parallel (different files), final T045 verification after both complete
- **User Story 3**: T046-T053 are sequential refinements to same modal (app/page.tsx)
- **User Story 4**: T054-T059 are mostly sequential (same file app/account/page.tsx), T060 independent
- **User Story 5**: T061-T069 are mostly sequential audits and refinements across multiple files
- **Phase 8 Polish**: T070-T072, T076-T077, T079 can run in parallel (different concerns), others sequential

---

## Parallel Example: User Story 1 Component Creation

```bash
# Launch all component creation tasks for User Story 1 together:
Task T020: "Create Select component in components/ui/Select.tsx"
Task T021: "Create CategoryPicker component in components/ui/CategoryPicker.tsx"
Task T022: "Create EmptyState component in components/ui/EmptyState.tsx"
Task T023: "Create ListItem component in components/ui/ListItem.tsx"

# Then proceed with app/page.tsx updates sequentially (T024-T033)
```

## Parallel Example: User Story 2 Page Styling

```bash
# Work on login and signup pages in parallel:
Task T034-T040: "Update app/auth/login/page.tsx (all parts)"
Task T041-T044: "Update app/auth/signup/page.tsx (all parts)"

# Then verify consistency (T045)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T019) - CRITICAL
3. Complete Phase 3: User Story 1 (T020-T033)
4. **STOP and VALIDATE**: Manually test User Story 1 independently per acceptance scenarios
5. Deploy/demo if ready - this is the MVP!

### Incremental Delivery

1. **Foundation** (Phases 1-2): Setup + Foundational → Build system and core components ready
2. **MVP** (Phase 3): User Story 1 → Test independently → Deploy/Demo (core item management works!)
3. **Auth Polish** (Phase 4): User Story 2 → Test independently → Deploy/Demo (authentication experience improved)
4. **Edit Refinement** (Phase 5): User Story 3 → Test independently → Deploy/Demo (editing experience polished)
5. **Account** (Phase 6): User Story 4 → Test independently → Deploy/Demo (account management added)
6. **Animations** (Phase 7): User Story 5 → Test independently → Deploy/Demo (app feels responsive)
7. **Final Polish** (Phase 8): Polish & Cross-Cutting → Deploy final production-ready version

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (Phases 1-2)
2. Once Foundational is done:
   - Developer A: User Story 1 (Phase 3) - Core MVP
   - Developer B: User Story 2 (Phase 4) - Auth pages (independent)
   - Developer C: User Story 4 (Phase 6) - Account page (independent)
3. After User Story 1 completes:
   - Developer A moves to User Story 3 (Phase 5) - Edit modal refinement (depends on US1)
4. After US1-US4 mostly complete:
   - Developer A or B: User Story 5 (Phase 7) - Animation polish
5. Team reconvenes for Phase 8 - Polish & Cross-Cutting

---

## Manual Testing Checklist

Per project constitution (Manual Testing Only), execute these manual tests after implementation:

### Responsive Testing
- [ ] Test on Chrome DevTools device emulator: 320px, 375px, 768px, 1024px, 1440px
- [ ] Test on real mobile device (iOS or Android)
- [ ] Test on tablet (iPad or Android tablet)
- [ ] Verify all touch targets ≥44px
- [ ] Verify text remains readable at all sizes
- [ ] Verify no horizontal scroll at any breakpoint
- [ ] Verify layout doesn't break on extreme zoom (200%)

### Accessibility Testing
- [ ] Navigate entire app using only keyboard (Tab, Enter, Space, Escape)
- [ ] Verify focus indicators visible on all interactive elements
- [ ] Use browser contrast checker on all text elements (WCAG AA: 4.5:1)
- [ ] Test with browser zoom at 200%
- [ ] Verify forms provide helpful error messages
- [ ] Verify logical tab order throughout app
- [ ] Verify modals can be closed with Escape key

### User Story 1: Item Management
- [ ] View items list with proper styling and spacing
- [ ] Add new item via inline form (success scenario)
- [ ] Add new item with validation error (missing title)
- [ ] Edit item via modal (open, modify, save, verify update)
- [ ] Edit item via modal (open, modify, cancel, verify no update)
- [ ] Delete item (verify removal with animation)
- [ ] Toggle "Hide done" (completed items disappear smoothly)
- [ ] Filter by category (single selection, clear active state)
- [ ] Clear category filter (show all items)
- [ ] View empty state when no items exist
- [ ] Verify long item title truncates with ellipsis
- [ ] Verify long category name wraps or truncates
- [ ] Scroll through 50+ items list smoothly

### User Story 2: Authentication
- [ ] Navigate to /auth/login (styled form displays)
- [ ] Submit login with empty fields (validation errors display)
- [ ] Submit login with invalid credentials (error message displays, user-friendly)
- [ ] Submit login with valid credentials (loading indicator shows, redirect on success)
- [ ] Navigate between login and signup (consistent layout, smooth transition)
- [ ] Tab through auth forms (focus states visible, logical order)
- [ ] Test signup validation (email format, password confirmation)
- [ ] Test network error handling (disconnect, submit, observe error)

### User Story 3: Edit Form
- [ ] Open edit modal for existing item (all fields populate correctly)
- [ ] Verify required fields at top (title, category)
- [ ] Expand optional fields section (description, due date, notes)
- [ ] Collapse optional fields section (smooth animation)
- [ ] Modify only title, save (verify update)
- [ ] Modify optional field, save (verify update)
- [ ] Leave required field empty, save (validation error displays)
- [ ] Close modal with Escape key
- [ ] Close modal with backdrop click (optional, depends on implementation)
- [ ] Close modal with Cancel button

### User Story 4: Account
- [ ] Navigate to /account from user menu
- [ ] Verify account information displays (email, etc.)
- [ ] Click logout button (loading state shows)
- [ ] Verify logout completes (redirect to /auth/login)
- [ ] Verify logout button accessible via keyboard (Tab, Enter)

### User Story 5: Animations
- [ ] Observe page transition fade-in (home, auth, account)
- [ ] Observe modal entrance animation (scale + fade)
- [ ] Observe item add animation (fade-in to list)
- [ ] Observe item delete animation (fade-out from list)
- [ ] Observe list reflow after filter/delete (smooth layout shift)
- [ ] Enable browser prefers-reduced-motion (verify animations disabled or instant)
- [ ] Verify button press micro-interactions (subtle scale on click)
- [ ] Verify animations run at 60fps (use browser Performance tab, no jank)

### Edge Cases
- [ ] Test with 100+ items (list remains performant)
- [ ] Test with very long item title (truncates properly)
- [ ] Test with very long category name (wraps or truncates)
- [ ] Test on 320px width screen (smallest mobile, layout usable)
- [ ] Test slow network (loading states appear within 100ms)
- [ ] Test backend error (user-friendly message displays, no crash)
- [ ] Test rapid clicking (buttons disable during loading, no duplicate requests)

### Cross-Browser Testing
- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Safari (latest) - especially for Inter font rendering
- [ ] Test on Edge (latest)
- [ ] Test on mobile Safari (iOS)
- [ ] Test on mobile Chrome (Android)

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group of tasks
- Stop at any checkpoint to validate story independently
- **No automated tests** per project constitution - manual testing only
- Reference `research.md` for implementation patterns
- Reference `data-model.md` for component prop interfaces
- Reference `contracts/` for TypeScript type definitions
- Reference `quickstart.md` for usage examples and common patterns
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

**Total Tasks**: 80
- Phase 1 Setup: 8 tasks
- Phase 2 Foundational: 11 tasks
- Phase 3 User Story 1 (P1 - MVP): 14 tasks
- Phase 4 User Story 2 (P2): 12 tasks
- Phase 5 User Story 3 (P2): 8 tasks
- Phase 6 User Story 4 (P3): 7 tasks
- Phase 7 User Story 5 (P3): 9 tasks
- Phase 8 Polish: 11 tasks

**Parallel Opportunities**: 30+ tasks marked [P] can run in parallel within their phases

**Independent Stories**:
- US1 (MVP) - fully independent after Foundational
- US2 (Auth) - fully independent after Foundational
- US4 (Account) - fully independent after Foundational
- US3 (Edit) - depends on US1 T030 (edit modal base)
- US5 (Animations) - should follow US1-US4 completion

**Suggested MVP Scope**: Phases 1-3 (Setup + Foundational + User Story 1) = 33 tasks

**Estimated Effort**: 8-12 hours for MVP, 16-20 hours for full implementation (1-3 days for solo developer)
