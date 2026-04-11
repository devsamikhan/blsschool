import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, AlertTriangle } from 'lucide-react';

export function OfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
           className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] md:w-auto"
        >
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-2xl px-6 py-4 backdrop-blur-xl shadow-2xl flex items-center gap-4">
             <div className="bg-rose-500/20 p-2.5 rounded-xl">
               <WifiOff className="h-5 w-5 animate-pulse" />
             </div>
             <div className="space-y-0.5">
               <p className="font-bold text-sm leading-none uppercase tracking-widest">Offline Mode</p>
               <p className="text-[10px] font-medium text-rose-400/80">Connection lost, but the dashboard is still interactive.</p>
             </div>
             <div className="flex -space-x-1 ml-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
