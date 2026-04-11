import { useEffect, useState } from 'react';
import { User, Class, TeacherClass } from '../../types';
import { getAllUsers, getAllClasses, getAllTeacherClasses, assignTeacherToClass, removeTeacherFromClass } from '../../lib/api';
import { EVENTS, useEventListener } from '../../lib/events';
import { Button } from '../../components/ui/button';
import { Plus, Trash2, AlertCircle, CheckCircle2, Users, BookOpen, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

export function TeacherAssignment() {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<TeacherClass[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [u, c, a] = await Promise.all([getAllUsers(), getAllClasses(), getAllTeacherClasses()]);
      setAllUsers(u);
      setTeachers(u.filter(user => user.role === 'teacher'));
      setClasses(c);
      setAssignments(a);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEventListener(EVENTS.USER_CHANGE, fetchData);
  useEventListener(EVENTS.CLASS_CHANGE, fetchData);

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
  const teacherSubjects: string[] = selectedTeacher?.subjects || [];

  // When teacher changes, reset dependent fields
  const handleTeacherChange = (id: string) => {
    setSelectedTeacherId(id);
    setSelectedSubject('');
    setSelectedClassIds([]);
  };

  // When subject changes, reset classes
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedClassIds([]);
  };

  const toggleClass = (classId: string) => {
    setSelectedClassIds(prev =>
      prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
    );
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId || !selectedSubject || selectedClassIds.length === 0) {
      toast.error('Select a teacher, subject, and at least one class');
      return;
    }
    try {
      setIsSubmitting(true);
      await Promise.all(
        selectedClassIds.map(classId =>
          assignTeacherToClass({ teacherId: selectedTeacherId, classId, subject: selectedSubject })
        )
      );
      toast.success(`Assigned ${selectedTeacher?.name} to ${selectedClassIds.length} class(es) for ${selectedSubject}`);
      setSelectedClassIds([]);
      const a = await getAllTeacherClasses();
      setAssignments(a);

    } catch {
      toast.error('Failed to create assignments');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string, teacherName: string, cls: string, subject: string) => {
    if (!window.confirm(`Remove ${teacherName} from ${cls} (${subject})?`)) return;
    try {
      await removeTeacherFromClass(id);
      toast.success('Assignment removed');
      const a = await getAllTeacherClasses();
      setAssignments(a);

    } catch {
      toast.error('Failed to remove assignment');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="lms-page-title">Teacher Assignment</h1>
        <p className="lms-body mt-1">
          Assign teachers to classes and subjects. Teachers can only assign homework to their assigned classes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Assignment Form ─── */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center gap-3">
              <Plus className="w-5 h-5 text-white" />
              <div>
                <h2 className="font-bold text-white">New Assignment</h2>
                <p className="text-indigo-200 text-xs">Pick teacher → subject → class(es)</p>
              </div>
            </div>

            <form onSubmit={handleAssign} className="p-5 space-y-5">
              {/* Step 1: Teacher */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center font-bold">1</span>
                  Select Teacher
                </label>
                <select
                  required value={selectedTeacherId}
                  onChange={e => handleTeacherChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">— Choose Teacher —</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.schoolId})
                    </option>
                  ))}
                </select>
                {selectedTeacher && teacherSubjects.length === 0 && (
                  <div className="mt-2 flex items-start gap-1.5 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <p className="text-xs">This teacher has no subjects set. Edit the teacher user to add subjects first.</p>
                  </div>
                )}
              </div>

              {/* Step 2: Subject (only shown when teacher selected and has subjects) */}
              {selectedTeacherId && teacherSubjects.length > 0 && (
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center font-bold">2</span>
                    Select Subject
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {teacherSubjects.map(sub => (
                      <button
                        key={sub} type="button"
                        onClick={() => handleSubjectChange(sub)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                          selectedSubject === sub
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                        )}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Classes (only shown when subject selected) */}
              {selectedSubject && (
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center font-bold">3</span>
                    Select Class(es)
                  </label>
                  <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                    {classes.map(cls => {
                      const alreadyAssigned = assignments.some(
                        a => a.teacherId === selectedTeacherId && a.classId === cls.id && a.subject === selectedSubject
                      );
                      const isChecked = selectedClassIds.includes(cls.id);
                      return (
                        <label
                          key={cls.id}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm",
                            alreadyAssigned
                              ? "bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60"
                              : isChecked
                              ? "bg-indigo-50 dark:bg-indigo-900/20"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          )}
                        >
                          <input
                            type="checkbox"
                            disabled={alreadyAssigned}
                            checked={isChecked}
                            onChange={() => toggleClass(cls.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className={cn("font-medium", isChecked ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300")}>
                            {cls.name} {cls.section}
                          </span>
                          {alreadyAssigned && (
                            <span className="ml-auto text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold">
                              Assigned
                            </span>
                          )}
                          <span className="ml-auto text-xs text-slate-400 dark:text-slate-600">
                            {allUsers.filter(u => u.role === 'student' && u.classId === cls.id).length} students
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {selectedClassIds.length > 0 && (
                    <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {selectedClassIds.length} class(es) selected
                    </p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !selectedTeacherId || !selectedSubject || selectedClassIds.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold disabled:opacity-40 shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Assigning...' : 'Assign Teacher'}
              </Button>
            </form>
          </div>
        </div>

        {/* ─── Current Assignments Table ─── */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-bold text-slate-900 dark:text-white">Current Assignments</h2>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full font-semibold">
                {assignments.length} Total
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="font-semibold text-slate-600 dark:text-slate-400">No assignments yet</p>
                <p className="text-sm text-slate-400 dark:text-slate-600 mt-1">Use the form on the left to assign a teacher.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Teacher</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <BookOpen className="inline w-3.5 h-3.5 mr-1" />Class
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <Tag className="inline w-3.5 h-3.5 mr-1" />Subject
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                    {assignments.map(a => {
                      const teacher = teachers.find(t => t.id === a.teacherId);
                      const cls = classes.find(c => c.id === a.classId);
                      return (
                        <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                                {teacher?.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{teacher?.name || 'Unknown'}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">{teacher?.schoolId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-lg border border-blue-100 dark:border-blue-800/50 font-semibold">
                              {cls?.name} {cls?.section}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 text-xs rounded-md font-medium">
                              {a.subject}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => handleRemove(a.id, teacher?.name || 'Teacher', `${cls?.name} ${cls?.section}`, a.subject)}
                              className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                              title="Remove assignment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
