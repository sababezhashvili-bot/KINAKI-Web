export interface LayerConfig {
  id: string
  label: string
  mapboxLayers: string[]
  defaultActive: boolean
  group: 'Labels' | 'Projects' | 'Options'
}

export const LAYER_REGISTRY: LayerConfig[] = [
  // Labels
  {
    id: 'countryLabels',
    label: 'Country Names',
    mapboxLayers: ['country-label'],
    defaultActive: true,
    group: 'Labels',
  },
  {
    id: 'cityLabels',
    label: 'City Names',
    mapboxLayers: ['settlement-major-label', 'settlement-minor-label', 'settlement-subdivision-label'],
    defaultActive: true,
    group: 'Labels',
  },
  {
    id: 'regionLabels',
    label: 'Region Names',
    mapboxLayers: ['state-label'],
    defaultActive: true,
    group: 'Labels',
  },
  // Projects (These are handled by Marker state, but included for reference or future layer-based projects)
  {
    id: 'archProjects',
    label: 'Architecture',
    mapboxLayers: [], // Managed via Markers
    defaultActive: true,
    group: 'Projects',
  },
  {
    id: 'intProjects',
    label: 'Interior',
    mapboxLayers: [], // Managed via Markers
    defaultActive: true,
    group: 'Projects',
  },
  {
    id: 'furnProjects',
    label: 'Furniture',
    mapboxLayers: [], // Managed via Markers
    defaultActive: true,
    group: 'Projects',
  },
  // Options
  {
    id: 'borders',
    label: 'Borders',
    mapboxLayers: ['admin-0-boundary', 'admin-1-boundary', 'admin-0-boundary-bg'],
    defaultActive: true,
    group: 'Options',
  },
  {
    id: 'waters',
    label: 'Waters',
    mapboxLayers: ['water', 'waterway'],
    defaultActive: false,
    group: 'Options',
  },
  {
    id: 'terrain',
    label: '3D Terrain',
    mapboxLayers: [], // Managed via setTerrain
    defaultActive: false,
    group: 'Options',
  },
  {
    id: 'buildings3d',
    label: '3D Buildings',
    mapboxLayers: ['3d-buildings'],
    defaultActive: false,
    group: 'Options',
  },
]
