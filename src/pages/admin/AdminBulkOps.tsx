import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, FileText, AlertCircle, CheckCircle2, Users, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ValidationError = { row: number; field: string; message: string };
type ParsedUser = { name: string; email: string; role: string; phone?: string };

function parseCSV(text: string): { users: ParsedUser[]; errors: ValidationError[] } {
  const lines = text.trim().split('\n');
  const errors: ValidationError[] = [];
  const users: ParsedUser[] = [];
  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  const requiredCols = ['name', 'email', 'role'];

  if (!requiredCols.every(c => header.includes(c))) {
    errors.push({ row: 0, field: 'Header', message: `Missing required columns: ${requiredCols.filter(c => !header.includes(c)).join(', ')}` });
    return { users, errors };
  }

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(v => v.trim());
    if (row.length < requiredCols.length) continue;
    const user: ParsedUser = { name: '', email: '', role: '' };
    
    header.forEach((col, ci) => {
      if (col === 'name' || col === 'email' || col === 'role' || col === 'phone') {
        (user as Record<string, string | undefined>)[col] = row[ci] || '';
      }
    });

    if (!user.name) errors.push({ row: i, field: 'name', message: 'Name is required' });
    if (!user.email || !/\S+@\S+\.\S+/.test(user.email)) errors.push({ row: i, field: 'email', message: 'Valid email required' });
    if (!['student', 'teacher', 'admin', 'principal', 'accountant'].includes(user.role.toLowerCase())) {
      errors.push({ row: i, field: 'role', message: `Invalid role: "${user.role}"` });
    }
    if (errors.filter(e => e.row === i).length === 0) users.push(user);
  }
  return { users, errors };
}

const SAMPLE_CSV = `name,email,role,phone
Ahmad Raza,ahmad@bls.edu,student,0300-1234567
Fatima Malik,fatima@bls.edu,teacher,0300-7654321
Usman Ali,usman@bls.edu,student,0300-1111111`;

export function AdminBulkOps() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsed, setParsed] = useState<ParsedUser[] | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [fileName, setFileName] = useState('');

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) { toast.error('Please upload a .csv file'); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { users, errors } = parseCSV(text);
      setParsed(users);
      setErrors(errors);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleImport = () => {
    if (!parsed || parsed.length === 0) return;
    toast.success(`Successfully imported ${parsed.length} users.`);
    setParsed(null); setErrors([]); setFileName('');
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bls_users_template.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Sample CSV template downloaded.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="lms-page-title">Mass Data Management</h1>
          <p className="lms-body mt-1">Execute bulk data migrations and record imports for the institution.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Import Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl"><Upload className="w-5 h-5" /></div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Import Records</h2>
              <p className="lms-meta text-[10px] md:text-xs">Upload CSV file to bulk create user accounts.</p>
            </div>
          </div>

          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />

          <div
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300",
              dragActive
                ? "border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 dark:border-blue-500"
                : "border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
            )}
          >
            <FileText className="h-8 md:h-10 w-8 md:w-10 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            {fileName ? (
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight break-all">{fileName}</p>
            ) : (
              <div className="space-y-1">
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">Drop CSV or click to select</p>
                <p className="text-[10px] text-slate-300 uppercase tracking-widest font-mono hidden md:block">Format: name, email, role, phone</p>
              </div>
            )}
          </div>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-xl p-5 md:p-6 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 text-[10px] font-bold uppercase tracking-widest">
                <AlertCircle className="w-4 h-4" /> {errors.length} Parsing Errors Found
              </div>
              <ul className="space-y-1 border-t border-rose-100 dark:border-rose-800 pt-3">
                {errors.slice(0, 5).map((e, i) => (
                  <li key={i} className="text-[10px] text-rose-500 font-bold font-mono uppercase truncate">
                    Row {e.row}: [{e.field}] {e.message}
                  </li>
                ))}
                {errors.length > 5 && <li className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">+{errors.length - 5} More errors</li>}
              </ul>
            </div>
          )}

          {/* Preview */}
          {parsed && parsed.length > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-xl p-5 md:p-6">
              <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-4">
                <CheckCircle2 className="w-4 h-4" /> {parsed.length} Valid Records Ready
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {parsed.slice(0, 5).map((u, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400 font-bold border-b border-slate-50 dark:border-slate-800 pb-2">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{u.name}</span>
                    <span className="text-slate-200 hidden sm:inline">|</span>
                    <span className="truncate max-w-[120px] sm:max-w-none">{u.email}</span>
                    <span className="ml-auto px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-[8px] uppercase tracking-tighter shrink-0">{u.role}</span>
                  </div>
                ))}
                {parsed.length > 5 && <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest pt-2">+{parsed.length - 5} More records</p>}
              </div>
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!parsed || parsed.length === 0}
            className="w-full h-11 md:h-12 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all disabled:opacity-40 text-xs md:text-sm"
          >
            <Users className="w-4 h-4 mr-2" /> Import {parsed ? parsed.length : ''} Users
          </Button>
        </div>

        {/* Export Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6 shadow-sm flex flex-col justify-between">
           <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl"><Download className="w-5 h-5" /></div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Export & Templates</h2>
                  <p className="lms-meta text-[10px] md:text-xs">Download data backups or templates.</p>
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={downloadSample}
                  className="w-full flex items-center justify-between p-4 md:p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-9 w-9 md:h-10 md:w-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                      <FileText className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest leading-none">CSV Import Template</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 italic">Download Template</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </button>

                <button onClick={() => toast.info('Export would download all users from the database.')}
                  className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                      <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Export User Records</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 italic">Full Registry Export</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </button>
              </div>
           </div>

           {/* CSV Format Guide */}
           <div className="bg-slate-950 rounded-2xl overflow-hidden mt-6 shadow-xl">
              <div className="bg-white/5 px-6 py-4 flex items-center justify-between">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Required CSV Header Syntax</p>
                <div className="flex gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                </div>
              </div>
              <div className="p-6 font-mono text-[9px] flex flex-col gap-2">
                <div className="text-blue-400 font-bold underline">name,email,role,phone</div>
                <div className="opacity-40 space-y-1 mt-2">
                   <p className="text-white">Ahmad Raza,ahmad@bls.edu,student,0300-1234567</p>
                   <p className="text-white">Fatima Malik,fatima@bls.edu,teacher,0300-7654321</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
