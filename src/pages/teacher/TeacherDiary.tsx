import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { Class, User } from '../../types';
import { getAllClasses, getAllUsers } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Calendar, 
  Send, 
  History, 
  Layout, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

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

export function TeacherDiary() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [selectedClass, setSelectedClass] = useState('');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const [c, dResponse] = await Promise.all([
        getAllClasses(),
        fetch(`${baseUrl}/diaries?teacherId=${user?.id}`).then(res => res.json())
      ]);
      setClasses(c);
      setDiaries(Array.isArray(dResponse) ? dResponse : []);
    } catch (error) {
      toast.error('Failed to sync diary cloud');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !subject || !content) {
      toast.error('Please complete the mandatory archival fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/diaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || `Daily Log: ${subject}`,
          subject,
          content,
          classId: selectedClass,
          teacherId: user?.id,
          teacherName: user?.name,
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        toast.success(
          <div className="flex flex-col">
            <span className="font-bold uppercase tracking-tight">Diary Published!</span>
            <span className="text-xs opacity-80 mt-1 italic">Automated parent notification sequence initiated.</span>
          </div>
        );
        setTitle('');
        setSubject('');
        setContent('');
        fetchData();
      } else {
        throw new Error('Broadcast failure');
      }
    } catch (error) {
      toast.error('Failed to publish diary entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/20">
              Academic Log
            </span>
          </div>
          <h1 className="lms-page-title">Digital Class Diary</h1>
          <p className="lms-body mt-1 font-medium italic">Record daily classroom milestones and notify parents instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* NEW ENTRY FORM */}
        <div className="lg:col-span-2">
          <Card className="p-8 rounded-[2rem] border-slate-200/60 dark:border-slate-800/60 shadow-premium bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                   <Layout className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Create Post.</h2>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Academic Unit (Class) *</label>
                      <select 
                        required
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="form-select h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs"
                      >
                        <option value="">Select Target Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name} — {c.section}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subject Area *</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Mathematics, English"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="form-input h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Entry Title (Optional)</label>
                   <input 
                      type="text" 
                      placeholder="e.g. Chapter 4 Multiplication Introduction"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="form-input h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Diary Content (Homework/Summary) *</label>
                   <textarea 
                      required
                      placeholder="Detail what was taught today and what is assigned for home..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={6}
                      className="form-input bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-2xl font-medium text-sm leading-relaxed"
                   />
                </div>

                <div className="pt-4 flex flex-col md:flex-row gap-4">
                   <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest italic text-sm group transition-all"
                   >
                      {isSubmitting ? 'Transmitting Data...' : (
                        <div className="flex items-center gap-3">
                           <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                           Post & Notify Parents
                        </div>
                      )}
                   </Button>
                   <div className="bg-slate-100 dark:bg-slate-800 px-6 h-14 rounded-2xl flex items-center gap-3 border border-slate-200 dark:border-slate-700">
                      <History className="h-4 w-4 text-slate-400" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Automatic Archiving Active</span>
                   </div>
                </div>
             </form>
          </Card>
        </div>

        {/* RECENT ENTRIES SIDEBAR */}
        <div>
          <div className="flex items-center gap-3 mb-6 px-1">
             <History className="h-5 w-5 text-slate-400" />
             <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Recent Logs.</h2>
          </div>
          
          <div className="space-y-4">
             {isLoading ? (
               <div className="p-12 text-center lms-body animate-pulse">Scanning Cloud...</div>
             ) : diaries.length === 0 ? (
               <div className="p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                  <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No entries recorded in current session.</p>
               </div>
             ) : (
               diaries.slice(0, 5).map((entry) => (
                 <Card key={entry.id} className="p-6 rounded-2xl border-slate-100 dark:border-slate-800 hover:border-emerald-200 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                       <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-lg">{entry.subject}</span>
                       <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{entry.title}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{entry.content}</p>
                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                       <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          Sent to Parents
                       </div>
                    </div>
                 </Card>
               ))
             )}
          </div>

          <div className="mt-8 p-6 rounded-3xl bg-indigo-600 shadow-xl shadow-indigo-600/20 relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer">
              <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/10 group-hover:rotate-12 transition-transform" />
              <h4 className="text-white font-black text-lg truncate tracking-tight uppercase italic relative z-10">Institutional Standard</h4>
              <p className="text-indigo-100 text-[9px] font-bold uppercase tracking-widest mt-1 relative z-10">Maintaining academic transparency through digital logs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
