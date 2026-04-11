import { ReactNode } from 'react';
import { Navbar } from '../Navbar';
import { Footer } from './Footer';
import { ReactLenis } from '@studio-freight/react-lenis';

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <ReactLenis root options={{ lerp: 0.08, wheelMultiplier: 1, smoothWheel: true }}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-emerald-500/30 selection:text-emerald-900 flex flex-col">
        <Navbar />
        <main className="relative flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </ReactLenis>
  );
}
