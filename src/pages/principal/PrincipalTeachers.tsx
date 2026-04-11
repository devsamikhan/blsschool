import { useEffect, useState } from 'react';
import { User, TeacherClass, Class, UserRole } from '../../types';
import { getAllUsers, getAllTeacherClasses, getAllClasses, assignTeacherToClass } from '../../lib/api';
import { createUserWithRelations, updateUserWithRelations, deleteUserWithRelations } from '../../lib/DataManager';
import { Search, Mail, Phone, BookOpen, Clock, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { EVENTS } from '../../lib/events';
import { cn } from '../../lib/utils';

const SUBJECTS = ['Math', 'English', 'Urdu', 'Science', 'Islamiat', 'Computer', 'Social Studies', 'Art'];

export function PrincipalTeachers() {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<TeacherClass[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '', role: 'teacher', email: '', phone: '', address: '', classId: '', subjects: [], status: 'active', password: ''
  });
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);


  const fetchData = async () => {
    try {
      const [u, a, c] = await Promise.all([
        getAllUsers(),
        getAllTeacherClasses(),
        getAllClasses()
      ]);
      setTeachers(u.filter(user => user.role === 'teacher'));
      setAssignments(a);
      setClasses(c);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await updateUserWithRelations(editingTeacher.id, {
          name: formData.name || '',
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          subjects: formData.subjects || [],
          newClassId: formData.classId,
          oldClassId: editingTeacher.classId
        });
        toast.success('Teacher record updated');
      } else {
        const savedUser = await createUserWithRelations({
          name: formData.name || '',
          role: 'teacher',
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          subjects: formData.subjects || [],
          password: formData.password || 'welcome123'
        });
        if (!savedUser) throw new Error('Failed to create user record — check connection.');
        
        if (formData.classId && formData.subjects && formData.subjects.length > 0) {
          try {
            await assignTeacherToClass({
              teacherId: savedUser.id,
              classId: formData.classId,
              subject: formData.subjects[0] // Primary subject
            });
          } catch (e) {
            console.warn('Teacher created but class assignment failed:', e);
            toast.warning('Teacher record created, but initial class assignment failed. Please assign manually.');
          }
        }
        toast.success('Teacher created successfully');
      }

      setIsModalOpen(false);
      setEditingTeacher(null);
      fetchData();
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Creation Error:', err);
      toast.error(`Operation Failed: ${err.message || 'Unknown Error'}`);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher profile? All class assignments will be removed.')) return;
    try {
      await deleteUserWithRelations(id);
      toast.success('Teacher record deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete teacher');
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.schoolId.toLowerCase().includes(search.toLowerCase()) ||
    t.subjects?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="lms-page-title">Teachers Directory</h1>
          <p className="lms-body mt-1">Manage teaching staff and academic assignments.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Add Teacher
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 mb-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, ID or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input w-full pl-12 h-11"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => {
            const tAssignments = assignments.filter(a => a.teacherId === teacher.id);
            return (
              <div key={teacher.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col dark:bg-slate-900 dark:border-slate-800">
                <div className="p-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30 dark:border-slate-800/50">
                  <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl font-bold border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 shadow-sm">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{teacher.name}</h3>
                    <p className="lms-meta text-[11px]">{teacher.schoolId}</p>
                    <span className={cn(
                      "lms-badge mt-1 text-[10px]",
                      teacher.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                    )}>
                      {teacher.status}
                    </span>
                  </div>
                  <div className="ml-auto flex flex-col gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setEditingTeacher(teacher);
                        setFormData({
                          name: teacher.name,
                          email: teacher.email,
                          phone: teacher.phone,
                          address: teacher.address,
                          subjects: teacher.subjects || [],
                          classId: teacher.classId || '',
                        });
                        setIsModalOpen(true);
                      }}
                      className="h-8 text-[11px] font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteTeacher(teacher.id)}
                      className="h-8 text-[11px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="p-6 flex-1 space-y-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-slate-300">
                     <Mail className="h-4 w-4 mr-3 text-gray-400" />
                     {teacher.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-slate-300">
                     <Phone className="h-4 w-4 mr-3 text-gray-400" />
                     {teacher.phone}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                     <p className="lms-stat-label mb-2">Teaching Subjects</p>
                     <div className="flex flex-wrap gap-2">
                       {teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects.map(s => (
                         <span key={s} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded dark:bg-slate-800 dark:text-slate-300">{s}</span>
                       )) : <span className="text-xs text-gray-400 italic">No specified subjects</span>}
                     </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-4">
                    <div>
                      <p className="lms-stat-label mb-1">Review Speed</p>
                      <p className="text-sm font-semibold text-emerald-600 flex items-center"><Clock className="w-3 h-3 mr-1"/> ~24 hrs</p>
                    </div>
                    <div>
                      <p className="lms-stat-label mb-1">Success Rate</p>
                      <p className="text-sm font-semibold text-blue-600">92%</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                     <p className="lms-stat-label mb-2 flex items-center">
                       <BookOpen className="h-3 w-3 mr-1" /> Assigned Classes ({tAssignments.length})
                     </p>
                      <div className="space-y-1.5">
                        {tAssignments.slice(0, 3).map(a => {
                          const cls = classes.find(c => c.id === a.classId);
                          return (
                            <p key={a.id} className="text-[13px] text-slate-600 dark:text-slate-400">
                              <span className="font-semibold text-slate-900 dark:text-white">{cls?.name} {cls?.section}</span> - {a.subject}
                            </p>
                          );
                        })}
                       {tAssignments.length > 3 && (
                         <p className="text-xs text-blue-600 mt-1 font-medium">+{tAssignments.length - 3} more classes</p>
                       )}
                       {tAssignments.length === 0 && <span className="text-xs text-slate-400 italic">No assigned classes</span>}
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredTeachers.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300 dark:text-slate-400 dark:bg-slate-900">
              No teachers found.
            </div>
          )}
        </div>
      )}

      {/* Add Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-900">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingTeacher ? 'Modify Teacher Record' : 'Add New Teacher'}</h2>
              <button onClick={() => { setIsModalOpen(false); setEditingTeacher(null); }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleCreateTeacher} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="form-input" />
                </div>
                
                <div>
                   <label className="form-label">Email *</label>
                   <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="form-input" />
                </div>

                <div>
                   <label className="form-label">Phone *</label>
                   <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="form-input" />
                </div>

                <div className="">
                   <label className="form-label">Internal Password (Optional)</label>
                   <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="welcome123" className="form-input" />
                </div>

                <div className="md:col-span-2">
                   <label className="form-label">Address</label>
                   <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="form-input" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-200">Teacher Subjects</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SUBJECTS.map(sub => (
                      <label key={sub} className="flex items-center space-x-2 text-sm">
                        <input 
                          type="checkbox" 
                          checked={formData.subjects?.includes(sub) || false}
                          onChange={(e) => {
                            const curr = formData.subjects || [];
                            setFormData({
                              ...formData, 
                              subjects: e.target.checked ? [...curr, sub] : curr.filter(s => s !== sub)
                            });
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                        />
                        <span>{sub}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="form-label">Assign Initial Class (Optional)</label>
                  <select 
                    value={formData.classId} 
                    onChange={e => setFormData({...formData, classId: e.target.value})} 
                    className="form-select"
                  >
                    <option value="">None - Assign later</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" className="rounded-xl px-6" onClick={() => { setIsModalOpen(false); setEditingTeacher(null); }}>Cancel</Button>
                <Button type="submit" className="bg-slate-900 text-white rounded-xl px-8 font-semibold">{editingTeacher ? 'Update Teacher' : 'Save Teacher'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
