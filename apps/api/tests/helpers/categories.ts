import type { FastifyInstance } from 'fastify';

export async function createCategory(app: FastifyInstance, cookieHeader: string, overrides: Partial<{ name: string; color: string }> = {}) {
    const response = await app.inject({
        method: 'POST',
        url: '/categories',
        headers: { cookie: cookieHeader },
        payload: { name: 'Test Category', color: '#ef4444', ...overrides },
    });
    return response.json();
}
