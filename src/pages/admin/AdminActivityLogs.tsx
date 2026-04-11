import { useState, useEffect } from 'react';
import { Activity, Search, Filter, ShieldAlert, UserPlus, FileEdit } from 'lucide-react';
import { cn } from '../../lib/utils';

type AuditLog = {
  id: string;
  action: string;
  user: string;
  role: string;
  timestamp: string;
  type: 'security' | 'user_management' | 'content' | 'system';
};

const MOCK_LOGS: AuditLog[] = [
  { id: '1', action: 'Failed login attempt (3x)', user: 'Unknown IP (192.168.1.5)', role: 'none', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), type: 'security' },
  { id: '2', action: 'Created new teacher user', user: 'Admin User', role: 'admin', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), type: 'user_management' },
  { id: '3', action: 'Deleted Class "Nursery B"', user: 'Admin User', role: 'admin', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), type: 'content' },
  { id: '4', action: 'Changed academic year to 2025-2026', user: 'System Admin', role: 'admin', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), type: 'system' },
  { id: '5', action: 'Successful login', user: 'Principal Smith', role: 'principal', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), type: 'security' },
  { id: '6', action: 'Bulk imported 45 students', user: 'Admin User', role: 'admin', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), type: 'user_management' },
  { id: '7', action: 'Reset password for User STU001', user: 'Admin User', role: 'admin', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), type: 'security' },
];

export function AdminActivityLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [logs] = useState<AuditLog[]>(MOCK_LOGS);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'security': return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'user_management': return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'content': return <FileEdit className="h-4 w-4 text-orange-500" />;
      case 'system': return <Activity className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="lms-page-title">Institutional Audit Logs</h1>
        <p className="lms-body mt-1">Review institutional event records and security audit trails across the platform.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-8">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search actions or users..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input pl-12 h-11"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select 
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="form-select h-11"
            >
              <option value="all">All Event Types</option>
              <option value="security">Security & Auth</option>
              <option value="user_management">User Management</option>
              <option value="content">Content & Data</option>
              <option value="system">System Settings</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 lms-table-header uppercase text-[10px]">Action Recorded</th>
                  <th className="px-6 py-4 lms-table-header uppercase text-[10px]">Authorized Entity</th>
                  <th className="px-6 py-4 lms-table-header uppercase text-[10px]">Classification</th>
                  <th className="px-6 py-4 lms-table-header text-right uppercase text-[10px]">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-sm">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          {getIconForType(log.type)}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white tracking-tight">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-widest">{log.user}</span>
                        <span className="text-[10px] text-slate-400 font-mono italic">{log.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={cn(
                         "lms-badge text-[9px]",
                         log.type === 'security' ? 'bg-red-50 text-red-700 border-red-100' :
                         log.type === 'user_management' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                         log.type === 'content' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                         'bg-purple-50 text-purple-700 border-purple-100'
                       )}>
                         {log.type.replace('_', ' ').toUpperCase()}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <p className="text-slate-500 font-mono text-[11px] font-bold">
                         {new Date(log.timestamp).toLocaleDateString()}
                       </p>
                       <p className="text-[10px] text-slate-400">
                         {new Date(log.timestamp).toLocaleTimeString()}
                       </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
