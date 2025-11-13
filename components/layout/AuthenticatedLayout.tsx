'use client'

/**
 * Authenticated Layout Wrapper
 *
 * Provides a consistent layout with Header for all authenticated pages.
 * Handles logout functionality centrally.
 */

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserProvider } from '@/lib/contexts/UserContext'
import Header from './Header'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <UserProvider>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Header isAuthenticated={true} onLogout={handleLogout} />
        <main>{children}</main>
      </div>
    </UserProvider>
  )
}
