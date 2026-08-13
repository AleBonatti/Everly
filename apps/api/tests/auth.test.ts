import { beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';
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

        const { cookieHeader, user } = await registerAndLogin(app, { name: 'Ada Lovelace', email: 'ada@example.com' });

        expect(user).toMatchObject({ name: 'Ada Lovelace', email: 'ada@example.com' });

        const categoriesResponse = await app.inject({
            method: 'GET',
            url: '/categories',
            headers: { cookie: cookieHeader },
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

    it('omits the token field from the response body for a plain web login', async () => {
        const app = createTestApp();
        await app.ready();

        await registerAndLogin(app, { email: 'webtoken@example.com', password: 'supersecret123' });

        const response = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: { email: 'webtoken@example.com', password: 'supersecret123' },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).not.toHaveProperty('token');

        await app.close();
    });

    it('includes a token in the response body when X-Client: mobile is sent', async () => {
        const app = createTestApp();
        await app.ready();

        await registerAndLogin(app, { email: 'mobiletoken@example.com', password: 'supersecret123' });

        const response = await app.inject({
            method: 'POST',
            url: '/auth/login',
            headers: { 'x-client': 'mobile' },
            payload: { email: 'mobiletoken@example.com', password: 'supersecret123' },
        });

        expect(response.statusCode).toBe(200);
        expect(typeof response.json().token).toBe('string');

        await app.close();
    });

    it('authenticates a protected route using only an Authorization bearer token, no cookie', async () => {
        const app = createTestApp();
        await app.ready();

        await registerAndLogin(app, { email: 'bearer@example.com', password: 'supersecret123' });

        const login = await app.inject({
            method: 'POST',
            url: '/auth/login',
            headers: { 'x-client': 'mobile' },
            payload: { email: 'bearer@example.com', password: 'supersecret123' },
        });
        const { token } = login.json();

        const response = await app.inject({
            method: 'GET',
            url: '/auth/me',
            headers: { authorization: `Bearer ${token}` },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().email).toBe('bearer@example.com');

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

    it('forgot-password always returns the same response, and issues a usable reset token when the email exists', async () => {
        const app = createTestApp();
        await app.ready();

        await registerAndLogin(app, { email: 'forgot@example.com' });

        const existing = await app.inject({
            method: 'POST',
            url: '/auth/forgot-password',
            payload: { email: 'forgot@example.com' },
        });
        const nonExistent = await app.inject({
            method: 'POST',
            url: '/auth/forgot-password',
            payload: { email: 'ghost@example.com' },
        });

        expect(existing.statusCode).toBe(200);
        expect(nonExistent.statusCode).toBe(200);
        expect(existing.json().message).toBe(nonExistent.json().message);

        const tokenRow = await db.query.passwordResetTokens.findFirst({});
        expect(tokenRow).toBeDefined();

        await app.close();
    });

    it('resets the password with a valid token, and the token cannot be reused', async () => {
        const app = createTestApp();
        await app.ready();

        await registerAndLogin(app, { email: 'reset@example.com' });
        await app.inject({ method: 'POST', url: '/auth/forgot-password', payload: { email: 'reset@example.com' } });

        const tokenRow = await db.query.passwordResetTokens.findFirst({});
        if (!tokenRow) {
            throw new Error('No reset token was created');
        }

        const firstAttempt = await app.inject({
            method: 'POST',
            url: '/auth/reset-password',
            payload: { token: tokenRow.token, password: 'brandnewpassword' },
        });

        expect(firstAttempt.statusCode).toBe(200);

        const loginWithNewPassword = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: { email: 'reset@example.com', password: 'brandnewpassword' },
        });
        expect(loginWithNewPassword.statusCode).toBe(200);

        const secondAttempt = await app.inject({
            method: 'POST',
            url: '/auth/reset-password',
            payload: { token: tokenRow.token, password: 'anotherpassword' },
        });
        expect(secondAttempt.statusCode).toBe(400);

        await app.close();
    });

    it('rejects reset-password with an invalid token', async () => {
        const app = createTestApp();
        await app.ready();

        const response = await app.inject({
            method: 'POST',
            url: '/auth/reset-password',
            payload: { token: 'not-a-real-token', password: 'somepassword' },
        });

        expect(response.statusCode).toBe(400);

        await app.close();
    });

    it('rejects login for an unverified account', async () => {
        const app = createTestApp();
        await app.ready();

        await app.inject({
            method: 'POST',
            url: '/auth/register',
            payload: { name: 'Unverified User', email: 'unverified@example.com', password: 'supersecret123' },
        });

        const response = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: { email: 'unverified@example.com', password: 'supersecret123' },
        });

        expect(response.statusCode).toBe(403);

        await app.close();
    });

    it('verifies email with a valid token and logs the user in, and the token cannot be reused', async () => {
        const app = createTestApp();
        await app.ready();

        await app.inject({
            method: 'POST',
            url: '/auth/register',
            payload: { name: 'Verify Me', email: 'verifyme@example.com', password: 'supersecret123' },
        });

        const tokenRow = await db.query.emailVerificationTokens.findFirst({});
        if (!tokenRow) {
            throw new Error('No verification token was created');
        }

        const firstAttempt = await app.inject({
            method: 'POST',
            url: '/auth/verify-email',
            payload: { token: tokenRow.token },
        });

        expect(firstAttempt.statusCode).toBe(200);
        expect(firstAttempt.cookies.some((c) => c.name === 'token')).toBe(true);

        const user = await db.query.users.findFirst({ where: eq(users.email, 'verifyme@example.com') });
        expect(user?.emailVerified).toBe(true);

        const secondAttempt = await app.inject({
            method: 'POST',
            url: '/auth/verify-email',
            payload: { token: tokenRow.token },
        });
        expect(secondAttempt.statusCode).toBe(400);

        await app.close();
    });

    it('resend-verification always returns the same response, regardless of account state', async () => {
        const app = createTestApp();
        await app.ready();

        await registerAndLogin(app, { email: 'alreadyverified@example.com' });

        const forAlreadyVerified = await app.inject({
            method: 'POST',
            url: '/auth/resend-verification',
            payload: { email: 'alreadyverified@example.com' },
        });
        const forNonExistent = await app.inject({
            method: 'POST',
            url: '/auth/resend-verification',
            payload: { email: 'ghost@example.com' },
        });

        expect(forAlreadyVerified.statusCode).toBe(200);
        expect(forNonExistent.statusCode).toBe(200);
        expect(forAlreadyVerified.json().message).toBe(forNonExistent.json().message);

        await app.close();
    });
});
