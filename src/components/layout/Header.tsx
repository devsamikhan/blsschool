import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { LogOut, Menu, Moon, Sun, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useLanguage } from '../../contexts/LanguageContext/LanguageContext';
import { cn } from '../../lib/utils';
import { socket } from '../../lib/socket';
import { useState, useEffect } from 'react';

import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  toggleSidebar: () => void;
}

const roleBadgeColors: Record<string, string> = {
  admin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  teacher: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  student: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  principal: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  accountant: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
};

const roleAvatarColors: Record<string, string> = {
  admin: 'bg-indigo-600 text-white',
  teacher: 'bg-emerald-600 text-white',
  student: 'bg-purple-600 text-white',
  principal: 'bg-orange-500 text-white',
  accountant: 'bg-teal-600 text-white',
};

export function Header({ toggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isSynced, setIsSynced] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setIsSynced(true);
    const onDisconnect = () => setIsSynced(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const badgeClass = roleBadgeColors[user?.role || 'admin'];
  const avatarClass = roleAvatarColors[user?.role || 'admin'];

  return (
    <header className="glass-premium sticky top-0 z-30 h-16 flex items-center justify-between px-3 md:px-8 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 sm:gap-4 group cursor-pointer">
          <div className="flex items-center gap-2 sm:gap-3" onClick={() => navigate('/')}>
            <img src="/assets/logo.png" alt="Logo" className="h-9 w-9 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300" />
            <div className="flex flex-col justify-center">
              <span className="hidden min-[375px]:block font-extrabold text-slate-900 dark:text-white leading-none tracking-tight text-base sm:text-lg">BLS Esakhel</span>
              <span className="hidden md:flex text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] leading-none mt-1.5 items-center">21<span className="text-[0.65em] -mt-0.5 ml-0.5">ST</span> CENTURY'S SKILLS</span>
            </div>
          </div>

          <div className={cn(
            "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-500",
            isSynced
              ? "bg-emerald-50/50 border-emerald-100/50 text-emerald-600 dark:bg-emerald-500/5 dark:border-emerald-500/20 dark:text-emerald-400"
              : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-600"
          )}>
            <div className="relative flex items-center justify-center">
              <div className={cn("h-2 w-2 rounded-full", isSynced ? "bg-emerald-500" : "bg-slate-300")} />
              {isSynced && <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping opacity-60" />}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{isSynced ? 'Live Sync' : 'Offline'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <NotificationCenter />

        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4 ml-2">
          <div className="hidden sm:flex flex-col items-end justify-center">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none mb-1.5">{user?.name}</span>
            <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest shadow-sm", badgeClass)}>{user?.role}</span>
          </div>
          <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ring-1 ring-slate-200 dark:ring-white/10 transition-transform hover:scale-105", avatarClass)}>
            {user?.name?.charAt(0) || '?'}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all h-9 w-9"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
