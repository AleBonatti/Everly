/**
 * Google Books Image Search Tool
 *
 * Integrates with Google Books API to fetch book cover images
 * Google Books API doesn't require authentication for basic searches
 */

import { BaseImageSearchTool } from '../image-tools';

export interface GoogleBooksVolumeInfo {
  title: string;
  authors?: string[];
  publishedDate?: string;
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    extraLarge?: string;
  };
}

export interface GoogleBooksVolume {
  id: string;
  volumeInfo: GoogleBooksVolumeInfo;
}

export interface GoogleBooksSearchResponse {
  totalItems: number;
  items?: GoogleBooksVolume[];
}

/**
 * Book Image Search Tool using Google Books API
 *
 * Google Books API is free to use but has usage limits:
 * - No API key required for basic searches (1000 requests/day)
 * - Optional: Add GOOGLE_BOOKS_API_KEY to .env.local for higher limits
 * - Get API key from https://console.cloud.google.com/apis/credentials
 */
export class BookImageTool extends BaseImageSearchTool {
  private readonly apiKey: string;
  private readonly apiBaseUrl = 'https://www.googleapis.com/books/v1';

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || process.env.GOOGLE_BOOKS_API_KEY || '';
  }

  /**
   * Fetch book cover image from Google Books
   */
  async fetchImage(searchQuery: string): Promise<string | undefined> {
    try {
      // Extract year from search query if present
      const yearMatch = searchQuery.match(/\b(19\d{2}|20\d{2})\b/);
      const year = yearMatch ? yearMatch[1] : undefined;

      // Remove year from query to get clean search term
      const searchTerm = year
        ? searchQuery.replace(year, '').trim()
        : searchQuery;

      // Build Google Books search query
      // Use intitle for more accurate results
      const query = `intitle:${encodeURIComponent(searchTerm)}`;

      // Build search URL with optional API key
      const searchUrl = this.apiKey
        ? `${this.apiBaseUrl}/volumes?q=${query}&maxResults=1&printType=books&key=${this.apiKey}`
        : `${this.apiBaseUrl}/volumes?q=${query}&maxResults=1&printType=books`;

      const response = await fetch(searchUrl);

      if (!response.ok) {
        console.error(
          'Google Books API error:',
          response.status,
          response.statusText
        );
        return this.getPlaceholderImage('book');
      }

      const data: GoogleBooksSearchResponse = await response.json();

      if (!data.items || data.items.length === 0) {
        console.warn('No book found for query:', searchQuery);
        return this.getPlaceholderImage('book');
      }

      const book = data.items[0];
      const imageLinks = book.volumeInfo.imageLinks;

      if (!imageLinks) {
        console.warn('No cover image available for book:', book.volumeInfo.title);
        return this.getPlaceholderImage('book');
      }

      // Google Books provides multiple image sizes
      // Priority: large > medium > thumbnail > smallThumbnail
      // Note: Google Books returns HTTP URLs by default, we'll upgrade to HTTPS
      let imageUrl =
        imageLinks.large ||
        imageLinks.medium ||
        imageLinks.thumbnail ||
        imageLinks.smallThumbnail;

      if (!imageUrl) {
        console.warn('No valid image URL for book:', book.volumeInfo.title);
        return this.getPlaceholderImage('book');
      }

      // Upgrade HTTP to HTTPS (Google Books images work with HTTPS)
      imageUrl = imageUrl.replace('http://', 'https://');

      // Optional: Filter by year if provided (check publishedDate)
      if (year && book.volumeInfo.publishedDate) {
        const publishedYear = book.volumeInfo.publishedDate.substring(0, 4);
        // If year doesn't match, we could search again with a different filter
        // For now, we'll just log a warning
        if (publishedYear !== year) {
          console.warn(
            `Year mismatch: requested ${year}, found ${publishedYear} for "${book.volumeInfo.title}"`
          );
        }
      }

      return imageUrl;
    } catch (error) {
      console.error('Error fetching book image from Google Books:', error);
      return this.getPlaceholderImage('book');
    }
  }

  /**
   * Override validation to skip HEAD request for Google Books images
   * Google Books images are reliable and always accessible
   */
  async validateImageUrl(imageUrl: string): Promise<boolean> {
    // Google Books image URLs are reliable, skip validation to save API calls
    if (
      imageUrl.includes('books.google.com') ||
      imageUrl.includes('books.googleusercontent.com')
    ) {
      return true;
    }

    // For non-Google Books URLs, use the default validation
    return super.validateImageUrl(imageUrl);
  }
}
