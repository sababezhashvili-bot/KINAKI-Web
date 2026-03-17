import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/admin/projects - List all projects with draft status
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        city: true,
        updatedAt: true,
        category: { select: { name: true } },
        media: { select: { url: true } },
        pin: { select: { lat: true, lng: true } }
      }
    })
    return NextResponse.json(projects)
  } catch (error) {
    console.error('[ADMIN_PROJECTS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// POST /api/admin/projects - Create a new project
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await req.json()
    const { 
      title, 
      slug, 
      categoryId, 
      shortDesc, 
      fullDesc,
      country,
      city,
      coverImage,
      year,
      status // draft, published
    } = body

    if (!title || !slug || !categoryId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        categoryId,
        shortDesc,
        fullDesc,
        country,
        city,
        coverImage,
        year: parseInt(year),
        status: status || 'draft',
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('[ADMIN_PROJECTS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
