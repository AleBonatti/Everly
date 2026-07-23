import { beforeEach, describe, expect, it } from 'vitest';
import { createTestApp } from './helpers/app.js';
import { resetDatabase } from './helpers/db.js';
import { registerAndLogin } from './helpers/auth.js';
import { createCategory } from './helpers/categories.js';

describe('items', () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it('creates an item under an owned category', async () => {
        const app = createTestApp();
        await app.ready();
        const { cookieHeader } = await registerAndLogin(app);
        const category = await createCategory(app, cookieHeader);

        const response = await app.inject({
            method: 'POST',
            url: '/items',
            headers: { cookie: cookieHeader },
            payload: { categoryId: category.id, title: 'Try the tasting menu' },
        });

        expect(response.statusCode).toBe(201);
        expect(response.json()).toMatchObject({ title: 'Try the tasting menu', categoryId: category.id });

        await app.close();
    });

    it("rejects creating an item under another user's category", async () => {
        const app = createTestApp();
        await app.ready();
        const owner = await registerAndLogin(app, { email: 'owner2@example.com' });
        const intruder = await registerAndLogin(app, { email: 'intruder2@example.com' });
        const category = await createCategory(app, owner.cookieHeader);

        const response = await app.inject({
            method: 'POST',
            url: '/items',
            headers: { cookie: intruder.cookieHeader },
            payload: { categoryId: category.id, title: 'Should fail' },
        });

        expect(response.statusCode).toBe(404);

        await app.close();
    });

    it('updates and deletes an item', async () => {
        const app = createTestApp();
        await app.ready();
        const { cookieHeader } = await registerAndLogin(app);
        const category = await createCategory(app, cookieHeader);

        const created = await app.inject({
            method: 'POST',
            url: '/items',
            headers: { cookie: cookieHeader },
            payload: { categoryId: category.id, title: 'Original title' },
        });
        const item = created.json();

        const updated = await app.inject({
            method: 'PATCH',
            url: `/items/${item.id}`,
            headers: { cookie: cookieHeader },
            payload: { title: 'Updated title', importance: 5 },
        });
        expect(updated.statusCode).toBe(200);
        expect(updated.json()).toMatchObject({ title: 'Updated title', importance: 5 });

        const deleted = await app.inject({
            method: 'DELETE',
            url: `/items/${item.id}`,
            headers: { cookie: cookieHeader },
        });
        expect(deleted.statusCode).toBe(200);

        await app.close();
    });

    it('filters and paginates the items list', async () => {
        const app = createTestApp();
        await app.ready();
        const { cookieHeader } = await registerAndLogin(app);
        const category = await createCategory(app, cookieHeader);

        for (let i = 1; i <= 14; i++) {
            await app.inject({
                method: 'POST',
                url: '/items',
                headers: { cookie: cookieHeader },
                payload: { categoryId: category.id, title: `Item ${i}` },
            });
        }

        const firstPage = await app.inject({
            method: 'GET',
            url: '/items?page=1&pageSize=12',
            headers: { cookie: cookieHeader },
        });
        const body = firstPage.json();
        expect(body.items).toHaveLength(12);
        expect(body.total).toBe(14);

        const search = await app.inject({
            method: 'GET',
            url: '/items?q=Item%2010',
            headers: { cookie: cookieHeader },
        });
        expect(search.json().items).toHaveLength(1);

        await app.close();
    });

    it("can't see another user's items", async () => {
        const app = createTestApp();
        await app.ready();
        const owner = await registerAndLogin(app, { email: 'owner3@example.com' });
        const intruder = await registerAndLogin(app, { email: 'intruder3@example.com' });
        const category = await createCategory(app, owner.cookieHeader);

        await app.inject({
            method: 'POST',
            url: '/items',
            headers: { cookie: owner.cookieHeader },
            payload: { categoryId: category.id, title: 'Private item' },
        });

        const response = await app.inject({
            method: 'GET',
            url: '/items',
            headers: { cookie: intruder.cookieHeader },
        });

        expect(response.json().items).toHaveLength(0);

        await app.close();
    });
});
