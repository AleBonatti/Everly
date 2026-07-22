import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/Button';

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const [done, setDone] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    if (done) {
        return (
            <div className="flex flex-col items-center text-center gap-3.5 py-2">
                <div className="w-13 h-13 rounded-full bg-success-bg flex items-center justify-center text-2xl text-success">✓</div>
                <h1 className="text-lg text-foreground">Password updated</h1>
                <p className="text-sm text-muted-foreground">You can now log in with your new password.</p>
                <button onClick={() => navigate('/login')} className="w-full mt-2.5 bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm py-2.5 rounded-lg cursor-pointer">
                    Go to log in
                </button>
            </div>
        );
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        setDone(true);
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-xl text-foreground mb-1">Set a new password</h1>
                <p className="text-sm text-muted-foreground">Choose a new password for your account.</p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="forgot" className="text-xs font-semibold text-muted-foreground">
                        New password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="bg-surface-inset border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="confirm_password" className="text-xs font-semibold text-muted-foreground">
                        Confirm new password
                    </label>
                    <input
                        id="confirm_password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="bg-surface-inset border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none"
                    />
                </div>
                {error && <div className="text-xs text-destructive bg-destructive-bg border border-destructive-border px-3 py-2 rounded-lg">{error}</div>}

                <Button type="submit">Update password</Button>
            </form>
        </div>
    );
}
