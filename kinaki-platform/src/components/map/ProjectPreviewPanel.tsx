'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  slug: string
  title: string
  categorySlug: string
  category: string
  shortDesc: string
  coverImage: string
  city: string
  country: string
  year: number
}

interface ProjectPreviewPanelProps {
  project: Project | null
  onClose: () => void
}

export default function ProjectPreviewPanel({ project, onClose }: ProjectPreviewPanelProps) {
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (project) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [project, onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          ref={panelRef}
          key={project.id}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className={cn(
            'fixed right-0 top-0 bottom-0 z-30',
            'w-full sm:w-[400px]',
            'bg-white border-l border-stone-100 shadow-2xl',
            'flex flex-col'
          )}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-10 w-8 h-8 flex items-center justify-center bg-white border border-stone-200 hover:border-stone-900 transition-all group"
          >
            <XIcon className="w-4 h-4 text-stone-500 group-hover:text-stone-900 transition-colors" />
          </button>

          {/* Cover Image */}
          <div className="relative h-64 bg-stone-100 shrink-0 overflow-hidden">
            {project.coverImage ? (
              <Image
                src={project.coverImage}
                alt={project.title}
                fill
                className="object-cover"
                sizes="400px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <PlaceholderIcon className="w-12 h-12 text-stone-300" />
              </div>
            )}
            {/* Category badge */}
            <div className="absolute bottom-4 left-4">
              <span className="bg-white text-[10px] uppercase tracking-[0.2em] text-stone-600 px-3 py-1.5 shadow-sm">
                {project.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-7 flex flex-col overflow-y-auto">
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-2">
              {project.city}, {project.country} · {project.year}
            </p>

            <h2 className="text-2xl font-light text-stone-900 leading-snug mb-4">
              {project.title}
            </h2>

            <p className="text-[13px] text-stone-500 leading-relaxed mb-auto">
              {project.shortDesc}
            </p>

            <div className="pt-7">
              <button
                onClick={() =>
                  router.push(`/projects/${project.categorySlug}/${project.slug}`)
                }
                className={cn(
                  'w-full bg-stone-900 text-white text-[11px] uppercase tracking-[0.2em]',
                  'py-3.5 hover:bg-stone-800 transition-colors'
                )}
              >
                View Project
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  )
}

function PlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="3" y="3" width="18" height="18" rx="0" />
      <path d="M3 15l5-5 4 4 3-3 5 5" />
    </svg>
  )
}
