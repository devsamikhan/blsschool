import { useEffect, useState } from 'react';
import { Class, User } from '../../types';
import { getAllClasses, createClass, updateClass, deleteClass, getAllUsers } from '../../lib/api';
import { EVENTS, useEventListener } from '../../lib/events';
import { Button } from '../../components/ui/button';
import { Search, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

const CLASS_NAMES = ['Nursery', 'KG', 'Prep', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const SECTIONS = ['A', 'B', 'C', 'D'];

export function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const [formData, setFormData] = useState({
    name: '1st', section: 'A', maxStudents: 30
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [c, u] = await Promise.all([getAllClasses(), getAllUsers()]);
      setClasses(c);
      setUsers(u);
    } catch (error) {
      toast.error('Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEventListener(EVENTS.CLASS_CHANGE, fetchData);
  useEventListener(EVENTS.USER_CHANGE, fetchData); // since class detail view shows student assigned to the class

  const handleOpenModal = (cls?: Class) => {
    if (cls) {
      setEditingClass(cls);
      setFormData({ name: cls.name, section: cls.section, maxStudents: cls.maxStudents });
    } else {
      setEditingClass(null);
      setFormData({ name: '1st', section: 'A', maxStudents: 30 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await updateClass(editingClass.id, formData);
        toast.success(`Class updated successfully.`);
      } else {
        const newClass = {
          ...formData,
          createdAt: new Date().toISOString()
        } as Omit<Class, 'id'>;
        await createClass(newClass);
        toast.success(`Class created successfully.`);
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save class');
    }
  };

  const handleDelete = async (cls: Class) => {
    const studentCount = users.filter(u => u.role === 'student' && u.classId === cls.id).length;
    if (studentCount > 0) {
      toast.error(`Cannot delete class because it has ${studentCount} students enrolled.`);
      return;
    }
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await deleteClass(cls.id);
        toast.success('Class deleted');
      } catch (error) {
        toast.error('Failed to delete class');
      }
    }
  };

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.section.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="lms-page-title">Academic Classes</h1>
          <p className="lms-body mt-1">Manage institutional classes and enrollment capacities.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2 rounded-xl h-11 px-6 shadow-lg shadow-blue-500/10">
          <Plus className="h-4 w-4" /> Add Class
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 mb-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input w-full pl-12"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClasses.map((cls) => {
            const studentCount = users.filter(u => u.role === 'student' && u.classId === cls.id).length;
            const progressPercentage = Math.min(100, Math.round((studentCount / (cls.maxStudents || 30)) * 100));
            return (
              <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{cls.name} <span className="lms-badge">{cls.section}</span></h3>
                      <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">Created: {new Date(cls.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex bg-gray-50 rounded-lg border border-gray-100 p-1 dark:bg-slate-800/50 dark:border-slate-800">
                      <button onClick={() => handleOpenModal(cls)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded dark:text-slate-400">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(cls)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded dark:text-slate-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-600 dark:text-slate-300">
                        <Users className="h-4 w-4 mr-2" /> Students
                      </div>
                      <span className="font-medium">{studentCount} / {cls.maxStudents}</span>
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2">
                       <div 
                         className={`h-2 rounded-full ${progressPercentage >= 90 ? 'bg-red-500' : progressPercentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                         style={{ width: `${progressPercentage}%` }}
                       ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredClasses.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300 dark:text-slate-400 dark:bg-slate-900">
              No classes found.
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md dark:bg-slate-900">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center dark:border-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingClass ? 'Edit Class' : 'Add New Class'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="form-label">Class Name</label>
                <select required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="form-select">
                  {CLASS_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              
              <div>
                <label className="form-label">Section</label>
                <select required value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="form-select">
                  {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                 <label className="form-label">Maximum Students</label>
                 <input required type="number" min="1" max="100" value={formData.maxStudents} onChange={e => setFormData({...formData, maxStudents: parseInt(e.target.value)})} className="form-input" />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Class</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
