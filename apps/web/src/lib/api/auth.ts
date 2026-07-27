import {
    authUserSchema,
    errorResponseSchema,
    type RegisterInput,
    type LoginInput,
    type ForgotPasswordInput,
    type ResetPasswordInput,
    type VerifyEmailInput,
    type ResendVerificationInput,
} from '@everly/shared';

import { request } from '../api-client';

export function register(input: RegisterInput) {
    return request('/auth/register', authUserSchema, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export function login(input: LoginInput) {
    return request('/auth/login', authUserSchema, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export function forgotPassword(input: ForgotPasswordInput) {
    return request('/auth/forgot-password', errorResponseSchema, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export function resetPassword(input: ResetPasswordInput) {
    return request('/auth/reset-password', errorResponseSchema, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export function verifyEmail(input: VerifyEmailInput) {
    return request('/auth/verify-email', errorResponseSchema, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export function resendVerification(input: ResendVerificationInput) {
    return request('/auth/resend-verification', errorResponseSchema, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export function getMe() {
    return request('/auth/me', authUserSchema);
}

export function logout() {
    return request('/auth/logout', errorResponseSchema, { method: 'POST' });
}
