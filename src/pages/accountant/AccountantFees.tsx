import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext/LanguageContext';
import { FeeRecord, User, Payment } from '../../types';
import { getAllFeeRecords, getAllUsers, updateFeeRecord } from '../../lib/api';
import { Search, Printer, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { EVENTS, useEventListener } from '../../lib/events';
import { FeeVoucherModal } from '../../components/FeeVoucherModal';

export function AccountantFees() {
  const { t } = useLanguage();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Payment Modal State
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'online' | 'cheque'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Voucher State
  const [voucherFee, setVoucherFee] = useState<FeeRecord | null>(null);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  
  // Concession State
  const [concessionAvailable, setConcessionAvailable] = useState<{ amount: number; reason: string } | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [f, u] = await Promise.all([
        getAllFeeRecords(),
        getAllUsers()
      ]);
      setFees(f);
      setStudents(u.filter(user => user.role === 'student'));
    } catch (error) {
      console.error(error);
      toast.error('Failed to sync ledger data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEventListener(EVENTS.FEE_CHANGE, fetchData);

  // Automated Sibling Concession Logic
  const checkSiblingConcession = useCallback((studentId: string) => {
    const currentStudent = students.find(s => s.id === studentId);
    if (!currentStudent || !currentStudent.phone) return;

    // Detect siblings by Guardian Phone
    const siblings = students.filter(s => s.id !== studentId && s.phone === currentStudent.phone);
    if (siblings.length > 0) {
      setConcessionAvailable({
        amount: 500, // Flat 500 Rs sibling discount policy
        reason: 'Multiple siblings detected (Policy #F-02)'
      });
    } else {
      setConcessionAvailable(null);
    }
  }, [students]);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee || !paymentAmount || isNaN(Number(paymentAmount))) return;
    
    const amountNum = Number(paymentAmount);
    if (amountNum <= 0 || amountNum > selectedFee.balance) {
      toast.error('Invalid payment amount');
      return;
    }

    try {
      setIsSubmitting(true);
      const newPayment: Payment = {
        id: `pay_${Date.now()}`,
        amount: amountNum,
        date: new Date().toISOString(),
        method: paymentMethod,
        receiptNo: `REC-${Date.now()}`,
        receivedBy: 'Accountant'
      };

      const newPaid = selectedFee.paid + amountNum;
      const newBalance = selectedFee.totalFee - newPaid;
      
      let newStatus: 'paid' | 'partial' | 'pending' | 'overdue' = selectedFee.status;
      if (newBalance === 0) newStatus = 'paid';
      else if (newPaid > 0) newStatus = 'partial';

      const updatedFee: FeeRecord = {
        ...selectedFee,
        paid: newPaid,
        balance: newBalance,
        status: newStatus,
        payments: [...selectedFee.payments, newPayment]
      };

      await updateFeeRecord(selectedFee.id, updatedFee);
      toast.success(`Payment of Rs ${amountNum} recorded successfully!`);
      setSelectedFee(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to process payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFees = fees.filter(f => {
    const matchesSearch = f.studentName.toLowerCase().includes(search.toLowerCase()) || 
                          f.className.toLowerCase().includes(search.toLowerCase()) ||
                          f.month.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/20">
              Institutional Ledger
            </span>
          </div>
          <h1 className="lms-page-title">{t('collect_fees')}</h1>
          <p className="lms-body mt-1">Manage student financial records and process fiscal transactions.</p>
        </div>
        <Button onClick={fetchData} className="h-12 px-8 rounded-xl bg-slate-900 text-white font-bold shadow-soft hover:scale-[1.02] transition-all flex items-center gap-2">
           Synchronize Records
        </Button>
      </div>

      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-soft flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search student profiles, academic units..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-12 h-12 bg-white dark:bg-slate-950"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-select w-full md:w-56 h-12 bg-white dark:bg-slate-950 font-bold text-xs uppercase tracking-widest"
        >
          <option value="all">Fiscally: All Status</option>
          <option value="paid">Paid (Cleared)</option>
          <option value="partial">Partial (Incomplete)</option>
          <option value="pending">Pending (Awaiting)</option>
          <option value="overdue">Overdue (Critical)</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-6 lms-table-header text-left">Academic Entity</th>
                <th className="px-8 py-6 lms-table-header text-left">Fiscal Metadata</th>
                <th className="px-8 py-6 lms-table-header text-left">Valuation</th>
                <th className="px-8 py-6 lms-table-header text-center whitespace-nowrap">Audit Status</th>
                <th className="px-8 py-6 lms-table-header text-right whitespace-nowrap">Ledger Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-24"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filteredFees.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-24 lms-body italic">No institutional financial records detected.</td></tr>
              ) : (
                filteredFees.map((fee) => {
                  const isOverdue = fee.status !== 'paid' && new Date(fee.dueDate) < new Date();
                  return (
                    <tr key={fee.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{fee.studentName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{fee.className} Unit</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">{fee.feeType} Log</div>
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-1"><Sparkles className="h-3.5 w-3.5"/> {fee.month} — {fee.year}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregate: Rs {fee.totalFee.toLocaleString()}</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 uppercase">Remnant: Rs {fee.balance.toLocaleString()}</div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={cn(
                          "lms-badge uppercase tracking-[0.15em] text-[9px]",
                          fee.status === 'paid' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          fee.status === 'partial' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          isOverdue ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' :
                          'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                        )}>
                          {isOverdue && fee.status !== 'paid' ? 'Overdue' : fee.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex gap-2 justify-end">
                          {fee.status !== 'paid' && (
                            <Button size="sm" className="h-9 px-5 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-soft hover:scale-105 transition-all" onClick={() => {
                              setSelectedFee(fee);
                              setPaymentAmount(fee.balance);
                              checkSiblingConcession(fee.studentId);
                            }}>
                              Collect
                            </Button>
                          )}
                          <Button size="icon" variant="outline" className="h-9 w-9 rounded-xl text-slate-400 border-slate-200 dark:border-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200" onClick={() => { setVoucherFee(fee); setIsVoucherOpen(true); }} title="Generate Voucher">
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
      </div>

      {/* Payment Processing Interface (Modal) */}
      {selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-300">
           <Card className="w-full max-w-xl p-0 overflow-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="bg-slate-900 text-white p-8 relative overflow-hidden">
                 <div className="relative z-10">
                    <div className="flex justify-between items-start">
                       <div>
                          <span className="lms-badge bg-white/10 text-white border-white/20">Payment Hub</span>
                          <h2 className="text-2xl font-bold mt-4">{selectedFee.studentName}</h2>
                          <p className="lms-meta text-slate-300 mt-1">
                             {selectedFee.feeType} • {selectedFee.month} {selectedFee.year}
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
              
              <form onSubmit={handleProcessPayment} className="p-8 space-y-6">
                 {concessionAvailable && (
                   <div className="bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-100 dark:border-emerald-500/20 p-6 rounded-2xl flex items-center gap-5">
                      <div className="w-12 h-12 bg-emerald-500 rounded-xl text-white flex items-center justify-center">
                         <Sparkles className="h-6 w-6" />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Sibling Discount Applied</p>
                         <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{concessionAvailable.reason}</p>
                         <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">Discount: -Rs {concessionAvailable.amount}</p>
                      </div>
                   </div>
                 )}

                 <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                       <p className="lms-meta uppercase text-[10px] font-bold mb-1">Balance Due</p>
                       <p className="text-2xl font-bold text-red-600">Rs {selectedFee.balance.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                       <p className="lms-meta uppercase text-[10px] font-bold mb-1">Method</p>
                       <select 
                         value={paymentMethod}
                         onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'bank' | 'online' | 'cheque')}
                         className="form-select border-none bg-transparent p-0 text-lg font-bold h-auto shadow-none text-slate-900 dark:text-white"
                       >
                         <option value="cash">Cash</option>
                         <option value="bank">Bank Transfer</option>
                         <option value="online">Online</option>
                         <option value="cheque">Cheque</option>
                       </select>
                    </div>
                 </div>
                                 <div>
                    <label className="form-label mb-2">Payment Amount (PKR) *</label>
                    <div className="relative">
                      <input 
                        type="number"
                        required
                        max={selectedFee.balance}
                        min={1}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="form-input h-16 text-3xl font-bold pl-8 pr-24"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">RUPEES</div>
                    </div>
                 </div>
 
                 <div className="pt-6 flex gap-3">
                    <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-semibold" onClick={() => setSelectedFee(null)}>Cancel</Button>
                    <Button type="submit" className="flex-[2] h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all flex items-center justify-center gap-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Process Payment
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                 </div>
              </form>
           </Card>
        </div>
      )}

      {/* Fee Voucher Modal */}
      <FeeVoucherModal 
        isOpen={isVoucherOpen}
        onClose={() => setIsVoucherOpen(false)}
        fee={voucherFee}
      />
    </div>
  );
}
