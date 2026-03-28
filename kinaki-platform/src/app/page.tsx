import { Suspense } from 'react'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { HomeMapClient } from './HomeMapClient'
import { getMapData } from '@/lib/map-data'

export default async function HomePage() {
  const mapData = await getMapData()

  return (
    <Suspense>
      <div className="fixed inset-0">
        <HomeMapClient projects={mapData as any} />
      </div>
    </Suspense>
  )
}
