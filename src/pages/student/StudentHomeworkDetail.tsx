import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { Homework, Submission } from '@/types';
import { getHomeworkById, getSubmissionsByStudent, createSubmission, updateSubmission } from '@/lib/api';
import { EVENTS, useEventListener } from '@/lib/events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Clock, CheckCircle, FileText, AlertTriangle, Send, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export function StudentHomeworkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [homework, setHomework] = useState<Homework | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Submission Form State
  const [submissionText, setSubmissionText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id || !user) return;
    setIsLoading(true);
    try {
      const hw = await getHomeworkById(id);
      setHomework(hw);

      const allMySubs = await getSubmissionsByStudent(user.id);
      const mySub = allMySubs.find(s => s.homeworkId === id);
      setSubmission(mySub || null);

      if (mySub && mySub.status === 'returned') {
         setSubmissionText(mySub.submissionText || '');
         if (mySub.attachments?.length) setFileName(mySub.attachments[0]);
      }
    } catch (error) {
      toast.error('Failed to load homework details');
      navigate('/student/homework');
    } finally {
      setIsLoading(false);
    }
  }, [id, user, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEventListener(EVENTS.SUBMISSION_CHANGE, fetchData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !homework) return;

    if (!submissionText.trim() && !fileName) {
      toast.error('Please provide an answer or attach a file');
      return;
    }

    try {
      setIsSubmitting(true);
      const subData = {
        homeworkId: homework.id,
        studentId: user.id,
        studentName: user.name,
        submissionText,
        attachments: fileName ? [fileName] : [],
        submittedAt: new Date().toISOString(),
        status: 'pending' as const,
        marks: null,
        totalMarks: homework.totalMarks,
        feedback: '',
        checkedAt: '',
        checkedBy: ''
      };

      if (submission && submission.status === 'returned') {
        await updateSubmission(submission.id, subData);
        toast.success('Revision submitted successfully!');
      } else {
        const newSub = { ...subData, id: `${Date.now()}` }; 
        await createSubmission(newSub as Submission);
        toast.success('Homework submitted successfully!');
      }
    } catch (error) {
       toast.error('Failed to submit homework');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-24 animate-pulse">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!homework) return (
    <div className="text-center py-24">
       <AlertTriangle className="h-16 w-16 text-rose-500 mx-auto mb-4 opacity-20" />
       <p className="font-black text-slate-400 uppercase tracking-widest italic text-[10px]">Protocol Error: Record Not Found</p>
    </div>
  );

  const isOverdue = new Date(homework.dueDate).getTime() < new Date().setHours(0,0,0,0);
  const canSubmit = !submission || submission.status === 'returned';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Cinematic Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/student/homework')} className="rounded-2xl h-14 w-14 border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all dark:border-slate-800">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-500/20">
                  Academic Mission
                </span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">
                Execution Terminal.
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignment Information */}
        <Card className="lg:col-span-2 overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl">
          <div className="p-10 space-y-10">
             <div className="flex justify-between items-start gap-8">
               <div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight italic">{homework.title}</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-4 italic flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    {homework.subject} Protocol • Initiated by {homework.teacherName}
                  </p>
               </div>
               <div className="shrink-0">
                  <span className="inline-flex px-5 py-2 bg-slate-950 text-white font-black italic rounded-2xl text-lg shadow-xl shadow-slate-900/20 tracking-tighter">
                     {homework.totalMarks} Credits
                  </span>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-8 py-8 border-y border-slate-50 dark:border-slate-800">
               <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[1.8rem] border border-slate-100 dark:border-slate-800">
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 italic">Submission Deadline</p>
                 <p className={cn("text-xl font-black italic tracking-tight", isOverdue && !submission ? 'text-rose-500' : 'text-slate-900 dark:text-white')}>
                    {new Date(homework.dueDate).toLocaleDateString()}
                 </p>
               </div>
               <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[1.8rem] border border-slate-100 dark:border-slate-800">
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 italic">Activation Timestamp</p>
                 <p className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight">{new Date(homework.createdAt).toLocaleDateString()}</p>
               </div>
             </div>

             <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6 italic">Mission Directives</p>
                <div className="text-base text-slate-600 dark:text-slate-400 leading-relaxed italic whitespace-pre-wrap font-medium">
                  {homework.description}
                </div>
             </div>

             {homework.attachments && homework.attachments.length > 0 && (
                <div className="pt-8 border-t border-slate-50 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4 italic">Resource Assets</p>
                  <div className="flex flex-wrap gap-4">
                     {homework.attachments.map((file, idx) => {
                       const [name, data] = file.split('::');
                       return (
                         <a key={idx} href={data || '#'} download={data ? name : undefined} target="_blank" rel="noreferrer" className="flex items-center px-6 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-700 hover:shadow-lg transition-all text-sm font-black italic tracking-tight">
                            <FileText className="h-4 w-4 mr-3 text-purple-500" /> {name}
                         </a>
                       );
                     })}
                  </div>
                </div>
             )}
          </div>
        </Card>

        {/* Submission Panel */}
        <div className="space-y-8 lg:col-span-1">
           {/* Your Work Status */}
           <Card className={cn("p-8 rounded-2xl border-none shadow-xl transition-all",
             submission?.status === 'checked' ? 'bg-emerald-50 text-emerald-900 shadow-emerald-200/50' :
             submission?.status === 'returned' ? 'bg-rose-50 text-rose-900 shadow-rose-200/50' :
             submission?.status === 'pending' ? 'bg-blue-50 text-blue-900 shadow-blue-200/50' :
             isOverdue ? 'bg-rose-50 text-rose-900 dark:bg-rose-900/10 dark:text-rose-400' : 'bg-white dark:bg-slate-900'
           )}>
              <h3 className="text-xl font-black italic tracking-tight mb-8 uppercase flex items-center gap-3">
                 Execution Status.
                 {submission?.status === 'checked' && <ShieldCheck className="h-6 w-6 text-emerald-500" />}
              </h3>

              {!submission ? (
                 <div className="space-y-4">
                    <div className={cn("flex flex-col items-center justify-center p-10 rounded-3xl border-2 border-dashed", isOverdue ? 'border-rose-200 bg-rose-100/50' : 'border-slate-100 bg-slate-50/50')}>
                       {isOverdue ? <AlertTriangle className="h-10 w-10 text-rose-500 mb-4 animate-pulse" /> : <Clock className="h-10 w-10 text-slate-300 mb-4" />}
                       <p className="text-[10px] font-black uppercase tracking-widest italic">{isOverdue ? 'Protocol Overdue' : 'Awaiting Submission'}</p>
                    </div>
                 </div>
              ) : (
                 <div className="space-y-6">
                    {submission.status === 'pending' && (
                      <div className="p-6 rounded-[1.8rem] bg-white/40 border-2 border-white/50 backdrop-blur-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest italic mb-2">Cycle Logged</p>
                        <p className="font-black italic tracking-tight text-xl">Pending Evaluation</p>
                        <p className="text-[10px] font-bold mt-1 opacity-60 uppercase">{new Date(submission.submittedAt).toLocaleString()}</p>
                      </div>
                    )}

                    {submission.status === 'checked' && (
                      <>
                        <div className="p-8 rounded-[2rem] bg-white/60 border-2 border-white/80 shadow-lg shadow-emerald-500/10">
                          <p className="text-[10px] font-black uppercase tracking-widest italic mb-2 text-emerald-600">Performance Index</p>
                          <div className="flex items-baseline gap-2">
                             <span className="text-6xl font-black italic tracking-tighter text-emerald-700">{submission.marks}</span>
                             <span className="text-xl font-black text-emerald-300 italic tracking-tighter">/ {homework.totalMarks}</span>
                          </div>
                        </div>
                        {submission.feedback && (
                          <div className="p-6 bg-emerald-100/50 rounded-[1.8rem] border border-emerald-200 mt-4 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-5"><Sparkles className="h-12 w-12" /></div>
                             <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 italic">Faculty Logic</p>
                             <p className="text-sm font-medium italic text-emerald-800 leading-relaxed">"{submission.feedback}"</p>
                          </div>
                        )}
                      </>
                    )}

                    {submission.status === 'returned' && (
                      <>
                        <div className="p-6 rounded-[1.8rem] bg-rose-500 text-white shadow-xl shadow-rose-500/30">
                          <div className="flex items-start gap-4">
                             <AlertTriangle className="h-6 w-6 mt-1" />
                             <div>
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic mb-1">Correction Required</p>
                               <p className="font-black italic tracking-tight text-xl leading-tight">Returned for Revision</p>
                             </div>
                          </div>
                          {submission.feedback && <p className="text-sm italic mt-4 font-medium border-l-2 border-white/30 pl-4 py-2 bg-white/5 rounded-r-lg leading-relaxed">"{submission.feedback}"</p>}
                        </div>
                      </>
                    )}
                 </div>
              )}
           </Card>

           {/* Submission Form */}
           {canSubmit && (
             <Card className="p-8 rounded-2xl border-none shadow-2xl shadow-slate-900/10 bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-500">
                <form onSubmit={handleSubmit} className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block italic">Intelligence Input</label>
                      <Textarea 
                        rows={8} 
                        value={submissionText} 
                        onChange={e => setSubmissionText(e.target.value)} 
                        placeholder="Log your academic response here..."
                        className="focus:ring-emerald-500/10" 
                      />
                   </div>

                   <div className="relative group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block italic">Binary Attachments</label>
                      <div className="h-24 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex items-center justify-center cursor-pointer group-hover:bg-purple-50 group-hover:border-purple-200 transition-all relative overflow-hidden">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFileName(`${file.name}::${reader.result}`);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            setFileName('');
                          }
                        }} />
                        <div className="text-center">
                           <FileText className="h-6 w-6 text-slate-300 mx-auto group-hover:text-emerald-500 transition-colors" />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Binary Upload</p>
                        </div>
                      </div>
                      {fileName && <p className="mt-3 text-xs text-emerald-600 font-bold italic truncate px-2">✓ {fileName.split('::')[0]}</p>}
                   </div>

                   <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-3xl bg-slate-950 hover:bg-purple-600 text-white font-black uppercase tracking-[0.3em] italic text-sm shadow-2xl shadow-slate-900/20 active:scale-95 transition-all group overflow-hidden relative">
                     {isSubmitting ? (
                       <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                       <div className="flex items-center justify-center gap-3">
                         {submission?.status === 'returned' ? 'Authorize Revision' : 'Commit Submission'}
                         <Send className="h-5 w-5 group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" />
                       </div>
                     )}
                   </Button>
                </form>
             </Card>
           )}
        </div>
      </div>
    </div>
  );
}
