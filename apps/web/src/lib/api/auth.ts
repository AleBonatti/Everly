import { authUserSchema, errorResponseSchema, type RegisterInput, type LoginInput } from '@everly/shared';
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

export function getMe() {
    return request('/auth/me', authUserSchema);
}

export function logout() {
    return request('/auth/logout', errorResponseSchema, { method: 'POST' });
}
