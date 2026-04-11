import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { Homework, Submission } from '@/types';
import { getHomeworkByClass, getSubmissionsByStudent } from '@/lib/api';
import { EVENTS, useEventListener } from '@/lib/events';
import {
  BookOpen, Calendar, CheckCircle, Clock, AlertTriangle,
  LayoutGrid, LayoutList, GripVertical, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

type HwWithStatus = Homework & { submission?: Submission; isOverdue: boolean };

function getStatusBadge(hw: HwWithStatus) {
  if (hw.submission?.status === 'checked')  return { label: 'Graded', icon: CheckCircle, cls: 'bg-emerald-500 text-white shadow-emerald-500/20' };
  if (hw.submission?.status === 'returned') return { label: 'Returned', icon: AlertTriangle, cls: 'bg-rose-500 text-white shadow-rose-500/20' };
  if (hw.submission?.status === 'pending')  return { label: 'Submitted', icon: Clock, cls: 'bg-blue-500 text-white shadow-blue-500/20' };
  if (hw.isOverdue)                         return { label: 'Overdue', icon: AlertTriangle, cls: 'bg-rose-600 text-white animate-pulse' };
  return { label: 'To Do', icon: Clock, cls: 'bg-amber-400 text-white shadow-amber-400/20' };
}

function HomeworkCard({ hw, onClick, draggable }: { hw: HwWithStatus; onClick: () => void; draggable?: boolean }) {
  const badge = getStatusBadge(hw);
  const Icon = badge.icon;
  return (
    <div
      onClick={onClick}
      draggable={draggable}
      className={cn(
        "group relative border-2 rounded-[2rem] p-6 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl bg-white dark:bg-slate-900",
        hw.isOverdue && !hw.submission ? "border-rose-100" : "border-slate-50",
        "hover:border-purple-200"
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <span className={cn("inline-flex items-center gap-2 text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-lg", badge.cls)}>
          <Icon className="h-3 w-3" /> {badge.label}
        </span>
        {hw.submission?.status === 'checked' && (
          <div className="text-right">
             <span className="font-black text-slate-900 dark:text-white text-lg italic tracking-tighter">
               {hw.submission.marks}
             </span>
             <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest italic ml-1">/ {hw.totalMarks}</span>
          </div>
        )}
      </div>
      
      <h3 className="font-black text-slate-900 dark:text-white text-xl mb-2 line-clamp-2 italic tracking-tight group-hover:text-purple-600 transition-colors uppercase leading-tight">
        {hw.title}
      </h3>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6 italic">
        {hw.subject} • {hw.teacherName}
      </p>

      <div className={cn("flex items-center text-[10px] font-black uppercase tracking-widest pt-5 border-t border-slate-50 dark:border-slate-800 italic space-x-2",
        hw.isOverdue && !hw.submission ? 'text-rose-600' : 'text-slate-400')}>
        <Calendar className="h-3.5 w-3.5" />
        <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function KanbanColumn({ title, color, items, onCardClick }: {
  title: string; color: string; items: HwWithStatus[]; onCardClick: (id: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); }}
      className={cn(
        "flex flex-col rounded-2xl border-2 transition-all min-h-[500px]",
        dragOver
          ? "border-purple-400 bg-purple-50/10"
          : "border-slate-100 bg-slate-50/30 dark:bg-slate-950/20 dark:border-slate-800"
      )}
    >
      <div className="p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className={cn("w-3 h-3 rounded-full shadow-lg", color)} />
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] italic">{title}</h3>
        </div>
        <span className="bg-slate-900 text-white text-[10px] px-3 py-1 rounded-full font-black tracking-widest">{items.length}</span>
      </div>
      <div className="p-6 flex flex-col gap-6 flex-1 max-h-[700px] overflow-y-auto custom-scrollbar">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 space-y-4">
            <Sparkles className="h-10 w-10 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest italic text-center">Protocol Empty</p>
          </div>
        ) : (
          items.map(hw => (
            <div key={hw.id} draggable className="group/drag relative">
              <GripVertical className="absolute -left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 dark:text-slate-700 opacity-0 group-hover/drag:opacity-100 transition-opacity cursor-grab" />
              <HomeworkCard hw={hw} onClick={() => onCardClick(hw.id)} draggable />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function StudentHomeworkList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'kanban'>('kanban');
  const [activeTab, setActiveTab] = useState<'pending' | 'submitted' | 'checked'>('pending');

  const fetchData = useCallback(async () => {
    if (!user || user.role !== 'student' || !user.classId) return;
    setIsLoading(true);
    try {
      const [h, s] = await Promise.all([
        getHomeworkByClass(user.classId),
        getSubmissionsByStudent(user.id)
      ]);
      setHomeworks(h);
      setSubmissions(s);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  useEventListener(EVENTS.HOMEWORK_CHANGE, fetchData);
  useEventListener(EVENTS.SUBMISSION_CHANGE, fetchData);

  if (isLoading) return (
    <div className="flex items-center justify-center py-24 animate-pulse">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const hwsWithStatus: HwWithStatus[] = homeworks.map(hw => {
    const sub = submissions.find(s => s.homeworkId === hw.id);
    const isOverdue = new Date(hw.dueDate).getTime() < new Date().setHours(0,0,0,0);
    return { ...hw, submission: sub, isOverdue };
  });

  const pending   = hwsWithStatus.filter(h => h.status === 'active' && !h.submission).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const submitted = hwsWithStatus.filter(h => h.submission?.status === 'pending');
  const checked   = hwsWithStatus.filter(h => h.submission && (h.submission.status === 'checked' || h.submission.status === 'returned'));

  const tabs = [
    { id: 'pending' as const, label: 'Execution', count: pending.length, color: 'text-amber-500 border-amber-500', badgeCls: 'bg-amber-500 text-white' },
    { id: 'submitted' as const, label: 'Deployment', count: submitted.length, color: 'text-blue-500 border-blue-500', badgeCls: 'bg-blue-500 text-white' },
    { id: 'checked' as const, label: 'Certification', count: checked.length, color: 'text-emerald-500 border-emerald-500', badgeCls: 'bg-emerald-500 text-white' },
  ];

  const currentList = activeTab === 'pending' ? pending : activeTab === 'submitted' ? submitted : checked;

  const kanbanColumns = [
    { title: 'Protocol Base', color: 'bg-amber-400', items: pending },
    { title: 'Validation', color: 'bg-blue-500', items: submitted },
    { title: 'Certified', color: 'bg-emerald-500', items: checked },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-500/20">
                Mission Ledger
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">
              Academic Hub.
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
              Tracking, executing, and validating institutional assignments.
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex p-2 gap-2 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] border border-slate-100 dark:border-slate-700 shadow-inner">
            <button
              onClick={() => setView('list')}
              className={cn("flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic",
                view === 'list'
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                  : "text-slate-400 hover:text-slate-900 dark:hover:text-white")}
            >
              <LayoutList className="h-4 w-4" /> Terminal
            </button>
            <button
              onClick={() => setView('kanban')}
              className={cn("flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic",
                view === 'kanban'
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                  : "text-slate-400 hover:text-slate-900 dark:hover:text-white")}
            >
              <LayoutGrid className="h-4 w-4" /> Operations
            </button>
          </div>
        </div>
      </div>

      {/* ─── KANBAN BOARD (Operations) ─── */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {kanbanColumns.map(col => (
            <KanbanColumn key={col.title} title={col.title} color={col.color} items={col.items} onCardClick={id => navigate(`/student/homework/${id}`)} />
          ))}
        </div>
      )}

      {/* ─── LIST VIEW (Terminal) ─── */}
      {view === 'list' && (
        <Card className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border-none overflow-hidden animate-in fade-in duration-500">
          <div className="flex border-b border-slate-50 dark:border-slate-800 overflow-x-auto bg-slate-50/50 dark:bg-slate-800/50 px-4">
            {tabs.map(tab => (
              <button key={tab.id}
                className={cn("px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] italic flex items-center gap-3 border-b-[3px] transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? `${tab.color} bg-white dark:bg-slate-900`
                    : "border-transparent text-slate-400 hover:text-slate-900 hover:bg-white/50"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                <span className={cn("px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-sm", activeTab === tab.id ? tab.badgeCls : 'bg-slate-200 dark:bg-slate-700 text-slate-500')}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="p-10">
            {currentList.length === 0 ? (
              <div className="text-center py-24 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 opacity-30">
                  <BookOpen className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">No Active Missions in this Sector.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {currentList.map(hw => <HomeworkCard key={hw.id} hw={hw} onClick={() => navigate(`/student/homework/${hw.id}`)} />)}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
