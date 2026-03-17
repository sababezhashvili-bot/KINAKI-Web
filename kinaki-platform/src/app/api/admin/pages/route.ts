import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')

  if (!key) return new NextResponse('Missing key', { status: 400 })

  try {
    const page = await prisma.page.findUnique({ where: { key } })
    return NextResponse.json(page)
  } catch (error) {
    console.error('[ADMIN_PAGES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await req.json()
    const { key, title, content, metaTitle, metaDesc } = body

    if (!key) return new NextResponse('Missing key', { status: 400 })

    const page = await prisma.page.upsert({
      where: { key },
      update: { title, content, metaTitle, metaDesc },
      create: { key, title, content, metaTitle, metaDesc }
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('[ADMIN_PAGES_PATCH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
