import React, { useState, useEffect } from 'react'
import MainMap from '@/components/map/MainMap'
import type { MapAdapter, LngLat } from '@/lib/map-adapter/types'

interface PinManagerProps {
  initialLat?: number
  initialLng?: number
  allProjects?: any[]
  onLocationSelect: (lat: number, lng: number) => void
}

export default function PinManager({ 
  initialLat = 42.1, 
  initialLng = 44.2, 
  allProjects = [],
  onLocationSelect 
}: PinManagerProps) {
  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng })
  const [adapter, setAdapter] = useState<MapAdapter | null>(null)

  const updatePin = (a: MapAdapter, newCoords: LngLat) => {
    setCoords(newCoords)
    onLocationSelect(newCoords.lat, newCoords.lng)
    
    // Use the adapter to update/re-add the temporary pin
    a.addMarker('temp-pin', newCoords, {
      color: '#171717',
      size: 24,
      draggable: true,
      onDragEnd: (draggedCoords) => {
        updatePin(a, draggedCoords)
      }
    })
  }

  const handleMapReady = (a: MapAdapter) => {
    setAdapter(a)
    // Add initial marker
    updatePin(a, { lat: initialLat, lng: initialLng })
  }

  const handleMapClick = (c: LngLat) => {
    if (adapter) {
      updatePin(adapter, c)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-1">Project Pin Location</h3>
          <p className="text-[11px] text-stone-400">Click to place or drag to move the project marker.</p>
        </div>
        <div className="text-[10px] font-mono text-stone-500 bg-stone-50 px-3 py-1.5 border border-stone-100">
          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </div>
      </div>
      
      <div className="h-80 w-full relative">
        <MainMap 
          interactive={true} 
          onLocationSelect={handleMapClick}
          onMapReady={handleMapReady}
          projects={allProjects}
          initialCenter={{ lat: coords.lat, lng: coords.lng }}
          initialZoom={6}
        />
      </div>
    </div>
  )
}
