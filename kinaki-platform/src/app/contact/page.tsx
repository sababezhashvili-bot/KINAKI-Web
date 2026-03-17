import { prisma } from '@/lib/db'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ContactPageClient from './ContactPageClient'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with KINAKI studio.',
}

export default async function ContactPage() {
  let page: any = null
  try {
    page = await prisma.page.findUnique({ where: { key: 'contact' } })
  } catch (error) {
    console.error('ContactPage fetch error:', error)
  }

  if (!page) {
    return <ContactPageClient page={{ title: 'Contact', content: '{}' } as any} content={{}} />
  }

  let content: Record<string, any> = {}
  try { content = JSON.parse(page.content) } catch {}

  return <ContactPageClient page={page} content={content} />
}
