import { sql } from 'drizzle-orm';
import { db } from '../../src/db/index.js';

export async function resetDatabase() {
    await db.execute(sql`TRUNCATE TABLE items, categories, users, password_reset_tokens, email_verification_tokens CASCADE`);
}
