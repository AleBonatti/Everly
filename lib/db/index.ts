/**
 * Database Connection
 *
 * Sets up the Drizzle ORM database connection using postgres driver.
 * For use in Vercel serverless functions.
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Create a singleton connection
let connection: ReturnType<typeof postgres> | null = null
let db: ReturnType<typeof drizzle<typeof schema>> | null = null

/**
 * Get or create the database connection
 * Uses connection pooling for serverless environments
 */
export function getDb() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    // Create postgres connection
    // For serverless, we use a single connection with no pooling
    connection = postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    })

    db = drizzle(connection, { schema })
  }

  return db
}

/**
 * Close the database connection
 * Call this in serverless cleanup if needed
 */
export async function closeDb() {
  if (connection) {
    await connection.end()
    connection = null
    db = null
  }
}

// Export schema for convenience
export * from './schema'
