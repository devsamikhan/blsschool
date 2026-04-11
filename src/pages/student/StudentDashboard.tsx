import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { Class, Homework, Submission, Announcement } from '../../types';
import { getClassById, getHomeworkByClass, getSubmissionsByStudent, getAllAnnouncements, getAttendanceByClass, getFeeRecordsByStudent } from '../../lib/api';
import { EVENTS, useEventListener } from '../../lib/events';
import { BookOpen, CheckCircle, Clock, Calendar, AlertTriangle, FileText, IndianRupee, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';

export function StudentDashboard() {
  const { user } = useAuth();
  const [cls, setCls] = useState<Class | null>(null);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [attendancePercent, setAttendancePercent] = useState(100);
  const [pendingFees, setPendingFees] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user || user.role !== 'student' || !user.classId) return;
    setIsLoading(true);
    try {
      const [c, h, s, a, att, f] = await Promise.all([
        getClassById(user.classId),
        getHomeworkByClass(user.classId),
        getSubmissionsByStudent(user.id),
        getAllAnnouncements(),
        getAttendanceByClass(user.classId),
        getFeeRecordsByStudent(user.id)
      ]);

      setCls(c);
      setHomeworks(h);
      setSubmissions(s);
      
      setAnnouncements(a.filter(ann => 
        ann.targetRoles.includes('all') || 
        ann.targetRoles.includes('student') ||
        ann.targetClasses.includes(user.classId!)
      ).sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime()));

      let totalDays = 0;
      let presentDays = 0;
      att.forEach(record => {
        const myRecord = record.records.find(r => r.studentId === user.id);
        if (myRecord) {
          totalDays++;
          if (myRecord.status === 'present' || myRecord.status === 'late') {
            presentDays++;
          }
        }
      });
      setAttendancePercent(totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100);

      const pdFees = f.filter(fee => fee.status === 'pending' || (fee.status === 'partial' && fee.paid < fee.totalFee));
      const totalPending = pdFees.reduce((sum, fee) => sum + (fee.totalFee - fee.paid), 0);
      setPendingFees(totalPending);

    } catch (error) {
      console.error('Failed to load student dashboard', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEventListener(EVENTS.HOMEWORK_CHANGE, fetchData);
  useEventListener(EVENTS.SUBMISSION_CHANGE, fetchData);
  useEventListener(EVENTS.ANNOUNCEMENT_CHANGE, fetchData);
  useEventListener(EVENTS.ATTENDANCE_CHANGE, fetchData);
  useEventListener(EVENTS.FEE_CHANGE, fetchData);

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const activeHomeworks = homeworks.filter(h => h.status === 'active');
  const pendingHomeworks = activeHomeworks.filter(h => !submissions.some(s => s.homeworkId === h.id));
  const recentChecked = submissions.filter(s => s.status === 'checked' || s.status === 'returned').sort((a, b) => new Date(b.checkedAt!).getTime() - new Date(a.checkedAt!).getTime()).slice(0, 3);
  const feeWarning = pendingFees > 0;

  // Gamification metadata
  const xp = submissions.length * 120 + (100 - pendingHomeworks.length * 10);
  const xpCap = 1500;
  const xpPercent = Math.min((xp / xpCap) * 100, 100);
  const streak = submissions.length;
  const level = xp > 1000 ? 'Gold Scholar' : xp > 500 ? 'Silver Learner' : 'Bronze Starter';
  const levelColor = xp > 1000 ? 'text-amber-500' : xp > 500 ? 'text-slate-400' : 'text-amber-700';

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌤 Good Morning' : hour < 17 ? '🌤 Good Afternoon' : '🌙 Good Evening';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header with Gamification */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="relative group self-center md:self-auto">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-3xl font-black italic shadow-2xl shadow-purple-500/30 group-hover:scale-105 transition-transform duration-500">
              {user?.name.charAt(0)}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-lg">
               <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
          </div>
          <div className="flex-1 min-w-0 text-center md:text-left">
            <div className="flex justify-center md:justify-start items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded-full border border-purple-500/20">
                {greeting}
              </span>
            </div>
            <h1 className="lms-page-title text-xl md:text-2xl">{user?.name}</h1>
            <p className="lms-body mt-1 text-sm">Class {cls?.name} {cls?.section} · Student ID: {user?.schoolId}</p>
          </div>
          <div className="w-full md:w-72 shrink-0 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-baseline mb-2">
              <span className={`text-xs font-semibold uppercase tracking-wide ${levelColor}`}>⬡ {level}</span>
              <span className="lms-meta text-[10px]">{xp} / {xpCap} XP</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="lms-meta text-[10px]">🔥 {streak} Streak</span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
              <span className="text-[10px] font-medium text-purple-600">{submissions.length} Submissions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`p-6 rounded-xl border shadow-sm relative overflow-hidden transition-all hover:scale-[1.01] ${pendingHomeworks.length > 0 ? 'bg-rose-50/50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30' : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2.5 rounded-xl ${pendingHomeworks.length > 0 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="lms-stat-label">Pending Tasks</p>
          </div>
          <p className={`text-3xl md:text-4xl font-bold tracking-tight ${pendingHomeworks.length > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>{pendingHomeworks.length}</p>
          <p className="lms-meta mt-1.5">Assignments not submitted</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm transition-all hover:scale-[1.01] dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600"><CheckCircle className="h-5 w-5" /></div>
            <p className="lms-stat-label">Submitted</p>
          </div>
          <p className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight dark:text-white">{submissions.length}</p>
          <p className="lms-meta mt-1.5">Total submissions</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm transition-all hover:scale-[1.01] dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2.5 rounded-xl ${attendancePercent >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}><Calendar className="h-5 w-5" /></div>
            <p className="lms-stat-label">Attendance</p>
          </div>
          <p className={`text-3xl md:text-4xl font-bold tracking-tight ${attendancePercent >= 75 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>{attendancePercent}%</p>
          <p className="lms-meta mt-1.5">Attendance record</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm transition-all hover:scale-[1.01] dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2.5 rounded-xl ${feeWarning ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}><IndianRupee className="h-5 w-5" /></div>
            <p className="lms-stat-label">Pending Fees</p>
          </div>
          <p className={`text-3xl md:text-4xl font-bold tracking-tight ${feeWarning ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>Rs {pendingFees.toLocaleString()}</p>
          <p className="lms-meta mt-1.5">Outstanding dues</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Homework Ledger */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[500px] dark:bg-slate-900 dark:border-slate-800">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 dark:border-slate-800">
             <div>
                <h2 className="lms-section-title">Pending Assignments</h2>
                <p className="lms-meta mt-0.5">Homework not yet submitted</p>
             </div>
             <Button variant="outline" size="sm" asChild className="rounded-xl font-medium text-xs h-9 px-4">
               <Link to="/student/homework">View All</Link>
             </Button>
          </div>
          <div className="p-5 overflow-y-auto flex-1 space-y-3">
             {pendingHomeworks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <Sparkles className="h-12 w-12 mb-3 opacity-20" />
                  <p className="lms-meta">No pending assignments.</p>
                </div>
             ) : (
                pendingHomeworks.map(hw => {
                  const isOverdue = new Date(hw.dueDate).getTime() < new Date().setHours(0,0,0,0);
                  return (
                    <div key={hw.id} className={`group border rounded-xl p-4 transition-all hover:shadow-md ${isOverdue ? 'border-rose-100 bg-rose-50/30 dark:border-rose-900/30 dark:bg-rose-900/10' : 'border-slate-100 hover:bg-white dark:border-slate-800 dark:hover:bg-slate-800/80'}`}>
                      <div className="flex justify-between items-start">
                         <div>
                           <Link to={`/student/homework/${hw.id}`} className="text-sm font-semibold text-slate-900 hover:text-purple-600 transition-colors block dark:text-white">
                             {hw.title}
                           </Link>
                           <p className="lms-meta mt-1">{hw.subject} · {hw.teacherName}</p>
                         </div>
                         <span className={`text-xs px-3 py-1 rounded-full font-semibold ${isOverdue ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-100 text-amber-700'}`}>
                           {isOverdue ? 'Overdue' : 'Pending'}
                         </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center lms-meta">
                          <Calendar className="h-3 w-3 mr-1.5" /> Due {new Date(hw.dueDate).toLocaleDateString()}
                        </div>
                        <Button size="sm" className="bg-slate-900 text-white rounded-lg h-8 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all px-3" asChild>
                           <Link to={`/student/homework/${hw.id}`}>Submit</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })
             )}
          </div>
        </div>

        {/* Intelligence Sidefeed */}
        <div className="space-y-8">
           {/* Recent Academic Returns */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
             <div className="p-5 border-b border-slate-100 bg-slate-50/50 dark:border-slate-800">
               <h2 className="lms-section-title">Graded Assignments</h2>
               <p className="lms-meta mt-0.5">Recently checked submissions</p>
             </div>
             <div className="p-5 space-y-3">
                {recentChecked.length === 0 ? (
                  <p className="lms-meta text-center py-4">No graded assignments yet.</p>
                ) : (
                  recentChecked.map(sub => {
                    const hw = homeworks.find(h => h.id === sub.homeworkId);
                    return (
                      <div key={sub.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all cursor-default group dark:border-slate-800 dark:hover:bg-slate-800/50">
                         <div className="flex items-center gap-3">
                           <div className={`p-2.5 rounded-xl ${sub.status === 'checked' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                             {sub.status === 'checked' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                           </div>
                           <div>
                             <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">{hw?.title}</p>
                             <p className="lms-meta">{hw?.subject}</p>
                           </div>
                         </div>
                         <div className="text-right">
                           {sub.status === 'checked' ? (
                             <p className="text-lg font-bold text-slate-900 dark:text-white">{sub.marks} <span className="lms-meta">/ {hw?.totalMarks}</span></p>
                           ) : (
                             <p className="text-xs font-semibold text-rose-600">Returned</p>
                           )}
                         </div>
                      </div>
                    );
                  })
                )}
             </div>
           </div>

           {/* Announcements Hub */}
           <div className="bg-slate-900 text-white rounded-xl shadow-xl overflow-hidden h-[300px] flex flex-col border border-white/5">
             <div className="p-5 border-b border-white/10 bg-white/5">
               <h2 className="lms-section-title text-white">Announcements</h2>
             </div>
             <div className="p-5 overflow-y-auto flex-1 space-y-4">
                {announcements.length === 0 ? (
                  <p className="lms-meta text-slate-500 text-center py-4">No announcements yet.</p>
                ) : (
                  announcements.slice(0, 5).map(ann => (
                    <div key={ann.id} className="flex items-start gap-3 border-b border-white/5 pb-4 last:border-0 last:pb-0 group">
                      <div className={`mt-0.5 p-1.5 rounded-lg ${ann.type === 'urgent' ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-blue-500/20 text-blue-400'}`}>
                         {ann.type === 'urgent' ? <AlertTriangle className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold group-hover:text-purple-400 transition-colors leading-tight">{ann.title}</p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{ann.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <p className="lms-meta text-slate-500">{new Date(ann.createdAt).toLocaleDateString()}</p>
                           <span className="w-1 h-1 rounded-full bg-slate-700" />
                           <p className="lms-meta text-slate-500">{ann.createdByName}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
