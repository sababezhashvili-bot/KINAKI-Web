import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Plus, Folder, MapPin, Image as ImageIcon, Settings, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboard() {
  const [projectCount, pinCount, mediaCount, recentProjects] = await Promise.all([
    prisma.project.count(),
    prisma.pin.count(),
    prisma.media.count(),
    prisma.project.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        city: true,
        updatedAt: true,
        category: { select: { name: true } }
      }
    })
  ])

  const stats = [
    { label: 'Projects', value: projectCount, icon: Folder },
    { label: 'Map Pins', value: pinCount, icon: MapPin },
    { label: 'Media Assets', value: mediaCount, icon: ImageIcon },
  ]

  return (
    <div className="p-12 max-w-7xl mx-auto space-y-16">
      <header className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-5xl font-extralight text-stone-900 tracking-tight">Studio Overview</h1>
            <p className="text-stone-400 text-[12px] uppercase tracking-[0.3em] font-light">KINAKI Architectural Visibility Platform</p>
          </div>
        </div>
      </header>


      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-stone-100 p-10 flex flex-col gap-6 group hover:border-stone-900/10 transition-all duration-500">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-stone-50 rounded-sm group-hover:bg-stone-900 group-hover:text-white transition-colors duration-500">
                <stat.icon size={20} className="text-stone-400 group-hover:text-white" />
              </div>
              <span className="text-4xl font-extralight text-stone-900">{stat.value}</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-16">
        {/* Recent Projects */}
        <section className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between border-b border-stone-100 pb-5">
            <h2 className="text-[12px] uppercase tracking-[0.4em] font-light text-stone-900">Recent Projects</h2>
            <Link href="/admin/projects" className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors">View All</Link>
          </div>
          
          <div className="space-y-4">
            {recentProjects.map((project: any) => (
              <Link 
                key={project.id} 
                href={`/admin/projects/${project.id}`}
                className="group flex items-center justify-between p-6 bg-white border border-stone-100 hover:border-stone-900/20 transition-all duration-300"
              >
                <div className="space-y-1">
                  <p className="text-[16px] text-stone-900 font-light group-hover:translate-x-1 transition-transform">{project.title}</p>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest">{project.category?.name} &bull; {project.city}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] uppercase tracking-widest text-stone-300">Updated</p>
                    <p className="text-[11px] text-stone-500 font-light">{new Date(project.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${project.status === 'published' ? 'bg-green-400' : 'bg-amber-400'}`} title={project.status} />
                </div>
              </Link>
            ))}
            
            {recentProjects.length === 0 && (
              <div className="py-20 text-center border border-dashed border-stone-200 rounded-sm">
                <Folder className="mx-auto text-stone-100 mb-4" size={40} />
                <p className="text-stone-300 text-[11px] uppercase tracking-[0.2em]">Your portfolio is currently empty</p>
                <Link href="/admin/projects/new" className="text-stone-900 text-[10px] uppercase tracking-widest mt-4 inline-block border-b border-stone-900">Add First Project</Link>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-8">
          <div className="border-b border-stone-100 pb-5">
            <h2 className="text-[12px] uppercase tracking-[0.4em] font-light text-stone-900">Quick Access</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: 'Site Settings', icon: Settings, href: '/admin/settings' },
              { label: 'Media Library', icon: ImageIcon, href: '/admin/media' },
              { label: 'About Page', icon: FileText, href: '/about' },
              { label: 'Contact Page', icon: FileText, href: '/contact' },
            ].map((action) => (
              <Link 
                key={action.label}
                href={action.href}
                className="p-5 bg-white border border-stone-100 hover:bg-stone-900 hover:text-white transition-all group flex items-center gap-5"
              >
                <action.icon size={18} className="text-stone-400 group-hover:text-white transition-colors" />
                <span className="text-[11px] uppercase tracking-[0.2em] font-light">{action.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
