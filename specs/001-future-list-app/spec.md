# Feature Specification: FutureList - Personal Wishlist App

**Feature Branch**: `001-future-list-app`
**Created**: 2025-11-06
**Status**: Draft
**Input**: User description: "Build a minimalist and delightful app to keep track of future activities, like watching a movie, trying a restaurant, or visiting a place — blending the immediacy of a to-do list with the spirit of a wishlist."

## Problem Statement

People need a lightweight, enjoyable way to keep track of things they want to do in the future—movies to watch, restaurants to try, places to visit, books to read. Traditional todo apps feel too task-centric and pressure-driven; note apps feel too unstructured and lack clear completion tracking. FutureList blends the clarity and satisfaction of todos with the inspiration and aspiration of a wishlist, creating a delightful space for capturing and completing future experiences.

## Target Users

- **Planners**: People who like to keep a tidy list of things to do or try in the future, organized by category
- **Explorers**: People who save ideas such as restaurants, movies, trips, or books they discover and want to remember
- **Collectors**: People who enjoy categorizing items and marking completion over time, finding satisfaction in tracking experiences

## Clarifications

### Session 2025-11-06

- Q: Should there be limits on the number of items or categories per user? → A: No hard limits - users can create unlimited items and categories
- Q: What priority values should be supported for items? → A: Three-level priority: High, Medium, Low (with default of Medium)
- Q: How should status filtering (todo/done) interact with category filters and search? → A: Status combines with all filters - category, search, and status can all be active simultaneously
- Q: What password strength requirements should be enforced during signup? → A: Minimal requirements - 6 characters minimum, no complexity rules
- Q: How should keyword search handle case sensitivity and partial matching? → A: Case-insensitive, partial matching (searching "sush" matches "Sushi", "sushirestaurant", "SUSHI")

## User Scenarios & Testing

### User Story 1 - Quick Item Capture (Priority: P1)

As a user, I want to quickly capture a future activity idea (like a movie recommendation or restaurant name) with minimal friction, so I don't lose the inspiration in the moment.

**Why this priority**: This is the core value proposition. If users can't easily add items when inspiration strikes, the entire app fails its primary purpose. This is the MVP foundation.

**Independent Test**: Can be fully tested by creating an account, logging in, and adding an item with just a title and category. Delivers immediate value by allowing users to start building their personal wishlist.

**Acceptance Scenarios**:

1. **Given** I am logged in and viewing my list, **When** I click the add button and enter a title "Watch Oppenheimer" and select category "Movies", **Then** the item appears in my list within 1 second
2. **Given** I am on mobile and viewing my list, **When** I tap add, enter a title, and select a category, **Then** the keyboard dismisses and the new item is visible without scrolling
3. **Given** I try to add an item without a title, **When** I attempt to save, **Then** I see a helpful message asking me to provide a title
4. **Given** I try to add an item without selecting a category, **When** I attempt to save, **Then** I see a helpful message asking me to select a category

---

### User Story 2 - Authentication & Privacy (Priority: P1)

As a user, I want to create an account and log in securely, so my personal wishlist is private and accessible only to me across all my devices.

**Why this priority**: Privacy is a core principle. Users need confidence that their personal future plans are secure. This must be in place from day one alongside item capture.

**Independent Test**: Can be fully tested by signing up with an email/password, logging out, logging back in, and verifying that data persists. Delivers value by ensuring privacy and cross-device sync.

**Acceptance Scenarios**:

1. **Given** I am a new user, **When** I enter a valid email and password (6+ characters) on the signup page, **Then** my account is created and I am logged in automatically
2. **Given** I have an account, **When** I log out and log back in with correct credentials, **Then** I see all my previously created items
3. **Given** I enter an invalid email format during signup, **When** I attempt to create an account, **Then** I see a clear validation message
4. **Given** I enter a password with fewer than 6 characters during signup, **When** I attempt to create an account, **Then** I see a validation message requiring at least 6 characters
5. **Given** I am logged in on one device and add items, **When** I log in on a second device, **Then** I see all my items synchronized
6. **Given** I am not logged in, **When** I try to access the main list view, **Then** I am redirected to the login page

---

### User Story 3 - Filter & Search Items (Priority: P2)

As a user, I want to filter my items by category and search by keyword, so I can quickly find specific items when I'm ready to act on them (e.g., looking for restaurant recommendations in my area).

**Why this priority**: Once users accumulate items, they need efficient ways to find them. This enhances usability but isn't required for the initial MVP to be valuable.

**Independent Test**: Can be fully tested by creating items across multiple categories, then using category filters and keyword search to locate specific items. Delivers value by making large lists manageable.

**Acceptance Scenarios**:

1. **Given** I have items in multiple categories, **When** I select the "Movies" filter, **Then** I see only items in the Movies category
2. **Given** I have 20 items in my list, **When** I type "sushi" in the search box, **Then** I see only items with "sushi" in the title or description (case-insensitive)
3. **Given** I have an item titled "Sushi Restaurant Downtown", **When** I search for "sush", **Then** the item appears in results (partial matching)
4. **Given** I am filtering by "Restaurants", **When** I search for "italian", **Then** I see only restaurants matching "italian"
5. **Given** I clear the search and filters, **When** I view my list, **Then** I see all items sorted by newest first

---

### User Story 4 - Mark Items as Done (Priority: P2)

As a user, I want to mark items as done (or undo them) with a single action, so I can track what I've completed and feel satisfaction from my progress.

**Why this priority**: Completion tracking differentiates this from a simple note-taking app. It's important for user satisfaction but can be added after basic capture and organization.

**Independent Test**: Can be fully tested by creating items, marking them as done, verifying visual distinction, and toggling back to todo. Delivers value by providing completion satisfaction.

**Acceptance Scenarios**:

1. **Given** I have an item marked as "todo", **When** I click/tap the completion button, **Then** the item is visually marked as done (e.g., checkmark, strikethrough, different styling)
2. **Given** I have an item marked as "done", **When** I click/tap it again, **Then** it reverts to "todo" status
3. **Given** I filter to show only "todo" items, **When** I view my list, **Then** I see only incomplete items
4. **Given** I filter to show only "done" items, **When** I view my list, **Then** I see only completed items
5. **Given** I am filtering by "Restaurants" category and search for "italian", **When** I also filter by "done" status, **Then** I see only completed Italian restaurant items

---

### User Story 5 - Enrich Items with Details (Priority: P3)

As a user, I want to optionally add details to items (description, URL, location, notes, priority, target date), so I can capture additional context when it's relevant without being forced to provide it upfront.

**Why this priority**: Optional enrichment adds depth without adding friction. Users can choose to add details when helpful. This is a nice-to-have enhancement.

**Independent Test**: Can be fully tested by creating a basic item, then editing it to add optional fields, and verifying the details display correctly. Delivers value by supporting richer item context.

**Acceptance Scenarios**:

1. **Given** I have created an item with just a title and category, **When** I edit the item and add a description, URL, and location, **Then** all fields are saved and displayed
2. **Given** I am adding a new restaurant item, **When** I optionally include a URL to the menu and a note about who recommended it, **Then** the item stores and displays this additional context
3. **Given** I have items with and without optional details, **When** I view my list, **Then** items display clearly whether or not optional fields are present

---

### User Story 6 - Edit & Delete Items (Priority: P3)

As a user, I want to edit existing items or delete items I no longer want, so I can keep my list accurate and relevant over time.

**Why this priority**: Essential for maintenance but not required for initial value. Users can start with create and complete, then add edit/delete later.

**Independent Test**: Can be fully tested by creating items, editing their titles/categories/details, and deleting items with confirmation. Delivers value by allowing list maintenance.

**Acceptance Scenarios**:

1. **Given** I have an item in my list, **When** I select edit and change the title or category, **Then** the changes are saved and reflected immediately
2. **Given** I want to remove an item, **When** I select delete, **Then** I see a confirmation prompt before the item is permanently removed
3. **Given** I accidentally select delete, **When** I cancel the confirmation, **Then** the item remains in my list

---

### User Story 7 - Manage Custom Categories (Priority: P3)

As a user, I want to create custom categories beyond the defaults (Movies, Restaurants, Trips, Books), so I can organize items in ways that match my personal interests (e.g., "Podcasts", "Events", "Recipes").

**Why this priority**: Custom categories provide personalization but aren't essential for MVP. Default categories serve most initial use cases.

**Independent Test**: Can be fully tested by creating a new custom category, adding items to it, filtering by it, and attempting to delete it (blocked if items exist). Delivers value by enabling personalization.

**Acceptance Scenarios**:

1. **Given** I want to track podcasts, **When** I create a new category "Podcasts", **Then** it appears in the category list for new items
2. **Given** I have created a custom category "Events", **When** I add items to it and filter by "Events", **Then** I see only items in that category
3. **Given** I have items in a custom category, **When** I try to delete that category, **Then** I see a message that I must first move or delete the items
4. **Given** I have an empty custom category, **When** I delete it, **Then** it is removed and no longer appears in the category list

---

### Edge Cases

- **Empty list state**: When a user logs in for the first time or has deleted all items, display a welcoming empty state with guidance on adding the first item
- **Very long item titles**: Titles exceeding reasonable display length should truncate gracefully with ellipsis and show full text on hover/tap
- **Special characters in search**: Search should handle special characters, punctuation, and Unicode (accents, emoji) correctly using case-insensitive partial matching
- **Slow network on mobile**: If network latency causes delays, provide visual feedback (loading indicators) and ensure operations queue properly without data loss
- **Category with many items**: When filtering a category with 100+ items, performance should remain responsive (<1s load time)
- **Password reset flow**: If a user forgets their password, they should be able to request a reset via email (industry-standard flow)
- **Concurrent edits**: If a user edits the same item on two devices simultaneously, last write wins (acceptable for single-user app)
- **Category name conflicts**: Prevent creating two categories with identical names (case-insensitive)
- **Large datasets**: With no hard limits on items/categories, system must maintain performance through database indexing and query optimization

## Requirements

### Functional Requirements

#### Item Management

- **FR-001**: System MUST allow authenticated users to create new items with a required title (1-200 characters) and required category
- **FR-002**: System MUST allow users to optionally add description (0-1000 characters), URL, location, note, priority (High/Medium/Low, defaults to Medium), and target date to items
- **FR-003**: System MUST validate that title and category are provided before saving an item
- **FR-004**: System MUST display items sorted by creation date (newest first) by default
- **FR-005**: System MUST allow users to edit any field of an existing item
- **FR-006**: System MUST allow users to delete items after confirming the action
- **FR-007**: System MUST allow users to toggle item status between "todo" and "done" with a single action
- **FR-008**: System MUST visually distinguish "done" items from "todo" items (e.g., checkmark, styling)

#### Category Management

- **FR-009**: System MUST provide default categories: Movies, Restaurants, Trips, Books
- **FR-010**: System MUST allow users to create custom categories with a unique name (1-50 characters)
- **FR-011**: System MUST prevent deletion of categories that contain items
- **FR-012**: System MUST allow deletion of empty custom categories
- **FR-013**: System MUST perform case-insensitive checks to prevent duplicate category names

#### Search & Filtering

- **FR-014**: System MUST allow users to filter items by a single category
- **FR-015**: System MUST allow users to search items by keyword using case-insensitive partial matching against title and description fields
- **FR-016**: System MUST support combined category filter and keyword search
- **FR-017**: System MUST allow users to filter items by status (todo/done) independently or combined with category and search filters
- **FR-018**: System MUST allow users to clear filters and return to full list view

#### Authentication & Privacy

- **FR-019**: System MUST require users to create an account before accessing any features
- **FR-020**: System MUST authenticate users via email and password
- **FR-021**: System MUST validate that passwords are at least 6 characters in length during account creation
- **FR-022**: System MUST hash passwords securely (bcrypt, Argon2, or equivalent) before storage
- **FR-023**: System MUST maintain secure session management with appropriate timeouts
- **FR-024**: System MUST allow users to log out, clearing their session
- **FR-025**: System MUST isolate user data so users can only access their own items and categories
- **FR-026**: System MUST prevent unauthenticated access to any item or category data
- **FR-027**: System MUST provide a password reset mechanism via email

#### Data Persistence

- **FR-028**: System MUST persist all user data (items, categories, user profile) to a remote database
- **FR-029**: System MUST synchronize data across multiple devices for the same user account
- **FR-030**: System MUST handle concurrent operations gracefully (last write wins for single-user context)

#### User Experience

- **FR-031**: System MUST provide clear, immediate feedback for all user actions (add, edit, delete, complete)
- **FR-032**: System MUST display helpful validation messages when required fields are missing or invalid
- **FR-033**: System MUST show a welcoming empty state when a user has no items
- **FR-034**: System MUST provide loading indicators during network operations

### Non-Functional Requirements

#### Performance

- **NFR-001**: Item creation, editing, and status toggle MUST provide feedback within 100ms of user action (perceived performance)
- **NFR-002**: Initial list load MUST complete within 2 seconds on standard broadband connection
- **NFR-003**: Search and filter operations MUST return results within 1 second for lists up to 500 items
- **NFR-004**: System MUST remain responsive on mobile devices with 3G connection speeds

#### Usability

- **NFR-005**: Interface MUST be understandable without instructions or tutorials
- **NFR-006**: Primary actions (add item, mark done) MUST be achievable within 3 taps/clicks
- **NFR-007**: All interactive elements MUST have minimum 44px touch targets on mobile
- **NFR-008**: Form validation messages MUST be actionable and non-technical

#### Accessibility

- **NFR-009**: All interactive elements MUST have visible focus states for keyboard navigation
- **NFR-010**: Form inputs MUST have semantic labels for screen readers
- **NFR-011**: Color MUST not be the only means of conveying information (e.g., done status)

#### Responsive Design

- **NFR-012**: Interface MUST adapt gracefully to mobile (320px+), tablet (768px+), and desktop (1024px+) viewports
- **NFR-013**: Mobile layout MUST prioritize single-column, thumb-friendly design
- **NFR-014**: Touch gestures (tap, scroll) MUST feel natural on mobile devices
- **NFR-015**: Text MUST remain readable without horizontal scrolling on all viewport sizes

#### Security & Privacy

- **NFR-016**: System MUST use HTTPS for all data transmission
- **NFR-017**: System MUST NOT include third-party analytics, tracking, or advertising scripts
- **NFR-018**: System MUST NOT expose user data through public endpoints or APIs
- **NFR-019**: Session tokens MUST expire after reasonable inactivity period (e.g., 30 days)

### Key Entities

- **User**: Represents an authenticated person with private access to their personal wishlist
  - Attributes: unique identifier, email address, hashed password, account creation timestamp, last updated timestamp
  - Relationships: Owns multiple Items and Categories

- **Item**: Represents a future activity or experience the user wants to remember and potentially complete
  - Required attributes: unique identifier, title, category reference, status (todo/done), creation timestamp, last updated timestamp, user reference (owner)
  - Optional attributes: description, URL, location, note, priority (High/Medium/Low, defaults to Medium if set), target date
  - Relationships: Belongs to one User, belongs to one Category

- **Category**: Represents a grouping mechanism for organizing items (e.g., Movies, Restaurants)
  - Attributes: unique identifier, name, type (default/custom), user reference (owner for custom categories)
  - Relationships: Belongs to one User (for custom categories), contains multiple Items

## Success Criteria

### Measurable Outcomes

- **SC-001**: New users can create an account, add their first item, and mark it as done within 3 minutes without instructions
- **SC-002**: Users can add an item with title and category in under 10 seconds from the moment they decide to capture an idea
- **SC-003**: Users can find a specific item using category filter or keyword search within 5 seconds
- **SC-004**: 90% of users successfully complete their primary task (add item, find item, mark done) on first attempt
- **SC-005**: Interface remains understandable and all core features remain usable on screen sizes from 320px to 2560px width
- **SC-006**: Mobile users can perform all actions comfortably with one hand (thumb-friendly design)
- **SC-007**: System handles 100 concurrent users without performance degradation
- **SC-008**: User data is accessible only to the authenticated owner (zero unauthorized data access incidents)

## Assumptions

- **User device assumptions**: Users have modern web browsers (released within last 2 years) with JavaScript enabled
- **Network assumptions**: Users have intermittent or better internet connectivity; offline mode is out of scope for v1
- **Authentication method**: Email/password authentication is sufficient; OAuth/SSO providers can be added later if needed
- **Data retention**: User data is retained indefinitely unless user deletes their account; no automatic data expiration
- **Database choice**: Remote database (e.g., Supabase, Firebase) provides authentication, data storage, and sync capabilities
- **Single-user context**: No collaboration or sharing features; each user's data is entirely independent
- **Testing approach**: Manual testing only; no automated test suites per project constitution
- **Localization**: English language only for v1; internationalization can be added later
- **Image attachments**: Not included in v1; items are text-based with optional URL links
- **Data volume**: No hard limits on number of items or categories per user; system relies on performance optimization and database indexing to handle large datasets efficiently

## Out of Scope (v1)

- Social features (sharing lists, following other users, public profiles)
- Collaboration (shared lists, inviting others to view/edit)
- Calendar integration or synchronization
- Reminders, notifications, or alerts
- External API integrations (e.g., pulling movie ratings, restaurant reviews)
- Native mobile apps (iOS/Android) - web-responsive only
- Offline-first functionality (requires online connection)
- Data export/import features
- Attachments or image uploads
- Third-party analytics or tracking tools
- Automated testing (unit, integration, end-to-end)
- Manual reordering or pinning of items
- Tagging system beyond categories

## Open Questions

*No critical clarifications needed at this stage. The following are enhancements for future consideration:*

- Should items support image attachments or remain text/URL-based?
- Should export/import features be added for data portability?
- Should users be able to manually reorder items or pin favorites?
