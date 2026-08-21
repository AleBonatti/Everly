import { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPasswordInputSchema } from '@everly/shared';
import { resetPassword } from '../lib/api/auth';
import { ApiError } from '../lib/api-client';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { withDelay } from '../lib/with-delay';

const resetPasswordFormSchema = resetPasswordInputSchema.extend({ confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const [done, setDone] = useState(false);
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormInput>({
        resolver: zodResolver(resetPasswordFormSchema),
        defaultValues: { token },
    });

    const mutation = useMutation({
        mutationFn: withDelay(resetPassword),
        onSuccess: () => setDone(true),
        onError: (error) => {
            setServerError(error instanceof ApiError ? error.message : 'Something went wrong');
        },
    });

    if (!token) {
        return (
            <div className="flex flex-col items-center text-center gap-3.5 py-2">
                <h1 className="text-lg text-foreground">Invalid link</h1>
                <p className="text-sm text-muted-foreground">This password reset link is missing its token. Please request a new one.</p>
                <Link to="/forgot-password" className="text-accent text-sm">
                    Request a new link
                </Link>
            </div>
        );
    }

    if (done) {
        return (
            <div className="flex flex-col items-center text-center gap-3.5 py-2">
                <div className="w-13 h-13 rounded-full bg-success-bg flex items-center justify-center text-2xl text-success">✓</div>
                <h1 className="text-lg text-foreground">Password updated</h1>
                <p className="text-sm text-muted-foreground">You can now log in with your new password.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-xl text-foreground mb-1">Set a new password</h1>
                <p className="text-sm text-muted-foreground">Choose a new password for your account.</p>
            </div>
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
                <input type="hidden" {...register('token')} />
                <TextField label="New password" type="password" placeholder="At least 8 characters" {...register('password')} error={errors.password?.message} />
                <TextField label="Confirm new password" type="password" placeholder="Repeat password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />

                {serverError && <div className="text-xs text-destructive bg-destructive-bg border border-destructive-border px-3 py-2 rounded-lg">{serverError}</div>}

                <Button type="submit" isLoading={mutation.isPending}>
                    {mutation.isPending ? 'Updating...' : 'Update password'}
                </Button>
            </form>
        </div>
    );
}
