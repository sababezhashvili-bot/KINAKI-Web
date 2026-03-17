import { prisma } from '@/lib/db'
import { Search, Filter } from 'lucide-react'
import ProjectListClient from '@/components/admin/ProjectListClient'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { name: true } },
      pin: { select: { lat: true, lng: true } }
    }
  })

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-light text-stone-900">Projects</h1>
          <p className="text-stone-400 text-[10px] uppercase tracking-[0.2em] font-light">Manage your architectural portfolio</p>
        </div>
      </header>

      {/* Filters/Search Bar */}
      <div className="flex gap-4 items-center bg-white border border-stone-100 p-4">
        <div className="flex-1 flex items-center gap-3 px-4 border-r border-stone-100">
          <Search size={16} className="text-stone-300" />
          <input 
            placeholder="Search projects..." 
            className="w-full text-[13px] font-light outline-none"
          />
        </div>
        <div className="flex items-center gap-6 px-4">
          <div className="flex items-center gap-2 cursor-pointer">
            <Filter size={14} className="text-stone-400" />
            <span className="text-[11px] uppercase tracking-widest text-stone-600">Filter</span>
          </div>
          <p className="text-[11px] text-stone-300 uppercase tracking-widest">{projects.length} Total</p>
        </div>
      </div>

      {/* Project Table/Grid - Handled by Client Component */}
      <ProjectListClient projects={JSON.parse(JSON.stringify(projects))} />
    </div>
  )
}
