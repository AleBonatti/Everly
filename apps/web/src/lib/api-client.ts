import type { ZodType } from 'zod';

const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export async function request<T>(path: string, schema: ZodType<T>, init?: RequestInit): Promise<T> {
    const isFormData = init?.body instanceof FormData;

    const response = await fetch(`${API_URL}${path}`, {
        ...init,
        credentials: 'include',
        headers: {
            ...(init?.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
            ...init?.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(response.status, data.message ?? 'Something went wrong');
    }

    return schema.parse(data);
}
