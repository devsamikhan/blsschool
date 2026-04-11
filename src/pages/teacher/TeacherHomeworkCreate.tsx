import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { Class, TeacherClass } from '../../types';
import { getTeacherClasses, getAllClasses, createHomework, getAllUsers } from '../../lib/api';
import { EVENTS } from '../../lib/events';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, BookOpen, Calendar, FileText, Upload, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEventListener } from '../../lib/events';

export function TeacherHomeworkCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignedClasses, setAssignedClasses] = useState<(Class & Partial<TeacherClass> & { studentCount?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('');
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [totalMarks, setTotalMarks] = useState(10);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;
      try {
        const [tClasses, allClasses, allUsers] = await Promise.all([
          getTeacherClasses(user.id),
          getAllClasses(),
          getAllUsers(),
        ]);
        const mapped = tClasses.map(tc => {
          const cls = allClasses.find(c => c.id === tc.classId);
          const studentCount = allUsers.filter(u => u.role === 'student' && u.classId === tc.classId).length;
          return { ...cls, ...tc, studentCount } as Class & Partial<TeacherClass> & { studentCount: number };
        }).filter(c => c.name);
        setAssignedClasses(mapped);
        // Auto-select if only one assignment
        if (mapped.length === 1) {
          setClassId(mapped[0].classId!);
          setSubject(mapped[0].subject!);
        }
      } catch {
        toast.error('Failed to load your classes');
      } finally {
        setIsLoading(false);
      }
    };
    fetchClasses();
  }, [user]);

  useEventListener(EVENTS.USER_CHANGE, () => {
    // Re-fetch classes to get updated student counts
    const fetchClasses = async () => {
      if (!user) return;
      const [tClasses, allClasses, allUsers] = await Promise.all([
        getTeacherClasses(user.id),
        getAllClasses(),
        getAllUsers(),
      ]);
      const mapped = tClasses.map(tc => {
        const cls = allClasses.find(c => c.id === tc.classId);
        const studentCount = allUsers.filter(u => u.role === 'student' && u.classId === tc.classId).length;
        return { ...cls, ...tc, studentCount } as Class & Partial<TeacherClass> & { studentCount: number };
      }).filter(c => c.name);
      setAssignedClasses(mapped);
    };
    fetchClasses();
  });

  // When classId changes, get unique subjects for that class
  const classSubjects = assignedClasses
    .filter(c => c.classId === classId)
    .map(c => c.subject!)
    .filter(Boolean);

  // Unique classes
  const uniqueClassIds = Array.from(new Set(assignedClasses.map(c => c.classId)));
  const uniqueClasses = uniqueClassIds.map(id => {
    const match = assignedClasses.find(c => c.classId === id);
    return match!;
  });

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setFileName(`${file.name}::${reader.result}`);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const selectedDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) { toast.error('Due date must be today or in the future'); return; }
    if (!classId || !subject) { toast.error('Please select a class and subject'); return; }
    if (!title.trim()) { toast.error('Please enter a homework title'); return; }

    try {
      setIsSubmitting(true);
      await createHomework({
        title: title.trim(),
        subject,
        description: description.trim(),
        classId,
        dueDate: new Date(dueDate).toISOString(),
        createdBy: user.id,
        teacherName: user.name,
        attachments: fileName ? [fileName] : [],
        totalMarks,
        status: 'active',
        createdAt: new Date().toISOString()
      });
      toast.success('Homework assigned successfully!');
      navigate('/teacher/homework');
    } catch {
      toast.error('Failed to create homework');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const hasNoAssignments = assignedClasses.length === 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create Homework</h1>
          <p className="text-slate-500 dark:text-slate-400">Assign new work to your students.</p>
        </div>
      </div>

      {/* No assignment warning */}
      {hasNoAssignments && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">No Classes Assigned</p>
            <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
              You have not been assigned to any class yet. Please ask the Admin to assign you to a class via the Teacher Assignment page.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-white" />
          <div>
            <h2 className="font-bold text-white">Assignment Details</h2>
            <p className="text-emerald-100 text-xs">Fill in all required fields below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="form-label">
              Homework Title <span className="text-red-500">*</span>
            </label>
            <input
              required type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Chapter 4 – Exercise 1 to 10"
              className="form-input"
            />
          </div>

          {/* Class selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="form-label">
                Select Class <span className="text-red-500">*</span>
              </label>
              <select
                required value={classId}
                onChange={e => { setClassId(e.target.value); setSubject(''); }}
                className="form-select"
              >
                <option value="">— Choose Class —</option>
                {uniqueClasses.map(cls => (
                  <option key={cls.classId} value={cls.classId}>
                    {cls.name} {cls.section} ({cls.studentCount || 0} Students)
                  </option>
                ))}
              </select>
              {hasNoAssignments && (
                <p className="text-xs text-red-500 mt-1">Ask admin to assign you to a class first.</p>
              )}
            </div>

            <div>
              <label className="form-label">
                Select Subject <span className="text-red-500">*</span>
              </label>
              <select
                required value={subject}
                onChange={e => setSubject(e.target.value)}
                disabled={!classId}
                className="form-select disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">— Choose Subject —</option>
                {classSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              {classId && classSubjects.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">No subjects for this class.</p>
              )}
            </div>
          </div>

          {/* Due Date & Total Marks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="form-label">
                <Calendar className="inline w-3 h-3 mr-2 opacity-50" />
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                required type="date" value={dueDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setDueDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">
                Total Marks <span className="text-red-500">*</span>
              </label>
              <input
                required type="number" min="1" max="200" value={totalMarks}
                onChange={e => setTotalMarks(parseInt(e.target.value) || 10)}
                className="form-input"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-label">
              <FileText className="inline w-3 h-3 mr-2 opacity-50" />
              Instructions / Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required rows={5} value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide detailed instructions..."
              className="form-textarea"
            />
          </div>

          {/* File Attachment */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <Upload className="inline w-4 h-4 mr-1 text-slate-400" />
              Attachment (Optional)
            </label>
            <div
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={e => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
                dragActive
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700"
              )}
              onClick={() => document.getElementById('hw-file-input')?.click()}
            >
              <input
                id="hw-file-input" type="file" className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
              <Upload className="h-8 w-8 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
              {fileName ? (
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{fileName.split('::')[0]}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Drop a file here or click to upload</p>
                  <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">PDF, Word, Image, etc.</p>
                </>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}
              className="rounded-xl px-6 border-slate-200 dark:border-slate-700">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || hasNoAssignments}
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-8 font-bold disabled:opacity-50 shadow-lg shadow-emerald-500/20">
              {isSubmitting ? 'Creating...' : 'Assign Homework →'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
