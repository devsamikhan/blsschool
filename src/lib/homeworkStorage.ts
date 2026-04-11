// src/lib/homeworkStorage.ts
import { Homework, Submission } from '../types';

// Event name for storage changes
export const HOMEWORK_STORAGE_EVENT = 'homework-storage-change';

// Helper to notify all components
const notifyHomeworkChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(HOMEWORK_STORAGE_EVENT));
  }
};

// Dummy data for initial load
const dummyHomework: Homework[] = [
  {
    id: '1',
    title: 'Math Exercise 5.2',
    description: 'Solve all problems from chapter 5.2',
    subject: 'Math',
    classId: '7',
    dueDate: '2026-03-15',
    createdBy: '4',
    teacherName: 'Teacher Usman',
    attachments: [],
    totalMarks: 100,
    status: 'active',
    createdAt: new Date('2026-03-10').toISOString()
  },
  {
    id: '2',
    title: 'Science Project',
    description: 'Prepare a model of solar system',
    subject: 'Science',
    classId: '7',
    dueDate: '2026-03-18',
    createdBy: '4',
    teacherName: 'Teacher Usman',
    attachments: [],
    totalMarks: 100,
    status: 'active',
    createdAt: new Date('2026-03-12').toISOString()
  },
];

const dummySubmissions: Submission[] = [
  {
    id: 's1',
    homeworkId: '1',
    studentId: '5',
    studentName: 'Student Raza',
    submissionText: 'Solved all problems',
    attachments: [],
    submittedAt: new Date('2026-03-14').toISOString(),
    status: 'checked',
    marks: 85,
    totalMarks: 100,
    feedback: 'Excellent work!',
    checkedAt: new Date('2026-03-15').toISOString(),
    checkedBy: '4'
  },
  {
    id: 's2',
    homeworkId: '2',
    studentId: '7',
    studentName: 'Student Ahmed',
    submissionText: 'Model ready',
    attachments: [],
    submittedAt: new Date('2026-03-15').toISOString(),
    status: 'pending',
    marks: null,
    totalMarks: 100,
    feedback: '',
    checkedAt: '',
    checkedBy: ''
  },
];

// Homework functions
export const getHomework = (): Homework[] => {
  const stored = localStorage.getItem('homework');
  if (stored) {
    try {
      return JSON.parse(stored) as Homework[];
    } catch (error) {
      console.error('Failed to parse homework from localStorage', error);
      return dummyHomework;
    }
  }
  return dummyHomework;
};

export const saveHomework = (homework: Homework[]) => {
  localStorage.setItem('homework', JSON.stringify(homework));
  notifyHomeworkChange();
};

// Submissions functions
export const getSubmissions = (): Submission[] => {
  const stored = localStorage.getItem('submissions');
  if (stored) {
    try {
      return JSON.parse(stored) as Submission[];
    } catch (error) {
      console.error('Failed to parse submissions from localStorage', error);
      return dummySubmissions;
    }
  }
  return dummySubmissions;
};

export const saveSubmissions = (submissions: Submission[]) => {
  localStorage.setItem('submissions', JSON.stringify(submissions));
  notifyHomeworkChange();
};

// Helper to get submissions for a specific homework
export const getSubmissionsByHomework = (homeworkId: string): Submission[] => {
  const all = getSubmissions();
  return all.filter(s => s.homeworkId === homeworkId);
};

// Helper to get submission for a specific student for a homework
export const getStudentSubmission = (homeworkId: string, studentId: string): Submission | undefined => {
  const all = getSubmissions();
  return all.find(s => s.homeworkId === homeworkId && s.studentId === studentId);
};