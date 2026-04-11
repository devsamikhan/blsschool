import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { School, User, Lock, Save, Globe, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { ProfileSettings } from '../shared/ProfileSettings';

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  
  // School Info State (Mock for now)
  const [schoolName, setSchoolName] = useState('Blended Learning School');
  const [schoolAddress, setSchoolAddress] = useState('123 Education Boulevard, Lahore');
  const [academicYear, setAcademicYear] = useState('2025-2026');

  const handleSchoolUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Institutional configurations synchronized successfully (MOCK)');
  };

  if (activeTab === 'profile' || activeTab === 'security') {
    // We could wrap ProfileSettings but the universal one is already linked in sidebar.
    // However, for the 'Settings' link in Admin sidebar, we want a unified experience.
    // I'll merge them here.
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Registry & System.</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium italic mb-8">Maintain the core institutional identity and security protocols.</p>
          
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 italic' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              onClick={() => setActiveTab('profile')}
            >
              Institutional Profile
            </button>
            <button 
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'school' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 italic' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              onClick={() => setActiveTab('school')}
            >
              School Identity
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {activeTab === 'profile' ? (
          <ProfileSettings />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-2xl shadow-slate-200/50">
             <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">School Identity Hub</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Global Institutional Configuration</p>
                </div>
             </div>

             <form onSubmit={handleSchoolUpdate} className="space-y-8 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Institution Name</label>
                  <input required type="text" value={schoolName} onChange={e => setSchoolName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-amber-500/5 transition-all italic text-sm" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Headquarters Address</label>
                  <textarea required rows={3} value={schoolAddress} onChange={e => setSchoolAddress(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-amber-500/5 transition-all italic text-sm" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Active Academic Era</label>
                    <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-amber-500/5 transition-all italic text-sm">
                      <option value="2024-2025">Cycle 2024 - 2025</option>
                      <option value="2025-2026">Cycle 2025 - 2026</option>
                      <option value="2026-2027">Cycle 2026 - 2027</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Security Level</label>
                    <div className="h-14 bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-6 flex items-center justify-between">
                       <span className="text-xs font-black uppercase text-slate-900 dark:text-white italic">Tier 3 Encryption</span>
                       <Shield className="h-4 w-4 text-emerald-500" />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                  <Button type="submit" className="h-14 px-10 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest italic flex items-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition-all">
                    <Save className="h-4 w-4" /> Synchronize Identity
                  </Button>
                </div>
             </form>
          </div>
        )}
      </div>
    </div>
  );
}
