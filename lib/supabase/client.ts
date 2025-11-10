import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

/**
 * Supabase browser client for client-side operations
 * Used in Client Components for authentication and real-time subscriptions
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
