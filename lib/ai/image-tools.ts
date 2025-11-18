/**
 * Image Search Tools Infrastructure
 *
 * Provides a modular system for fetching images based on content type.
 * Each tool implements a specific API integration (TMDB, Spotify, etc.)
 */

/**
 * Base interface for all image search tools
 */
export interface ImageSearchTool {
  /**
   * Fetch an image URL for the given search query
   * @param searchQuery - The search query string (e.g., "Pulp Fiction 1994 movie")
   * @returns Image URL or undefined if not found
   */
  fetchImage(searchQuery: string): Promise<string | undefined>;

  /**
   * Validate that an image URL is accessible (returns 200 status)
   * @param imageUrl - The URL to validate
   * @returns true if URL is valid and accessible
   */
  validateImageUrl(imageUrl: string): Promise<boolean>;
}

/**
 * Base abstract class for image search tools
 */
export abstract class BaseImageSearchTool implements ImageSearchTool {
  abstract fetchImage(searchQuery: string): Promise<string | undefined>;

  /**
   * Validate that an image URL returns a 200 status
   */
  async validateImageUrl(imageUrl: string): Promise<boolean> {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      return response.ok; // returns true if status is 200-299
    } catch (error) {
      console.error('URL validation failed:', error);
      return false;
    }
  }

  /**
   * Get a placeholder image URL based on content type
   */
  protected getPlaceholderImage(contentType: string): string {
    // Using a simple colored placeholder service
    const placeholders: Record<string, string> = {
      cinema: 'https://placehold.co/600x400/4a5568/ffffff?text=Movie',
      music: 'https://placehold.co/600x400/7c3aed/ffffff?text=Music',
      place: 'https://placehold.co/600x400/059669/ffffff?text=Place',
      book: 'https://placehold.co/600x400/dc2626/ffffff?text=Book',
      food: 'https://placehold.co/600x400/ea580c/ffffff?text=Food',
      generic: 'https://placehold.co/600x400/64748b/ffffff?text=Item',
    };

    return placeholders[contentType] || placeholders.generic;
  }
}

/**
 * Placeholder tool for content types without specific implementation
 */
export class GenericImageTool extends BaseImageSearchTool {
  async fetchImage(_searchQuery: string): Promise<string | undefined> {
    // Return generic placeholder
    return this.getPlaceholderImage('generic');
  }
}

/**
 * Helper function to get placeholder image URL
 */
export function getPlaceholderImageUrl(contentType: string): string {
  const placeholders: Record<string, string> = {
    cinema: 'https://placehold.co/600x400/4a5568/ffffff?text=Movie',
    music: 'https://placehold.co/600x400/7c3aed/ffffff?text=Music',
    place: 'https://placehold.co/600x400/059669/ffffff?text=Place',
    book: 'https://placehold.co/600x400/dc2626/ffffff?text=Book',
    food: 'https://placehold.co/600x400/ea580c/ffffff?text=Food',
    generic: 'https://placehold.co/600x400/64748b/ffffff?text=Item',
  };

  return placeholders[contentType] || placeholders.generic;
}

/**
 * Tool registry mapping content types to their respective tools
 */
export class ImageToolRegistry {
  private tools: Map<string, ImageSearchTool> = new Map();

  /**
   * Register a tool for a specific content type
   */
  register(contentType: string, tool: ImageSearchTool): void {
    this.tools.set(contentType, tool);
  }

  /**
   * Get the appropriate tool for a content type
   */
  getTool(contentType: string): ImageSearchTool {
    return this.tools.get(contentType) || new GenericImageTool();
  }

  /**
   * Get an image URL based on content type, title, and optional year
   */
  async getImage(
    contentType: string,
    title: string,
    year?: string
  ): Promise<string | undefined> {
    if (!title || title.trim() === '') {
      // Return placeholder if no title
      return getPlaceholderImageUrl(contentType);
    }

    const tool = this.getTool(contentType);

    // Build search query from title and year
    const searchQuery = year ? `${title} ${year}` : title;
    const imageUrl = await tool.fetchImage(searchQuery);

    if (!imageUrl) {
      return getPlaceholderImageUrl(contentType);
    }

    // Validate the URL
    const isValid = await tool.validateImageUrl(imageUrl);

    if (!isValid) {
      console.warn(
        `Image URL validation failed for ${contentType}: ${imageUrl}`
      );
      return getPlaceholderImageUrl(contentType);
    }

    return imageUrl;
  }
}

/**
 * Global registry instance
 */
export const imageToolRegistry = new ImageToolRegistry();
