import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext/LanguageContext';
import { 
  getAllUsers, getAllClasses, getAllFeeRecords, getAllExpenses, 
  getAllAttendance, getAllExamResults,
  getAverageResultByClass
} from '../../lib/api';
import { User, Class, FeeRecord, Expense, ExamResult } from '../../types';
import {
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { 
  Users, GraduationCap, IndianRupee, TrendingUp, 
  Award, ShieldCheck, Zap, Activity, PieChart, Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import { FinancialPulse } from '../../components/dashboard/FinancialPulse';

export function PrincipalDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [u, c, f, e, r] = await Promise.all([
        getAllUsers(), 
        getAllClasses(), 
        getAllFeeRecords(), 
        getAllExpenses(), 
        getAllExamResults()
      ]);
      setUsers(u); 
      setClasses(c); 
      setFees(f); 
      setExpenses(e); 
      setExamResults(r);
    } catch (error) { 
       console.error(error); 
    } finally { 
       setIsLoading(false); 
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const studentsCount = users.filter(u => u.role === 'student').length;
  const teachersCount = users.filter(u => u.role === 'teacher').length;
  const totalRevenue = fees.reduce((s, f) => s + f.paid, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  // Academic Heatmap Data
  const heatmapData = getAverageResultByClass(examResults, classes).slice(0, 10);

  // Financial Trend Data (Simplified Monthly)
  const financialTrend = [
    { name: 'Sep', revenue: 45000, expenses: 32000 },
    { name: 'Oct', revenue: 52000, expenses: 34000 },
    { name: 'Nov', revenue: 48000, expenses: 35000 },
    { name: 'Dec', revenue: 61000, expenses: 38000 },
    { name: 'Jan', revenue: 55000, expenses: 36000 },
    { name: 'Feb', revenue: 58000, expenses: 37000 },
    { name: 'Mar', revenue: totalRevenue / 2, expenses: totalExpenses / 2 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-2xl md:rounded-[2.5rem] p-6 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 mesh-emerald opacity-30 blur-3xl -mr-48 -mt-48 animate-pulse-slow" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div className="text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
                 <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-500/30 backdrop-blur-md">
                    Institutional Governance
                 </span>
                 <span className="flex items-center gap-1.5 text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3" /> Executive Access
                 </span>
              </div>
              <h1 className="text-2xl md:text-5xl font-black tracking-tighter mb-2 uppercase italic">
                 Academic <span className="text-emerald-400">Leadership.</span>
              </h1>
              <p className="text-slate-400 text-sm md:text-base font-medium max-w-lg leading-relaxed italic">
                 Welcome, Principal {user?.name?.split(' ')[0] || 'User'}. Institutional metrics, staff performance, and academic trends are synchronized.
              </p>
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <Button asChild className="w-full md:h-14 px-8 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 text-xs md:text-sm">
                 <Link to="/principal/reports"><PieChart className="h-4 w-4 mr-2" /> View Analytics</Link>
              </Button>
           </div>
        </div>
      </div>

      <FinancialPulse />

      {/* Bento Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Enrollment', value: studentsCount, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/20' },
          { label: 'Academic Staff', value: teachersCount, icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/20' },
          { label: 'Avg Results', value: '84%', icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/20' },
          { label: 'Instit. Health', value: 'Optimal', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10', glow: 'shadow-orange-500/20' },
        ].map((stat, i) => (
          <div key={i} className={cn("group p-6 md:p-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] hover:scale-[1.03] transition-all duration-500 cursor-default", stat.glow)}>
             <div className="flex justify-between items-start mb-6">
                <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                   <stat.icon className="h-6 w-6" />
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-glow-pulse" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 italic">{stat.label}</p>
             <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Academic Analytics Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Financial & Growth Velocity</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1">Institutional Revenue Projection</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 rounded-2xl">
                 <TrendingUp className="h-5 w-5" />
              </div>
           </div>
           
           <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={financialTrend}>
                    <defs>
                       <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                    <Tooltip cursor={{stroke: '#10b981', strokeWidth: 2}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Academic Radar */}
        <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[2.5rem] text-white overflow-hidden relative">
           <div className="absolute inset-0 mesh-emerald opacity-20 pointer-events-none" />
           <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                 </div>
                 <div>
                    <h2 className="text-lg font-bold uppercase tracking-tight italic">Performance Heatmap</h2>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Grade Distribution Matrix</p>
                 </div>
              </div>

              <div className="h-64 relative mb-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={heatmapData}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 8, fontWeight: 800}} />
                       <Radar name="Class Performance" dataKey="avg" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>

              <div className="space-y-4 mt-auto">
                 <button className="w-full flex items-center justify-between p-5 bg-white/5 rounded-2xl hover:bg-emerald-500/10 transition-all group border border-white/5">
                    <div className="flex items-center gap-3">
                       <Award className="h-5 w-5 text-amber-500" />
                       <div className="text-left">
                          <p className="text-xs font-bold uppercase italic tracking-tight text-white">Top Performing Class</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none">8th Grade (92%)</p>
                       </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Institutional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-6">Critical Audit Registry</h2>
            <div className="space-y-4">
               {[
                 { label: 'Fee Overdue Notices', count: 12, icon: IndianRupee, status: 'Urgent', color: 'text-rose-500', bg: 'bg-rose-500/10' },
                 { label: 'Staff Performance Reviews', count: 4, icon: Users, status: 'Pending', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                 { label: 'New Inquiry Synchronized', count: 2, icon: Activity, status: 'Review', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
               ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:border-emerald-500/20 transition-all border border-transparent group">
                     <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl shadow-sm", item.bg, item.color)}>
                           <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{item.label}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{item.count} Registered Objects</p>
                        </div>
                     </div>
                     <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", item.bg, item.color)}>
                        {item.status}
                     </span>
                  </div>
               ))}
            </div>
         </div>

         {/* Principal's Mission Control */}
         <div className="premium-shadow glass-premium rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col justify-center border border-white/20">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
               <Zap className="w-64 h-64 text-emerald-600 shadow-emerald-500/50" />
            </div>
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                     <Zap className="h-6 w-6" />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold uppercase tracking-tight italic">System Integrity</h3>
                     <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic tracking-tighter">Operational Efficiency: 98%</p>
                  </div>
               </div>
               
               <div className="bg-white/40 dark:bg-slate-800/40 p-8 rounded-[2rem] border border-white/60 dark:border-slate-700/60 backdrop-blur-md mb-6">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic leading-none">Next Milestone</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4 italic">Annual Academic Audit</p>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                     <div className="h-full bg-emerald-500 w-[65%] shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                  </div>
               </div>
               
               <Button asChild className="w-full h-14 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 group">
                  <Link to="/principal/exam-results">Execute Final Review <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
}
