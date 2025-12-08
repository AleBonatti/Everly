# Tasks: AI Personal Assistant for Life Wishlist

**Input**: Design documents from `/specs/001-ai-assistant/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Per Constitution Principle IV (Manual Testing Only), this task list includes NO automated test tasks. All testing will be performed manually according to quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This project uses Next.js App Router structure:
- `lib/` for business logic and utilities
- `components/` for React components
- `app/` for pages and API routes
- `types/` for TypeScript definitions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize directory structure and TypeScript interfaces

- [ ] T001 Create `lib/ai/` directory for AI assistant logic
- [ ] T002 Create `lib/utils/` directory if not exists for utility functions
- [ ] T003 Create `types/ai.ts` file for conversation entity interfaces
- [ ] T004 [P] Define Message interface in `types/ai.ts` (id, role, content, toolInvocations, timestamp)
- [ ] T005 [P] Define ToolInvocation interface in `types/ai.ts` (toolCallId, toolName, args, result)
- [ ] T006 [P] Define ToolResult interface in `types/ai.ts` (success, data, message, error)
- [ ] T007 [P] Define ConversationState interface in `types/ai.ts` (messages, isStreaming, input, error)
- [ ] T008 [P] Define hook return type UseAIAssistantReturn in `types/ai.ts`
- [ ] T009 [P] Define component props interfaces in `types/ai.ts` (AIAssistantModalProps, MessageBubbleProps)
- [ ] T010 Verify `OPENAI_API_KEY` environment variable is configured in `.env.local`

**Checkpoint**: TypeScript interfaces ready, directory structure created

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core AI infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T011 Create `lib/ai/prompt.ts` and define SYSTEM_PROMPT constant with assistant instructions
- [ ] T012 Create `lib/ai/categories.ts` with `getAvailableCategories()` function to fetch categories from Supabase
- [ ] T013 Create `app/api/ai/chat/route.ts` file with basic POST handler structure
- [ ] T014 Implement streaming endpoint in `app/api/ai/chat/route.ts` using AI SDK `streamText` API
- [ ] T015 Configure AI SDK with OpenAI model and system prompt in `app/api/ai/chat/route.ts`
- [ ] T016 Add authentication check to `app/api/ai/chat/route.ts` using Supabase session
- [ ] T017 Add error handling and validation to `app/api/ai/chat/route.ts` for request body

**Checkpoint**: Foundation ready - streaming endpoint functional, user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add Items via Natural Language (Priority: P1) 🎯 MVP

**Goal**: Enable users to add wishlist items using conversational language through the AI assistant modal

**Independent Test**: Open AI assistant modal, type "I want to watch Dune: Part Two when it's on streaming", verify item appears in main wishlist with correct category and title

### Backend Implementation for User Story 1

- [ ] T018 [P] [US1] Create `lib/ai/tools.ts` file with addItemTool definition using AI SDK `tool()` function
- [ ] T019 [US1] Implement addItemTool parameters schema in `lib/ai/tools.ts` using Zod (title, categoryId, description, location, url, targetDate, priority, note)
- [ ] T020 [US1] Implement addItemTool execute function in `lib/ai/tools.ts` that calls existing `createNewItem` service
- [ ] T021 [US1] Add tool result formatting in addItemTool execute function (success, data with itemId, message)
- [ ] T022 [US1] Add error handling in addItemTool execute function with user-friendly messages
- [ ] T023 [US1] Register addItemTool in `app/api/ai/chat/route.ts` tools configuration

### Frontend Components for User Story 1

- [ ] T024 [P] [US1] Create `components/ui/MessageBubble.tsx` component with role, content, timestamp props
- [ ] T025 [P] [US1] Style MessageBubble component with different styles for user/assistant roles (chat bubbles, colors)
- [ ] T026 [P] [US1] Add timestamp display to MessageBubble component
- [ ] T027 [US1] Create `lib/hooks/useAIAssistant.ts` custom hook using AI SDK `useChat` hook
- [ ] T028 [US1] Implement conversation state management in useAIAssistant hook (messages, input, isStreaming)
- [ ] T029 [US1] Implement sendMessage function in useAIAssistant hook
- [ ] T030 [US1] Implement clearMessages function in useAIAssistant hook
- [ ] T031 [US1] Add error handling state and callbacks in useAIAssistant hook
- [ ] T032 [US1] Create `components/features/AIAssistantModal.tsx` component wrapping existing Modal component
- [ ] T033 [US1] Implement conversation display area in AIAssistantModal (scrollable message list)
- [ ] T034 [US1] Implement input form in AIAssistantModal with text input and send button
- [ ] T035 [US1] Connect useAIAssistant hook to AIAssistantModal component
- [ ] T036 [US1] Add loading indicator in AIAssistantModal for streaming responses
- [ ] T037 [US1] Implement modal close handler that clears conversation state
- [ ] T038 [US1] Add `onItemAdded` callback prop to AIAssistantModal for refreshing main list

### UI Integration for User Story 1

- [ ] T039 [P] [US1] Create `components/features/AIAssistantButton.tsx` component with Bot icon
- [ ] T040 [US1] Modify `components/features/ItemFilters.tsx` to add AIAssistantButton left of sort filter
- [ ] T041 [US1] Add AIAssistantButton onClick prop that triggers modal open
- [ ] T042 [US1] Modify `app/page.tsx` to add isAIModalOpen state
- [ ] T043 [US1] Add AIAssistantModal to `app/page.tsx` with open, onClose, onItemAdded props
- [ ] T044 [US1] Connect onItemAdded callback to existing `refresh` function in `app/page.tsx`

**Checkpoint**: User Story 1 complete - Users can add items via natural language, items appear in main list, modal opens/closes cleanly

**Manual Testing Checklist for US1** (per quickstart.md):
1. Click AI Assistant button → Modal opens
2. Type "I want to watch The Matrix" → Verify item created in database
3. Verify item appears in main list with correct category (Watch)
4. Close modal → Verify conversation cleared
5. Reopen modal → Verify fresh conversation
6. Test insufficient info: "I want to watch that new movie" → Verify clarification requested
7. Test with location: "Visit the Louvre in Paris" → Verify location extracted
8. Test responsive design on mobile, tablet, desktop

---

## Phase 4: User Story 2 - Query Wishlist Items (Priority: P2)

**Goal**: Enable users to query and review their wishlist items using conversational questions

**Independent Test**: Add several items across categories, open AI assistant, ask "What movies do I want to watch?", verify relevant items displayed in organized format

### Backend Implementation for User Story 2

- [ ] T045 [P] [US2] Add listItemsTool definition to `lib/ai/tools.ts` using AI SDK `tool()` function
- [ ] T046 [US2] Implement listItemsTool parameters schema in `lib/ai/tools.ts` using Zod (categoryId optional, status optional, query optional, limit optional)
- [ ] T047 [US2] Implement listItemsTool execute function in `lib/ai/tools.ts` that fetches user items from Supabase
- [ ] T048 [US2] Add filtering logic in listItemsTool for category, status, and text query
- [ ] T049 [US2] Format listItemsTool result with items array, count, and filteredBy description
- [ ] T050 [US2] Handle empty results in listItemsTool with friendly message
- [ ] T051 [US2] Register listItemsTool in `app/api/ai/chat/route.ts` tools configuration

### Frontend Enhancements for User Story 2

- [ ] T052 [US2] Enhance MessageBubble component in `components/ui/MessageBubble.tsx` to detect tool invocations
- [ ] T053 [US2] Add list rendering in MessageBubble for listItems tool results (formatted item list with titles and categories)
- [ ] T054 [US2] Style item list display in MessageBubble with proper spacing and visual hierarchy
- [ ] T055 [US2] Add empty state message rendering for zero results in MessageBubble

**Checkpoint**: User Story 2 complete - Users can query items conversationally, results displayed in organized format

**Manual Testing Checklist for US2** (per quickstart.md):
1. Add items: 3 movies, 2 restaurants, 1 book
2. Ask "What have I saved so far?" → Verify all items listed by category
3. Ask "What restaurants do I want to try?" → Verify only restaurants shown
4. Ask "What books do I want to read?" (with empty category) → Verify friendly empty message
5. Ask "What should I do this weekend?" → Verify todo items suggested
6. Test list formatting on mobile and desktop

---

## Phase 5: User Story 3 - Mark Items Complete via Natural Language (Priority: P3)

**Goal**: Enable users to toggle item completion status using conversational references to items

**Independent Test**: Create item "Try Jade Palace Restaurant", say "I ate at Jade Palace today, mark it done", verify item marked complete and confirmation displayed

### Backend Implementation for User Story 3

- [ ] T056 [P] [US3] Create `lib/utils/similarity.ts` file for fuzzy string matching
- [ ] T057 [P] [US3] Implement `calculateSimilarity(str1, str2)` function in `lib/utils/similarity.ts` using Levenshtein distance or token overlap
- [ ] T058 [US3] Implement `findBestMatch(query, items)` function in `lib/utils/similarity.ts` with threshold-based matching (>0.7 similarity)
- [ ] T059 [US3] Add toggleItemTool definition to `lib/ai/tools.ts` using AI SDK `tool()` function
- [ ] T060 [US3] Implement toggleItemTool parameters schema in `lib/ai/tools.ts` using Zod (identifier string, newStatus optional enum)
- [ ] T061 [US3] Implement toggleItemTool execute function in `lib/ai/tools.ts` that fetches user items
- [ ] T062 [US3] Integrate findBestMatch in toggleItemTool to identify item from natural language identifier
- [ ] T063 [US3] Handle no match case in toggleItemTool with helpful error message
- [ ] T064 [US3] Handle multiple matches case in toggleItemTool by returning ambiguous items for clarification
- [ ] T065 [US3] Call existing `toggleStatus` service in toggleItemTool to update item status
- [ ] T066 [US3] Format toggleItemTool result with itemId, newStatus, and confirmation message
- [ ] T067 [US3] Register toggleItemTool in `app/api/ai/chat/route.ts` tools configuration

### Frontend Enhancements for User Story 3

- [ ] T068 [US3] Add toggle confirmation rendering in MessageBubble component in `components/ui/MessageBubble.tsx`
- [ ] T069 [US3] Style confirmation messages in MessageBubble with visual feedback (checkmark icon, success color)

**Checkpoint**: All three user stories complete - Full conversational AI assistant functional

**Manual Testing Checklist for US3** (per quickstart.md):
1. Add item "Try Chipotle on Main St"
2. Say "I ate at Chipotle today" → Verify item marked done
3. Say "Actually I haven't been there yet" → Verify toggled back to todo
4. Test fuzzy matching: "I ate at Chi" → Verify Chipotle found
5. Test ambiguity: Create "Chipotle Main St" and "Chipotle Downtown", say "I ate at Chipotle" → Verify clarification requested
6. Test not found: "I ate at Taco Bell" (doesn't exist) → Verify friendly error
7. Verify main list updates after toggle (hide done filter test)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Enhancements and edge case handling that affect multiple user stories

### Duplicate Detection (FR-016)

- [ ] T070 [P] Implement `checkForSimilarItems(title, categoryId)` function in `lib/utils/similarity.ts`
- [ ] T071 Integrate duplicate checking in addItemTool execute function before creating item in `lib/ai/tools.ts`
- [ ] T072 Return similarItems in tool result when duplicates detected with warning message in `lib/ai/tools.ts`
- [ ] T073 Enhance MessageBubble in `components/ui/MessageBubble.tsx` to display duplicate warnings with existing items list

### Error Handling & UX Polish

- [ ] T074 [P] Add network error handling in useAIAssistant hook with toast notifications using react-hot-toast
- [ ] T075 [P] Add API error handling in `app/api/ai/chat/route.ts` with proper HTTP status codes and messages
- [ ] T076 [P] Add inline error state rendering in MessageBubble component for tool execution failures
- [ ] T077 Add rate limiting check in `app/api/ai/chat/route.ts` to prevent API abuse
- [ ] T078 Add conversation turn limit (50 messages) in useAIAssistant hook to prevent unbounded growth
- [ ] T079 Add input validation in AIAssistantModal (min 1 char, max 1000 chars)

### Responsive Design & Accessibility

- [ ] T080 [P] Add mobile-optimized styles to AIAssistantModal in `components/features/AIAssistantModal.tsx` (full screen on mobile, fixed height on desktop)
- [ ] T081 [P] Ensure MessageBubble touch targets are ≥44px in `components/ui/MessageBubble.tsx`
- [ ] T082 [P] Add keyboard accessibility to AIAssistantButton and modal controls
- [ ] T083 [P] Add ARIA labels to AIAssistantModal and MessageBubble for screen readers
- [ ] T084 Test modal behavior with on-screen keyboard on mobile devices

### Performance Optimization

- [ ] T085 [P] Add debounced input (300ms) to AIAssistantModal input field
- [ ] T086 [P] Implement virtualized scrolling for message list if >20 messages in AIAssistantModal
- [ ] T087 [P] Add React.memo to MessageBubble component to prevent unnecessary re-renders
- [ ] T088 Lazy load AIAssistantModal component in `app/page.tsx` using dynamic import

### Final Validation

- [ ] T089 Run all manual test scenarios from quickstart.md for User Story 1
- [ ] T090 Run all manual test scenarios from quickstart.md for User Story 2
- [ ] T091 Run all manual test scenarios from quickstart.md for User Story 3
- [ ] T092 Test all edge cases from spec.md (ambiguous input, special characters, network failure, duplicates)
- [ ] T093 Verify responsive design on mobile (375px), tablet (768px), desktop (1440px) viewports
- [ ] T094 Verify dark mode styling for all AI assistant components
- [ ] T095 Verify performance goals: <3s query responses, <30s item addition, <100ms interaction feedback
- [ ] T096 Verify success criteria from spec.md (85% correct categorization, <15% clarification rate)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion - MVP ready after this
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion - Can run parallel to US1 if staffed
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion - Can run parallel to US1/US2 if staffed
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ INDEPENDENT
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires MessageBubble from US1 but independently testable ✅ INDEPENDENT
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires MessageBubble from US1 but independently testable ✅ INDEPENDENT

### Within Each User Story

**User Story 1**:
- T018-T023 (Backend tools) can run parallel to T024-T038 (Frontend components)
- T039-T044 (UI integration) depends on T032 (Modal component)

**User Story 2**:
- T045-T051 (Backend listItems tool) can run parallel to T052-T055 (Frontend enhancements)

**User Story 3**:
- T056-T058 (Similarity utils) can run parallel to T059-T067 (Backend toggle tool)
- T068-T069 (Frontend) depends on T065 (Toggle service integration)

### Parallel Opportunities

**Phase 1 (Setup)**:
- T004-T009 (All interface definitions) can run in parallel

**Phase 2 (Foundational)**:
- T011-T012 can run in parallel (separate files)

**Phase 3 (User Story 1)**:
- T018, T024, T025, T026, T039 can all run in parallel (different files, no dependencies)

**Phase 4 (User Story 2)**:
- T045, T052 can run in parallel

**Phase 5 (User Story 3)**:
- T056, T057, T059 can run in parallel

**Phase 6 (Polish)**:
- T070, T074, T075, T076, T077, T080, T081, T082, T083, T085, T086, T087 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch backend tools and frontend components together:
Task T018: "Create lib/ai/tools.ts with addItemTool definition"
Task T024: "Create components/ui/MessageBubble.tsx component"
Task T025: "Style MessageBubble component with chat bubble design"
Task T026: "Add timestamp display to MessageBubble"
Task T039: "Create components/features/AIAssistantButton.tsx"

# These can all proceed independently since they work on different files
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T017) - CRITICAL BLOCKER
3. Complete Phase 3: User Story 1 (T018-T044)
4. **STOP and VALIDATE**: Manually test User Story 1 per quickstart.md
5. Deploy/demo if ready

**MVP Deliverable**: Users can add wishlist items via natural language conversation. This alone provides significant value.

### Incremental Delivery

1. **Foundation** (Phases 1-2): Streaming endpoint ready → ✅ Test with curl
2. **Add User Story 1** (Phase 3): Natural language item creation → ✅ Test independently → 🚀 Deploy MVP
3. **Add User Story 2** (Phase 4): Query items conversationally → ✅ Test independently → 🚀 Deploy v1.1
4. **Add User Story 3** (Phase 5): Toggle completion via conversation → ✅ Test independently → 🚀 Deploy v1.2
5. **Polish** (Phase 6): Edge cases, performance, responsive design → 🚀 Deploy v1.3

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers after Phase 2:

1. **Developer A**: User Story 1 (T018-T044) - MVP functionality
2. **Developer B**: User Story 2 (T045-T055) - Query capabilities
3. **Developer C**: User Story 3 (T056-T069) - Toggle completion

Stories can develop in parallel since they share only the foundational streaming endpoint and MessageBubble component.

---

## Task Summary

- **Total Tasks**: 96 tasks
- **Setup Phase**: 10 tasks
- **Foundational Phase**: 7 tasks (BLOCKS all stories)
- **User Story 1 (P1)**: 27 tasks - MVP
- **User Story 2 (P2)**: 11 tasks
- **User Story 3 (P3)**: 14 tasks
- **Polish & Cross-Cutting**: 27 tasks
- **Parallel Opportunities**: 32 tasks marked [P]
- **No Automated Tests**: Per Constitution Principle IV, all testing is manual

## Success Validation

After implementing all tasks, verify per spec.md success criteria:

- **SC-001**: Add item via natural language in <30 seconds ✓ (T089)
- **SC-002**: 85% correct categorization without clarification ✓ (T096)
- **SC-003**: Query results in <3 seconds ✓ (T095)
- **SC-004**: 90% correct item identification for toggles ✓ (T096)
- **SC-005**: Higher satisfaction vs form filling ✓ (qualitative during T089-T092)
- **SC-006**: <15% clarification rate ✓ (T096)
- **SC-007**: Zero critical errors ✓ (T089-T094)

---

## Notes

- **[P] tasks**: Different files, no dependencies - safe to parallelize
- **[Story] labels**: Map tasks to user stories for traceability and independent testing
- **Manual testing only**: Per Constitution, no automated test tasks included
- **File paths**: All tasks include exact paths for implementation
- **Incremental commits**: Commit after each task or logical group
- **Stop at checkpoints**: Validate each user story independently before proceeding
- **Constitution compliance**: All tasks align with Clean Code, Simple UX, Responsive Design, Manual Testing, and Privacy principles
