'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { getMapAdapter } from '@/lib/map-adapter'
import type { LngLat } from '@/lib/map-adapter'
import { MapScale } from './MapScale'

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
  const [mapError, setMapError] = useState<string | null>(null)
  const [currentZoom, setCurrentZoom] = useState(defaultZoom)

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

    try {
      console.log('[KinakiMap] Initializing adapter...')
      adapter.init({
        container: containerRef.current,
        center: defaultCenter,
        zoom: defaultZoom,
        style: KINAKI_MONOCHROME_STYLE,
      })
    } catch (err: any) {
      console.error('[KinakiMap] Critical init error:', err)
      setMapError(err.message || 'Failed to initialize map engine')
    }

    const handleReady = () => {
      console.log('[KinakiMap] Map loaded. Syncing state.')
      if (typeof window !== 'undefined') {
        ;(window as any).kinakiAdapter = adapter
      }
      updateZoom() // Initial sync
      hideCommercialLayers()
      onMapReady?.(adapter)
    }

    if (adapter.isReady()) {
      console.log('[KinakiMap] Adapter already ready, calling handleReady immediately')
      handleReady()
    } else {
      adapter.on('load', handleReady)
    }

    const updateZoom = () => {
      const z = adapter.getZoom()
      // console.log('[KinakiMap] Dynamic update:', z)
      setCurrentZoom(z)
    }

    adapter.on('zoom', updateZoom)
    adapter.on('move', updateZoom)
    adapter.on('moveend', updateZoom)
    adapter.on('pitchend', updateZoom)
    adapter.on('rotateend', updateZoom)

    adapter.on('error', (e: any) => {
      console.error('[KinakiMap] Internal map error:', e)
    })

    const handleResize = () => adapter.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      adapter.destroy()
      isInitialized.current = false
    }
  }, [defaultCenter, defaultZoom, hideCommercialLayers, onMapReady])

  const tokenMissing = typeof window !== 'undefined' && (window as any)._kinakiMapTokenStatus === 'MISSING'
  const showError = tokenMissing || !!mapError

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div
        ref={containerRef}
        id="kinaki-map"
        className="absolute inset-0 w-full h-full bg-stone-50"
        style={{ background: '#f5f5f0' }}
      />
      
      {/* Dynamic Map Scale */}
      <div className="absolute bottom-6 right-6 z-10 pointer-events-none">
        <MapScale zoom={currentZoom} />
      </div>

      {showError && (
        <div className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-stone-100/90 backdrop-blur-sm p-8 text-center animate-in fade-in duration-500">
          <div className="text-stone-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-900 mb-2">
            {tokenMissing ? 'Map Configuration Missing' : 'Map Initialization Error'}
          </h3>
          <p className="text-[10px] text-stone-500 max-w-xs leading-relaxed uppercase tracking-wider">
            {tokenMissing 
              ? 'Mapbox access token is not configured correctly on Vercel. Please check environment variables.' 
              : mapError || 'An unexpected error occurred while loading the map.'}
          </p>
          {process.env.NODE_ENV === 'development' && mapError && (
            <p className="mt-4 text-[9px] font-mono text-stone-400 bg-white p-2 border border-stone-100">
              {mapError}
            </p>
          )}
        </div>
      )}

      {children}
    </div>
  )
}
