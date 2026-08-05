import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import {
    registerInputSchema,
    loginInputSchema,
    authUserSchema,
    errorResponseSchema,
    forgotPasswordInputSchema,
    resetPasswordInputSchema,
    verifyEmailInputSchema,
    resendVerificationInputSchema,
} from '@everly/shared';
import { db } from '../db/index.js';
import { users, categories, passwordResetTokens, emailVerificationTokens } from '../db/schema.js';
import { sendEmail } from '../lib/email.js';

const DEFAULT_CATEGORIES = [
    { name: 'Food', color: '#f97316' },
    { name: 'Travel', color: '#3b82f6' },
    { name: 'Free time', color: '#22c55e' },
];

function isProduction() {
    return process.env.NODE_ENV === 'production';
}

function generateToken() {
    return randomBytes(32).toString('hex');
}

async function sendVerificationEmail(userId: string, email: string) {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(emailVerificationTokens).values({ userId, token, expiresAt });

    const verifyUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
    await sendEmail({
        to: email,
        subject: 'Verify your Everly email',
        html: `<p>Click the link below to verify your email address. This link expires in 24 hours.</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });
}

async function issueSession(reply: import('fastify').FastifyReply, userId: string) {
    const token = await reply.jwtSign({ sub: userId }, { expiresIn: '7d' });
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
                const [newUser] = await tx.insert(users).values({ name, email, passwordHash }).returning();

                if (!newUser) {
                    throw new Error('Failed to create user');
                }

                await tx.insert(categories).values(
                    DEFAULT_CATEGORIES.map((category) => ({
                        userId: newUser.id,
                        isDefault: true,
                        ...category,
                    })),
                );

                return newUser;
            });

            try {
                await sendVerificationEmail(user.id, user.email);
            } catch (err) {
                app.log.error(err, 'Failed to send verification email');
            }

            return reply.status(201).send({ id: user.id, name: user.name, email: user.email });
        },
    );

    app.post(
        '/login',
        {
            schema: {
                body: loginInputSchema,
                response: { 200: authUserSchema, 401: errorResponseSchema, 403: errorResponseSchema },
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

            if (!user.emailVerified) {
                return reply.status(403).send({ message: 'Please verify your email before logging in' });
            }

            await issueSession(reply, user.id);

            return reply.send({ id: user.id, name: user.name, email: user.email });
        },
    );

    app.post(
        '/forgot-password',
        {
            schema: {
                body: forgotPasswordInputSchema,
                response: { 200: errorResponseSchema },
            },
        },
        async (request, reply) => {
            const { email } = request.body;

            const user = await db.query.users.findFirst({
                where: eq(users.email, email),
            });

            if (user) {
                const token = generateToken();
                const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

                await db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt });

                const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
                try {
                    await sendEmail({
                        to: user.email,
                        subject: 'Reset your Everly password',
                        html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
                    });
                } catch (err) {
                    app.log.error(err, 'Failed to send password reset email');
                }
            }

            return reply.send({ message: 'If that email exists, we have sent a reset link.' });
        },
    );

    app.post(
        '/reset-password',
        {
            schema: {
                body: resetPasswordInputSchema,
                response: { 200: errorResponseSchema, 400: errorResponseSchema },
            },
        },
        async (request, reply) => {
            const { token, password } = request.body;

            const resetToken = await db.query.passwordResetTokens.findFirst({
                where: eq(passwordResetTokens.token, token),
            });

            if (!resetToken || resetToken.expiresAt < new Date()) {
                return reply.status(400).send({ message: 'Invalid or expired token' });
            }

            const passwordHash = await argon2.hash(password);

            await db.transaction(async (tx) => {
                await tx.update(users).set({ passwordHash }).where(eq(users.id, resetToken.userId));
                await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.id, resetToken.id));
            });

            return reply.send({ message: 'Password updated successfully' });
        },
    );

    app.post(
        '/verify-email',
        {
            schema: {
                body: verifyEmailInputSchema,
                response: { 200: authUserSchema, 400: errorResponseSchema },
            },
        },
        async (request, reply) => {
            const { token } = request.body;

            const verificationToken = await db.query.emailVerificationTokens.findFirst({
                where: eq(emailVerificationTokens.token, token),
            });

            if (!verificationToken || verificationToken.expiresAt < new Date()) {
                return reply.status(400).send({ message: 'Invalid or expired token' });
            }

            await db.transaction(async (tx) => {
                await tx.update(users).set({ emailVerified: true }).where(eq(users.id, verificationToken.userId));
                await tx.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, verificationToken.id));
            });

            const user = await db.query.users.findFirst({
                where: eq(users.id, verificationToken.userId),
            });

            if (!user) {
                return reply.status(400).send({ message: 'Invalid or expired token' });
            }

            await issueSession(reply, user.id);

            return reply.send({ id: user.id, name: user.name, email: user.email });
        },
    );

    app.post(
        '/resend-verification',
        {
            schema: {
                body: resendVerificationInputSchema,
                response: { 200: errorResponseSchema },
            },
        },
        async (request, reply) => {
            const { email } = request.body;

            const user = await db.query.users.findFirst({
                where: eq(users.email, email),
            });

            if (user && !user.emailVerified) {
                try {
                    await sendVerificationEmail(user.id, user.email);
                } catch (err) {
                    app.log.error(err, 'Failed to send verification email');
                }
            }

            return reply.send({ message: 'If that account needs verification, we have sent a new email.' });
        },
    );

    app.get(
        '/me',
        {
            preHandler: [app.authenticate],
            schema: { response: { 200: authUserSchema, 401: errorResponseSchema } },
        },
        async (request, reply) => {
            const user = await db.query.users.findFirst({
                where: eq(users.id, request.user.sub),
            });

            if (!user) {
                return reply.status(401).send({ message: 'Unauthorized' });
            }

            return reply.send({ id: user.id, name: user.name, email: user.email });
        },
    );

    app.post('/logout', async (_request, reply) => {
        reply.clearCookie('token', {
            path: '/',
            secure: isProduction(),
            sameSite: isProduction() ? 'none' : 'lax',
        });
        return reply.send({ message: 'Logged out' });
    });
};
