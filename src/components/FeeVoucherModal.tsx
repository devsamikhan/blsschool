import { FeeRecord } from '@/types';
import { Button } from './ui/button';
import { Printer, X, ShieldCheck, Landmark, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeeVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  fee: FeeRecord | null;
}

export function FeeVoucherModal({ isOpen, onClose, fee }: FeeVoucherModalProps) {
  if (!fee) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('fee-voucher-print-area');
    if (!printContent) return;
    
    // We'll use a cleaner print method that doesn't reload the whole app
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Voucher - ${fee.studentName}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              .no-print { display: none !important; }
              body { margin: 0; padding: 20px; }
            }
            .voucher-part { border: 2px dashed #e2e8f0; margin-bottom: 30px; page-break-inside: avoid; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const VoucherPart = ({ title }: { title: string }) => (
    <div className="voucher-part p-6 bg-white rounded-xl border-2 border-dashed border-slate-200 mb-8 relative">
      <div className="absolute top-0 right-0 bg-slate-900 text-white px-4 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest">{title}</div>
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center p-2">
            <img src="/assets/logo.png" className="w-full h-full object-contain brightness-0 invert" alt="Logo" />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-900 tracking-tighter leading-none">BLS School</h4>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Institutional Financial Record</p>
          </div>
        </div>
        <div className="text-right">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Voucher No</div>
           <div className="text-lg font-black text-slate-900 font-mono">#{fee.id.substring(0, 8).toUpperCase()}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-6 border-y border-slate-100 py-4">
        <div>
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Student Details</p>
           <p className="text-sm font-black text-slate-900 uppercase">{fee.studentName}</p>
           <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Class: {fee.className} | Month: {fee.month}</p>
        </div>
        <div className="text-right">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
           <p className="text-sm font-black text-rose-600 uppercase italic">{new Date(fee.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-xs font-bold text-slate-600 uppercase">
          <span>{fee.feeType} Fee</span>
          <span>Rs {fee.totalFee.toLocaleString()}</span>
        </div>
        {fee.concessionAmount && (
          <div className="flex justify-between text-xs font-bold text-emerald-600 uppercase">
            <span>Institutional Concession</span>
            <span>- Rs {fee.concessionAmount.toLocaleString()}</span>
          </div>
        )}
        <div className="h-px bg-slate-200 mt-2" />
        <div className="flex justify-between text-lg font-black text-slate-950 pt-2 uppercase">
          <span>Net Payable</span>
          <span>Rs {fee.balance.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 opacity-50">
        <div className="border-t border-slate-300 mt-8 pt-2 text-center">
           <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Accounts Signature</p>
        </div>
        <div className="border-t border-slate-300 mt-8 pt-2 text-center">
           <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Bank/Cashier Stamp</p>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic flex items-center gap-3">
                  <Landmark className="h-6 w-6 text-emerald-500" />
                  Financial Voucher.
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Official Billing Document</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-4 scrollbar-hide">
              <div id="fee-voucher-print-area" className="flex flex-col gap-0">
                <VoucherPart title="Bank Copy" />
                <VoucherPart title="School Copy" />
                <VoucherPart title="Parent Copy" />
              </div>
            </div>

            <div className="flex gap-4 mt-8 no-print">
              <Button onClick={handlePrint} className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest italic text-sm group shadow-lg">
                <Printer className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                Generate Official Voucher
              </Button>
              <Button variant="outline" onClick={onClose} className="px-8 h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest text-xs">
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
