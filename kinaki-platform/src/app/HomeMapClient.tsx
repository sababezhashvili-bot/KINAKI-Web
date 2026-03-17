'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MapControlPanel from '@/components/map/MapControlPanel'
import ProjectPreviewPanel from '@/components/map/ProjectPreviewPanel'
import type { MapAdapter } from '@/lib/map-adapter'
import { EditControl } from '@/components/admin/EditControl'

// Dynamically import KinakiMap to avoid SSR issues with Mapbox
const KinakiMap = dynamic(() => import('@/components/map/KinakiMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
      <span className="text-[11px] uppercase tracking-[0.25em] text-stone-400 animate-pulse">
        Loading Map…
      </span>
    </div>
  ),
})

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
  lat: number
  lng: number
}

export function HomeMapClient({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [adapter, setAdapter] = useState<MapAdapter | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const markersAdded = useRef(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Deep-link support: open preview from URL query
  useEffect(() => {
    const slug = searchParams.get('project')
    if (slug && projects.length > 0) {
      const found = projects.find(p => p.slug === slug)
      if (found) setSelectedProject(found)
    }
  }, [searchParams, projects])

  const handleMapReady = useCallback((a: MapAdapter) => {
    setAdapter(a)
    markersAdded.current = false // Reset on remount
  }, [])

  const handleMarkerClick = useCallback(
    (project: Project) => {
      setSelectedProject(project)
      router.replace(`/?project=${project.slug}`, { scroll: false })
      adapter?.flyTo({ lat: project.lat, lng: project.lng }, 10, {
        duration: 1400,
        essential: true,
      })
    },
    [adapter, router]
  )

  const handleClose = useCallback(() => {
    setSelectedProject(null)
    router.replace('/', { scroll: false })
  }, [router])

  // Render markers when adapter and projects are ready
  useEffect(() => {
    if (!adapter || projects.length === 0) return

    const renderMarkers = () => {
      if (markersAdded.current) return
      
      console.log('[HomeMapClient] Actually rendering markers now...')
      projects.forEach(project => {
        // Ensure we have coordinates before adding marker
        const lat = project.lat || 42.32
        const lng = project.lng || 43.35
        
        adapter.addMarker(project.id, { lat, lng }, {
          className: 'project-marker',
          size: 20,
          color: '#000',
          onClick: () => handleMarkerClick(project)
        })
      })
      markersAdded.current = true
    }

    if (adapter.isStyleLoaded()) {
      renderMarkers()
    } else {
      adapter.on('load', renderMarkers)
      adapter.on('style.load', renderMarkers)
    }

    return () => {
      projects.forEach(p => adapter.removeMarker(p.id))
      adapter.off('load', renderMarkers)
      adapter.off('style.load', renderMarkers)
      markersAdded.current = false
    }
  }, [adapter, projects, handleMarkerClick])

  return (
    <div className="fixed inset-0">
      <KinakiMap onMapReady={handleMapReady}>
        <MapControlPanel
          adapter={adapter}
          isMobile={isMobile}
          projectCounts={{
            architecture: projects.filter(p => p.categorySlug === 'architecture').length,
            interior: projects.filter(p => p.categorySlug === 'interior-design').length,
            furniture: projects.filter(p => p.categorySlug === 'furniture-design').length,
          }}
        />
        
        <div className="absolute top-32 left-6 z-50">
          <EditControl 
            type="add" 
            label="Add New Project/Pin" 
            onClick={() => router.push('/admin/projects/new')}
          />
        </div>
      </KinakiMap>

      <ProjectPreviewPanel project={selectedProject} onClose={handleClose} />
    </div>
  )
}
