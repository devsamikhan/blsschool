import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    const pwd = await bcrypt.hash('welcome123', 10);
    const data = {
      name: 'Test Student',
      role: 'student',
      schoolId: 'STU-9999',
      password: pwd,
      createdAt: new Date().toISOString(),
      status: 'active',
      email: '',
      phone: '',
      address: '',
      profilePic: '',
      subjects: '[]',
      studentId: '',
      classId: ''
    };
    
    console.log("Attempting native insert...");
    const result = await prisma.user.create({ data });
    console.log("Success:", result.id);
  } catch (e) {
    console.error("Prisma Crash Detail:", e);
  }
}

main().finally(async () => {
    // Cleanup
    try { await prisma.user.deleteMany({ where: { schoolId: 'STU-9999' } }); } catch { /* ignore */ }
    await prisma.$disconnect();
});
