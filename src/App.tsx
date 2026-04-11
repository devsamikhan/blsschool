import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { RequireAuth } from './components/RequireAuth';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './contexts/AuthContext/AuthContext';
import { InstallPrompt } from './components/ui/InstallPrompt';
import { OfflineStatus } from './components/ui/OfflineStatus';
import { useNavigate, useLocation } from 'react-router-dom';

// Fallback Loader for Suspense
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

// Public Pages
const Home = lazy(() => import('./pages/public/Home').then(m => ({ default: m.Home })));
const About = lazy(() => import('./pages/public/About').then(m => ({ default: m.About })));
const Gallery = lazy(() => import('./pages/public/Gallery').then(m => ({ default: m.Gallery })));
const Contact = lazy(() => import('./pages/public/Contact').then(m => ({ default: m.Contact })));
const Admissions = lazy(() => import('./pages/public/Admissions').then(m => ({ default: m.Admissions })));
const Academics = lazy(() => import('./pages/public/Academics').then(m => ({ default: m.Academics })));
const News = lazy(() => import('./pages/public/News').then(m => ({ default: m.News })));
const PublicTracker = lazy(() => import('./pages/public/PublicTracker').then(m => ({ default: m.PublicTracker })));
const NotFound = lazy(() => import('./pages/public/NotFound').then(m => ({ default: m.NotFound })));
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const ProfileSettings = lazy(() => import('./pages/shared/ProfileSettings').then(m => ({ default: m.ProfileSettings })));

// Admin Modules
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const UserManagement = lazy(() => import('./pages/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const ClassManagement = lazy(() => import('./pages/admin/ClassManagement').then(m => ({ default: m.ClassManagement })));
const TeacherAssignment = lazy(() => import('./pages/admin/TeacherAssignment').then(m => ({ default: m.TeacherAssignment })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AdminActivityLogs = lazy(() => import('./pages/admin/AdminActivityLogs').then(m => ({ default: m.AdminActivityLogs })));
const AdminBulkOps = lazy(() => import('./pages/admin/AdminBulkOps').then(m => ({ default: m.AdminBulkOps })));
const InventoryDashboard = lazy(() => import('./pages/admin/InventoryDashboard').then(m => ({ default: m.InventoryDashboard })));

// Teacher Modules
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const TeacherHomeworkList = lazy(() => import('./pages/teacher/TeacherHomeworkList').then(m => ({ default: m.TeacherHomeworkList })));
const TeacherHomeworkCreate = lazy(() => import('./pages/teacher/TeacherHomeworkCreate').then(m => ({ default: m.TeacherHomeworkCreate })));
const TeacherHomeworkDetail = lazy(() => import('./pages/teacher/TeacherHomeworkDetail').then(m => ({ default: m.TeacherHomeworkDetail })));
const TeacherAttendance = lazy(() => import('./pages/teacher/TeacherAttendance').then(m => ({ default: m.TeacherAttendance })));
const TeacherAnnouncements = lazy(() => import('./pages/teacher/TeacherAnnouncements').then(m => ({ default: m.TeacherAnnouncements })));
const TeacherResultsEntry = lazy(() => import('./pages/teacher/TeacherResultsEntry'));
const TeacherStudentManagement = lazy(() => import('./pages/teacher/TeacherStudentManagement').then(m => ({ default: m.TeacherStudentManagement })));
const TeacherDiary = lazy(() => import('./pages/teacher/TeacherDiary').then(m => ({ default: m.TeacherDiary })));
const ParentDiary = lazy(() => import('./pages/parent/ParentDiary').then(m => ({ default: m.ParentDiary })));

// Student Modules
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const StudentHomeworkList = lazy(() => import('./pages/student/StudentHomeworkList').then(m => ({ default: m.StudentHomeworkList })));
const StudentHomeworkDetail = lazy(() => import('./pages/student/StudentHomeworkDetail').then(m => ({ default: m.StudentHomeworkDetail })));
const StudentAnnouncements = lazy(() => import('./pages/student/StudentAnnouncements').then(m => ({ default: m.StudentAnnouncements })));
const StudentFees = lazy(() => import('./pages/student/StudentFees').then(m => ({ default: m.StudentFees })));

// Principal Modules
const PrincipalDashboard = lazy(() => import('./pages/principal/PrincipalDashboard').then(m => ({ default: m.PrincipalDashboard })));
const PrincipalClasses = lazy(() => import('./pages/principal/PrincipalClasses').then(m => ({ default: m.PrincipalClasses })));
const PrincipalTeachers = lazy(() => import('./pages/principal/PrincipalTeachers').then(m => ({ default: m.PrincipalTeachers })));
const PrincipalStudents = lazy(() => import('./pages/principal/PrincipalStudents').then(m => ({ default: m.PrincipalStudents })));
const PrincipalReports = lazy(() => import('./pages/principal/PrincipalReports').then(m => ({ default: m.PrincipalReports })));
const PrincipalExamResults = lazy(() => import('./pages/principal/PrincipalExamResults').then(m => ({ default: m.PrincipalExamResults })));
const PrincipalAnnouncements = lazy(() => import('./pages/principal/PrincipalAnnouncements').then(m => ({ default: m.PrincipalAnnouncements })));
const PrincipalInquiries = lazy(() => import('./pages/principal/PrincipalInquiries').then(m => ({ default: m.PrincipalInquiries })));
const PrincipalNewsManage = lazy(() => import('./pages/principal/PrincipalNewsManage').then(m => ({ default: m.PrincipalNewsManage })));

// Accountant Modules
const AccountantDashboard = lazy(() => import('./pages/accountant/AccountantDashboard').then(m => ({ default: m.AccountantDashboard })));
const AccountantFees = lazy(() => import('./pages/accountant/AccountantFees').then(m => ({ default: m.AccountantFees })));
const AccountantExpenses = lazy(() => import('./pages/accountant/AccountantExpenses').then(m => ({ default: m.AccountantExpenses })));
const AccountantReports = lazy(() => import('./pages/accountant/AccountantReports').then(m => ({ default: m.AccountantReports })));

// Parent Modules
const ParentDashboard = lazy(() => import('./pages/parent/ParentDashboard').then(m => ({ default: m.ParentDashboard })));

function App() {
  useEffect(() => {
    const handleUpdate = () => {
      toast.info("A new version of BLS LMS is available!", {
        description: "Click update to sycn the latest features and data.",
        action: {
          label: "Update Now",
          onClick: () => window.location.reload()
        },
        duration: Infinity
      });
    };

    window.addEventListener('pwa-update-available', handleUpdate);
    return () => window.removeEventListener('pwa-update-available', handleUpdate);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
      <LanguageProvider>
          <Suspense fallback={<PageLoader />}>
            <AppContent />
          </Suspense>
        <Toaster position="top-right" richColors />
      </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
}

function AppContent() {
  const { user, isResumedSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 🏪 Path Memory: Save the current path to remember where the user was
  useEffect(() => {
    const currentPath = location.pathname;
    if (user && currentPath !== '/' && currentPath !== '/login') {
       localStorage.setItem('bls_last_path', currentPath);
    }
  }, [user, location.pathname]);

  // 🚀 Precise Entry Redirect: When returning to the site, go back to the SPECIFIC page
  useEffect(() => {
    if (user && isResumedSession) {
      const lastPath = localStorage.getItem('bls_last_path');
      const dashboardPath = `/${user.role}/dashboard`;
      
      const hasRedirected = sessionStorage.getItem('bls_initial_redirect');
      if (!hasRedirected) {
        sessionStorage.setItem('bls_initial_redirect', 'true');
        // Navigate to the EXACT last page or the default dashboard
        navigate(lastPath || dashboardPath);
      }
    }
  }, [user, isResumedSession, navigate]);

  return (
    <>
      <InstallPrompt />
      <OfflineStatus />
      <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admissions" element={<Admissions />} />
              <Route path="/academics" element={<Academics />} />
              <Route path="/news" element={<News />} />
              <Route path="/track-admission" element={<PublicTracker />} />
              <Route path="/login" element={<Login />} />

              {/* Shared Routes */}
              <Route path="/settings" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
                <Route index element={<ProfileSettings />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<RequireAuth allowedRoles={['admin']}><DashboardLayout /></RequireAuth>}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="classes" element={<ClassManagement />} />
                <Route path="teacher-assignment" element={<TeacherAssignment />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="logs" element={<AdminActivityLogs />} />
                <Route path="bulk" element={<AdminBulkOps />} />
                <Route path="inventory" element={<InventoryDashboard />} />
              </Route>

              {/* Teacher Routes */}
              <Route path="/teacher" element={<RequireAuth allowedRoles={['teacher']}><DashboardLayout /></RequireAuth>}>
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="homework/create" element={<TeacherHomeworkCreate />} />
                <Route path="homework" element={<TeacherHomeworkList />} />
                <Route path="homework/:id" element={<TeacherHomeworkDetail />} />
                <Route path="attendance" element={<TeacherAttendance />} />
                <Route path="diary" element={<TeacherDiary />} />
                <Route path="announcements" element={<TeacherAnnouncements />} />
                <Route path="results" element={<TeacherResultsEntry />} />
                <Route path="students" element={<TeacherStudentManagement />} />
              </Route>

              {/* Student Routes */}
              <Route path="/student" element={<RequireAuth allowedRoles={['student']}><DashboardLayout /></RequireAuth>}>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="homework" element={<StudentHomeworkList />} />
                <Route path="homework/:id" element={<StudentHomeworkDetail />} />
                <Route path="announcements" element={<StudentAnnouncements />} />
                <Route path="fees" element={<StudentFees />} />
              </Route>

              {/* Principal Routes */}
              <Route path="/principal" element={<RequireAuth allowedRoles={['principal']}><DashboardLayout /></RequireAuth>}>
                <Route path="dashboard" element={<PrincipalDashboard />} />
                <Route path="classes" element={<PrincipalClasses />} />
                <Route path="teachers" element={<PrincipalTeachers />} />
                <Route path="students" element={<PrincipalStudents />} />
                <Route path="reports" element={<PrincipalReports />} />
                <Route path="exam-results" element={<PrincipalExamResults />} />
                <Route path="announcements" element={<PrincipalAnnouncements />} />
                <Route path="inquiries" element={<PrincipalInquiries />} />
                <Route path="news-manage" element={<PrincipalNewsManage />} />
                <Route path="diaries" element={<ParentDiary />} />
              </Route>

              {/* Accountant Routes */}
              <Route path="/accountant" element={<RequireAuth allowedRoles={['accountant']}><DashboardLayout /></RequireAuth>}>
                <Route path="dashboard" element={<AccountantDashboard />} />
                <Route path="fees" element={<AccountantFees />} />
                <Route path="expenses" element={<AccountantExpenses />} />
                <Route path="reports" element={<AccountantReports />} />
              </Route>

              {/* Parent Routes */}
              <Route path="/parent" element={<RequireAuth allowedRoles={['parent']}><DashboardLayout /></RequireAuth>}>
                <Route path="dashboard" element={<ParentDashboard />} />
                <Route path="diary" element={<ParentDiary />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
    </>
  );
}

export default App;