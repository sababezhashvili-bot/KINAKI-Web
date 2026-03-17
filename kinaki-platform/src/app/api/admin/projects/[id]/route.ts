import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'

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
  
  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...body,
        // Ensure numbers are numbers
        year: body.year ? parseInt(body.year.toString()) : undefined,
      }
    })
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
