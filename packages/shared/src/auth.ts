import { z } from 'zod';

export const registerInputSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email().toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

export const loginInputSchema = z.object({
    email: z.email().toLowerCase(),
    password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
