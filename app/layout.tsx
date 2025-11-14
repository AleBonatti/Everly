import type { Metadata } from 'next'
import { inter } from '@/lib/fonts'
import { ThemeProvider } from '@/lib/contexts/ThemeContext'
import ToastProvider from '@/components/providers/ToastProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'FutureList - Your Personal Wishlist',
  description:
    'A minimalist app to track future activities—movies to watch, restaurants to try, places to visit, books to read.',
  keywords: [
    'wishlist',
    'todo',
    'personal organizer',
    'future activities',
    'movies',
    'restaurants',
    'trips',
    'books',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
