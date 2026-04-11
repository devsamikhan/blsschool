import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database for production...');
  await prisma.feeRecord.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.homework.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.teacherClass.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.admissionApplication.deleteMany();
  await prisma.contactInquiry.deleteMany();
  await prisma.newsItem.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.user.deleteMany();
  await prisma.class.deleteMany();

  console.log('Creating permanent Admin account...');
  const hashedPassword = await bcrypt.hash('ADMIN', 10);
  
  await prisma.user.create({
    data: { 
      name: 'BLS School Admin', 
      role: 'admin', 
      schoolId: 'ADMIN', 
      password: hashedPassword, 
      email: 'admin@bls.edu', 
      status: 'active', 
      profilePic: 'https://ui-avatars.com/api/?name=Admin' 
    }
  });

  console.log('Database successfully wiped and prepared for production.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
