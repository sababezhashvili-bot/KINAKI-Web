import { prisma } from '@/lib/db'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AboutPageClient from './AboutPageClient'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about KINAKI architectural studio — our philosophy, approach, and mission.',
}

export default async function AboutPage() {
  const page = await prisma.page.findUnique({ where: { key: 'about' } })
  if (!page) notFound()

  let content: Record<string, string> = {}
  try { content = JSON.parse(page.content) } catch {}

  return <AboutPageClient page={page} content={content} />
}
