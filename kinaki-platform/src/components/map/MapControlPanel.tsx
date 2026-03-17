'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { MapAdapter } from '@/lib/map-adapter'
import { LAYER_REGISTRY } from '@/lib/map-adapter/registry'

interface MapControlPanelProps {
  adapter?: MapAdapter | null
  projectCounts?: { architecture: number; interior: number; furniture: number }
  isMobile?: boolean
}

export default function MapControlPanel({
  adapter,
  projectCounts = { architecture: 0, interior: 0, furniture: 0 },
  isMobile = false,
}: MapControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    LAYER_REGISTRY.forEach(layer => {
      initial[layer.id] = layer.defaultActive
    })
    return initial
  })

  // Sync state to map when adapter and style are ready
  useEffect(() => {
    let internalAdapter = adapter
    if (!internalAdapter && typeof window !== 'undefined') {
      internalAdapter = (window as any).kinakiAdapter
    }
    
    if (!internalAdapter) {
      // Periodic check for global adapter if prop is missing
      const adapterCheck = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).kinakiAdapter) {
          console.log('[MapControlPanel] Found global kinakiAdapter')
          clearInterval(adapterCheck)
          // Trigger a re-render or sync
          setActiveLayers(prev => ({ ...prev })) 
        }
      }, 1000)
      return () => clearInterval(adapterCheck)
    }
    
    let isMounted = true
    
    const syncLayers = () => {
      const currentAdapter = internalAdapter || (typeof window !== 'undefined' ? (window as any).kinakiAdapter : null)
      if (!isMounted || !currentAdapter || !currentAdapter.isStyleLoaded()) return
      
      console.log('[MapControlPanel] Style loaded, syncing layers...')
      LAYER_REGISTRY.forEach(layer => {
        const active = activeLayers[layer.id]
        if (layer.id === 'terrain') {
          currentAdapter.setTerrain(active)
        } else if (layer.id === 'waters') {
          currentAdapter.setWaterHighlight(active)
        } else if (!layer.id.includes('Projects')) {
          layer.mapboxLayers.forEach(id => {
            currentAdapter.setLayerVisibility(id, active)
          })
        }
      })
    }

    // Try immediately
    if (internalAdapter?.isStyleLoaded()) {
      syncLayers()
    } else {
      // Wait for style load if necessary
      const checkInterval = setInterval(() => {
        const currentAdapter = internalAdapter || (typeof window !== 'undefined' ? (window as any).kinakiAdapter : null)
        if (currentAdapter?.isStyleLoaded()) {
          syncLayers()
          clearInterval(checkInterval)
        }
      }, 500)
      return () => {
        clearInterval(checkInterval)
        isMounted = false
      }
    }

    return () => { isMounted = false }
  }, [adapter, activeLayers]) // Re-run if activeLayers changes to ensure sync

  const toggleLayer = useCallback(
    (layerId: string) => {
      const newValue = !activeLayers[layerId]
      setActiveLayers(prev => ({ ...prev, [layerId]: newValue }))
      
      const currentAdapter = adapter || (typeof window !== 'undefined' ? (window as any).kinakiAdapter : null)
      
      if (!currentAdapter) {
        console.warn('[MapControlPanel] No adapter found during toggle')
        return
      }

      const layer = LAYER_REGISTRY.find(l => l.id === layerId)
      if (!layer) return

      console.log(`[MapControlPanel] Toggling layer: ${layerId} -> ${newValue}`)

      // Apply to map
      if (layer.id === 'terrain') {
        currentAdapter.setTerrain(newValue)
      } else if (layer.id === 'waters') {
        currentAdapter.setWaterHighlight(newValue)
      } else if (layer.id.includes('Projects')) {
        // External marker logic
      } else {
        layer.mapboxLayers.forEach(id => {
          currentAdapter.setLayerVisibility(id, newValue)
        })
      }
    },
    [adapter, activeLayers]
  )

  const resetToDefault = useCallback(() => {
    const fresh: Record<string, boolean> = {}
    LAYER_REGISTRY.forEach(layer => {
      fresh[layer.id] = layer.defaultActive
      
      if (adapter) {
        if (layer.id === 'terrain') {
          adapter.setTerrain(layer.defaultActive)
        } else if (layer.id === 'waters') {
          adapter.setWaterHighlight(layer.defaultActive)
        } else {
          layer.mapboxLayers.forEach(id => {
            adapter.setLayerVisibility(id, layer.defaultActive)
          })
        }
      }
    })
    setActiveLayers(fresh)
  }, [adapter])

  const renderGroup = (groupName: 'Labels' | 'Projects' | 'Options') => {
    const items = LAYER_REGISTRY.filter(l => l.group === groupName)
    const countsMap: Record<string, number | undefined> = {
      archProjects: projectCounts.architecture,
      intProjects: projectCounts.interior,
      furnProjects: projectCounts.furniture,
    }

    return (
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-3">{groupName}</p>
        <div className="space-y-2">
          {items.map(layer => (
            <LayerToggle
              key={layer.id}
              label={layer.label}
              count={countsMap[layer.id]}
              active={activeLayers[layer.id]}
              onClick={() => toggleLayer(layer.id)}
            />
          ))}
        </div>
      </div>
    )
  }

  const panelContent = (
    <div className="space-y-6">
      {renderGroup('Labels')}
      {renderGroup('Projects')}
      {renderGroup('Options')}

      <button
        onClick={resetToDefault}
        className="w-full text-[11px] uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900 transition-colors border border-stone-200 hover:border-stone-900 py-2 rounded-none mt-4"
      >
        Reset Defaults
      </button>
    </div>
  )

  return (
    <div className={cn(
      "absolute z-20 transition-all duration-300",
      isMobile ? "bottom-8 right-8" : "left-8 top-1/2 -translate-y-1/2"
    )}>
      <div className="relative group">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-12 h-12 bg-white flex items-center justify-center transition-all duration-300 shadow-sm border border-stone-100 hover:border-stone-900 group-hover:shadow-md",
            isOpen && "border-stone-900 bg-stone-900 text-white"
          )}
          title="Toggle Layers"
        >
          <LayersIcon className={cn("w-5 h-5 transition-colors", isOpen ? "text-white" : "text-stone-600")} />
        </button>

        {/* Panel Container */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={isMobile ? { y: 20, opacity: 0 } : { x: -20, opacity: 0 }}
              animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
              exit={isMobile ? { y: 20, opacity: 0 } : { x: -20, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "absolute bg-white border border-stone-100 shadow-xl p-8 custom-map-panel",
                isMobile 
                  ? "bottom-16 right-0 w-[240px]" 
                  : "left-16 top-0 w-[260px]"
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <p className="text-[11px] uppercase tracking-[0.3em] text-stone-900 font-medium">
                  Layers
                </p>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-stone-400 hover:text-stone-900 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {panelContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function LayerToggle({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count?: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full group"
    >
      <span
        className={cn(
          'text-[12px] tracking-wide transition-colors',
          active ? 'text-stone-900' : 'text-stone-400'
        )}
      >
        {label}
      </span>
      <div className="flex items-center gap-2">
        {count !== undefined && (
          <span className="text-[10px] text-stone-400">{count}</span>
        )}
        <div
          className={cn(
            'w-6 h-3 rounded-full transition-colors relative',
            active ? 'bg-stone-900' : 'bg-stone-200'
          )}
        >
          <div
            className={cn(
              'absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all',
              active ? 'right-0.5' : 'left-0.5'
            )}
          />
        </div>
      </div>
    </button>
  )
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 7l8-4 8 4-8 4-8-4z" />
      <path d="M2 11l8 4 8-4" />
      <path d="M2 15l8 4 8-4" />
    </svg>
  )
}
