'use client'

import React, { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { EditControl } from '@/components/admin/EditControl'

interface MediaItem {
  id: string
  url: string
  fileType: 'image' | 'video' | 'gif' | 'model'
  sortOrder: number
}

interface MediaManagerProps {
  projectId?: string
  initialMedia?: MediaItem[]
  currentCover?: string
  onSetCover?: (url: string) => void
}

export default function MediaManager({ projectId, initialMedia = [], currentCover, onSetCover }: MediaManagerProps) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setIsUploading(true)
    const formData = new FormData()
    Array.from(files).forEach(file => formData.append('files', file))
    if (projectId) formData.append('projectId', projectId)

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      })
      
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error')
        throw new Error(`Upload failed: ${res.status} ${res.statusText} - ${errorText}`)
      }
      
      const newMedia = await res.json()
      const mediaList = Array.isArray(newMedia) ? newMedia : [newMedia]
      setMedia(prev => [...prev, ...mediaList])
      
      // If no cover, set the first uploaded as cover
      if (!currentCover && mediaList[0] && onSetCover) {
        onSetCover(mediaList[0].url)
      }
    } catch (err: any) {
      console.error('[MediaManager Upload Error]', err)
      const message = err.message || 'Upload failed'
      alert(`Upload Failed: ${message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return
    
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setMedia(prev => prev.filter(m => m.id !== id))
    } catch (err) {
      alert('Delete failed')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-stone-100 pb-4">
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-stone-900">Project Gallery</h3>
          <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Upload images, videos or 3D models</p>
        </div>
        <label className="cursor-pointer bg-stone-900 text-white px-6 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-sm">
          {isUploading ? 'Uploading...' : 'Add Media'}
          <input 
            type="file" 
            multiple 
            className="hidden" 
            onChange={handleUpload} 
            disabled={isUploading}
            accept="image/*,video/*,.glb,.gltf"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {media.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => {
          const isCover = currentCover === item.url
          return (
            <div key={item.id} className={`relative aspect-[4/5] bg-stone-50 group border ${isCover ? 'border-stone-900 ring-1 ring-stone-900' : 'border-stone-100'} overflow-hidden transition-all duration-300`}>
              {item.fileType === 'video' ? (
                <video src={item.url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
              ) : item.fileType === 'model' ? (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400 bg-stone-100">3D MODEL</div>
              ) : (
                <img src={item.url} className="w-full h-full object-cover" alt="" />
              )}
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                {!isCover && (
                  <button 
                    onClick={() => onSetCover?.(item.url)}
                    className="bg-white text-black px-4 py-2 text-[9px] uppercase tracking-[0.2em] font-medium hover:bg-stone-100 transition-colors"
                  >
                    Set as Cover
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="text-white/60 hover:text-red-400 transition-colors text-[9px] uppercase tracking-[0.2em]"
                >
                  Delete Asset
                </button>
              </div>
              
              {isCover && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-stone-900 text-white text-[8px] uppercase tracking-[0.2em] font-bold">
                  Cover
                </div>
              )}

              <div className="absolute bottom-3 right-3 px-1.5 py-0.5 bg-black/40 text-white text-[8px] uppercase tracking-widest rounded-sm border border-white/10">
                {item.fileType}
              </div>
            </div>
          )
        })}
        
        {media.length === 0 && !isUploading && (
          <div className="col-span-full py-20 border border-dashed border-stone-200 flex flex-col items-center justify-center gap-4">
            <ImageIcon size={32} className="text-stone-100" />
            <p className="text-stone-300 text-[10px] uppercase tracking-[0.2em]">No media assets uploaded</p>
          </div>
        )}
      </div>
    </div>
  )
}
