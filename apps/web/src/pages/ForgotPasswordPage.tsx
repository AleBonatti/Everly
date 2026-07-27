import { useState } from 'react';
import { Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordInputSchema, type ForgotPasswordInput } from '@everly/shared';
import { forgotPassword } from '../lib/api/auth';
import { ApiError } from '../lib/api-client';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';

export function ForgotPasswordPage() {
    const [submittedEmail, setSubmittedEmail] = useState('');
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordInputSchema) });

    const mutation = useMutation({
        mutationFn: forgotPassword,
        onSuccess: (_data, variables) => {
            setSubmittedEmail(variables.email);
        },
        onError: (error) => {
            setServerError(error instanceof ApiError ? error.message : 'Something went wrong');
        },
    });

    if (submittedEmail) {
        return (
            <div className="flex flex-col items-center text-center gap-3.5 py-2">
                <div className="w-13 h-13 rounded-full bg-success-bg flex items-center justify-center text-2xl text-success">✓</div>
                <h1 className="text-lg text-foreground">Check your inbox</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    If that email exists, we sent a password reset link to
                    <br />
                    <strong className="text-foreground/85">{submittedEmail}</strong>
                </p>
                <div className="text-center mt-5 text-sm text-muted-foreground">
                    <Link to="/login" className="text-accent">
                        ← Back to log in
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-xl text-foreground mb-1">Reset your password</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">Enter your email and we'll send you a link to reset your password.</p>
            </div>
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
                <TextField label="Email" type="email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />

                {serverError && <div className="text-xs text-destructive bg-destructive-bg border border-destructive-border px-3 py-2 rounded-lg">{serverError}</div>}

                <Button type="submit" isLoading={mutation.isPending}>
                    {mutation.isPending ? 'Sending...' : 'Send reset link'}
                </Button>
            </form>
            <div className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-accent">
                    ← Back to log in
                </Link>
            </div>
        </div>
    );
}
