'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { XIcon } from 'lucide-react'
import Image from 'next/image'
import LoginModal from '@/components/auth/LoginModal'

const PROJECT_CATEGORIES = [
  { label: 'Architecture', slug: 'architecture' },
  { label: 'Interior Design', slug: 'interior-design' },
  { label: 'Furniture Design', slug: 'furniture-design' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [projectsOpen, setProjectsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const projectsTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleProjectsEnter = () => {
    clearTimeout(projectsTimerRef.current)
    setProjectsOpen(true)
  }
  const handleProjectsLeave = () => {
    projectsTimerRef.current = setTimeout(() => setProjectsOpen(false), 180)
  }

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <nav 
        className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-stone-100 flex items-center justify-between h-9 transition-all duration-300 !px-8"
        style={{ backgroundColor: '#ffffff', opacity: 1 }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[13px] tracking-[0.35em] uppercase font-light text-stone-900 hover:text-stone-600 transition-colors"
        >
          <img 
            src="/kinaki-logo.png" 
            alt="KINAKI Logo" 
            className="w-[13px] h-[13px] object-contain"
          />
          KINAKI
        </Link>

        {/* Center Nav */}
        <div className="pointer-events-auto hidden md:flex items-center gap-10">
          {/* Projects with dropdown */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={handleProjectsEnter}
            onMouseLeave={handleProjectsLeave}
          >
            <button className={cn('nav-link', projectsOpen && 'nav-link--active')}>
              Projects
            </button>

            <AnimatePresence>
              {projectsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  onMouseEnter={handleProjectsEnter}
                  onMouseLeave={handleProjectsLeave}
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-3"
                >
                  <div className="bg-white border border-stone-100 shadow-md py-2 min-w-[180px]">
                    {PROJECT_CATEGORIES.map(cat => (
                      <Link
                        key={cat.slug}
                        href={`/projects/${cat.slug}`}
                        className="block px-5 py-2.5 text-[12px] tracking-wide text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/about" className="nav-link">
            About Us
          </Link>
          <Link href="/contact" className="nav-link">
            Contact
          </Link>
        </div>

        {/* Right: Login + Language + mobile hamburger */}
        <div className="pointer-events-auto flex items-center gap-5">
          {/* Language Toggle */}
          <div className="hidden md:flex items-center gap-2.5 mr-2 pr-5 border-r border-stone-100">
            <button className="text-[10px] tracking-[0.2em] font-medium text-stone-900">
              GE
            </button>
            <span className="text-stone-200 text-[10px] font-thin">|</span>
            <button className="text-[10px] tracking-[0.2em] font-light text-stone-400 hover:text-stone-900 transition-colors">
              EN
            </button>
          </div>

          {session ? (
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="text-[11px] uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                className="text-[11px] uppercase tracking-[0.2em] text-stone-400 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="hidden md:block text-[11px] uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors"
            >
              ENTER
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-1"
            onClick={() => setMobileOpen(p => !p)}
            aria-label="Menu"
          >
            <span className={cn('hamburger-icon', mobileOpen && 'hamburger-icon--open')} />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            <div className="flex justify-between items-center px-7 py-4">
              <Link href="/" className="text-[13px] tracking-[0.35em] uppercase font-light text-stone-900">
                KINAKI
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-1">
                <XIcon className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <motion.div
              className="flex-1 flex flex-col justify-center px-10 space-y-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400">Projects</p>
                {PROJECT_CATEGORIES.map(cat => (
                  <Link
                    key={cat.slug}
                    href={`/projects/${cat.slug}`}
                    className="block text-3xl font-light text-stone-900 hover:text-stone-500 transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
              <div className="space-y-4">
                {[
                  { label: 'About Us', href: '/about' },
                  { label: 'Contact', href: '/contact' },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block text-3xl font-light text-stone-900 hover:text-stone-500 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              {session ? (
                <Link
                  href="/admin/dashboard"
                  className="text-[11px] uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    setLoginModalOpen(true)
                  }}
                  className="text-left text-[11px] uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors"
                >
                  Admin Login
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
    </>
  )
}
