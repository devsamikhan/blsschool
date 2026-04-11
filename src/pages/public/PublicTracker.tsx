import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, CheckCircle2, Clock, XCircle, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { getAdmissionById, getInquiryById } from "../../lib/api";
import { AdmissionApplication, ContactInquiry } from "../../types";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PublicTracker() {
  const [trackingId, setTrackingId] = useState("");
  const [result, setResult] = useState<{ type: 'admission', data: AdmissionApplication } | { type: 'inquiry', data: ContactInquiry } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const id = trackingId.trim();
    if (!id) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Logic: Try Admission first as it's the primary use case
      try {
        const admission = await getAdmissionById(id);
        if (admission && admission.studentName) {
          setResult({ type: 'admission', data: admission });
          setLoading(false);
          return;
        }
      } catch (e) {
        // Fall through to Inquiry lookup
      }

      // Try Inquiry
      try {
        const inquiry = await getInquiryById(id);
        if (inquiry && inquiry.name) {
          setResult({ type: 'inquiry', data: inquiry });
          setLoading(false);
          return;
        }
      } catch (e) {
        // Both failed
      }

      setError("Invalid Tracking ID. Please verify and try again.");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (!result) return { currentIdx: -1, statusText: "" };
    const status = result.data.status;

    if (result.type === 'admission') {
      const idx = status === 'pending' ? 0 :
        status === 'reviewed' ? 1 :
          (status === 'approved' || status === 'rejected') ? 2 : 0;
      return { currentIdx: idx, statusText: status };
    } else {
      // Inquiry: unread -> read -> resolved
      const idx = status === 'unread' ? 0 :
        status === 'read' ? 1 :
          status === 'resolved' ? 2 : 0;
      return { currentIdx: idx, statusText: status };
    }
  };

  const { currentIdx, statusText } = getStatusInfo();

  return (
    <PublicLayout>
      <div className="relative pt-48 pb-32 bg-slate-950 overflow-hidden min-h-screen">
        {/* Background Decors */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 italic">
              Track Your <span className="text-emerald-500">Journey.</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto italic">
              Enter your unique tracking ID provided during Admission or Inquiry submission.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.form onSubmit={handleTrack} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-16">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <Input
                value={trackingId}
                onChange={e => setTrackingId(e.target.value)}
                placeholder="Enter Tracking ID (e.g. ad_123)"
                className="h-16 pl-12 pr-6 rounded-2xl bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus:ring-emerald-500 text-lg font-bold tracking-widest"
              />
            </div>
            <Button disabled={loading} className="h-16 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest transition-all">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Verify Status"}
            </Button>
          </motion.form>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 font-bold mb-8 uppercase tracking-widest text-xs">
              {error}
            </motion.p>
          )}

          {/* Application Details */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-left">
              <Card className="rounded-3xl border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl border-2">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 border-b border-slate-800 pb-12">
                    <div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-3 block">Digital File Found</span>
                      <h2 className="text-3xl font-black text-white italic tracking-tight mb-2">
                        {result.type === 'admission' ? (result.data as AdmissionApplication).studentName : (result.data as ContactInquiry).name}
                      </h2>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                        {result.type === 'admission' ? `Grade Phase: ${(result.data as AdmissionApplication).gradeAppliedFor}` : "Institutional Inquiry"}
                      </p>
                    </div>
                    <div className="bg-slate-800/50 px-6 py-4 rounded-3xl border border-slate-700">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Status Reference</span>
                      <span className={cn(
                        "text-lg font-black italic",
                        (statusText === 'approved' || statusText === 'resolved') ? 'text-emerald-500' :
                          statusText === 'rejected' ? 'text-red-500' : 'text-amber-500'
                      )}>
                        {statusText.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div className="relative mb-12 mt-8">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 rounded-full" />
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-1000"
                      style={{ width: `${(currentIdx / 2) * 100}%` }}
                    />
                    <div className="relative flex justify-between">
                      {[
                        { label: result.type === 'admission' ? "Submitted" : "Sent", icon: Mail },
                        { label: result.type === 'admission' ? "Under Review" : "Acknowledged", icon: Clock },
                        { label: result.type === 'admission' ? "Decision Ready" : "Response Sent", icon: CheckCircle2 },
                      ].map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 z-10",
                            idx <= currentIdx ? "bg-emerald-500 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-slate-900 border-slate-800"
                          )}>
                            <step.icon className={cn("h-6 w-6", idx <= currentIdx ? "text-white" : "text-slate-700")} />
                          </div>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest transition-colors",
                            idx <= currentIdx ? "text-emerald-500" : "text-slate-600"
                          )}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Response Box */}
                  <div className="bg-slate-950/50 p-8 rounded-3xl border border-white/5 relative group">
                    <div className="absolute top-0 right-0 p-4">
                      <ShieldCheck className="h-10 w-10 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Official Institutional Feedback</p>

                    {result.type === 'admission' ? (
                      <>
                        {statusText === 'approved' ? (
                          <div className="space-y-4">
                            <h3 className="text-2xl font-black text-emerald-500 italic tracking-tight">Congratulations Pioneer!</h3>
                            <p className="text-slate-300 font-medium leading-relaxed italic">Your admission file has been approved by the Principal's board. Please visit the campus with original documents for verification within 48 hours.</p>
                          </div>
                        ) : statusText === 'rejected' ? (
                          <div className="space-y-4">
                            <h3 className="text-2xl font-black text-red-500 italic tracking-tight">Application Terminated</h3>
                            <p className="text-slate-300 font-medium leading-relaxed italic">Your application does not meet the current intake criteria. We wish you success in your future endeavors.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <h3 className="text-2xl font-black text-amber-500 italic tracking-tight">Analyzing Pedigree...</h3>
                            <p className="text-slate-300 font-medium leading-relaxed italic">Our team is currently reviewing your inquiry. You will receive a call for the scheduled assessment soon.</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {statusText === 'resolved' ? (
                          <div className="space-y-4">
                            <h3 className="text-2xl font-black text-emerald-500 italic tracking-tight">Reply Transmitted</h3>
                            <p className="text-slate-300 font-medium leading-relaxed italic">The administrative hub has responded to your inquiry via your digital address (email). Please check your inbox for more details.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <h3 className="text-2xl font-black text-amber-500 italic tracking-tight">Packet Pending Review</h3>
                            <p className="text-slate-300 font-medium leading-relaxed italic">Your strategic inquiry is in the queue. An administrative officer will analyze your request and respond via email shortly.</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-16 text-slate-500">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-4">Urgent Support Direct Line</p>
            <p className="text-lg font-black text-slate-300 tracking-tighter italic">+92 300 0136840</p>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
  );
}
