import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      categoryId: true,
      shortDesc: true,
      fullDesc: true,
      country: true,
      city: true,
      year: true,
      client: true,
      area: true,
      status: true,
      featured: true,
      sortOrder: true,
      coverImage: true,
      metaTitle: true,
      metaDescription: true,
      ogImage: true,
      updatedAt: true,
      category: { select: { id: true, name: true, slug: true } },
      media: { select: { id: true, url: true, fileType: true, sortOrder: true } },
      pin: { select: { id: true, lat: true, lng: true } }
    }
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  
  const lat = body.lat !== undefined && body.lat !== null ? parseFloat(body.lat.toString()) : null
  const lng = body.lng !== undefined && body.lng !== null ? parseFloat(body.lng.toString()) : null

  if (lat !== null && isNaN(lat)) return NextResponse.json({ error: "Latitude must be a valid number" }, { status: 400 })
  if (lng !== null && isNaN(lng)) return NextResponse.json({ error: "Longitude must be a valid number" }, { status: 400 })

  console.log(`[ADMIN_PROJECTS_PATCH] Editing project ${id}. Data:`, { lat, lng, status: body.status })

  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        categoryId: body.categoryId,
        shortDesc: body.shortDesc,
        fullDesc: body.fullDesc,
        country: body.country,
        city: body.city,
        coverImage: body.coverImage,
        year: body.year ? parseInt(body.year.toString()) : undefined,
        status: body.status,
        featured: body.featured,
        latitude: lat,
        longitude: lng,
        // Sync Pin location
        pin: lat !== null && lng !== null ? {
          upsert: {
            create: {
              lat,
              lng,
              visible: true
            },
            update: {
              lat,
              lng,
            }
          }
        } : undefined
      }
    })
    console.log('[ADMIN_PROJECTS_PATCH] Saved project:', project)
    revalidatePath('/')
    revalidatePath('/admin/dashboard')
    return NextResponse.json(project)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
