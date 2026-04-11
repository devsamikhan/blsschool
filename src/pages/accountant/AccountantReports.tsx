import { useEffect, useState } from 'react';
import { FeeRecord, Expense } from '../../types';
import { getAllFeeRecords, getAllExpenses } from '../../lib/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '../../components/ui/button';
import { Download, IndianRupee, TrendingDown, FileText, Printer } from 'lucide-react';
import { ReportTemplate } from '../../components/reports/ReportTemplate';

export function AccountantReports() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState<'overview' | 'monthly' | 'category'>('overview');
  const [viewMode, setViewMode] = useState<'dashboard' | 'report'>('dashboard');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [f, e] = await Promise.all([getAllFeeRecords(), getAllExpenses()]);
        setFees(f);
        setExpenses(e);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="text-center py-12 italic font-bold text-slate-400">Synchronizing Financial Ledger...</div>;

  // Data processing
  const totalRevenue = fees.reduce((sum, f) => sum + f.paid, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  // Monthly Data
  const monthlyDataMap: Record<string, { month: string; revenue: number; expense: number }> = {};
  
  fees.forEach(f => {
    f.payments.forEach(p => {
       const date = new Date(p.date);
       const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
       if (!monthlyDataMap[monthKey]) monthlyDataMap[monthKey] = { month: monthKey, revenue: 0, expense: 0 };
       monthlyDataMap[monthKey].revenue += p.amount;
    });
  });

  expenses.forEach(e => {
    const date = new Date(e.date);
    const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    if (!monthlyDataMap[monthKey]) monthlyDataMap[monthKey] = { month: monthKey, revenue: 0, expense: 0 };
    monthlyDataMap[monthKey].expense += e.amount;
  });

  const monthlyChartData = Object.values(monthlyDataMap);

  // Expense by Category
  const expenseCategoryMap: Record<string, number> = {};
  expenses.forEach(e => {
    expenseCategoryMap[e.category] = (expenseCategoryMap[e.category] || 0) + e.amount;
  });
  const expensePieData = Object.entries(expenseCategoryMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  const PIE_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Financial Reports</h1>
          <p className="text-gray-500 italic dark:text-slate-400">Institutional fiscal audit and cash-flow analytics.</p>
        </div>
        <div className="flex gap-3">
           <Button 
            variant={viewMode === 'dashboard' ? 'default' : 'outline'} 
            onClick={() => setViewMode('dashboard')}
            className="uppercase tracking-widest text-[10px] font-black"
          >
            Insights & Analytics
          </Button>
          <Button 
            variant={viewMode === 'report' ? 'default' : 'outline'} 
            onClick={() => setViewMode('report')}
            className="uppercase tracking-widest text-[10px] font-black flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Official Print
          </Button>
        </div>
      </div>

      {viewMode === 'dashboard' ? (
        <div className="space-y-6">
          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border-2 border-emerald-50 shadow-sm transition-all hover:scale-[1.02] dark:bg-slate-900">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 bg-emerald-100/50 rounded-xl text-emerald-600">
                  <IndianRupee className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">Collected</span>
              </div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1 dark:text-slate-400">Total Revenue</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">Rs. {totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border-2 border-rose-50 shadow-sm transition-all hover:scale-[1.02] dark:bg-slate-900">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 bg-rose-100/50 rounded-xl text-rose-600">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-full uppercase">Outflow</span>
              </div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1 dark:text-slate-400">Total Expenses</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">Rs. {totalExpenses.toLocaleString()}</h3>
            </div>
            <div className={`bg-white p-6 rounded-2xl border-2 shadow-sm transition-all hover:scale-[1.02] ${netIncome >= 0 ? 'border-blue-50' : 'border-amber-50'}`}>
              <div className="flex justify-between items-center mb-4">
                <div className={`p-3 rounded-xl ${netIncome >= 0 ? 'bg-blue-100/50 text-blue-600' : 'bg-amber-100/50 text-amber-600'}`}>
                  <FileText className="h-6 w-6" />
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${netIncome >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>Net Position</span>
              </div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1 dark:text-slate-400">Current Balance</p>
              <h3 className={`text-2xl font-black ${netIncome >= 0 ? 'text-gray-900' : 'text-amber-700'}`}>Rs. {netIncome.toLocaleString()}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-50 shadow-sm dark:bg-slate-900">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 border-l-4 border-primary pl-3 dark:text-white">Income vs Expenditure Flux</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" fontSize={10} fontWeight="bold" />
                    <YAxis fontSize={10} fontWeight="bold" />
                    <RechartsTooltip />
                    <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="Collections" />
                    <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenditure" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-50 shadow-sm dark:bg-slate-900">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 border-l-4 border-primary pl-3 dark:text-white">Budget Allocation Audit</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expensePieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="flex flex-wrap gap-2 border-b border-gray-200 print:hidden dark:border-slate-800">
            <button 
              className={`px-4 py-2 text-sm font-black uppercase tracking-widest border-b-2 transition-colors ${reportType === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
              onClick={() => setReportType('overview')}
            >Overview Summary</button>
            <button 
              className={`px-4 py-2 text-sm font-black uppercase tracking-widest border-b-2 transition-colors ${reportType === 'monthly' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
              onClick={() => setReportType('monthly')}
            >Income Matrix</button>
            <button 
              className={`px-4 py-2 text-sm font-black uppercase tracking-widest border-b-2 transition-colors ${reportType === 'category' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
              onClick={() => setReportType('category')}
            >Expense Audit</button>
          </div>

          <ReportTemplate 
            title={reportType === 'overview' ? 'Financial Summary' : reportType === 'monthly' ? 'Income Statement' : 'Expenditure Audit'}
            subtitle={`Period Ending ${new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })}`}
            docRef={`FIN-${reportType.substring(0,3).toUpperCase()}-${new Date().getTime().toString().slice(-6)}`}
          >
            <div className="space-y-8 py-2">
              
              {reportType === 'overview' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-3 gap-[4mm]">
                      <div className="p-[4mm] border-2 border-emerald-100 bg-emerald-50/20 rounded-sm">
                        <p className="text-[8pt] font-black text-emerald-800 uppercase tracking-widest mb-1">Total Revenue</p>
                        <p className="text-[18pt] font-black text-emerald-700 leading-none">Rs. {totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="p-[4mm] border-2 border-rose-100 bg-rose-50/20 rounded-sm">
                        <p className="text-[8pt] font-black text-rose-800 uppercase tracking-widest mb-1">Total Expenses</p>
                        <p className="text-[18pt] font-black text-rose-700 leading-none">Rs. {totalExpenses.toLocaleString()}</p>
                      </div>
                      <div className={`p-[4mm] border-2 rounded-sm ${netIncome >= 0 ? 'border-indigo-100 bg-indigo-50/20' : 'border-amber-100 bg-amber-50/20'}`}>
                        <p className={`text-[8pt] font-black uppercase tracking-widest mb-1 ${netIncome >= 0 ? 'text-indigo-800' : 'text-amber-800'}`}>Net Balance</p>
                        <p className={`text-[18pt] font-black leading-none ${netIncome >= 0 ? 'text-indigo-700' : 'text-amber-700'}`}>
                          {netIncome < 0 && '-'}Rs. {Math.abs(netIncome).toLocaleString()}
                        </p>
                      </div>
                  </div>

                  <div className="break-inside-avoid">
                      <h3 className="text-[11pt] font-black text-gray-900 uppercase tracking-widest border-l-4 border-primary pl-3 mb-4 dark:text-white">Verified Fiscal Ledger</h3>
                      <div className="overflow-hidden border border-gray-200 rounded-sm dark:border-slate-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                          <thead className="bg-gray-50 uppercase text-[8pt] font-black tracking-widest text-gray-500 dark:bg-slate-800/50 dark:text-slate-400">
                            <tr>
                              <th className="px-5 py-3 text-left">Academic & Operational Item</th>
                              <th className="px-5 py-3 text-right">Credit (PKR)</th>
                              <th className="px-5 py-3 text-right">Debit (PKR)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-[10pt] font-bold dark:divide-slate-800">
                            <tr>
                              <td className="px-5 py-3 text-gray-700 dark:text-slate-200">Total Student Tuition Fees Collected</td>
                              <td className="px-5 py-3 text-right text-emerald-700">Rs. {totalRevenue.toLocaleString()}</td>
                              <td className="px-5 py-3 text-right text-gray-300">—</td>
                            </tr>
                            <tr>
                              <td className="px-5 py-3 text-gray-700 dark:text-slate-200">Total Instructional & Utility Expenses</td>
                              <td className="px-5 py-3 text-right text-gray-300">—</td>
                              <td className="px-5 py-3 text-right text-rose-700">Rs. {totalExpenses.toLocaleString()}</td>
                            </tr>
                            <tr className="bg-gray-50 font-black dark:bg-slate-800/50">
                              <td className="px-5 py-4 text-gray-900 uppercase tracking-tight dark:text-white">Closing Institutional Position</td>
                              <td colSpan={2} className={`px-5 py-4 text-right ${netIncome >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}>
                                {netIncome < 0 && 'DEFICIT '}Rs. {Math.abs(netIncome).toLocaleString()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                  </div>
                </div>
              )}

              {reportType === 'monthly' && (
                <div className="space-y-6">
                  <h3 className="text-[11pt] font-black text-gray-900 uppercase tracking-widest border-l-4 border-primary pl-3 mb-4 dark:text-white">Historical Performance Matrix</h3>
                  <div className="overflow-hidden border border-gray-200 rounded-sm dark:border-slate-800">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
                        <thead className="bg-gray-50 uppercase text-[8pt] font-black tracking-widest text-gray-400 dark:bg-slate-800/50">
                          <tr>
                            <th className="px-5 py-3 text-left">Academic Month</th>
                            <th className="px-5 py-3 text-right text-emerald-700">Revenue</th>
                            <th className="px-5 py-3 text-right text-rose-700">Expense</th>
                            <th className="px-5 py-3 text-right">Net Flux</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-[10pt] font-bold dark:divide-slate-800">
                          {monthlyChartData.slice(-10).map((data, idx) => (
                            <tr key={idx}>
                              <td className="px-5 py-2 text-gray-900 dark:text-white">{data.month}</td>
                              <td className="px-5 py-2 text-right text-emerald-700">Rs. {data.revenue.toLocaleString()}</td>
                              <td className="px-5 py-2 text-right text-rose-700">Rs. {data.expense.toLocaleString()}</td>
                              <td className={`px-5 py-2 text-right ${data.revenue - data.expense >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}>
                                Rs. {(data.revenue - data.expense).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportType === 'category' && (
                <div className="space-y-6">
                  <h3 className="text-[11pt] font-black text-gray-900 uppercase tracking-widest border-l-4 border-primary pl-3 mb-4 dark:text-white">Expenditure Audit Ledger</h3>
                  <div className="overflow-hidden border border-gray-200 rounded-sm dark:border-slate-800">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
                      <thead className="bg-gray-50 uppercase text-[8pt] font-black tracking-widest text-gray-500 dark:bg-slate-800/50 dark:text-slate-400">
                          <tr>
                            <th className="px-5 py-3 text-left">Budget Classification</th>
                            <th className="px-5 py-3 text-right">Total Debit</th>
                            <th className="px-5 py-3 text-right">Total %</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-[10pt] font-bold dark:divide-slate-800">
                          {expensePieData.map((exp, idx) => (
                            <tr key={idx}>
                              <td className="px-5 py-2 text-gray-800 capitalize dark:text-slate-100">{exp.name}</td>
                              <td className="px-5 py-2 text-right font-black">Rs. {exp.value.toLocaleString()}</td>
                              <td className="px-5 py-2 text-right text-gray-400">{((exp.value / totalExpenses) * 100).toFixed(1)}%</td>
                            </tr>
                          ))}
                          <tr className="bg-primary/5 font-black uppercase text-[11pt]">
                            <td className="px-5 py-4">Total Aggregated Outflow</td>
                            <td className="px-5 py-4 text-right text-rose-700">Rs. {totalExpenses.toLocaleString()}</td>
                            <td className="px-5 py-4 text-right italic">100.0%</td>
                          </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </ReportTemplate>
        </div>
      )}
    </div>
  );
}
