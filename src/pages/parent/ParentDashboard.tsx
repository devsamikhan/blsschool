import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext/LanguageContext';
import { Class, User, Announcement, AttendanceRecord, FeeRecord, ExamResult } from '../../types';
import { getUserById, getClassById, getAllAnnouncements, getAttendanceByClass, getFeeRecordsByStudent, getAllExamResults, getAllClasses } from '../../lib/api';
import { BookOpen, CheckCircle, Calendar, AlertTriangle, FileText, IndianRupee, Verified, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { FeeVoucherModal } from '@/components/FeeVoucherModal';
import { Printer, User as UserIcon } from 'lucide-react';

export function ParentDashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [student, setStudent] = useState<User | null>(null);
  const [cls, setCls] = useState<Class | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [attendancePercent, setAttendancePercent] = useState(100);
  const [pendingFees, setPendingFees] = useState(0);
  const [latestResult, setLatestResult] = useState<ExamResult | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState<FeeRecord | null>(null);

  const fetchData = useCallback(async (targetStudentId?: string) => {
    // Parent can now be linked to multiple studentIds
    const studentToFetch = targetStudentId || selectedStudentId || (user?.studentIds && user.studentIds[0]);
    
    if (!studentToFetch) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const child = await getUserById(studentToFetch);
      
      if (child) {
        setStudent(child);
        const [c, a, att, f, results, allCls] = await Promise.all([
          getClassById(child.classId),
          getAllAnnouncements(),
          getAttendanceByClass(child.classId),
          getFeeRecordsByStudent(child.id),
          getAllExamResults(),
          getAllClasses()
        ]);
        setFeeRecords(f);
        setClasses(allCls);

        setCls(c);
        setAnnouncements(a.filter(ann => 
          ann.targetRoles.includes('all') || 
          ann.targetRoles.includes('student') ||
          ann.targetClasses.includes(child.classId)
        ).sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime()));

        // Calculate Attendance
        let totalDays = 0;
        let presentDays = 0;
        att.forEach(record => {
          const myRecord = record.records.find(r => r.studentId === child.id);
          if (myRecord) {
            totalDays++;
            if (myRecord.status === 'present' || myRecord.status === 'late') {
              presentDays++;
            }
          }
        });
        setAttendancePercent(totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100);

        // Calculate Fees
        const pdFees = f.filter(fee => fee.status === 'pending' || (fee.status === 'partial' && fee.paid < fee.totalFee));
        const totalPending = pdFees.reduce((sum, fee) => sum + (fee.totalFee - fee.paid), 0);
        setPendingFees(totalPending);

        // Get Latest Result
        const childResults = results.filter(r => r.studentId === child.id);
        if (childResults.length > 0) {
          setLatestResult(childResults[childResults.length - 1]);
        }
      }
    } catch (error) {
      console.error('Failed to load parent dashboard', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.studentIds, selectedStudentId]);

  useEffect(() => {
    if (user?.studentIds && user.studentIds.length > 0) {
      const initialId = user.studentIds[0];
      setSelectedStudentId(initialId);
      fetchData(initialId);
    } else {
      setIsLoading(false);
    }
  }, [user, fetchData]);

  const handleStudentSwitch = (id: string) => {
    setSelectedStudentId(id);
    fetchData(id);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Smart Welcome Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        {!user?.studentIds || user.studentIds.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Account Not Linked</h2>
            <p className="lms-body mt-2 text-sm md:text-base">Please contact the school office to link your account to your child's student ID.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="text-center md:text-left w-full md:w-auto">
              <div className="flex justify-center md:justify-start items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/20">
                  Guardian Portal
                </span>
              </div>
              <h1 className="lms-page-title text-xl md:text-3xl">
                {t('welcome_back')}, {user?.name?.split(' ')[0] || 'Parent'}
              </h1>
              <p className="lms-body mt-1 text-sm md:text-base">
                Viewing <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{student?.name}'s</span> progress.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
              {user.studentIds && user.studentIds.length > 1 && (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-auto justify-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Child:</span>
                  <select 
                    value={selectedStudentId || ''} 
                    onChange={(e) => handleStudentSwitch(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-emerald-600 focus:ring-0 cursor-pointer"
                  >
                    {user.studentIds.map(sid => (
                      <option key={sid} value={sid}>Child ID: {sid.substring(0, 8).toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 md:p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 w-full md:w-auto justify-center">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                   <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                   <p className="lms-meta uppercase text-[10px] leading-none mb-1">{t('active_class')}</p>
                   <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white">Class {cls?.name} {cls?.section}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Insights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 md:p-8 hover:shadow-md transition-all cursor-default border-slate-100 dark:border-slate-800">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="lms-badge bg-blue-50 text-blue-700 border-blue-100">{t('updated_today')}</span>
           </div>
           <p className="lms-stat-label mb-1">Attendance Rate</p>
           <p className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">{attendancePercent}%</p>
           <div className="mt-4 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
             <div 
               className={cn("h-full transition-all duration-1000 rounded-full", attendancePercent >= 75 ? "bg-emerald-500" : "bg-red-500")}
               style={{ width: `${attendancePercent}%` }}
             />
           </div>
        </Card>

        <Card className="p-6 md:p-8 hover:shadow-md transition-all cursor-default border-slate-100 dark:border-slate-800">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-2xl text-red-600 dark:text-red-400">
                <IndianRupee className="h-6 w-6" />
              </div>
              <span className="lms-badge bg-red-50 text-red-700 border-red-100">{pendingFees > 0 ? 'Action Required' : 'Paid'}</span>
           </div>
           <p className="lms-stat-label mb-1">Outstanding Fees</p>
           <p className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">Rs {pendingFees.toLocaleString()}</p>
           {pendingFees > 0 ? (
              <Button 
                 onClick={() => {
                   const latest = feeRecords.filter(f => f.status !== 'paid')[0];
                   if (latest) { setActiveVoucher(latest); setIsVoucherOpen(true); }
                   else toast.info('No active vouchers found.');
                 }}
                 variant="link" 
                 className="p-0 h-auto text-emerald-600 font-bold text-[10px] uppercase tracking-widest mt-2 flex items-center gap-1"
              >
                 Download Voucher <Printer className="h-3 w-3" />
              </Button>
           ) : (
              <p className="lms-meta mt-2">All fees cleared</p>
           )}
        </Card>

        <Card className="p-8 hover:shadow-md transition-all cursor-default border-slate-100 dark:border-slate-800">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <Verified className="h-6 w-6" />
              </div>
              <span className="lms-badge bg-emerald-50 text-emerald-700 border-emerald-100">Latest Standing</span>
           </div>
           <p className="lms-stat-label mb-1">Academic Status</p>
           <p className="lms-stat-number text-slate-900 dark:text-white">{latestResult?.standing || 'N/A'}</p>
           <p className="lms-meta mt-2">Session: {latestResult?.session || '2023-24'}</p>
        </Card>

        <Card className="p-8 hover:shadow-md transition-all cursor-default bg-slate-950 text-white border-none shadow-xl shadow-slate-900/40">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/10 rounded-2xl text-white">
                <Verified className="h-6 w-6" />
              </div>
           </div>
           <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Mobile Alerts</p>
           <h3 className="text-xl font-bold leading-tight">Install app for instant WhatsApp alerts.</h3>
           <span className="lms-badge bg-white/10 text-white border-white/20 mt-4">Coming Soon</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Announcements Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="lms-section-title">Announcements</h2>
            <Button variant="ghost" className="lms-meta uppercase font-bold tracking-widest">View All</Button>
          </div>
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <Card className="p-12 text-center text-slate-400 italic font-medium">No recent announcements found.</Card>
            ) : (
              announcements.slice(0, 4).map(ann => (
                <Card key={ann.id} className="p-6 transition-all border-slate-50 dark:border-slate-800">
                  <div className="flex items-start gap-5">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                      ann.type === 'urgent' ? "bg-red-50 dark:bg-red-500/10 text-red-600" : "bg-blue-50 dark:bg-blue-500/10 text-blue-600"
                    )}>
                       {ann.type === 'urgent' ? <AlertTriangle className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 dark:text-white truncate">{ann.title}</h3>
                          {ann.type === 'urgent' && (
                            <span className="lms-badge bg-red-50 text-red-700 border-red-100">Urgent</span>
                          )}
                       </div>
                       <p className="lms-body text-sm line-clamp-2 leading-relaxed">{ann.message}</p>
                       <div className="mt-4 flex items-center justify-between lms-meta uppercase">
                          <span>{ann.createdByName}</span>
                          <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
           <h2 className="lms-section-title px-2">Quick Actions</h2>
           <Card className="p-8 border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
             <div className="space-y-4">
               <Button className="w-full h-14 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold transition-all flex items-center justify-center gap-2">
                  View Results
                  <TrendingUp className="h-4 w-4" />
               </Button>
               <Button variant="outline" className="w-full h-14 rounded-xl font-semibold border-slate-200 dark:border-slate-800">
                  Fee History
               </Button>
               <Button variant="outline" className="w-full h-14 rounded-xl font-semibold border-slate-200 dark:border-slate-800">
                  Message Office
               </Button>
             </div>
             <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
               <p className="lms-meta uppercase font-bold text-[10px] mb-2 tracking-widest">School Support</p>
               <p className="text-lg font-bold text-emerald-600">+92-XXX-XXXXXXX</p>
             </div>
           </Card>
        </div>
      </div>


      <FeeVoucherModal 
        isOpen={isVoucherOpen}
        onClose={() => setIsVoucherOpen(false)}
        fee={activeVoucher}
      />
    </div>
  );
}
