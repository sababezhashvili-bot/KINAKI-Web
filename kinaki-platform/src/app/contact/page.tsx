import { prisma } from '@/lib/db'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ContactPageClient from './ContactPageClient'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with KINAKI studio.',
}

export default async function ContactPage() {
  const page = await prisma.page.findUnique({ where: { key: 'contact' } })
  if (!page) notFound()

  let content: Record<string, any> = {}
  try { content = JSON.parse(page.content) } catch {}

  return <ContactPageClient page={page} content={content} />
}
