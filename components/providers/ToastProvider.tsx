'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: isDark ? '#262626' : 'white', // neutral-800 : white
          color: isDark ? '#fafafa' : '#171717', // neutral-50 : neutral-900
          border: isDark ? '1px solid #404040' : '1px solid #e5e5e5', // neutral-700 : neutral-200
          padding: '12px 16px',
          fontSize: '14px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
        // Success
        success: {
          duration: 3000,
          style: {
            background: isDark ? '#14532d' : '#f0fdf4', // green-900 : green-50
            color: isDark ? '#bbf7d0' : '#166534', // green-200 : green-800
            border: isDark ? '1px solid #166534' : '1px solid #bbf7d0', // green-800 : green-200
          },
          iconTheme: {
            primary: '#16a34a', // green-600
            secondary: isDark ? '#14532d' : '#f0fdf4',
          },
        },
        // Error
        error: {
          duration: 5000,
          style: {
            background: isDark ? '#7f1d1d' : '#fef2f2', // red-900 : red-50
            color: isDark ? '#fecaca' : '#991b1b', // red-200 : red-800
            border: isDark ? '1px solid #991b1b' : '1px solid #fecaca', // red-800 : red-200
          },
          iconTheme: {
            primary: '#dc2626', // red-600
            secondary: isDark ? '#7f1d1d' : '#fef2f2',
          },
        },
        // Loading
        loading: {
          style: {
            background: isDark ? '#262626' : '#fafaf9', // neutral-800 : neutral-50
            color: isDark ? '#a3a3a3' : '#525252', // neutral-400 : neutral-600
            border: isDark ? '1px solid #404040' : '1px solid #e5e5e5', // neutral-700 : neutral-200
          },
          iconTheme: {
            primary: '#3b82f6', // primary-600
            secondary: isDark ? '#262626' : '#fafaf9',
          },
        },
      }}
    />
  );
}
