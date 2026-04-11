import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { updateUser } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { User, Lock, Save, Moon, Sun, Camera, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { cn } from '../../lib/utils';

export function ProfileSettings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateUser(user.id, { 
        name: profileName, 
        email: profileEmail, 
        phone: profilePhone,
        profilePic: profilePic 
      });
      toast.success('Profile Synchronization Complete', {
        description: 'Your institutional identity has been updated across the network.'
      });
    } catch (error) {
       toast.error('Synchronization Failure', {
         description: 'Failed to update profile data. Please try again later.'
       });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Credential Mismatch', {
        description: 'The provided passwords do not match. Please verify your entries.'
      });
      return;
    }
    if (!user) return;
    
    try {
      await updateUser(user.id, { password: newPassword });
      toast.success('Access Credentials Rotated', {
          description: 'Your security protocols have been successfully updated.'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Security Update Failed', {
        description: 'Unable to rotate your access credentials at this time.'
      });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Premium Header Card */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Manage your institutional presence and security configurations.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setTheme('light')}
            className={cn(
                "px-4 py-2 rounded-lg transition-all text-sm font-semibold flex items-center gap-2",
                theme === 'light' ? "bg-white text-orange-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Sun className="h-4 w-4" /> Light
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className={cn(
                "px-4 py-2 rounded-lg transition-all text-sm font-semibold flex items-center gap-2",
                theme === 'dark' ? "bg-slate-900 text-indigo-400 shadow-sm ring-1 ring-white/10" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Moon className="h-4 w-4" /> Dark
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-1">
           {[
             { id: 'profile', label: 'Profile Information', icon: User },
             { id: 'security', label: 'Security & Access', icon: Lock }
           ].map(tab => (
             <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                    "w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-bold transition-all border-l-4",
                    activeTab === tab.id 
                    ? "bg-white dark:bg-slate-900 text-indigo-600 border-indigo-600 shadow-sm" 
                    : "text-slate-500 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700"
                )}
             >
               <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-indigo-600" : "text-slate-400")} /> 
               {tab.label}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-8 md:p-10">
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="space-y-10">
                  {/* Identity Header */}
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-slate-100 dark:border-slate-800 pb-10">
                     <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex items-center justify-center text-slate-400 text-4xl font-bold">
                          {profilePic ? <img src={profilePic} className="w-full h-full object-cover" /> : profileName?.charAt(0) || '?'}
                        </div>
                        {user?.role !== 'student' && (
                          <div className="absolute -bottom-2 -right-2 flex gap-1">
                             <button type="button" className="p-2.5 bg-indigo-600 text-white shadow-lg rounded-xl hover:bg-indigo-700 transition-all active:scale-95">
                               <Camera className="h-4 w-4" />
                             </button>
                          </div>
                        )}
                     </div>
                     <div className="flex-1 space-y-3 text-center md:text-left">
                        <div>
                           <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                             {user?.name}
                             <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] uppercase font-bold tracking-wider">Verified</span>
                           </h3>
                           <p className="text-sm text-slate-500 font-medium mt-0.5 uppercase tracking-wide">Institutional ID: {user?.schoolId}</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase rounded-lg border border-slate-200 dark:border-slate-700">Role: {user?.role}</span>
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase rounded-lg border border-slate-200 dark:border-slate-700">Session: 2023-24</span>
                        </div>
                     </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { id: 'name', label: 'Full Official Name', value: profileName, setter: setProfileName, type: 'text' },
                        { id: 'email', label: 'Institutional Email Address', value: profileEmail, setter: setProfileEmail, type: 'email' },
                        { id: 'phone', label: 'Primary Contact Number', value: profilePhone, setter: setProfilePhone, type: 'text' },
                        { id: 'pic', label: 'Profile Asset URL', value: profilePic, setter: setProfilePic, type: 'text', placeholder: 'https://...' }
                    ].map(field => (
                        <div key={field.id} className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                            <input 
                                required 
                                type={field.type} 
                                readOnly={user?.role === 'student' && field.id !== 'pic'} 
                                value={field.value} 
                                placeholder={field.placeholder}
                                onChange={e => field.setter(e.target.value)} 
                                className={cn(
                                    "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3.5 font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm outline-none", 
                                    (user?.role === 'student' && field.id !== 'pic') && "opacity-60 cursor-not-allowed bg-slate-100"
                                )} 
                            />
                        </div>
                    ))}
                  </div>

                  {user?.role === 'student' && (
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-start gap-4">
                       <AlertTriangle className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-tight">Access Control Limitation</p>
                          <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium leading-relaxed mt-1 italic">
                             Official metadata (Name, Email, Phone) is locked for students. Please contact the administrative department for data synchronization.
                          </p>
                       </div>
                    </div>
                  )}

                  {user?.role !== 'student' && (
                    <div className="pt-10 flex justify-end">
                      <Button type="submit" className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-[0.15em] flex items-center gap-2 shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
                        <Save className="h-4 w-4" /> Save Configuration
                      </Button>
                    </div>
                  )}
                </form>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handlePasswordUpdate} className="space-y-10">
                  <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-4 shadow-sm">
                     <ShieldCheck className="h-6 w-6 text-indigo-600 shrink-0 mt-1" />
                     <div>
                       <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Credential Security Protocols</h4>
                       <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                         Updating your access credentials will immediately invalidate all active sessions across other devices. Ensure your new sequence is high-complexity.
                       </p>
                     </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-2 max-w-md">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Current Password Verification</label>
                      <input required type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3.5 font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm outline-none" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">New Access String</label>
                         <input required type="password" minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3.5 font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm outline-none" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Confirm New Sequence</label>
                         <input required type="password" minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3.5 font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 flex justify-end">
                    <Button type="submit" className="h-14 px-10 rounded-2xl bg-indigo-600 text-white font-bold uppercase tracking-[0.15em] flex items-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                      <Lock className="h-4 w-4" /> Rotate Credentials
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
