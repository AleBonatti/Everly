import { Outlet } from 'react-router';
import everlyLogo from '../assets/everly-logo.png';
import everlyClaim from '../assets/everly-logo-claim.png';

export function AuthLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
            <div className="flex-1 flex items-center justify-center px-5 py-10">
                <div className="w-full max-w-100 flex flex-col items-center">
                    <div className="flex flex-col items-center gap-2 mb-8">
                        <img src={everlyLogo} alt="Everly" className="h-16 w-auto" />
                        <img src={everlyClaim} alt="A list of things worth doing" className="h-8 w-auto" />
                    </div>
                    <div className="w-full bg-surface border border-border rounded-2xl p-8 shadow-2xl">
                        <Outlet />
                    </div>
                </div>
            </div>
            <footer className="px-8 py-5 text-center text-xs text-muted-foreground">© 2026 Everly. All rights reserved.</footer>
        </div>
    );
}
