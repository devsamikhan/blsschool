import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext/LanguageContext';
import { FeeRecord, Expense } from '../../types';
import { getAllFeeRecords, getAllExpenses, getRevenueLeakage, getOverdueRecords } from '../../lib/api';
import { IndianRupee, TrendingUp, TrendingDown, AlertCircle, ArrowRight, ShieldCheck, Verified } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { FinancialPulse } from '../../components/dashboard/FinancialPulse';

export function AccountantDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [f, e] = await Promise.all([
        getAllFeeRecords(),
        getAllExpenses()
      ]);
      setFees(f);
      setExpenses(e);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalRevenue = fees.reduce((sum, f) => sum + f.paid, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPending = fees.reduce((sum, f) => sum + f.balance, 0);
  const netIncome = totalRevenue - totalExpenses;
  const leakage = getRevenueLeakage(fees);
  const overdueAlerts = getOverdueRecords(fees);

  const recentPayments = fees
    .filter(f => f.status === 'paid' || f.status === 'partial')
    .flatMap(f => f.payments.map(p => ({ ...p, studentName: f.studentName, feeType: f.feeType, className: f.className })))
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Smart Welcome Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/20">
                Finance Dashboard
              </span>
            </div>
            <h1 className="lms-page-title text-xl md:text-3xl">
              Welcome back, {user?.name?.split(' ')[0] || 'Accountant'}
            </h1>
            <p className="lms-body mt-1">
              Financial Status: <span className={cn("font-semibold text-sm md:text-base", netIncome >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                {netIncome >= 0 ? 'Account Balanced' : 'Action Required'}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="h-10 md:h-11 px-4 md:px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold transition-all group text-sm">
              <Link to="/accountant/fees" className="flex items-center">
                {t('collect_fees')}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-10 md:h-11 px-4 md:px-6 rounded-xl font-semibold border-slate-200 dark:border-slate-800 text-sm">
              <Link to="/accountant/expenses">{t('record_expense')}</Link>
            </Button>
          </div>
        </div>
      </div>

      <FinancialPulse />

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 md:p-8 hover:shadow-md transition-all cursor-default border-slate-100 dark:border-slate-800">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <IndianRupee className="h-6 w-6" />
              </div>
              <span className="lms-badge bg-emerald-50 text-emerald-700 border-emerald-100">Collected</span>
           </div>
           <p className="lms-stat-label mb-1">Total Revenue</p>
           <p className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">Rs {totalRevenue.toLocaleString()}</p>
           <div className="mt-4 flex items-center gap-2 lms-meta">
              <Verified className="h-3 w-3 text-emerald-500" /> Verified Record
           </div>
        </Card>

        <Card className="p-6 md:p-8 hover:shadow-md transition-all cursor-default relative overflow-hidden border-slate-100 dark:border-slate-800">
           {leakage > 0 && <div className="absolute top-0 right-0 p-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-ping" /></div>}
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-2xl text-red-600 dark:text-red-400">
                <TrendingDown className="h-6 w-6" />
              </div>
              <span className="lms-badge bg-red-50 text-red-700 border-red-100">Expenses</span>
           </div>
           <p className="lms-stat-label mb-1">Gross Expenditures</p>
           <p className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">Rs {totalExpenses.toLocaleString()}</p>
           <p className="lms-meta mt-2">Institutional Spending</p>
        </Card>

        <Card className="p-6 md:p-8 hover:shadow-md transition-all cursor-default relative border-dashed border-2 border-slate-200 dark:border-slate-800">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-6 w-6" />
              </div>
            <span className="lms-badge bg-amber-50 text-amber-700 border-amber-100">Dues</span>
           </div>
           <p className="lms-stat-label mb-1">Pending Collections</p>
           <p className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">Rs {totalPending.toLocaleString()}</p>
           <p className="lms-meta mt-2">{overdueAlerts.length} Overdue Records</p>
        </Card>

        <Card className="p-6 md:p-8 hover:shadow-md transition-all cursor-default bg-slate-950 text-white border-none shadow-xl shadow-slate-900/40">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/10 rounded-2xl text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <span className="lms-badge bg-white/10 text-white border-white/20">{t('net_income')}</span>
           </div>
           <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Institutional Balance</p>
           <h4 className="text-xl md:text-3xl font-bold mt-1">
             {netIncome >= 0 ? '+' : ''}Rs {Math.abs(netIncome).toLocaleString()}
           </h4>
           {leakage > 0 && (
             <div className="mt-4 bg-red-500/20 p-2 rounded-xl border border-red-500/30">
                <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Leakage Warning: Rs {leakage.toLocaleString()}</p>
             </div>
           )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Ledger Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="lms-section-title">Recent Transactions</h2>
            <Button variant="ghost" className="lms-meta uppercase tracking-widest font-bold">Export PDF</Button>
          </div>
          <div className="space-y-4">
            {recentPayments.length === 0 ? (
              <Card className="p-12 text-center text-slate-400 italic font-medium">No recent payments logged.</Card>
            ) : (
              recentPayments.map((p, idx) => (
                <Card key={idx} className="p-6 transition-all border-slate-50 dark:border-slate-800">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                       <IndianRupee className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 dark:text-white truncate">{p.studentName}</h3>
                          <span className="text-lg font-bold text-emerald-600">+Rs {p.amount.toLocaleString()}</span>
                       </div>
                       <p className="lms-meta">{p.feeType} Fee • {p.className}</p>
                       <div className="mt-4 flex items-center justify-between lms-meta uppercase">
                          <span>Via {p.method}</span>
                          <span>{new Date(p.date).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Intelligence Sidear */}
        <div className="space-y-6">
          <h2 className="lms-section-title px-2">Payment Alerts</h2>
          <Card className="p-8 border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
             <div className="space-y-4 overflow-y-auto max-h-[400px]">
               {overdueAlerts.length === 0 ? (
                 <p className="text-center text-slate-400 italic py-8">Zero overdue records!</p>
               ) : (
                 overdueAlerts.slice(0, 8).map(record => (
                    <div key={record.id} className="p-4 bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group">
                       <div>
                         <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{record.studentName}</p>
                         <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest">Balance: Rs {record.balance.toLocaleString()}</p>
                       </div>
                      <Button size="icon" variant="ghost" className="rounded-full hover:bg-red-500 hover:text-white">
                         <AlertCircle className="h-4 w-4" />
                      </Button>
                   </div>
                 ))
               )}
             </div>
             <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
               <p className="lms-meta uppercase tracking-widest mb-2">Total Outstanding</p>
               <p className="text-xl font-bold text-red-600">Rs {totalPending.toLocaleString()}</p>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
