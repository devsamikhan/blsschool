import { useState, useEffect } from 'react';
import { User, Class, ExamResult } from '../../types';
import { getAllUsers, getAllClasses, getExamResultsByStudent } from '../../lib/api';
import { ReportTemplate } from '../../components/reports/ReportTemplate';
import { Search, FileQuestion, ChevronLeft, Printer } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { cn } from "../../lib/utils";

export function PrincipalExamResults() {
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [studentResult, setStudentResult] = useState<ExamResult | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRecordLoading, setIsRecordLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, c] = await Promise.all([getAllUsers(), getAllClasses()]);
        setStudents(u.filter(user => user.role === 'student'));
        setClasses(c);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectStudent = async (student: User) => {
    setSelectedStudent(student);
    setIsRecordLoading(true);
    try {
      const results = await getExamResultsByStudent(student.id);
      setStudentResult(results.length > 0 ? results[0] : null);
    } catch (error) {
      console.error('Failed to fetch student results:', error);
      setStudentResult(null);
    } finally {
      setIsRecordLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.schoolId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass && selectedClass !== 'ALL' ? s.classId === selectedClass : true;
    return matchesSearch && matchesClass;
  });

  const calculateTotal = () => {
    if (!studentResult) return { total: 0, obtained: 0, percentage: '0.0' };
    const total = studentResult.exams.reduce((sum, res) => sum + res.totalMarks, 0);
    const obtained = studentResult.exams.reduce((sum, res) => sum + res.obtainedMarks, 0);
    const percentage = total > 0 ? (obtained / total) * 100 : 0;
    return { total, obtained, percentage: percentage.toFixed(1) };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="lms-page-title">Exam Results</h1>
          <p className="lms-body mt-1">Institutional student performance records and transcripts.</p>
        </div>
        {selectedStudent && (
          <Button 
            variant="outline" 
            onClick={() => setSelectedStudent(null)}
            className="rounded-xl flex items-center gap-2 border-slate-200 dark:border-slate-800"
          >
            <ChevronLeft className="h-4 w-4" /> Back to List
          </Button>
        )}
      </div>

      {!selectedStudent ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:hidden">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                placeholder="Search students..." 
                className="form-input pl-10 h-11 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-select h-11"
            >
              <option value="ALL">All Academic Units</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.section}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 lms-table-header uppercase text-[10px]">Student Name / ID</th>
                    <th className="px-6 py-4 lms-table-header uppercase text-[10px]">Academic Unit</th>
                    <th className="px-6 py-4 lms-table-header text-right uppercase text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 dark:text-white uppercase leading-none mb-1">{student.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter uppercase">{student.schoolId}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                          {classes.find(c => c.id === student.classId)?.name} - {classes.find(c => c.id === student.classId)?.section || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-4 h-8 text-[11px] font-bold flex items-center gap-2 ml-auto"
                            onClick={() => handleSelectStudent(student)}
                          >
                            <FileQuestion className="h-4 w-4" />
                            View Record
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center lms-meta italic">No student records match your criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {isRecordLoading ? (
             <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-slate-50 dark:bg-slate-900 dark:border-slate-800 animate-pulse">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="lms-meta font-bold uppercase tracking-widest text-[10px]">Compiling Transcript...</p>
             </div>
          ) : studentResult ? (
            <ReportTemplate 
              title="Official Academic Transcript"
              subtitle={`${selectedStudent.name} (ID: ${selectedStudent.schoolId})`}
              docRef={`RES-${selectedStudent.id.substring(0,4).toUpperCase()}-${new Date().getTime().toString().slice(-6)}`}
            >
              <div className="space-y-8 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <p className="lms-stat-label mb-1">Obtained Marks</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{calculateTotal().obtained}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <p className="lms-stat-label mb-1">Total Marks</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{calculateTotal().total}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800 text-center">
                    <p className="lms-stat-label mb-1 text-emerald-600 dark:text-emerald-400">Final Percentage</p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{calculateTotal().percentage}%</p>
                  </div>
                </div>

                <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-900 font-mono">
                      <tr>
                        <th className="px-5 py-3 lms-table-header uppercase text-[10px]">Subject Title</th>
                        <th className="px-5 py-3 lms-table-header text-center uppercase text-[10px]">Obtained</th>
                        <th className="px-5 py-3 lms-table-header text-center uppercase text-[10px]">Total</th>
                        <th className="px-5 py-3 lms-table-header text-right uppercase text-[10px]">Result Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-sm font-medium">
                      {studentResult.exams.map((exam, idx) => (
                        <tr key={idx}>
                          <td className="px-5 py-4 font-bold text-slate-900 dark:text-white uppercase tracking-tight">{exam.subject}</td>
                          <td className="px-5 py-4 text-center font-mono">{exam.obtainedMarks}</td>
                          <td className="px-5 py-4 text-center text-slate-400 font-mono">{exam.totalMarks}</td>
                          <td className="px-5 py-4 text-right">
                             <span className={cn(
                               "lms-badge text-[10px]",
                               (exam.obtainedMarks/exam.totalMarks) >= 0.4 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                             )}>
                               {(exam.obtainedMarks/exam.totalMarks) >= 0.4 ? 'PASSED' : 'RETAKE-REQUIRED'}
                             </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-t-2 border-slate-900 dark:border-white">
                   <div className="text-xs text-slate-500 max-w-md italic">
                      This is an electronically generated transcript. It serves as an official proof of performance for the current academic session. Any tampering with this record will lead to academic disciplinary action.
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Authorized By</p>
                      <img src="/bls-logo.png" alt="Seal" className="h-10 opacity-20 ml-auto grayscale invert dark:invert-0" />
                   </div>
                </div>
              </div>
            </ReportTemplate>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
               <div className="h-16 w-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                  <FileQuestion className="h-8 w-8" />
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Record Found</h3>
               <p className="text-slate-500 max-w-sm text-center mt-2">No exam results have been published for this student in the current session.</p>
               <Button variant="outline" className="mt-6 rounded-xl" onClick={() => setSelectedStudent(null)}>Return to List</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
