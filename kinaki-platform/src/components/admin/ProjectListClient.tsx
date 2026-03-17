'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Trash2 } from 'lucide-react'

interface ProjectListClientProps {
  projects: any[]
}

export default function ProjectListClient({ projects }: ProjectListClientProps) {
  const router = useRouter()

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete project "${title}"? This cannot be undone.`)) {
      try {
        const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
        if (res.ok) {
          router.refresh()
        } else {
          const data = await res.json()
          alert(`Error: ${data.error || 'Failed to delete project'}`)
        }
      } catch (err) {
        console.error('Delete error:', err)
        alert('Failed to delete project due to a network error.')
      }
    }
  }

  return (
    <div className="bg-white border border-stone-100 overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-100">
            <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 min-w-[200px]">Project</th>
            <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Category</th>
            <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Area</th>
            <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Location</th>
            <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Status</th>
            <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Map Pin</th>
            <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-stone-50/50 transition-colors group">
              <td className="px-8 py-6">
                <div className="space-y-1">
                  <p className="text-[14px] text-stone-900 font-light">{project.title}</p>
                  <p className="text-[10px] text-stone-300 font-mono tracking-tight">{project.slug}</p>
                </div>
              </td>
              <td className="px-8 py-6">
                <span className="text-[11px] uppercase tracking-[0.1em] text-stone-500">{project.category?.name || 'Uncategorized'}</span>
              </td>
              <td className="px-8 py-6">
                <span className="text-[13px] text-stone-600 font-light">{project.area || '—'}</span>
              </td>
              <td className="px-8 py-6">
                <p className="text-[13px] text-stone-500 font-light">{project.city}, {project.country}</p>
              </td>
              <td className="px-8 py-6">
                <span className={`px-3 py-1 text-[9px] uppercase tracking-[0.2em] rounded-full border ${
                  project.status === 'published' 
                    ? 'border-green-100 text-green-600 bg-green-50' 
                    : 'border-amber-100 text-amber-600 bg-amber-50'
                }`}>
                  {project.status}
                </span>
              </td>
              <td className="px-8 py-6 whitespace-nowrap">
                 {project.pin ? (
                  <div className="flex items-center gap-2 text-stone-900">
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-900" />
                    <span className="text-[11px] font-mono">{Number(project.pin.lat).toFixed(4)}, {Number(project.pin.lng).toFixed(4)}</span>
                  </div>
                ) : (
                  <span className="text-stone-300 text-[11px] italic">No Pin</span>
                )}
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center justify-end gap-4">
                  <Link 
                    href={`/admin/projects/${project.id}`}
                    className="text-stone-300 hover:text-stone-900 transition-colors"
                  >
                    <MoreHorizontal size={20} />
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id, project.title)}
                    className="text-stone-200 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr>
              <td colSpan={7} className="px-8 py-20 text-center text-stone-400 text-[12px] uppercase tracking-widest font-light">
                No projects found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
