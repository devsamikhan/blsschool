import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { FeeRecord } from '@/types';
import { getFeeRecordsByStudent } from '@/lib/api';
import { EVENTS, useEventListener } from '@/lib/events';
import { IndianRupee, Printer, Calendar, CheckCircle, Clock, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export function StudentFees() {
  const { user } = useAuth();
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user || user.role !== 'student') return;
    setIsLoading(true);
    try {
      const records = await getFeeRecordsByStudent(user.id);
      setFeeRecords(records.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));
    } catch (error) {
      console.error('Error fetching fee records:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEventListener(EVENTS.FEE_CHANGE, fetchData);

  const handlePrintReceipt = () => {
    window.print();
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-24 animate-pulse">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalPending = feeRecords.filter(f => f.status !== 'paid').reduce((sum, f) => sum + (f.totalFee - f.paid), 0);
  const totalPaid = feeRecords.reduce((sum, f) => sum + f.paid, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-7 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
                Fee Management
              </span>
            </div>
            <h1 className="lms-page-title">
              Fee Status
            </h1>
            <p className="lms-body mt-1">
              View your fee records and payment history.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-7 border-none bg-rose-50/50 dark:bg-rose-500/5 hover:scale-[1.01] transition-all cursor-default group overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldAlert className="w-32 h-32 text-rose-600" />
          </div>
          <div className="relative z-10">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-rose-600 w-fit mb-5 shadow-sm">
              <IndianRupee className="h-6 w-6" />
            </div>
            <p className="lms-stat-label text-rose-500 mb-1">Total Pending</p>
            <p className="text-3xl font-bold text-rose-600 tracking-tight">Rs {totalPending.toLocaleString()}</p>
            <p className="lms-meta text-rose-400 mt-3 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
               Outstanding balance
            </p>
          </div>
        </Card>

        <Card className="p-7 border-none bg-emerald-50/50 dark:bg-emerald-500/5 hover:scale-[1.01] transition-all cursor-default group overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="w-32 h-32 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-emerald-600 w-fit mb-5 shadow-sm">
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="lms-stat-label text-emerald-500 mb-1">Total Paid</p>
            <p className="text-3xl font-bold text-emerald-600 tracking-tight">Rs {totalPaid.toLocaleString()}</p>
            <p className="lms-meta text-emerald-400 mt-3">Payments received</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="lms-section-title">Fee Records</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-emerald-500 to-emerald-200 rounded-full" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left lms-table-header">Fee Type / Month</th>
                <th className="px-6 py-4 text-left lms-table-header">Due Date</th>
                <th className="px-6 py-4 text-left lms-table-header">Amount</th>
                <th className="px-6 py-4 text-left lms-table-header">Status</th>
                <th className="px-6 py-4 text-right lms-table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-50 dark:divide-slate-800">
              {feeRecords.length === 0 ? (
                 <tr><td colSpan={5} className="text-center py-20 lms-meta">No fee records found.</td></tr>
               ) : (
                 feeRecords.map(fee => {
                   const isOverdue = fee.status !== 'paid' && new Date(fee.dueDate).getTime() < new Date().getTime();
                   return (
                     <tr key={fee.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                       <td className="px-6 py-6">
                         <div className="text-sm font-semibold text-slate-900 dark:text-white capitalize group-hover:text-emerald-600 transition-colors">{fee.feeType}</div>
                         <div className="lms-meta mt-1 flex items-center gap-1"><Clock className="h-2.5 w-2.5"/> {fee.month} {fee.year}</div>
                       </td>
                       <td className="px-6 py-6 whitespace-nowrap">
                         <div className={cn("inline-flex items-center text-xs font-medium", isOverdue ? 'text-rose-600 bg-rose-50 px-3 py-1 rounded-full' : 'text-slate-600 dark:text-slate-400')}>
                           <Calendar className="h-3 w-3 mr-1.5 text-slate-400" />
                           {new Date(fee.dueDate).toLocaleDateString()}
                         </div>
                       </td>
                       <td className="px-6 py-6">
                         <div className="lms-meta">Total: Rs {fee.totalFee.toLocaleString()}</div>
                         <div className="text-sm font-semibold text-emerald-600 mt-0.5">Paid: Rs {fee.paid.toLocaleString()}</div>
                         {fee.balance > 0 && <div className="lms-meta text-rose-500 mt-0.5">Due: Rs {fee.balance.toLocaleString()}</div>}
                       </td>
                       <td className="px-6 py-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold border transition-all",
                            fee.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            fee.status === 'partial' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            isOverdue ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' :
                            'bg-blue-50 text-blue-600 border-blue-100'
                          )}>
                            {isOverdue && fee.status !== 'paid' ? 'Overdue' : fee.status === 'paid' ? 'Paid' : fee.status === 'partial' ? 'Partial' : 'Pending'}
                          </span>
                       </td>
                       <td className="px-6 py-6 text-right">
                          <div className="flex gap-2 justify-end opacity-30 group-hover:opacity-100 transition-opacity">
                            {fee.status !== 'paid' && (
                              <Button size="sm" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium text-xs px-4 h-9 shadow-sm active:scale-95 transition-all">
                                Pay Now
                                <ArrowRight className="ml-1.5 h-3 w-3" />
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" className="rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors" onClick={handlePrintReceipt}>
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                       </td>
                     </tr>
                   )
                 })
               )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Note */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-4 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-xl" />
         <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-emerald-600">
            <ShieldAlert className="h-5 w-5" />
         </div>
         <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Note</p>
            <p className="lms-body">
              All fee records are verified. For any queries or discrepancies, please contact the accounts department and present your fee receipt.
            </p>
         </div>
      </div>
    </div>
  );
}
