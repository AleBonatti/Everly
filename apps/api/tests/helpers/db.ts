import { sql } from 'drizzle-orm';
import { db } from '../../src/db/index.js';

export async function resetDatabase() {
    await db.execute(sql`TRUNCATE TABLE items, categories, users CASCADE`);
}
