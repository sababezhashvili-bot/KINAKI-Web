/**
 * KINAKI Map Adapter — Provider-Agnostic Interface
 *
 * All map interactions go through this interface.
 * Switch providers by changing the implementation, not the callers.
 */

export interface LngLat {
  lng: number
  lat: number
}

export interface MapOptions {
  center: LngLat
  zoom: number
  style?: string
  container: string | HTMLElement
}

export interface MarkerOptions {
  color?: string
  size?: number
  label?: string
  className?: string
  onClick?: () => void
  draggable?: boolean
  onDragEnd?: (coords: LngLat) => void
}

export interface MapAdapter {
  init(options: MapOptions): void
  setStyle(styleUrl: string): void
  flyTo(coords: LngLat, zoom?: number, options?: object): void
  easeTo(coords: LngLat, zoom?: number, options?: object): void
  addMarker(id: string, coords: LngLat, options?: MarkerOptions): void
  removeMarker(id: string): void
  setLayerVisibility(layerId: string, visible: boolean): void
  setPaintProperty(layerId: string, name: string, value: unknown): void
  setFilter(layerId: string, filter: unknown[]): void
  setTerrain(enabled: boolean): void
  setPitch(pitch: number): void
  setWaterHighlight(enabled: boolean): void
  on(event: string, handler: (e?: unknown) => void): void
  off(event: string, handler: (e?: unknown) => void): void
  resize(): void
  destroy(): void
  getZoom(): number
  getCenter(): LngLat
  isStyleLoaded(): boolean
  isReady(): boolean
  getMarkersInfo(): Array<{ id: string, lng: number, lat: number }>
}

export type MapProvider = 'mapbox' | 'maplibre'
