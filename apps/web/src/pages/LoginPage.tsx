import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginInputSchema, type LoginInput, type AuthUser } from '@everly/shared';
import { login, resendVerification } from '../lib/api/auth';
import { ApiError } from '../lib/api-client';
import { withDelay } from '../lib/with-delay';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';

export function LoginPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [serverError, setServerError] = useState('');
    const [unverifiedEmail, setUnverifiedEmail] = useState('');

    const {
        register,
        handleSubmit,
        resetField,
        formState: { errors },
    } = useForm<LoginInput>({ resolver: zodResolver(loginInputSchema) });

    const resendMutation = useMutation({
        mutationFn: resendVerification,
    });

    const mutation = useMutation<AuthUser, ApiError, LoginInput>({
        mutationFn: withDelay((data: LoginInput) => login(data)),
        onSuccess: (user) => {
            queryClient.setQueryData(['me'], user);
            navigate('/');
        },
        onError: (error, variables) => {
            if (error instanceof ApiError && error.status === 403) {
                setUnverifiedEmail(variables.email);
                setServerError(error.message);
            } else {
                setServerError(error instanceof ApiError ? error.message : 'Something went wrong');
                setUnverifiedEmail('');
            }
            resetField('password');
        },
    });

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-xl text-foreground mb-1">Welcome back</h1>
                <p className="text-sm text-muted-foreground">Log in to see your list.</p>
            </div>

            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
                <TextField label="Email" type="email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <label htmlFor="forgot-password" className="text-xs font-semibold text-muted-foreground">
                            Password
                        </label>
                        <Link to="/forgot-password" className="text-xs text-accent">
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        id="forgot-password"
                        type="password"
                        placeholder="••••••••"
                        {...register('password')}
                        className="bg-surface-inset border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none"
                    />
                    {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
                </div>

                {serverError && (
                    <div className="text-xs text-destructive bg-destructive-bg border border-destructive-border px-3 py-2 rounded-lg flex flex-col gap-1.5">
                        <span>{serverError}</span>
                        {unverifiedEmail && (
                            <button
                                type="button"
                                onClick={() => resendMutation.mutate({ email: unverifiedEmail })}
                                disabled={resendMutation.isPending || resendMutation.isSuccess}
                                className="text-left underline disabled:no-underline disabled:opacity-70"
                            >
                                {resendMutation.isSuccess ? 'Verification email sent' : resendMutation.isPending ? 'Sending...' : 'Resend verification email'}
                            </button>
                        )}
                    </div>
                )}

                <Button type="submit" isLoading={mutation.isPending} className="mt-1">
                    {mutation.isPending ? 'Logging in...' : 'Log in'}
                </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-accent">
                    Sign up
                </Link>
            </div>
        </div>
    );
}
