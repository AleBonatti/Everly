import { beforeEach, describe, expect, it } from 'vitest';
import { createTestApp } from './helpers/app.js';
import { resetDatabase } from './helpers/db.js';
import { registerAndLogin } from './helpers/auth.js';
import { createCategory } from './helpers/categories.js';

describe('categories', () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it('creates a category', async () => {
        const app = createTestApp();
        await app.ready();
        const { cookieHeader } = await registerAndLogin(app);

        const response = await app.inject({
            method: 'POST',
            url: '/categories',
            headers: { cookie: cookieHeader },
            payload: { name: 'Restaurants', color: '#ef4444' },
        });

        expect(response.statusCode).toBe(201);
        expect(response.json()).toMatchObject({ name: 'Restaurants', color: '#ef4444', isDefault: false });

        await app.close();
    });

    it('rejects a color outside the fixed palette', async () => {
        const app = createTestApp();
        await app.ready();
        const { cookieHeader } = await registerAndLogin(app);

        const response = await app.inject({
            method: 'POST',
            url: '/categories',
            headers: { cookie: cookieHeader },
            payload: { name: 'Bad', color: '#000000' },
        });

        expect(response.statusCode).toBe(400);

        await app.close();
    });

    it('updates a category', async () => {
        const app = createTestApp();
        await app.ready();
        const { cookieHeader } = await registerAndLogin(app);
        const category = await createCategory(app, cookieHeader);

        const response = await app.inject({
            method: 'PATCH',
            url: `/categories/${category.id}`,
            headers: { cookie: cookieHeader },
            payload: { name: 'Renamed' },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().name).toBe('Renamed');

        await app.close();
    });

    it('deletes an empty category', async () => {
        const app = createTestApp();
        await app.ready();
        const { cookieHeader } = await registerAndLogin(app);
        const category = await createCategory(app, cookieHeader);

        const response = await app.inject({
            method: 'DELETE',
            url: `/categories/${category.id}`,
            headers: { cookie: cookieHeader },
        });

        expect(response.statusCode).toBe(200);

        await app.close();
    });

    it('blocks deleting a category that still has items', async () => {
        const app = createTestApp();
        await app.ready();
        const { cookieHeader } = await registerAndLogin(app);
        const category = await createCategory(app, cookieHeader);

        await app.inject({
            method: 'POST',
            url: '/items',
            headers: { cookie: cookieHeader },
            payload: { categoryId: category.id, title: 'Something worth doing' },
        });

        const response = await app.inject({
            method: 'DELETE',
            url: `/categories/${category.id}`,
            headers: { cookie: cookieHeader },
        });

        expect(response.statusCode).toBe(409);

        await app.close();
    });

    it("can't access another user's category", async () => {
        const app = createTestApp();
        await app.ready();
        const owner = await registerAndLogin(app, { email: 'owner@example.com' });
        const intruder = await registerAndLogin(app, { email: 'intruder@example.com' });
        const category = await createCategory(app, owner.cookieHeader);

        const response = await app.inject({
            method: 'DELETE',
            url: `/categories/${category.id}`,
            headers: { cookie: intruder.cookieHeader },
        });

        expect(response.statusCode).toBe(404);

        await app.close();
    });
});
