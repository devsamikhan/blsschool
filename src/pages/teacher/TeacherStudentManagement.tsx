import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { User, Class, Homework, Submission, AttendanceRecord, ExamResult } from '../../types';
import { 
  getAllUsers, getAllClasses, getTeacherClasses, 
  getAllHomework, getAllSubmissions, getAllAttendance, 
  getExamResultsByStudent 
} from '../../lib/api';
import { createUserWithRelations, updateUserWithRelations, deleteUserWithRelations } from '../../lib/DataManager';
import { Search, Plus, X, Users as UsersIcon, BarChart2, CheckCircle, Clock, Zap, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { EVENTS, useEventListener } from '../../lib/events';
import { cn } from '../../lib/utils';

export function TeacherStudentManagement() {
  const { user } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  
  // Data States
  const [formData, setFormData] = useState<Partial<User>>({
    name: '', role: 'student', email: '', phone: '', address: '', classId: '', status: 'active', password: ''
  });
  const [parentData, setParentData] = useState({ name: '', phone: '', email: '' });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  
  // Insights Data
  const [insights, setInsights] = useState({
    homeworkCompletion: 0,
    attendanceRate: 0,
    avgGrade: 'N/A',
    totalHomework: 0,
    submittedHomework: 0
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [allU, allC, tClasses] = await Promise.all([
        getAllUsers(),
        getAllClasses(),
        getTeacherClasses(user.id)
      ]);
      
      const teacherClassIds = tClasses.map(tc => tc.classId);
      const myClasses = allC.filter(c => teacherClassIds.includes(c.id));
      
      setAllUsers(allU);
      setAssignedClasses(myClasses);
      setStudents(allU.filter(u => u.role === 'student' && teacherClassIds.includes(u.classId)));
      
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEventListener(EVENTS.USER_CHANGE, fetchData);

  const handleOpenInsights = async (student: User) => {
    setSelectedStudent(student);
    setIsInsightsOpen(true);
    try {
      const [homework, submissions, attendance, results] = await Promise.all([
        getAllHomework(),
        getAllSubmissions(),
        getAllAttendance(),
        getExamResultsByStudent(student.id)
      ]);

      const classHomework = homework.filter(h => h.classId === student.classId);
      const studentSubmissions = submissions.filter(s => s.studentId === student.id);
      const studentAttendance = attendance.filter(a => a.classId === student.classId);
      
      const presentCount = studentAttendance.reduce((acc, curr) => {
        const record = curr.records.find(r => r.studentId === student.id);
        return record?.status === 'present' ? acc + 1 : acc;
      }, 0);

      const avgMarks = results.length > 0 ? 
        results.reduce((acc, curr) => {
          const total = curr.exams.reduce((s, e) => s + (e.obtainedMarks / e.totalMarks), 0);
          return acc + (total / curr.exams.length);
        }, 0) / results.length : 0;

      setInsights({
        homeworkCompletion: classHomework.length > 0 ? (studentSubmissions.length / classHomework.length) * 100 : 0,
        attendanceRate: studentAttendance.length > 0 ? (presentCount / studentAttendance.length) * 100 : 0,
        avgGrade: avgMarks > 0 ? `${(avgMarks * 100).toFixed(1)}%` : 'N/A',
        totalHomework: classHomework.length,
        submittedHomework: studentSubmissions.length
      });
    } catch (error) {
      toast.error('Failed to analyze student pulse.');
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateUserWithRelations(editingStudent.id, {
          name: formData.name || '',
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          status: formData.status as User['status'],
          password: formData.password,
          newClassId: formData.classId,
          oldClassId: editingStudent.classId
        });
        toast.success('Student profile synchronized');
      } else {
        const saved = await createUserWithRelations({
          name: formData.name || '',
          role: 'student',
          password: formData.password || 'welcome123',
          classId: formData.classId,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        });

        if (parentData.name && (parentData.phone || parentData.email)) {
          await createUserWithRelations({
            name: parentData.name,
            role: 'parent',
            password: 'welcome123',
            phone: parentData.phone,
            email: parentData.email,
            studentIds: [saved.id]
          });
        }
        toast.success(`Student and Guardian added successfully!`);
      }

      setIsModalOpen(false);
      setEditingStudent(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to process student registry');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to ARCHIVE this student record?')) return;
    try {
      await deleteUserWithRelations(id);
      toast.success('Student record archived');
      fetchData();
    } catch (error) {
       toast.error('Deletion failed');
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.schoolId.toLowerCase().includes(search.toLowerCase());
    const matchesClass = filterClass === 'all' || s.classId === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter uppercase">Class Registry.</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-normal">Manage and monitor student performance in your assigned units.</p>
        </div>
        {assignedClasses.length > 0 ? (
          <Button onClick={() => setIsModalOpen(true)} className="h-14 px-10 rounded-2xl bg-slate-900 border-none text-white font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
            <Plus className="h-5 w-5" /> Enroll Student
          </Button>
        ) : (
          <div className="bg-rose-50 border border-rose-100 px-6 py-4 rounded-2xl text-xs font-black text-rose-600 uppercase flex items-center gap-3">
            <X className="h-5 w-5" /> No Classes Assigned — Contact Admin
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search registry by name or institution ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white"
          />
        </div>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs cursor-pointer"
        >
          <option value="all">Filter: All Assigned Units</option>
          {assignedClasses.map(c => (
            <option key={c.id} value={c.id}>{c.name} {c.section}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          <div className="col-span-full py-24 text-center">
            <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Syncing Student Pulse...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <Card className="col-span-full p-20 text-center bg-white dark:bg-slate-900 border-none rounded-[3rem] shadow-xl shadow-slate-100">
             <UsersIcon className="h-16 w-16 text-slate-100 mx-auto mb-6" />
             <p className="text-xl font-black text-slate-400 italic uppercase">Registry Empty.</p>
          </Card>
        ) : (
          filteredStudents.map((student) => {
            const cls = assignedClasses.find(c => c.id === student.classId);
            const parent = allUsers.find(u => u.role === 'parent' && u.studentIds?.includes(student.id));
            
            return (
              <Card key={student.id} className="group p-8 bg-white dark:bg-slate-900 border-none shadow-xl shadow-slate-200/50 dark:shadow-none hover:translate-y-[-4px] transition-all duration-500 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-bl-[3rem] -mr-8 -mt-8 group-hover:bg-indigo-500/5 transition-colors" />
                
                <div className="relative z-10 flex gap-6">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center text-3xl font-black italic shadow-2xl shadow-slate-900/20 group-hover:scale-110 transition-transform">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                       <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">{student.name}</h3>
                       <span className={cn(
                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                        student.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                       )}>{student.status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                       <span>ID: {student.schoolId}</span>
                       <span className="w-1 h-1 bg-slate-200 rounded-full" />
                       <span className="text-slate-600 dark:text-slate-400">UNIT: {cls?.name} {cls?.section}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                      <p className="tracking-widest opacity-80 uppercase font-semibold text-[10px]">Guardian Liaison</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{parent?.name || 'Unlinked'}</p>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                      <p className="tracking-widest opacity-80 uppercase font-semibold text-[10px]">Secure Contact</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{student.phone || 'No Data'}</p>
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                   <div className="flex gap-2">
                      <button onClick={() => handleOpenInsights(student)} className="p-3 bg-indigo-50 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm" title="Academic Pulse">
                        <BarChart2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => {
                        setEditingStudent(student);
                        setFormData({...student, password: ''});
                        setIsModalOpen(true);
                      }} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm" title="Modify Record">
                        <Zap className="h-4 w-4" />
                      </button>
                   </div>
                   <button onClick={() => handleDeleteStudent(student.id)} className="text-[10px] font-black uppercase text-rose-400 hover:text-rose-600 transition-colors tracking-widest italic">
                      Archive Profile
                   </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Insights Modal (Academic Pulse) */}
      {isInsightsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsInsightsOpen(false)} />
           <Card className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-none">
              <div className="bg-slate-900 p-8 md:p-12 text-white relative">
                 <button onClick={() => setIsInsightsOpen(false)} className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                    <X className="h-6 w-6" />
                 </button>
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center">
                       <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold uppercase tracking-tighter">Academic Pulse.</h2>
                      <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">{selectedStudent?.name} · Performance Highlights</p>
                    </div>
                 </div>
              </div>

              <div className="p-8 md:p-12 space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                          <CheckCircle className="h-5 w-5 text-emerald-500 mb-3" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance Rate</p>
                          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 italic">{insights.attendanceRate.toFixed(1)}%</p>
                       </div>
                       <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                          <Zap className="h-5 w-5 text-amber-500 mb-3" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Avg</p>
                          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 italic">{insights.avgGrade}</p>
                       </div>
                    </div>
                    <div className="flex flex-col">
                       <div className="flex-1 p-8 bg-indigo-600 rounded-[2.5rem] text-white overflow-hidden relative group">
                          <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
                             <TrendingUp className="h-32 w-32" />
                          </div>
                          <Clock className="h-6 w-6 mb-4 opacity-60" />
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Homework Pulse</p>
                          <p className="text-4xl font-black italic">{insights.homeworkCompletion.toFixed(0)}%</p>
                          <div className="mt-6 space-y-1">
                             <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white" style={{ width: `${insights.homeworkCompletion}%` }} />
                             </div>
                             <p className="text-[8px] font-black uppercase tracking-widest opacity-60">{insights.submittedHomework} / {insights.totalHomework} Submissions</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-slate-50 dark:border-slate-800">
                    <Button onClick={() => setIsInsightsOpen(false)} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs italic active:scale-95 transition-all shadow-xl shadow-slate-900/20">
                       Acknowledge Performance
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      )}

      {/* Main Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => { setIsModalOpen(false); setEditingStudent(null); }} />
           <Card className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-none">
              <div className="bg-slate-900 p-8 text-white relative">
                 <button onClick={() => { setIsModalOpen(false); setEditingStudent(null); }} className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                    <X className="h-6 w-6" />
                 </button>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center">
                       <UsersIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter italic">{editingStudent ? 'Synchronize Profile' : 'Student Enrollment'}</h2>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">{editingStudent ? 'Update institutional access & metadata' : 'Initiating new academic journey'}</p>
                    </div>
                 </div>
              </div>

              <form onSubmit={handleCreateStudent} className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Full Legal Name</Label>
                    <Input required className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold italic" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Institutional Email</Label>
                      <Input required type="email" className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold italic" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Contact Number</Label>
                      <Input required className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold italic" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Academic Unit Assignment</Label>
                    <select required value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} className="w-full h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 font-bold italic text-slate-900 dark:text-white">
                      <option value="">Select Target Unit</option>
                      {assignedClasses.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Access Key {editingStudent ? '(Optional)' : '*'}</Label>
                       <Input type="text" className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="welcome123" />
                    </div>
                    <div className="space-y-1">
                       <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Account Status</Label>
                       <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as User['status']})} className="w-full h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 font-bold italic">
                         <option value="active">Active High-Trust</option>
                         <option value="inactive">Suspended / Hold</option>
                       </select>
                    </div>
                  </div>

                  {!editingStudent && (
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
                       <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Guardian Liaison Unit</h3>
                       <div className="space-y-4">
                          <Input className="rounded-2xl h-12 bg-slate-50 dark:bg-slate-800 border-none" value={parentData.name} onChange={e => setParentData({...parentData, name: e.target.value})} placeholder="Guardian Name" />
                          <div className="grid grid-cols-2 gap-4">
                             <Input className="rounded-2xl h-12 bg-slate-50 dark:bg-slate-800 border-none" value={parentData.phone} onChange={e => setParentData({...parentData, phone: e.target.value})} placeholder="Contact No" />
                             <Input className="rounded-2xl h-12 bg-slate-50 dark:bg-slate-800 border-none" value={parentData.email} onChange={e => setParentData({...parentData, email: e.target.value})} placeholder="Email (Optional)" />
                          </div>
                       </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 flex gap-4">
                    <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl border-2 uppercase font-black italic tracking-widest text-[10px]" onClick={() => { setIsModalOpen(false); setEditingStudent(null); }}>Abort</Button>
                    <Button type="submit" className="flex-[2] h-14 rounded-2xl bg-slate-950 text-white uppercase font-black italic tracking-widest text-[10px] shadow-xl shadow-slate-900/20 active:scale-95 transition-all">Authorize Profile</Button>
                </div>
              </form>
           </Card>
        </div>
      )}
    </div>
  );
}
