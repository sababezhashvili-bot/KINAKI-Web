import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  let projects: any[] = []
  let categories: any[] = []

  try {
    projects = await prisma.project.findMany({
      where: { status: 'published' },
      select: {
        slug: true,
        category: { select: { slug: true } },
        updatedAt: true,
      },
    })

    categories = await prisma.category.findMany({
      select: { slug: true },
    })
  } catch (error) {
    console.error('Sitemap generation: Could not fetch data from database', error)
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  const categoryPages: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${baseUrl}/projects/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const projectPages: MetadataRoute.Sitemap = projects.map((p: any) => ({
    url: `${baseUrl}/projects/${p.category.slug}/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages, ...projectPages]

  return [...staticPages, ...categoryPages, ...projectPages]
}
