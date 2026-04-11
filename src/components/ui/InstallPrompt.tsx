import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 🔍 Check if the event already fired before mount
    const win = window as unknown as Window & { deferredPWAEvent?: BeforeInstallPromptEvent };
    if (win.deferredPWAEvent) {
      console.log('PWA: Picked up deferred event');
      setDeferredPrompt(win.deferredPWAEvent);
      setIsVisible(true);
    }

    const handler = () => {
      console.log('PWA: Received prompt-ready event');
      if (win.deferredPWAEvent) {
        setDeferredPrompt(win.deferredPWAEvent);
        setIsVisible(true);
      }
    };

    window.addEventListener('pwa-prompt-ready', handler);
    return () => window.removeEventListener('pwa-prompt-ready', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-slate-900 border border-emerald-500/30 rounded-2xl sm:rounded-[2rem] p-5 sm:p-10 max-w-[360px] sm:max-w-lg w-full shadow-2xl shadow-emerald-500/10 relative overflow-hidden group"
          >
            {/* Design Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32" />
            
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center space-y-6 relative z-10">
              <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto border border-emerald-500/20 shadow-inner">
                <Smartphone className="h-10 w-10" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic">
                  BLS <span className="text-emerald-500">Desktop</span> App
                </h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Install the BLS ESAKHEL ecosystem on your device for a cinematic, fast, and completely offline-ready experience.
                </p>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <Button 
                  onClick={handleInstallClick}
                  className={cn(
                    "h-14 md:h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base md:text-lg uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-600/20",
                    !deferredPrompt && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Download className="h-5 w-5 mr-3" />
                  Install App Now
                </Button>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="text-slate-500 hover:text-slate-300 font-bold text-xs uppercase tracking-[0.3em] py-2 transition-colors uppercase"
                >
                  Continuue in Browser
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
