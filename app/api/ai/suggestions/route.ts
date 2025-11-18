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
3. A short search term (2-3 words) that could be used to find a relevant image for this suggestion

Format your response as a JSON array with objects containing "title", "description", and "imageSearchTerm" fields.
Make sure the suggestions are diverse but related to the original item.
Focus on quality recommendations that match the spirit and genre of the original item.

For imageSearchTerm: provide simple, descriptive terms that would find good images (e.g., "pulp fiction movie", "sushi restaurant", "tokyo skyline")

Example format:
[
  {
    "title": "Example Title",
    "description": "Brief description of why this is similar.",
    "imageSearchTerm": "example search term"
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

    // Validate suggestions format
    const suggestionsSchema = z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        imageSearchTerm: z.string().optional(),
      })
    );

    const validatedSuggestions = suggestionsSchema.parse(suggestions);

    // Fetch images from Unsplash for each suggestion
    const suggestionsWithImages = await Promise.all(
      validatedSuggestions.slice(0, 5).map(async (suggestion) => {
        let imageUrl: string | undefined;

        if (suggestion.imageSearchTerm) {
          try {
            // Use Unsplash API to get an image
            const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
            if (unsplashAccessKey) {
              const unsplashResponse = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                  suggestion.imageSearchTerm
                )}&per_page=1&orientation=landscape`,
                {
                  headers: {
                    Authorization: `Client-ID ${unsplashAccessKey}`,
                  },
                }
              );

              if (unsplashResponse.ok) {
                const data = await unsplashResponse.json();
                if (data.results && data.results.length > 0) {
                  imageUrl = data.results[0].urls.regular;
                }
              }
            }
          } catch (imageError) {
            console.error('Failed to fetch image:', imageError);
            // Continue without image if fetch fails
          }
        }

        return {
          title: suggestion.title,
          description: suggestion.description,
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
