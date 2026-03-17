import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding KINAKI database…')

  // Seed categories
  const categories = [
    { name: 'Architecture', slug: 'architecture', order: 1 },
    { name: 'Interior Design', slug: 'interior-design', order: 2 },
    { name: 'Furniture Design', slug: 'furniture-design', order: 3 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    console.log(`  ✓ Category: ${cat.name}`)
  }

  // Seed admin user
  const email = process.env.ADMIN_SEED_EMAIL || 'admin@kinaki.ge'
  const password = process.env.ADMIN_SEED_PASSWORD || 'Admin123!'
  const hashed = await bcrypt.hash(password, 12)

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password: hashed, role: 'admin' },
  })
  console.log(`  ✓ Admin user: ${email}`)

  // Seed global settings
  await prisma.globalSettings.upsert({
    where: { id: 'settings' },
    update: {},
    create: {
      id: 'settings',
      siteName: 'KINAKI',
      mapLat: 42.32,
      mapLng: 43.35,
      mapZoom: 5.8,
      email: 'hello@kinaki.ge',
      phone: '+995 555 000 000',
      address: 'Tbilisi, Georgia',
      socialLinks: JSON.stringify({ instagram: '', facebook: '', linkedin: '' }),
      defaultLocale: 'en',
    },
  })
  console.log('  ✓ Global settings')

  // Seed About page
  await prisma.page.upsert({
    where: { key: 'about' },
    update: {},
    create: {
      key: 'about',
      title: 'About KINAKI',
      content: JSON.stringify({
        intro: 'KINAKI is a multidisciplinary architectural studio.',
        philosophy: 'We believe in architecture that endures.',
        description: 'Founded in Georgia, KINAKI brings together expertise in architecture, interior design, and furniture design.',
        mission: 'To create spaces that inspire and stand the test of time.',
      }),
    },
  })
  console.log('  ✓ About page')

  // Seed Contact page
  await prisma.page.upsert({
    where: { key: 'contact' },
    update: {},
    create: {
      key: 'contact',
      title: 'Contact',
      content: JSON.stringify({
        email: 'hello@kinaki.ge',
        phone: '+995 555 000 000',
        address: 'Tbilisi, Georgia',
        businessHours: 'Mon–Fri, 10:00–18:00',
        formRecipient: 'hello@kinaki.ge',
        social: { instagram: '', facebook: '', linkedin: '' },
      }),
    },
  })
  console.log('  ✓ Contact page')

  console.log('✅ Seed complete!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
