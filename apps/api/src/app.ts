import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import { sql } from 'drizzle-orm';
import {
    validatorCompiler,
    serializerCompiler,
    type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { db } from './db/index.js';

export function buildApp() {
    const app = Fastify({
        logger: true,
    }).withTypeProvider<ZodTypeProvider>();

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.register(cookie);

    app.register(jwt, {
        secret: process.env.JWT_SECRET!,
        cookie: {
            cookieName: 'token',
            signed: false,
        },
    });

    app.register(cors, {
        origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
        credentials: true,
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
