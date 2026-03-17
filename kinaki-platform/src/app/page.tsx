import { Suspense } from 'react'
export const dynamic = 'force-dynamic'
import { HomeMapClient } from './HomeMapClient'
import { prisma } from '@/lib/db'

async function getPublishedProjects() {
  try {
    const projects = await prisma.project.findMany({
      where: { status: 'published' },
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
        pin: { select: { lat: true, lng: true } }
      },
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return (projects as any[]).map(p => ({
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
      lat: p.pin?.lat || 42.32,
      lng: p.pin?.lng || 43.35,
    }))
  } catch (error) {
    console.error('CRITICAL SSR FETCH ERROR:', error)
    return []
  }
}

export default async function HomePage() {
  const projects = await getPublishedProjects()

  return (
    <Suspense>
      <div className="fixed inset-0">
        <HomeMapClient projects={projects} />
      </div>
    </Suspense>
  )
}
