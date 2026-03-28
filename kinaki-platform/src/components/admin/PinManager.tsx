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
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-900 mb-1">Project Pin Location</h3>
          <p className="text-[11px] text-stone-400 uppercase tracking-widest leading-relaxed">Click to place or drag to move the project marker. <br/>You can also enter coordinates manually below.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-widest text-stone-400">Latitude</span>
            <input 
              type="number" 
              step="any"
              value={coords.lat}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                if (!isNaN(val) && adapter) updatePin(adapter, { ...coords, lat: val })
              }}
              className="text-[11px] font-mono text-stone-900 bg-white px-3 py-1.5 border border-stone-200 w-24 outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-widest text-stone-400">Longitude</span>
            <input 
              type="number" 
              step="any"
              value={coords.lng}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                if (!isNaN(val) && adapter) updatePin(adapter, { ...coords, lng: val })
              }}
              className="text-[11px] font-mono text-stone-900 bg-white px-3 py-1.5 border border-stone-200 w-24 outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>
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
