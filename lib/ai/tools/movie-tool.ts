/**
 * TMDB Movie Image Search Tool
 *
 * Integrates with The Movie Database (TMDB) API to fetch movie posters
 * and other movie-related images.
 */

import { BaseImageSearchTool } from '../image-tools';

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  overview: string;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

/**
 * Movie Image Search Tool using TMDB API
 */
export class MovieImageTool extends BaseImageSearchTool {
  private readonly apiKey: string;
  private readonly baseImageUrl = 'https://image.tmdb.org/t/p/w500';
  private readonly apiBaseUrl = 'https://api.themoviedb.org/3';

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || process.env.TMDB_API_KEY || '';
  }

  /**
   * Fetch movie image from TMDB
   */
  async fetchImage(searchQuery: string): Promise<string | undefined> {
    if (!this.apiKey) {
      console.warn('TMDB API key not configured');
      return this.getPlaceholderImage('cinema');
    }

    try {
      // Extract year from search query if present (e.g., "Pulp Fiction 1994")
      const yearMatch = searchQuery.match(/\b(19\d{2}|20\d{2})\b/);
      const year = yearMatch ? yearMatch[1] : undefined;

      // Remove year from query to get clean title
      const title = year
        ? searchQuery.replace(year, '').trim()
        : searchQuery;

      // Build search URL with title and optional year parameter
      let searchUrl = `${this.apiBaseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(title)}`;
      if (year) {
        searchUrl += `&year=${year}`;
      }

      const response = await fetch(searchUrl);

      if (!response.ok) {
        console.error('TMDB API error:', response.status, response.statusText);
        return this.getPlaceholderImage('cinema');
      }

      const data: TMDBSearchResponse = await response.json();

      if (!data.results || data.results.length === 0) {
        console.warn('No movie found for query:', searchQuery);
        return this.getPlaceholderImage('cinema');
      }

      // Get the first result (most relevant)
      const movie = data.results[0];

      // Prefer poster_path, fall back to backdrop_path
      const imagePath = movie.poster_path || movie.backdrop_path;

      if (!imagePath) {
        console.warn('No image available for movie:', movie.title);
        return this.getPlaceholderImage('cinema');
      }

      // Construct the full image URL
      const imageUrl = `${this.baseImageUrl}${imagePath}`;

      return imageUrl;
    } catch (error) {
      console.error('Error fetching movie image from TMDB:', error);
      return this.getPlaceholderImage('cinema');
    }
  }

  /**
   * Override validation to skip HEAD request for TMDB images
   * TMDB images are reliable and always accessible
   */
  async validateImageUrl(imageUrl: string): Promise<boolean> {
    // TMDB image URLs are reliable, skip validation to save API calls
    if (imageUrl.includes('image.tmdb.org')) {
      return true;
    }

    // For non-TMDB URLs, use the default validation
    return super.validateImageUrl(imageUrl);
  }
}
