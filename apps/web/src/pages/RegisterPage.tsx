import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerInputSchema } from '@everly/shared';
import { register as registerUser } from '../lib/api/auth';
import { ApiError } from '../lib/api-client';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';

const registerFormSchema = registerInputSchema.extend({ confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type RegisterFormInput = z.infer<typeof registerFormSchema>;

export function RegisterPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        resetField,
        formState: { errors },
    } = useForm<RegisterFormInput>({ resolver: zodResolver(registerFormSchema) });

    const mutation = useMutation({
        mutationFn: async (data: RegisterFormInput) => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return registerUser({ name: data.name, email: data.email, password: data.password });
        },
        onSuccess: (user) => {
            queryClient.setQueryData(['me'], user);
            navigate('/');
        },
        onError: (error) => {
            setServerError(error instanceof ApiError ? error.message : 'Something went wrong');
            resetField('password');
            resetField('confirmPassword');
        },
    });

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
