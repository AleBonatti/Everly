'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListTodo, LogOut, Users, Key, FolderTree, Home, Zap, Moon, Sun } from 'lucide-react';
import Container from './Container';
import Button from '../ui/Button';
import { useUser } from '@/lib/contexts/UserContext';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export interface HeaderProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export default function Header({ isAuthenticated, onLogout }: HeaderProps) {
  const { isAdmin } = useUser();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur shadow-sm supports-backdrop-filter:bg-white/60 dark:border-neutral-800 dark:bg-neutral-900/95 dark:supports-backdrop-filter:bg-neutral-900/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={isAuthenticated ? '/' : '/'}
            className="flex items-center gap-2 font-bold text-neutral-900 hover:text-primary-600 transition-colors dark:text-neutral-100 dark:hover:text-primary-400"
          >
            <ListTodo className="h-6 w-6 text-primary-600 dark:text-primary-500" />
            <span className="text-lg">FutureList</span>
          </Link>

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="flex items-center gap-2">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    pathname === '/' && 'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-400'
                  )}
                >
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              {isAdmin === true && (
                <>
                  <Link href="/admin/categories">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        pathname === '/admin/categories' && 'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-400'
                      )}
                    >
                      <FolderTree className="h-4 w-4" />
                      <span className="hidden sm:inline">Categories</span>
                    </Button>
                  </Link>
                  <Link href="/admin/actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        pathname === '/admin/actions' && 'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-400'
                      )}
                    >
                      <Zap className="h-4 w-4" />
                      <span className="hidden sm:inline">Actions</span>
                    </Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        pathname === '/admin/users' && 'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-400'
                      )}
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Users</span>
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/account">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    pathname === '/account' && 'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-400'
                  )}
                >
                  <Key className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </nav>
          )}
        </div>
      </Container>
    </header>
  );
}
