import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { bucket } from '@/lib/firebaseAdmin'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const projectId = formData.get('projectId') as string
    
    if (!files.length) return new NextResponse('No files uploaded', { status: 400 })

    const savedMedia = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const fileExtension = file.name.split('.').pop()
      const fileName = `uploads/${randomUUID()}.${fileExtension}`
      const firebaseFile = bucket.file(fileName)

      await firebaseFile.save(buffer, {
        metadata: { contentType: file.type },
        public: true
      })

      // Get public URL
      const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`
      
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
  } catch (error: any) {
    console.error('[ADMIN_MEDIA_POST] UNCAUGHT_ERROR:', error)
    return new NextResponse(`Internal Error: ${error.message || 'Unknown'}`, { status: 500 })
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

    // Extract filename from URL to delete from Firebase
    // URL pattern: https://storage.googleapis.com/[bucket-name]/uploads/[uuid].[ext]
    const urlParts = media.url.split('/')
    const fileName = `uploads/${urlParts[urlParts.length - 1]}`
    
    try {
      await bucket.file(fileName).delete()
    } catch (e) {
      console.warn('File deletion from Firebase failed or file does not exist:', fileName)
    }

    await prisma.media.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ADMIN_MEDIA_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
