import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { BookOpen, Moon, Sun, Menu, X, ArrowRight, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/academics', label: 'Academics' },
    { to: '/admissions', label: 'Admissions' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/news', label: 'News' },
    { to: '/about', label: 'Heritage' },
    { to: '/contact', label: 'Support' },
  ];

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-xl"
          : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-4 group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform overflow-hidden p-1.5">
                <img src="/assets/logo.png" alt="BLS Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col justify-center">
                <span className={cn(
                  "font-black leading-none tracking-tight text-base sm:text-lg transition-colors duration-300",
                  scrolled ? "text-slate-900 dark:text-white" : "text-white"
                )}>BLS Esakhel</span>
                <span className={cn(
                  "hidden md:flex text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] leading-none mt-1.5 items-baseline whitespace-nowrap transition-colors duration-300",
                  scrolled ? "text-emerald-600 dark:text-emerald-400" : "text-emerald-400"
                )}>21<span className="text-[0.7em] relative -top-[0.4em] ml-0.5">ST</span>&nbsp;CENTURY'S SKILLS</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex lg:items-center lg:space-x-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300",
                    location.pathname === link.to
                      ? scrolled
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                        : "bg-white/20 text-white backdrop-blur-md border border-white/10"
                      : scrolled
                        ? "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300 border",
                  scrolled
                    ? "text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    : "text-white/80 border-white/10 hover:text-white hover:bg-white/10 hover:border-white/20"
                )}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>
              <Button asChild size="sm" className={cn(
                "hidden lg:inline-flex font-bold text-[11px] uppercase tracking-[0.15em] rounded-xl px-7 h-11 transition-all duration-500",
                scrolled
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/20"
                  : "bg-white text-emerald-700 hover:bg-white/90 shadow-[0_20px_50px_-10px_rgba(255,255,255,0.3)] hover:-translate-y-0.5"
              )}>
                <Link to="/login" className="flex items-center gap-2">Portal <ArrowRight className="h-3 w-3" /></Link>
              </Button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={cn(
                  "lg:hidden p-2.5 rounded-xl transition-all border",
                  scrolled
                    ? "text-slate-900 dark:text-white border-slate-200 dark:border-slate-800"
                    : "text-white border-white/10 hover:bg-white/10"
                )}
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 p-8 shadow-2xl flex flex-col gap-3"
          >
            {navLinks.map((link, idx) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-8 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all",
                    location.pathname === link.to
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                      : "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30"
                  )}
                >
                  {link.label}
                  <ChevronRight className={cn("h-4 w-4", location.pathname === link.to ? "text-white" : "text-emerald-500/50")} />
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navLinks.length * 0.05 }}
              className="mt-4"
            >
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-5 rounded-2xl bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-emerald-600/20"
              >
                Access Portal <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </nav>
      {/* Spacer for pages that need it */}
      <div className="h-16 hidden" />
    </>
  );
}