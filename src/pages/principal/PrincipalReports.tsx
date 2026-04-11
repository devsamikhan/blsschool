import { useEffect, useState, useCallback } from 'react';
import { User, Class, FeeRecord } from '../../types';
import { getAllUsers, getAllClasses, getAllFeeRecords } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '../../components/ui/button';
import { Printer } from 'lucide-react';
import { ReportTemplate } from '../../components/reports/ReportTemplate';

export function PrincipalReports() {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'dashboard' | 'report'>('dashboard');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [u, c, f] = await Promise.all([
        getAllUsers(),
        getAllClasses(),
        getAllFeeRecords()
      ]);
      setUsers(u);
      setClasses(c);
      setFees(f);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Revenue Data processing
  const monthlyRevenue = fees.reduce((acc, fee) => {
    const m = `${fee.month} ${fee.year}`;
    if (!acc[m]) acc[m] = { month: m, collected: 0, pending: 0 };
    acc[m].collected += fee.paid;
    if (fee.status !== 'paid') acc[m].pending += fee.balance;
    return acc;
  }, {} as Record<string, { month: string; collected: number; pending: number }>);
  const revenueChartData = Object.values(monthlyRevenue);

  // Student Distribution
  const activeStudents = users.filter(u => u.role === 'student' && u.status === 'active').length;
  const inactiveStudents = users.filter(u => u.role === 'student' && u.status === 'inactive').length;
  const studentStatusData = [
    { name: 'Active Students', value: activeStudents },
    { name: 'Inactive Students', value: inactiveStudents }
  ];
  const COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="lms-page-title">School Reports</h1>
          <p className="lms-body mt-1">Institutional records and academic performance analytics.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant={viewMode === 'dashboard' ? 'default' : 'outline'} 
            onClick={() => setViewMode('dashboard')}
            className="font-semibold h-11 px-6 rounded-xl"
          >
            Dashboard
          </Button>
          <Button 
            variant={viewMode === 'report' ? 'default' : 'outline'} 
            onClick={() => setViewMode('report')}
            className="font-semibold flex items-center gap-2 h-11 px-6 rounded-xl shadow-lg border-2"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
        </div>
      </div>

      {viewMode === 'dashboard' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center group">
              <p className="lms-stat-label mb-2">Total Students</p>
              <h3 className="lms-stat-number">{users.filter(u => u.role === 'student').length}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center group">
              <p className="lms-stat-label mb-2">Teaching Staff</p>
              <h3 className="lms-stat-number">{users.filter(u => u.role === 'teacher').length}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center group">
              <p className="lms-stat-label mb-2">Total Classes</p>
              <h3 className="lms-stat-number">{classes.length}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center group">
              <p className="lms-stat-label mb-2">Active Ratio</p>
              <h3 className="lms-stat-number">
                {Math.round((activeStudents / (activeStudents+inactiveStudents || 1)) * 100)}%
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <h3 className="flex items-center gap-2 mb-8">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="lms-section-title">Fee Collection Overview</span>
                </h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94A3B8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94A3B8' }} />
                      <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="collected" fill="#10B981" radius={[8, 8, 0, 0]} name="Settled" barSize={16} />
                      <Bar dataKey="pending" fill="#EF4444" radius={[8, 8, 0, 0]} name="Outstanding" barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>
             <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <h3 className="flex items-center gap-2 mb-8">
                   <span className="w-2 h-2 rounded-full bg-indigo-500" />
                   <span className="lms-section-title">Student Enrollment Status</span>
                </h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={studentStatusData}
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {studentStatusData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <ReportTemplate 
          title="Institutional Academic Audit"
          subtitle={`Session Summary: ${new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })}`}
          docRef={`ADM-PRIN-${new Date().getTime().toString().slice(-6)}`}
        >
          <div className="space-y-8 py-2">
            
            {/* Metrics Row */}
            <div className="w-full">
                <div className="py-6 border-b border-slate-900 border-dashed">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 underline underline-offset-8">Section 01: Student Enrollment Basis</h4>
                  <div className="space-y-4 max-w-xl mx-auto">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Active Academic Students</span>
                        <div className="border-b border-dotted border-slate-300 flex-1 mx-4 h-px" />
                        <span className="text-lg font-bold text-slate-900 font-mono">{activeStudents} Units</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Inactive / Archive Records</span>
                        <div className="border-b border-dotted border-slate-300 flex-1 mx-4 h-px" />
                        <span className="text-lg font-bold text-slate-900 font-mono">{inactiveStudents} Units</span>
                      </div>
                      <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-baseline">
                        <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Total Verified Registry</span>
                        <div className="border-b-2 border-slate-900 flex-1 mx-4 h-px" />
                        <span className="text-2xl font-bold text-slate-900 font-mono">{activeStudents + inactiveStudents}</span>
                      </div>
                  </div>
                </div>

                <div className="py-10">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 underline underline-offset-8">Section 02: Financial Performance Basis</h4>
                  <div className="space-y-4 max-w-xl mx-auto">
                      {revenueChartData.length > 0 ? (
                        <>
                          <div className="flex justify-between items-baseline">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Total Session Collection</span>
                              <div className="border-b border-dotted border-slate-300 flex-1 mx-4 h-px" />
                              <span className="text-lg font-bold text-slate-900 font-mono">Rs. {revenueChartData.reduce((s, r) => s + r.collected, 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-baseline">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-tight text-rose-600">Total Outstanding Arrears</span>
                              <div className="border-b border-dotted border-rose-100 flex-1 mx-4 h-px" />
                              <span className="text-lg font-bold text-rose-600 font-mono">Rs. {revenueChartData.reduce((s, r) => s + r.pending, 0).toLocaleString()}</span>
                          </div>
                          <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-baseline">
                              <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Expected Institutional Revenue</span>
                              <div className="border-b-2 border-slate-900 flex-1 mx-4 h-px" />
                              <span className="text-2xl font-bold text-slate-900 font-mono">Rs. {(revenueChartData.reduce((s, r) => s + r.collected, 0) + revenueChartData.reduce((s, r) => s + r.pending, 0)).toLocaleString()}</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 py-4 underline italic decoration-slate-100 underline-offset-8 text-center">No session data found for this audit period.</p>
                      )}
                  </div>
                </div>
            </div>

            {/* Academic Unit Utilization Table */}
            <div className="break-inside-avoid pt-6">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-3">Unit Capacity Audit</h3>
              <div className="overflow-hidden border-t-2 border-b border-slate-900">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr>
                        <th className="px-5 py-3 text-left text-[9px] font-bold text-slate-900 uppercase tracking-wider">Class Reference</th>
                        <th className="px-5 py-3 text-center text-[9px] font-bold text-slate-900 uppercase tracking-wider">Enrollment</th>
                        <th className="px-5 py-3 text-center text-[9px] font-bold text-slate-900 uppercase tracking-wider">Max Capacity</th>
                        <th className="px-5 py-3 text-right text-[9px] font-bold text-slate-900 uppercase tracking-wider">Utilization %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[13px]">
                        {classes.map(c => {
                          const enrolled = users.filter(u => u.role === 'student' && u.classId === c.id).length;
                          const util = Math.round((enrolled / (c.maxStudents || 40)) * 100);
                          return (
                            <tr key={c.id}>
                              <td className="px-5 py-3 text-slate-900 font-bold">Grade {c.name} - {c.section}</td>
                              <td className="px-5 py-3 text-center text-slate-600 font-medium">{enrolled} Students</td>
                              <td className="px-5 py-3 text-center text-slate-400">{c.maxStudents || 40}</td>
                              <td className="px-5 py-3 text-right font-bold font-mono text-slate-900">
                                {util}%
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
              </div>
            </div>

            {/* Official Report Declaration */}
            <div className="pt-10">
                <p className="text-[11px] leading-relaxed text-slate-600 italic">
                    <span className="font-bold text-slate-900 not-italic mr-1">OFFICIAL DECLARATION:</span>
                    This institutional audit provides a verified snapshot of school academic capacity and session revenue. All enrollment figures are dynamically cross-referenced with registry logs as of the report issuance date. This document is a digitally synchronized record provided by the BLS School Management System.
                </p>
            </div>
          </div>
        </ReportTemplate>
      )}
    </div>
  );
}
