import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Class, User } from '../../types';
import { getAllClasses, getAllUsers, createClass } from '../../lib/api';
import { Search, Users, BookOpen, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { useEventListener, EVENTS } from '../../lib/events';

export function PrincipalClasses() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Class>>({
    name: '', section: '', maxStudents: 40
  });

  // ─── POWERFUL DATA FETCHING ───
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: getAllClasses
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers
  });

  const teachers = users.filter(user => user.role === 'teacher');
  const isLoading = classesLoading || usersLoading;

  // ─── REAL-TIME SYNC BRIDGE ───
  // Listen for the socket-driven custom event to invalidate the query
  useEventListener(EVENTS.CLASS_CHANGE, () => {
    console.log('[Real-time] Invalidating class registry...');
    queryClient.invalidateQueries({ queryKey: ['classes'] });
  });

  // ─── MUTATIONS ───
  const createMutation = useMutation({
    mutationFn: (payload: Omit<Class, 'id'>) => createClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class successfully registered in institutional ledger.');
      setIsModalOpen(false);
      setFormData({ name: '', section: '', maxStudents: 40 });
    },
    onError: () => toast.error('Failed to register class entry.')
  });

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name || '',
      section: formData.section || '',
      maxStudents: formData.maxStudents || 40,
      studentIds: [],
      createdAt: new Date().toISOString()
    });
  };

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.section.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="lms-page-title">Academic Classes</h1>
          <p className="lms-body mt-1">Institutional class registry and enrollment analytics.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 h-12 px-8 rounded-xl font-bold bg-slate-900 text-white shadow-soft hover:scale-[1.02] transition-all">
          <Plus className="h-4.5 w-4.5" /> Add Class
        </Button>
      </div>

      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-soft">
        <div className="relative max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search class registry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-12 h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredClasses.map((cls) => {
            const studentCount = users.filter(u => u.role === 'student' && u.classId === cls.id).length;
            const progressPercentage = Math.min(100, Math.round((studentCount / cls.maxStudents) * 100));
            return (
              <div key={cls.id} className="bg-white rounded-[2rem] shadow-soft border border-slate-100/50 overflow-hidden hover:shadow-premium transition-all duration-300 dark:bg-slate-900 dark:border-slate-800/50 group">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-600 transition-colors">Class {cls.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">UNIT — {cls.section}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                       <Users className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">
                         Capacity Metric
                      </div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{studentCount} / {cls.maxStudents}</span>
                    </div>
                    
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                       <div 
                         className={cn(
                           "h-2 rounded-full transition-all duration-700",
                           progressPercentage >= 90 ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]' : 
                           progressPercentage >= 75 ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]' : 
                           'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                         )}
                         style={{ width: `${progressPercentage}%` }}
                       ></div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                     <Button variant="outline" className="w-full font-bold h-12 rounded-xl text-xs uppercase tracking-widest border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800" asChild>
                       <Link to={`/principal/students?classId=${cls.id}`}>Inspection Log</Link>
                     </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-premium w-full max-w-md border border-slate-200/50 dark:border-slate-800/50 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Institutional Unit Creation</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleCreateClass} className="p-6 space-y-5">
              <div>
                <label className="form-label">Class Name (e.g. Nursery, 1, 10) *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="form-input" placeholder="e.g. 5" />
              </div>
              
              <div>
                <label className="form-label">Section Name *</label>
                <input required type="text" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="form-input" placeholder="e.g. Blue" />
              </div>
 
              <div>
                <label className="form-label">Maximum Students</label>
                <input type="number" value={formData.maxStudents} onChange={e => setFormData({...formData, maxStudents: parseInt(e.target.value)})} className="form-input" />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-50 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6">Cancel</Button>
                <Button type="submit" className="bg-slate-900 text-white rounded-xl px-6 font-semibold">Create Class</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
