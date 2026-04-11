import { useEffect, useState, useCallback } from 'react';
import { Expense } from '@/types';
import { getAllExpenses, createExpense, deleteExpense } from '@/lib/api';
import { Search, Plus, Trash2, Calendar, FileText, IndianRupee, CreditCard, Sparkles, Send, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { EVENTS, useEventListener } from '@/lib/events';

export function AccountantExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'other' as Expense['category'],
    amount: '',
    description: '',
    paidTo: '',
    paymentMethod: 'cash' as Expense['paymentMethod']
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const e = await getAllExpenses();
      setExpenses(e);
    } catch (error) {
      console.error(error);
      toast.error('Failed to synchronize expense ledger');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEventListener(EVENTS.EXPENSE_CHANGE, fetchData);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || isNaN(Number(formData.amount)) || !formData.description) {
      toast.error('Please fill all required protocols correctly');
      return;
    }

    try {
      setIsSubmitting(true);
      const newExp: Omit<Expense, 'id'> = {
        date: formData.date,
        category: formData.category,
        amount: Number(formData.amount),
        description: formData.description,
        paidTo: formData.paidTo,
        paymentMethod: formData.paymentMethod,
        receiptNo: `EXP-${Date.now()}`,
        approvedBy: 'Financial Oversight',
        createdAt: new Date().toISOString()
      };

      await createExpense(newExp);
      toast.success('Fiscal expenditure recorded successfully');
      setIsModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'other',
        amount: '',
        description: '',
        paidTo: '',
        paymentMethod: 'cash'
      });
    } catch (error) {
      toast.error('Failed to commit expenditure to ledger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this fiscal record?')) {
      try {
        await deleteExpense(id);
        toast.success('Expenditure record purged');
      } catch (error) {
         toast.error('Failed to delete expenditure');
      }
    }
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase()) || 
                          e.paidTo.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalExpenditure = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/20">
                Expense Management
              </span>
            </div>
            <h1 className="lms-page-title">Expenses</h1>
            <p className="lms-body mt-1">Track and manage school expenditures and operational costs.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all">
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-1 p-8 bg-slate-950 text-white rounded-2xl border-none shadow-xl shadow-slate-900/40 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <IndianRupee className="w-32 h-32" />
           </div>
           <p className="lms-stat-label text-slate-400 mb-2">Total Expenses</p>
           <p className="lms-stat-number text-white">Rs {totalExpenditure.toLocaleString()}</p>
           <p className="lms-meta text-emerald-400 mt-6 flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Verified Record
           </p>
        </Card>

        <Card className="lg:col-span-3 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by description or recipient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-12 h-12"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select w-full md:w-64 h-12"
          >
            <option value="all">All Categories</option>
            <option value="salary">Salaries</option>
            <option value="electricity">Electricity</option>
            <option value="water">Water</option>
            <option value="maintenance">Maintenance</option>
            <option value="supplies">Supplies</option>
            <option value="events">Events</option>
            <option value="other">Other</option>
          </select>
        </Card>
      </div>

      <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-50 dark:divide-slate-800">
            <thead>
              <tr>
                <th className="px-8 py-6 lms-table-header">Date / Token</th>
                <th className="px-8 py-6 lms-table-header">Description</th>
                <th className="px-8 py-6 lms-table-header">Paid To</th>
                <th className="px-8 py-6 lms-table-header">Amount</th>
                <th className="px-8 py-6 lms-table-header text-right">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-50 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-24"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filteredExpenses.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-24 lms-body">No expenses found.</td></tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                         <Calendar className="h-4 w-4 text-slate-400" />
                         {new Date(exp.date).toLocaleDateString()}
                      </div>
                      <div className="lms-meta mt-1">{exp.receiptNo}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold text-slate-900 dark:text-white capitalize">{exp.category}</div>
                      <div className="lms-body text-xs mt-1 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {exp.description}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{exp.paidTo}</div>
                      <div className="lms-meta mt-1 flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> via {exp.paymentMethod}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">Rs {exp.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right">
                      <Button size="icon" variant="ghost" className="rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all" onClick={() => handleDelete(exp.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual Verification Advisory */}
      <Card className="p-8 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-6">
         <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-blue-600 shrink-0">
            <ShieldCheck className="h-6 w-6" />
         </div>
         <div>
            <p className="lms-section-title mb-1 text-sm font-bold uppercase">Record Verification</p>
            <p className="lms-body text-sm leading-relaxed">
              All expenditure records are subjected to verification against the central treasury ledger. Unauthorized deletions or modifications are logged for security review.
            </p>
         </div>
      </Card>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-20">
               <h2 className="text-xl font-bold text-slate-900 dark:text-white">Record Expense</h2>
               <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 transition-all text-2xl font-bold">×</button>
            </div>
            
            <form onSubmit={handleAddExpense} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="form-label">Date *</label>
                   <input 
                     type="date" required
                     value={formData.date}
                     onChange={e => setFormData({...formData, date: e.target.value})}
                     className="form-input"
                   />
                 </div>
                 <div>
                   <label className="form-label">Category</label>
                   <select 
                     value={formData.category}
                     onChange={e => setFormData({...formData, category: e.target.value as Expense['category']})}
                     className="form-select"
                   >
                     <option value="salary">Salaries</option>
                     <option value="maintenance">Maintenance</option>
                     <option value="electricity">Electricity</option>
                     <option value="water">Water</option>
                     <option value="supplies">Supplies</option>
                     <option value="events">Events</option>
                     <option value="other">Other</option>
                   </select>
                 </div>
              </div>

               <div>
                 <label className="form-label">Amount (Rs) *</label>
                 <div className="relative group">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="number" required min="1"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="form-input pl-12 h-14 text-xl font-bold"
                      placeholder="0.00"
                    />
                 </div>
              </div>

               <div>
                 <label className="form-label">Description *</label>
                 <textarea 
                   required placeholder="Expense details..."
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   className="form-textarea"
                   rows={3}
                 />
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="form-label">Paid To</label>
                   <input 
                     type="text" required placeholder="Vendor or Identity"
                     value={formData.paidTo}
                     onChange={e => setFormData({...formData, paidTo: e.target.value})}
                     className="form-input"
                   />
                </div>
                <div>
                   <label className="form-label">Payment Method</label>
                   <select 
                     value={formData.paymentMethod}
                     onChange={e => setFormData({...formData, paymentMethod: e.target.value as Expense['paymentMethod']})}
                     className="form-select"
                   >
                     <option value="cash">Cash</option>
                     <option value="bank">Bank Transfer</option>
                     <option value="online">Online Payment</option>
                     <option value="cheque">Cheque</option>
                   </select>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="rounded-xl px-6">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white rounded-xl px-8 font-semibold transition-all">
                   {isSubmitting ? 'Saving...' : 'Save Expense'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
