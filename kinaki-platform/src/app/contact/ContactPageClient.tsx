'use client'

import React from 'react'
import { EditControl } from '@/components/admin/EditControl'
import ContactForm from './ContactForm'

interface ContactPageClientProps {
  page: any
  content: any
}

export default function ContactPageClient({ page, content }: ContactPageClientProps) {
  const handleSave = async (field: string, value: string, isJson: boolean = false) => {
    const body: any = { key: 'contact' }
    
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

  const handleSocialSave = async (platform: string, url: string) => {
    const social = { ...content.social, [platform]: url }
    await handleSave('social', social, true)
  }

  return (
    <div 
      className="min-h-screen pb-24 px-6 md:px-16"
      style={{ paddingTop: '160px' }}
    >
      <div className="mb-16 max-w-xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-3">Get in Touch</p>
        <EditControl 
          type="edit" 
          label="Edit Page Title" 
          initialValue={page.title}
          onSave={(val) => handleSave('title', val)}
          editorTitle="Page Title"
        >
          <h1 className="text-4xl md:text-5xl font-light text-stone-900 mb-4">{page.title}</h1>
        </EditControl>
        <div className="w-10 h-px bg-stone-300" />
      </div>

      <div className="grid md:grid-cols-2 gap-16 max-w-4xl">
        {/* Contact Details */}
        <div className="space-y-8">
          <EditControl 
            type="edit" 
            label="Edit Contact Details" 
            initialValue={JSON.stringify({
              email: content.email,
              phone: content.phone,
              address: content.address,
              businessHours: content.businessHours
            }, null, 2)}
            onSave={async (val) => {
              const parsed = JSON.parse(val)
              await handleSave('content', JSON.stringify({ ...content, ...parsed }), false)
            }}
            editorTitle="Contact Details (JSON)"
            editorType="textarea"
          >
            <div className="space-y-8">
              {[
                { label: 'Email', value: content.email },
                { label: 'Phone', value: content.phone },
                { label: 'Address', value: content.address },
                { label: 'Hours', value: content.businessHours },
              ]
                .filter(i => i.value)
                .map(item => (
                  <div key={item.label}>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1.5">
                      {item.label}
                    </p>
                    <p className="text-[14px] font-light text-stone-700">{item.value}</p>
                  </div>
                ))}
            </div>
          </EditControl>

          {content.social && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1.5">Social</p>
              <div className="flex gap-5 mt-2">
                {Object.entries(content.social as Record<string, string>)
                  .filter(([, url]) => url)
                  .map(([platform, url]) => (
                    <EditControl 
                      key={platform} 
                      type="edit" 
                      label={`Edit ${platform}`} 
                      initialValue={url}
                      onSave={(val) => handleSocialSave(platform, val)}
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] uppercase tracking-[0.18em] text-stone-500 hover:text-stone-900 transition-colors"
                      >
                        {platform}
                      </a>
                    </EditControl>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact Form */}
        <ContactForm />
      </div>
    </div>
  )
}
