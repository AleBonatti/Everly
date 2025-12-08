# Data Model: AI Personal Assistant

**Feature**: 001-ai-assistant
**Date**: 2025-12-08

## Overview

This document defines the data structures for the AI Personal Assistant feature. All conversation entities are **ephemeral** and exist only in client-side React state during an active session. No new database tables or schemas are required.

## Conversation Entities (Ephemeral)

### Message

Represents a single turn in the conversational exchange.

**Fields**:
- `id`: string (UUID) - Unique identifier for the message
- `role`: 'user' | 'assistant' | 'system' - The speaker of the message
- `content`: string - The textual content of the message
- `toolInvocations`: ToolInvocation[] (optional) - Tool calls made by the assistant
- `timestamp`: Date - When the message was created
- `error`: boolean (optional) - Whether this message represents an error state

**Validation Rules**:
- `id` must be unique within a conversation
- `role` must be one of the three valid types
- `content` is required and cannot be empty string
- `timestamp` defaults to current time if not provided

**Relationships**:
- A Message may have zero or more ToolInvocations
- Messages are ordered chronologically within a conversation

**State Transitions**:
- Messages are immutable once created
- Messages are appended to the conversation array
- Entire conversation is cleared when modal closes

**Example**:
```typescript
{
  id: "msg_abc123",
  role: "user",
  content: "I want to watch Dune: Part Two",
  timestamp: new Date("2025-12-08T14:30:00Z")
}

{
  id: "msg_def456",
  role: "assistant",
  content: "I'll add that to your watchlist!",
  toolInvocations: [{
    toolCallId: "call_xyz789",
    toolName: "addItem",
    args: { title: "Watch Dune: Part Two", categoryId: "cat_watch" },
    result: { success: true, data: { itemId: "item_123" }, message: "Added to watchlist" }
  }],
  timestamp: new Date("2025-12-08T14:30:02Z")
}
```

---

### ToolInvocation

Represents a function call made by the AI assistant to execute an action.

**Fields**:
- `toolCallId`: string - Unique identifier for this tool call (from AI SDK)
- `toolName`: 'addItem' | 'listItems' | 'toggleItem' - The tool being invoked
- `args`: Record<string, any> - The parameters passed to the tool
- `result`: ToolResult (optional) - The result after execution completes

**Validation Rules**:
- `toolCallId` must be unique within a conversation
- `toolName` must match one of the three defined tools
- `args` must conform to the Zod schema for the respective tool
- `result` is populated after tool execution completes

**Relationships**:
- Each ToolInvocation belongs to exactly one Message
- Tool execution may reference existing Item entities (via itemId)

**Lifecycle**:
1. AI SDK creates ToolInvocation with `toolCallId`, `toolName`, and `args`
2. Tool execute function is called with `args`
3. Execute function returns ToolResult which is assigned to `result`
4. Result is streamed back to client and displayed in the conversation

**Example**:
```typescript
{
  toolCallId: "call_abc123",
  toolName: "addItem",
  args: {
    title: "Try Jade Palace Restaurant",
    categoryId: "cat_try",
    location: "Downtown"
  },
  result: {
    success: true,
    data: { itemId: "item_456" },
    message: "Added 'Try Jade Palace Restaurant' to your wishlist"
  }
}
```

---

### ToolResult

Represents the outcome of a tool execution.

**Fields**:
- `success`: boolean - Whether the tool execution succeeded
- `data`: any - The payload returned by the tool (structure varies by tool)
- `message`: string - Human-readable summary of the result
- `error`: string (optional) - Error message if execution failed

**Validation Rules**:
- If `success` is false, `error` should be populated
- If `success` is true, `data` should contain the expected payload
- `message` is always required for user feedback

**Data Payloads by Tool**:

**addItem**:
```typescript
data: {
  itemId: string;          // The ID of the newly created item
  similarItems?: Item[];   // If duplicates detected (FR-016)
}
```

**listItems**:
```typescript
data: {
  items: Item[];           // Array of matching items
  count: number;           // Total count
  filteredBy?: string;     // Optional description of filters applied
}
```

**toggleItem**:
```typescript
data: {
  itemId: string;          // The ID of the toggled item
  newStatus: 'todo' | 'done';  // The new status after toggle
  title: string;           // Item title for confirmation
}
```

**Example**:
```typescript
// Success case
{
  success: true,
  data: { itemId: "item_789", similarItems: [] },
  message: "Added 'Watch The Matrix' to your watchlist"
}

// Error case
{
  success: false,
  data: null,
  message: "Unable to add item",
  error: "Category 'Watc' not found. Did you mean 'Watch'?"
}
```

---

### ConversationState

Represents the React state structure for managing the conversation session.

**Fields**:
- `messages`: Message[] - Array of all messages in the current session
- `isStreaming`: boolean - Whether the assistant is currently generating a response
- `input`: string - The current user input text
- `error`: string | null - Global error state for the conversation

**Validation Rules**:
- `messages` array is append-only during a session
- `isStreaming` must be false when user can send messages
- `input` is cleared after message is sent
- `error` is displayed and then cleared by user action

**State Management**:
- Managed by `useAIAssistant` custom hook
- Cleared when modal closes (ephemeral per spec)
- Maximum 50 messages per session (prevent unbounded growth)

**Example**:
```typescript
{
  messages: [
    { id: "msg_1", role: "user", content: "What movies do I want to watch?", timestamp: new Date() },
    { id: "msg_2", role: "assistant", content: "You have 3 movies saved...", timestamp: new Date() }
  ],
  isStreaming: false,
  input: "",
  error: null
}
```

## Tool Parameter Schemas

### addItem Tool Parameters

```typescript
{
  title: string;                    // Required: Main title/name
  categoryId: string;               // Required: Category ID (enum validated)
  description?: string;             // Optional: Additional details
  location?: string;                // Optional: Physical location
  url?: string;                     // Optional: Related URL
  targetDate?: string;              // Optional: ISO date string
  priority?: 'low' | 'medium' | 'high';  // Optional: Priority level
  note?: string;                    // Optional: Additional notes
}
```

**Extraction Guidance for AI**:
- `title`: Extract the main subject from user input (e.g., "Dune: Part Two")
- `categoryId`: Map from context (e.g., "watch" → "cat_watch")
- `location`: Extract from phrases like "in Paris", "at the restaurant on Main St"
- `url`: Extract if user mentions a website or link
- `targetDate`: Extract from temporal phrases like "next week", "in December"
- `priority`: Infer from urgency indicators like "as soon as possible", "urgent"

---

### listItems Tool Parameters

```typescript
{
  categoryId?: string;              // Optional: Filter by category
  status?: 'todo' | 'done';         // Optional: Filter by completion status (default: 'todo')
  query?: string;                   // Optional: Text search query
  limit?: number;                   // Optional: Max number of results (default: 50)
}
```

**Extraction Guidance for AI**:
- `categoryId`: Extract from phrases like "what restaurants", "which movies"
- `status`: Default to 'todo', use 'done' if user asks about completed items
- `query`: Extract keywords for free-text search
- `limit`: Usually not specified by user; use default

---

### toggleItem Tool Parameters

```typescript
{
  identifier: string;               // Required: Title, partial title, or description
  newStatus?: 'todo' | 'done';      // Optional: Target status (if not specified, toggle)
}
```

**Extraction Guidance for AI**:
- `identifier`: Extract the item reference from phrases like "the Chinese restaurant", "Dune movie"
- `newStatus`: 'done' if user says "mark it done", "I finished", "completed"; 'todo' if "mark it undone", "I haven't done that"
- Use fuzzy matching to find the best matching item by title similarity

---

## Integration with Existing Data Model

### Existing Entities (No Changes)

**Item** (from database):
- id: string
- title: string
- categoryId: string
- actionId: string | null
- status: 'todo' | 'done'
- description: string | null
- priority: 'low' | 'medium' | 'high' | null
- url: string | null
- location: string | null
- note: string | null
- targetDate: Date | null
- imageUrl: string | null
- metadata: JSONB | null
- userId: string (FK)
- createdAt: Date
- updatedAt: Date

**Category** (from database):
- id: string
- name: string
- icon: string | null
- userId: string | null (global categories have null)

**User** (from Supabase Auth):
- id: string
- email: string
- (other auth fields managed by Supabase)

### Relationship Diagram

```text
User (1) ─── has many ──→ (N) Item
User (1) ─── has session ──→ (1) ConversationState (ephemeral)

ConversationState (1) ─── contains ──→ (N) Message
Message (1) ─── may have ──→ (N) ToolInvocation
ToolInvocation (1) ─── produces ──→ (1) ToolResult

ToolInvocation ─── references ──→ Item (via itemId in result)
ToolInvocation ─── references ──→ Category (via categoryId in args)
```

### Data Flow

1. **User Input → Message**: User types message, creates Message with role='user'
2. **Message → AI SDK**: Messages array sent to streaming endpoint
3. **AI SDK → ToolInvocation**: AI decides to call tool, creates ToolInvocation
4. **ToolInvocation → Service**: Tool execute function calls existing Supabase services
5. **Service → ToolResult**: Service returns data, wrapped in ToolResult
6. **ToolResult → Message**: Assistant message created with embedded ToolInvocation
7. **Message → UI**: Message rendered in chat interface

## Validation & Constraints

### Input Validation

**Before AI Processing**:
- User input length: 1-1000 characters
- No script tags or potentially malicious content
- Session must have valid auth token

**After Tool Execution**:
- All tool parameters validated against Zod schemas
- Category IDs verified against database (existing categories only)
- User ID from session matches item ownership
- Duplicate detection runs before item creation (FR-016)

### Error Handling

**Invalid Tool Parameters**:
```typescript
{
  success: false,
  data: null,
  message: "I couldn't create that item. Could you provide more details?",
  error: "Missing required field: categoryId"
}
```

**Item Not Found** (for toggleItem):
```typescript
{
  success: false,
  data: null,
  message: "I couldn't find that item in your wishlist. Could you be more specific?",
  error: "No items found matching 'the restaurant'"
}
```

**Database Error**:
```typescript
{
  success: false,
  data: null,
  message: "Something went wrong. Please try again.",
  error: "Database connection failed"
}
```

## Performance Considerations

### Memory Management
- Limit conversation to 50 messages (circular buffer if exceeded)
- Clear conversation state on modal close
- Lazy load message history (only render visible messages)

### Network Efficiency
- Stream responses incrementally (don't wait for full completion)
- Debounce user input (300ms delay before sending)
- Cancel in-flight requests if user closes modal

### Caching
- Category list cached on first load (rarely changes)
- No caching of conversation state (ephemeral per requirements)
- Consider caching common AI responses (future optimization)

## Security

### Authentication & Authorization
- All tool executions verify `userId` from session
- Row-Level Security (RLS) enforced at database layer
- No cross-user data access possible

### Input Sanitization
- User input sanitized before passing to AI
- Prevent prompt injection attacks
- Validate all tool parameters against schemas

### Data Privacy
- Conversation history never persisted
- No conversation data sent to external analytics
- AI API calls made from backend (API key not exposed to client)

---

## Summary

This data model supports the ephemeral, conversational nature of the AI assistant while integrating seamlessly with the existing item management system. All new entities (Message, ToolInvocation, ToolResult, ConversationState) exist only in memory during an active session, maintaining simplicity and privacy per the feature specification.

No database migrations or schema changes are required. The AI assistant acts as a natural language interface layer over the existing data model, using the same Item and Category entities that power the rest of the application.
