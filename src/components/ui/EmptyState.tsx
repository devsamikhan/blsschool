import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in zoom-in duration-500",
      className
    )}>
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full scale-150 animate-pulse-slow" />
        <div className="relative w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-center">
          <Icon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mb-8">
        {description}
      </p>
      
      {action && (
        <div className="animate-in slide-in-from-bottom-2 duration-700 delay-200">
          {action}
        </div>
      )}
    </div>
  );
}
