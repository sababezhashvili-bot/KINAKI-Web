'use client'

import { useEffect, useRef, useCallback } from 'react'
import { getMapAdapter } from '@/lib/map-adapter'
import type { LngLat } from '@/lib/map-adapter'

interface KinakiMapProps {
  defaultCenter?: LngLat
  defaultZoom?: number
  onMapReady?: (adapter: ReturnType<typeof getMapAdapter>) => void
  children?: React.ReactNode
}

const KINAKI_MONOCHROME_STYLE = 'mapbox://styles/mapbox/light-v11'

const HIDDEN_LAYERS = [
  'poi-label',
  'transit-label',
  'airport-label',
  'settlement-minor-label',
  'settlement-major-label',
]

const GEORGIA_CENTER: LngLat = { lng: 43.35, lat: 42.32 }

export default function KinakiMap({
  defaultCenter = GEORGIA_CENTER,
  defaultZoom = 5.8,
  onMapReady,
  children,
}: KinakiMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const adapterRef = useRef(getMapAdapter())
  const isInitialized = useRef(false)

  const hideCommercialLayers = useCallback(() => {
    const adapter = adapterRef.current
    HIDDEN_LAYERS.forEach(layerId => {
      try {
        adapter.setLayerVisibility(layerId, false)
      } catch {}
    })
  }, [])

  useEffect(() => {
    if (!containerRef.current || isInitialized.current) return
    isInitialized.current = true

    const adapter = adapterRef.current

    adapter.init({
      container: containerRef.current,
      center: defaultCenter,
      zoom: defaultZoom,
      style: KINAKI_MONOCHROME_STYLE,
    })

    adapter.on('load', () => {
      console.log('[KinakiMap] Map loaded. Exposing adapter to window.')
      if (typeof window !== 'undefined') {
        ;(window as any).kinakiAdapter = adapter
      }
      hideCommercialLayers()
      onMapReady?.(adapter)
    })

    const handleResize = () => adapter.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      adapter.destroy()
      isInitialized.current = false
    }
  }, [defaultCenter, defaultZoom, hideCommercialLayers, onMapReady])

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        id="kinaki-map"
        className="absolute inset-0 w-full h-full"
        style={{ background: '#f5f5f0' }}
      />
      {children}
    </div>
  )
}
