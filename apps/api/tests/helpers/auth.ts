import type { FastifyInstance } from 'fastify';

export async function registerAndLogin(app: FastifyInstance, overrides: Partial<{ name: string; email: string; password: string }> = {}) {
    const user = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'supersecret123',
        ...overrides,
    };

    const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: user,
    });

    const cookie = response.cookies.find((c) => c.name === 'token');
    if (!cookie) {
        throw new Error('No auth cookie returned from register');
    }

    return {
        cookieHeader: `${cookie.name}=${cookie.value}`,
        user: response.json(),
    };
}
