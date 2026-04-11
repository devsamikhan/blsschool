import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, PieChart, 
  ArrowUpRight, ArrowDownRight, Activity, Zap 
} from 'lucide-react';
import { Card } from '../ui/card';
import { fetchAPI } from '../../lib/api';
import { FeeRecord, Expense } from '../../types';
import { cn } from '../../lib/utils';

export function FinancialPulse() {
  const [data, setData] = useState({
    totalProjected: 0,
    totalRealized: 0,
    totalExpenses: 0,
    netLiquidity: 0,
    collectionRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFinancials() {
      try {
        setIsLoading(true);
        const [fees, expenses] = await Promise.all([
          fetchAPI<FeeRecord[]>('/feeRecords'),
          fetchAPI<Expense[]>('/expenses')
        ]);

        const totalProjected = fees.reduce((acc, curr) => acc + curr.totalFee, 0);
        const totalRealized = fees.reduce((acc, curr) => acc + curr.paid, 0);
        const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        const netLiquidity = totalRealized - totalExpenses;
        const collectionRate = totalProjected > 0 ? (totalRealized / totalProjected) * 100 : 0;

        setData({
          totalProjected,
          totalRealized,
          totalExpenses,
          netLiquidity,
          collectionRate
        });
      } catch (error) {
        console.error('Financial Sync Error:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFinancials();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-[2rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
         <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
           <Zap className="h-3 w-3 text-amber-500 fill-amber-500" /> Operational Financial Pulse Unit
         </h2>
         <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">
           Real-time Ledger Synchronized
         </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Total Projected */}
        <Card className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
             <PieChart className="h-16 w-16" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Projected Revenue</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Rs {data.totalProjected.toLocaleString()}</h3>
            <div className="mt-5 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
               <Activity className="h-3 w-3 text-slate-300" /> Static Enrollment Forecast
            </div>
          </div>
        </Card>

        {/* Realized Revenue */}
        <Card className="p-8 bg-slate-900 text-white border-none shadow-premium rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <Wallet className="h-16 w-16" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-2">Realized Liquidity</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">Rs {data.totalRealized.toLocaleString()}</h3>
            <div className="mt-5 space-y-2">
               <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-indigo-300">Collection Metric</span>
                  <span className="text-white">{data.collectionRate.toFixed(0)}%</span>
               </div>
               <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" style={{ width: `${data.collectionRate}%` }} />
               </div>
            </div>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:-rotate-12 transition-transform">
             <TrendingDown className="h-16 w-16" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Institutional Outflow</p>
            <h3 className="text-3xl font-bold text-rose-500 tracking-tight">Rs {data.totalExpenses.toLocaleString()}</h3>
            <div className="mt-5 flex items-center gap-2 text-[10px] font-bold text-rose-400 uppercase tracking-tight">
               <ArrowDownRight className="h-4 w-4" /> Operational Expenditures
            </div>
          </div>
        </Card>

        {/* Net Liquidity */}
        <Card className={cn(
          "p-8 border-none shadow-soft rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-500",
          data.netLiquidity >= 0 ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-rose-600 text-white shadow-rose-600/20'
        )}>
          <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-90 transition-transform">
             <TrendingUp className="h-16 w-16" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-2">Net Strategic Balance</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">Rs {data.netLiquidity.toLocaleString()}</h3>
            <div className="mt-5 flex items-center gap-2 text-[10px] font-bold text-white/90 uppercase tracking-tight">
               <ArrowUpRight className="h-4 w-4" /> Current Fiscal Position
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
