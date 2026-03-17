'use client'

import React from 'react'
import { EditControl } from '@/components/admin/EditControl'

interface AboutPageClientProps {
  page: any
  content: any
}

export default function AboutPageClient({ page, content }: AboutPageClientProps) {
  const handleSave = async (field: string, value: string, isJson: boolean = false) => {
    const body: any = { key: 'about' }
    
    if (isJson) {
      const updatedContent = { ...content, [field]: value }
      body.content = JSON.stringify(updatedContent)
    } else {
      body[field] = value
    }

    const res = await fetch('/api/admin/pages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!res.ok) throw new Error('Failed to save')
  }

  return (
    <div 
      className="min-h-screen pb-24"
      style={{ paddingTop: '160px' }}
    >
      {/* Hero */}
      <div className="px-6 md:px-16 mb-20 max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-4">Studio</p>
        <EditControl 
          type="edit" 
          label="Edit Page Title" 
          initialValue={page.title}
          onSave={(val) => handleSave('title', val)}
          editorTitle="Page Title"
        >
          <h1 className="text-5xl md:text-7xl font-light text-stone-900 leading-[0.95] mb-8">
            {page.title}
          </h1>
        </EditControl>
        <div className="w-10 h-px bg-stone-300" />
      </div>

      <div className="px-6 md:px-16 grid md:grid-cols-2 gap-16 max-w-5xl">
        {/* Intro */}
        <EditControl 
          type="edit" 
          label="Edit Intro" 
          initialValue={content.intro || ''}
          onSave={(val) => handleSave('intro', val, true)}
          editorTitle="Introduction"
          editorType="textarea"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-4">Introduction</p>
            <p className="text-xl font-light text-stone-700 leading-relaxed">
              {content.intro || 'No introduction content.'}
            </p>
          </div>
        </EditControl>

        {/* Philosophy */}
        <EditControl 
          type="edit" 
          label="Edit Philosophy" 
          initialValue={content.philosophy || ''}
          onSave={(val) => handleSave('philosophy', val, true)}
          editorTitle="Philosophy"
          editorType="textarea"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-4">Philosophy</p>
            <p className="text-xl font-light text-stone-700 leading-relaxed">
              {content.philosophy || 'No philosophy content.'}
            </p>
          </div>
        </EditControl>

        {/* Description */}
        <div className="md:col-span-2">
          <EditControl 
            type="edit" 
            label="Edit Description" 
            initialValue={content.description || ''}
            onSave={(val) => handleSave('description', val, true)}
            editorTitle="Detailed Description"
            editorType="textarea"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-4">About the Studio</p>
              <p className="text-[15px] font-light text-stone-600 leading-relaxed max-w-2xl">
                {content.description || 'No detailed description.'}
              </p>
            </div>
          </EditControl>
        </div>

        {/* Mission */}
        <div className="md:col-span-2 border-t border-stone-100 pt-12">
          <EditControl 
            type="edit" 
            label="Edit Mission" 
            initialValue={content.mission || ''}
            onSave={(val) => handleSave('mission', val, true)}
            editorTitle="Studio Mission"
            editorType="textarea"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-4">Mission</p>
              <p className="text-2xl font-light text-stone-900 max-w-xl leading-relaxed">
                "{content.mission || 'No mission statement.'}"
              </p>
            </div>
          </EditControl>
        </div>
      </div>
    </div>
  )
}
