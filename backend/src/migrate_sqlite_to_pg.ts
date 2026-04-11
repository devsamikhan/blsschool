import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'path';

const pgPrisma = new PrismaClient();
const sqliteDbPath = path.join(__dirname, '../prisma/dev.db');

async function migrateData() {
  console.log('Connecting to PostgreSQL via Prisma...');
  await pgPrisma.$connect();

  console.log(`Connecting to SQLite at ${sqliteDbPath}...`);
  const sqlite = new Database(sqliteDbPath, { fileMustExist: true });

  const tables = [
    'User',
    'Class',
    'Homework',
    'Submission',
    'TeacherClass',
    'FeeRecord',
    'Expense',
    'Announcement',
    'AttendanceRecord',
    'ExamResult',
    'AdmissionApplication',
    'ContactInquiry',
    'NewsItem',
    'InventoryItem'
  ];

  try {
    for (const table of tables) {
      console.log(`\nMigrating table: ${table}...`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = sqlite.prepare(`SELECT * FROM "${table}"`).all() as any[];
      if (rows.length === 0) {
        console.log(`No records found in ${table}.`);
        continue;
      }
      
      console.log(`Found ${rows.length} records. Inserting into PostgreSQL...`);
      const prismaModelName = table.charAt(0).toLowerCase() + table.slice(1);
      
      const transformedRows = rows.map(row => {
        const newRow = { ...row };
        if (newRow.createdAt) newRow.createdAt = new Date(newRow.createdAt);
        if (newRow.submittedAt) newRow.submittedAt = new Date(newRow.submittedAt);
        if ('isLeakage' in newRow && newRow.isLeakage !== null) newRow.isLeakage = Boolean(newRow.isLeakage);
        if ('isActive' in newRow && newRow.isActive !== null) newRow.isActive = Boolean(newRow.isActive);
        return newRow;
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createdCount = await (pgPrisma as any)[prismaModelName].createMany({
        data: transformedRows,
        skipDuplicates: true
      });
      console.log(`Successfully inserted ${createdCount.count} records into ${table}.`);
    }

    console.log('\nMigration complete!');
  } catch (error) {
    console.error('\nError during migration:', error);
  } finally {
    sqlite.close();
    await pgPrisma.$disconnect();
  }
}

migrateData();
