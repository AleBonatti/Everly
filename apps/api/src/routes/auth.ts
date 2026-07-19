import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import {
    registerInputSchema,
    loginInputSchema,
    authUserSchema,
    errorResponseSchema,
} from '@everly/shared';
import { db } from '../db/index.js';
import { users, categories } from '../db/schema.js';

const DEFAULT_CATEGORIES = ['Food', 'Travel', 'Free time'];

function isProduction() {
    return process.env.NODE_ENV === 'production';
}

async function issueSession(reply: import('fastify').FastifyReply, userId: string) {
    const token = await reply.jwtSign({ sub: userId });
    reply.setCookie('token', token, {
        httpOnly: true,
        secure: isProduction(),
        sameSite: isProduction() ? 'none' : 'lax',
        path: '/',
    });
}

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
    app.post(
        '/register',
        {
            schema: {
                body: registerInputSchema,
                response: { 201: authUserSchema, 409: errorResponseSchema },
            },
        },

        async (request, reply) => {
            const { name, email, password } = request.body;

            const existing = await db.query.users.findFirst({
                where: eq(users.email, email),
            });

            if (existing) {
                return reply.status(409).send({ message: 'Email already in use' });
            }

            const passwordHash = await argon2.hash(password);

            const user = await db.transaction(async (tx) => {
                const [newUser] = await tx
                    .insert(users)
                    .values({ name, email, passwordHash })
                    .returning();

                if (!newUser) {
                    throw new Error('Failed to create user');
                }

                await tx.insert(categories).values(
                    DEFAULT_CATEGORIES.map((categoryName) => ({
                        userId: newUser.id,
                        name: categoryName,
                        isDefault: true,
                    })),
                );

                return newUser;
            });

            await issueSession(reply, user.id);

            return reply.status(201).send({ id: user.id, name: user.name, email: user.email });
        },
    );

    app.post(
        '/login',
        {
            schema: {
                body: loginInputSchema,
                response: { 200: authUserSchema, 401: errorResponseSchema },
            },
        },

        async (request, reply) => {
            const { email, password } = request.body;

            const user = await db.query.users.findFirst({
                where: eq(users.email, email),
            });

            if (!user || !(await argon2.verify(user.passwordHash, password))) {
                return reply.status(401).send({ message: 'Invalid email or password' });
            }

            await issueSession(reply, user.id);

            return reply.send({ id: user.id, name: user.name, email: user.email });
        },
    );

    app.post('/logout', async (_request, reply) => {
        reply.clearCookie('token', { path: '/' });
        return reply.send({ message: 'Logged out' });
    });
};
