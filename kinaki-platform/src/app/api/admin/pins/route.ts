import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const pins = await prisma.pin.findMany({
      include: { project: true }
    })
    return NextResponse.json(pins)
  } catch (error) {
    console.error('[ADMIN_PINS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await req.json()
    const { lat, lng, title, projectId, styleType, visible } = body

    if (!lat || !lng) {
      return new NextResponse('Missing required coordinates', { status: 400 })
    }

    const pin = await prisma.pin.upsert({
      where: { projectId: projectId || 'non-existent' }, // Allow one pin per project
      update: { lat, lng, title, styleType, visible },
      create: { lat, lng, title, projectId, styleType, visible: visible ?? true }
    })

    return NextResponse.json(pin)
  } catch (error) {
    console.error('[ADMIN_PINS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
