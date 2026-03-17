'use client'

import React, { useState } from 'react'
import { useAdmin } from './AdminProvider'
import { QuickEditor } from './QuickEditor'

interface EditControlProps {
  type: 'edit' | 'add'
  label?: string
  className?: string
  children?: React.ReactNode
  
  // QuickEditor props (optional)
  onSave?: (value: string) => Promise<void>
  initialValue?: string
  editorTitle?: string
  editorType?: 'text' | 'textarea'
  
  // Custom action (optional)
  onClick?: () => void
  href?: string
}

export function EditControl({ 
  type, 
  onClick, 
  href,
  label, 
  className, 
  children,
  onSave,
  initialValue = '',
  editorTitle = 'Edit Content',
  editorType = 'text'
}: EditControlProps & { href?: string }) {
  const { isAdmin } = useAdmin()
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  if (!isAdmin) return <>{children}</>

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (onSave) {
      setIsEditorOpen(true)
    } else if (href) {
      window.location.href = href
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <>
      <div className={`relative group ${className}`}>
        {children}
        <button
          onClick={handleClick}
          className="absolute -top-3 -right-3 z-50 bg-white border border-stone-200 p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 text-stone-900"
          title={label || (type === 'edit' ? 'Edit' : 'Add')}
        >
          {type === 'edit' ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          )}
        </button>
      </div>

      {onSave && (
        <QuickEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          title={editorTitle}
          initialValue={initialValue}
          onSave={onSave}
          type={editorType}
        />
      )}
    </>
  )
}
