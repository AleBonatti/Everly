import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateProfileInputSchema, changePasswordInputSchema, type UpdateProfileInput } from '@everly/shared';
import { updateProfile, changePassword } from '../lib/api/auth';
import { ApiError } from '../lib/api-client';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { withDelay } from '../lib/with-delay';

const changePasswordFormSchema = changePasswordInputSchema.extend({ confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type ChangePasswordFormInput = z.infer<typeof changePasswordFormSchema>;

export function UserSettingsPage() {
    const queryClient = useQueryClient();
    const { data: user } = useCurrentUser();

    const [profileServerError, setProfileServerError] = useState('');
    const [passwordServerError, setPasswordServerError] = useState('');
    const [passwordDone, setPasswordDone] = useState(false);

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors },
    } = useForm<UpdateProfileInput>({
        resolver: zodResolver(updateProfileInputSchema),
        values: { name: user?.name ?? '' },
    });

    const profileMutation = useMutation({
        mutationFn: withDelay(updateProfile),
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(['me'], updatedUser);
            setProfileServerError('');
        },
        onError: (error) => {
            setProfileServerError(error instanceof ApiError ? error.message : 'Something went wrong');
        },
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPasswordForm,
        formState: { errors: passwordErrors },
    } = useForm<ChangePasswordFormInput>({
        resolver: zodResolver(changePasswordFormSchema),
    });

    const passwordMutation = useMutation({
        mutationFn: withDelay(changePassword),
        onSuccess: () => {
            setPasswordServerError('');
            setPasswordDone(true);
            resetPasswordForm();
        },
        onError: (error) => {
            setPasswordDone(false);
            setPasswordServerError(error instanceof ApiError ? error.message : 'Something went wrong');
        },
    });

    return (
        <div className="max-w-5xl mx-auto px-8 py-11">
            <Link to="/" className="text-xs text-muted-foreground block mb-2">
                ← Back to list
            </Link>
            <h1 className="text-2xl font-semibold text-foreground mb-1">User settings</h1>
            <p className="text-sm text-muted-foreground mb-7">Manage your profile and password.</p>

            <div className="flex flex-col gap-8 max-w-md">
                <section className="flex flex-col gap-4">
                    <h2 className="text-sm font-semibold text-foreground">Profile</h2>
                    <form onSubmit={handleProfileSubmit((data) => profileMutation.mutate(data))} className="flex flex-col gap-4">
                        <TextField label="Name" {...registerProfile('name')} error={profileErrors.name?.message} />
                        <TextField label="Email" value={user?.email ?? ''} disabled />

                        {profileServerError && <div className="text-xs text-destructive bg-destructive-bg border border-destructive-border px-3 py-2 rounded-lg">{profileServerError}</div>}

                        <Button type="submit" isLoading={profileMutation.isPending}>
                            {profileMutation.isPending ? 'Saving...' : 'Save changes'}
                        </Button>
                    </form>
                </section>

                <div className="h-px bg-border" />

                <section className="flex flex-col gap-4">
                    <h2 className="text-sm font-semibold text-foreground">Password</h2>
                    <form onSubmit={handlePasswordSubmit((data) => passwordMutation.mutate(data))} className="flex flex-col gap-4">
                        <TextField label="Current password" type="password" {...registerPassword('currentPassword')} error={passwordErrors.currentPassword?.message} />
                        <TextField label="New password" type="password" placeholder="At least 8 characters" {...registerPassword('password')} error={passwordErrors.password?.message} />
                        <TextField
                            label="Confirm new password"
                            type="password"
                            placeholder="Repeat password"
                            {...registerPassword('confirmPassword')}
                            error={passwordErrors.confirmPassword?.message}
                        />

                        {passwordServerError && <div className="text-xs text-destructive bg-destructive-bg border border-destructive-border px-3 py-2 rounded-lg">{passwordServerError}</div>}
                        {passwordDone && <div className="text-xs text-success bg-success-bg px-3 py-2 rounded-lg">Password updated successfully.</div>}

                        <Button type="submit" isLoading={passwordMutation.isPending}>
                            {passwordMutation.isPending ? 'Updating...' : 'Update password'}
                        </Button>
                    </form>
                </section>
            </div>
        </div>
    );
}
