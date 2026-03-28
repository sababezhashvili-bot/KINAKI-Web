import { prisma } from './db'

export async function getMapData() {
  try {
    // 1. Fetch projects
    const projects = await prisma.project.findMany({
      where: { 
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
      return (p.latitude !== null && p.longitude !== null) || p.pin !== null
    }).map((p: any) => {
      const lat = p.latitude ?? p.pin?.lat ?? 41.7151
      const lng = p.longitude ?? p.pin?.lng ?? 44.8271

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
      lat: Number(pin.lat),
      lng: Number(pin.lng),
      type: 'pin' as const,
      hasPin: true
    }))

    return [...transformedProjects, ...transformedPins]
  } catch (error) {
    console.error('[getMapData] Error:', error)
    return []
  }
}
