# Quick Start Guide: AI Personal Assistant

**Feature**: 001-ai-assistant
**Branch**: `001-ai-assistant`
**Date**: 2025-12-08

## Overview

This guide provides step-by-step instructions for implementing the AI Personal Assistant feature. Follow the phases in order, testing manually after each major milestone.

## Prerequisites

- [ ] Git branch `001-ai-assistant` checked out
- [ ] Node.js 20+ and npm installed
- [ ] Dependencies installed (`npm install`)
- [ ] Supabase project configured (`.env.local` with credentials)
- [ ] OpenAI API key obtained and added to `.env.local` as `OPENAI_API_KEY`

## Phase 1: Backend Foundation (P1 - Add Items)

### Step 1.1: Create AI Library Structure

```bash
mkdir -p lib/ai
mkdir -p lib/utils
mkdir -p types
```

### Step 1.2: Define TypeScript Interfaces

**File**: `types/ai.ts`

Create type definitions for Message, ToolInvocation, ToolResult, and hook return types.

**Reference**: See `data-model.md` for complete type specifications.

**Manual Test**: `npm run build` should succeed without type errors.

---

### Step 1.3: Implement System Prompt

**File**: `lib/ai/prompt.ts`

```typescript
export const SYSTEM_PROMPT = `
You are a proactive personal assistant that manages the user's life wishlist...

[Full prompt from spec.md]
`;
```

**Manual Test**: Import and log the constant to verify it's well-formed.

---

### Step 1.4: Fetch Available Categories

**File**: `lib/ai/categories.ts`

Create a utility to fetch and format categories for the AI:

```typescript
import { createClient } from '@/lib/supabase/server';

export async function getAvailableCategories() {
  const supabase = createClient();
  const { data, error } = await supabase.from('categories').select('id, name');

  if (error) throw error;

  return data.map(cat => ({ id: cat.id, name: cat.name }));
}
```

**Manual Test**: Call this function in a test route and verify it returns categories.

---

### Step 1.5: Implement Tool Definitions

**File**: `lib/ai/tools.ts`

Implement `addItem`, `listItems`, and `toggleItem` tools using the AI SDK's `tool` function.

**Key Points**:
- Use Zod schemas for parameter validation
- Wrap existing service methods (don't reimplement logic)
- Return structured ToolResult objects
- Handle errors gracefully

**Example Structure**:
```typescript
import { tool } from 'ai';
import { z } from 'zod';

export const addItemTool = tool({
  description: 'Add a new wishlist item...',
  parameters: z.object({
    title: z.string(),
    categoryId: z.string(),
    // ...
  }),
  execute: async ({ title, categoryId, ...rest }) => {
    try {
      // Call existing service
      const item = await createItem({ title, categoryId, status: 'todo', ...rest });
      return {
        success: true,
        data: { itemId: item.id },
        message: `Added "${title}" to your wishlist`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Failed to add item',
        error: error.message
      };
    }
  }
});
```

**Manual Test**: Import and inspect tool definitions; verify Zod schemas are correct.

---

### Step 1.6: Create Streaming Endpoint

**File**: `app/api/ai/chat/route.ts`

Implement the POST endpoint using AI SDK's `streamText`:

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { addItemTool, listItemsTool, toggleItemTool } from '@/lib/ai/tools';
import { SYSTEM_PROMPT } from '@/lib/ai/prompt';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: {
      addItem: addItemTool,
      listItems: listItemsTool,
      toggleItem: toggleItemTool,
    },
    system: SYSTEM_PROMPT,
  });

  return result.toDataStreamResponse();
}
```

**Manual Test**: Use curl or Postman to send a POST request with a test message.

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"I want to watch Inception"}]}'
```

Verify streaming response starts and contains expected events.

---

## Phase 2: Frontend Components (P1 - Add Items)

### Step 2.1: Create Message Bubble Component

**File**: `components/ui/MessageBubble.tsx`

Simple component to display a single message in the chat.

**Props**: `role`, `content`, `timestamp`

**Manual Test**: Create a test page that renders several MessageBubble instances with different roles.

---

### Step 2.2: Create useAIAssistant Hook

**File**: `lib/hooks/useAIAssistant.ts`

Custom hook to manage conversation state and streaming:

```typescript
import { useState } from 'react';
import { useChat } from 'ai/react'; // AI SDK hook for streaming

export function useAIAssistant() {
  const { messages, input, isLoading, handleSubmit, handleInputChange } = useChat({
    api: '/api/ai/chat',
    onError: (error) => {
      // Handle errors
    },
  });

  const clearMessages = () => {
    // Reset conversation
  };

  return {
    messages,
    input,
    isStreaming: isLoading,
    sendMessage: handleSubmit,
    setInput: handleInputChange,
    clearMessages,
  };
}
```

**Manual Test**: Use this hook in a test component and verify state management works.

---

### Step 2.3: Create AI Assistant Modal

**File**: `components/features/AIAssistantModal.tsx`

Modal component that wraps the conversation interface:

```typescript
import Modal from '@/components/ui/Modal';
import MessageBubble from '@/components/ui/MessageBubble';
import { useAIAssistant } from '@/lib/hooks/useAIAssistant';

export default function AIAssistantModal({ open, onClose, onItemAdded }) {
  const { messages, input, isStreaming, sendMessage, setInput, clearMessages } = useAIAssistant();

  const handleClose = () => {
    clearMessages();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="AI Assistant" size="lg">
      <div className="flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map(msg => (
            <MessageBubble key={msg.id} {...msg} />
          ))}
        </div>

        <form onSubmit={sendMessage} className="border-t p-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isStreaming}
          />
          <button type="submit" disabled={isStreaming || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </Modal>
  );
}
```

**Manual Test**:
1. Render modal in a test page
2. Type a message and submit
3. Verify streaming response appears
4. Close modal and verify state clears

---

### Step 2.4: Create AI Assistant Button

**File**: `components/features/AIAssistantButton.tsx`

Simple button component to trigger the modal:

```typescript
import { Bot } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AIAssistantButton({ onClick }) {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onClick}
      icon={<Bot className="h-4 w-4" />}
    >
      AI Assistant
    </Button>
  );
}
```

**Manual Test**: Render button and verify click handler fires.

---

### Step 2.5: Integrate into ItemFilters

**File**: `components/features/ItemFilters.tsx` (MODIFY)

Add the AI Assistant button to the left of the sort filter:

```typescript
// In the filters section
<div className="flex gap-2">
  <AIAssistantButton onClick={openAIModal} />
  <div className="w-48">
    <Select ... /> {/* Existing sort filter */}
  </div>
  {/* ... rest of filters */}
</div>
```

**Manual Test**: Visit homepage and verify button appears in correct location.

---

### Step 2.6: Integrate into HomePage

**File**: `app/page.tsx` (MODIFY)

Add state for modal and integrate components:

```typescript
const [isAIModalOpen, setIsAIModalOpen] = useState(false);

// Pass to ItemFilters
<ItemFilters ... onAIClick={() => setIsAIModalOpen(true)} />

// Render modal
<AIAssistantModal
  open={isAIModalOpen}
  onClose={() => setIsAIModalOpen(false)}
  onItemAdded={refresh}  // Refresh item list when item added
/>
```

**Manual Test**:
1. Click AI Assistant button
2. Modal opens
3. Type "I want to watch Inception"
4. Verify item is added to database
5. Verify main list refreshes
6. Close modal and verify it closes cleanly

---

## Phase 3: List Items Feature (P2)

### Step 3.1: Implement listItems Tool

Already created in Step 1.5, but ensure it supports filtering and formatting:

**Key Features**:
- Filter by category if specified
- Filter by status (default to 'todo')
- Return formatted results with count
- Handle empty results gracefully

**Manual Test**: Use curl to invoke listItems tool through the API.

---

### Step 3.2: Enhanced Message Display

**File**: `components/ui/MessageBubble.tsx` (MODIFY)

Add support for displaying lists of items in assistant messages:

```typescript
// If message contains item list data
{toolInvocations?.map(inv => {
  if (inv.toolName === 'listItems' && inv.result?.data?.items) {
    return (
      <div className="space-y-2">
        <p>{inv.result.message}</p>
        <ul>
          {inv.result.data.items.map(item => (
            <li key={item.id}>{item.title} - {item.category}</li>
          ))}
        </ul>
      </div>
    );
  }
})}
```

**Manual Test**:
1. Ask "What movies do I want to watch?"
2. Verify formatted list appears
3. Try with empty list: "What books do I want to read?" (if none exist)
4. Verify friendly empty message displays

---

## Phase 4: Toggle Items Feature (P3)

### Step 4.1: Implement Similarity Matching

**File**: `lib/utils/similarity.ts`

Create helper functions for fuzzy string matching:

```typescript
export function calculateSimilarity(str1: string, str2: string): number {
  // Implement Levenshtein distance or simple token overlap
  // Return score between 0 and 1
}

export function findBestMatch(query: string, items: Item[]): Item | null {
  let bestMatch = null;
  let bestScore = 0;

  for (const item of items) {
    const score = calculateSimilarity(query.toLowerCase(), item.title.toLowerCase());
    if (score > bestScore && score > 0.7) { // Threshold
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestMatch;
}
```

**Manual Test**: Write a test script that tries various queries against known items.

---

### Step 4.2: Implement toggleItem Tool

Use similarity matching to find the item:

```typescript
export const toggleItemTool = tool({
  description: 'Toggle completion status of a wishlist item',
  parameters: z.object({
    identifier: z.string().describe('Title or description of the item'),
    newStatus: z.enum(['todo', 'done']).optional(),
  }),
  execute: async ({ identifier, newStatus }) => {
    // Fetch user's items
    const items = await getUserItems();

    // Find best match
    const match = findBestMatch(identifier, items);

    if (!match) {
      return {
        success: false,
        message: "I couldn't find that item. Could you be more specific?",
        error: `No match for "${identifier}"`
      };
    }

    // Toggle or set status
    const targetStatus = newStatus || (match.status === 'todo' ? 'done' : 'todo');
    await updateItemStatus(match.id, targetStatus);

    return {
      success: true,
      data: { itemId: match.id, newStatus: targetStatus, title: match.title },
      message: `Marked "${match.title}" as ${targetStatus}`
    };
  }
});
```

**Manual Test**:
1. Add item: "Try Jade Palace Restaurant"
2. Say: "I ate at Jade Palace, mark it done"
3. Verify item is marked complete
4. Say: "Actually I haven't done that yet"
5. Verify item is toggled back to todo

---

## Phase 5: Polish & Edge Cases

### Step 5.1: Implement Duplicate Detection

**File**: `lib/ai/tools.ts` (MODIFY addItemTool)

Before creating item, check for similar existing items:

```typescript
execute: async ({ title, categoryId, ...rest }) => {
  // Check for duplicates
  const existingItems = await getUserItems({ categoryId, status: 'todo' });
  const similarItems = existingItems.filter(item =>
    calculateSimilarity(title, item.title) > 0.8
  );

  if (similarItems.length > 0) {
    return {
      success: false,
      data: { similarItems },
      message: `I found similar items: ${similarItems.map(i => i.title).join(', ')}. Did you mean one of these?`
    };
  }

  // Proceed with creation
  // ...
}
```

**Manual Test**:
1. Add "Watch Dune Part 2"
2. Try to add "Watch Dune: Part Two"
3. Verify warning about duplicate
4. Verify user can clarify or proceed

---

### Step 5.2: Error Handling

Add error boundaries and graceful degradation:

**Modal Level**:
- Network errors → toast notification
- AI API errors → inline error message
- Tool execution errors → friendly retry prompt

**Manual Test**:
1. Disconnect internet, try to send message → verify error toast
2. Invalid category → verify AI asks for clarification
3. Database error → verify friendly error message

---

### Step 5.3: Responsive Design Testing

**Manual Test Checklist**:
- [ ] Mobile (375px): Modal fills screen, keyboard doesn't obscure input
- [ ] Tablet (768px): Modal is comfortable size, touch targets ≥44px
- [ ] Desktop (1440px): Modal is centered, doesn't feel cramped
- [ ] Landscape mobile: Input still accessible
- [ ] Dark mode: Message bubbles have correct contrast

---

### Step 5.4: Performance Optimization

**Checklist**:
- [ ] Message list uses virtualization for >20 messages
- [ ] Input is debounced (300ms)
- [ ] Modal content lazy loads
- [ ] Streaming doesn't cause excessive re-renders

**Manual Test**: Open browser DevTools Performance tab, record interaction, verify no jank.

---

## Testing Guide

### Manual Test Scenarios

**User Story 1 (P1) - Add Items**:
1. Click AI Assistant button
2. Type "I want to watch The Matrix"
3. Verify item appears in main list
4. Verify correct category (Watch)
5. Close modal
6. Reopen modal
7. Verify conversation cleared

**User Story 2 (P2) - List Items**:
1. Add several items across different categories
2. Ask "What have I saved?"
3. Verify all items listed and organized
4. Ask "What restaurants do I want to try?"
5. Verify only restaurant items shown
6. Ask "What should I do this weekend?" with empty list
7. Verify friendly empty message

**User Story 3 (P3) - Toggle Items**:
1. Add "Try Chipotle on Main St"
2. Say "I ate at Chipotle today"
3. Verify item marked complete
4. Say "Actually I haven't been there yet"
5. Verify item marked todo again

**Edge Cases**:
- Ambiguous input: "I want to see Hamilton" → Verify clarification
- Special characters: "I want to watch Amélie"
- Duplicate detection: Add similar items twice
- Network failure: Disconnect and try to send message
- Long conversation: Send 20+ messages, verify performance

---

## Environment Variables

Ensure `.env.local` contains:

```env
# Existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NEW: Required for AI Assistant
OPENAI_API_KEY=sk-your-openai-api-key
```

---

## Troubleshooting

**"OpenAI API key not found"**:
- Verify `OPENAI_API_KEY` in `.env.local`
- Restart dev server after adding env var

**"Tool execution failed"**:
- Check Supabase RLS policies allow user access
- Verify user session is valid
- Check browser console for specific error

**Messages not streaming**:
- Verify `/api/ai/chat` route exports `POST` function
- Check Network tab for SSE connection
- Verify AI SDK version is 5.0.93+

**Modal doesn't close**:
- Verify `onClose` callback is wired correctly
- Check for errors in console that might prevent state update

---

## Success Checklist

- [ ] Backend: Streaming endpoint works
- [ ] Backend: All three tools (add, list, toggle) execute correctly
- [ ] Frontend: Modal opens and closes
- [ ] Frontend: Messages display correctly
- [ ] Frontend: Button positioned correctly (left of sort filter)
- [ ] Integration: Items added via AI appear in main list
- [ ] Integration: Main list refreshes after AI adds item
- [ ] Integration: Conversation clears on modal close
- [ ] Polish: Duplicate detection warns user
- [ ] Polish: Error handling works gracefully
- [ ] Polish: Responsive on mobile, tablet, desktop
- [ ] Testing: All user stories manually verified
- [ ] Testing: All edge cases tested

---

## Next Steps

After completing this quickstart and verifying all tests pass:

1. Run `/speckit.tasks` to generate detailed task breakdown
2. Review generated tasks for any additional implementation details
3. Begin incremental development with frequent manual testing
4. Commit work incrementally with descriptive messages
5. Update spec/plan if any discoveries require design changes

**Ready for `/speckit.tasks` command** ✓
