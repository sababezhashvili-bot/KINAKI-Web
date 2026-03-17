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
  onMarkerClick: (project: Project) => void
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
  onMarkerClick,
  visibleCategories,
}: ProjectMarkersProps) {
  // Add all markers on mount
  useEffect(() => {
    if (!adapter) return

    const clickHandlers: Array<{ id: string; el: HTMLElement; handler: () => void }> = []

    projects.forEach(project => {
      const className =
        CATEGORY_CLASSNAMES[project.categorySlug] || 'kinaki-marker'
      adapter.addMarker(project.id, { lat: project.lat, lng: project.lng }, {
        className,
        size: 10,
      })

      // The adapter's marker elements need click handlers — attach via DOM
      const el = document.querySelector(`[data-marker-id="${project.id}"]`) as HTMLElement
      if (el) {
        const handler = () => onMarkerClick(project)
        el.addEventListener('click', handler)
        clickHandlers.push({ id: project.id, el, handler })
      }
    })

    return () => {
      clickHandlers.forEach(({ el, handler }) => el?.removeEventListener('click', handler))
      projects.forEach(p => adapter.removeMarker(p.id))
    }
  }, [adapter, projects]) // eslint-disable-line react-hooks/exhaustive-deps

  return null // DOM-based rendering via adapter
}
