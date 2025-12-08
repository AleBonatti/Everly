# Implementation Plan: AI Personal Assistant for Life Wishlist

**Branch**: `001-ai-assistant` | **Date**: 2025-12-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-assistant/spec.md`

## Summary

Implement an AI-powered conversational assistant that enables users to manage their life wishlist through natural language. The assistant provides three core capabilities via tool calling: adding items, listing/querying items, and toggling completion status. Users interact with the assistant through a modal interface triggered by a button in the main UI (positioned left of the sort filter). The implementation leverages the existing Vercel AI SDK and OpenAI integration to provide streaming conversational responses with real-time feedback.

**Primary Approach**: Server-side AI SDK integration with React streaming UI components, thin tool wrappers over existing item services, and ephemeral conversation state managed in React component state.

## Technical Context

**Language/Version**: TypeScript 5.3.3, JavaScript (ES2022), Node.js 20+
**Primary Dependencies**: Next.js 15.0.0, React 19.0.0, Vercel AI SDK 5.0.93, @ai-sdk/openai 2.0.68, Zod 4.1.12, Supabase SSR 0.7.0
**Storage**: Supabase (PostgreSQL) for items/categories (no schema changes required)
**Testing**: Manual testing only (per Constitution Principle IV)
**Target Platform**: Web (responsive design: mobile, tablet, desktop)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: <3s for query responses (SC-003), <30s for item addition (SC-001), <100ms interaction feedback
**Constraints**: 85% correct categorization without clarification (SC-002), <15% clarification rate (SC-006), zero critical errors (SC-007)
**Scale/Scope**: Single-user sessions, ephemeral conversations (<50 turns), 3 tools, ~7 new files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Clean Code ✅ PASS
- **Readable**: Tool names, function signatures, and component props will clearly express intent
- **Consistent**: Follows existing Next.js App Router patterns, React hooks conventions, and Supabase service layer
- **Maintainable**: Tools are thin wrappers over existing services; no complex abstractions introduced
- **Self-documenting**: TypeScript interfaces, Zod schemas, and descriptive naming minimize comment needs
- **Simple**: Leverages existing AI SDK rather than custom implementations

### Principle II: Simple & Intuitive UX ✅ PASS
- **Minimal clicks**: Single button to open assistant, conversational input eliminates form filling
- **Clear affordances**: Button clearly labeled, chat interface follows familiar patterns
- **Instant feedback**: Streaming responses provide real-time indication of processing
- **Forgiving**: User can close modal anytime, clarifications guide toward success
- **Focused**: Modal interface isolates conversational interaction from main list

### Principle III: Fully Responsive Design ✅ PASS
- **Mobile-first**: Modal adapts to viewport, touch-friendly input and buttons
- **Fluid layouts**: Chat messages stack vertically, modal scales with screen size
- **Touch-friendly**: Button ≥44px, scrollable message area, accessible keyboard
- **Consistent experience**: Core functionality (add, list, toggle) works identically across devices
- **Performance**: Lazy loading of modal content, efficient message rendering

### Principle IV: Manual Testing Only ✅ PASS
- **No automated tests**: Implementation plan does not include test file creation
- **Manual verification**: Testing strategy defined in research.md covers all user stories manually
- **No test frameworks**: No new testing dependencies introduced
- **No test files**: No `*.test.*` or `*.spec.*` files in deliverables

### Principle V: Privacy Through Authentication ✅ PASS
- **Authentication required**: All tool executions verify user session via Supabase auth
- **Secure storage**: No new credential storage; relies on existing Supabase session management
- **Session management**: Conversations ephemeral; no sensitive data persisted
- **Data isolation**: Tools operate only on current user's items (enforced by existing RLS)
- **No third-party tracking**: AI API calls through backend route; no client-side tracking added

**Post-Phase 1 Re-check**: All principles remain satisfied. No violations introduced during design phase.

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-assistant/
├── spec.md              # Feature specification (input)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model (conversation entities)
├── quickstart.md        # Phase 1 development guide
├── contracts/           # Phase 1 API contracts
│   └── ai-chat-api.yaml # OpenAPI spec for streaming endpoint
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks command)
```

### Source Code (repository root)

```text
lib/
├── ai/                      # NEW: AI assistant logic
│   ├── tools.ts             # Tool definitions (addItem, listItems, toggleItem)
│   ├── prompt.ts            # System prompt constant
│   └── assistant.ts         # Main AI orchestration (streamText wrapper)
├── utils/
│   └── similarity.ts        # NEW: Duplicate detection helpers
├── hooks/
│   └── useAIAssistant.ts    # NEW: React hook for managing conversation state
├── services/
│   └── items.ts             # EXISTING: Used by tools (no changes)
└── hooks/
    ├── useItems.ts          # EXISTING: CRUD operations
    └── useCategories.ts     # EXISTING: Category fetching

components/
├── features/
│   ├── ItemFilters.tsx      # MODIFY: Add AI assistant button
│   ├── AIAssistantModal.tsx # NEW: Conversational modal UI
│   └── AIAssistantButton.tsx # NEW: Trigger button component
└── ui/
    ├── Modal.tsx            # EXISTING: Base modal (reused)
    └── MessageBubble.tsx    # NEW: Chat message component

app/
├── page.tsx                 # MODIFY: Integrate AIAssistantModal
└── api/
    └── ai/
        └── chat/
            └── route.ts     # NEW: Streaming AI endpoint

types/
└── ai.ts                    # NEW: TypeScript interfaces for conversation entities
```

**Structure Decision**: The project follows Next.js App Router structure with clear separation of concerns:
- `lib/ai/` contains all AI-specific business logic (tools, prompts, orchestration)
- `components/features/` houses feature-specific UI components
- `app/api/ai/chat/route.ts` provides the streaming endpoint for server-side AI calls
- Existing service layers (`lib/services/`, `lib/hooks/`) are reused without modification

This structure maintains consistency with existing patterns while clearly delineating new AI functionality.

## Complexity Tracking

> **No violations**: All Constitution principles are satisfied without exceptions. This table remains empty.

## Phase 0: Research (Completed)

See [research.md](./research.md) for full details. Key decisions:

1. **AI SDK Pattern**: Use `streamText` with tool calling (built-in support, clean API)
2. **State Management**: React useState for ephemeral sessions (no persistence needed)
3. **Tool Architecture**: Thin wrappers over existing services (DRY, maintainable)
4. **Duplicate Detection**: Fuzzy string matching with Levenshtein distance
5. **Category Mapping**: AI-driven with enum constraints and system prompt guidance
6. **Modal Pattern**: Reuse existing Modal component with chat-style message list
7. **Error Handling**: Combine react-hot-toast (system errors) with inline chat errors
8. **Performance**: Suspense boundaries and debounced input for responsiveness

## Phase 1: Design & Contracts

### Data Model (see data-model.md)

**Conversation Entities** (ephemeral, not persisted):

- **Message**: Represents a single turn in the conversation
  - `id`: string (UUID)
  - `role`: 'user' | 'assistant' | 'system'
  - `content`: string
  - `toolInvocations`: ToolInvocation[] (optional)
  - `timestamp`: Date

- **ToolInvocation**: Represents an AI tool call
  - `toolCallId`: string
  - `toolName`: 'addItem' | 'listItems' | 'toggleItem'
  - `args`: Record<string, any>
  - `result`: ToolResult (optional)

- **ToolResult**: Result of tool execution
  - `success`: boolean
  - `data`: any (item ID, item list, or toggle confirmation)
  - `message`: string (human-readable summary)
  - `error`: string (optional)

- **ConversationState**: React state for managing session
  - `messages`: Message[]
  - `isStreaming`: boolean
  - `input`: string

**Existing Entities** (already defined, no changes):

- **Item**: Wishlist item (title, category, status, etc.)
- **Category**: Item categorization (Watch, Visit, Try, Read, etc.)
- **User**: Authenticated user (via Supabase Auth)

### API Contracts (see contracts/ai-chat-api.yaml)

**Endpoint**: `POST /api/ai/chat`

**Request**:
```typescript
{
  messages: Message[];  // Conversation history
  userId: string;       // From session
}
```

**Response**: Server-Sent Events (SSE) stream

```typescript
// Event types:
data: { type: 'text-delta', textDelta: string }
data: { type: 'tool-call', toolName: string, toolCallId: string, args: object }
data: { type: 'tool-result', toolCallId: string, result: ToolResult }
data: { type: 'finish', finishReason: string }
data: { type: 'error', error: string }
```

### Component Hierarchy

```text
HomePage
├── AuthenticatedLayout
│   └── ItemFilters (MODIFIED)
│       └── AIAssistantButton (NEW)
└── AIAssistantModal (NEW)
    ├── Modal (EXISTING, wrapped)
    ├── MessageList
    │   └── MessageBubble (NEW) × N
    ├── LoadingIndicator
    └── InputForm
        ├── Input (EXISTING)
        └── SendButton
```

### Key Interfaces

```typescript
// types/ai.ts
export interface AIAssistantModalProps {
  open: boolean;
  onClose: () => void;
  onItemAdded?: () => void;  // Callback to refresh main list
}

export interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
  timestamp: Date;
}

export interface UseAIAssistantReturn {
  messages: Message[];
  input: string;
  isStreaming: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  error: string | null;
}
```

## Phase 2: Tasks

Tasks will be generated by the `/speckit.tasks` command. This plan provides the foundation for task breakdown.

**Expected Task Categories**:

1. **Backend/API**:
   - Create streaming endpoint `/api/ai/chat/route.ts`
   - Implement tool definitions (`lib/ai/tools.ts`)
   - Create system prompt (`lib/ai/prompt.ts`)
   - Implement AI orchestration (`lib/ai/assistant.ts`)
   - Build duplicate detection utility (`lib/utils/similarity.ts`)

2. **Frontend/UI**:
   - Create AIAssistantModal component
   - Create MessageBubble component
   - Create AI AssistantButton component
   - Create useAIAssistant hook
   - Modify ItemFilters to include AI button
   - Integrate modal into HomePage

3. **Types & Contracts**:
   - Define TypeScript interfaces (`types/ai.ts`)
   - Create OpenAPI spec for endpoint

4. **Integration & Testing**:
   - Manual testing of user story P1 (add items)
   - Manual testing of user story P2 (query items)
   - Manual testing of user story P3 (toggle completion)
   - Edge case testing (ambiguity, duplicates, errors)
   - Responsive design testing (mobile, tablet, desktop)

## Success Metrics Verification

Post-implementation, manually verify these success criteria:

- **SC-001**: Add item via natural language in <30s ✓
- **SC-002**: 85% correct categorization without clarification ✓ (monitor over multiple test cases)
- **SC-003**: Query results in <3s ✓
- **SC-004**: 90% correct item identification for toggles ✓ (monitor over multiple test cases)
- **SC-005**: Higher satisfaction vs form filling ✓ (qualitative feedback)
- **SC-006**: <15% clarification rate ✓ (monitor conversation logs)
- **SC-007**: Zero critical errors ✓ (no crashes or data loss during testing)

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI API rate limits | Medium | High | Implement client-side rate limiting; use exponential backoff; clear user feedback |
| Poor intent recognition | Medium | Medium | Refine system prompt with examples; include fallback clarification questions |
| Streaming performance issues | Low | Medium | Implement Suspense boundaries; optimize message rendering; limit turn count |
| Duplicate detection false positives | Medium | Low | Tune similarity threshold; allow user override; clear messaging |
| OpenAI API costs | Low | Low | Monitor usage; consider caching common queries; set reasonable token limits |

## Dependencies

- **Existing**: Next.js, React, AI SDK, Supabase, existing item/category services
- **New**: None (all required packages already installed)
- **Configuration**: `OPENAI_API_KEY` environment variable required

## Timeline Estimate

*Note: Per Constitution, no time estimates provided. Tasks are prioritized, not scheduled.*

**Priority Order** (aligns with user story priorities):

1. **P1 - Add Items** (User Story 1):
   - Backend: Tool definitions, streaming endpoint
   - Frontend: Modal, input, basic message display
   - Integration: Button, modal trigger

2. **P2 - List Items** (User Story 2):
   - Backend: listItems tool, query parsing
   - Frontend: Rich message formatting for lists

3. **P3 - Toggle Items** (User Story 3):
   - Backend: toggleItem tool, similarity matching
   - Frontend: Confirmation messages

4. **Polish**:
   - Error handling, edge cases
   - Responsive design refinement
   - Duplicate detection tuning

Each priority level represents an independently testable, deployable slice of functionality.

## Notes

- **No database migrations required**: All data operations use existing tables
- **Backward compatible**: Feature is additive; no changes to existing functionality
- **Incremental deployment**: Can deploy P1 first, then P2, then P3 independently
- **Constitution compliance**: All principles satisfied without exceptions

---

**Next Command**: `/speckit.tasks` to generate actionable task breakdown from this plan.
