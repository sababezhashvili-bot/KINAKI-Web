import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const settings = await prisma.globalSettings.findFirst() || await prisma.globalSettings.create({ data: {} })
    return NextResponse.json(settings)
  } catch (error) {
    console.error('[ADMIN_SETTINGS_GET]', error)
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
    const settings = await prisma.globalSettings.upsert({
      where: { id: 'settings' },
      update: body,
      create: { id: 'settings', ...body }
    })
    return NextResponse.json(settings)
  } catch (error) {
    console.error('[ADMIN_SETTINGS_PATCH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
