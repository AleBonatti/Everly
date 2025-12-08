/**
 * Type definitions for AI Personal Assistant feature
 * Feature: 001-ai-assistant
 */

/**
 * Represents a single turn in the conversational exchange
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;
  /** The speaker of the message */
  role: 'user' | 'assistant' | 'system';
  /** The textual content of the message */
  content: string;
  /** Tool calls made by the assistant (optional) */
  toolInvocations?: ToolInvocation[];
  /** When the message was created */
  timestamp: Date;
  /** Whether this message represents an error state */
  error?: boolean;
}

/**
 * Represents a function call made by the AI assistant
 */
export interface ToolInvocation {
  /** Unique identifier for this tool call */
  toolCallId: string;
  /** The tool being invoked */
  toolName: 'addItem' | 'listItems' | 'toggleItem';
  /** The parameters passed to the tool */
  args: Record<string, any>;
  /** The result after execution completes (optional) */
  result?: ToolResult;
}

/**
 * Represents the outcome of a tool execution
 */
export interface ToolResult {
  /** Whether the tool execution succeeded */
  success: boolean;
  /** The payload returned by the tool (structure varies by tool) */
  data: any;
  /** Human-readable summary of the result */
  message: string;
  /** Error message if execution failed */
  error?: string;
}

/**
 * React state structure for managing the conversation session
 */
export interface ConversationState {
  /** Array of all messages in the current session */
  messages: Message[];
  /** Whether the assistant is currently generating a response */
  isStreaming: boolean;
  /** The current user input text */
  input: string;
  /** Global error state for the conversation */
  error: string | null;
}

/**
 * Parameters for the addItem tool
 */
export interface AddItemParams {
  /** Required: Main title/name */
  title: string;
  /** Required: Category ID (enum validated) */
  categoryId: string;
  /** Optional: Additional details */
  description?: string;
  /** Optional: Physical location */
  location?: string;
  /** Optional: Related URL */
  url?: string;
  /** Optional: ISO date string */
  targetDate?: string;
  /** Optional: Priority level */
  priority?: 'low' | 'medium' | 'high';
  /** Optional: Additional notes */
  note?: string;
}

/**
 * Parameters for the listItems tool
 */
export interface ListItemsParams {
  /** Optional: Filter by category */
  categoryId?: string;
  /** Optional: Filter by completion status (default: 'todo') */
  status?: 'todo' | 'done';
  /** Optional: Text search query */
  query?: string;
  /** Optional: Max number of results (default: 50) */
  limit?: number;
}

/**
 * Parameters for the toggleItem tool
 */
export interface ToggleItemParams {
  /** Required: Title, partial title, or description */
  identifier: string;
  /** Optional: Target status (if not specified, toggle) */
  newStatus?: 'todo' | 'done';
}

/**
 * Return type for useAIAssistant hook
 */
export interface UseAIAssistantReturn {
  /** Array of all messages in the conversation */
  messages: Message[];
  /** Current user input text */
  input: string;
  /** Whether the assistant is currently streaming a response */
  isStreaming: boolean;
  /** Function to send a message */
  sendMessage: (e: React.FormEvent) => void;
  /** Function to update input text */
  setInput: (value: string) => void;
  /** Function to clear conversation history */
  clearMessages: () => void;
}
