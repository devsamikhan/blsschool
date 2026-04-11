import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Current Users in DB:', JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

main();
