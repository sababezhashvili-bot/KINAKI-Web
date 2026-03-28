'use client'

import { useEffect, useCallback } from 'react'
import type { MapAdapter } from '@/lib/map-adapter'

interface Project {
  id: string
  slug: string
  title: string
  lat: number
  lng: number
  categorySlug: string
  coverImage: string
  shortDesc: string
}

interface ProjectMarkersProps {
  adapter: MapAdapter | null
  projects: Project[]
  onMarkerClickAction: (project: Project) => void
  visibleCategories: Record<string, boolean>
}

const CATEGORY_CLASSNAMES: Record<string, string> = {
  architecture: 'kinaki-marker kinaki-marker--arch',
  'interior-design': 'kinaki-marker kinaki-marker--int',
  'furniture-design': 'kinaki-marker kinaki-marker--furn',
}

export default function ProjectMarkers({
  adapter,
  projects,
  onMarkerClickAction,
  visibleCategories,
}: ProjectMarkersProps) {
  // Add all markers on mount
  useEffect(() => {
    if (!adapter) return

    projects.forEach(project => {
      const className =
        CATEGORY_CLASSNAMES[project.categorySlug] || 'kinaki-marker'
      
        adapter.addMarker(project.id, { lat: project.lat, lng: project.lng }, {
        className,
        size: 24, // Increased size from 10 to 24
        onClick: () => onMarkerClickAction(project)
      })
    })

    return () => {
      projects.forEach(p => adapter.removeMarker(p.id))
    }
  }, [adapter, projects, onMarkerClickAction]) // eslint-disable-line react-hooks/exhaustive-deps

  return null // DOM-based rendering via adapter
}
