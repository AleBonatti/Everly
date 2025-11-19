'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogOut,
  Users,
  Key,
  FolderTree,
  Home,
  Zap,
  Moon,
  Sun,
} from 'lucide-react';
import Container from './Container';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
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
    <header className="sticky top-0 z-50 w-full">
      <Container size="2xl" className="mt-4">
        <div className="rounded-2xl bg-[#F2F2F2] dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <Link
              href={isAuthenticated ? '/' : '/'}
              className="flex items-center gap-4 text-neutral-900 dark:text-neutral-100"
            >
              <Image
                src="/logo.svg"
                width={30}
                height={30}
                unoptimized
                alt="Everly"
              />
              <span className="text-xl font-normal">Everly</span>
              <span className="text-base">
                ... a list of things worth doing
              </span>
            </Link>

            {/* Navigation */}
            {isAuthenticated && (
              <nav className="flex items-center gap-2">
                <Tooltip content="Dashboard">
                  <Link href="/">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        pathname === '/' &&
                          'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-400'
                      )}
                    >
                      <Home className="h-4 w-4" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Button>
                  </Link>
                </Tooltip>
                {isAdmin === true && (
                  <>
                    <Tooltip content="Categories">
                      <Link href="/admin/categories">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            pathname === '/admin/categories' &&
                              'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-400'
                          )}
                        >
                          <FolderTree className="h-4 w-4" />
                          <span className="hidden sm:inline">Categories</span>
                        </Button>
                      </Link>
                    </Tooltip>
                    <Tooltip content="Actions">
                      <Link href="/admin/actions">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            pathname === '/admin/actions' &&
                              'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-400'
                          )}
                        >
                          <Zap className="h-4 w-4" />
                          <span className="hidden sm:inline">Actions</span>
                        </Button>
                      </Link>
                    </Tooltip>
                    <Tooltip content="Users">
                      <Link href="/admin/users">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            pathname === '/admin/users' &&
                              'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-400'
                          )}
                        >
                          <Users className="h-4 w-4" />
                          <span className="hidden sm:inline">Users</span>
                        </Button>
                      </Link>
                    </Tooltip>
                  </>
                )}
                <Tooltip content="Account">
                  <Link href="/account">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        pathname === '/account' &&
                          'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-400'
                      )}
                    >
                      <Key className="h-4 w-4" />
                      <span className="hidden sm:inline">Account</span>
                    </Button>
                  </Link>
                </Tooltip>
                <Tooltip
                  content={theme === 'light' ? 'Dark mode' : 'Light mode'}
                >
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
                </Tooltip>
                <Tooltip content="Logout">
                  <Button variant="ghost" size="sm" onClick={onLogout}>
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </Tooltip>
              </nav>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
