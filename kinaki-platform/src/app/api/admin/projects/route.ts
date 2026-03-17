import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

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

    const lat = body.lat !== undefined && body.lat !== null ? parseFloat(body.lat.toString()) : null
    const lng = body.lng !== undefined && body.lng !== null ? parseFloat(body.lng.toString()) : null

    if (lat !== null && isNaN(lat)) return new NextResponse('Latitude must be a valid number', { status: 400 })
    if (lng !== null && isNaN(lng)) return new NextResponse('Longitude must be a valid number', { status: 400 })

    console.log('[ADMIN_PROJECTS_POST] Form data:', { title, slug, lat, lng, status })

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
        latitude: lat,
        longitude: lng,
        // Keep Pin for backward compatibility/independent pins if needed
        pin: lat !== null && lng !== null ? {
          create: {
            lat,
            lng,
            visible: true
          }
        } : undefined
      }
    })

    console.log('[ADMIN_PROJECTS_POST] Saved project:', project)

    revalidatePath('/')
    revalidatePath('/admin/dashboard')

    return NextResponse.json(project)
  } catch (error) {
    console.error('[ADMIN_PROJECTS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
