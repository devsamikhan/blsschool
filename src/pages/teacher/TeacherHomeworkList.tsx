import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { Homework, Class, Submission, User } from '../../types';
import { getHomeworkByTeacher, getAllClasses, getAllSubmissions, deleteHomework, getAllUsers } from '../../lib/api';
import { EVENTS, useEventListener } from '../../lib/events';
import { Button } from '../../components/ui/button';
import { Search, Plus, Trash2, Calendar, BookOpen, Users, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function TeacherHomeworkList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [h, c, s, u] = await Promise.all([
        getHomeworkByTeacher(user.id),
        getAllClasses(),
        getAllSubmissions(),
        getAllUsers()
      ]);
      setHomeworks(h);
      setClasses(c);
      setSubmissions(s);
      setUsers(u);
    } catch (error) {
      toast.error('Failed to load homework');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEventListener(EVENTS.HOMEWORK_CHANGE, fetchData);
  useEventListener(EVENTS.SUBMISSION_CHANGE, fetchData);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm('Delete this homework? This activity cannot be undone.')) {
      try {
        await deleteHomework(id);
        toast.success('Homework deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete homework');
      }
    }
  };

  const filteredHomeworks = homeworks.filter(h => {
    const matchesSearch = h.title.toLowerCase().includes(search.toLowerCase());
    const matchesClass = filterClass === 'all' || h.classId === filterClass;
    const matchesStatus = filterStatus === 'all' || h.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Extract unique classes used in my homeworks for the filter dropdown
  const uniqueClassIds = Array.from(new Set(homeworks.map(h => h.classId)));
  const filterClasses = classes.filter(c => uniqueClassIds.includes(c.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Homework</h1>
          <p className="text-gray-500 dark:text-slate-400">Manage all homework you have assigned.</p>
        </div>
        <Button asChild className="flex items-center gap-2">
          <Link to="/teacher/homework/create"><Plus className="h-4 w-4" /> Create New</Link>
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900"
        >
          <option value="all">All Classes</option>
          {filterClasses.map(c => (
            <option key={c.id} value={c.id}>{c.name} {c.section}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'closed')}
          className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : filteredHomeworks.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
           <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
           <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Homework Found</h3>
           <p className="mt-1 text-gray-500 dark:text-slate-400">You haven't assigned any homework that matches your filters.</p>
           <Button className="mt-6" asChild>
             <Link to="/teacher/homework/create">Create your first homework</Link>
           </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHomeworks.map((hw) => {
            const cls = classes.find(c => c.id === hw.classId);
            const hwSubs = submissions.filter(s => s.homeworkId === hw.id);
            const totalStudents = users.filter(u => u.role === 'student' && u.classId === hw.classId).length;
            const isOverdue = new Date(hw.dueDate).getTime() < new Date().setHours(0,0,0,0);
            
            return (
              <div 
                key={hw.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative flex flex-col dark:bg-slate-900 dark:border-slate-800"
                onClick={() => navigate(`/teacher/homework/${hw.id}`)}
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${hw.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {hw.status}
                    </span>
                    <button onClick={(e) => handleDelete(e, hw.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 dark:text-white">{hw.title}</h3>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-slate-300">
                      <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                      {hw.subject} • Class {cls?.name} {cls?.section}
                    </div>
                    <div className={`flex items-center text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Due: {new Date(hw.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 pt-2 border-t border-gray-50 mt-4 dark:text-slate-300">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-400" /> Submissions
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">{hwSubs.length} / {totalStudents}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                       <div 
                         className="bg-blue-600 h-1.5 rounded-full" 
                         style={{ width: `${totalStudents === 0 ? 0 : Math.min(100, Math.round((hwSubs.length / totalStudents) * 100))}%` }}
                       ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
