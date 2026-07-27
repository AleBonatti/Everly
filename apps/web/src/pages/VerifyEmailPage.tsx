import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { verifyEmail } from '../lib/api/auth';
import { ApiError } from '../lib/api-client';

const requests = new Map<string, Promise<unknown>>();

function verifyEmailOnce(token: string) {
    let promise = requests.get(token);
    if (!promise) {
        promise = verifyEmail({ token });
        requests.set(token, promise);
    }
    return promise;
}

type VerificationState = 'pending' | 'error';

export function VerifyEmailPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const [state, setState] = useState<VerificationState>('pending');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!token) {
            return;
        }

        let cancelled = false;

        verifyEmailOnce(token)
            .then((user) => {
                if (!cancelled) {
                    queryClient.setQueryData(['me'], user);
                    navigate('/');
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setErrorMessage(error instanceof ApiError ? error.message : 'Something went wrong.');
                    setState('error');
                }
            });

        return () => {
            cancelled = true;
        };
    }, [token, navigate, queryClient]);

    if (!token) {
        return (
            <div className="flex flex-col items-center text-center gap-3.5 py-2">
                <h1 className="text-lg text-foreground">Invalid link</h1>
                <p className="text-sm text-muted-foreground">This verification link is missing its token.</p>
                <Link to="/login" className="text-accent text-sm">
                    ← Back to log in
                </Link>
            </div>
        );
    }

    if (state === 'error') {
        return (
            <div className="flex flex-col items-center text-center gap-3.5 py-2">
                <h1 className="text-lg text-foreground">Verification failed</h1>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                <Link to="/login" className="text-accent text-sm">
                    ← Back to log in
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center text-center gap-3.5 py-2">
            <span className="size-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Verifying your email...</p>
        </div>
    );
}
