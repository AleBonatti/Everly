# Tasks: FutureList - Personal Wishlist App

**Input**: Design documents from `/specs/001-future-list-app/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md, quickstart.md

**Tests**: Per project constitution, NO automated tests will be created. All validation is manual through direct usage and visual feedback.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Project uses Next.js 15 App Router structure:
- **App routes**: `app/` directory
- **Components**: `components/` for shared UI, `features/*/components/` for feature-specific
- **Features**: `features/auth/`, `features/todos/`
- **Utilities**: `lib/` for shared logic
- **No test files**: Per constitution, no `*.test.*`, `*.spec.*`, or `__tests__/` directories

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Next.js project with Supabase, Tailwind, and core dependencies

- [X] T001 Initialize Next.js 15 project with TypeScript and pnpm
- [X] T002 [P] Configure Tailwind CSS 4 in tailwind.config.ts
- [X] T003 [P] Configure TypeScript in tsconfig.json
- [X] T004 [P] Configure ESLint in .eslintrc.json
- [X] T005 [P] Configure Prettier in .prettierrc
- [X] T006 [P] Create .env.example with Supabase placeholders
- [X] T007 Install dependencies: Supabase Client SDK, Lucide Icons, Framer Motion
- [X] T008 Create project directory structure per plan.md (app/, components/, features/, lib/)
- [X] T009 [P] Create README.md with setup instructions
- [X] T010 [P] Configure next.config.js for optimal performance

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T011 Set up Supabase project and note credentials (USER ACTION REQUIRED)
- [ ] T012 Create .env.local with Supabase URL and anon key (USER ACTION REQUIRED)
- [ ] T013 Apply database schema from contracts/supabase.sql to Supabase project (USER ACTION REQUIRED)
- [X] T014 Generate TypeScript types from Supabase schema in lib/supabase/types.ts
- [X] T015 [P] Create Supabase browser client in lib/supabase/client.ts
- [X] T016 [P] Create Supabase server client in lib/supabase/server.ts
- [X] T017 [P] Create shared utility functions in lib/utils.ts
- [X] T018 [P] Create LocalStorage utilities in lib/storage.ts
- [X] T019 [P] Create base UI components: Button in components/ui/Button.tsx
- [X] T020 [P] Create base UI components: Input in components/ui/Input.tsx
- [X] T021 [P] Create base UI components: Card in components/ui/Card.tsx
- [X] T022 [P] Create base UI components: Select in components/ui/Select.tsx
- [X] T023 [P] Create base UI components: Tag in components/ui/Tag.tsx
- [X] T024 [P] Create layout components: Header in components/layout/Header.tsx
- [X] T025 [P] Create layout components: Container in components/layout/Container.tsx
- [X] T026 Create root layout in app/layout.tsx with Tailwind imports and providers
- [X] T027 Create global styles in app/globals.css with Tailwind directives

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Item Capture (Priority: P1) 🎯 MVP

**Goal**: Enable users to add items with title and category in <10 seconds

**Independent Test**: Create an account, log in, add item with title "Watch Oppenheimer" and category "Movies", verify it appears within 1 second

### Implementation for User Story 1

- [ ] T028 [P] [US1] Create Item type interface in features/todos/types.ts
- [ ] T029 [P] [US1] Create Category type interface in features/todos/types.ts
- [ ] T030 [P] [US1] Create FilterState type interface in features/todos/types.ts
- [ ] T031 [US1] Create useTodos custom hook in features/todos/hooks/useTodos.ts with Supabase queries
- [ ] T032 [US1] Create useCategories custom hook in features/todos/hooks/useCategories.ts
- [ ] T033 [US1] Create server actions for item CRUD in features/todos/actions.ts
- [ ] T034 [US1] Create TodoForm component in features/todos/components/TodoForm.tsx (title + category inputs)
- [ ] T035 [US1] Create TodoItem component in features/todos/components/TodoItem.tsx (basic display)
- [ ] T036 [US1] Create TodoList component in features/todos/components/TodoList.tsx (render items)
- [ ] T037 [US1] Create todos page in app/(app)/todos/page.tsx with TodoList and TodoForm
- [ ] T038 [US1] Add form validation in TodoForm: require title (1-200 chars) and category
- [ ] T039 [US1] Add loading indicators and optimistic UI updates in TodoForm
- [ ] T040 [US1] Add error handling with helpful validation messages in TodoForm
- [ ] T041 [US1] Implement LocalStorage caching in lib/storage.ts for instant display
- [ ] T042 [US1] Style TodoForm and TodoList with Tailwind CSS (mobile-first)
- [ ] T043 [US1] Test responsive design on mobile (375px), tablet (768px), desktop (1280px)
- [ ] T044 [US1] Test touch targets ≥44px on mobile per NFR-007
- [ ] T045 [US1] Verify item appears within 1 second per acceptance scenario

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. This is the **MVP**!

---

## Phase 4: User Story 2 - Authentication & Privacy (Priority: P1)

**Goal**: Secure user authentication with email/password (6+ chars) and data isolation via RLS

**Independent Test**: Sign up with email/password, logout, login again, verify data persists and is private

### Implementation for User Story 2

- [ ] T046 [P] [US2] Create useAuth custom hook in features/auth/hooks/useAuth.ts with Supabase Auth
- [ ] T047 [P] [US2] Create auth server actions in features/auth/actions.ts (signup, login, logout)
- [ ] T048 [US2] Create LoginForm component in features/auth/components/LoginForm.tsx
- [ ] T049 [US2] Create SignupForm component in features/auth/components/SignupForm.tsx
- [ ] T050 [US2] Create login page in app/(auth)/login/page.tsx
- [ ] T051 [US2] Create signup page in app/(auth)/signup/page.tsx
- [ ] T052 [US2] Add email validation in LoginForm and SignupForm
- [ ] T053 [US2] Add password validation (minimum 6 characters) in SignupForm per clarification
- [ ] T054 [US2] Create authentication middleware to redirect unauthenticated users
- [ ] T055 [US2] Add auth state to root layout for protected routes
- [ ] T056 [US2] Create logout button in Header component
- [ ] T057 [US2] Test signup flow: create account, auto-login, redirect to /todos
- [ ] T058 [US2] Test login flow: enter credentials, redirect to /todos, see persisted data
- [ ] T059 [US2] Test logout flow: click logout, redirect to /login, clear session
- [ ] T060 [US2] Test password validation: <6 chars shows error, ≥6 chars succeeds
- [ ] T061 [US2] Test unauthenticated access: trying to access /todos redirects to /login
- [ ] T062 [US2] Verify RLS policies: user can only see their own data
- [ ] T063 [US2] Test cross-device sync: login on second device, see same items
- [ ] T064 [US2] Style auth forms with Tailwind CSS (centered, responsive)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Full MVP with authentication!

---

## Phase 5: User Story 3 - Filter & Search Items (Priority: P2)

**Goal**: Find items quickly using category filters and keyword search (case-insensitive, partial matching)

**Independent Test**: Create items in multiple categories, filter by "Movies", search for "sush", verify partial matching works

### Implementation for User Story 3

- [ ] T065 [P] [US3] Create useFilters custom hook in features/todos/hooks/useFilters.ts
- [ ] T066 [P] [US3] Create search/filter logic in lib/filters.ts (case-insensitive, partial matching)
- [ ] T067 [US3] Create CategoryFilter component in features/todos/components/CategoryFilter.tsx
- [ ] T068 [US3] Create SearchBar component in features/todos/components/SearchBar.tsx
- [ ] T069 [US3] Update TodoList to apply filters from useFilters hook
- [ ] T070 [US3] Add category filter dropdown to todos page
- [ ] T071 [US3] Add search input to todos page
- [ ] T072 [US3] Implement filter combination: category + search work together per clarification
- [ ] T073 [US3] Add "Clear filters" button to reset all filters
- [ ] T074 [US3] Test category filter: select "Movies", see only movie items
- [ ] T075 [US3] Test search: type "sushi", see case-insensitive results (matches "Sushi", "SUSHI")
- [ ] T076 [US3] Test partial matching: search "sush", matches "Sushi Restaurant Downtown"
- [ ] T077 [US3] Test combined filters: category "Restaurants" + search "italian" shows only matching items
- [ ] T078 [US3] Test clear filters: click clear, see all items sorted newest first
- [ ] T079 [US3] Verify search performance <1s for up to 500 items per NFR-003
- [ ] T080 [US3] Style filters with Tailwind CSS (inline, responsive)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Mark Items as Done (Priority: P2)

**Goal**: Toggle item status between todo/done with single action, visual distinction

**Independent Test**: Create items, mark as done, verify visual change (checkmark/strikethrough), toggle back to todo

### Implementation for User Story 4

- [ ] T081 [P] [US4] Create StatusFilter component in features/todos/components/StatusFilter.tsx
- [ ] T082 [US4] Add status toggle handler to useTodos hook
- [ ] T083 [US4] Update TodoItem component to show status toggle button (checkbox or button)
- [ ] T084 [US4] Add visual styling for "done" items in TodoItem (strikethrough, opacity, checkmark icon)
- [ ] T085 [US4] Add status filter to todos page (show all, todo only, done only)
- [ ] T086 [US4] Update filter combination to include status per clarification
- [ ] T087 [US4] Add Framer Motion animation for status toggle transition
- [ ] T088 [US4] Test status toggle: click button, item marked "done" with visual change
- [ ] T089 [US4] Test undo: click again, item reverts to "todo" status
- [ ] T090 [US4] Test status filter: select "todo only", see only incomplete items
- [ ] T091 [US4] Test status filter: select "done only", see only completed items
- [ ] T092 [US4] Test combined filters: category "Restaurants" + status "done" + search "italian"
- [ ] T093 [US4] Verify visual distinction is clear and accessible (not color-only per NFR-011)
- [ ] T094 [US4] Style status toggle with Tailwind CSS (≥44px tap target on mobile)

**Checkpoint**: All P1 and P2 user stories now complete and independently functional

---

## Phase 7: User Story 5 - Enrich Items with Details (Priority: P3)

**Goal**: Add optional fields (description, URL, location, note, priority, target date) to items

**Independent Test**: Create basic item, edit to add description and URL, verify fields save and display correctly

### Implementation for User Story 5

- [ ] T095 [US5] Update TodoForm to include optional fields: description, URL, location, note
- [ ] T096 [US5] Add priority selector (High/Medium/Low) to TodoForm per clarification
- [ ] T097 [US5] Add target date picker to TodoForm
- [ ] T098 [US5] Update TodoItem to display optional fields when present
- [ ] T099 [US5] Add expand/collapse UI in TodoItem for detailed view
- [ ] T100 [US5] Update server actions to handle optional field updates
- [ ] T101 [US5] Add validation: description ≤1000 chars, title ≤200 chars per FR-001/FR-002
- [ ] T102 [US5] Test adding optional fields: description, URL, location, note all save
- [ ] T103 [US5] Test priority: defaults to Medium, can select High or Low
- [ ] T104 [US5] Test items with/without optional fields display clearly
- [ ] T105 [US5] Style optional fields with Tailwind CSS (subtle, non-intrusive)

**Checkpoint**: User Story 5 complete and independently testable

---

## Phase 8: User Story 6 - Edit & Delete Items (Priority: P3)

**Goal**: Edit any item field and delete items with confirmation

**Independent Test**: Edit item title/category, verify changes save immediately; delete item, confirm dialog works

### Implementation for User Story 6

- [ ] T106 [US6] Add edit mode toggle to TodoItem component
- [ ] T107 [US6] Create edit form inline in TodoItem (reuse TodoForm fields)
- [ ] T108 [US6] Add delete button to TodoItem with confirmation dialog
- [ ] T109 [US6] Create confirmation modal/dialog component in components/ui/
- [ ] T110 [US6] Implement optimistic update for edit (instant UI change)
- [ ] T111 [US6] Implement soft delete with confirmation before permanent removal
- [ ] T112 [US6] Add cancel button for edit mode (reverts changes)
- [ ] T113 [US6] Test edit: change title/category, verify saves immediately per acceptance
- [ ] T114 [US6] Test delete: click delete, see confirmation prompt
- [ ] T115 [US6] Test delete cancel: click cancel in confirmation, item remains
- [ ] T116 [US6] Test delete confirm: click confirm, item permanently removed
- [ ] T117 [US6] Style edit/delete actions with Tailwind CSS (clear affordances)

**Checkpoint**: User Story 6 complete and independently testable

---

## Phase 9: User Story 7 - Manage Custom Categories (Priority: P3)

**Goal**: Create/delete custom categories beyond defaults (Movies, Restaurants, Trips, Books)

**Independent Test**: Create category "Podcasts", add items to it, filter by it, attempt to delete (blocked if items exist)

### Implementation for User Story 7

- [ ] T118 [US7] Create CategoryManager component in features/todos/components/CategoryManager.tsx
- [ ] T119 [US7] Add create category form with name input (1-50 chars)
- [ ] T120 [US7] Add category list with delete button (only for custom categories)
- [ ] T121 [US7] Implement case-insensitive duplicate check per FR-013
- [ ] T122 [US7] Implement delete protection: block if category has items per FR-011
- [ ] T123 [US7] Add server actions for create/delete categories
- [ ] T124 [US7] Update CategoryFilter to include custom categories
- [ ] T125 [US7] Test create custom category: enter "Podcasts", appears in category list
- [ ] T126 [US7] Test add items to custom category: works like default categories
- [ ] T127 [US7] Test filter by custom category: shows only items in that category
- [ ] T128 [US7] Test delete with items: shows error "must first move or delete items"
- [ ] T129 [US7] Test delete empty category: successfully removed from list
- [ ] T130 [US7] Test duplicate prevention: case-insensitive (cannot create "Movies" if "movies" exists)
- [ ] T131 [US7] Verify default categories (Movies, Restaurants, Trips, Books) created on signup
- [ ] T132 [US7] Style category manager with Tailwind CSS (modal or sidebar)

**Checkpoint**: All user stories (P1, P2, P3) now complete and independently functional

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T133 [P] Add empty state component when no items exist per edge case requirement
- [ ] T134 [P] Add loading skeleton components for better perceived performance
- [ ] T135 [P] Implement error boundary component for graceful error handling
- [ ] T136 [P] Add title truncation with ellipsis for long titles (show full on hover/tap)
- [ ] T137 [P] Add special character handling in search (Unicode, emoji, accents)
- [ ] T138 [P] Add loading indicators for slow network per edge case requirement
- [ ] T139 [P] Optimize database queries with proper indexing (verify from contracts/supabase.sql)
- [ ] T140 [P] Add keyboard navigation support for accessibility per NFR-009
- [ ] T141 [P] Add ARIA labels to all interactive elements per NFR-010
- [ ] T142 [P] Verify focus states visible on all inputs/buttons per NFR-009
- [ ] T143 Create favicon and app metadata in app/layout.tsx
- [ ] T144 Add password reset flow (forgot password link and reset page)
- [ ] T145 Implement proper error messages for network failures
- [ ] T146 Add animation transitions with Framer Motion (subtle, 200-300ms)
- [ ] T147 Performance testing: verify <1s page loads per performance goal
- [ ] T148 Performance testing: verify <100ms action feedback per NFR-001
- [ ] T149 Performance testing: verify <1s search results up to 500 items per NFR-003
- [ ] T150 Manual QA: Test all user stories on mobile (375px width)
- [ ] T151 Manual QA: Test all user stories on tablet (768px width)
- [ ] T152 Manual QA: Test all user stories on desktop (1280px width)
- [ ] T153 Manual QA: Test cross-browser (Chrome, Firefox, Safari)
- [ ] T154 Manual QA: Verify all touch targets ≥44px on mobile
- [ ] T155 Manual QA: Test with real devices (phone, tablet)
- [ ] T156 Manual QA: Test all edge cases from spec.md
- [ ] T157 Deploy to Vercel: connect GitHub repo and configure environment variables
- [ ] T158 Verify production deployment works correctly
- [ ] T159 Update README.md with usage instructions and screenshots
- [ ] T160 Run final manual testing checklist from quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed) or sequentially in priority order
  - P1 stories (US1, US2) should be completed first for MVP
  - P2 stories (US3, US4) add significant value
  - P3 stories (US5, US6, US7) are enhancements
- **Polish (Phase 10)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 data
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 data
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Extends US1 item creation
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Extends US1 item management
- **User Story 7 (P3)**: Can start after Foundational (Phase 2) - Extends US1 category system

### Within Each User Story

- Models/types before hooks
- Hooks before server actions
- Components after hooks available
- UI implementation after core logic
- Styling after functionality works
- Manual testing after feature complete

### Parallel Opportunities

- **Phase 1 (Setup)**: Most tasks marked [P] can run in parallel (configs, tooling setup)
- **Phase 2 (Foundational)**: All base components (T019-T025) can run in parallel, Supabase setup tasks can run in parallel after T013
- **User Stories**: All user stories can be worked on in parallel by different developers after Phase 2
- **Within User Stories**: Type definitions (T028-T030) can run in parallel, base components can run in parallel
- **Phase 10 (Polish)**: Most polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Phase 2 complete, launch all type definitions together:
Task: T028 [P] [US1] Create Item type interface in features/todos/types.ts
Task: T029 [P] [US1] Create Category type interface in features/todos/types.ts
Task: T030 [P] [US1] Create FilterState type interface in features/todos/types.ts

# Then hooks can be developed in parallel (after types exist):
Task: T031 [US1] Create useTodos custom hook (depends on Item type)
Task: T032 [US1] Create useCategories custom hook (depends on Category type)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Quick Item Capture)
4. Complete Phase 4: User Story 2 (Authentication & Privacy)
5. **STOP and VALIDATE**: Test US1 + US2 independently
6. Deploy MVP and gather feedback

**MVP Deliverable**: Users can sign up, log in, add items with title/category, see their list

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP Core!**
3. Add User Story 2 → Test independently → **MVP with Auth!**
4. Add User Story 3 (Filter/Search) → Test independently → Deploy
5. Add User Story 4 (Mark Done) → Test independently → Deploy
6. Add User Story 5 (Enrichment) → Test independently → Deploy
7. Add User Story 6 (Edit/Delete) → Test independently → Deploy
8. Add User Story 7 (Custom Categories) → Test independently → Deploy
9. Polish phase → Final QA → Production release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers (if applicable):

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Item Capture)
   - Developer B: User Story 2 (Authentication)
   - Developer C: User Story 3 (Filter/Search)
3. Stories complete and integrate independently

---

## Manual Testing Workflow (Per Constitution)

**NO AUTOMATED TESTS**: All testing is manual per Constitution Principle IV.

### Before Each Commit

1. **Happy path**: Test main user flow for affected story
2. **Error cases**: Try invalid inputs (empty title, no category, short password)
3. **Responsive**: Test mobile (375px), tablet (768px), desktop (1280px)
4. **Cross-browser**: Chrome, Firefox, Safari (if available)
5. **Performance**: Check page load <1s, interactions <100ms
6. **Edge cases**: Long titles, many items, special characters in search
7. **Accessibility**: Tab through UI, verify focus states visible

### Manual Testing Checklist (Final QA)

See `quickstart.md` for comprehensive manual testing checklist covering:
- Authentication flow (signup, login, logout, password validation)
- Item management (create, edit, delete, status toggle)
- Categories (default, custom, delete protection)
- Search & filter (case-insensitive, partial matching, combinations)
- Status tracking (todo/done visual distinction)
- Responsive design (mobile, tablet, desktop)
- Data persistence (cross-device sync)

**Testing Tools**:
- Browser DevTools (F12) for responsive testing
- Chrome DevTools Device Toolbar (Ctrl+Shift+M) for mobile simulation
- Real devices (phone, tablet) for final validation

---

## Task Summary

**Total Tasks**: 160
- **Phase 1 (Setup)**: 10 tasks
- **Phase 2 (Foundational)**: 17 tasks (BLOCKING)
- **Phase 3 (US1 - P1)**: 18 tasks 🎯 MVP Core
- **Phase 4 (US2 - P1)**: 19 tasks 🎯 MVP with Auth
- **Phase 5 (US3 - P2)**: 16 tasks
- **Phase 6 (US4 - P2)**: 14 tasks
- **Phase 7 (US5 - P3)**: 11 tasks
- **Phase 8 (US6 - P3)**: 12 tasks
- **Phase 9 (US7 - P3)**: 15 tasks
- **Phase 10 (Polish)**: 28 tasks

**Parallelizable Tasks**: 45 tasks marked with [P]

**User Story Breakdown**:
- US1 (Quick Item Capture - P1): 18 implementation tasks
- US2 (Authentication - P1): 19 implementation tasks
- US3 (Filter/Search - P2): 16 implementation tasks
- US4 (Mark Done - P2): 14 implementation tasks
- US5 (Enrichment - P3): 11 implementation tasks
- US6 (Edit/Delete - P3): 12 implementation tasks
- US7 (Custom Categories - P3): 15 implementation tasks

**Independent Test Criteria**:
- US1: Add item with title + category, appears within 1 second
- US2: Sign up, logout, login, data persists
- US3: Filter by category, search by keyword, partial matching works
- US4: Mark as done, visual distinction, toggle back to todo
- US5: Add optional fields, display correctly
- US6: Edit item, delete with confirmation
- US7: Create custom category, add items, delete protection works

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1) + Phase 4 (US2) = **37 tasks for core MVP**

---

## Format Validation

✅ **All tasks follow checklist format**:
- Checkbox: `- [ ]` at start
- Task ID: Sequential T001-T160
- [P] marker: 45 tasks marked as parallelizable
- [Story] label: All user story tasks labeled (US1-US7)
- File paths: Included in descriptions
- Clear actions: Each task describes specific work

✅ **Organization by user story**: Phases 3-9 each represent one user story with complete implementation
✅ **Independent testing**: Each story phase includes independent test criteria
✅ **No test files**: No automated test tasks per constitution
✅ **Executable**: Each task is specific enough to complete without additional context

