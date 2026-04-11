import { useEffect, useState, useCallback } from 'react';
import { User, UserRole, Class } from '@/types';
import { getAllUsers, getAllClasses } from '@/lib/api';
import { createUserWithRelations, updateUserWithRelations, deleteUserWithRelations } from '@/lib/DataManager';
import { EVENTS, useEventListener } from '@/lib/events';
import { Button } from '@/components/ui/button';
import { Search, Plus, Edit2, Trash2, ShieldAlert, UserPlus, Fingerprint, Sparkles, AlertCircle, ChevronRight, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Printer } from 'lucide-react';

const ROLES: UserRole[] = ['admin', 'teacher', 'student', 'principal', 'accountant', 'parent'];
const SUBJECTS = ['Math', 'English', 'Urdu', 'Science', 'Islamiat', 'Computer', 'Social Studies', 'Art'];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<User>>({
    name: '', role: 'student', email: '', phone: '', address: '', classId: '', studentIds: [], subjects: [], status: 'active', password: ''
  });
  const [parentData, setParentData] = useState({ name: '', phone: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const [u, c] = await Promise.all([getAllUsers(), getAllClasses()]);
      setUsers(u);
      setClasses(c);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEventListener(EVENTS.USER_CHANGE, fetchUsers);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ ...user, password: '' });
    } else {
      setEditingUser(null);
      setParentData({ name: '', phone: '', email: '' });
      setFormData({
        name: '', role: 'student', email: '', phone: '', address: '', classId: '', studentIds: [], subjects: [], status: 'active', password: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingUser) {
        await updateUserWithRelations(editingUser.id, {
          name: formData.name || '',
          subjects: formData.subjects,
          newClassId: formData.classId,
          oldClassId: editingUser.classId,
          studentIds: formData.studentIds
        });
        toast.success(`User updated successfully.`);
      } else {
        const saved = await createUserWithRelations({
          name: formData.name || '',
          role: formData.role || 'student',
          password: formData.password || 'welcome123',
          classId: formData.classId,
          studentIds: formData.studentIds,
          subjects: formData.subjects,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        });

        if (formData.role === 'student' && parentData.name) {
          const parentSaved = await createUserWithRelations({
            name: `${parentData.name} (Parent of ${saved.name})`,
            role: 'parent',
            password: 'welcome123',
            phone: parentData.phone,
            email: parentData.email,
            studentIds: [saved.id]
          });
          toast.success(
            <div className="flex flex-col gap-1">
              <span>Student & Parent auto-created!</span>
              <span className="text-xs font-mono bg-white/20 p-1 rounded">STU: {saved.schoolId} | PAR: {parentSaved.schoolId} | Pwd: welcome123</span>
            </div>,
            { duration: 10000 }
          );
        } else {
          toast.success(
            <div className="flex flex-col gap-1">
              <span>User created!</span>
              <span className="text-xs font-mono bg-white/20 p-1 rounded">ID: {saved.schoolId} | Pwd: {formData.password || 'welcome123'}</span>
            </div>,
            { duration: 10000 }
          );
        }
      }
      setIsModalOpen(false);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("User Creation Error:", err);
      toast.error(`Failed to save user: ${err?.message || 'Unknown network/API error.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? All relations will be severed.')) return;
    try {
      await deleteUserWithRelations(id);
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      const { updateUser } = await import('@/lib/api');
      await updateUser(user.id, { status: newStatus });
      toast.success(`User marked as ${newStatus}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.schoolId.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">User Management</h1>
            <p className="text-slate-500 font-medium mt-1">View and manage all student, teacher, and staff accounts.</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2 rounded-xl h-11 px-6 shadow-lg shadow-emerald-500/10">
            <UserPlus className="h-4 w-4" /> Add User Account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email, or school ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-12 h-11"
          />
        </div>
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
          className="form-select h-11 bg-white/50 backdrop-blur-sm shadow-sm border-slate-200/50"
        >
          <option value="all">All Roles</option>
          {ROLES.map(role => <option key={role} value={role} className="capitalize">{role}</option>)}
        </select>
      </div>

      <div className="space-y-12">
        {/* Category: Management & Staff */}
        {filteredUsers.some(u => ['admin', 'principal', 'accountant'].includes(u.role)) && (
          <UserSection 
            title="Management & staff" 
            icon={<ShieldAlert className="h-5 w-5 text-indigo-500" />}
            subtitle="Administrative accounts for school management and finance."
            count={filteredUsers.filter(u => ['admin', 'principal', 'accountant'].includes(u.role)).length}
          >
            <UserTable 
              users={filteredUsers.filter(u => ['admin', 'principal', 'accountant'].includes(u.role))}
              classes={classes}
              allUsers={users}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          </UserSection>
        )}

        {/* Category: Faculty / Teachers */}
        {filteredUsers.some(u => u.role === 'teacher') && (
          <UserSection 
            title="Teaching faculty" 
            icon={<Sparkles className="h-5 w-5 text-emerald-500" />}
            subtitle="Academic instructors and subject teachers."
            count={filteredUsers.filter(u => u.role === 'teacher').length}
          >
            <UserTable 
              users={filteredUsers.filter(u => u.role === 'teacher')}
              classes={classes}
              allUsers={users}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          </UserSection>
        )}

        {/* Category: Students (By Class Folders) */}
        {filteredUsers.some(u => u.role === 'student') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4">
              <FolderOpen className="h-6 w-6 text-indigo-500" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight dark:text-white uppercase transition-colors">Academic Student folders</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Student records organized by their assigned classes.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {classes.filter(c => filteredUsers.some(u => u.role === 'student' && u.classId === c.id)).map(cls => (
                <UserSection 
                  key={cls.id}
                  title={`Class ${cls.name} (${cls.section})`}
                  icon={<div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">{cls.name.charAt(0)}</div>}
                  count={filteredUsers.filter(u => u.role === 'student' && u.classId === cls.id).length}
                  isSubSection
                >
                  <UserTable 
                    users={filteredUsers.filter(u => u.role === 'student' && u.classId === cls.id)}
                    classes={classes}
                    allUsers={users}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                  />
                </UserSection>
              ))}
              {/* Unassigned Students */}
              {filteredUsers.some(u => u.role === 'student' && !u.classId) && (
                <UserSection 
                  title="Unassigned Students"
                  icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
                  count={filteredUsers.filter(u => u.role === 'student' && !u.classId).length}
                  isSubSection
                >
                  <UserTable 
                    users={filteredUsers.filter(u => u.role === 'student' && !u.classId)}
                    classes={classes}
                    allUsers={users}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                  />
                </UserSection>
              )}
            </div>
          </div>
        )}

        {/* Category: Parents & Guardians */}
        {filteredUsers.some(u => u.role === 'parent') && (
          <UserSection 
            title="Parents & Guardians" 
            icon={<UserPlus className="h-5 w-5 text-indigo-400" />}
            subtitle="Verified guardians connected to student profiles."
            count={filteredUsers.filter(u => u.role === 'parent').length}
          >
            <UserTable 
              users={filteredUsers.filter(u => u.role === 'parent')}
              classes={classes}
              allUsers={users}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          </UserSection>
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-20">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingUser ? 'Edit User Details' : 'Add New User'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="form-input" />
                </div>
                
                <div>
                  <label className="form-label">Role *</label>
                  <select disabled={!!editingUser} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole, classId: '', subjects: []})} className="form-select">
                    {ROLES.filter(r => r !== 'admin').map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                  </select>
                </div>

                <div>
                   <label className="form-label">Email Address *</label>
                   <input required type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="form-input" />
                </div>

                <div>
                   <label className="form-label">Phone Number *</label>
                   <input required type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="form-input" />
                </div>

                <div className="md:col-span-2">
                   <label className="form-label">Address</label>
                   <input type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="form-input" />
                </div>

                {!editingUser && (
                  <div className="md:col-span-2">
                     <label className="form-label">Password</label>
                     <input type="text" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Default: welcome123" className="form-input" />
                  </div>
                )}

                {/* Conditional Fields based on Role */}
                {formData.role === 'student' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="form-label">Assign Class *</label>
                      <select required value={formData.classId || ''} onChange={e => setFormData({...formData, classId: e.target.value})} className="form-select">
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                      </select>
                    </div>

                    {!editingUser && (
                      <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                          <UserPlus className="h-4 w-4 text-emerald-600" /> Auto-Create Linked Parent Account
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div>
                            <label className="form-label">Parent / Guardian Name *</label>
                            <input required={formData.role === 'student' && !editingUser} type="text" value={parentData.name} onChange={e => setParentData({...parentData, name: e.target.value})} className="form-input" placeholder="e.g. Ali Ahmed" />
                          </div>
                          <div>
                            <label className="form-label">Parent Phone Mobile *</label>
                            <input required={formData.role === 'student' && !editingUser} type="text" value={parentData.phone} onChange={e => setParentData({...parentData, phone: e.target.value})} className="form-input" placeholder="0300-0000000" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="form-label">Parent Email Address (Optional)</label>
                            <input type="email" value={parentData.email} onChange={e => setParentData({...parentData, email: e.target.value})} className="form-input" placeholder="parent@example.com" />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {formData.role === 'parent' && (
                  <div className="md:col-span-2">
                    <label className="form-label">Link to Student(s) *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 max-h-[200px] overflow-y-auto">
                      {users.filter(u => u.role === 'student').map(s => (
                        <label key={s.id} className="flex items-center space-x-2 text-sm font-medium cursor-pointer p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                          <input 
                            type="checkbox" 
                            checked={formData.studentIds?.includes(s.id) || false}
                            onChange={(e) => {
                              const curr = formData.studentIds || [];
                              setFormData({
                                ...formData, 
                                studentIds: e.target.checked ? [...curr, s.id] : curr.filter(id => id !== s.id)
                              });
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                          />
                          <div className="flex flex-col">
                            <span>{s.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{s.schoolId}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 dark:text-slate-400 italic">Select all children associated with this guardian.</p>
                  </div>
                )}

                {formData.role === 'teacher' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="form-label">Subjects</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        {SUBJECTS.map(sub => (
                          <label key={sub} className="flex items-center space-x-2 text-sm font-medium cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.subjects?.includes(sub) || false}
                              onChange={(e) => {
                                const curr = formData.subjects || [];
                                setFormData({
                                  ...formData, 
                                  subjects: e.target.checked ? [...curr, sub] : curr.filter(s => s !== sub)
                                });
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                            />
                            <span>{sub}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {!editingUser && (
                      <div className="md:col-span-2">
                        <label className="form-label">Primary Class Assignment (Optional)</label>
                        <select 
                          value={formData.classId || ''} 
                          onChange={e => setFormData({...formData, classId: e.target.value})} 
                          className="form-select"
                        >
                          <option value="">No Class Assigned</option>
                          {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>

              {editingUser && (
                <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <input type="checkbox" id="status" checked={formData.status === 'active'} onChange={e => setFormData({...formData, status: e.target.checked ? 'active' : 'inactive'})} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <label htmlFor="status" className="text-sm font-semibold !mb-0 dark:text-slate-200">Account Active</label>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : <ShieldAlert className="h-4 w-4" />}
                  {isSubmitting ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// ──────────────────────────────────────────────
// SUB-COMPONENTS FOR CATEGORIZED VIEW
// ──────────────────────────────────────────────

interface UserSectionProps {
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
  count: number;
  children: React.ReactNode;
  isSubSection?: boolean;
}

function UserSection({ title, icon, subtitle, count, children, isSubSection }: UserSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={cn(
      "overflow-hidden transition-all duration-300",
      isSubSection ? "bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border border-slate-100 dark:border-slate-800" : ""
    )}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-5 flex items-center justify-between cursor-pointer group select-none",
          !isSubSection && "border-b border-slate-100 dark:border-slate-800"
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-xl transition-all duration-300 shadow-sm",
            isOpen ? "bg-white dark:bg-slate-800 rotate-0" : "bg-slate-100 dark:bg-slate-900 -rotate-6"
          )}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className={cn(
                "font-bold tracking-tight uppercase transition-colors",
                isSubSection ? "text-base text-slate-700 dark:text-slate-200" : "text-lg text-slate-900 dark:text-white"
              )}>
                {title}
              </h2>
              <span className="relative flex items-center gap-2">
                <span className="bg-slate-100 dark:bg-indigo-500/10 text-slate-500 dark:text-indigo-300 text-[9px] font-bold px-2.5 py-1 rounded-lg ring-1 ring-slate-200 dark:ring-indigo-500/20 tracking-wider">
                  {count} {count === 1 ? 'ACCOUNT' : 'ACCOUNTS'}
                </span>
                {!isSubSection && <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>}
              </span>
            </div>
            {subtitle && !isSubSection && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{subtitle}</p>}
          </div>
        </div>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
          isOpen ? "bg-slate-900 text-white border-slate-900 rotate-90" : "bg-white text-slate-400 border-slate-100 dark:bg-slate-800 dark:border-slate-800 rotate-0 group-hover:bg-slate-50"
        )}>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
      
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
}

interface UserTableProps {
  users: User[];
  classes: Class[];
  allUsers: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (user: User) => void;
}

function UserTable({ users, classes, allUsers, onEdit, onDelete, onToggleStatus }: UserTableProps) {
  return (
    <Card className="overflow-hidden border-none shadow-none bg-transparent rounded-none">
      <div className="lms-table-container">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead className="bg-slate-50/50 dark:bg-slate-800/10">
            <tr>
              <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Member Name</th>
              <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Account Role</th>
              <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Contact Details</th>
              <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {users.map((user) => (
              <tr key={user.id} className="group hover:bg-white dark:hover:bg-slate-800/80 transition-all">
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 flex-shrink-0 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-base font-bold shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase truncate max-w-[160px]">{user.name}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                         <Fingerprint className="h-3 w-3 text-slate-300" />
                         <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase dark:text-slate-500">{user.schoolId}</div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <span className="px-3 py-1.5 inline-flex text-[10px] font-bold uppercase tracking-widest rounded-lg bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700/50">
                    {user.role}
                  </span>
                  {user.role === 'student' && user.classId && (
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                       <FolderOpen className="h-3 w-3 text-slate-300" />
                       Class: {classes.find(c => c.id === user.classId)?.name}
                    </div>
                  )}
                  {user.role === 'parent' && user.studentIds && user.studentIds.length > 0 && (
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 space-y-1">
                      {user.studentIds.map(sid => {
                        const child = allUsers.find(u => u.id === sid);
                        return child ? (
                          <div key={sid} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <Plus className="h-2.5 w-2.5" />
                            <span>Child: {child.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-100 truncate max-w-[180px]">{user.email || 'N/A'}</div>
                  <div className="text-[10px] text-slate-400 font-bold tracking-widest mt-1.5 uppercase leading-none">{user.phone || 'NO_PHONE_LINK'}</div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <button 
                    onClick={() => onToggleStatus(user)}
                    className={cn(
                      "px-4 py-2 inline-flex text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm border",
                      user.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50 hover:bg-emerald-500 hover:text-white' 
                        : 'bg-rose-50 text-rose-700 border-rose-100/50 hover:bg-rose-500 hover:text-white'
                    )}
                  >
                    {user.status === 'active' ? 'Authorized' : 'Suspended'}
                  </button>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all translate-x-3 group-hover:translate-x-0">
                    <Button size="icon" variant="ghost" onClick={() => onEdit(user)} className="h-10 w-10 rounded-xl bg-slate-50/50 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-soft transition-all dark:bg-slate-800 dark:hover:bg-slate-700">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(user.id)} className="h-10 w-10 rounded-xl bg-rose-50/50 text-rose-300 hover:text-rose-600 hover:bg-white hover:shadow-soft transition-all dark:bg-rose-900/10 dark:hover:bg-rose-900/30">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
