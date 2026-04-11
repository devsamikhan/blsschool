import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 overflow-hidden relative">
      <div className="absolute inset-0 opacity-10">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mb-12">
          <h1 className="text-[12rem] md:text-[20rem] font-black text-white/5 leading-none tracking-tighter">404</h1>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-20">
             <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter italic">Lost in <span className="text-emerald-500">Transmission.</span></h2>
             <p className="text-slate-400 max-w-lg mx-auto font-medium text-lg leading-relaxed mb-12 px-10">
               The digital portal you're attempting to access has been relocated or does not exist within our current institutional registry.
             </p>
             <Button asChild size="xl" className="h-20 px-12 rounded-3xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl shadow-2xl shadow-emerald-500/20 group">
               <Link to="/"><Home className="mr-3 h-6 w-6" /> Home Protocol</Link>
             </Button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">
         <span>Error Code: 404_NOT_FOUND</span>
         <span>BLS Isakhel Digital Ops</span>
      </div>
    </div>
  );
}
