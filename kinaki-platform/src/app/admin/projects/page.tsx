import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react'

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
    <div className="p-8 max-w-7xl mx-auto space-y-10">
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

      {/* Project Table/Grid */}
      <div className="bg-white border border-stone-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Project</th>
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Category</th>
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Location</th>
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Status</th>
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Map Pin</th>
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-stone-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <p className="text-[14px] text-stone-900 font-light">{project.title}</p>
                    <p className="text-[10px] text-stone-300 font-mono tracking-tight">{project.slug}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[11px] uppercase tracking-[0.1em] text-stone-500">{project.category.name}</span>
                </td>
                <td className="px-8 py-6">
                  <p className="text-[13px] text-stone-500 font-light">{project.city}, {project.country}</p>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 text-[9px] uppercase tracking-[0.2em] rounded-full border ${
                    project.status === 'published' 
                      ? 'border-green-100 text-green-600 bg-green-50' 
                      : 'border-amber-100 text-amber-600 bg-amber-50'
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  {project.pin ? (
                    <div className="flex items-center gap-2 text-stone-900">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-[11px] font-mono">{project.pin.lat.toFixed(4)}, {project.pin.lng.toFixed(4)}</span>
                    </div>
                  ) : (
                    <span className="text-stone-300 text-[11px] italic">No Pin</span>
                  )}
                </td>
                <td className="px-8 py-6">
                  <Link 
                    href={`/admin/projects/${project.id}`}
                    className="text-stone-300 hover:text-stone-900 transition-colors"
                  >
                    <MoreHorizontal size={20} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
