import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { Announcement, Class, UserRole } from '../../types';
import { getAllAnnouncements, createAnnouncement, deleteAnnouncement, getAllClasses } from '../../lib/api';
import { EVENTS, useEventListener } from '../../lib/events';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Megaphone, Plus, Trash2, Calendar, AlertTriangle, Users, Inbox, ShieldCheck, CheckCircle2, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

export function PrincipalAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeTab, setActiveTab] = useState<'view' | 'create'>('view');
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'general' | 'event' | 'exam' | 'urgent'>('general');
  const [targetRoles, setTargetRoles] = useState<string[]>(['all']);
  const [targetClasses, setTargetClasses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allAnnouncements, allClassRecords] = await Promise.all([
        getAllAnnouncements(),
        getAllClasses()
      ]);
      setAnnouncements(allAnnouncements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setClasses(allClassRecords);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEventListener(EVENTS.ANNOUNCEMENT_CHANGE, fetchData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (targetRoles.length === 0 && targetClasses.length === 0) {
      toast.error('Select at least one target audience');
      return;
    }

    try {
      setIsSubmitting(true);
      const newAnnouncement: Omit<Announcement, 'id'> = {
        title,
        message,
        type,
        priority: type === 'urgent' ? 'high' : 'normal',
        targetRoles: targetRoles,
        targetClasses: targetClasses,
        createdBy: user.id,
        createdByName: user.name,
        createdByRole: user.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      await createAnnouncement(newAnnouncement);
      toast.success('Announcement published successfully');
      
      // Reset
      setTitle('');
      setMessage('');
      setType('general');
      setTargetRoles(['all']);
      setTargetClasses([]);
      setActiveTab('view');
    } catch (error) {
       toast.error('Failed to publish');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement? This action is permanent.')) {
      try {
         await deleteAnnouncement(id);
         toast.success('Announcement deleted');
      } catch (error) {
         toast.error('Failed to delete');
      }
    }
  };

  const toggleRole = (role: string) => {
    if (targetRoles.includes(role)) {
      setTargetRoles(targetRoles.filter(r => r !== role));
    } else {
      setTargetRoles([...targetRoles, role]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="lms-page-title">Institutional Announcements</h1>
          <p className="lms-body mt-1">Review and manage all institutional updates and status alerts.</p>
        </div>
        <Button 
          variant={activeTab === 'create' ? 'outline' : 'default'}
          onClick={() => setActiveTab(activeTab === 'create' ? 'view' : 'create')} 
          className="flex items-center gap-2 rounded-xl h-11 px-6 shadow-lg shadow-blue-500/10"
        >
          {activeTab === 'create' ? <Inbox className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {activeTab === 'create' ? 'View Registry' : 'New Announcement'}
        </Button>
      </div>

      {activeTab === 'view' ? (
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl" />)}
            </div>
          ) : announcements.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
               <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Megaphone className="h-8 w-8 text-slate-400" />
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">No active announcements</h3>
               <p className="lms-body max-w-sm mx-auto mt-1">Check back later or create a new announcement.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {announcements.map((ann) => {
                const isMine = ann.createdBy === user?.id;
                const isUrgent = ann.type === 'urgent';
                return (
                  <div key={ann.id} className={cn(
                    "group bg-white dark:bg-slate-900 rounded-2xl border p-6 md:p-8 relative transition-all shadow-sm",
                    isUrgent ? 'border-rose-200 dark:border-rose-900/50' : 'border-slate-200 dark:border-slate-800'
                  )}>
                    {isUrgent && <div className="absolute top-0 left-12 px-4 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-b-xl shadow-lg">Urgent</div>}
                    
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-6">
                        <div className={cn(
                          "h-16 w-16 rounded-3xl flex items-center justify-center shrink-0 shadow-lg",
                          isUrgent ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-emerald-600 text-white shadow-emerald-500/20'
                        )}>
                          {isUrgent ? <AlertTriangle className="h-8 w-8" /> : ann.type === 'event' ? <Calendar className="h-8 w-8" /> : <Inbox className="h-8 w-8" />}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-2 group-hover:text-emerald-600 transition-colors">
                            {ann.title}
                          </h3>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 lms-meta"><ShieldCheck className="h-3 w-3" /> {ann.createdByName}</span>
                            <span className="lms-meta">&bull;</span>
                            <span className="flex items-center gap-1.5 lms-meta"><Calendar className="h-3 w-3" /> {new Date(ann.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 items-start shrink-0">
                        {isMine && (
                          <button onClick={() => handleDelete(ann.id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-100">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-8 text-base text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed font-medium pl-0 md:pl-22">
                      {ann.message}
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800/50 flex flex-wrap gap-3">
                       {ann.targetRoles.map(r => (
                         <span key={r} className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-100 dark:border-slate-700 dark:text-slate-400">
                           {r}
                         </span>
                       ))}
                       {ann.targetClasses.length > 0 && (
                         <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
                           <Users className="h-3 w-3" /> {ann.targetClasses.length} Classes
                         </span>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div>
                    <Label className="form-label">Announcement Title</Label>
                    <Input required className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="E.g., Winter Break Schedule" />
                  </div>

                  <div>
                    <Label className="form-label">Category</Label>
                    <Select value={type} onValueChange={(val: 'general' | 'event' | 'exam' | 'urgent') => setType(val)}>
                      <SelectTrigger className="form-select">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Notice</SelectItem>
                        <SelectItem value="event">Upcoming Event</SelectItem>
                        <SelectItem value="exam">Examination Info</SelectItem>
                        <SelectItem value="urgent" className="text-rose-600">Urgent Alert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
               </div>

               <div className="space-y-4">
                  <Label className="form-label">Target Audience</Label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                     {['all', 'admin', 'teacher', 'student', 'parent'].map((role) => (
                       <button
                         key={role}
                         type="button"
                         onClick={() => toggleRole(role as UserRole)}
                         className={cn(
                           "px-4 py-2 rounded-xl text-sm font-medium transition-all border flex items-center justify-between capitalize",
                           targetRoles.includes(role as UserRole) 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800" 
                            : "bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:text-slate-300"
                         )}
                       >
                         {role}
                         {targetRoles.includes(role as UserRole) && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                       </button>
                     ))}
                  </div>

                  <div className="pt-2">
                    <Label className="form-label">Specific Classes (Optional)</Label>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto space-y-2">
                        {classes.map(c => (
                          <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                             <input 
                               type="checkbox" 
                               checked={targetClasses.includes(c.id)}
                               onChange={(e) => {
                                 if (e.target.checked) setTargetClasses([...targetClasses, c.id]);
                                 else setTargetClasses(targetClasses.filter(id => id !== c.id));
                               }}
                               className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                             />
                             <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Class {c.name} - {c.section}</span>
                          </label>
                        ))}
                    </div>
                  </div>
               </div>
            </div>

            <div className="pt-2">
               <Label className="form-label">Message Content</Label>
               <Textarea required className="form-textarea min-h-[150px]" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type the announcement here..." />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
               <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 rounded-xl h-11">
                 {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
                 <Megaphone className="ml-2 h-4 w-4" />
               </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
