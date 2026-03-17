'use client'

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface MapScaleProps {
  zoom: number
  className?: string
}

export function MapScale({ zoom, className }: MapScaleProps) {
  const { scaleText, barWidth, physicalDistance } = useMemo(() => {
    const lat = 42.32
    // Mapbox meters per pixel formula
    const metersPerPx = (Math.cos(lat * Math.PI / 180) * 40075016) / (256 * Math.pow(2, zoom))
    
    const rawScale = metersPerPx / 0.000264 // Approx scale 1:N at 96dpi
    let displayValue: string

    if (rawScale > 1000000) {
      displayValue = `1:${(Math.round(rawScale / 100000) / 10).toFixed(1)}M`
    } else if (rawScale > 10000) {
      displayValue = `1:${Math.round(rawScale / 1000)}K`
    } else {
      displayValue = `1:${Math.round(rawScale / 100) * 100}`
    }

    // Dynamic distance units based on zoom
    let dist = 100 
    if (zoom < 11) dist = 1000 // 1km
    if (zoom < 8) dist = 10000 // 10km
    if (zoom < 5) dist = 100000 // 100km
    if (zoom > 16) dist = 10 // 10m

    // Calculate width in pixels to represent 'dist' meters
    const pxWidth = dist / metersPerPx

    return { 
      scaleText: displayValue, 
      barWidth: Math.max(120, Math.min(220, pxWidth)), // Increased min width to prevent overlap
      physicalDistance: dist
    }
  }, [zoom])

  const labelStyle = "text-[7px] font-bold text-black tabular-nums"

  return (
    <div className={cn(
      "flex flex-col items-end gap-1.5 select-none",
      className
    )}>
      {/* The Visual Scale Bar (Architectural Style) */}
      <div className="relative flex flex-col items-end">
        
        {/* Labels above the bar - Simplified to prevent overcrowding */}
        <div className="relative h-3 w-full border-b border-transparent mb-1" style={{ width: barWidth }}>
          <span className={cn(labelStyle, "absolute left-0 bottom-0")}>0</span>
          <span className={cn(labelStyle, "absolute left-[10%] bottom-0 -translate-x-1/2")}>{physicalDistance * 0.1}</span>
          <span className={cn(labelStyle, "absolute left-[50%] bottom-0 -translate-x-1/2")}>{physicalDistance * 0.5}</span>
          <span className={cn(labelStyle, "absolute right-0 bottom-0")}>{physicalDistance}m</span>
        </div>

        {/* The Graphic Bar (Stepped Pattern) */}
        <div className="relative h-[6px] border-[0.5px] border-black bg-white overflow-hidden shadow-sm flex" style={{ width: barWidth }}>
          <div className="h-full border-r-[0.5px] border-black bg-black" style={{ width: '5%' }} />
          <div className="h-full border-r-[0.5px] border-black flex flex-col" style={{ width: '5%' }}>
            <div className="h-1/2 bg-white" />
            <div className="h-1/2 bg-black" />
          </div>
          <div className="h-full border-r-[0.5px] border-black bg-black" style={{ width: '40%' }} />
          <div className="h-full flex flex-col" style={{ width: '50%' }}>
            <div className="h-1/2 bg-white" />
            <div className="h-1/2 bg-black" />
          </div>
        </div>
      </div>

      {/* Info labels below the bar */}
      <div className="flex flex-col items-end">
        <div className="text-[13px] font-bold tracking-[0.1em] text-black">
          {scaleText}
        </div>
      </div>
    </div>
  )
}
