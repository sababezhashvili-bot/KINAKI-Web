import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const projectId = formData.get('projectId') as string
    
    if (!files.length) return new NextResponse('No files uploaded', { status: 400 })

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

    const savedMedia = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const path = join(uploadDir, fileName)
      await writeFile(path, buffer)

      const url = `/uploads/${fileName}`
      
      // Basic type detection
      let fileType = 'image'
      if (file.type.includes('video')) fileType = 'video'
      else if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) fileType = 'model'
      else if (file.type.includes('gif')) fileType = 'gif'

      const media = await prisma.media.create({
        data: {
          url,
          fileName: file.name,
          fileType,
          mimeType: file.type,
          size: file.size,
          projectId: projectId || null,
        }
      })
      savedMedia.push(media)
    }

    return NextResponse.json(savedMedia.length === 1 ? savedMedia[0] : savedMedia)
  } catch (error) {
    console.error('[ADMIN_MEDIA_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(media)
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return new NextResponse('ID missing', { status: 400 })

  try {
    const media = await prisma.media.findUnique({ where: { id } })
    if (!media) return new NextResponse('Not found', { status: 404 })

    // Delete file
    const filePath = join(process.cwd(), 'public', media.url)
    if (existsSync(filePath)) {
      await unlink(filePath)
    }

    await prisma.media.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ADMIN_MEDIA_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
