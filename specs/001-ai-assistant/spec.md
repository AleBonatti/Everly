# Feature Specification: AI Personal Assistant for Life Wishlist

**Feature Branch**: `001-ai-assistant`
**Created**: 2025-12-08
**Status**: Draft
**Input**: User description: "i would like to add a new agent, based on ai-sdk, that will execute some tasks based on user input. these tasks will be: list items, add a new item, and toggle item completed state. Create a tool for each of these task. a new button, placed left of sort filter, will open a modal where the user will be able to prompt a his request. the possible request will something like: - 'I want to watch the movie Dune: part two as soon as it is available on stream': to add a new item. - 'What have I saved in my list up until now?' to list items. - 'I finally ate at the chinese restaurant that i have saved. mark it completed': to toggle state and set it completed."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Items via Natural Language (Priority: P1)

A user wants to capture a life wishlist item (movie to watch, place to visit, restaurant to try, etc.) using natural, conversational language without filling out structured forms.

**Why this priority**: This is the core value proposition - enabling effortless capture of wishlist items. Users can quickly save ideas as they think of them, in their own words, making the system more likely to be used consistently.

**Independent Test**: Can be fully tested by opening the AI assistant modal, typing a natural language request like "I want to try that new Italian restaurant on Main Street", and verifying the item appears in the wishlist with appropriate details extracted.

**Acceptance Scenarios**:

1. **Given** the user has opened the AI assistant modal, **When** they type "I want to watch Dune: Part Two when it's on streaming", **Then** the assistant creates a new wishlist item with title "Watch Dune: Part Two", appropriate category (e.g., "Watch"), and confirms the action
2. **Given** the user has opened the AI assistant modal, **When** they type "Remind me to visit the Louvre next time I'm in Paris", **Then** the assistant creates a wishlist item with title related to visiting the Louvre, appropriate category (e.g., "Visit"), location "Paris", and confirms the action
3. **Given** the user provides insufficient information, **When** they type "I want to watch that new movie", **Then** the assistant asks clarifying questions like "Which movie are you referring to?" before creating the item
4. **Given** the assistant has created an item, **When** the creation completes, **Then** the assistant provides a friendly confirmation summarizing what was saved

---

### User Story 2 - Query Wishlist Items (Priority: P2)

A user wants to quickly review what's currently on their wishlist using conversational queries rather than browsing through filters.

**Why this priority**: This enables users to get quick answers about their saved items, making the system feel more intelligent and responsive. It's the second most valuable feature because it provides immediate utility for decision-making.

**Independent Test**: Can be fully tested by adding several items to the wishlist, opening the AI assistant, asking "What movies do I want to watch?", and verifying the assistant returns a relevant, organized list of movie items.

**Acceptance Scenarios**:

1. **Given** the user has several items in their wishlist, **When** they ask "What have I saved so far?", **Then** the assistant displays a summary of all wishlist items organized by category
2. **Given** the user has multiple categories of items, **When** they ask "What restaurants do I want to try?", **Then** the assistant filters and shows only restaurant-related items
3. **Given** the wishlist is empty, **When** the user asks about their items, **Then** the assistant responds with a friendly message indicating the list is empty and suggests adding items
4. **Given** the user asks a vague question, **When** they type "What should I do this weekend?", **Then** the assistant interprets this as a request for incomplete/todo items and presents relevant suggestions

---

### User Story 3 - Mark Items Complete via Natural Language (Priority: P3)

A user wants to mark wishlist items as completed using natural language that references what they actually did, without manually finding and clicking the item.

**Why this priority**: This completes the conversational loop and provides satisfaction tracking. While valuable, it's P3 because users can still manually toggle items in the main UI, making this a convenience enhancement rather than essential functionality.

**Independent Test**: Can be fully tested by creating a wishlist item (e.g., "Try the Chinese restaurant on 5th Avenue"), opening the AI assistant, saying "I ate at the Chinese restaurant today, mark it done", and verifying the item is marked complete and removed from the active list (if "hide done" is enabled).

**Acceptance Scenarios**:

1. **Given** a user has "Try Jade Palace Chinese Restaurant" in their wishlist, **When** they tell the assistant "I finally ate at Jade Palace, mark it done", **Then** the assistant identifies the matching item, marks it complete, and confirms with a congratulatory message
2. **Given** multiple similar items exist, **When** the user's request could match several items, **Then** the assistant asks for clarification (e.g., "I found 3 restaurants - did you mean Jade Palace, Golden Dragon, or China Star?")
3. **Given** a user references a non-existent item, **When** they try to mark something complete that isn't in the list, **Then** the assistant politely indicates the item wasn't found and asks if they want to add it retroactively
4. **Given** a completed item, **When** the user says "Actually, I haven't done that yet", **Then** the assistant can toggle the item back to incomplete status

---

### Edge Cases

- What happens when the user provides ambiguous input that could match multiple categories (e.g., "I want to see Hamilton" - is it a show to watch or a live performance to attend)?
- How does the system handle very long conversational inputs (e.g., multiple requests in one message)?
- What happens if the AI assistant is unsure about category mapping for an unusual item type?
- How does the system behave when there are network/API failures during assistant interactions?
- What happens when a user tries to add a duplicate item that already exists?
- How does the system handle items with special characters, emojis, or non-English text?
- What happens if the user closes the modal mid-conversation with the assistant?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a button in the main interface to launch the AI assistant modal (positioned left of the sort filter)
- **FR-002**: System MUST display a conversational modal interface where users can type natural language requests
- **FR-003**: System MUST process user input through an AI agent that can understand intent (add item, list items, toggle completion)
- **FR-004**: System MUST provide three distinct tool capabilities to the AI agent: addItem, listItems, and toggleItem
- **FR-005**: System MUST extract structured data from natural language (title, category, location, description, etc.) when adding items
- **FR-006**: System MUST map natural language item types to existing system categories (Watch, Visit, Try, Read, etc.)
- **FR-007**: System MUST display the assistant's responses in a conversational, turn-by-turn format within the modal
- **FR-008**: System MUST show visual feedback (loading indicators) while the AI agent processes requests
- **FR-009**: System MUST ask clarifying questions when user input is ambiguous or missing critical information
- **FR-010**: System MUST maintain conversation context within a single modal session to handle follow-up questions
- **FR-011**: System MUST allow users to close the assistant modal and return to the main interface at any time
- **FR-012**: System MUST refresh the main item list when items are added or modified through the assistant
- **FR-013**: System MUST handle errors gracefully with user-friendly messages (e.g., API failures, malformed requests)
- **FR-014**: System MUST support identification of items by title, partial title, or descriptive phrases when toggling completion
- **FR-015**: System MUST confirm actions back to the user with summaries of what was created, listed, or updated
- **FR-016**: System MUST check for similar existing items before creating new ones and warn the user by showing the existing item and asking "Did you mean this one?" to allow user confirmation or correction
- **FR-017**: Assistant responses MUST be concise, friendly, and action-oriented per the defined system prompt

### Key Entities

- **AI Conversation**: Represents a single conversational session within the assistant modal, including message history and context
- **User Message**: A natural language input from the user expressing an intent or question
- **Assistant Response**: The AI-generated reply to the user, which may include confirmations, questions, or data summaries
- **Tool Invocation**: The structured call to one of the three tools (addItem, listItems, toggleItem) triggered by the AI agent
- **Extracted Item Data**: The structured information parsed from natural language (title, category, description, location, etc.) before creating a wishlist item

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully add a new wishlist item via natural language in under 30 seconds from opening the assistant modal
- **SC-002**: At least 85% of natural language add requests result in correctly categorized items without requiring clarification
- **SC-003**: Users can retrieve relevant wishlist items through conversational queries with results appearing in under 3 seconds
- **SC-004**: The assistant correctly identifies and toggles item completion status in at least 90% of cases without ambiguity
- **SC-005**: Users report higher satisfaction with item entry compared to manual form filling (measured via user feedback or task completion rates)
- **SC-006**: The assistant requires clarification in less than 15% of interactions, indicating effective intent recognition
- **SC-007**: Zero critical errors (crashes, data loss) occur during assistant interactions under normal usage conditions

## Assumptions

- The AI SDK being used supports tool/function calling capabilities
- The system has existing categories defined that can be mapped from natural language
- Users have basic familiarity with conversational interfaces or chatbots
- The assistant operates within the existing authentication and data access boundaries
- Internet connectivity is available for AI model API calls
- The conversation history is ephemeral and cleared when the modal is closed (no persistent chat history across sessions)

## Dependencies

- AI SDK integration (model provider access and configuration)
- Existing item management system (create, read, update operations)
- Existing category and action definitions in the database
- Modal component infrastructure in the UI
