'use client';

import Link from 'next/link';
import { ListTodo, LogOut, Users, Key, FolderTree } from 'lucide-react';
import Container from './Container';
import Button from '../ui/Button';
import { useUser } from '@/lib/contexts/UserContext';

export interface HeaderProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export default function Header({ isAuthenticated, onLogout }: HeaderProps) {
  const { isAdmin } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={isAuthenticated ? '/' : '/'}
            className="flex items-center gap-2 font-semibold text-gray-900 hover:text-primary-600 transition-colors"
          >
            <ListTodo className="h-6 w-6" />
            <span className="text-lg">FutureList</span>
          </Link>

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="flex items-center gap-4">
              {isAdmin === true && (
                <>
                  <Link href="/admin/categories">
                    <Button variant="ghost" size="sm">
                      <FolderTree className="h-4 w-4" />
                      <span className="hidden sm:inline">Categories</span>
                    </Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button variant="ghost" size="sm">
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Users</span>
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/account">
                <Button variant="ghost" size="sm">
                  <Key className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </Button>
              </Link>
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
