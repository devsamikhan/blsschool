import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, AlertTriangle, CheckCircle, MessageSquare, LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useLanguage } from '../../contexts/LanguageContext/LanguageContext';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { cn } from '../../lib/utils';
import { getAllAdmissions, getAllFeeRecords } from '../../lib/api';

interface Notification {
  id: string;
  type: 'inquiry' | 'fee' | 'system';
  title: string;
  message: string;
  time: string;
  icon: LucideIcon;
  color: string;
}

export function NotificationCenter() {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const isAdmin = user.role === 'admin' || user.role === 'principal';
      const isAccountant = user.role === 'accountant';

      const [admissions, fees] = await Promise.all([
        isAdmin ? getAllAdmissions() : Promise.resolve([]),
        (isAdmin || isAccountant) ? getAllFeeRecords() : Promise.resolve([])
      ]);

      const alerts: Notification[] = [];

      // 1. New Admissions Alerts
      admissions.filter(a => a.status === 'pending').slice(0, 3).forEach(a => {
        alerts.push({
          id: `adm-${a.id}`,
          type: 'inquiry',
          title: t('new_inquiry'),
          message: `${a.studentName} applied for ${a.gradeAppliedFor}`,
          time: 'Just now',
          icon: MessageSquare,
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10'
        });
      });

      // 2. Overdue Fee Alerts
      fees.filter(f => f.status === 'overdue').slice(0, 3).forEach(f => {
        alerts.push({
          id: `fee-${f.id}`,
          type: 'fee',
          title: t('overdue_fee_alert'),
          message: `${f.studentName} - Rs ${f.balance.toLocaleString()}`,
          time: 'Daily check',
          icon: AlertTriangle,
          color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10'
        });
      });

      setNotifications(alerts);
      setUnreadCount(alerts.length);
    } catch (error) {
      console.error('Notification Engine Failure', error);
    }
  }, [t, user]); // Added user as dependency

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-4 w-4 shrink-0 transition-all">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] text-white font-black items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <Card className={cn(
            "absolute top-14 z-[70] w-80 md:w-96 p-0 overflow-hidden shadow-2xl border-none animate-in fade-in slide-in-from-top-2 duration-300",
            dir === 'rtl' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
          )}>
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="font-black italic text-lg tracking-tight leading-none uppercase">{t('notifications')}</h3>
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-2">{unreadCount} Critical Intel Feeds</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-10 w-10 text-slate-400 hover:text-white rounded-xl">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {notifications.length === 0 ? (
                <div className="p-16 text-center text-slate-400 italic">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6 opacity-40">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">{t('no_notifications')}</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    onClick={() => {
                      setIsOpen(false);
                      if (n.type === 'inquiry') navigate('/principal/inquiries');
                      if (n.type === 'fee') navigate('/principal/reports');
                    }}
                  >
                    <div className="flex gap-5">
                      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm", n.color)}>
                        <n.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-black text-slate-900 dark:text-white truncate italic uppercase tracking-tight">{n.title}</p>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap ml-3">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic font-medium leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 text-center">
              <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 italic">
                Verified Institutional Ledger →
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
