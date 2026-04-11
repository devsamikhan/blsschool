import { useState, useEffect, useCallback } from 'react';
import { EVENTS, useEventListener } from '../../lib/events';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { User, Class, ExamResult } from '../../types';
import { getTeacherClasses, getAllClasses, getAllUsers, createExamResult } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Save, ArrowLeft, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function TeacherResultsEntry() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignedClasses, setAssignedClasses] = useState<(Class & { subject: string })[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Marks state: { studentId: { obtained, total, grade, remarks } }
  const [marksData, setMarksData] = useState<Record<string, { obtained: string, total: string, grade: string, remarks: string }>>({});

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [tClasses, allClasses] = await Promise.all([
        getTeacherClasses(user.id),
        getAllClasses()
      ]);
      
      const mapped = tClasses.map(tc => {
        const c = allClasses.find(cls => cls.id === tc.classId);
        return { ...c, subject: tc.subject } as Class & { subject: string };
      }).filter(c => c.name);
      
      setAssignedClasses(mapped);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEventListener(EVENTS.USER_CHANGE, fetchData);
  useEventListener(EVENTS.CLASS_CHANGE, fetchData);

  const handleClassSelect = async (classId: string, subject: string) => {
    setSelectedClass(classId);
    setSelectedSubject(subject);
    setIsLoading(true);
    try {
      const allUsers = await getAllUsers();
      const filtered = allUsers.filter(u => u.role === 'student' && u.classId === classId);
      setStudents(filtered);
      
      // Initialize marksData with defaults
      const initial: typeof marksData = {};
      filtered.forEach(s => {
        initial[s.id] = { obtained: '', total: '100', grade: 'F', remarks: '' };
      });
      setMarksData(initial);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateGrade = (obtained: number, total: number) => {
    const p = (obtained / total) * 100;
    if (p >= 90) return 'A+';
    if (p >= 80) return 'A';
    if (p >= 70) return 'B';
    if (p >= 60) return 'C';
    if (p >= 50) return 'D';
    return 'F';
  };

  const handleMarkChange = (studentId: string, field: string, value: string) => {
    setMarksData(prev => {
      const updated = { ...prev[studentId], [field]: value };
      if (field === 'obtained' || field === 'total') {
        const obs = parseFloat(updated.obtained) || 0;
        const tot = parseFloat(updated.total) || 100;
        updated.grade = calculateGrade(obs, tot);
      }
      return { ...prev, [studentId]: updated };
    });
  };

  const handleSaveResults = async () => {
    if (!selectedClass || !selectedSubject) return;
    
    setIsLoading(true);
    try {
      const promises = students.map(async (student) => {
        const data = marksData[student.id];
        const payload: Omit<ExamResult, 'id'> = {
          studentId: student.id,
          classId: selectedClass,
          session: "Final Term 2026",
          exams: [{
            subject: selectedSubject,
            totalMarks: parseFloat(data.total) || 100,
            obtainedMarks: parseFloat(data.obtained) || 0,
            grade: data.grade
          }],
          attendance: 95,
          rank: "N/A",
          standing: (parseFloat(data.obtained) / (parseFloat(data.total) || 100)) >= 0.4 ? 'PROMOTED' : 'HELD',
          remarks: data.remarks || "Performance recorded.",
          createdAt: new Date().toISOString()
        };
        
        await createExamResult(payload);
      });

      await Promise.all(promises);
      toast.success('All results have been submitted to the Principal!');
      navigate('/teacher');
    } catch (error) {
      toast.error('Failed to submit results');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && assignedClasses.length === 0) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={() => navigate('/teacher')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="lms-page-title">Exam Results Entry</h1>
      </div>

      {!selectedClass ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignedClasses.map((cls, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group dark:bg-slate-900 dark:border-slate-800" onClick={() => handleClassSelect(cls.id, cls.subject)}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                 <Trophy className="h-6 w-6" />
              </div>
              <h3 className="lms-card-title">{cls.name} <span className="text-sm font-normal text-slate-400">({cls.section})</span></h3>
              <p className="lms-meta mt-1.5">Subject: {cls.subject}</p>
              <div className="mt-5 flex items-center gap-2 text-primary font-semibold text-sm">
                Enter Marks <ArrowLeft className="h-4 w-4 rotate-180" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
            <div>
              <h2 className="lms-section-title">Class {assignedClasses.find(c => c.id === selectedClass)?.name} — {selectedSubject}</h2>
              <p className="lms-meta mt-0.5">Enter marks for all students in this class.</p>
            </div>
            <Button onClick={handleSaveResults} disabled={isLoading} className="font-semibold text-sm px-7 h-11">
               <Save className="h-4 w-4 mr-2" /> Submit to Principal
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                <tr>
                   <th className="px-6 py-4 text-left lms-table-header">Student Name</th>
                   <th className="px-6 py-4 text-center lms-table-header">Obtained Marks</th>
                   <th className="px-6 py-4 text-center lms-table-header">Total Marks</th>
                   <th className="px-6 py-4 text-center lms-table-header">Grade</th>
                   <th className="px-6 py-4 text-left lms-table-header">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{s.name}</div>
                      <div className="lms-meta">ID: {s.schoolId}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <Input 
                        type="number" 
                        value={marksData[s.id]?.obtained} 
                        onChange={(e) => handleMarkChange(s.id, 'obtained', e.target.value)}
                        className="w-24 mx-auto text-center"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-8 py-6 text-center">
                      <Input 
                        type="number" 
                        value={marksData[s.id]?.total} 
                        onChange={(e) => handleMarkChange(s.id, 'total', e.target.value)}
                        className="w-24 mx-auto text-center opacity-70"
                        placeholder="100"
                      />
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-xs border-2 ${
                         marksData[s.id]?.grade === 'F' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                       }`}>
                         {marksData[s.id]?.grade}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                      <Input 
                        value={marksData[s.id]?.remarks} 
                        onChange={(e) => handleMarkChange(s.id, 'remarks', e.target.value)}
                        className="min-w-[200px]"
                        placeholder="e.g. Excellent progress..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
