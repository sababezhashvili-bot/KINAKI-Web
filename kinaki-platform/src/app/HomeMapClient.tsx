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

interface MapObject {
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
  type: 'project' | 'pin'
  hasPin?: boolean
}

export function HomeMapClient({ projects }: { projects: MapObject[] }) {
  console.log('[HomeMapClient] RENDER. Projects prop length:', projects?.length)
  if (projects?.length > 0) {
    console.log('[HomeMapClient] First project sample:', { 
      title: projects[0].title, 
      lat: projects[0].lat, 
      lng: projects[0].lng, 
      cat: projects[0].categorySlug 
    })
  }

  const router = useRouter()
  const searchParams = useSearchParams()
  const [adapter, setAdapter] = useState<MapAdapter | null>(null)
  const [selectedProject, setSelectedProject] = useState<MapObject | null>(null)
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
    (project: MapObject) => {
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

  useEffect(() => {
    if (!adapter || projects.length === 0) {
      console.log('[HomeMapClient] Waiting for adapter or projects...', { hasAdapter: !!adapter, count: projects.length })
      return
    }

    const renderMarkers = () => {
      console.log('[HomeMapClient] Rendering markers. Count:', projects.length)
      
      projects.forEach(item => {
        const isProject = item.type === 'project'
        const lat = Number(item.lat)
        const lng = Number(item.lng)
        
        if (isNaN(lat) || isNaN(lng)) {
          console.error(`[HomeMapClient] Invalid coords for ${item.title}:`, { lat, lng })
          return
        }

        console.log(`[HomeMapClient] Adding marker for ${item.title} at ${lat}, ${lng}`)
        adapter.addMarker(item.id, { lat, lng }, {
          className: isProject ? 'project-marker' : 'pin-marker',
          size: isProject ? 24 : 14,
          color: '#1c1917',
          onClick: () => {
            if (isProject) {
              handleMarkerClick(item)
            }
          }
        })
      })
    }

    const interval = setInterval(() => {
      if (adapter && adapter.isReady()) {
        const info = adapter.getMarkersInfo()
        if (info.length === 0 && projects.length > 0) {
          console.log('[HomeMapClient] Active marker count is 0. Retrying...')
          renderMarkers()
        }
      }
    }, 2000)

    if (adapter.isStyleLoaded()) {
      renderMarkers()
    } else {
      console.log('[HomeMapClient] Waiting for style load before markers...')
      adapter.on('style.load', renderMarkers)
    }

    return () => {
      clearInterval(interval)
      console.log('[HomeMapClient] Cleaning up markers...')
      projects.forEach(p => adapter.removeMarker(p.id))
      adapter.off('style.load', renderMarkers)
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
        {/* console.log('[HomeMapClient] Counts:', {
          arch: projects.filter(p => p.categorySlug === 'architecture').length,
          int: projects.filter(p => p.categorySlug === 'interior-design').length,
          furn: projects.filter(p => p.categorySlug === 'furniture-design').length,
        }) */}
        
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
