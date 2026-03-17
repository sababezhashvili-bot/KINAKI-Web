const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    console.log('--- Checking Project Table ---');
    const project = await prisma.project.findFirst();
    console.log('Project keys:', Object.keys(project || {}));
    
    console.log('--- Checking Pin Table ---');
    const pin = await prisma.pin.findFirst();
    console.log('Pin keys:', Object.keys(pin || {}));
    
    const count = await prisma.project.count();
    console.log('Total projects:', count);
  } catch (e) {
    console.error('Error during check:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
