import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { Class, TeacherClass, Homework, Submission, User } from '../../types';
import { getTeacherClasses, getAllClasses, getHomeworkByTeacher, getAllSubmissions, getAllUsers } from '../../lib/api';
import { BookOpen, FileText, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { EVENTS, useEventListener } from '../../lib/events';

export function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignedClasses, setAssignedClasses] = useState<(Class & Partial<TeacherClass> & { studentCount?: number })[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [tClasses, allClasses, myHomeworks, allSubs, allUsers] = await Promise.all([
        getTeacherClasses(user.id),
        getAllClasses(),
        getHomeworkByTeacher(user.id),
        getAllSubmissions(),
        getAllUsers(),
      ]);

      // Map teacher classes to actual class details and calculate student count
      const mappedClasses = tClasses.map(tc => {
        const c = allClasses.find(cls => cls.id === tc.classId);
        const studentCount = allUsers.filter(u => u.role === 'student' && u.classId === tc.classId).length;
        return { ...c, ...tc, studentCount } as Class & Partial<TeacherClass> & { studentCount: number };
      }).filter(c => c.name); 

      setAssignedClasses(mappedClasses);
      setHomeworks(myHomeworks);
      setSubmissions(allSubs.filter(s => myHomeworks.some(h => h.id === s.homeworkId)));
      setUsers(allUsers);

    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEventListener(EVENTS.HOMEWORK_CHANGE, fetchData);
  useEventListener(EVENTS.SUBMISSION_CHANGE, fetchData);
  useEventListener(EVENTS.CLASS_CHANGE, fetchData);
  useEventListener(EVENTS.USER_CHANGE, fetchData);

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const checkedToday = submissions.filter(s => s.status === 'checked' && new Date(s.checkedAt || '').toDateString() === new Date().toDateString());

  const recentHomework = [...homeworks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="lms-page-title text-xl md:text-2xl">Teacher Dashboard</h1>
          <p className="lms-body mt-1 text-sm md:text-base">Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.name}</span>!</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild className="text-xs">
            <Link to="/teacher/students">Manage Students</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="text-xs">
            <Link to="/teacher/results">Mark Results</Link>
          </Button>
          <Button size="sm" asChild className="text-xs">
            <Link to="/teacher/homework/create">Create Homework</Link>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 dark:bg-slate-900 dark:border-slate-800 transition-all">
          <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="lms-stat-label">My Classes</p>
            <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{assignedClasses.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 dark:bg-slate-900 dark:border-slate-800 transition-all">
          <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="lms-stat-label">Total Homework</p>
            <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{homeworks.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 dark:bg-slate-900 dark:border-slate-800 transition-all">
          <div className="bg-yellow-50 p-2.5 rounded-lg text-yellow-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="lms-stat-label">Pending Submissions</p>
            <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{pendingSubmissions.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 dark:bg-slate-900 dark:border-slate-800 transition-all">
          <div className="bg-green-50 p-2.5 rounded-lg text-green-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="lms-stat-label">Checked Today</p>
            <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{checkedToday.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submissions Awaiting Review */}
        <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden lg:col-span-2 shadow-2xl shadow-slate-200/50 dark:bg-slate-900 dark:border-slate-800">
          <div className="p-5 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="lms-section-title text-base">Submissions Review</h2>
                <p className="lms-meta mt-0.5">Homework grading queue</p>
              </div>
            </div>
            {pendingSubmissions.length > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-indigo-200">
                  {pendingSubmissions.length} Pending
                </span>
              </div>
            )}
          </div>
          
          <div className="lms-table-container">
            {pendingSubmissions.length === 0 ? (
              <div className="p-10 md:p-20 text-center bg-slate-50/30">
                <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                  <CheckCircle className="h-12 w-12 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-4 dark:text-white">ALL PROTOCOLS MET.</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed dark:text-slate-400">The grading queue is currently empty. All student assets have been validated and marked.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                  <tr>
                    <th className="px-6 py-4 text-left lms-table-header">Student Name</th>
                    <th className="px-6 py-4 text-left lms-table-header">Homework Title</th>
                    <th className="px-6 py-4 text-left lms-table-header">Submitted On</th>
                    <th className="px-6 py-4 text-right lms-table-header">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50 dark:bg-slate-900 dark:divide-slate-800">
                  {pendingSubmissions.slice(0, 5).map(sub => {
                    const hw = homeworks.find(h => h.id === sub.homeworkId);
                    return (
                      <tr 
                        key={sub.id} 
                        onClick={() => navigate(`/teacher/homework/${sub.homeworkId}`)}
                        className="hover:bg-indigo-50/20 transition-all group cursor-pointer"
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-semibold text-white text-sm group-hover:bg-indigo-600 transition-colors">
                              {sub.studentName.charAt(0)}
                            </div>
                            <div>
                               <div className="text-sm font-semibold text-slate-900 dark:text-white">{sub.studentName}</div>
                               <div className="lms-meta">Student</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-800 group-hover:text-indigo-600 transition-colors dark:text-slate-200">{hw?.title || 'Untitled'}</div>
                          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
                            {hw?.subject}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                             <Clock className="h-3.5 w-3.5 text-indigo-400" />
                             {new Date(sub.submittedAt).toLocaleDateString()}
                          </div>
                          <div className="lms-meta mt-1 ml-5">{new Date(sub.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <Button asChild size="sm" className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-medium text-sm h-9 px-5 shadow-sm active:scale-95 transition-all">
                            <Link to={`/teacher/homework/${sub.homeworkId}`} className="flex items-center gap-1.5">Grade <ArrowRight className="h-3.5 w-3.5" /></Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            
            {pendingSubmissions.length > 5 && (
              <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center dark:border-slate-800">
                <Button variant="ghost" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors group dark:text-slate-300" asChild>
                   <Link to="/teacher/homework" className="flex items-center gap-2">
                     View all {pendingSubmissions.length - 5} more submissions
                     <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                   </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* My Classes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 dark:border-slate-800 dark:bg-slate-800/50">
            <h2 className="lms-section-title">My Classes</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assignedClasses.length === 0 ? (
                <p className="col-span-full lms-body text-center py-4">No classes assigned yet.</p>
              ) : (
                assignedClasses.map((cls, idx) => (
                  <div key={`${cls.id}-${cls.subject}-${idx}`} className="border border-gray-100 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors dark:border-slate-800 dark:bg-slate-800/50">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="lms-card-title">{cls.name} <span className="text-sm font-normal text-gray-500 dark:text-slate-400">({cls.section})</span></h3>
                       <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{cls.subject}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-3 dark:text-slate-400">
                      <BookOpen className="h-4 w-4 mr-1.5 text-gray-400" />
                      {cls.studentCount || 0} Students
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Homework */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 dark:border-slate-800 dark:bg-slate-800/50">
            <h2 className="lms-section-title">Recent Homework</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/teacher/homework">View All</Link>
            </Button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
             {recentHomework.length === 0 ? (
                <p className="lms-body text-center py-8">No homework assigned yet.</p>
             ) : (
                recentHomework.map(hw => {
                  const clsInfo = assignedClasses.find(c => c.id === hw.classId);
                  const hwSubs = submissions.filter(s => s.homeworkId === hw.id);
                  const totalStudents = users.filter(u => u.role === 'student' && u.classId === hw.classId).length;
                  return (
                    <div key={hw.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex justify-between items-center">
                      <div>
                        <Link to={`/teacher/homework/${hw.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">{hw.title}</Link>
                        <p className="lms-meta mt-0.5">{hw.subject} · Class {clsInfo?.name || 'Unknown'}</p>
                      </div>
                      <div className="text-right">
                        <p className="lms-meta mb-0.5">Submissions</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{hwSubs.length} / {totalStudents}</p>
                      </div>
                    </div>
                  );
                })
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
