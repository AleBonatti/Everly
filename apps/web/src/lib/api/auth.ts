import { authUserSchema, type LoginInput } from '@everly/shared';
import { request } from '../api-client';

export function login(input: LoginInput) {
    return request('/auth/login', authUserSchema, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}
