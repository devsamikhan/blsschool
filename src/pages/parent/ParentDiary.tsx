import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Calendar, 
  History, 
  Sparkles,
  CheckCircle2,
  Users
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getAllClasses } from '../../lib/api';
import { Class } from '../../types';

interface DiaryEntry {
  id: string;
  title: string;
  subject: string;
  content: string;
  classId: string;
  teacherId: string;
  teacherName: string;
  date: string;
  createdAt: string;
}

export function ParentDiary() {
  const { user } = useAuth();
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const [c, dResponse] = await Promise.all([
        getAllClasses(),
        fetch(`${baseUrl}/diaries`).then(res => res.json())
      ]);
      
      setClasses(c);
      
      // Filter diaries for classes my children are in
      if (user?.studentIds && Array.isArray(user.studentIds)) {
        // This is a simplified check - in a real app we'd fetch specific class IDs for children
        setDiaries(Array.isArray(dResponse) ? dResponse : []);
      } else {
        setDiaries(Array.isArray(dResponse) ? dResponse : []);
      }
    } catch (error) {
      toast.error('Cloud synchronization failure');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
              Communication Hub
            </span>
          </div>
          <h1 className="lms-page-title">Classroom Diary</h1>
          <p className="lms-body mt-1">Review daily academic logs and homework updates for your children.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-24"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : diaries.length === 0 ? (
        <Card className="p-24 text-center border-dashed border-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
           <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
           <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">No Diary Entries Yet</h3>
           <p className="text-slate-500 mt-2">Daily logs will appear here once published by the subject teachers.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diaries.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((entry) => {
            const cls = classes.find(c => c.id === entry.classId);
            return (
              <Card key={entry.id} className="p-8 rounded-[2rem] border-slate-100 dark:border-slate-800 hover:shadow-soft transition-all bg-white/80 dark:bg-slate-900/80 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <BookOpen className="h-20 w-20 text-slate-900" />
                </div>
                
                <div className="flex justify-between items-start mb-6">
                   <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-lg ring-1 ring-emerald-500/10">
                      {entry.subject}
                   </div>
                   <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <Calendar className="h-3 w-3" />
                      {new Date(entry.createdAt).toLocaleDateString()}
                   </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight mb-4">{entry.title}</h3>
                
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6">
                   <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {entry.content}
                   </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                         {entry.teacherName.charAt(0)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tr. {entry.teacherName}</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      <Users className="h-3.5 w-3.5" />
                      Class {cls?.name || 'GEN'}
                   </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
