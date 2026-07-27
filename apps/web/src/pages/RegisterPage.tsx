import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerInputSchema, type AuthUser } from '@everly/shared';
import { register as registerUser } from '../lib/api/auth';
import { ApiError } from '../lib/api-client';
import { withDelay } from '../lib/with-delay';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';

const registerFormSchema = registerInputSchema.extend({ confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type RegisterFormInput = z.infer<typeof registerFormSchema>;

export function RegisterPage() {
    const [serverError, setServerError] = useState('');
    const [registeredEmail, setRegisteredEmail] = useState('');

    const {
        register,
        handleSubmit,
        resetField,
        formState: { errors },
    } = useForm<RegisterFormInput>({ resolver: zodResolver(registerFormSchema) });

    const mutation = useMutation<AuthUser, ApiError, RegisterFormInput>({
        mutationFn: withDelay((data: RegisterFormInput) => registerUser({ name: data.name, email: data.email, password: data.password })),
        onSuccess: (_user, variables) => {
            setRegisteredEmail(variables.email);
        },
        onError: (error) => {
            setServerError(error instanceof ApiError ? error.message : 'Something went wrong');
            resetField('password');
            resetField('confirmPassword');
        },
    });

    if (registeredEmail) {
        return (
            <div className="flex flex-col items-center text-center gap-3.5 py-2">
                <div className="w-13 h-13 rounded-full bg-success-bg flex items-center justify-center text-2xl text-success">✓</div>
                <h1 className="text-lg text-foreground">Check your inbox</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    We sent a verification link to
                    <br />
                    <strong className="text-foreground/85">{registeredEmail}</strong>
                    <br />
                    Verify your email to finish creating your account.
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
                <h1 className="text-xl text-foreground mb-1">Create your account</h1>
                <p className="text-sm text-muted-foreground">Start your list of things worth doing.</p>
            </div>

            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
                <TextField label="Name" placeholder="Maya Chen" {...register('name')} error={errors.name?.message} />
                <TextField label="Email" type="email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
                <TextField label="Password" type="password" placeholder="At least 8 characters" {...register('password')} error={errors.password?.message} />
                <TextField label="Confirm password" type="password" placeholder="Repeat password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />

                {serverError && <div className="text-xs text-destructive bg-destructive-bg border border-destructive-border px-3 py-2 rounded-lg">{serverError}</div>}

                <Button type="submit" isLoading={mutation.isPending}>
                    {mutation.isPending ? 'Creating account...' : 'Create account'}
                </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-accent">
                    Log in
                </Link>
            </div>
        </div>
    );
}
