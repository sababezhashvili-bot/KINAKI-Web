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
        <div className="fixed bottom-6 right-6 z-[9999]">
          <div className="bg-stone-900 text-white text-[10px] uppercase tracking-widest px-4 py-2 flex items-center gap-3 shadow-2xl">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Admin Mode Active
          </div>
        </div>
      )}
      {children}
    </AdminContext.Provider>
  )
}
