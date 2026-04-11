import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing users for a fresh production seed...');
  await prisma.user.deleteMany({});

  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('welcome123', 10);

  console.log('Seeding administrative users...');
  
  await prisma.user.createMany({
    data: [
      {
        id: 'admin-1',
        name: 'Muhammad Ali',
        role: 'admin',
        schoolId: 'ADMIN-001',
        password: adminPassword,
        email: 'admin@bls.edu',
        phone: '03001234567',
        address: 'Lahore Head Office',
        status: 'active',
        createdAt: new Date('2025-01-01'),
      },
      {
        id: 'principal-1',
        name: 'Prof. Ahmad Hassan',
        role: 'principal',
        schoolId: 'PRIN-H4K8J1',
        password: staffPassword,
        email: 'principal@isakhel.edu',
        phone: '0312-9988771',
        address: 'Main Campus Residence',
        status: 'active',
        createdAt: new Date('2026-03-17'),
      },
      {
        id: 'accountant-1',
        name: 'Saeed Khan',
        role: 'accountant',
        schoolId: 'ACC-L9P2M4',
        password: staffPassword,
        email: 'finance@isakhel.edu',
        phone: '0321-4433221',
        address: 'Isakhel Town',
        status: 'active',
        createdAt: new Date('2026-03-18'),
      }
    ]
  });

  console.log('Production users seeded successfully!');
  await prisma.$disconnect();
}

main();
