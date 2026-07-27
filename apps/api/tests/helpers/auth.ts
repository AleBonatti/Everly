import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../../src/db/index.js';
import { users } from '../../src/db/schema.js';

export async function registerAndLogin(app: FastifyInstance, overrides: Partial<{ name: string; email: string; password: string }> = {}) {
    const user = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'supersecret123',
        ...overrides,
    };

    const registerResponse = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: user,
    });

    await db.update(users).set({ emailVerified: true }).where(eq(users.email, user.email));

    const loginResponse = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: user.email, password: user.password },
    });

    const cookie = loginResponse.cookies.find((c) => c.name === 'token');
    if (!cookie) {
        throw new Error('No auth cookie returned from login');
    }

    return {
        cookieHeader: `${cookie.name}=${cookie.value}`,
        user: registerResponse.json(),
    };
}
