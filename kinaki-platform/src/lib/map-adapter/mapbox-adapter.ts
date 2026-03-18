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

  private eventQueue: Array<{ event: string, handler: (e?: unknown) => void }> = []

  async init(options: MapOptions) {
    if (typeof window === 'undefined') return

    // If already initialized with this container, don't recreate
    if (this._map) {
      if (this._map.getContainer() === options.container) {
        console.log('[MapboxAdapter] Reusing existing map instance')
        this.flushEventQueue()
        return
      } else {
        console.log('[MapboxAdapter] Container changed. Cleaning up old map instance...')
        this.destroy()
      }
    }

    // Lazy-load mapbox-gl only on client
    const module = await import('mapbox-gl')
    mapboxgl = (module as any).default || module
    
    // პირდაპირ ჩაწერილი ტოკენი (Hardcoded), რომ გამოირიცხოს Vercel-ის ცვლადების პრობლემა
    const token = 'pk.eyJbc1q5mlw63yd2u2cn0hs6jnzf2gljhr486u3dkgm2yoifQ.V6q1KO4tol7QefPr8PQFxQ'.trim()

    if (typeof window !== 'undefined') {
      ;(window as any)._kinakiMapTokenStatus = token ? 'PRESENT' : 'MISSING'
      if (token) {
        console.log(`[MapboxAdapter] Token initialized (starts with: ${token.substring(0, 8)}...)`)
      }
    }

    if (mapboxgl) {
      (mapboxgl as any).accessToken = token
    } else {
      throw new Error('[MapboxAdapter] mapbox-gl failed to load')
    }
    
    this._map = new mapboxgl.Map({
      container: options.container,
      style: options.style || 'mapbox://styles/mapbox/light-v11',
      center: [options.center.lng, options.center.lat],
      zoom: options.zoom,
      antialias: true,
      attributionControl: false,
      dragRotate: true,
      touchZoomRotate: true,
    })

    this._map.on('load', () => {
      this.flushEventQueue()
    })

    this._map.on('style.load', () => {
      if (!this._map.getSource('mapbox-dem')) {
        this._map.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        })
      }
    })

    // Expose to window
    if (typeof window !== 'undefined') {
      ;(window as any).kinakiAdapter = this
    }
  }

  isReady() {
    return !!this._map && this._map.loaded()
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
    if (!mapboxgl || !this._map) {
      console.warn('[MapboxAdapter] Cannot add marker, map not ready', id)
      return
    }
    
    // Remove existing if it exists (idempotency)
    if (this.markers.has(id)) {
      this.removeMarker(id)
    }

    console.log(`[MapboxAdapter] CREATING CUSTOM MARKER ${id} at`, coords)

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
    
    if (opts.onClick) {
      el.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log('[MapboxAdapter] Marker clicked:', id)
        opts.onClick?.()
      })
    }

    const marker = new (mapboxgl as any).Marker({ element: el })
      .setLngLat([Number(coords.lng), Number(coords.lat)])
      .addTo(this._map)
    
    this.markers.set(id, marker)
    console.log(`[MapboxAdapter] CUSTOM MARKER ${id} ADDED TO MAP`)
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
        setTimeout(() => this.setLayerVisibility(layerId, visible), 100)
        return
      }

      if (this._map.getLayer(layerId)) {
        this._map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')
      }
    } catch (err) {
      console.error(`[MapboxAdapter] Error setting visibility for ${layerId}:`, err)
    }
  }

  setTerrain(enabled: boolean) {
    if (!this._map) return
    if (enabled) {
      this._map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 })
      this.setPitch(45)
    } else {
      this._map.setTerrain(null as any)
      this.setPitch(0)
    }
  }

  setPitch(pitch: number) {
    if (!this._map) return
    this._map.easeTo({ pitch, duration: 1000 })
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

  private flushEventQueue() {
    if (!this._map) return
    console.log(`[MapboxAdapter] Flushing ${this.eventQueue.length} queued events`)
    while (this.eventQueue.length > 0) {
      const { event, handler } = this.eventQueue.shift()!
      this._map.on(event, handler)
    }
  }

  on(event: string, handler: (e?: unknown) => void) {
    if (this._map) {
      this._map.on(event, handler)
    } else {
      console.log(`[MapboxAdapter] Queuing event: ${event}`)
      this.eventQueue.push({ event, handler })
    }
  }

  off(event: string, handler: (e?: unknown) => void) {
    if (this._map) {
      this._map.off(event, handler)
    } else {
      this.eventQueue = this.eventQueue.filter(q => !(q.event === event && q.handler === handler))
    }
  }

  resize() {
    this._map?.resize()
  }

  destroy() {
    console.log('[MapboxAdapter] Destroying map instance and clearing markers')
    this.markers.forEach(m => m.remove())
    this.markers.clear()
    this._map?.remove()
    this._map = null
    this.eventQueue = []
  }

  getZoom() {
    return this._map?.getZoom() ?? 0
  }

  getMarkersInfo() {
    const list: Array<{ id: string, lng: number, lat: number }> = []
    this.markers.forEach((m, id) => {
      const ll = m.getLngLat()
      list.push({ id, lng: ll.lng, lat: ll.lat })
    })
    return list
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
