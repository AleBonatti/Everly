/**
 * AI Chat API Route
 * Feature: 001-ai-assistant
 *
 * Streaming conversational endpoint for the AI assistant
 * Handles natural language interactions and tool execution
 */

import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { requireAuth, handleAuthError } from '@/lib/auth/middleware'
import { createTools } from '@/lib/ai/tools'
import { SYSTEM_PROMPT } from '@/lib/ai/prompt'
import { getAvailableCategories, formatCategoriesForPrompt } from '@/lib/ai/categories'

/**
 * POST /api/ai/chat
 * Stream AI assistant conversation with tool calling capabilities
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const context = await requireAuth(req)

    // Parse request body
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch available categories for the AI
    const categories = await getAvailableCategories()
    const categoriesText = formatCategoriesForPrompt(categories)

    // Build enhanced system prompt with categories
    const enhancedPrompt = `${SYSTEM_PROMPT}

Available categories:
${categoriesText}

Current user ID: ${context.user.id}
`

    // Create tools with user context
    const tools = createTools(context.user.id)

    // Debug: Check what the tools object looks like
    console.log('Tools keys:', Object.keys(tools))
    console.log('addItem tool:', tools.addItem)

    // Create streaming response with tool calling
    const result = streamText({
      model: openai('gpt-4-turbo'),
      messages,
      tools,
      system: enhancedPrompt,
    })

    // Return streaming response
    return result.toTextStreamResponse()
  } catch (error) {
    // Handle auth errors
    if (
      error instanceof Error &&
      (error.name === 'AuthError' ||
        error.message.includes('Unauthorized') ||
        error.message.includes('Forbidden'))
    ) {
      return handleAuthError(error)
    }

    // Handle other errors
    console.error('Error in AI chat endpoint:', error)
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred. Please try again.',
        code: 'INTERNAL_ERROR',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * OPTIONS /api/ai/chat
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
