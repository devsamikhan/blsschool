import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserPlus,
  Settings,
  PenTool,
  Calendar,
  Megaphone,
  CreditCard,
  FileText,
  DollarSign,
  PieChart,
  Activity,
  GraduationCap,
  Upload,
  FileCheck,
  Inbox,
  Newspaper,
  Package,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  const navigation = {
    admin: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Manage Users', href: '/admin/users', icon: Users },
      { name: 'Manage Classes', href: '/admin/classes', icon: BookOpen },
      { name: 'Teacher Assignment', href: '/admin/teacher-assignment', icon: UserPlus },
      { name: 'Bulk Operations', href: '/admin/bulk', icon: Upload },
      { name: 'Inventory', href: '/admin/inventory', icon: Package },
      { name: 'Activity Logs', href: '/admin/logs', icon: Activity },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
    teacher: [
      { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
      { name: 'Create Homework', href: '/teacher/homework/create', icon: PenTool },
      { name: 'My Homework', href: '/teacher/homework', icon: FileText },
      { name: 'Attendance', href: '/teacher/attendance', icon: Calendar },
      { name: 'Digital Diary', href: '/teacher/diary', icon: BookOpen },
      { name: 'Announcements', href: '/teacher/announcements', icon: Megaphone },
      { name: 'Students', href: '/teacher/students', icon: GraduationCap },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
    student: [
      { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
      { name: 'My Homework', href: '/student/homework', icon: FileText },
      { name: 'Announcements', href: '/student/announcements', icon: Megaphone },
      { name: 'Fee Status', href: '/student/fees', icon: CreditCard },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
    principal: [
      { name: 'Dashboard', href: '/principal/dashboard', icon: LayoutDashboard },
      { name: 'Classes', href: '/principal/classes', icon: BookOpen },
      { name: 'Teachers', href: '/principal/teachers', icon: Users },
      { name: 'Students', href: '/principal/students', icon: GraduationCap },
      { name: 'Announcements', href: '/principal/announcements', icon: Megaphone },
      { name: 'Reports', href: '/principal/reports', icon: PieChart },
      { name: 'Exam Results', href: '/principal/exam-results', icon: FileCheck },
      { name: 'Academic Diaries', href: '/principal/diaries', icon: BookOpen },
      { name: 'Inquiries', href: '/principal/inquiries', icon: Inbox },
      { name: 'News Feed', href: '/principal/news-manage', icon: Newspaper },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
    accountant: [
      { name: 'Dashboard', href: '/accountant/dashboard', icon: LayoutDashboard },
      { name: 'Fee Collection', href: '/accountant/fees', icon: CreditCard },
      { name: 'Expense Registry', href: '/accountant/expenses', icon: DollarSign },
      { name: 'Financial Reports', href: '/accountant/reports', icon: PieChart },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
    parent: [
      { name: 'Dashboard', href: '/parent/dashboard', icon: LayoutDashboard },
      { name: 'Children Status', href: '/parent/children', icon: GraduationCap },
      { name: 'Class Diary', href: '/parent/diary', icon: BookOpen },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  };

  const currentNav = navigation[role as keyof typeof navigation] || [];

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-500 ease-in-out lg:static lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'bg-slate-950 border-r border-slate-900 overflow-hidden'
      )}
    >
      <div className="absolute inset-0 mesh-indigo opacity-30 pointer-events-none" />

      <div className="relative h-full flex flex-col z-10">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8 group cursor-default">
            <div className="p-2.5 bg-white dark:bg-emerald-500 rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-300">
              <img src="/assets/logo.png" alt="BLS" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <p className="text-white font-black text-xl tracking-tight leading-none uppercase">BLS Esakhel</p>
              <div className="hidden md:flex text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5 whitespace-nowrap items-center">
                21<span className="text-[0.7em] uppercase relative -top-[0.4em] ml-0.5">ST</span>&nbsp;CENTURY'S SKILLS
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          {currentNav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative',
                  isActive
                    ? 'bg-white/10 text-white shadow-soft'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    'h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110',
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                  )} />
                  <span className={cn(
                    "font-bold text-xs tracking-widest transition-colors duration-300 uppercase",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  )}>
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="absolute left-0 w-1.5 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-in fade-in slide-in-from-left-1 duration-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 group relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none mb-1">Standardized Role</p>
              <p className="text-white font-bold text-sm uppercase tracking-tight">{user.role}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm" />
                  <div className="w-5 h-5 rounded-full bg-indigo-500 border-2 border-slate-900 shadow-sm" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified</span>
              </div>
            </div>
          </div>
          {/* Developer Credit */}
          <div className="mt-4 px-2 py-2 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-300">
            <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-none">
              Programming by <span className="text-emerald-400">Sami Ullah Khan</span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
