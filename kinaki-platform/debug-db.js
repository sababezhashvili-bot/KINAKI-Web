const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const projects = await prisma.project.count()
  const users = await prisma.user.count()
  const categories = await prisma.category.count()
  const pins = await prisma.pin.count()
  const media = await prisma.media.count()
  const pages = await prisma.page.count()

  console.log(JSON.stringify({
    projects,
    users,
    categories,
    pins,
    media,
    pages
  }, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
