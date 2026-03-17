import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import slugify from 'slugify'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { projects: true } } }
    })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    if (!body.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const slug = body.slug || slugify(body.name, { lower: true, strict: true })

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug,
        order: body.order || 0
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('[CATEGORIES_POST]', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
