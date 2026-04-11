// centralDataManager.ts
// ============================================================
// CENTRAL DATA MANAGER
// Yeh file sab data operations handle karti hai
// Koi bhi component directly api.ts call kar sakta hai
// lekin jahan multiple collections update honi hain
// wahan yeh functions use karo
// ============================================================

import {
  createUser, updateUser, deleteUser, getUser,
  createClass, updateClass, deleteClass, getClass,
  removeClassFromTeacher, getTeacherClasses,
  createHomework, getAllHomework,
  createSubmission, getSubmissionByHomeworkAndStudent,
  updateSubmission, getSubmissionsByHomework,
} from '@/lib/api';
import { User, Class, Homework, Submission, UserRole } from '@/types';

// ─────────────────────────────────────────
// ID GENERATORS
// ─────────────────────────────────────────
export const generateId = () => Date.now().toString();

export const generateSchoolId = (role: UserRole): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  
  const prefixes: Record<UserRole, string> = {
    admin: 'ADM',
    accountant: 'ACC',
    principal: 'PRN',
    teacher: 'TCH',
    student: 'STU',
    parent: 'PAR'
  };

  const rolePrefix = prefixes[role] || 'USR';
  
  // Unique Session Marker
  const session = role === 'student' ? 'ACAD' : 'FAC';
  
  // 4-digit professional random hex
  const hex = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
  
  // Result: STU-202603-ACAD-F3B1
  return `${rolePrefix}-${year}${month}-${session}-${hex}`;
};

// ─────────────────────────────────────────
// USER OPERATIONS
// ─────────────────────────────────────────

/**
 * Naya user banao
 */
export const createUserWithRelations = async (data: {
  name: string;
  role: UserRole;
  password?: string;
  classId?: string;
  studentIds?: string[];
  subjects?: string[];
  email?: string;
  phone?: string;
  address?: string;
  profilePic?: string;
}) => {
  const schoolId = generateSchoolId(data.role);

  const newUserBase: Partial<User> = {
    name: data.name,
    role: data.role,
    schoolId,
    password: data.password || 'welcome123',
    createdAt: new Date().toISOString(),
    status: 'active',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    profilePic: data.profilePic || '',
    subjects: data.subjects || [],
    studentIds: data.studentIds || []
  };

  if (data.role === 'student' && data.classId) {
    newUserBase.classId = data.classId;
  }

  // 1. User save karo
  const savedUser = await createUser(newUserBase as Omit<User, 'id'>);

  // (Removed legacy logic: studentIds is handled natively by relational links now if needed, or by simply filtering users by classId)

  return savedUser;
};

/**
 * User update karo
 */
export const updateUserWithRelations = async (
  userId: string,
  data: {
    name: string;
    subjects?: string[];
    newClassId?: string;
    oldClassId?: string;
    studentIds?: string[];
    email?: string;
    phone?: string;
    address?: string;
    status?: string;
    password?: string;
  }
) => {
  const updatePayload: Partial<User> = { name: data.name };
  if (data.subjects) updatePayload.subjects = data.subjects;
  if (data.newClassId) updatePayload.classId = data.newClassId;
  if (data.studentIds !== undefined) updatePayload.studentIds = data.studentIds;
  if (data.email !== undefined) updatePayload.email = data.email;
  if (data.phone !== undefined) updatePayload.phone = data.phone;
  if (data.address !== undefined) updatePayload.address = data.address;
  if (data.status !== undefined) updatePayload.status = data.status as User['status'];
  if (data.password) updatePayload.password = data.password;

  // 1. User update karo
  const updatedUser = await updateUser(userId, updatePayload);

  // (Removed legacy studentIds array tracking from Class model)

  return updatedUser;
};

/**
 * User delete karo
 */
export const deleteUserWithRelations = async (userId: string) => {
  const user = await getUser(userId);

  // Removed legacy studentIds lookup

  if (user.role === 'teacher') {
    try {
      const teacherClasses = await getTeacherClasses(userId);
      await Promise.all(
        teacherClasses.map((tc) => removeClassFromTeacher(userId, tc.classId))
      );
    } catch (e) { /* ignore */ }
  }

  await deleteUser(userId);
};

// ─────────────────────────────────────────
// CLASS OPERATIONS
// ─────────────────────────────────────────

export const createNewClass = async (name: string, section: string = 'A') => {
  const newClass: Omit<Class, 'id'> = {
    name: name.trim(),
    section: section.trim(),
    maxStudents: 40,
    createdAt: new Date().toISOString(),
  };
  return await createClass(newClass);
};

export const deleteClassSafely = async (classId: string) => {
  await deleteClass(classId);
};

// ─────────────────────────────────────────
// HOMEWORK OPERATIONS
// ─────────────────────────────────────────

export const createHomeworkEntry = async (data: {
  title: string;
  description: string;
  subject: string;
  classId: string;
  dueDate: string;
  teacherId: string;
  teacherName: string;
}) => {
  const newHomework: Omit<Homework, 'id'> = {
    title: data.title,
    description: data.description,
    subject: data.subject,
    classId: data.classId,
    dueDate: data.dueDate,
    createdBy: data.teacherId,
    teacherName: data.teacherName,
    attachments: [],
    totalMarks: 100,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  return await createHomework(newHomework);
};

// ─────────────────────────────────────────
// SUBMISSION OPERATIONS
// ─────────────────────────────────────────

export const submitHomework = async (data: {
  homeworkId: string;
  studentId: string;
  studentName: string;
  submissionText: string;
}) => {
  const existing = await getSubmissionByHomeworkAndStudent(data.homeworkId, data.studentId);
  if (existing) throw new Error('ALREADY_SUBMITTED');

  const newSubmission: Omit<Submission, 'id'> = {
    homeworkId: data.homeworkId,
    studentId: data.studentId,
    studentName: data.studentName,
    submissionText: data.submissionText,
    attachments: [],
    submittedAt: new Date().toISOString(),
    status: 'pending',
    marks: null,
    totalMarks: 100,
    feedback: '',
    checkedAt: '',
    checkedBy: ''
  };

  return await createSubmission(newSubmission);
};

export const checkSubmission = async (
  submissionId: string,
  currentSubmission: Submission,
  marks: number,
  feedback: string,
  teacherId: string,
  status: 'checked' | 'returned' = 'checked'
) => {
  const updated: Partial<Submission> = {
    ...currentSubmission,
    status,
    marks: status === 'checked' ? marks : null,
    feedback,
    checkedAt: new Date().toISOString(),
    checkedBy: teacherId
  };
  return await updateSubmission(submissionId, updated);
};

export { getAllHomework, getSubmissionsByHomework, getSubmissionByHomeworkAndStudent };