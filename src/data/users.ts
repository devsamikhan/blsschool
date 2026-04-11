// src/data/users.ts
import { User, Class } from '@/types';

export const dummyUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Muhammad Ali',
    role: 'admin',
    schoolId: 'ADMIN-001',
    password: 'admin123',
    email: 'admin@bls.edu',
    phone: '03001234567',
    address: 'Lahore Head Office',
    status: 'active',
    classId: '',
    studentId: '',
    subjects: [],
    profilePic: '',
    createdAt: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'principal-1',
    name: 'Prof. Ahmad Hassan',
    role: 'principal',
    schoolId: 'PRIN-H4K8J1',
    password: 'welcome123',
    email: 'principal@isakhel.edu',
    phone: '0312-9988771',
    address: 'Main Campus Residence',
    status: 'active',
    classId: '',
    studentId: '',
    subjects: [],
    profilePic: '',
    createdAt: new Date('2026-03-17').toISOString(),
  },
  {
    id: 'accountant-1',
    name: 'Saeed Khan',
    role: 'accountant',
    schoolId: 'ACC-L9P2M4',
    password: 'welcome123',
    email: 'finance@isakhel.edu',
    phone: '0321-4433221',
    address: 'Isakhel Town',
    status: 'active',
    classId: '',
    studentId: '',
    subjects: [],
    profilePic: '',
    createdAt: new Date('2026-03-18').toISOString(),
  }
];

export const dummyClasses: Class[] = [];