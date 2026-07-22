import { Outlet } from 'react-router';

export function AuthLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
            <div className="flex-1 flex items-center justify-center px-5 py-10">
                <div className="w-full max-w-[400px] flex flex-col items-center">
                    <div className="flex flex-col items-center gap-1.5 mb-8">
                        <span className="text-[32px] font-bold tracking-wide">Everly</span>
                        <span className="text-sm text-muted-foreground italic">A list of things worth doing</span>
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
