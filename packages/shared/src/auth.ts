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

export const authUserSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
});

export type AuthUser = z.infer<typeof authUserSchema>;

// Email varie

export const forgotPasswordInputSchema = z.object({
    email: z.email().toLowerCase(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;

export const resetPasswordInputSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;

export const verifyEmailInputSchema = z.object({
    token: z.string().min(1, 'Token is required'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailInputSchema>;

export const resendVerificationInputSchema = z.object({
    email: z.email().toLowerCase(),
});

export type ResendVerificationInput = z.infer<typeof resendVerificationInputSchema>;

// Profile update

export const updateProfileInputSchema = z.object({
    name: z.string().min(1, 'Name is required'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

export const changePasswordInputSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;
