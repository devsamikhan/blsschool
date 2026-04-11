import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { Homework, Submission, Class, User } from '../../types';
import { getHomeworkById, getSubmissionsByHomework, getAllClasses, getAllUsers } from '../../lib/api';
import { checkSubmission } from '../../lib/DataManager';
import { EVENTS, useEventListener } from '../../lib/events';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, CheckCircle, Clock, XCircle, FileText, Download, Award, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function TeacherHomeworkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [homework, setHomework] = useState<Homework | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [cls, setCls] = useState<Class | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Checking Modal State
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [marks, setMarks] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<'checked' | 'returned'>('checked');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id || !user) return;
    setIsLoading(true);
    try {
      const hw = await getHomeworkById(id);
      if (hw.createdBy !== user.id) {
        toast.error('You do not have permission to view this homework');
        navigate('/teacher/homework');
        return;
      }
      setHomework(hw);

      const [subs, allClasses, allUsers] = await Promise.all([
        getSubmissionsByHomework(id),
        getAllClasses(),
        getAllUsers()
      ]);

      const c = allClasses.find(x => x.id === hw.classId);
      setCls(c || null);
      
      const classStudents = allUsers.filter(u => u.role === 'student' && u.classId === c?.id);
      setStudents(classStudents);
      setSubmissions(subs);
    } catch (error) {
      toast.error('Failed to load homework details');
      navigate('/teacher/homework');
    } finally {
      setIsLoading(false);
    }
  }, [id, user, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEventListener(EVENTS.SUBMISSION_CHANGE, fetchData);

  const openCheckingPanel = (submission: Submission) => {
    setSelectedSubmission(submission);
    setMarks(submission.marks || '');
    setFeedback(submission.feedback || '');
    setStatus(submission.status === 'returned' ? 'returned' : 'checked');
  };

  const handleCheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !homework || !user) return;

    if (status === 'checked' && (marks === '' || Number(marks) > Number(homework.totalMarks))) {
       toast.error(`Marks must be between 0 and ${homework.totalMarks}`);
       return;
    }

    try {
      setIsSubmitting(true);
      await checkSubmission(
        selectedSubmission.id,
        selectedSubmission,
        status === 'checked' ? Number(marks) : 0,
        feedback,
        user.id,
        status
      );
      
      toast.success(status === 'checked' ? 'Submission checked successfully' : 'Submission returned for revision');
      setSelectedSubmission(null);
    } catch (error) {
       toast.error('Failed to update submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (!homework) return <div className="text-center py-12">Homework not found</div>;

  const totalStudents = students.length;
  const submittedCount = submissions.length;
  
  // Find students who haven't submitted
  const submittedStudentIds = submissions.map(s => s.studentId);
  const pendingStudents = students.filter(s => !submittedStudentIds.includes(s.id));

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/teacher/homework')} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all dark:bg-slate-800/50">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
               <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full ring-1 ring-indigo-200">
                  Assignment Terminal
               </span>
               <span className="text-slate-300">•</span>
               <span className="text-slate-400 text-xs font-bold">{cls?.name} {cls?.section}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase dark:text-white">{homework.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4 border-l border-slate-100 pl-6 h-12 dark:border-slate-800">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Weight</p>
              <p className="text-xl font-black text-slate-900 italic tracking-tighter dark:text-white">{homework.totalMarks} Points Available</p>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Award className="h-6 w-6" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Homework Info Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <FileText className="w-32 h-32" />
            </div>
            
            <h2 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic mb-6 flex items-center gap-2 dark:text-white">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Resource Manifest
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Submission Deadline</p>
                  <p className="font-bold text-slate-900 dark:text-white">{new Date(homework.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Active Status</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-tighter ${homework.status === 'active' ? 'text-emerald-600' : 'text-slate-400'} capitalize`}>
                    <span className={`w-2 h-2 rounded-full ${homework.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    {homework.status}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-[1.5rem] shadow-xl text-white">
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4 italic">Teacher Instructions</p>
                 <p className="text-sm font-medium leading-relaxed opacity-90 whitespace-pre-wrap">{homework.description}</p>
              </div>

              {homework.attachments && homework.attachments.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Academic Assets</p>
                  <div className="grid grid-cols-1 gap-2">
                    {homework.attachments.map((file, idx) => {
                      const [name, data] = file.split('::');
                      return (
                        <a key={idx} href={data || '#'} download={data ? name : undefined} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 transition-all group dark:bg-slate-900 dark:border-slate-800">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-600 transition-all">
                                 <FileText className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-900 truncate max-w-[180px] dark:text-slate-200">{name}</span>
                           </div>
                           <Download className="h-4 w-4 text-slate-300 group-hover:text-indigo-500" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                 <div className="flex justify-between items-end mb-3">
                    <div>
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Class Engagement</p>
                       <p className="text-xl font-black text-slate-900 italic tracking-tighter dark:text-white">{submittedCount} <span className="opacity-30 text-sm font-bold not-italic">/ {totalStudents}</span></p>
                    </div>
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">{Math.round((submittedCount / Math.max(1, totalStudents)) * 100)}% COMPLETE</p>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                   <div className="bg-indigo-600 h-full rounded-full shadow-lg shadow-indigo-200 transition-all duration-1000" style={{ width: `${(submittedCount / Math.max(1, totalStudents)) * 100}%` }}></div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List Panel */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full bg-white shadow-2xl shadow-slate-200/50 dark:bg-slate-900 dark:border-slate-800">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
               <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic dark:text-white">Institutional Submissions</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Real-time Data Stream</p>
               </div>
               <div className="flex gap-2">
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-full border border-yellow-100">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">{submissions.filter(s => s.status === 'pending').length} Action Required</span>
                 </div>
               </div>
            </div>
            
            <div className="overflow-x-auto flex-1 h-full scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <table className="min-w-full divide-y divide-slate-50 dark:divide-slate-800">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Student Profile</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Submission Log</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Status Protocol</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Score</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operations</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50 dark:bg-slate-900 dark:divide-slate-800">
                  {submissions.length === 0 && pendingStudents.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-20 text-slate-400 font-bold italic">No Student Records Found Path.</td></tr>
                  ) : (
                    <>
                      {submissions.map((sub) => {
                        const studentInfo = students.find(s => s.id === sub.studentId);
                        return (
                          <tr 
                            key={sub.id} 
                            onClick={() => openCheckingPanel(sub)}
                            className={`hover:bg-slate-50/50 transition-all group cursor-pointer ${sub.status === 'pending' ? 'bg-indigo-50/20' : ''}`}
                          >
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center font-black text-white border border-white/10 uppercase text-xs group-hover:bg-indigo-600 transition-colors">
                                 {sub.studentName.charAt(0)}
                               </div>
                               <div>
                                  <div className="text-base font-black text-slate-900 tracking-tight dark:text-white">{sub.studentName}</div>
                                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{studentInfo?.schoolId || 'ID UNKNOWN'}</div>
                               </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{new Date(sub.submittedAt).toLocaleDateString()}</div>
                              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic">{new Date(sub.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                                <div className="flex items-center">
                                  {sub.status === 'pending' && <span className="flex items-center text-yellow-600 bg-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-yellow-200 shadow-sm dark:bg-slate-900"><Clock className="h-3 w-3 mr-2" /> Pending Review</span>}
                                  {sub.status === 'checked' && <span className="flex items-center text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 italic"><CheckCircle className="h-3 w-3 mr-2" /> Verified</span>}
                                  {sub.status === 'returned' && <span className="flex items-center text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 italic"><XCircle className="h-3 w-3 mr-2" /> Returned</span>}
                                </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-center">
                              {sub.status === 'checked' ? (
                                 <div className="flex flex-col">
                                    <span className="text-xl font-black text-slate-900 italic tracking-tighter leading-none dark:text-white">{sub.marks}</span>
                                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter mt-1">/ {homework.totalMarks} Points</span>
                                 </div>
                              ) : (
                                 <span className="text-slate-200 font-black text-2xl tracking-tighter">--</span>
                              )}
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-right">
                              <Button 
                                size="sm" 
                                variant={sub.status === 'pending' ? 'default' : 'outline'} 
                                onClick={() => openCheckingPanel(sub)}
                                className={`rounded-xl uppercase tracking-widest font-black text-[10px] h-10 px-6 transition-all shadow-lg ${sub.status === 'pending' ? 'bg-indigo-600 hover:bg-slate-950 shadow-indigo-200' : 'border-slate-200 text-slate-600 hover:bg-slate-50 shadow-slate-100'}`}
                              >
                                {sub.status === 'pending' ? 'Authorize Marks' : 'Modify Record'}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}

                      {pendingStudents.map((student) => {
                        return (
                          <tr key={`pending-${student.id}`} className="opacity-40 grayscale-[0.5]">
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-300 border border-slate-200 uppercase text-xs dark:border-slate-800">
                                  {student.name.charAt(0)}
                                </div>
                                <div>
                                   <div className="text-base font-bold text-slate-400 tracking-tight italic">{student.name}</div>
                                   <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-0.5">{student.schoolId}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-[10px] font-black text-slate-300 uppercase italic tracking-widest">Awaiting Submission</td>
                            <td className="px-8 py-6 whitespace-nowrap">
                               <span className="text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 italic dark:border-slate-800">Missing Record</span>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-center text-slate-100 font-black text-2xl tracking-tighter">--</td>
                            <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                              <Button size="sm" variant="ghost" disabled className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Pending...</Button>
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col border border-white/20 dark:bg-slate-900">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white relative dark:bg-slate-900">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-transparent to-rose-600" />
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center text-white text-xl font-black italic shadow-2xl">
                   {selectedSubmission.studentName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase leading-none mb-2 dark:text-white">Grading Protocol</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                     <span className="text-indigo-600">STU_UID: {selectedSubmission.studentId}</span>
                     <span>•</span>
                     <span>HW_REF: {id}</span>
                  </p>
                </div>
              </div>
              <button 
                 onClick={() => setSelectedSubmission(null)} 
                 className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center shadow-inner dark:bg-slate-800/50"
              >
                  <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-10 space-y-8 flex-1 bg-white scrollbar-thin scrollbar-thumb-slate-200 dark:bg-slate-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left side: Content */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col h-full min-h-[300px] dark:bg-slate-800/50 dark:border-slate-800">
                       <div className="flex items-center justify-between mb-4">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Student Asset Content</h3>
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{selectedSubmission.submissionText?.length || 0} Chars</span>
                       </div>
                       <div className="text-base text-slate-700 font-medium leading-relaxed italic border-l-4 border-slate-200 pl-6 h-full flex items-start overflow-y-auto whitespace-pre-wrap dark:text-slate-200 dark:border-slate-800">
                         {selectedSubmission.submissionText || <span className="italic text-slate-300 font-bold border-none pl-0 uppercase tracking-widest">No Textual Content Provided by Student Interface.</span>}
                       </div>
                    </div>

                    {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                      <div className="bg-indigo-50/30 p-8 rounded-[2rem] border border-indigo-100">
                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] italic mb-4">Digital Attachments</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {selectedSubmission.attachments.map((file, idx) => {
                            const [name, data] = file.split('::');
                            return (
                              <div key={idx} className="flex items-center justify-between bg-white border border-indigo-50 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group dark:bg-slate-900">
                                <div className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-200">
                                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mr-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                     <Download className="h-4 w-4" />
                                  </div>
                                  <span className="truncate max-w-[200px]">{name}</span>
                                </div>
                                {data && (
                                  <a href={data} download={name} className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Fetch Asset</a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>

                {/* Right side: Form */}
                <div className="space-y-6">
                   <form id="checkForm" onSubmit={handleCheckSubmit} className="space-y-8">
                     <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic mb-6">Execution Protocol</h3>
                        
                        <div className="space-y-8">
                          <div>
                            <p className="text-sm font-black text-slate-900 mb-4 tracking-tight uppercase dark:text-white">Status Selection</p>
                            <div className="flex gap-4">
                              <label className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-[1.5rem] border cursor-pointer transition-all ${status === 'checked' ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-200 -translate-y-1 dark:shadow-emerald-900/40' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800'}`}>
                                <input type="radio" value="checked" checked={status === 'checked'} onChange={() => setStatus('checked')} className="sr-only" />
                                <CheckCircle className={`h-8 w-8 ${status === 'checked' ? 'text-white' : 'text-slate-200'}`} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Authorize Pass</span>
                              </label>
                              <label className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-[1.5rem] border cursor-pointer transition-all ${status === 'returned' ? 'bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-200 -translate-y-1 dark:shadow-rose-900/40' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800'}`}>
                                <input type="radio" value="returned" checked={status === 'returned'} onChange={() => setStatus('returned')} className="sr-only" />
                                <XCircle className={`h-8 w-8 ${status === 'returned' ? 'text-white' : 'text-slate-200'}`} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deny & Return</span>
                              </label>
                            </div>
                          </div>

                          {status === 'checked' && (
                            <div className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-inner group dark:bg-slate-900 dark:border-slate-800">
                              <div className="flex justify-between items-center mb-4">
                                 <label className="text-sm font-black text-slate-900 tracking-tight uppercase dark:text-white">Points Awarded</label>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-300">MAX_SCORE:</span>
                                    <span className="text-[10px] font-black text-emerald-600 bg-white px-2 py-0.5 rounded border border-emerald-100 dark:bg-slate-900">{homework.totalMarks}</span>
                                 </div>
                              </div>
                              <div className="relative">
                                  <Input 
                                    required 
                                    type="number" 
                                    min="0" 
                                    max={homework.totalMarks || 100}
                                    value={marks} 
                                    onChange={e => setMarks(e.target.value ? Number(e.target.value) : '')} 
                                    placeholder="00"
                                    className="w-full h-32 bg-slate-50 border-none rounded-3xl p-6 text-6xl font-black text-slate-900 tracking-tighter text-center focus:ring-8 focus:ring-emerald-500/5 italic transition-all dark:bg-slate-800/50 dark:text-white" 
                                  />
                                  <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-20 pointer-events-none group-focus-within:opacity-100 transition-opacity">
                                     <Award className="h-10 w-10 text-emerald-600 mb-1" />
                                     <span className="text-[8px] font-black tracking-widest text-emerald-900 uppercase">Points</span>
                                  </div>
                              </div>
                              {Number(marks) > Number(homework.totalMarks) && (
                                 <div className="mt-4 flex items-center justify-center gap-2 text-rose-600 animate-bounce">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Score Exceeds Allowable Max!</span>
                                 </div>
                              )}
                            </div>
                          )}

                          <div className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-inner dark:bg-slate-900 dark:border-slate-800">
                             <div className="flex justify-between items-center mb-4">
                                <label className="text-sm font-black text-slate-900 tracking-tight uppercase dark:text-white">Academic Commentary {status === 'returned' && '*'}</label>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">{status === 'returned' ? 'MANDATORY' : 'OPTIONAL'}</span>
                             </div>
                               <Textarea 
                                 required={status === 'returned'} 
                                 rows={6} 
                                 value={feedback} 
                                 onChange={e => setFeedback(e.target.value)} 
                                 placeholder={status === 'returned' ? "Detailed explanation of rejection protocol..." : "Constructive feedback for student development..."}
                                 className="w-full bg-slate-50 border-none rounded-2xl p-6 text-sm font-medium text-slate-600 leading-relaxed focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:italic min-h-[160px] dark:bg-slate-800/50 dark:text-slate-300" 
                               />
                          </div>
                        </div>
                     </div>
                   </form>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0 shadow-2xl relative dark:bg-slate-800/50 dark:border-slate-800">
               <p className="text-[10px] text-slate-400 font-bold max-w-xs leading-tight uppercase tracking-tight italic opacity-40">By executing Save Evaluation, you acknowledge the validation of student identity and merit based on institutional standards.</p> 
               <div className="flex gap-4">
                 <Button type="button" variant="ghost" className="rounded-xl px-8 font-black text-slate-400 uppercase tracking-widest text-[10px] hover:text-rose-600 hover:bg-rose-50" onClick={() => setSelectedSubmission(null)}>Terminate Session</Button>
                 <Button 
                   type="submit" 
                   form="checkForm" 
                   disabled={isSubmitting}
                   className="rounded-2xl bg-slate-950 text-white hover:bg-indigo-600 font-black uppercase tracking-[0.2em] text-[11px] h-14 px-12 shadow-2xl shadow-slate-900/30 active:scale-95 transition-all flex items-center gap-3"
                 >
                   {isSubmitting ? (
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   ) : <ShieldCheck className="h-5 w-5" />}
                   {isSubmitting ? 'Verifying...' : 'Finalize Grade'}
                 </Button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
