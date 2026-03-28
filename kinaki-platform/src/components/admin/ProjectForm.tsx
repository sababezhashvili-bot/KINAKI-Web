'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import MediaManager from './MediaManager'
import PinManager from './PinManager'

interface ProjectFormProps {
  initialData?: any
  categories: any[]
  allProjects?: any[]
}

export default function ProjectForm({ initialData, categories, allProjects = [] }: ProjectFormProps) {
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
    latitude: initialData?.latitude ?? initialData?.pin?.lat ?? 42.1, // Fallback to a valid default if null
    longitude: initialData?.longitude ?? initialData?.pin?.lng ?? 44.2,
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
    
    // Strict numeric validation
    const latNum = parseFloat(formData.latitude.toString())
    const lngNum = parseFloat(formData.longitude.toString())
    
    if (!formData.title?.trim()) {
      alert("Project title is required")
      return
    }

    if (isNaN(latNum) || isNaN(lngNum)) {
      alert("Latitude and longitude must be valid numeric coordinates")
      return
    }

    setIsSaving(true)
    console.log('[ProjectForm] Submitting data to API:', { ...formData, lat: latNum, lng: lngNum })
    
    try {
      const url = initialData?.id 
        ? `/api/admin/projects/${initialData.id}` 
        : '/api/admin/projects'
        
      const res = await fetch(url, {
        method: initialData?.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lat: latNum, 
          lng: lngNum
        })
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || 'Failed to save project server-side')
      }
      
      router.push('/admin/projects') // Return to the list page I just restored
      router.refresh()
    } catch (err: any) {
      console.error('[ProjectForm Error]', err)
      alert(`Save Failed: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12 max-w-4xl pb-24 relative">
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
              className="w-full bg-stone-50 border border-stone-200 p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white transition-all shadow-sm"
              required
              placeholder="Project Name"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-stone-500">Slug (URL)</label>
            <input
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="e.g. mountain-retreat"
              className="w-full bg-stone-50 border border-stone-200 p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white transition-all shadow-sm"
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

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-stone-500">Area (m²)</label>
            <input
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full bg-stone-50 border-none p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900"
              placeholder="e.g. 250"
            />
          </div>
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
            <label className="text-[10px] uppercase tracking-widest text-stone-500">Client</label>
            <input
              name="client"
              value={formData.client}
              onChange={handleChange}
              className="w-full bg-stone-50 border-none p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900"
              placeholder="e.g. Private Investor"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
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
      </section>

      {/* Location & Pin Section */}
      <section className="bg-white border border-stone-100 p-10 space-y-8">
        <PinManager 
          initialLat={formData.latitude} 
          initialLng={formData.longitude} 
          allProjects={allProjects}
          onLocationSelect={(lat, lng) => setFormData(p => ({ ...p, latitude: lat, longitude: lng }))}
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
            className="w-full bg-stone-50 border border-stone-200 p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white transition-all shadow-sm resize-none"
            required
            placeholder="A brief overview of the project (visible on map cards)"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-stone-500">Full Description</label>
          <textarea
            name="fullDesc"
            value={formData.fullDesc}
            onChange={handleChange}
            rows={10}
            className="w-full bg-stone-50 border border-stone-200 p-4 text-[14px] font-light outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white transition-all shadow-sm resize-none"
            required
            placeholder="Detailed project description..."
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


      {/* Actions Bar - Simplified, non-sticky to prevent covering fields */}
      <div className="bg-white border border-stone-100 p-10 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-8">
          <div className="text-[10px] uppercase tracking-widest text-stone-400">
            Last updated: {initialData?.updatedAt ? new Date(initialData.updatedAt).toLocaleString() : 'Never'}
          </div>
          {initialData?.id && (
            <button
              type="button"
              onClick={async () => {
                if (confirm(`Delete project "${formData.title}"? This action cannot be undone.`)) {
                  const res = await fetch(`/api/admin/projects/${initialData.id}`, { method: 'DELETE' })
                  if (res.ok) router.push('/admin/projects')
                }
              }}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-red-500 hover:text-red-700 font-bold transition-colors border border-red-100 px-4 py-2 rounded-sm"
            >
              <Trash2 size={14} />
              Delete Project
            </button>
          )}
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
