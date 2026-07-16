import Fastify from 'fastify';
import { sql } from 'drizzle-orm';
import { db } from './db/index.js';

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.get('/health', async (_request, reply) => {
    try {
      await db.execute(sql`select 1`);
      return { status: 'ok' };
    } catch (err) {
      app.log.error(err);
      reply.status(503);
      return { status: 'error' };
    }
  });

  return app;
}
