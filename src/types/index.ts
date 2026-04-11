export type UserRole = 'admin' | 'teacher' | 'student' | 'principal' | 'accountant' | 'parent';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  schoolId: string;
  password: string;
  email: string;
  phone: string;
  address: string;
  classId: string;
  studentIds?: string[]; // For parents to link to their children
  subjects: string[];
  profilePic: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  section: string;
  studentIds?: string[];
  maxStudents: number;
  createdAt: string;
}

export interface Homework {
  id: string;
  title: string;
  subject: string;
  description: string;
  classId: string;
  dueDate: string;
  createdBy: string;
  teacherName: string;
  attachments: string[];
  status: 'active' | 'closed';
  totalMarks: number;
  createdAt: string;
}

export interface Submission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  submissionText: string;
  attachments: string[];
  submittedAt: string;
  status: 'pending' | 'checked' | 'returned';
  marks: number | null;
  totalMarks: number | null;
  feedback: string;
  checkedAt: string;
  checkedBy: string;
}

export interface TeacherClass {
  id: string;
  teacherId: string;
  classId: string;
  subject: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  feeType: 'monthly' | 'quarterly' | 'annual' | 'admission' | 'exam' | 'transport';
  totalFee: number;
  paid: number;
  balance: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  month: string;
  year: string;
  payments: Payment[];
  concessionAmount?: number;
  concessionType?: string;
  isLeakage?: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: 'cash' | 'bank' | 'online' | 'cheque';
  receiptNo: string;
  receivedBy: string;
}

export interface Expense {
  id: string;
  date: string;
  category: 'salary' | 'electricity' | 'water' | 'maintenance' | 'supplies' | 'transport' | 'events' | 'other';
  amount: number;
  description: string;
  paidTo: string;
  paymentMethod: 'cash' | 'bank' | 'online' | 'cheque';
  receiptNo: string;
  approvedBy: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'general' | 'urgent' | 'holiday' | 'event' | 'exam';
  priority: 'low' | 'normal' | 'high';
  targetRoles: string[];
  targetClasses: string[];
  createdBy: string;
  createdByName: string;
  createdByRole: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  date: string;
  records: StudentAttendance[];
  markedBy: string;
  createdAt: string;
}

export interface StudentAttendance {
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | 'late' | 'leave';
}

export interface ExamResult {
  id: string;
  studentId: string;
  classId: string;
  session: string;
  exams: {
    subject: string;
    totalMarks: number;
    obtainedMarks: number;
    grade: string;
  }[];
  attendance: number;
  rank: string;
  standing: 'PROMOTED' | 'HELD' | 'PROBATION';
  remarks: string;
  createdAt: string;
}

export interface AdmissionApplication {
  id: string;
  studentName: string;
  fatherName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  previousSchool: string;
  gradeAppliedFor: string;
  address: string;
  parentPhone: string;
  parentEmail: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'resolved';
  submittedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: 'academic' | 'event' | 'sports' | 'announcement';
  imageUrl: string;
  author: string;
  publishedAt: string;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'furniture' | 'electronics' | 'books' | 'sports' | 'stationary' | 'other';
  quantity: number;
  condition: 'new' | 'good' | 'fair' | 'poor' | 'broken';
  location: string;
  assignedTo?: string; // staff name or room
  purchaseDate: string;
  cost: number;
  lastChecked: string;
  status: 'in-use' | 'stored' | 'repair' | 'retired';
}

export interface Notification {
  id: string;
  type: 'inquiry' | 'fee' | 'system' | 'homework';
  title: string;
  message: string;
  time: string;
  icon: React.ElementType;
  color: string;
}