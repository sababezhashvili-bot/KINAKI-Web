import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

import { 
  LayoutDashboard, 
  Folder, 
  Tag, 
  FileText, 
  Image as ImageIcon, 
  Map as MapIcon, 
  Search, 
  User, 
  Menu,
  Plus
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/admin/projects', icon: Folder },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Pages', href: '/admin/pages', icon: FileText },
  { label: 'Media', href: '/admin/media', icon: ImageIcon },
  { label: 'Map Settings', href: '/admin/map-settings', icon: MapIcon },
  { label: 'SEO', href: '/admin/seo', icon: Search },
  { label: 'Site Identity', href: '/admin/identity', icon: User },
  { label: 'Navigation', href: '/admin/navigation', icon: Menu },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  return (
    <div className="flex min-h-screen bg-stone-50" style={{ '--navbar-height': '36px' } as any}>
      {/* Sidebar - Shifted down by navbar height */}
      <aside className="w-64 shrink-0 bg-white border-r border-stone-100 flex flex-col sticky top-[var(--navbar-height)] h-[calc(100vh-var(--navbar-height))] z-20">
        <div className="pt-8" />

        <nav className="flex-1 px-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-4 py-3 text-[12px] tracking-wide text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all group rounded-sm"
            >
              <item.icon size={16} className="text-stone-300 group-hover:text-stone-900 transition-colors" />
              <span className="font-light">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-8 border-t border-stone-50">
          <p className="text-[10px] text-stone-300 uppercase tracking-widest font-light">KINAKI v1.0</p>
        </div>
      </aside>

      {/* Permanent Add Project Button - Fixed for visibility */}
      <div className="fixed bottom-12 right-12 z-[100]">
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-3 bg-stone-900 text-white px-8 py-4 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-stone-800 transition-all rounded-full shadow-2xl border border-white/20"
        >
          <Plus size={16} />
          Add Project
        </Link>
      </div>

      {/* Main content - Start after navbar height with extra breathing room */}
      <main 
        className="flex-1 min-w-0"
        style={{ paddingTop: 'calc(var(--navbar-height) + 6rem)' }}
      >
        <div className="px-10 pb-24 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
