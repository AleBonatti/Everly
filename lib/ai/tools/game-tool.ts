/**
 * IGDB Game Image Search Tool
 *
 * Integrates with IGDB (Internet Game Database) API to fetch game cover images
 * IGDB is a Twitch service that provides comprehensive game data
 */

import { BaseImageSearchTool } from '../image-tools';

export interface IGDBGame {
  id: number;
  name: string;
  cover?: {
    id: number;
    image_id: string;
    url: string;
  };
  first_release_date?: number;
}

/**
 * Game Image Search Tool using IGDB API
 *
 * IGDB requires Twitch OAuth for authentication:
 * 1. Register your app at https://dev.twitch.tv/console/apps
 * 2. Get Client ID and Client Secret
 * 3. Add IGDB_CLIENT_ID and IGDB_CLIENT_SECRET to .env.local
 */
export class GameImageTool extends BaseImageSearchTool {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly apiBaseUrl = 'https://api.igdb.com/v4';
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(clientId?: string, clientSecret?: string) {
    super();
    this.clientId = clientId || process.env.IGDB_CLIENT_ID || '';
    this.clientSecret = clientSecret || process.env.IGDB_CLIENT_SECRET || '';
  }

  /**
   * Get or refresh OAuth access token from Twitch
   */
  private async getAccessToken(): Promise<string | null> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      console.warn('IGDB credentials not configured');
      return null;
    }

    try {
      const response = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`,
        { method: 'POST' }
      );

      if (!response.ok) {
        console.error(
          'IGDB OAuth error:',
          response.status,
          response.statusText
        );
        return null;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Token expires in seconds, convert to milliseconds and subtract 5 minutes for safety
      this.tokenExpiry = Date.now() + data.expires_in * 1000 - 300000;

      return this.accessToken;
    } catch (error) {
      console.error('Error getting IGDB access token:', error);
      return null;
    }
  }

  /**
   * Fetch game cover image from IGDB
   */
  async fetchImage(searchQuery: string): Promise<string | undefined> {
    const token = await this.getAccessToken();

    if (!token) {
      console.warn('IGDB authentication failed');
      return this.getPlaceholderImage('game');
    }

    try {
      // Extract year from search query if present
      const yearMatch = searchQuery.match(/\b(19\d{2}|20\d{2})\b/);
      const year = yearMatch ? yearMatch[1] : undefined;

      // Remove year from query to get clean title
      const title = year ? searchQuery.replace(year, '').trim() : searchQuery;

      // Try with year filter first if available, then fallback without year
      let data: IGDBGame[] = [];

      // Attempt 1: With year filter if available
      if (year) {
        const yearStart = Math.floor(new Date(`${year}-01-01`).getTime() / 1000);
        const yearEnd = Math.floor(new Date(`${year}-12-31`).getTime() / 1000);

        const queryWithYear = `fields name,cover.image_id,first_release_date; where name ~ *"${title}"* & cover != null & first_release_date >= ${yearStart} & first_release_date <= ${yearEnd}; limit 1;`;

        const responseWithYear = await fetch(`${this.apiBaseUrl}/games`, {
          method: 'POST',
          headers: {
            'Client-ID': this.clientId,
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: queryWithYear,
        });

        if (responseWithYear.ok) {
          data = await responseWithYear.json();
        } else {
          console.warn('IGDB query with year failed, trying without year');
        }
      }

      // Attempt 2: Without year filter (fallback or if no year provided)
      if (!data || data.length === 0) {
        const queryNoYear = `fields name,cover.image_id,first_release_date; where name ~ *"${title}"* & cover != null; sort popularity desc; limit 1;`;

        const response = await fetch(`${this.apiBaseUrl}/games`, {
          method: 'POST',
          headers: {
            'Client-ID': this.clientId,
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: queryNoYear,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('IGDB API error:', response.status, response.statusText, errorText);
          console.error('Query was:', queryNoYear);
          return this.getPlaceholderImage('game');
        }

        data = await response.json();
      }

      if (!data || data.length === 0) {
        console.warn('No game found for query:', searchQuery);
        return this.getPlaceholderImage('game');
      }

      const game = data[0];

      if (!game.cover || !game.cover.image_id) {
        console.warn('No cover available for game:', game.name);
        return this.getPlaceholderImage('game');
      }

      // Construct IGDB image URL
      // Image sizes: cover_small (90x128), cover_big (264x374), 720p, 1080p
      // Using cover_big for good quality
      const imageUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`;

      return imageUrl;
    } catch (error) {
      console.error('Error fetching game image from IGDB:', error);
      return this.getPlaceholderImage('game');
    }
  }

  /**
   * Override validation to skip HEAD request for IGDB images
   * IGDB images are reliable and always accessible
   */
  async validateImageUrl(imageUrl: string): Promise<boolean> {
    // IGDB image URLs are reliable, skip validation to save API calls
    if (imageUrl.includes('images.igdb.com')) {
      return true;
    }

    // For non-IGDB URLs, use the default validation
    return super.validateImageUrl(imageUrl);
  }
}
