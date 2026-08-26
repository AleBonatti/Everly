import { useRef, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useClickOutside } from '../hooks/useClickOutside';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { logout } from '../lib/api/auth';
import everlyLogo from '../assets/everly-logo-dark.png';

function getInitials(name: string) {
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function Layout() {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: user } = useCurrentUser();

    useClickOutside(menuRef, () => setMenuOpen(false));

    async function handleLogout() {
        await logout();
        queryClient.clear();
        navigate('/login');
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
            <header className="flex items-center justify-between px-8 py-2 bg-surface border-b border-border">
                <img src={everlyLogo} alt="Everly" className="h-14 w-auto" />

                <div ref={menuRef} className="relative">
                    <button onClick={() => setMenuOpen((open) => !open)} className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-full bg-surface-inset cursor-pointer">
                        <span className="size-8 rounded-full bg-avatar flex items-center justify-center font-bold text-sm text-accent-foreground">{user ? getInitials(user.name) : ''}</span>
                        <span className="text-sm text-foreground/90">{user?.name}</span>
                        <span className="text-[10px] text-muted-foreground transition-transform duration-150" style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            ▾
                        </span>
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-[calc(100%+8px)] w-50 bg-surface border border-border rounded-lg shadow-2xl overflow-hidden z-20">
                            <Link to="/settings" className="block px-4 py-3 text-sm hover:bg-surface-inset" onClick={() => setMenuOpen(false)}>
                                User settings
                            </Link>
                            {/* <div className="px-4 py-3 text-sm cursor-pointer hover:bg-surface-inset">System settings</div> */}
                            <Link to="/categories" className="block px-4 py-3 text-sm hover:bg-surface-inset" onClick={() => setMenuOpen(false)}>
                                Edit categories
                            </Link>
                            <div className="h-px bg-border" />
                            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-destructive hover:bg-surface-inset">
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}
