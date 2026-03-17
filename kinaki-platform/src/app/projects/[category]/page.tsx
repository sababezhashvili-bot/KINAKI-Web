import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'

interface Props {
  params: Promise<{ category: string }>
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({ where: { slug } })
}

async function getCategoryProjects(categoryId: string) {
  return prisma.project.findMany({
    where: { categoryId, status: 'published' },
    orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      shortDesc: true,
      city: true,
      country: true,
      year: true,
    }
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params
  const category = await getCategory(slug)
  if (!category) return {}
  return {
    title: category.name,
    description: `Explore our ${category.name} projects at KINAKI Studio.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params
  const category = await getCategory(slug)
  if (!category) notFound()

  const projects = await getCategoryProjects(category.id)

  return (
    <div 
      className="min-h-screen pb-20 px-6 md:px-16"
      style={{ paddingTop: '160px' }}
    >
      {/* Header */}
      <div className="mb-16 max-w-xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-3">
          Projects
        </p>
        <h1 className="text-4xl md:text-5xl font-light text-stone-900 mb-4">
          {category.name}
        </h1>
        <div className="w-10 h-px bg-stone-300" />
      </div>

      {/* Grid */}
      {projects.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-[12px] uppercase tracking-[0.2em] text-stone-400">
            No projects yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              categorySlug={slug}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({
  project,
  categorySlug,
}: {
  project: { slug: string; title: string; coverImage: string; shortDesc: string; city: string; country: string; year: number }
  categorySlug: string
}) {
  return (
    <Link
      href={`/projects/${categorySlug}/${project.slug}`}
      className="group block"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 mb-5">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 skeleton" />
        )}
        {/* Year overlay */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-white/90 backdrop-blur-sm text-[10px] tracking-widest uppercase text-stone-600 px-2.5 py-1">
            {project.year}
          </span>
        </div>
      </div>

      {/* Text */}
      <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1">
        {project.city}, {project.country}
      </p>
      <h2 className="text-[15px] font-light text-stone-900 group-hover:text-stone-600 transition-colors">
        {project.title}
      </h2>
    </Link>
  )
}
