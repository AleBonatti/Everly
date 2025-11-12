'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { isCurrentUserAdmin } from '@/lib/auth/client';

interface UserContextType {
  isAdmin: boolean | null;
  isLoading: boolean;
  refreshUserRole: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUserRole = async () => {
    try {
      setIsLoading(true);
      const adminStatus = await isCurrentUserAdmin();
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUserRole();
  }, []);

  return (
    <UserContext.Provider value={{ isAdmin, isLoading, refreshUserRole }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
