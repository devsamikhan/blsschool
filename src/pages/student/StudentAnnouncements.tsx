import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { Announcement } from '../../types';
import { getAllAnnouncements } from '../../lib/api';
import { Megaphone, AlertTriangle, Calendar, FileText, Sparkles } from 'lucide-react';
import { EVENTS, useEventListener } from '../../lib/events';
import { Card } from '../../components/ui/card';
import { cn } from '../../lib/utils';

export function StudentAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user || user.role !== 'student' || !user.classId) return;
    setIsLoading(true);
    try {
      const allAnnouncements = await getAllAnnouncements();
      const relevant = allAnnouncements.filter(ann => 
        ann.targetRoles.includes('all') || 
        ann.targetRoles.includes('student') ||
        ann.targetClasses.includes(user.classId!)
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setAnnouncements(relevant);
    } catch (error) {
      console.error('Failed to load announcements', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEventListener(EVENTS.ANNOUNCEMENT_CHANGE, fetchData);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Cinematic Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">
                Institutional Intel
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">
              Notice Board.
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
              Reviewing the latest global and academic dispatches.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 animate-pulse">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <Card className="text-center py-24 bg-white/50 border-2 border-dashed border-slate-100 rounded-3xl shadow-none dark:border-slate-800">
             <Megaphone className="h-16 w-16 text-slate-200 mx-auto mb-6 opacity-40" />
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Signal Clear: No Active Broadcasts.</h3>
          </Card>
        ) : (
          announcements.map((ann) => {
            const isUrgent = ann.type === 'urgent';
            return (
              <Card key={ann.id} className={cn(
                "group relative bg-white dark:bg-slate-900 rounded-2xl border-2 transition-all hover:scale-[1.01] hover:shadow-2xl overflow-hidden p-8",
                isUrgent ? 'border-rose-100 bg-rose-50/20' : 'border-slate-50 hover:border-indigo-100'
              )}>
                {isUrgent && (
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <AlertTriangle className="w-24 h-24 text-rose-600" />
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                  <div className={cn(
                    "p-5 rounded-3xl shadow-lg transition-transform group-hover:rotate-6",
                    isUrgent ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-slate-900 text-white'
                  )}>
                    {isUrgent ? <AlertTriangle className="h-8 w-8" /> : ann.type === 'event' ? <Calendar className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        isUrgent ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                      )}>
                        {ann.type} Protocol
                      </span>
                      {isUrgent && <span className="flex items-center gap-1.5 text-rose-600 text-[10px] font-black uppercase tracking-widest animate-pulse"><ShieldAlert className="h-3 w-3"/> Urgent Dispatch</span>}
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight group-hover:text-indigo-600 transition-colors mb-2">{ann.title}</h3>
                    
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-widest italic mt-1 pb-6 border-b border-slate-50 dark:border-slate-800/50">
                      <span className="text-slate-900 dark:text-slate-200">{ann.createdByName}</span>
                      <span className="text-slate-200 dark:text-slate-700">|</span>
                      <Calendar className="h-3 w-3" /> {new Date(ann.createdAt).toLocaleDateString()}
                    </div>
                    
                    <div className="text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic mt-6 whitespace-pre-wrap">
                      {ann.message}
                    </div>

                    <div className="mt-8 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2 italic">
                         Verified Protocol <Sparkles className="h-3 w-3" />
                       </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

// Simple Helper for local context
function ShieldAlert({ className }: { className?: string }) {
  return <AlertTriangle className={className} />;
}
