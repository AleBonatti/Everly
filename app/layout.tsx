import type { Metadata } from 'next'
import { inter } from '@/lib/fonts'
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
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
