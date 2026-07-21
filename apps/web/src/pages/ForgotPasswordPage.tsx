import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/Button';

export function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);
    const [email, setEmail] = useState('');

    if (submitted) {
        return (
            <div className="flex flex-col items-center text-center gap-3.5 py-2">
                <div className="w-13 h-13 rounded-full bg-success-bg flex items-center justify-center text-2xl text-success">✓</div>
                <h1 className="text-lg text-foreground">Check your inbox</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    We sent a password reset link to
                    <br />
                    <strong className="text-foreground/85">{email}</strong>
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
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                }}
                className="flex flex-col gap-4"
            >
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="bg-surface-inset border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none"
                    />
                </div>

                <Button type="submit">Send reset link</Button>
            </form>
            <div className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-accent">
                    ← Back to log in
                </Link>
            </div>
        </div>
    );
}
