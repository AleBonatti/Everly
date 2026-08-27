import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateProfileInputSchema, changePasswordInputSchema, type UpdateProfileInput } from '@everly/shared';
import { updateProfile, changePassword, deleteAccount } from '../lib/api/auth';
import { ApiError } from '../lib/api-client';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { withDelay } from '../lib/with-delay';
import { ConfirmDialog } from '../components/ConfirmDialog';

const changePasswordFormSchema = changePasswordInputSchema.extend({ confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type ChangePasswordFormInput = z.infer<typeof changePasswordFormSchema>;

export function UserSettingsPage() {
    const queryClient = useQueryClient();
    const { data: user } = useCurrentUser();
    const navigate = useNavigate();

    const [profileServerError, setProfileServerError] = useState('');
    const [profileDone, setProfileDone] = useState(false);
    const [passwordServerError, setPasswordServerError] = useState('');
    const [passwordDone, setPasswordDone] = useState(false);

    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [showDeleteFinal, setShowDeleteFinal] = useState(false);
    const [deleteEmailConfirm, setDeleteEmailConfirm] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');

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
            setProfileDone(true);
            setTimeout(() => setProfileDone(false), 3000);
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
            setTimeout(() => setPasswordDone(false), 3000);
            resetPasswordForm();
        },
        onError: (error) => {
            setPasswordDone(false);
            setPasswordServerError(error instanceof ApiError ? error.message : 'Something went wrong');
        },
    });

    const deleteAccountMutation = useMutation({
        mutationFn: deleteAccount,
        onSuccess: () => {
            queryClient.clear();
            navigate('/login');
        },
        onError: (error) => {
            setDeleteError(error instanceof ApiError ? error.message : 'Something went wrong');
        },
    });

    const canConfirmDelete = deleteEmailConfirm.trim().toLowerCase() === user?.email.toLowerCase() && deletePassword.length > 0;

    function closeDeleteFlow() {
        setShowDeleteWarning(false);
        setShowDeleteFinal(false);
        setDeleteEmailConfirm('');
        setDeletePassword('');
        setDeleteError('');
    }

    return (
        <div className="max-w-5xl mx-auto px-8 py-11">
            <Link to="/dashboard" className="text-xs text-muted-foreground block mb-4">
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
                        {profileDone && <div className="text-xs text-success bg-success-bg px-3 py-2 rounded-lg">Profile updated successfully.</div>}

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

                <div className="h-px bg-border" />

                <section className="flex flex-col gap-4">
                    <h2 className="text-sm font-semibold text-destructive">Delete account</h2>
                    <p className="text-xs text-muted-foreground">Permanently deletes your account and everything in it — items, categories, and photos. This cannot be undone.</p>

                    <Button type="button" variant="destructive" onClick={() => setShowDeleteWarning(true)} className="self-start">
                        Delete account
                    </Button>
                </section>
            </div>

            {showDeleteWarning && (
                <ConfirmDialog
                    title="Delete your account?"
                    message="This permanently deletes your account and everything in it — items, categories, and photos. This cannot be undone."
                    confirmLabel="Continue"
                    onConfirm={() => {
                        setShowDeleteWarning(false);
                        setShowDeleteFinal(true);
                    }}
                    onCancel={closeDeleteFlow}
                />
            )}

            {showDeleteFinal && (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div onClick={closeDeleteFlow} className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-5 z-[100]">
                    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                    <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4">
                        <div>
                            <h2 className="text-lg text-foreground mb-1.5">Confirm account deletion</h2>
                            <p className="text-sm text-muted-foreground">
                                Type <strong className="text-foreground">{user?.email}</strong> and enter your password to permanently delete your account.
                            </p>
                        </div>

                        <TextField label="Email" value={deleteEmailConfirm} onChange={(e) => setDeleteEmailConfirm(e.target.value)} placeholder={user?.email} />
                        <TextField label="Password" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />

                        {deleteError && <div className="text-xs text-destructive bg-destructive-bg border border-destructive-border px-3 py-2 rounded-lg">{deleteError}</div>}

                        <div className="flex items-center justify-end gap-2.5">
                            <Button type="button" variant="secondary" onClick={closeDeleteFlow}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={!canConfirmDelete}
                                isLoading={deleteAccountMutation.isPending}
                                onClick={() => deleteAccountMutation.mutate({ password: deletePassword })}
                            >
                                Delete my account
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
