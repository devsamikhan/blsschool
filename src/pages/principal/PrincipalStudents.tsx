import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { User, Class, UserRole } from '../../types';
import { getAllUsers, getAllClasses } from '../../lib/api';
import { createUserWithRelations, updateUserWithRelations, deleteUserWithRelations } from '../../lib/DataManager';
import { Search, Printer, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ReportTemplate } from '../../components/reports/ReportTemplate';
import { toast } from 'sonner';
import { useEventListener, EVENTS } from '../../lib/events';
import { cn } from '../../lib/utils';

export function PrincipalStudents() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialClassId = searchParams.get('classId') || 'all';

  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState(initialClassId);
  const [viewMode, setViewMode] = useState<'table' | 'report'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '', role: 'student', email: '', phone: '', address: '', classId: '', status: 'active', password: ''
  });
  const [parentData, setParentData] = useState({ name: '', phone: '', email: '' });
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  // ─── POWERFUL DATA FETCHING ───
  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers
  });

  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: getAllClasses
  });

  const students = allUsers.filter(user => user.role === 'student');
  const isLoading = usersLoading || classesLoading;

  // ─── SYNC STATE TO URL ───
  useEffect(() => {
    if (filterClass === 'all') {
       searchParams.delete('classId');
    } else {
       searchParams.set('classId', filterClass);
    }
    setSearchParams(searchParams, { replace: true });
  }, [filterClass, setSearchParams, searchParams]);

  // ─── REAL-TIME SYNC BRIDGE ───
  useEventListener(EVENTS.USER_CHANGE, () => {
    console.log('[Real-time] Syncing students registry...');
    queryClient.invalidateQueries({ queryKey: ['users'] });
  });

  useEventListener(EVENTS.CLASS_CHANGE, () => {
    queryClient.invalidateQueries({ queryKey: ['classes'] });
  });

  // ─── MUTATIONS ───
  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setIsModalOpen(false);
      setEditingStudent(null);
      setParentData({ name: '', phone: '', email: '' });
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(`Operation Failed: ${err.message || 'Unknown error'}`);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (vars: { student: Parameters<typeof createUserWithRelations>[0], parent: Partial<Parameters<typeof createUserWithRelations>[0]> }) => {
      const saved = await createUserWithRelations(vars.student);
      if (vars.parent.name && (vars.parent.phone || vars.parent.email)) {
        await createUserWithRelations({
          ...(vars.parent as { name: string }),
          role: 'parent',
          password: 'welcome123',
          studentIds: [saved.id]
        });
      }
      return saved;
    },
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast.success('Institutional student-parent profile initialized.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string, data: Parameters<typeof updateUserWithRelations>[1] }) => updateUserWithRelations(vars.id, vars.data),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast.success('Student record updated successfully.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserWithRelations(id),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast.success('Student record purged from institutional ledger.');
    }
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateMutation.mutate({
        id: editingStudent.id,
        data: {
          name: formData.name || '',
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          newClassId: formData.classId,
          oldClassId: editingStudent.classId
        }
      });
    } else {
      createMutation.mutate({
        student: {
          name: formData.name || '',
          role: 'student',
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          classId: formData.classId,
          password: formData.password || 'welcome123'
        },
        parent: parentData
      });
    }
  };

  const handleDeleteStudent = (id: string) => {
    if (!confirm('Are you sure you want to delete this student record? This action cannot be undone.')) return;
    deleteMutation.mutate(id);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.schoolId.toLowerCase().includes(search.toLowerCase());
    const matchesClass = filterClass === 'all' || s.classId === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="lms-page-title">Students Registry</h1>
          <p className="lms-body mt-1">Manage and view all enrolled student profiles and parental links.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-6 bg-slate-900 text-white font-bold flex items-center gap-2 rounded-xl shadow-soft hover:scale-[1.02] transition-all"
          >
            <Plus className="h-4 w-4" /> Add Student
          </Button>
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 border border-slate-200 dark:border-slate-700 h-11">
            <button 
              onClick={() => setViewMode('table')}
              className={cn(
                "px-4 py-1.5 rounded-lg transition-all text-xs font-bold uppercase tracking-widest",
                viewMode === 'table' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Table
            </button>
            <button 
              onClick={() => setViewMode('report')}
              className={cn(
                "px-4 py-1.5 rounded-lg transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2",
                viewMode === 'report' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Printer className="h-3.5 w-3.5" /> Report
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-soft flex flex-col md:flex-row gap-4 print:hidden">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search student profiles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-11 h-11 bg-white dark:bg-slate-950"
          />
        </div>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="form-select w-full md:w-64 h-11 bg-white dark:bg-slate-950 font-bold text-xs uppercase tracking-widest"
        >
          <option value="all">Institutional: All Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name} {c.section}</option>
          ))}
        </select>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-premium">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-5 lms-table-header text-left">Entity Identifier</th>
                  <th className="px-6 py-5 lms-table-header text-left">Academic Unit</th>
                  <th className="px-6 py-5 lms-table-header text-center whitespace-nowrap">Status Metric</th>
                  <th className="px-6 py-5 lms-table-header text-right whitespace-nowrap">Entity Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-24"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-24 lms-body italic">No institutional records found for current criteria.</td></tr>
                ) : (
                  filteredStudents.map((student) => {
                    const cls = classes.find(c => c.id === student.classId);
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="h-11 w-11 flex-shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white font-bold border border-slate-200/60 dark:border-slate-700">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{student.name}</div>
                              <div className="flex flex-col mt-0.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UID: {student.schoolId}</span>
                                <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                  {allUsers.find(u => u.role === 'parent' && u.studentIds?.includes(student.id))?.name 
                                    ? `Guardian: ${allUsers.find(u => u.role === 'parent' && u.studentIds?.includes(student.id))?.name}`
                                    : 'Awaiting Parental Link'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {cls ? (
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-widest">{cls.name} {cls.section}</span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic tracking-tighter">UNASSIGNED</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex justify-center">
                            <span className={cn(
                              "lms-badge",
                              student.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                            )}>
                              {student.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                             <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setEditingStudent(student);
                                setFormData({
                                  name: student.name,
                                  email: student.email,
                                  phone: student.phone,
                                  address: student.address,
                                  classId: student.classId || '',
                                });
                                 setIsModalOpen(true);
                                }}
                                className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-all"
                               >
                                Update
                               </Button>
                             <Button 
                               variant="outline"
                               size="sm" 
                                onClick={() => handleDeleteStudent(student.id)}
                                className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-all"
                              >
                                Delete
                              </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <ReportTemplate 
          title="Student Directory"
          subtitle={filterClass === 'all' ? "Institutional Master List" : `Class List: ${classes.find(c => c.id === filterClass)?.name} ${classes.find(c => c.id === filterClass)?.section}`}
          docRef={`STU-${filterClass.substring(0,3).toUpperCase()}-${new Date().getTime().toString().slice(-6)}`}
        >
          <div className="space-y-6 py-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex justify-between items-center">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Total Students</h4>
              <span className="text-xl font-bold text-slate-900 dark:text-white">{filteredStudents.length}</span>
            </div>

            <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-5 py-3 text-left lms-table-header uppercase text-[10px]">Student Name / ID</th>
                    <th className="px-5 py-3 text-left lms-table-header uppercase text-[10px]">Class</th>
                    <th className="px-5 py-3 text-right lms-table-header uppercase text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-sm font-medium">
                  {filteredStudents.map(student => (
                    <tr key={student.id}>
                      <td className="px-5 py-3">
                         <div className="font-semibold text-slate-900 dark:text-white uppercase">{student.name}</div>
                         <div className="text-[10px] text-slate-400">{student.schoolId}</div>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                        {classes.find(c => c.id === student.classId)?.name} {classes.find(c => c.id === student.classId)?.section || 'N/A'}
                      </td>
                       <td className="px-5 py-3 text-right">
                          <span className={cn(
                            "lms-badge",
                            student.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          )}>
                            {student.status}
                          </span>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ReportTemplate>
      )}

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-premium w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200/50 dark:border-slate-800/50 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{editingStudent ? 'Modify Institutional Record' : 'Initialize Student Account'}</h2>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingStudent(null); }} 
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateStudent} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Legal Name *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="form-input" placeholder="e.g. Ahmad Ali" />
                </div>
                
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Institutional Email *</label>
                   <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="form-input" placeholder="student@bls.edu.pk" />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Primary Contact *</label>
                   <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="form-input" placeholder="+92 ..." />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Account Password</label>
                   <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Default: welcome123" className="form-input" />
                </div>

                <div className="md:col-span-2 space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Residential Address</label>
                   <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="form-input" placeholder="House #, Street, City" />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Academic Unit Assignment *</label>
                  <select required value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} className="form-select font-bold text-xs uppercase tracking-widest">
                    <option value="">Select Target Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Guardian / Parental Meta</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Guardian Name</label>
                        <input type="text" value={parentData.name} onChange={e => setParentData({...parentData, name: e.target.value})} className="form-input bg-white dark:bg-slate-950" placeholder="Full Name" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Guardian Phone</label>
                        <input type="text" value={parentData.phone} onChange={e => setParentData({...parentData, phone: e.target.value})} className="form-input bg-white dark:bg-slate-950" placeholder="+92-..." />
                     </div>
                     <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Guardian Email (Optional)</label>
                        <input type="email" value={parentData.email} onChange={e => setParentData({...parentData, email: e.target.value})} className="form-input bg-white dark:bg-slate-950" placeholder="guardian@example.com" />
                     </div>
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 italic">Automated synchronization will create a linked Parental Instance upon submission.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 border-t border-slate-50 dark:border-slate-800">
                <Button type="button" variant="outline" className="h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest" onClick={() => { setIsModalOpen(false); setEditingStudent(null); }}>Cancel</Button>
                <Button type="submit" className="h-12 px-10 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-[0.15em] shadow-soft hover:scale-[1.02] transition-all">
                  {editingStudent ? 'Update Account' : 'Initialize Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
