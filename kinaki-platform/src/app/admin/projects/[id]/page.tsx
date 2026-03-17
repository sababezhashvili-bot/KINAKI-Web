import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import ProjectForm from '@/components/admin/ProjectForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params
  
  const [project, categories] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
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
        featured: true,
        sortOrder: true,
        coverImage: true,
        metaTitle: true,
        metaDescription: true,
        ogImage: true,
        category: { select: { id: true, name: true } },
        media: { select: { id: true, url: true, fileType: true, sortOrder: true } },
        pin: { select: { id: true, lat: true, lng: true } }
      }
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
  ])

  if (!project) notFound()

  return (
    <div className="p-10">
      <div className="mb-12">
        <h1 className="text-3xl font-light text-stone-900 mb-2">Edit Project</h1>
        <p className="text-stone-400 text-[13px] font-light">Updating: <span className="text-stone-900">{project.title}</span></p>
      </div>
      
      <ProjectForm initialData={project} categories={categories} />
    </div>
  )
}
