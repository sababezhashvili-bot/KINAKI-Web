import { prisma } from '@/lib/db'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AboutPageClient from './AboutPageClient'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about KINAKI architectural studio — our philosophy, approach, and mission.',
}

export default async function AboutPage() {
  let page: any = null
  try {
    page = await prisma.page.findUnique({ where: { key: 'about' } })
  } catch (error) {
    console.error('AboutPage fetch error:', error)
  }

  if (!page) {
    // Return a basic fallback if database is not available during build
    return <AboutPageClient page={{ title: 'About Us', content: '{}' } as any} content={{}} />
  }

  let content: Record<string, string> = {}
  try { content = JSON.parse(page.content) } catch {}

  return <AboutPageClient page={page} content={content} />
}
