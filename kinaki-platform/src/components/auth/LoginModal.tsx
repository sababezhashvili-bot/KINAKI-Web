'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { XIcon, LockIcon, UserIcon, Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('Invalid credentials. Please try again.')
      } else {
        router.push('/admin')
        onClose()
      }
    } catch (err) {
      setError('An error occurred. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative w-full max-w-[420px] bg-white rounded-none shadow-2xl border border-stone-100 overflow-hidden"
          >
            {/* Header with Close */}
            <div className="relative p-10 pb-6 text-center border-b border-stone-50">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-900 transition-colors"
                type="button"
              >
                <XIcon className="w-4 h-4" />
              </button>
              <h2 className="text-[16px] tracking-[0.4em] uppercase font-light text-stone-900 mb-2">
                Admin Access
              </h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400">
                Studio Credentials Required
              </p>
            </div>

            <div className="p-10 pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Email Field */}
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                      <UserIcon className="w-4 h-4 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="STUDIO EMAIL"
                      required
                      style={{ paddingLeft: '64px', textAlign: 'left' }}
                      className="w-full h-14 bg-stone-50 border border-stone-100 pr-6 text-[11px] tracking-[0.2em] focus:outline-none focus:border-stone-900 focus:bg-white transition-all placeholder:text-stone-300 text-stone-900"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                      <LockIcon className="w-4 h-4 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="PASSWORD"
                      required
                      style={{ paddingLeft: '64px', textAlign: 'left' }}
                      className="w-full h-14 bg-stone-50 border border-stone-100 pr-6 text-[11px] tracking-[0.2em] focus:outline-none focus:border-stone-900 focus:bg-white transition-all placeholder:text-stone-300 text-stone-900"
                    />
                  </div>
                </div>

                {error && (
                  <div className="py-3 px-4 bg-red-50 border border-red-100">
                    <p className="text-[10px] text-red-600 text-center tracking-widest uppercase font-medium">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "w-full h-14 mt-2 text-[11px] tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-2",
                    isLoading 
                      ? "bg-stone-100 text-stone-400 cursor-not-allowed" 
                      : "bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.99]"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'ENTER'
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
