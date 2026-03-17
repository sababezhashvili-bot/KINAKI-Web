'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface QuickEditorProps {
  isOpen: boolean
  onClose: () => void
  title: string
  initialValue: string
  onSave: (value: string) => Promise<void>
  type?: 'text' | 'textarea' | 'json'
}

export function QuickEditor({ isOpen, onClose, title, initialValue, onSave, type = 'text' }: QuickEditorProps) {
  const [value, setValue] = useState(initialValue)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  if (!isOpen) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(value)
      onClose()
      router.refresh()
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg shadow-2xl border border-stone-100 p-8 animate-in fade-in zoom-in duration-200">
        <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold text-stone-400 mb-6">{title}</h2>
        
        {type === 'textarea' ? (
          <textarea
            className="w-full h-48 bg-stone-50 border-none p-4 text-[14px] font-light text-stone-700 focus:ring-1 focus:ring-stone-900 outline-none resize-none"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        ) : (
          <input
            className="w-full bg-stone-50 border-none p-4 text-[14px] font-light text-stone-700 focus:ring-1 focus:ring-stone-900 outline-none"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
        )}

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-stone-100">
          <button
            onClick={onClose}
            className="text-[11px] uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-stone-900 text-white px-6 py-2 text-[11px] uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
