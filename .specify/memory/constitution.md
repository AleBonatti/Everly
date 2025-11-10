<!--
Sync Impact Report:
- Version: NEW → 1.0.0
- Initial constitution creation for SpecToDo project
- Principles defined:
  1. Clean Code → NEW
  2. Simple & Intuitive UX → NEW
  3. Fully Responsive Design → NEW
  4. Manual Testing Only → NEW
  5. Privacy Through Authentication → NEW
- Sections added:
  - Core Principles (5 principles)
  - Scope & Constraints
  - Team & Workflow
  - Governance
- Templates requiring updates:
  ✅ plan-template.md - Verified compatible (Constitution Check section present)
  ✅ spec-template.md - Verified compatible (user story structure aligns)
  ✅ tasks-template.md - Verified compatible (no test mandate, tests marked OPTIONAL)
  ✅ No command files exist yet to update
- Follow-up TODOs: None
-->

# SpecToDo Constitution

## Core Principles

### I. Clean Code

Code MUST prioritize readability, consistency, and maintainability above all else. Every line of code is read far more often than it is written.

**Rules**:
- Readable: Variable and function names must clearly express intent
- Consistent: Follow established patterns and conventions throughout the codebase
- Maintainable: Future changes should be straightforward; avoid clever tricks that obscure logic
- Self-documenting: Code structure and naming should minimize need for comments
- Simple: Prefer straightforward solutions over complex abstractions unless complexity is clearly justified

**Rationale**: Clean code reduces cognitive load, speeds up debugging, facilitates collaboration (including future-you), and makes the project sustainable long-term. For a solo developer project, clean code is an investment in your own productivity and sanity.

### II. Simple & Intuitive UX

User experience MUST minimize friction and cognitive load. Users should never wonder "what do I do next?" or "what does this mean?"

**Rules**:
- Minimal clicks: Every action should require the fewest possible steps
- Clear affordances: Interactive elements must look interactive; actions must have obvious outcomes
- Instant feedback: User actions must produce immediate, visible responses
- Forgiving: Support undo/redo; validate gently; guide users toward success rather than punishing mistakes
- Focused: Each screen/view should serve one primary purpose

**Rationale**: The app's value proposition is immediate capture of future activities. If the UX introduces friction, users will abandon the tool at the moment of inspiration. Simplicity and clarity directly serve the core mission of being delightful to use.

### III. Fully Responsive Design

The interface MUST adapt gracefully across mobile, tablet, and desktop viewports without compromising usability or aesthetics.

**Rules**:
- Mobile-first: Design for smallest screens first, then enhance for larger viewports
- Fluid layouts: Use relative units (%, em, rem, vw/vh) and flexible grids
- Touch-friendly: Tap targets must be ≥44px, gestures must be intuitive
- Consistent experience: Core functionality and information hierarchy must remain intact across all screen sizes
- Performance: Responsive images, lazy loading, and efficient CSS to maintain speed on all devices

**Rationale**: Users will capture ideas whenever and wherever inspiration strikes—on their phone during a walk, on a tablet while browsing, or on desktop during work. A truly responsive design ensures the app is always accessible and delightful, regardless of device.

### IV. Manual Testing Only (NON-NEGOTIABLE)

There will be NO automated testing of any kind—no unit tests, no integration tests, no end-to-end tests. Development relies exclusively on manual testing and visual feedback.

**Rules**:
- Manual verification: Every feature must be manually tested across key scenarios before commit
- Visual inspection: UI changes must be visually reviewed on multiple screen sizes
- No test frameworks: Do not install or configure testing libraries (Jest, Vitest, Playwright, Cypress, etc.)
- No test files: Do not create `*.test.*`, `*.spec.*`, or `__tests__/` directories
- Craftsmanship over automation: Trust developer judgment and tactile feedback over test suites

**Rationale**: This is a deliberate choice to keep the project lightweight, simple, and focused on craftsmanship. Automated testing adds setup overhead, maintenance burden, and cognitive complexity that outweigh benefits for a solo-developer personal project. Manual testing emphasizes usability, visual quality, and direct user empathy.

**Note to AI agents**: When generating task lists or implementation plans, do NOT include test-writing tasks. Skip test phases entirely. If a template suggests tests, remove or mark those sections as N/A.

### V. Privacy Through Authentication

User data MUST be private and secure. Every user must register and log in to access their personal lists and activities.

**Rules**:
- Authentication required: No anonymous access; users must create an account to use the app
- Secure storage: Passwords must be hashed (bcrypt, Argon2, or similar); never store plaintext credentials
- Session management: Implement secure, time-limited sessions with proper logout functionality
- Data isolation: Users can only access their own data; enforce authorization checks at the data layer
- No third-party tracking: Do not integrate analytics, advertising, or tracking pixels that compromise user privacy

**Rationale**: Personal wishlists and future plans are intimate. Authentication ensures data is private, synchronized across devices, and recoverable if a device is lost. This builds trust and aligns with the app's philosophy of being a safe, personal space.

## Scope & Constraints

### In Scope

- Create, edit, complete, and delete list items
- User registration, login, and logout
- Customizable categories (e.g., movies, restaurants, trips, books)
- Data persistence through a remote database (e.g., Supabase, Firebase, or similar)
- Responsive, lightweight, visually clean interface
- Cross-device synchronization via backend storage

### Out of Scope

- Automated testing (unit, integration, end-to-end)
- Social features (sharing, followers, public profiles)
- Third-party analytics or tracking tools
- Complex collaboration or multi-user workflows
- Native mobile apps (initial focus is web-based responsive design)
- Offline-first functionality (requires online connection for now)

### Constraints

- Solo-developer bandwidth: Features must be achievable by one person
- Manual testing only: No time allocated to writing or maintaining test suites
- Simplicity over features: When in doubt, prefer fewer features done excellently over many features done adequately
- Performance: App must feel fast and responsive; aim for <1s page loads, <100ms interaction feedback

## Team & Workflow

### Team

- **Alessandro Bonatti** — Creator & Developer

### Decision Process

- Solo-developer workflow with manual review of specifications before implementation
- Incremental commits with descriptive messages capturing the "why" behind changes
- Specifications stored in `/specs` folder and versioned through git

### Development Workflow

1. **Specify**: Write or update feature specification in `/specs/[feature-name]/spec.md`
2. **Plan**: Create implementation plan in `/specs/[feature-name]/plan.md`
3. **Build**: Implement feature incrementally with frequent manual testing
4. **Review**: Manually verify across devices and scenarios
5. **Commit**: Descriptive commit messages; reference spec/plan as needed
6. **Deploy**: Push to production when ready (manual deployment)

### Documentation

- Keep specifications up to date as source of truth
- Update README for setup and usage instructions
- Inline code comments only when logic is non-obvious

## Governance

### Constitution Supremacy

This constitution supersedes all other practices, templates, and guidelines. When in doubt, refer back to these principles.

### Amendment Process

1. Identify need for change (new principle, scope adjustment, workflow refinement)
2. Document proposed amendment with rationale
3. Update `.specify/memory/constitution.md` with new version number
4. Review all templates (plan, spec, tasks) for consistency
5. Commit amendment with descriptive message (e.g., `docs: amend constitution to v1.1.0 - add observability principle`)

### Versioning Policy

Constitution follows semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Backward-incompatible changes (principle removal, fundamental redefinition)
- **MINOR**: New principle added or material expansion of guidance
- **PATCH**: Clarifications, wording improvements, typo fixes

### Compliance Review

- Before starting a new feature, verify alignment with all five principles
- If a principle must be violated (e.g., complexity justified by real need), document the exception and rationale in the feature plan
- Regularly review codebase to ensure ongoing adherence (monthly or per major milestone)

### AI Agent Guidance

When AI agents (such as Claude Code) assist with this project:
- Always respect the **Manual Testing Only** principle—never generate test files or suggest test frameworks
- Prioritize **Clean Code**—suggest readable, maintainable solutions
- Keep **Simple & Intuitive UX** in mind when proposing UI changes
- Ensure **Fully Responsive Design**—consider mobile, tablet, and desktop contexts
- Respect **Privacy Through Authentication**—never suggest public/anonymous data access

---

**Version**: 1.0.0 | **Ratified**: 2025-11-06 | **Last Amended**: 2025-11-06
