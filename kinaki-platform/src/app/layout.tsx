import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'mapbox-gl/dist/mapbox-gl.css'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import AuthProvider from '@/components/providers/AuthProvider'
import { AdminProvider } from '@/components/admin/AdminProvider'
import ClientSideCleanup from '@/components/layout/ClientSideCleanup'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'KINAKI — Architectural Studio',
    template: '%s | KINAKI',
  },
  description:
    'KINAKI is a premium architectural studio. Explore our architecture, interior design, and furniture projects through an interactive global map.',
  openGraph: {
    type: 'website',
    siteName: 'KINAKI',
    title: 'KINAKI — Architectural Studio',
    description: 'Premium architecture, interior design, and furniture design studio.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KINAKI — Architectural Studio',
    description: 'Premium architecture, interior design, and furniture design studio.',
  },
  robots: {
    index: true,
    follow: true,
  },
}



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-stone-50 text-stone-900 font-light">
        <AuthProvider>
          <AdminProvider>
            <ClientSideCleanup />
            <Navbar />
            <main>{children}</main>
          </AdminProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
