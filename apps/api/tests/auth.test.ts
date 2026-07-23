import { beforeEach, describe, expect, it } from 'vitest';
import { createTestApp } from './helpers/app.js';
import { resetDatabase } from './helpers/db.js';
import { registerAndLogin } from './helpers/auth.js';

describe('auth', () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it('registers a new user and creates default categories', async () => {
        const app = createTestApp();
        await app.ready();

        const response = await app.inject({
            method: 'POST',
            url: '/auth/register',
            payload: { name: 'Ada Lovelace', email: 'ada@example.com', password: 'supersecret123' },
        });

        expect(response.statusCode).toBe(201);
        expect(response.json()).toMatchObject({ name: 'Ada Lovelace', email: 'ada@example.com' });

        const cookie = response.cookies.find((c) => c.name === 'token');
        const categoriesResponse = await app.inject({
            method: 'GET',
            url: '/categories',
            headers: { cookie: `${cookie?.name}=${cookie?.value}` },
        });
        expect(categoriesResponse.json()).toHaveLength(3);

        await app.close();
    });

    it('rejects registering with an already-used email', async () => {
        const app = createTestApp();
        await app.ready();

        await registerAndLogin(app, { email: 'dupe@example.com' });

        const response = await app.inject({
            method: 'POST',
            url: '/auth/register',
            payload: { name: 'Someone Else', email: 'dupe@example.com', password: 'anotherpassword' },
        });

        expect(response.statusCode).toBe(409);

        await app.close();
    });

    it('logs in with correct credentials', async () => {
        const app = createTestApp();
        await app.ready();

        await registerAndLogin(app, { email: 'login@example.com', password: 'supersecret123' });

        const response = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: { email: 'login@example.com', password: 'supersecret123' },
        });

        expect(response.statusCode).toBe(200);
        expect(response.cookies.some((c) => c.name === 'token')).toBe(true);

        await app.close();
    });

    it('rejects login with the wrong password, and a non-existent email, identically', async () => {
        const app = createTestApp();
        await app.ready();

        await registerAndLogin(app, { email: 'wrongpw@example.com', password: 'supersecret123' });

        const wrongPassword = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: { email: 'wrongpw@example.com', password: 'incorrect' },
        });
        const nonExistent = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: { email: 'ghost@example.com', password: 'whatever123' },
        });

        expect(wrongPassword.statusCode).toBe(401);
        expect(nonExistent.statusCode).toBe(401);
        expect(wrongPassword.json().message).toBe(nonExistent.json().message);

        await app.close();
    });

    it('returns the current user for an authenticated request, and rejects an unauthenticated one', async () => {
        const app = createTestApp();
        await app.ready();

        const { cookieHeader, user } = await registerAndLogin(app, { email: 'me@example.com' });

        const authed = await app.inject({ method: 'GET', url: '/auth/me', headers: { cookie: cookieHeader } });
        const unauthed = await app.inject({ method: 'GET', url: '/auth/me' });

        expect(authed.statusCode).toBe(200);
        expect(authed.json().email).toBe(user.email);
        expect(unauthed.statusCode).toBe(401);

        await app.close();
    });

    it('clears the session cookie on logout', async () => {
        const app = createTestApp();
        await app.ready();

        const { cookieHeader } = await registerAndLogin(app, { email: 'logout@example.com' });

        const response = await app.inject({ method: 'POST', url: '/auth/logout', headers: { cookie: cookieHeader } });

        expect(response.statusCode).toBe(200);
        const clearedCookie = response.cookies.find((c) => c.name === 'token');
        expect(clearedCookie?.value).toBe('');

        await app.close();
    });
});
