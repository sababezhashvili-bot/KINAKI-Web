'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  order: number
  _count?: { projects: number }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name: newName })
    })
    if (res.ok) {
      setNewName('')
      setIsAdding(false)
      fetchCategories()
    }
  }

  const handleUpdate = async (id: string) => {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: editName })
    })
    if (res.ok) {
      setEditingId(null)
      fetchCategories()
    }
  }

  const handleDelete = async (cat: Category) => {
    if (cat._count && cat._count.projects > 0) {
      alert('Cannot delete category with projects. Move or delete projects first.')
      return
    }
    if (!confirm(`Delete category "${cat.name}"?`)) return
    
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: 'DELETE'
    })
    if (res.ok) fetchCategories()
  }

  if (loading) return <div className="p-10 text-stone-400">Loading...</div>

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extralight text-stone-900 tracking-tight">Categories</h1>
          <p className="text-stone-400 text-[11px] uppercase tracking-[0.2em] font-light mt-1">Manage project types</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-stone-900 text-white px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all rounded-sm flex items-center gap-2"
        >
          <Plus size={14} /> Add Category
        </button>
      </header>

      {isAdding && (
        <div className="bg-white border border-stone-100 p-6 flex items-center gap-4">
          <input 
            autoFocus
            className="flex-1 bg-stone-50 border border-stone-100 p-2 text-[14px] font-light outline-none"
            placeholder="Category Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} className="bg-stone-900 text-white p-2 px-6 text-[11px] uppercase">Save</button>
          <button onClick={() => setIsAdding(false)} className="text-stone-400"><X size={18} /></button>
        </div>
      )}

      <div className="bg-white border border-stone-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-400">Name</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-400">Projects</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {categories.map((cat) => (
              <tr key={cat.id} className="group hover:bg-stone-50/50 transition-colors">
                <td className="px-8 py-5">
                  {editingId === cat.id ? (
                    <input 
                      autoFocus
                      className="border-b border-stone-900 outline-none font-light py-1"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => handleUpdate(cat.id)}
                      onKeyDown={e => e.key === 'Enter' && handleUpdate(cat.id)}
                    />
                  ) : (
                    <span className="text-stone-900 font-light">{cat.name}</span>
                  )}
                </td>
                <td className="px-8 py-5 text-stone-400 font-light text-[13px]">
                  {cat._count?.projects || 0}
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                      className="text-stone-400 hover:text-stone-900"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat)}
                      className="text-stone-200 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
