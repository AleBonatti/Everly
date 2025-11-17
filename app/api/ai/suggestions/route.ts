import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';

/**
 * AI Suggestions API Route
 *
 * Generates similar content suggestions based on an item's action and title
 * Uses OpenAI GPT-4 to provide contextual recommendations
 */

const requestSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  title: z.string().min(1, 'Title is required'),
  category: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { action, title, category } = requestSchema.parse(body);

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Construct the prompt for the AI model
    const prompt = `You are a helpful assistant that suggests similar activities, content, or experiences.

Given the following activity:
Action: ${action}
Title: ${title}
${category ? `Category: ${category}` : ''}

Please suggest 3 similar ${action} activities or content that the user might enjoy.
For each suggestion, provide:
1. A clear, concise title
2. A brief 1-2 sentence description explaining why it's similar or why the user might enjoy it
3. A publicly accessible image URL that represents the content (from sources like TMDB, Wikipedia, official websites, or other reliable public sources)

Format your response as a JSON array with objects containing "title", "description", and "imageUrl" fields.
Make sure the suggestions are diverse but related to the original item.
Focus on quality recommendations that match the spirit and genre of the original item.
For the imageUrl, provide a direct link to an actual image (not a placeholder). If you cannot find a real image URL, use an empty string.`;

    // Generate AI response using Vercel AI SDK
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.7,
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

    // Validate suggestions format
    const suggestionsSchema = z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        imageUrl: z.string().optional(),
      })
    );

    const validatedSuggestions = suggestionsSchema.parse(suggestions);

    return NextResponse.json({
      suggestions: validatedSuggestions.slice(0, 5), // Ensure max 5 suggestions
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
