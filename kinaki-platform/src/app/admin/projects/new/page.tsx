import { prisma } from '@/lib/db'
import ProjectForm from '@/components/admin/ProjectForm'
import { getMapData } from '@/lib/map-data'

export default async function NewProjectPage() {
  const [categories, allProjects] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' }
    }),
    getMapData()
  ])

  return (
    <div className="p-10">
      <div className="mb-12">
        <h1 className="text-3xl font-light text-stone-900 mb-2">Create New Project</h1>
        <p className="text-stone-400 text-[13px] font-light">Add a new architectural masterpiece to the KINAKI portfolio.</p>
      </div>
      
      <ProjectForm categories={categories} allProjects={allProjects as any} />
    </div>
  )
}
