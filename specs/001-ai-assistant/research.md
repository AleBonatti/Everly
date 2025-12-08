# Research: AI Personal Assistant for Life Wishlist

**Feature**: 001-ai-assistant
**Date**: 2025-12-08
**Purpose**: Resolve technical unknowns and establish implementation patterns

## Overview

This document consolidates research findings for implementing an AI-powered conversational assistant that enables natural language interaction with the wishlist system.

## Key Technical Decisions

### 1. AI SDK Implementation Pattern

**Decision**: Use Vercel AI SDK's `streamText` API with tool calling for the conversational agent

**Rationale**:
- The project already has `ai` SDK (v5.0.93) and `@ai-sdk/openai` (v2.0.68) installed
- AI SDK provides built-in support for tool/function calling which aligns perfectly with FR-004 requirement for three tools (addItem, listItems, toggleItem)
- Streaming responses provide better UX with real-time feedback (FR-008 loading indicators)
- SDK handles conversation history management automatically (FR-010 context maintenance)

**Alternatives Considered**:
- **Direct OpenAI API**: More control but requires manual implementation of streaming, tool calling, and context management
- **LangChain**: Heavier abstraction with unnecessary complexity for our focused use case
- **Custom implementation**: Would violate Constitution Principle I (Clean Code) by reinventing well-tested solutions

**Implementation Pattern**:
```typescript
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await streamText({
  model: openai('gpt-4-turbo'),
  messages: conversationHistory,
  tools: {
    addItem: tool({
      description: 'Add a new item to the user wishlist',
      parameters: z.object({
        title: z.string(),
        categoryId: z.string(),
        // ... other fields
      }),
      execute: async (params) => { /* implementation */ }
    }),
    // ... other tools
  },
  system: SYSTEM_PROMPT,
});
```

### 2. Conversation State Management

**Decision**: Use React useState for ephemeral session-only conversation history

**Rationale**:
- Spec assumption: "conversation history is ephemeral and cleared when the modal is closed"
- No persistence requirement reduces complexity (Constitution Principle II - Simple UX)
- useState provides sufficient state management for single-session conversations
- Aligns with existing project patterns (no global state library currently used)

**Alternatives Considered**:
- **Local Storage**: Spec explicitly states ephemeral, persistence would violate requirements
- **Zustand/Redux**: Overkill for component-local state; violates simplicity principle
- **Server-side session storage**: Unnecessary complexity for transient conversations

**Implementation Pattern**:
```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

const [messages, setMessages] = useState<Message[]>([]);
```

### 3. Tool Implementation Architecture

**Decision**: Create three tool functions that wrap existing Supabase service methods

**Rationale**:
- Spec explicitly requires three tools: addItem, listItems, toggleItem (FR-004)
- Existing codebase has item services (seen in `lib/hooks/useItems`)
- Tools should be thin wrappers that delegate to existing business logic (DRY principle)
- Zod schemas provide automatic validation for tool parameters

**Alternatives Considered**:
- **Direct database access in tools**: Violates separation of concerns; bypasses existing validation
- **New service layer**: Unnecessary duplication when services already exist
- **Single multipurpose tool**: Less clear intent detection; harder for AI to reason about

**Implementation Pattern**:
```typescript
// lib/ai/tools.ts
export const addItemTool = tool({
  description: 'Add a new wishlist item with extracted details from natural language',
  parameters: z.object({
    title: z.string().describe('The main title/name of the item'),
    categoryId: z.string().describe('The category ID (Watch, Visit, Try, Read, etc.)'),
    description: z.string().optional(),
    location: z.string().optional(),
    // ...
  }),
  execute: async ({ title, categoryId, ...rest }) => {
    // Call existing createNewItem service
    const result = await createNewItem({ title, categoryId, status: 'todo', ...rest });
    return { success: true, itemId: result.id, message: `Added "${title}" to your wishlist` };
  }
});
```

### 4. Duplicate Detection Strategy

**Decision**: Use fuzzy string matching with Levenshtein distance for similarity detection

**Rationale**:
- FR-016 requires checking for similar existing items and warning users
- Users may phrase the same item differently ("Dune Part 2" vs "Dune: Part Two")
- Threshold-based matching (e.g., >80% similar) balances false positives/negatives
- Can be implemented without additional dependencies using built-in string methods

**Alternatives Considered**:
- **Exact title match only**: Misses paraphrased duplicates; poor UX
- **Full-text search (PostgreSQL)**: Overkill; requires DB schema changes
- **AI-based semantic similarity**: Adds latency and API costs for marginal benefit

**Implementation Pattern**:
```typescript
function calculateSimilarity(str1: string, str2: string): number {
  // Levenshtein distance implementation or simple token overlap
  const normalized1 = str1.toLowerCase().trim();
  const normalized2 = str2.toLowerCase().trim();
  // Return 0-1 similarity score
}

async function checkForSimilarItems(title: string, categoryId: string): Promise<Item[]> {
  const existingItems = await listItems({ categoryId, status: 'todo' });
  return existingItems.filter(item => calculateSimilarity(item.title, title) > 0.8);
}
```

### 5. Category Mapping from Natural Language

**Decision**: Use AI SDK tool parameters with enum of existing categories + AI's natural understanding

**Rationale**:
- FR-006 requires mapping natural language to existing system categories
- AI models excel at this type of classification task
- Enum constraint in Zod schema ensures only valid categories are used
- System prompt can guide the AI on category selection patterns

**Alternatives Considered**:
- **Keyword dictionary**: Brittle; requires constant updates; misses creative phrasings
- **Separate classification API call**: Adds latency; increases complexity
- **User selection as fallback**: Good practice, but AI should handle 85%+ (SC-002)

**Implementation Pattern**:
```typescript
// Fetch categories dynamically from DB
const categories = await getCategories();

const addItemTool = tool({
  parameters: z.object({
    categoryId: z.enum(categories.map(c => c.id) as [string, ...string[]]),
    // ...
  }),
});

// System prompt guidance:
const SYSTEM_PROMPT = `
You are a proactive personal assistant...
Available categories:
- Watch: Movies, TV shows, streaming content
- Visit: Places, landmarks, attractions
- Try: Restaurants, experiences, activities
- Read: Books, articles, publications
...
`;
```

### 6. Modal UI Component Pattern

**Decision**: Create new AIAssistantModal using existing Modal component infrastructure

**Rationale**:
- Spec shows existing modal components (`components/ui/Modal.tsx` used in `app/page.tsx:254`)
- Reuse existing modal infrastructure for consistency (Constitution Principle I - Consistency)
- FR-002 requires conversational interface - chat-style message list inside modal
- FR-001 requires button left of sort filter - modify ItemFilters component

**Alternatives Considered**:
- **Separate page/route**: Breaks user flow; violates UX principle of minimal clicks
- **Slide-over panel**: Non-standard pattern for this app; inconsistent with existing modals
- **Inline chat**: Clutters main interface; no clear focus boundary

**Implementation Pattern**:
```typescript
// components/features/AIAssistantModal.tsx
<Modal open={isOpen} onClose={onClose} title="AI Assistant" size="lg">
  <div className="flex flex-col h-[600px]">
    <div className="flex-1 overflow-y-auto space-y-4">
      {messages.map(msg => (
        <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
      ))}
    </div>
    <form onSubmit={handleSubmit} className="border-t pt-4">
      <Input placeholder="Ask me anything..." />
    </form>
  </div>
</Modal>
```

### 7. Error Handling and User Feedback

**Decision**: Use existing `react-hot-toast` for transient notifications + inline error states in chat

**Rationale**:
- Project already uses `react-hot-toast` (v2.6.0 in package.json)
- FR-013 requires graceful error handling with user-friendly messages
- Toast for system errors (API failures), inline for contextual errors (validation)
- Maintains consistency with existing error patterns

**Alternatives Considered**:
- **Custom notification system**: Violates DRY; inconsistent with existing patterns
- **Error messages only in chat**: Some errors (network failures) need system-level indication
- **Modal error states**: Good for blocking errors; combine with toasts for non-blocking

**Implementation Pattern**:
```typescript
import toast from 'react-hot-toast';

try {
  const result = await streamText({...});
} catch (error) {
  if (error instanceof NetworkError) {
    toast.error('Connection lost. Please check your internet connection.');
  } else {
    // Display inline error in chat
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again.',
      error: true
    }]);
  }
}
```

### 8. Performance Optimization for Streaming

**Decision**: Use React Suspense boundaries and debounced input to maintain responsiveness

**Rationale**:
- FR-008 requires visual feedback during processing
- Streaming responses can update frequently - need to avoid unnecessary re-renders
- Success criteria SC-003 requires results in under 3 seconds
- Constitution Constraint: <100ms interaction feedback

**Alternatives Considered**:
- **No optimization**: May cause UI jank during streaming; violates responsiveness principle
- **Virtual scrolling**: Overkill for conversation length (typically <20 messages per session)
- **Memo everything**: Premature optimization; adds complexity without measured need

**Implementation Pattern**:
```typescript
const DebouncedInput = useMemo(() =>
  debounce((value: string) => setUserInput(value), 300),
  []
);

<Suspense fallback={<LoadingIndicator />}>
  <MessageList messages={messages} />
</Suspense>
```

## Best Practices

### AI SDK Tool Calling
- Use descriptive tool names and parameter descriptions to guide AI behavior
- Return structured success/error objects from tool execute functions
- Validate all parameters with Zod schemas before execution
- Include context in error messages for better AI error recovery

### Conversation Design
- Keep system prompt concise but directive (<500 words)
- Use few-shot examples in prompt for ambiguous scenarios
- Implement conversation turn limits (e.g., 50 turns) to prevent runaway context
- Clear conversation history on modal close (per spec)

### Security Considerations
- Never expose raw database errors to AI or user
- Validate user session/auth before tool execution
- Sanitize user input before passing to AI (prevent prompt injection)
- Rate limit AI API calls per user session

### Testing Strategy (Manual per Constitution)
- Test happy path for each user story (P1, P2, P3)
- Test error scenarios (API failure, network loss, invalid input)
- Test edge cases from spec (ambiguous input, duplicate items, special characters)
- Test across desktop, tablet, mobile viewports (responsive design)
- Test with slow network (throttling) to verify loading states

## Dependencies & Integration Points

### Existing System Integration
- **Item Services** (`lib/services/items.ts` or `lib/hooks/useItems.ts`): CRUD operations
- **Categories** (`lib/hooks/useCategories`): Fetch available categories for prompt & validation
- **Authentication** (`@supabase/ssr`): Ensure all tool calls respect current user session
- **Modal System** (`components/ui/Modal.tsx`): Base UI component
- **ItemFilters** (`components/features/ItemFilters.tsx`): Add AI button

### External Dependencies
- **OpenAI API**: GPT-4 Turbo for high-quality intent recognition
- **Environment Variables**: `OPENAI_API_KEY` required
- **Internet Connectivity**: Required for AI API calls (per spec assumptions)

### New Files to Create
1. `lib/ai/tools.ts` - Tool definitions (addItem, listItems, toggleItem)
2. `lib/ai/prompt.ts` - System prompt constant
3. `lib/ai/assistant.ts` - Main AI assistant orchestration
4. `lib/utils/similarity.ts` - Duplicate detection helpers
5. `components/features/AIAssistantModal.tsx` - Modal UI
6. `components/features/AIAssistantButton.tsx` - Trigger button
7. `app/api/ai/chat/route.ts` - Server-side streaming endpoint (if needed)

## Open Questions (Resolved)

All technical clarifications have been resolved through research. No blocking unknowns remain.

## Next Steps

Proceed to Phase 1 (Design & Contracts):
1. Define data model for conversation entities
2. Create API contracts for AI streaming endpoint
3. Design component hierarchy and props interfaces
4. Create quick-start guide for development workflow
