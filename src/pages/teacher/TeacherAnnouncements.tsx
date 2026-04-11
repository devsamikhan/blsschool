import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { Announcement, Class } from '../../types';
import { getAllAnnouncements, createAnnouncement, deleteAnnouncement, getTeacherClasses, getAllClasses } from '../../lib/api';
import { EVENTS, useEventListener } from '../../lib/events';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Megaphone, Plus, Trash2, Calendar, AlertTriangle, Users } from 'lucide-react';
import { toast } from 'sonner';

export function TeacherAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeTab, setActiveTab] = useState<'view' | 'create'>('view');
  const [assignedClasses, setAssignedClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'general' | 'event' | 'exam' | 'urgent'>('general');
  const [targetClasses, setTargetClasses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [allAnnouncements, tClasses, allC] = await Promise.all([
        getAllAnnouncements(),
        getTeacherClasses(user.id),
        getAllClasses()
      ]);
      
      const myClassIds = Array.from(new Set(tClasses.map(t => t.classId)));
      setAssignedClasses(allC.filter(c => myClassIds.includes(c.id)));

      // Filter announcements relevant to teacher (created by me OR targeted to all/teacher OR relevant to my classes)
      const relevant = allAnnouncements.filter(a => 
        a.createdBy === user.id || 
        a.targetRoles.includes('all') || 
        a.targetRoles.includes('teacher') ||
        a.targetClasses.some(id => myClassIds.includes(id))
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setAnnouncements(relevant);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEventListener(EVENTS.ANNOUNCEMENT_CHANGE, fetchData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (targetClasses.length === 0) {
      toast.error('Please select at least one target class or role');
      return;
    }

    try {
      setIsSubmitting(true);
      const newAnnouncement: Omit<Announcement, 'id'> = {
        title,
        message,
        type,
        priority: type === 'urgent' ? 'high' : 'normal',
        targetRoles: ['student'], // Mostly teachers announce to students
        targetClasses: targetClasses,
        createdBy: user.id,
        createdByName: user.name,
        createdByRole: user.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      await createAnnouncement(newAnnouncement);
      toast.success('Announcement posted');
      
      // Reset
      setTitle('');
      setMessage('');
      setType('general');
      setTargetClasses([]);
      setActiveTab('view');
    } catch (error) {
       toast.error('Failed to post announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this announcement?')) {
      try {
         await deleteAnnouncement(id);
         toast.success('Announcement deleted');
      } catch (error) {
         toast.error('Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          <p className="text-gray-500 dark:text-slate-400">View school notices or post to your classes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={activeTab === 'view' ? 'default' : 'outline'} onClick={() => setActiveTab('view')}>View Board</Button>
          <Button variant={activeTab === 'create' ? 'default' : 'outline'} onClick={() => setActiveTab('create')}><Plus className="h-4 w-4 mr-1" /> New Post</Button>
        </div>
      </div>

      {activeTab === 'view' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300 dark:text-slate-400 dark:bg-slate-900">
               No announcements available.
            </div>
          ) : (
            announcements.map((ann) => {
              const isMine = ann.createdBy === user?.id;
              const isUrgent = ann.type === 'urgent';
              return (
                <div key={ann.id} className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border ${isUrgent ? 'border-red-200 dark:border-red-900/30' : 'border-gray-100 dark:border-slate-800'} p-6 relative overflow-hidden`}>
                  {isUrgent && <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>}
                  {isMine && (
                    <button onClick={(e) => handleDelete(ann.id, e)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 bg-gray-50 p-2 rounded-full hover:bg-red-50 transition-colors dark:bg-slate-800/50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  
                  <div className="flex items-center gap-3 mb-3 pr-10">
                    {isUrgent ? (
                      <div className="bg-red-100 p-2 rounded-lg text-red-600"><AlertTriangle className="h-5 w-5" /></div>
                    ) : (
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Megaphone className="h-5 w-5" /></div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{ann.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 dark:text-slate-400">
                        <span className="font-medium text-gray-700 dark:text-slate-200">{ann.createdByName} <span className="text-gray-400 capitalize">({ann.createdByRole})</span></span>
                        <span>&bull;</span>
                        <Calendar className="h-3 w-3" /> {new Date(ann.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-gray-700 whitespace-pre-wrap dark:text-slate-200">
                    {ann.message}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2 dark:border-slate-800">
                    {ann.targetRoles.map(r => (
                      <span key={r} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium capitalize dark:text-slate-300">
                        Target: {r}
                      </span>
                    ))}
                    {ann.targetClasses.length > 0 && ann.targetRoles.includes('student') && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium flex items-center">
                        <Users className="h-3 w-3 mr-1" /> {ann.targetClasses.length} {ann.targetClasses.length === 1 ? 'Class' : 'Classes'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Title *</Label>
              <Input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Science Fair Registration" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Type *</Label>
                <select required value={type} onChange={e => setType(e.target.value as 'general' | 'event' | 'exam' | 'urgent')} className="form-select">
                  <option value="general">General Notice</option>
                  <option value="event">Upcoming Event</option>
                  <option value="exam">Examination Info</option>
                  <option value="urgent">Urgent / Alert</option>
                </select>
              </div>

              <div>
                <Label>Target Classes *</Label>
                <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-2 max-h-40 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 shadow-inner">
                  {assignedClasses.length === 0 ? (
                    <p className="text-sm text-gray-500 italic dark:text-slate-400">No classes assigned to you.</p>
                  ) : (
                    assignedClasses.map(c => (
                      <label key={c.id} className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={targetClasses.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) setTargetClasses([...targetClasses, c.id]);
                            else setTargetClasses(targetClasses.filter(id => id !== c.id));
                          }}
                          className="rounded-lg border-slate-200 text-emerald-600 focus:ring-emerald-500 w-4 h-4 dark:border-slate-800" 
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-200">{c.name} {c.section}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div>
               <Label>Message *</Label>
               <Textarea required rows={6} value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your announcement here..." />
            </div>

            <div className="pt-4 flex justify-end">
               <Button type="submit" disabled={isSubmitting || targetClasses.length === 0} className="w-full sm:w-auto">
                 {isSubmitting ? 'Posting...' : 'Post Announcement'}
               </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
