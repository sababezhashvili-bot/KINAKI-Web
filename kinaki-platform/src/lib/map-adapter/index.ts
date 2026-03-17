import { MapboxAdapter } from './mapbox-adapter'
import type { MapAdapter, MapProvider } from './types'

const adapters: Record<MapProvider, MapAdapter> = {
  mapbox: MapboxAdapter,
  maplibre: MapboxAdapter, // MapLibre is API-compatible; replace when needed
}

export function getMapAdapter(provider?: MapProvider): MapAdapter {
  const p = (provider ||
    process.env.NEXT_PUBLIC_MAP_PROVIDER ||
    'mapbox') as MapProvider
  return adapters[p] ?? adapters.mapbox
}

export * from './types'
