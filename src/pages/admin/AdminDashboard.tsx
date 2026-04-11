import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { getAllUsers, getAllClasses, getAllFeeRecords, getAllHomework } from '../../lib/api';
import { User, Class, FeeRecord, Homework } from '../../types';
import { Users, BookOpen, CreditCard, Activity, Plus, TrendingUp, Sparkles, ShieldCheck, ArrowRight, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { formatCurrency } from '../../lib/utils';
import { EVENTS, useEventListener } from '../../lib/events';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FinancialPulse } from '../../components/dashboard/FinancialPulse';
import { cn } from '../../lib/utils';
import { BentoSkeleton, Skeleton } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';

export function AdminDashboard() {
   const { user } = useAuth();
   const queryClient = useQueryClient();

   // ─── POWERFUL DATA FETCHING ───
   const { data: users = [], isLoading: usersLoading } = useQuery({
      queryKey: ['users'],
      queryFn: getAllUsers
   });

   const { data: classes = [], isLoading: classesLoading } = useQuery({
      queryKey: ['classes'],
      queryFn: getAllClasses
   });

   const { data: fees = [], isLoading: feesLoading } = useQuery({
      queryKey: ['feeRecords'],
      queryFn: getAllFeeRecords
   });

   const { data: homeworks = [], isLoading: homeworksLoading } = useQuery({
      queryKey: ['homework'],
      queryFn: getAllHomework
   });

   const isLoading = usersLoading || classesLoading || feesLoading || homeworksLoading;

   // ─── REAL-TIME SYNC BRIDGE ───
   useEventListener(EVENTS.USER_CHANGE, () => queryClient.invalidateQueries({ queryKey: ['users'] }));
   useEventListener(EVENTS.CLASS_CHANGE, () => queryClient.invalidateQueries({ queryKey: ['classes'] }));
   useEventListener(EVENTS.FEE_CHANGE, () => queryClient.invalidateQueries({ queryKey: ['feeRecords'] }));
   useEventListener(EVENTS.HOMEWORK_CHANGE, () => queryClient.invalidateQueries({ queryKey: ['homework'] }));

   if (isLoading) {
      return (
         <div className="space-y-8 animate-in fade-in duration-500">
            <Skeleton className="h-64 w-full rounded-[2.5rem]" />
            <BentoSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <Skeleton className="h-[400px] rounded-[2.5rem]" />
               <Skeleton className="h-[400px] rounded-[2.5rem]" />
            </div>
         </div>
      );
   }

   const students = users.filter(u => u.role === 'student');
   const teachers = users.filter(u => u.role === 'teacher');

   const roleData = [
      { name: 'Students', value: students.length },
      { name: 'Teachers', value: teachers.length },
      { name: 'Other Staff', value: users.length - students.length - teachers.length }
   ];
   const COLORS = ['#6366f1', '#10b981', '#f59e0b'];

   const classData = classes.map(c => ({
      name: c.name,
      students: users.filter(u => u.role === 'student' && u.classId === c.id).length
   }));

   const recentUsers = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

   return (
      <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
         {/* Premium Header */}
         <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-14 text-white shadow-premium">
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/10 blur-[120px] -mr-48 -mt-48 animate-pulse-slow" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-10">
               <div className="space-y-3 md:space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                     <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-indigo-500/30 backdrop-blur-md">
                        System Administration
                     </span>
                  </div>
                  <h1 className="text-3xl md:text-6xl font-bold tracking-tight uppercase leading-tight">
                     Dashboard <span className="text-indigo-400">Overview</span>
                  </h1>
                  <p className="text-slate-400 font-medium max-w-xl leading-relaxed text-xs md:text-base">
                     Institutional metrics and cross-departmental synchronizations are active. Hello, {user?.name?.split(' ')[0] || 'Administrator'}.
                  </p>
               </div>
               <div className="flex w-full md:w-auto gap-4">
                  <Button asChild className="w-full md:w-auto h-12 md:h-14 px-6 md:px-10 rounded-xl md:rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold uppercase tracking-widest shadow-xl transition-all active:scale-95 text-[10px] md:text-xs">
                     <Link to="/admin/users" className="flex items-center justify-center"><Users className="h-4 w-4 mr-2" /> Global Registry</Link>
                  </Button>
               </div>
            </div>
         </div>

         <FinancialPulse />

         {/* Bento Stats Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
               { label: 'Enrolled Students', value: students.length, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10', glow: 'shadow-indigo-500/10' },
               { label: 'Academic Faculty', value: teachers.length, icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/10' },
               { label: 'Course Units', value: classes.length, icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/10' },
               { label: 'Network Load', value: users.length, icon: Activity, color: 'text-rose-500', bg: 'bg-rose-500/10', glow: 'shadow-rose-500/10' },
            ].map((stat, i) => (
               <div key={i} className={cn("group p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-[2.5rem] hover:scale-[1.02] transition-all duration-500 shadow-soft", stat.glow)}>
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                     <div className={cn("p-3 md:p-4 rounded-xl md:rounded-2xl", stat.bg, stat.color)}>
                        <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
                     </div>
                     <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Live</span>
                     </div>
                  </div>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1 md:mb-2">{stat.label}</p>
                  <p className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
               </div>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Growth Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-soft">
               <div className="flex items-center justify-between mb-10">
                  <div>
                     <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Academic Distribution</h2>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Enrollment Density Across Operational Units</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-400 rounded-2xl">
                     <TrendingUp className="h-5 w-5" />
                  </div>
               </div>

               <div className="h-[350px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={classData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }} />
                        <Bar dataKey="students" fill="#6366f1" radius={[8, 8, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Role Breakdown */}
            <div className="bg-slate-900 dark:bg-slate-950 p-10 rounded-[2.5rem] text-white shadow-premium relative overflow-hidden">
               <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
               <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-10">
                     <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-md border border-white/5">
                        <Sparkles className="h-5 w-5 text-indigo-400" />
                     </div>
                     <div>
                        <h2 className="text-lg font-bold uppercase tracking-tight">Institutional Demographics</h2>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Registry Composition</p>
                     </div>
                  </div>

                  <div className="h-64 relative mb-6">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={roleData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={10} dataKey="value" stroke="none">
                              {roleData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                           <Tooltip />
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                           <p className="text-4xl font-bold tracking-tight text-white">{users.length}</p>
                           <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Entites</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4 mt-auto">
                     {roleData.map((role, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/5 p-5 rounded-[1.5rem] border border-white/5 shadow-sm transform hover:scale-[1.02] transition-transform">
                           <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">{role.name}</span>
                           </div>
                           <span className="text-sm font-bold text-indigo-400">{((role.value / (users.length || 1)) * 100).toFixed(0)}%</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Recent Activity Section */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-soft">
               <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-8">Recent Registry Events</h2>
               <div className="space-y-5">
                  {recentUsers.length === 0 ? (
                     <EmptyState
                        icon={Users}
                        title="No Recent Activity"
                        description="New registry events will appear here once users are onboarded into the system."
                     />
                  ) : (
                     recentUsers.map((u, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/40 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 group">
                           <div className="flex items-center gap-5">
                              <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform uppercase">
                                 {u.name.charAt(0)}
                              </div>
                              <div className="space-y-1">
                                 <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{u.name}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{u.role} Unit</p>
                              </div>
                           </div>
                           <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">
                              {new Date(u.createdAt).toLocaleDateString()}
                           </span>
                        </div>
                     ))
                  )}
               </div>
            </div>

            {/* System Health Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-soft relative overflow-hidden flex flex-col justify-center">
               <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
                  <Activity className="w-64 h-64 text-slate-400" />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                     <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                        <Activity className="h-7 w-7" />
                     </div>
                     <div>
                        <h3 className="text-xl font-bold uppercase tracking-tight">System Integrity</h3>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-1">Health Matrix: Operational</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="bg-slate-50 dark:bg-slate-800/80 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 backdrop-blur-md">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Registry Integrity</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">100%</p>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-800/80 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 backdrop-blur-md">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Network Latency</p>
                        <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">Peak</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
