/**
 * Domain type definitions for the SpecToDo application
 * These types define the core domain models shared across the application
 *
 * @module specs/002-ui-integration/contracts/types
 */

/**
 * Represents the priority level of a task item
 */
export type ItemPriority = 'low' | 'medium' | 'high'

/**
 * Represents the completion status of a task item
 */
export type ItemStatus = 'todo' | 'done'

/**
 * Represents the type of category
 */
export type CategoryType = 'default' | 'custom'

/**
 * Represents a single task item in the application
 * Corresponds to the items table in the database
 */
export interface Item {
  /** Unique identifier for the item */
  id: string

  /** The user ID that owns this item */
  userId: string

  /** The category this item belongs to */
  categoryId: string

  /** The title/name of the item */
  title: string

  /** Optional detailed description of the item */
  description?: string | null

  /** The current status of the item (todo or done) */
  status: ItemStatus

  /** Optional priority level of the item */
  priority?: ItemPriority | null

  /** Optional URL reference for the item */
  url?: string | null

  /** Optional location information for the item */
  location?: string | null

  /** Optional notes or additional information */
  note?: string | null

  /** Optional target/due date in ISO format */
  targetDate?: string | null

  /** ISO timestamp when the item was created */
  createdAt: string

  /** ISO timestamp when the item was last updated */
  updatedAt: string
}

/**
 * Represents an input payload for creating a new item
 */
export interface CreateItemInput {
  /** The category this item belongs to */
  categoryId: string

  /** The title/name of the item */
  title: string

  /** Optional detailed description of the item */
  description?: string | null

  /** Optional priority level of the item */
  priority?: ItemPriority | null

  /** Optional URL reference for the item */
  url?: string | null

  /** Optional location information for the item */
  location?: string | null

  /** Optional notes or additional information */
  note?: string | null

  /** Optional target/due date in ISO format */
  targetDate?: string | null
}

/**
 * Represents an update payload for modifying an existing item
 */
export interface UpdateItemInput {
  /** Optional updated title */
  title?: string

  /** Optional updated description */
  description?: string | null

  /** Optional updated status */
  status?: ItemStatus

  /** Optional updated priority */
  priority?: ItemPriority | null

  /** Optional updated URL */
  url?: string | null

  /** Optional updated location */
  location?: string | null

  /** Optional updated notes */
  note?: string | null

  /** Optional updated target date */
  targetDate?: string | null
}

/**
 * Represents a category/list in the application
 * Corresponds to the categories table in the database
 */
export interface Category {
  /** Unique identifier for the category */
  id: string

  /** The user ID that owns this category */
  userId: string

  /** The display name of the category */
  name: string

  /** The type of category (default or custom) */
  type: CategoryType

  /** Optional color identifier or code for visual representation */
  color?: string | null

  /** ISO timestamp when the category was created */
  createdAt: string

  /** ISO timestamp when the category was last updated */
  updatedAt: string
}

/**
 * Represents an input payload for creating a new category
 */
export interface CreateCategoryInput {
  /** The display name of the category */
  name: string

  /** Optional color identifier or code for visual representation */
  color?: string | null
}

/**
 * Represents an update payload for modifying an existing category
 */
export interface UpdateCategoryInput {
  /** Optional updated name */
  name?: string

  /** Optional updated color */
  color?: string | null
}

/**
 * Represents a user in the application
 * Minimal user information for authentication and identification
 */
export interface User {
  /** Unique identifier for the user (typically from auth provider) */
  id: string

  /** Email address of the user */
  email: string

  /** Optional display name for the user */
  displayName?: string | null

  /** Optional avatar URL */
  avatarUrl?: string | null

  /** ISO timestamp when the user account was created */
  createdAt?: string

  /** ISO timestamp when the user account was last updated */
  updatedAt?: string
}

/**
 * Represents the authenticated user session
 */
export interface AuthSession {
  /** The authenticated user */
  user: User

  /** Authentication token/JWT */
  token?: string

  /** Token expiration timestamp */
  expiresAt?: string
}

/**
 * Represents the state of API response
 * Used for pagination and data loading
 */
export interface PaginationMeta {
  /** Total number of items available */
  total: number

  /** Current page number (0-indexed) */
  page: number

  /** Number of items per page */
  limit: number

  /** Whether there are more pages available */
  hasMore: boolean
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  /** The response data */
  data: T

  /** Whether the request was successful */
  success: boolean

  /** Optional error message if the request failed */
  error?: string

  /** Optional pagination metadata */
  pagination?: PaginationMeta
}

/**
 * Generic list response wrapper
 */
export interface ApiListResponse<T> {
  /** Array of items */
  data: T[]

  /** Pagination metadata */
  pagination: PaginationMeta

  /** Whether the request was successful */
  success: boolean

  /** Optional error message if the request failed */
  error?: string
}
