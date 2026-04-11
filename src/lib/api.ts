import {
  User,
  Class,
  Homework,
  Submission,
  TeacherClass,
  FeeRecord,
  Expense,
  Announcement,
  AttendanceRecord,
  ExamResult,
  AdmissionApplication,
  ContactInquiry,
  NewsItem,
  InventoryItem,
} from '../types';
import { dispatchCustomEvent, EVENTS } from './events';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

export async function fetchAPI<T>(endpoint: string, options?: RequestInit, retries = 2): Promise<T> {
  console.log(`[API Request] ${API_BASE}${endpoint}`);
  try {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...(options?.headers || {})
      },
    });
    if (!response.ok) {
      let errorMsg = `API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) errorMsg = errorData.error;
      } catch (e) { /* fallback if not json */ }

      if (response.status === 404) {
        throw new Error(`404: Endpoint not found — "${endpoint}". Please restart json-server (npm run dev:api).`);
      }
      throw new Error(errorMsg);
    }
    const result = await response.json();

    // AUTO-SYNC: Jab bhi data change ho (POST, PUT, PATCH, DELETE), automatically events fire karo
    if (options?.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
      const path = endpoint.split('?')[0].split('/')[1];
      const eventMap: Record<string, string> = {
        'users': EVENTS.USER_CHANGE,
        'classes': EVENTS.CLASS_CHANGE,
        'homework': EVENTS.HOMEWORK_CHANGE,
        'submissions': EVENTS.SUBMISSION_CHANGE,
        'feeRecords': EVENTS.FEE_CHANGE,
        'expenses': EVENTS.EXPENSE_CHANGE,
        'announcements': EVENTS.ANNOUNCEMENT_CHANGE,
        'attendance': EVENTS.ATTENDANCE_CHANGE,
        'admissions': EVENTS.ADMISSION_CHANGE,
        'contactInquiries': EVENTS.INQUIRY_CHANGE,
        'news': EVENTS.NEWS_CHANGE,
        'inventory': EVENTS.INVENTORY_CHANGE || 'inventory-storage-change',
        'examResults': EVENTS.USER_CHANGE, // Exam results usually refresh student/user data views
        'teacherClasses': EVENTS.CLASS_CHANGE
      };
      const eventToFire = eventMap[path];
      if (eventToFire) {
        console.log(`[Auto-Sync] Dispatching ${eventToFire} for endpoint ${endpoint}`);
        dispatchCustomEvent(eventToFire);
      }
    }

    return result;
  } catch (err: unknown) {
    const error = err as Error;
    if (retries > 0 && error?.message?.startsWith('Failed to fetch')) {
      await new Promise(r => setTimeout(r, 800));
      return fetchAPI<T>(endpoint, options, retries - 1);
    }
    throw err;
  }
}

// Security Helper: Strip sensitive data
export const sanitizeUser = (user: User): User => {
  const sanitized = { ...user };
  delete (sanitized as Partial<User> & { password?: string }).password;
  return sanitized;
};

// Users API
export const getAllUsers = async () => {
  const users = await fetchAPI<User[]>('/users');
  return users.map(sanitizeUser);
};

export const getUserById = async (id: string) => {
  const user = await fetchAPI<User>(`/users/${id}`);
  return sanitizeUser(user);
};

export const getUsersByRole = async (role: string) => {
  const users = await fetchAPI<User[]>(`/users?role=${role}`);
  return users.map(sanitizeUser);
};

export const createUser = async (user: Omit<User, 'id'>) => {
  const saved = await fetchAPI<User>('/users', { method: 'POST', body: JSON.stringify(user) });
  return sanitizeUser(saved);
};

export const updateUser = async (id: string, data: Partial<User>) => {
  const updated = await fetchAPI<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  return sanitizeUser(updated);
};

export const deleteUser = (id: string) => fetchAPI<void>(`/users/${id}`, { method: 'DELETE' });

export const loginUser = async (schoolId: string, password: string): Promise<User> => {
  const response = await fetchAPI<{user: User, token: string}>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ schoolId, password })
  });
  
  if (response.user) {
    // We could store the token in localStorage here for future JWT headers
    localStorage.setItem('auth_token', response.token);
    return response.user;
  }
  
  throw new Error('Authentication failed');
};

// Classes API
export const getAllClasses = () => fetchAPI<Class[]>('/classes');
export const getClassById = (id: string) => fetchAPI<Class>(`/classes/${id}`);
export const createClass = (classData: Omit<Class, 'id'>) =>
  fetchAPI<Class>('/classes', { method: 'POST', body: JSON.stringify(classData) });
export const updateClass = (id: string, data: Partial<Class>) =>
  fetchAPI<Class>(`/classes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteClass = (id: string) => fetchAPI<void>(`/classes/${id}`, { method: 'DELETE' });

// Homework API
export const getAllHomework = () => fetchAPI<Homework[]>('/homework');
export const getHomeworkById = (id: string) => fetchAPI<Homework>(`/homework/${id}`);
export const getHomeworkByClass = async (classId: string) => {
  const all = await fetchAPI<Homework[]>('/homework');
  return all.filter(h => String(h.classId) === String(classId));
};
export const getHomeworkByTeacher = (teacherId: string) => fetchAPI<Homework[]>(`/homework?createdBy=${teacherId}`);
export const createHomework = (homework: Omit<Homework, 'id'>) =>
  fetchAPI<Homework>('/homework', { method: 'POST', body: JSON.stringify(homework) });
export const updateHomework = (id: string, data: Partial<Homework>) =>
  fetchAPI<Homework>(`/homework/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteHomework = (id: string) => fetchAPI<void>(`/homework/${id}`, { method: 'DELETE' });

// Submissions API
export const getAllSubmissions = () => fetchAPI<Submission[]>('/submissions');
export const getSubmissionsByHomework = (homeworkId: string) => fetchAPI<Submission[]>(`/submissions?homeworkId=${homeworkId}`);
export const getSubmissionsByStudent = (studentId: string) => fetchAPI<Submission[]>(`/submissions?studentId=${studentId}`);
export const getSubmissionByHomeworkAndStudent = async (homeworkId: string, studentId: string): Promise<Submission | null> => {
  const subs = await fetchAPI<Submission[]>(`/submissions?homeworkId=${homeworkId}&studentId=${studentId}`);
  return subs.length > 0 ? subs[0] : null;
};
export const createSubmission = (submission: Omit<Submission, 'id'>) =>
  fetchAPI<Submission>('/submissions', { method: 'POST', body: JSON.stringify(submission) });
export const updateSubmission = (id: string, data: Partial<Submission>) =>
  fetchAPI<Submission>(`/submissions/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// Teacher Classes API
export const getTeacherClasses = (teacherId: string) => fetchAPI<TeacherClass[]>(`/teacherClasses?teacherId=${teacherId}`);
export const getClassTeachers = (classId: string) => fetchAPI<TeacherClass[]>(`/teacherClasses?classId=${classId}`);
export const assignTeacherToClass = (data: Omit<TeacherClass, 'id'>) =>
  fetchAPI<TeacherClass>('/teacherClasses', { method: 'POST', body: JSON.stringify(data) });
export const removeTeacherFromClass = (id: string) => fetchAPI<void>(`/teacherClasses/${id}`, { method: 'DELETE' });
export const getAllTeacherClasses = () => fetchAPI<TeacherClass[]>('/teacherClasses');

// Fee Records API
export const getAllFeeRecords = () => fetchAPI<FeeRecord[]>('/feeRecords');
export const getFeeRecordsByStudent = (studentId: string) => fetchAPI<FeeRecord[]>(`/feeRecords?studentId=${studentId}`);
export const getFeeRecordsByClass = (classId: string) => fetchAPI<FeeRecord[]>(`/feeRecords?classId=${classId}`);
export const createFeeRecord = (record: Omit<FeeRecord, 'id'>) =>
  fetchAPI<FeeRecord>('/feeRecords', { method: 'POST', body: JSON.stringify(record) });
export const updateFeeRecord = (id: string, data: Partial<FeeRecord>) =>
  fetchAPI<FeeRecord>(`/feeRecords/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteFeeRecord = (id: string) => fetchAPI<void>(`/feeRecords/${id}`, { method: 'DELETE' });

// Expenses API
export const getAllExpenses = () => fetchAPI<Expense[]>('/expenses');
export const createExpense = (expense: Omit<Expense, 'id'>) =>
  fetchAPI<Expense>('/expenses', { method: 'POST', body: JSON.stringify(expense) });
export const updateExpense = (id: string, data: Partial<Expense>) =>
  fetchAPI<Expense>(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteExpense = (id: string) => fetchAPI<void>(`/expenses/${id}`, { method: 'DELETE' });

// Announcements API
export const getAllAnnouncements = () => fetchAPI<Announcement[]>('/announcements');
export const getAnnouncementsByRole = (role: string) => fetchAPI<Announcement[]>(`/announcements?targetRoles_like=${role}`); 
export const createAnnouncement = (announcement: Omit<Announcement, 'id'>) =>
  fetchAPI<Announcement>('/announcements', { method: 'POST', body: JSON.stringify(announcement) });
export const updateAnnouncement = (id: string, data: Partial<Announcement>) =>
  fetchAPI<Announcement>(`/announcements/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteAnnouncement = (id: string) => fetchAPI<void>(`/announcements/${id}`, { method: 'DELETE' });

// Attendance API
export const getAllAttendance = () => fetchAPI<AttendanceRecord[]>('/attendance');
export const getAttendanceByClass = (classId: string) => fetchAPI<AttendanceRecord[]>(`/attendance?classId=${classId}`);
export const getAttendanceByDate = (date: string) => fetchAPI<AttendanceRecord[]>(`/attendance?date=${date}`);
export const createAttendance = (record: Omit<AttendanceRecord, 'id'>) =>
  fetchAPI<AttendanceRecord>('/attendance', { method: 'POST', body: JSON.stringify(record) });
export const updateAttendance = (id: string, data: Partial<AttendanceRecord>) =>
  fetchAPI<AttendanceRecord>(`/attendance/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// Exam Results API
export const getExamResultsByStudent = (studentId: string) => fetchAPI<ExamResult[]>(`/examResults?studentId=${studentId}`);
export const getAllExamResults = () => fetchAPI<ExamResult[]>('/examResults');
export const createExamResult = (data: Omit<ExamResult, 'id'>) =>
  fetchAPI<ExamResult>('/examResults', { method: 'POST', body: JSON.stringify(data) });

// Public Integration APIs
export const getAllAdmissions = () => fetchAPI<AdmissionApplication[]>('/admissions');
export const createAdmission = (data: Omit<AdmissionApplication, 'id'>) =>
  fetchAPI<AdmissionApplication>('/admissions', { method: 'POST', body: JSON.stringify(data) });
export const getAdmissionById = (id: string) => fetchAPI<AdmissionApplication>(`/admissions/${id}`);
export const updateAdmission = (id: string, data: Partial<AdmissionApplication>) =>
  fetchAPI<AdmissionApplication>(`/admissions/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteAdmission = (id: string) => fetchAPI<void>(`/admissions/${id}`, { method: 'DELETE' });

export const getAllInquiries = () => fetchAPI<ContactInquiry[]>('/contactInquiries');
export const createInquiry = (data: Omit<ContactInquiry, 'id'>) =>
  fetchAPI<ContactInquiry>('/contactInquiries', { method: 'POST', body: JSON.stringify(data) });
export const getInquiryById = (id: string) => fetchAPI<ContactInquiry>(`/contactInquiries/${id}`);
export const updateInquiry = (id: string, data: Partial<ContactInquiry>) =>
  fetchAPI<ContactInquiry>(`/contactInquiries/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteInquiry = (id: string) => fetchAPI<void>(`/contactInquiries/${id}`, { method: 'DELETE' });

export const getAllNews = () => fetchAPI<NewsItem[]>('/news');
export const createNews = (data: Omit<NewsItem, 'id'>) =>
  fetchAPI<NewsItem>('/news', { method: 'POST', body: JSON.stringify(data) });
export const updateNews = (id: string, data: Partial<NewsItem>) =>
  fetchAPI<NewsItem>(`/news/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteNews = (id: string) => fetchAPI<void>(`/news/${id}`, { method: 'DELETE' });

// ─── Aliases for CreateUser / EditUser pages ─────────────────────────
export const getClasses = getAllClasses;
export const getClass = getClassById;
export const getUser = getUserById;

export const assignClassToTeacher = async (teacherId: string, classId: string) => {
  return fetchAPI<TeacherClass>('/teacherClasses', {
    method: 'POST',
    body: JSON.stringify({ teacherId, classId, subject: 'General' })
  });
};

export const removeClassFromTeacher = async (teacherId: string, classId: string) => {
  const entries = await fetchAPI<TeacherClass[]>(`/teacherClasses?teacherId=${teacherId}&classId=${classId}`);
  await Promise.all(entries.map(e => fetchAPI<void>(`/teacherClasses/${e.id}`, { method: 'DELETE' })));
};

// Inventory API
export const getAllInventory = () => fetchAPI<InventoryItem[]>('/inventory');
export const createInventoryItem = (item: Omit<InventoryItem, 'id'>) =>
  fetchAPI<InventoryItem>('/inventory', { method: 'POST', body: JSON.stringify(item) });
export const updateInventoryItem = (id: string, data: Partial<InventoryItem>) =>
  fetchAPI<InventoryItem>(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteInventoryItem = (id: string) => fetchAPI<void>(`/inventory/${id}`, { method: 'DELETE' });

export const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4);

// ─── Phase 2 Intelligence Helpers ─────────────────────────────
export const getRevenueLeakage = (fees: FeeRecord[]) => {
  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long' });
  const isPastFifteen = now.getDate() > 15;
  if (!isPastFifteen) return 0;
  return fees
    .filter(f => f.month === currentMonth && (f.status === 'pending' || f.status === 'partial'))
    .reduce((sum, f) => sum + f.balance, 0);
};

export const getOverdueRecords = (fees: FeeRecord[]) => {
  return fees.filter(f => f.status === 'overdue' || (f.status === 'pending' && new Date(f.dueDate) < new Date()));
};

export const getAverageResultByClass = (results: ExamResult[], classes: Class[]) => {
  return classes.map(c => {
    const classResults = results.filter(r => r.classId === c.id);
    if (classResults.length === 0) return { name: c.name, avgMarks: 0 };
    const scores = classResults.flatMap(r => r.exams.map(e => (e.obtainedMarks / (e.totalMarks || 100)) * 100));
    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return { name: c.name, avgMarks: Math.round(avg) };
  });
};