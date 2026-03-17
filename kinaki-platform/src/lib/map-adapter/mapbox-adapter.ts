import type { MapAdapter, MapOptions, LngLat, MarkerOptions } from './types'

let mapboxgl: typeof import('mapbox-gl') | null = null

class MapboxAdapterClass implements MapAdapter {
  private _map: any | null = null
  private markers: Map<string, any> = new Map()
  private static instance: MapboxAdapterClass

  private constructor() {}

  public static getInstance(): MapboxAdapterClass {
    if (!MapboxAdapterClass.instance) {
      MapboxAdapterClass.instance = new MapboxAdapterClass()
    }
    return MapboxAdapterClass.instance
  }

  async init(options: MapOptions) {
    if (typeof window === 'undefined') return

    // If already initialized with this container, don't recreate
    if (this._map && this._map.getContainer() === options.container) {
      console.log('[MapboxAdapter] Reusing existing map instance')
      return
    }

    // Lazy-load mapbox-gl only on client
    const module = await import('mapbox-gl')
    mapboxgl = (module as any).default || module
    ;(mapboxgl as any).accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

    console.log('[MapboxAdapter] Initializing new map instance')
    if (!mapboxgl) throw new Error('[MapboxAdapter] mapbox-gl failed to load')
    
    this._map = new mapboxgl.Map({
      container: options.container,
      style: options.style || 'mapbox://styles/mapbox/light-v11',
      center: [options.center.lng, options.center.lat],
      zoom: options.zoom,
      antialias: true,
      attributionControl: false,
      dragRotate: false, // Disable rotation to prevent compass from appearing/being useful
      touchZoomRotate: false,
    })

    this._map.on('style.load', () => {
      console.log('[MapboxAdapter] Style loaded. Adding sources.')
      // Add DEM source for terrain
      if (!this._map.getSource('mapbox-dem')) {
        this._map.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        })
      }
    })

    // Expose to window as ultimate fallback
    if (typeof window !== 'undefined') {
      ;(window as any).kinakiAdapter = this
    }
  }

  setStyle(styleUrl: string) {
    this._map?.setStyle(styleUrl)
  }

  flyTo(coords: LngLat, zoom = 12, options = {}) {
    this._map?.flyTo({ center: [coords.lng, coords.lat], zoom, ...options })
  }

  easeTo(coords: LngLat, zoom?: number, options = {}) {
    this._map?.easeTo({
      center: [coords.lng, coords.lat],
      ...(zoom !== undefined ? { zoom } : {}),
      ...options,
    })
  }

  addMarker(id: string, coords: LngLat, opts: MarkerOptions = {}) {
    if (!mapboxgl || !this._map) return
    const el = document.createElement('div')
    el.className = opts.className || 'kinaki-marker'
    const size = opts.size || 20
    el.style.width = `${size}px`
    el.style.height = `${size}px`
    el.style.backgroundColor = opts.color || '#000'
    el.style.borderRadius = '50%'
    el.style.cursor = 'pointer'
    el.style.border = '3px solid white'
    el.style.boxShadow = '0 0 15px rgba(0,0,0,0.3)'
    el.style.zIndex = '1000'
    
    // Simple pulse effect
    el.style.transition = 'transform 0.2s ease-out'
    el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.2)' })
    el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })
    
    if (opts.onClick) {
      el.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log('[MapboxAdapter] Marker clicked:', id)
        opts.onClick?.()
      })
    }

    const marker = new (mapboxgl as any).Marker({ element: el })
      .setLngLat([coords.lng, coords.lat])
      .addTo(this._map)
    this.markers.set(id, marker)
  }

  removeMarker(id: string) {
    this.markers.get(id)?.remove()
    this.markers.delete(id)
  }

  setLayerVisibility(layerId: string, visible: boolean) {
    if (!this._map) {
      console.warn('[MapboxAdapter] Map instance not ready for layer:', layerId)
      return
    }

    console.log(`[MapboxAdapter] Setting visibility for ${layerId} to ${visible}`)

    if (layerId === 'buildings3d' || layerId === '3d-buildings') {
      const realId = '3d-buildings'
      if (visible) {
        if (!this._map.getLayer(realId)) {
          this._map.addLayer({
            'id': realId,
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
              'fill-extrusion-color': '#e0e0e0',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.8
            }
          })
        } else {
          this._map.setLayoutProperty(realId, 'visibility', 'visible')
        }
      } else {
        if (this._map.getLayer(realId)) {
          this._map.setLayoutProperty(realId, 'visibility', 'none')
        }
      }
      return
    }

    try {
      if (!this._map.isStyleLoaded()) {
        console.warn(`[MapboxAdapter] Style not loaded yet for ${layerId}. Retrying...`)
        setTimeout(() => this.setLayerVisibility(layerId, visible), 100)
        return
      }

      if (this._map.getLayer(layerId)) {
        this._map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')
      } else {
        console.warn(`[MapboxAdapter] Layer not found in style: ${layerId}`)
      }
    } catch (err) {
      console.error(`[MapboxAdapter] Error setting visibility for ${layerId}:`, err)
    }
  }

  setTerrain(enabled: boolean) {
    if (!this._map) return
    if (enabled) {
      this._map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 })
    } else {
      this._map.setTerrain(null as any)
    }
  }

  setWaterHighlight(enabled: boolean) {
    if (!this._map) return
    const color = enabled ? '#dbe9ee' : '#f0f0f0'
    const opacity = enabled ? 0.8 : 1.0
    
    try {
      if (!this._map.isStyleLoaded()) {
        setTimeout(() => this.setWaterHighlight(enabled), 200)
        return
      }

      if (this._map.getLayer('water')) {
        this._map.setPaintProperty('water', 'fill-color', color)
        this._map.setPaintProperty('water', 'fill-opacity', opacity)
      }
      if (this._map.getLayer('waterway')) {
        this._map.setPaintProperty('waterway', 'line-color', color)
        this._map.setPaintProperty('waterway', 'line-opacity', opacity)
      }
    } catch (err) {
      console.warn('[MapboxAdapter] Error in setWaterHighlight:', err)
    }
  }

  setPaintProperty(layerId: string, name: string, value: unknown) {
    if (!this._map?.isStyleLoaded()) {
      setTimeout(() => this.setPaintProperty(layerId, name, value), 200)
      return
    }
    if (!this._map?.getLayer(layerId)) return
    this._map?.setPaintProperty(layerId, name, value)
  }

  setFilter(layerId: string, filter: unknown[]) {
    if (!this._map?.isStyleLoaded()) {
      setTimeout(() => this.setFilter(layerId, filter), 200)
      return
    }
    if (!this._map?.getLayer(layerId)) return
    this._map?.setFilter(layerId, filter as any)
  }

  on(event: string, handler: (e?: unknown) => void) {
    this._map?.on(event as any, handler)
  }

  off(event: string, handler: (e?: unknown) => void) {
    this._map?.off(event as any, handler)
  }

  resize() {
    this._map?.resize()
  }

  destroy() {
    // In singleton mode, we might not want to fully destroy on unmount
    // dependending on app needs, but here we can at least clean up listeners
    // this._map?.remove()
  }

  getZoom() {
    return this._map?.getZoom() ?? 0
  }

  getCenter(): LngLat {
    const c = this._map?.getCenter()
    return { lng: c?.lng ?? 0, lat: c?.lat ?? 0 }
  }

  isStyleLoaded() {
    return this._map?.isStyleLoaded() ?? false
  }
}

export const MapboxAdapter = MapboxAdapterClass.getInstance()
