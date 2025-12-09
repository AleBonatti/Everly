/**
 * AI Tool Definitions
 * Feature: 001-ai-assistant
 *
 * Defines the three tools (addItem, listItems, toggleItem) for the AI assistant
 * These tools are executed server-side in the API route
 */

import { z } from 'zod';
import { tool } from 'ai';
import { getDb, items, actions, categories } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';
import { findSimilarItems, findBestMatch } from '@/lib/utils/similarity';

/**
 * Map category name to action name
 * Maps common category names to their corresponding action verbs
 */
function mapCategoryToAction(categoryName: string): string {
  const lowerName = categoryName.toLowerCase();

  // Define category to action mappings
  const mappings: Record<string, string> = {
    'movies': 'watch',
    'shows': 'watch',
    'watch': 'watch',
    'tv': 'watch',
    'series': 'watch',
    'books': 'read',
    'read': 'read',
    'reading': 'read',
    'places': 'visit',
    'travel': 'visit',
    'visit': 'visit',
    'destinations': 'visit',
    'restaurants': 'try',
    'food': 'try',
    'try': 'try',
    'experiences': 'try',
  };

  return mappings[lowerName] || lowerName;
}

/**
 * Get action ID for a category
 * e.g., "Movies" category -> "watch" action
 */
async function getActionIdForCategory(categoryId: string): Promise<string | null> {
  const db = getDb();

  // Get category name
  const [category] = await db
    .select({ name: categories.name })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!category) {
    console.log('Category not found for ID:', categoryId);
    return null;
  }

  console.log('Category name:', category.name);

  // Map category name to action name
  const actionName = mapCategoryToAction(category.name);
  console.log('Looking for action:', actionName);

  // Find action by name
  const [action] = await db
    .select({ id: actions.id })
    .from(actions)
    .where(eq(actions.name, actionName))
    .limit(1);

  console.log('Found action:', action);

  return action?.id || null;
}

// Define Zod schemas for validation
const addItemSchema = z.object({
  title: z.string().describe('The item title'),
  categoryId: z.string().describe('Category ID for the item'),
  description: z.string().optional().describe('Item description'),
  location: z.string().optional().describe('Item location'),
  url: z.string().optional().describe('Item URL'),
  targetDate: z.string().optional().describe('Target date for the item'),
  priority: z
    .enum(['low', 'medium', 'high'])
    .optional()
    .describe('Priority level'),
  note: z.string().optional().describe('Additional notes'),
});

const listItemsSchema = z.object({
  categoryId: z.string().optional().describe('Filter by category ID'),
  status: z.enum(['todo', 'done']).optional().describe('Filter by status'),
  query: z.string().optional().describe('Search query'),
  limit: z.number().optional().describe('Maximum items to return'),
});

const toggleItemSchema = z.object({
  identifier: z.string().describe('Item title or ID to toggle'),
  newStatus: z.enum(['todo', 'done']).optional().describe('Target status'),
});

/**
 * Factory function to create tools with user context
 */
export function createTools(userId: string) {
  return {
    addItem: tool({
      description:
        "Add a new item to the user's wishlist. Extract relevant details from natural language like title, category, location, dates, priority, etc.",
      inputSchema: addItemSchema,
      execute: async (args) => {
        const {
          title,
          categoryId,
          description,
          location,
          url,
          targetDate,
          priority,
          note,
        } = args;
        try {
          // Check for duplicate items
          const db = getDb();
          const existingItems = await db
            .select()
            .from(items)
            .where(
              and(
                eq(items.userId, userId),
                eq(items.categoryId, categoryId),
                eq(items.status, 'todo')
              )
            );

          const similarItems = findSimilarItems(
            title,
            existingItems as any[],
            0.8
          );

          if (similarItems.length > 0) {
            return {
              success: false,
              data: {
                similarItems: similarItems.map((item: any) => ({
                  id: item.id,
                  title: item.title,
                })),
              },
              message: `I found similar items already in your wishlist: ${similarItems.map((i: any) => `"${i.title}"`).join(', ')}. Did you mean one of these, or would you like to add this as a new item?`,
              error: 'Potential duplicate detected',
            };
          }

          // Get action ID for the category
          const actionId = await getActionIdForCategory(categoryId);
          console.log('Action ID for category', categoryId, ':', actionId);

          // Create the new item
          const [newItem] = await db
            .insert(items)
            .values({
              userId,
              categoryId,
              title,
              description: description || null,
              location: location || null,
              url: url || null,
              targetDate: targetDate || null,
              priority: priority || null,
              note: note || null,
              status: 'todo',
              actionId: actionId,
              imageUrl: null,
              metadata: null,
            })
            .returning();

          return {
            success: true,
            data: { itemId: newItem.id },
            message: `Added "${title}" to your wishlist!`,
          };
        } catch (error) {
          return {
            success: false,
            data: null,
            message:
              'Sorry, I encountered an error adding that item. Please try again.',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
    }),

    listItems: tool({
      description:
        "List items from the user's wishlist. Can filter by category, status, or search query.",
      inputSchema: listItemsSchema,
      execute: async (args) => {
        const { categoryId, status, query, limit } = args;
        const effectiveStatus = status || 'todo';
        const effectiveLimit = limit || 50;

        try {
          // Build where conditions
          const db = getDb();
          const conditions = [eq(items.userId, userId)];

          if (categoryId) {
            conditions.push(eq(items.categoryId, categoryId));
          }

          if (effectiveStatus) {
            conditions.push(eq(items.status, effectiveStatus));
          }

          // Fetch items
          let result = await db
            .select()
            .from(items)
            .where(and(...conditions))
            .orderBy(desc(items.createdAt))
            .limit(effectiveLimit);

          // Apply text search if query provided
          if (query) {
            const lowerQuery = query.toLowerCase();
            result = result.filter(
              (item: any) =>
                item.title.toLowerCase().includes(lowerQuery) ||
                (item.description &&
                  item.description.toLowerCase().includes(lowerQuery)) ||
                (item.location &&
                  item.location.toLowerCase().includes(lowerQuery))
            );
          }

          if (result.length === 0) {
            return {
              success: true,
              data: { items: [], count: 0 },
              message: categoryId
                ? `You don't have any ${effectiveStatus} items in that category yet.`
                : `You don't have any ${effectiveStatus} items yet.`,
            };
          }

          // Format items for display
          const formattedItems = result.map((item: any) => ({
            id: item.id,
            title: item.title,
            categoryId: item.categoryId,
            description: item.description,
            location: item.location,
            status: item.status,
            createdAt: item.createdAt,
          }));

          return {
            success: true,
            data: { items: formattedItems, count: formattedItems.length },
            message: `You have ${formattedItems.length} ${effectiveStatus} item${formattedItems.length === 1 ? '' : 's'}${categoryId ? ' in that category' : ''}.`,
          };
        } catch (error) {
          return {
            success: false,
            data: null,
            message:
              'Sorry, I encountered an error fetching your items. Please try again.',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
    }),

    toggleItem: tool({
      description:
        'Toggle the completion status of a wishlist item. Uses fuzzy matching to find the item by title or description.',
      inputSchema: toggleItemSchema,
      execute: async (args) => {
        const { identifier, newStatus } = args;
        try {
          // Fetch all user's items
          const db = getDb();
          const userItems = await db
            .select()
            .from(items)
            .where(eq(items.userId, userId))
            .orderBy(desc(items.createdAt));

          if (userItems.length === 0) {
            return {
              success: false,
              data: null,
              message: 'Your wishlist is empty. Add some items first!',
              error: 'No items found',
            };
          }

          // Find best matching item using similarity
          const match = findBestMatch(identifier, userItems as any[], 0.6);

          if (!match) {
            return {
              success: false,
              data: null,
              message: `I couldn't find an item matching "${identifier}". Could you be more specific or check the title?`,
              error: `No match found for "${identifier}"`,
            };
          }

          // Determine target status
          const targetStatus =
            newStatus || (match.status === 'todo' ? 'done' : 'todo');

          // Update the item
          const [updatedItem] = await db
            .update(items)
            .set({
              status: targetStatus,
              updatedAt: new Date(),
            })
            .where(eq(items.id, match.id))
            .returning();

          return {
            success: true,
            data: {
              itemId: updatedItem.id,
              newStatus: targetStatus,
              title: updatedItem.title,
            },
            message: `Marked "${updatedItem.title}" as ${targetStatus}!`,
          };
        } catch (error) {
          return {
            success: false,
            data: null,
            message:
              'Sorry, I encountered an error updating that item. Please try again.',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
    }),
  };
}
