'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import MediaManager from './MediaManager'
import PinManager from './PinManager'

interface ProjectFormProps {
  initialData?: any
  categories: any[]
}

export default function ProjectForm({ initialData, categories }: ProjectFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    categoryId: initialData?.categoryId || (categories[0]?.id || ''),
    shortDesc: initialData?.shortDesc || '',
    fullDesc: initialData?.fullDesc || '',
    year: initialData?.year || new Date().getFullYear(),
    city: initialData?.city || 'Tbilisi',
    country: initialData?.country || 'Georgia',
    client: initialData?.client || '',
    area: initialData?.area || '',
    status: initialData?.status || 'draft',
    coverImage: initialData?.coverImage || '',
    featured: initialData?.featured || false,
    lat: initialData?.pin?.lat || 42.32,
    lng: initialData?.pin?.lng || 43.35,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const url = initialData?.id 
        ? `/api/admin/projects/${initialData.id}` 
        : '/api/admin/projects'
        
      const res = await fetch(url, {
        method: initialData?.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to save project')
      
      router.push('/admin/dashboard')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Error saving project')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12 max-w-4xl pb-32">
      {/* Header Info */}
      <section className="bg-white border border-stone-100 p-10 space-y-8">
        <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold text-stone-400">Basic Information</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-stone-500">Project Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-stone-50 border-none p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-stone-500">Slug (URL)</label>
            <input
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="e.g. mountain-retreat"
              className="w-full bg-stone-50 border-none p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-stone-500">Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full bg-stone-50 border-none p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900 appearance-none"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-stone-500">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-stone-50 border-none p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900 appearance-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </section>

      {/* Location & Pin Section */}
      <section className="bg-white border border-stone-100 p-10 space-y-8">
        <PinManager 
          initialLat={formData.lat} 
          initialLng={formData.lng} 
          onLocationSelect={(lat, lng) => setFormData(p => ({ ...p, lat, lng }))}
        />
      </section>

      {/* Details Section */}
      <section className="bg-white border border-stone-100 p-10 space-y-8">
        <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold text-stone-400">Content & Details</h2>
        
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-stone-500">Short Description</label>
          <textarea
            name="shortDesc"
            value={formData.shortDesc}
            onChange={handleChange}
            rows={3}
            className="w-full bg-stone-50 border-none p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900 resize-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-stone-500">Full Description</label>
          <textarea
            name="fullDesc"
            value={formData.fullDesc}
            onChange={handleChange}
            rows={10}
            className="w-full bg-stone-50 border-none p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900 resize-none font-mono"
            required
          />
        </div>
      </section>

      {/* Media Management Section */}
      <section className="bg-white border border-stone-100 p-10 space-y-8">
        <MediaManager 
          projectId={initialData?.id} 
          initialMedia={initialData?.media || []} 
          currentCover={formData.coverImage}
          onSetCover={(url) => setFormData(prev => ({ ...prev, coverImage: url }))}
        />
      </section>

      {/* Metadata Section */}
      <section className="bg-white border border-stone-100 p-10 space-y-8">
        <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold text-stone-400">Metadata & Specs</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-stone-500">Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full bg-stone-50 border-none p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-stone-500">City</label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full bg-stone-50 border-none p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-stone-500">Country</label>
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full bg-stone-50 border-none p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-stone-500">Client</label>
            <input
              name="client"
              value={formData.client}
              onChange={handleChange}
              className="w-full bg-stone-50 border-none p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-stone-500">Area (e.g. 200 sqm)</label>
            <input
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full bg-stone-50 border-none p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>
        </div>
      </section>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-stone-100 p-6 flex justify-between items-center z-[1000]">
        <div className="text-[10px] uppercase tracking-widest text-stone-400">
          Last updated: {initialData?.updatedAt ? new Date(initialData.updatedAt).toLocaleString() : 'Never'}
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3 text-[11px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-stone-900 text-white px-10 py-3 text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-black transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Project'}
          </button>
        </div>
      </div>
    </form>
  )
}
