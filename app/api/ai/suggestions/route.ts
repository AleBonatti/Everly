import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';
import { getDb, categories } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { imageToolRegistry } from '@/lib/ai/image-tools';
import { MovieImageTool } from '@/lib/ai/tools/movie-tool';

// Register tools
imageToolRegistry.register('cinema', new MovieImageTool());

/**
 * AI Suggestions API Route
 *
 * Generates similar content suggestions based on an item's action and title
 * Uses OpenAI GPT-4 to provide contextual recommendations
 * Uses specialized tools to fetch relevant images based on content type
 */

const requestSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  title: z.string().min(1, 'Title is required'),
  category: z.string().optional(),
  categoryId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { action, title, category, categoryId } = requestSchema.parse(body);

    // Fetch category content_type from database if categoryId provided
    let contentType = 'generic';
    if (categoryId) {
      try {
        const db = getDb();
        const [categoryData] = await db
          .select()
          .from(categories)
          .where(eq(categories.id, categoryId))
          .limit(1);

        if (categoryData) {
          contentType = categoryData.contentType || 'generic';
        }
      } catch (dbError) {
        console.error('Failed to fetch category:', dbError);
        // Continue with generic type
      }
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Construct the prompt for the AI model with metadata fields
    const prompt = `You are a helpful assistant that suggests similar activities, content, or experiences.

Given the following activity:
Action: ${action}
Title: ${title}
${category ? `Category: ${category}` : ''}
Content Type: ${contentType}

Please suggest 3 similar ${action} activities or content that the user might enjoy.
For each suggestion, provide:
1. A clear, concise title
2. A brief 1-2 sentence description explaining why it's similar or why the user might enjoy it
3. Year of creation/release (if applicable, empty string if unknown)
4. Creator/Director/Artist/Author name (if known, empty string if unknown)
5. An IMDB ID code (if known, empty string if unknown)

Format your response as a JSON array with objects containing "title", "description", "year", and "creator" fields.
Make sure the suggestions are diverse but related to the original item.
Focus on quality recommendations that match the spirit and genre of the original item.

Example format:
[
  {
    "title": "Example Title",
    "description": "Brief description of why this is similar.",
    "year": "1994",
    "creator": "Quentin Tarantino",
    "id": "tt0110912"
  }
]`;

    // Generate AI response using Vercel AI SDK
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
    });

    // Parse the AI response
    let suggestions;
    try {
      // Try to parse as JSON
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to parse the entire response
        suggestions = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    // Validate suggestions format with metadata fields
    const suggestionsSchema = z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        year: z.string().optional(),
        creator: z.string().optional(),
      })
    );

    const validatedSuggestions = suggestionsSchema.parse(suggestions);

    // Fetch images using the appropriate tool based on content_type
    const suggestionsWithImages = await Promise.all(
      validatedSuggestions.slice(0, 5).map(async (suggestion) => {
        let imageUrl: string | undefined;

        // Use the image tool registry to get the right image
        if (suggestion.title) {
          try {
            imageUrl = await imageToolRegistry.getImage(
              contentType,
              suggestion.title,
              suggestion.year
            );
          } catch (imageError) {
            console.error('Failed to fetch image:', imageError);
            // imageToolRegistry.getImage already returns placeholder on error
          }
        }

        return {
          title: suggestion.title,
          description: suggestion.description,
          year: suggestion.year,
          creator: suggestion.creator,
          imageUrl,
        };
      })
    );

    return NextResponse.json({
      suggestions: suggestionsWithImages,
    });
  } catch (error) {
    console.error('AI suggestions error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate suggestions. Please try again.' },
      { status: 500 }
    );
  }
}
