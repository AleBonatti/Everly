'use client';

/**
 * Authenticated Layout Wrapper
 *
 * Provides a consistent layout with Header for all authenticated pages.
 * Handles logout functionality centrally.
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserProvider } from '@/lib/contexts/UserContext';
import Header from './Header';
import Footer from './Footer';
import Container from './Container';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <UserProvider>
      <div className="flex min-h-screen flex-col dark:bg-neutral-950">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:bg-primary-500"
        >
          Skip to main content
        </a>
        <Header isAuthenticated={true} onLogout={handleLogout} />
        <main id="main-content" className="flex-1">
          <Container size="2xl" className="py-4">
            <div className="rounded-2xl bg-[#F2F2F2] p-6 dark:border-neutral-800 dark:bg-neutral-900">
              {children}
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    </UserProvider>
  );
}
