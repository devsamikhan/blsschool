import { useState, useEffect } from 'react';
import { AdmissionApplication, ContactInquiry } from '../../types';
import { getAllAdmissions, updateAdmission, getAllInquiries, updateInquiry } from '../../lib/api';
import { EVENTS, useEventListener } from '../../lib/events';
import { toast } from 'sonner';
import { Inbox, FileText, CheckCircle, Clock, XCircle, User, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

export function PrincipalInquiries() {
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'admissions' | 'contact'>('admissions');
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionApplication | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [adm, inq] = await Promise.all([
        getAllAdmissions(),
        getAllInquiries()
      ]);
      setAdmissions(adm.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
      setInquiries(inq.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
    } catch {
      toast.error('Failed to load inquiries.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEventListener(EVENTS.ADMISSION_CHANGE, fetchData);
  useEventListener(EVENTS.INQUIRY_CHANGE, fetchData);

  const handleUpdateAdmissionStatus = async (id: string, newStatus: AdmissionApplication['status']) => {
    try {
      await updateAdmission(id, { status: newStatus });
      const updated = (prev: AdmissionApplication[]) => prev.map(a => a.id === id ? { ...a, status: newStatus } : a);
      setAdmissions(updated);
      // Sync dialog if it's the same record
      setSelectedAdmission(prev => prev?.id === id ? { ...prev, status: newStatus } : prev);
      toast.success(`Application status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateInquiryStatus = async (id: string, newStatus: ContactInquiry['status']) => {
    try {
      await updateInquiry(id, { status: newStatus });
      setInquiries(inquiries.map(i => i.id === id ? { ...i, status: newStatus } : i));
      toast.success(`Inquiry marked as ${newStatus}`);
    } catch {
      toast.error('Failed to update inquiry');
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="lms-page-title">Institutional Inbox</h1>
          <p className="lms-body mt-1">Manage admission applications and public contact requests.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab('admissions')}
            className={cn("px-8 py-5 text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all",
              activeTab === 'admissions' ? "border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-800" : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500"
            )}
          >
            <FileText className="w-4 h-4" /> Admissions
            <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">{admissions.filter(a => a.status === 'pending').length} New</span>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={cn("px-8 py-5 text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all",
              activeTab === 'contact' ? "border-blue-500 text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-800" : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500"
            )}
          >
            <Inbox className="w-4 h-4" /> Public Inquiries
            <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-[9px] font-bold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">{inquiries.filter(i => i.status === 'unread').length} New</span>
          </button>
        </div>

        <div className="p-0">
          {activeTab === 'admissions' ? (
            <div className="overflow-x-auto">
              {admissions.length === 0 ? (
                <p className="text-center py-10 text-slate-500 dark:text-slate-400">No admission applications found.</p>
              ) : (
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 lms-table-header">Student Name</th>
                      <th className="px-6 py-4 lms-table-header">Grade</th>
                      <th className="px-6 py-4 lms-table-header">Date</th>
                      <th className="px-6 py-4 lms-table-header">Status</th>
                      <th className="px-6 py-4 lms-table-header text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {admissions.map(adm => (
                      <tr key={adm.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{adm.studentName}</div>
                          <div className="lms-meta">Father: {adm.fatherName}</div>
                        </td>
                        <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-medium text-xs text-slate-600 dark:text-slate-300">{adm.gradeAppliedFor}</span></td>
                        <td className="px-6 py-4 lms-meta">{new Date(adm.submittedAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={cn("lms-badge",
                            adm.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            adm.status === 'reviewed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            adm.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            'bg-red-100 text-red-700 border-red-200'
                          )}>{adm.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setSelectedAdmission(adm)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">View Full</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
               {inquiries.length === 0 ? (
                <p className="text-center py-10 text-slate-500 dark:text-slate-400">No contact inquiries found.</p>
              ) : (
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 lms-table-header">Sender</th>
                      <th className="px-6 py-4 lms-table-header">Message Preview</th>
                      <th className="px-6 py-4 lms-table-header">Date</th>
                      <th className="px-6 py-4 lms-table-header">Status</th>
                      <th className="px-6 py-4 lms-table-header text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {inquiries.map(inq => (
                      <tr key={inq.id} className={cn("hover:bg-slate-50/50 dark:hover:bg-slate-800/30", inq.status === 'unread' ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : '')}>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 dark:text-white">{inq.name}</p>
                          <p className="lms-meta">{inq.email}</p>
                        </td>
                        <td className="px-6 py-4 pr-12">
                          <p className="line-clamp-2 lms-body max-w-md">{inq.message}</p>
                        </td>
                        <td className="px-6 py-4 lms-meta whitespace-nowrap">{new Date(inq.submittedAt).toLocaleDateString()}</td>
                         <td className="px-6 py-4">
                          <span className={cn("lms-badge flex items-center gap-1.5",
                            inq.status === 'unread' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            inq.status === 'read' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                            'bg-emerald-100 text-emerald-700 border-emerald-200'
                          )}>
                             {inq.status === 'unread' && <Clock className="w-3 h-3" />}
                             {inq.status === 'read' && <CheckCircle className="w-3 h-3" />}
                             {inq.status === 'resolved' && <CheckCircle className="w-3 h-3" />}
                             {inq.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          {inq.status === 'unread' && (
                             <button onClick={() => handleUpdateInquiryStatus(inq.id, 'read')} className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200">Mark Read</button>
                          )}
                          {inq.status !== 'resolved' && (
                            <button onClick={() => handleUpdateInquiryStatus(inq.id, 'resolved')} className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 text-emerald-700">Resolve</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admission Detail Dialog */}
      <Dialog open={!!selectedAdmission} onOpenChange={(open) => !open && setSelectedAdmission(null)}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 p-0 overflow-hidden border-slate-200 dark:border-slate-800">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              Application Details
              <span className="text-xs font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400">ID: {selectedAdmission?.id}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedAdmission && (
            <div className="p-6">
               <div className="grid grid-cols-2 gap-6 mb-8">
                 <div className="space-y-4">
                    <div className="flex gap-3">
                      <User className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Student Info</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{selectedAdmission.studentName}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">DOB: {selectedAdmission.dateOfBirth} ({selectedAdmission.gender})</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Parent/Guardian</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{selectedAdmission.fatherName}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{selectedAdmission.parentPhone}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{selectedAdmission.parentEmail}</p>
                      </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex gap-3">
                      <Building2 className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Academic Info</p>
                        <p className="font-semibold text-slate-900 dark:text-white">Applying for: {selectedAdmission.gradeAppliedFor}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Previous School: {selectedAdmission.previousSchool}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="lms-stat-label">Location</p>
                        <p className="text-sm font-medium text-slate-600 max-w-xs dark:text-slate-300">{selectedAdmission.address}</p>
                      </div>
                    </div>
                 </div>
               </div>

               <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Current Status: <span className="uppercase text-slate-900 dark:text-white">{selectedAdmission.status}</span></p>
                  <div className="flex gap-2">
                    {selectedAdmission.status === 'pending' && (
                      <button onClick={() => { handleUpdateAdmissionStatus(selectedAdmission.id, 'reviewed'); setSelectedAdmission(null); }} className="px-4 py-2 text-sm font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl">Mark Reviewed</button>
                    )}
                    {(selectedAdmission.status === 'pending' || selectedAdmission.status === 'reviewed') && (
                      <>
                        <button onClick={() => { handleUpdateAdmissionStatus(selectedAdmission.id, 'rejected'); setSelectedAdmission(null); }} className="px-4 py-2 text-sm font-bold bg-red-50 text-red-700 hover:bg-red-100 rounded-xl"><XCircle className="w-4 h-4 inline mr-1"/> Reject</button>
                        <button onClick={() => { handleUpdateAdmissionStatus(selectedAdmission.id, 'approved'); setSelectedAdmission(null); }} className="px-4 py-2 text-sm font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl"><CheckCircle className="w-4 h-4 inline mr-1"/> Approve</button>
                      </>
                    )}
                  </div>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
