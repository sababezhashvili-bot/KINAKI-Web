'use client'

import React, { useCallback, useState } from 'react'
import KinakiMap from './KinakiMap'
import type { MapAdapter, LngLat } from '@/lib/map-adapter/types'
import ProjectMarkers from './ProjectMarkers'

interface MainMapProps {
  interactive?: boolean
  onLocationSelect?: (coords: LngLat) => void
  onMapReady?: (adapter: MapAdapter) => void
  onMarkerClick?: (project: any) => void
  projects?: any[]
  initialCenter?: LngLat
  initialZoom?: number
  children?: React.ReactNode
}

/**
 * MainMap — The unified map component for KINAKI.
 * Ensures parity between Homepage and Admin Panel.
 */
export default function MainMap({
  interactive = false,
  onLocationSelect,
  onMapReady,
  onMarkerClick,
  projects = [],
  initialCenter,
  initialZoom,
  children,
}: MainMapProps) {
  const [adapter, setAdapter] = useState<MapAdapter | null>(null)

  const handleMapReady = useCallback((a: MapAdapter) => {
    setAdapter(a)
    
    if (interactive) {
      console.log('[MainMap] Interaction enabled. Adding click listener.')
      a.on('click', (e: any) => {
        const coords = e.lngLat
        if (coords && onLocationSelect) {
          onLocationSelect({ lng: coords.lng, lat: coords.lat })
        }
      })
    }

    onMapReady?.(a)
  }, [interactive, onLocationSelect, onMapReady])

  return (
    <KinakiMap 
      onMapReady={handleMapReady}
      defaultCenter={initialCenter}
      defaultZoom={initialZoom}
    >
      {adapter && projects.length > 0 && (
        <ProjectMarkers 
          adapter={adapter}
          projects={projects}
          onMarkerClick={onMarkerClick || (() => {})}
          visibleCategories={{ architecture: true, 'interior-design': true, 'furniture-design': true }}
        />
      )}
      {children}
    </KinakiMap>
  )
}
