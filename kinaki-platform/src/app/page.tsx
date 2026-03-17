import { Suspense } from 'react'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { HomeMapClient } from './HomeMapClient'
import { prisma } from '@/lib/db'

async function getMapData() {
  try {
    // 1. Fetch published projects
    const projects = await prisma.project.findMany({
      where: { 
        // TEMPORARY: Show drafts too for debugging sync
        OR: [
          { status: 'published' },
          { status: 'draft' }
        ]
      },
      select: {
        id: true,
        slug: true,
        title: true,
        shortDesc: true,
        coverImage: true,
        city: true,
        country: true,
        year: true,
        categoryId: true,
        category: { select: { name: true, slug: true } },
        latitude: true,
        longitude: true,
        pin: { select: { lat: true, lng: true } }
      },
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    console.log('[getMapData] DB projects found:', projects.length)

    // 2. Fetch independent pins (not attached to projects)
    const extraPins = await prisma.pin.findMany({
      where: { projectId: null, visible: true },
      select: {
        id: true,
        title: true,
        lat: true,
        lng: true,
        styleType: true
      }
    })

    const transformedProjects = projects.filter(p => {
      // Must have either direct coords or a pin
      return (p.latitude !== null && p.longitude !== null) || p.pin !== null
    }).map((p: any) => {
      const lat = p.latitude ?? p.pin?.lat ?? 42.32
      const lng = p.longitude ?? p.pin?.lng ?? 43.35

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category?.name || 'Uncategorized',
        categorySlug: p.category?.slug || '',
        shortDesc: p.shortDesc || '',
        coverImage: p.coverImage || '',
        city: p.city || '',
        country: p.country || '',
        year: p.year || 2024,
        lat: Number(lat),
        lng: Number(lng),
        type: 'project' as const,
        hasPin: true
      }
    })

    const transformedPins = extraPins.map(pin => ({
      id: pin.id,
      slug: `pin-${pin.id}`,
      title: pin.title || 'Pinned Location',
      category: 'Location',
      categorySlug: pin.styleType || 'dot',
      shortDesc: '',
      coverImage: '',
      city: '',
      country: '',
      year: 2024,
      lat: pin.lat,
      lng: pin.lng,
      type: 'pin' as const,
      hasPin: true
    }))

    const finalData = [...transformedProjects, ...transformedPins]
    console.log('[getMapData] Final transformed markers:', finalData.length)
    return finalData
  } catch (error) {
    console.error('CRITICAL SSR FETCH ERROR:', error)
    return []
  }
}

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
