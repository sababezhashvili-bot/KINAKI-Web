'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface AdminContextType {
  isAdmin: boolean
}

const AdminContext = createContext<AdminContextType>({ isAdmin: false })

export const useAdmin = () => useContext(AdminContext)

export function AdminProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const isAdmin = status === 'authenticated' && session?.user?.email !== undefined

  return (
    <AdminContext.Provider value={{ isAdmin }}>
      {isAdmin && (
        <div className="fixed bottom-6 left-6 z-[9999] flex items-center gap-3">
          <div className="bg-stone-900 text-white text-[9px] uppercase tracking-[0.2em] px-5 py-2 flex items-center gap-3 shadow-2xl border border-stone-800">
            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
            Admin Mode Active
          </div>
        </div>
      )}
      {children}
    </AdminContext.Provider>
  )
}
