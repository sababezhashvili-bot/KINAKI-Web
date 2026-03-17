import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { parseJsonArray } from '@/lib/utils'
import { EditControl } from '@/components/admin/EditControl'
import { redirect } from 'next/navigation' // Use redirect or Link. Actually, for a button, router.push is better. Wait, this is a Server Component.

interface Props {
  params: Promise<{ category: string; slug: string }>
}

async function getProject(slug: string) {
  try {
    return await prisma.project.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        categoryId: true,
        shortDesc: true,
        fullDesc: true,
        country: true,
        city: true,
        year: true,
        client: true,
        area: true,
        status: true,
        coverImage: true,
        metaTitle: true,
        metaDescription: true,
        ogImage: true,
        updatedAt: true,
        category: { select: { name: true, slug: true } },
        media: { 
          select: { url: true, fileType: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
    })
  } catch (error) {
    console.error('getProject error:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  let project: any = null
  try {
    project = await getProject(slug)
  } catch (error) {
    console.error('generateMetadata error:', error)
  }
  
  if (!project) return { title: 'Project' }
  return {
    title: project.metaTitle || project.title,
    description: project.metaDescription || project.shortDesc,
    openGraph: {
      title: project.metaTitle || project.title,
      description: project.metaDescription || project.shortDesc,
      images: project.ogImage ? [project.ogImage] : project.coverImage ? [project.coverImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.metaTitle || project.title,
    },
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug, category: categorySlug } = await params
  let project: any = null
  try {
    project = await getProject(slug)
  } catch (error) {
    console.error('ProjectDetailPage fetch error:', error)
  }

  if (!project || project.status !== 'published') notFound() // Fixed status check
  if (project.category?.slug !== categorySlug) notFound()

  // In the new schema, we have a media table. 
  // Let's fallback to project.gallery (from old schema) if media is empty, for migration safety.
  const gallery = project.media?.length > 0 
    ? project.media.map((m: any) => m.url) 
    : parseJsonArray(project.gallery || '[]')
    
  const services = parseJsonArray(project.services || '[]')

  return (
    <article className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[70vh] bg-stone-100 group">
        {project.coverImage && (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
        <div className="absolute bottom-12 left-8 md:left-16 text-white w-full pr-32">
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-70 mb-2">
            <Link href={`/projects/${project.category?.slug}`} className="hover:opacity-100 transition-opacity">
              {project.category?.name || 'Category'}
            </Link>
          </p>
          <EditControl 
            type="edit" 
            label="Edit Hero & Title" 
            href={`/admin/projects/${project.id}`}
          >
            <h1 className="text-4xl md:text-6xl font-light">{project.title}</h1>
          </EditControl>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-16">
          {/* Description */}
          <div className="md:col-span-2">
            <EditControl 
              type="edit" 
              label="Edit Description" 
              href={`/admin/projects/${project.id}`}
            >
              <p className="text-lg font-light text-stone-700 leading-relaxed mb-8">
                {project.shortDesc}
              </p>
              <div className="prose prose-stone font-light text-stone-600 leading-relaxed whitespace-pre-line">
                {project.fullDesc}
              </div>
            </EditControl>
          </div>

          {/* Meta sidebar */}
          <div className="space-y-7 border-l border-stone-100 pl-10">
            <EditControl 
              type="edit" 
              label="Edit Metadata" 
              href={`/admin/projects/${project.id}`}
            >
              <div className="space-y-7">
                {[
                  { label: 'Year', value: project.year?.toString() },
                  { label: 'Location', value: `${project.city}, ${project.country}` },
                  project.client && { label: 'Client', value: project.client },
                  project.area && { label: 'Area', value: project.area },
                  services.length > 0 && { label: 'Services', value: services.join('\n') },
                ]
                  .filter(Boolean)
                  .map((item: any) => (
                    <div key={item.label}>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1">
                        {item.label}
                      </p>
                      <p className="text-[13px] text-stone-700 whitespace-pre-line leading-relaxed">
                        {item.value}
                      </p>
                    </div>
                  ))}
              </div>
            </EditControl>
          </div>
        </div>

        {/* Gallery */}
        {gallery.length > 0 && (
          <div className="mt-20">
            <EditControl 
              type="edit" 
              label="Manage Gallery" 
              href={`/admin/projects/${project.id}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gallery.map((src: string, i: number) => (
                  <div
                    key={`${project.id}-img-${i}`}
                    className={`relative overflow-hidden bg-stone-100 ${
                      i === 0 ? 'md:col-span-2 aspect-video' : 'aspect-[4/3]'
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${project.title} — image ${i + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>
            </EditControl>
          </div>
        )}
      </div>
    </article>
  )
}
