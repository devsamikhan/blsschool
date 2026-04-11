import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { Class, User, AttendanceRecord, StudentAttendance } from '../../types';
import { getTeacherClasses, getAllClasses, getAllUsers, getAttendanceByDate, createAttendance, updateAttendance } from '../../lib/api';
import { EVENTS, useEventListener } from '../../lib/events';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ReportTemplate } from '../../components/reports/ReportTemplate';

export function TeacherAttendance() {
  const { user } = useAuth();
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [selectedClassId, setSelectedClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // existing record for the selected date and class
  const [existingRecord, setExistingRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceState, setAttendanceState] = useState<Record<string, StudentAttendance>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchBaseData = useCallback(async () => {
    if (!user) return;
    try {
      const [tc, allC, allU] = await Promise.all([
        getTeacherClasses(user.id),
        getAllClasses(),
        getAllUsers()
      ]);
      
      // Only classes where the teacher is assigned
      const classIds = Array.from(new Set(tc.map(t => t.classId)));
      const myClasses = allC.filter(c => classIds.includes(c.id));
      setClasses(myClasses);
      setStudents(allU.filter(u => u.role === 'student'));
    } catch (error) {
      toast.error('Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBaseData();
  }, [fetchBaseData]);

  useEventListener(EVENTS.USER_CHANGE, fetchBaseData);

  const fetchRecord = useCallback(async () => {
    if (!selectedClassId || !date) return;
    
    try {
      const records = await getAttendanceByDate(date);
      const record = records.find(r => r.classId === selectedClassId);
      
      const cls = classes.find(c => c.id === selectedClassId);
      const classStudents = students.filter(s => s.classId === selectedClassId);
      
      const newAttendanceState: Record<string, StudentAttendance> = {};
      
      if (record) {
        setExistingRecord(record);
        record.records.forEach(r => {
          newAttendanceState[r.studentId] = r;
        });
        
        // Add any missing students (if newly added to class)
        classStudents.forEach(s => {
          if (!newAttendanceState[s.id]) {
            newAttendanceState[s.id] = { studentId: s.id, studentName: s.name, status: 'present' };
          }
        });
      } else {
        setExistingRecord(null);
        // Default all to present if no record
        classStudents.forEach(s => {
          newAttendanceState[s.id] = { studentId: s.id, studentName: s.name, status: 'present' };
        });
      }
      setAttendanceState(newAttendanceState);
    } catch (error) {
       console.error('Failed to fetch attendance record', error);
    }
  }, [selectedClassId, date, classes, students]);

  // Fetch record when date or class changes
  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'leave') => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const markAll = (status: 'present' | 'absent') => {
    const newState = { ...attendanceState };
    Object.keys(newState).forEach(id => {
      newState[id].status = status;
    });
    setAttendanceState(newState);
  };

  const handleSave = async () => {
    if (!user || !selectedClassId || !date) return;
    
    const recordsToSave = Object.values(attendanceState);
    if (recordsToSave.length === 0) {
      toast.error('No students in this class to mark');
      return;
    }

    try {
      setIsSaving(true);
      if (existingRecord) {
        await updateAttendance(existingRecord.id, {
          records: recordsToSave
        });
        toast.success('Attendance updated successfully');
      } else {
        await createAttendance({
          classId: selectedClassId,
          date,
          records: recordsToSave,
          markedBy: user.id,
          createdAt: new Date().toISOString()
        });
        toast.success('Attendance recorded successfully');
        
        // Re-fetch existing record so next save is an update
        fetchRecord();
      }
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const currentClassStudents = Object.values(attendanceState);
  
  // Calculate stats
  const presentCount = currentClassStudents.filter(s => s.status === 'present').length;
  const absentCount = currentClassStudents.filter(s => s.status === 'absent').length;
  const lateCount = currentClassStudents.filter(s => s.status === 'late').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 print:hidden dark:text-white">Mark Attendance Standard</h1>
        <p className="text-gray-500 print:hidden dark:text-slate-400">Take daily attendance for your assigned classes.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 print:hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="flex-1">
          <Label>Select Class *</Label>
          <select 
            value={selectedClassId} 
            onChange={e => setSelectedClassId(e.target.value)} 
            className="form-select"
          >
            <option value="">-- Choose Class --</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
          </select>
        </div>
        
        <div className="flex-1">
          <Label>Select Date *</Label>
          <div className="relative">
            <Input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              // Prevent selecting future dates
              max={new Date().toISOString().split('T')[0]}
              className="pl-12"
            />
            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {selectedClassId ? (
        <ReportTemplate 
          title="Daily Attendance Register"
          subtitle={`Class: ${classes.find(c => c.id === selectedClassId)?.name} ${classes.find(c => c.id === selectedClassId)?.section} | Date: ${new Date(date).toLocaleDateString()}`}
          docRef={`ATT-${selectedClassId.substring(0,4).toUpperCase()}-${date.replace(/-/g,'')}`}
        >
          <div className="bg-white rounded-xl shadow-none border border-gray-100 overflow-visible dark:bg-slate-900 dark:border-slate-800">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 rounded-t-xl print:hidden dark:border-slate-800 dark:bg-slate-800/50">
             <div>
               <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Student List</h2>
               <div className="flex gap-4 mt-2 text-sm text-gray-600 font-medium dark:text-slate-300">
                 <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">Present: {presentCount}</span>
                 <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded">Absent: {absentCount}</span>
                 <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">Late: {lateCount}</span>
               </div>
             </div>
             <div className="flex gap-2 w-full sm:w-auto">
               <Button variant="outline" size="sm" onClick={() => markAll('present')} className="flex-1 sm:flex-none">Mark All Present</Button>
               <Button variant="outline" size="sm" onClick={() => markAll('absent')} className="flex-1 sm:flex-none">Mark All Absent</Button>
               <Button onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none flex items-center gap-2">
                 <Save className="h-4 w-4" /> Save
               </Button>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
              <thead className="bg-white dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Student Name</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 dark:bg-slate-900 dark:divide-slate-800">
                {currentClassStudents.length === 0 ? (
                  <tr><td colSpan={2} className="text-center py-12 text-gray-500 dark:text-slate-400">No students enrolled in this class.</td></tr>
                ) : (
                  currentClassStudents.map(student => {
                    const u = students.find(s => s.id === student.studentId);
                    return (
                      <tr key={student.studentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{student.studentName}</div>
                          <div className="text-xs text-gray-500 dark:text-slate-400">{u?.schoolId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center gap-4 sm:gap-6">
                            <label className="flex items-center cursor-pointer group">
                              <input 
                                type="radio" 
                                name={`status-${student.studentId}`} 
                                checked={student.status === 'present'} 
                                onChange={() => handleStatusChange(student.studentId, 'present')} 
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                              />
                              <span className={`ml-2 text-sm font-medium ${student.status === 'present' ? 'text-green-700' : 'text-gray-500 group-hover:text-gray-700'}`}>Present</span>
                            </label>
                            
                            <label className="flex items-center cursor-pointer group">
                              <input 
                                type="radio" 
                                name={`status-${student.studentId}`} 
                                checked={student.status === 'absent'} 
                                onChange={() => handleStatusChange(student.studentId, 'absent')} 
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                              />
                              <span className={`ml-2 text-sm font-medium ${student.status === 'absent' ? 'text-red-700' : 'text-gray-500 group-hover:text-gray-700'}`}>Absent</span>
                            </label>
                            
                            <label className="flex items-center cursor-pointer group">
                              <input 
                                type="radio" 
                                name={`status-${student.studentId}`} 
                                checked={student.status === 'late'} 
                                onChange={() => handleStatusChange(student.studentId, 'late')} 
                                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                              />
                              <span className={`ml-2 text-sm font-medium ${student.status === 'late' ? 'text-yellow-700' : 'text-gray-500 group-hover:text-gray-700'}`}>Late</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
            {currentClassStudents.length > 0 && (
              <div className="p-4 bg-gray-50 flex justify-end print:hidden dark:bg-slate-800/50">
                <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto flex items-center justify-center gap-2">
                   <Save className="h-4 w-4" /> Save Attendance
                 </Button>
              </div>
            )}
          </div>
        </ReportTemplate>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300 dark:text-slate-400 dark:bg-slate-900">
           Please select a class to mark attendance.
        </div>
      )}
    </div>
  );
}
