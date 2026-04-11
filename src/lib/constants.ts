import { UserRole } from "../types";

export const ROLES: Record<string, UserRole> = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PRINCIPAL: 'principal',
  ACCOUNTANT: 'accountant',
};

export const API_BASE = 'http://localhost:3001';
