'use client'

import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface PinManagerProps {
  initialLat?: number
  initialLng?: number
  onLocationSelect: (lat: number, lng: number) => void
}

export default function PinManager({ initialLat = 42.32, initialLng = 43.35, onLocationSelect }: PinManagerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)
  
  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng })

  useEffect(() => {
    if (!mapContainer.current) return
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [coords.lng, coords.lat],
      zoom: 6,
      attributionControl: false
    })

    marker.current = new mapboxgl.Marker({ color: '#171717' })
      .setLngLat([coords.lng, coords.lat])
      .addTo(map.current)

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat
      setCoords({ lat, lng })
      marker.current?.setLngLat([lng, lat])
      onLocationSelect(lat, lng)
    })

    return () => {
      map.current?.remove()
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-1">Project Pin Location</h3>
          <p className="text-[11px] text-stone-400">Click on the map to place the project marker.</p>
        </div>
        <div className="text-[10px] font-mono text-stone-500 bg-stone-50 px-3 py-1.5 border border-stone-100">
          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </div>
      </div>
      
      <div 
        ref={mapContainer} 
        className="h-80 w-full bg-stone-100 border border-stone-200 grayscale-[0.5]"
      />
    </div>
  )
}
