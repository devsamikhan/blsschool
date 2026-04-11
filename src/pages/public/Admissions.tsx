import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, FileText, CheckCircle2, Send, ArrowRight, UserPlus, ShieldCheck, Sparkles, CreditCard, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { PublicLayout } from '../../components/layout/PublicLayout';
import { createAdmission } from '../../lib/api';
import { EVENTS } from '../../lib/events';

const steps = [
  { icon: UserPlus, title: "Inquiry Submission", desc: "Submit your basic details through our digital helpdesk to start the journey." },
  { icon: FileText, title: "Digital Docs", desc: "Upload birth certificate and previous academic records via our secure portal." },
  { icon: Sparkles, title: "Tech Assessment", desc: "Participate in a friendly aptitude evaluation focused on logic and creativity." },
  { icon: ShieldCheck, title: "Final Enrollment", desc: "Receive your admission letter and complete the onboarding process." },
];

const fees = [
  { group: "Junior Engineers", grades: "PG to Class 2", admission: "4,000", monthly: "2,500" },
  { group: "Middle Pioneers", grades: "Class 3 to 6", admission: "4,000", monthly: "3,000" },
  { group: "Tech Leaders", grades: "Class 7 to 10", admission: "4,000", monthly: "5,000" },
];

export function Admissions() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [loading, setLoading] = useState(false);

  // Form State
  const [studentName, setStudentName] = useState("");
  const [gradeAppliedFor, setGradeAppliedFor] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!studentName || !gradeAppliedFor || !fatherName || !parentPhone) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await createAdmission({
        studentName,
        gradeAppliedFor,
        fatherName,
        parentPhone,
        dateOfBirth: 'Not Provided',
        gender: 'other',
        previousSchool: 'Not Provided',
        address: remarks || 'Not Provided', // mapping strategic context to address
        parentEmail,
        status: 'pending',
        submittedAt: new Date().toISOString()
      });

      setSubmittedId(response.id);
      toast.success("Application submitted! Save your Tracking ID.");
      setStudentName("");
      setGradeAppliedFor("");
      setFatherName("");
      setParentPhone("");
      setParentEmail("");
      setRemarks("");
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div ref={containerRef}>
        {/* ─── Hero Overview ─── */}
        <section className="relative pt-48 pb-32 bg-slate-950 border-b border-white/5 overflow-hidden min-h-[60vh] flex items-center">
          <motion.div style={{ y: heroY, opacity: heroOpacity, willChange: 'transform, opacity' }} className="absolute inset-0 opacity-30">
            <img src="/assets/campus_exterior_v2.png" className="w-full h-full object-cover blur-sm brightness-50" alt="Admissions Hub" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </motion.div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-3 mb-8 px-5 py-2 rounded-full border border-emerald-500/50 bg-slate-900/50 backdrop-blur-3xl text-emerald-300 text-xs font-bold uppercase tracking-widest shadow-lg">
              Academic Session 2026
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight mb-10 leading-tight shadow-xl drop-shadow-lg">
              A Journey of <span className="text-emerald-500 italic drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] inline-block">Discovery.</span>
            </motion.h1>
            <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed mb-12 opacity-100 drop-shadow-md bg-slate-950/20 p-2 rounded-xl backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none sm:p-0">
              Admissions for the 2026 academic year are now open. We invite aspirants who value rigorous learning and innovative thinking.
            </p>
            <div className="flex justify-center flex-wrap gap-4 md:gap-6">
              <div className="px-6 py-3 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-lg text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> merit based
              </div>
              <div className="px-6 py-3 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-lg text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> competitive intake
              </div>
            </div>
          </div>
        </section>

        {/* ─── Enrollment Steps ─── */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white text-center mb-16 md:mb-20 tracking-tight italic">Admission Procedure.</motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((s, i) => (
                <motion.div key={s.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className="h-full rounded-3xl md:rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:shadow-xl transition-all group overflow-hidden">
                    <CardContent className="p-8 md:p-10 text-center">
                      <div className="relative w-20 h-20 mx-auto mb-8">
                        <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500" />
                        <div className="relative h-20 w-20 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800 z-10 transition-colors group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50">
                          <s.icon className="h-8 w-8" />
                        </div>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{s.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{s.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Fee Universe ─── */}
        <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 xl:gap-24 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white mb-8 shadow-md">
                  <CreditCard className="h-8 w-8" />
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tight italic">Value-First <br /> Investment.</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-10 italic border-l-4 border-emerald-500 pl-6">
                  Our fee structure is optimized to include all robotics hardware, digital subscriptions, and lab access without hidden costs.
                </p>
                <div className="space-y-4">
                  {['Zero Annual Incremental Fees', 'Robotics Lab Access', 'Blended LMS Accounts', 'Strategic Scholarship Fund'].map(item => (
                    <div key={item} className="flex items-center gap-4 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-widest group">
                      <div className="h-2 w-8 rounded-full bg-emerald-500 group-hover:w-12 transition-all duration-300" /> {item}
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
                className="overflow-hidden rounded-3xl md:rounded-[4rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl">
                <div className="bg-emerald-600 p-8 md:p-12 text-white relative overflow-hidden">
                  <div className="absolute -bottom-8 -right-8 p-4 opacity-10">
                    <ShieldCheck className="h-32 w-32 rotate-12" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2 tracking-tight italic">Fee Matrix 2026</h3>
                  <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Institutional Validation Status: Active</p>
                </div>

                {/* Stacked Cards for Mobile, Table for Desktop */}
                <div className="p-4 md:p-0">
                  <div className="block md:hidden space-y-4">
                    {fees.map((f) => (
                      <div key={f.grades} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="font-bold text-slate-900 dark:text-white text-xl uppercase tracking-tight italic mb-1">{f.group}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">{f.grades}</p>
                        <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
                          <div className="text-sm">
                            <span className="text-slate-400 block mb-1">Security</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">Rs {f.admission}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 block text-sm mb-1">Monthly</span>
                            <span className="text-lg font-black text-emerald-600">PKR {f.monthly}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                          <th className="p-6 lg:p-8 text-xs font-bold uppercase tracking-widest text-slate-500">Class Phase</th>
                          <th className="p-6 lg:p-8 text-xs font-bold uppercase tracking-widest text-slate-500">Security</th>
                          <th className="p-6 lg:p-8 text-xs font-bold uppercase tracking-widest text-slate-500">Monthly Cycle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {fees.map((f) => (
                          <tr key={f.grades} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                            <td className="p-6 lg:p-8">
                              <p className="font-bold text-slate-900 dark:text-white text-xl uppercase tracking-tight italic leading-none">{f.group}</p>
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">{f.grades}</p>
                            </td>
                            <td className="p-6 lg:p-8 text-base font-bold text-slate-600 dark:text-slate-400">Rs {f.admission}</td>
                            <td className="p-6 lg:p-8">
                              <span className="text-2xl font-black text-emerald-600">PKR {f.monthly}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Inquiry Portal ─── */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-emerald-500/5 blur-[200px] rounded-full pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <Card className="rounded-3xl md:rounded-[4rem] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl p-8 md:p-16 shadow-2xl">
              <CardHeader className="text-center p-0 mb-12">
                <CardTitle className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 italic leading-tight">Apply for Admission.</CardTitle>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Join the BLS School Community</p>
              </CardHeader>
              <CardContent className="p-0">
                {submittedId ? (
                  <div className="text-center py-12 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/30">
                      <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white italic mb-4">Application Received.</h3>
                    <p className="text-slate-500 font-medium mb-8 italic">Your application has been safely submitted to the admission office.</p>
                    <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 mb-8 max-w-sm mx-auto">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Tracking ID</p>
                      <p className="text-4xl font-black text-emerald-600 tracking-tighter italic">{submittedId}</p>
                    </div>
                    <Button asChild className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest italic group">
                      <a href="/track-admission">
                        Track Progress
                        <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-2">Student Name</Label>
                        <Input required value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="First & Last Name" className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-6 focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-2">Class Applying For</Label>
                        <Select required value={gradeAppliedFor} onValueChange={setGradeAppliedFor}>
                          <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-6 font-semibold">
                            <SelectValue placeholder="Select Phase" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            {["PG", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"].map(g => (
                              <SelectItem key={g} value={g} className="font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg py-3">{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-2">Parent/Guardian Name</Label>
                        <Input required value={fatherName} onChange={e => setFatherName(e.target.value)} placeholder="Parent/Guardian Name" className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-6 focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-2">Contact Number</Label>
                        <Input type="tel" required value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="+92 3XX XXXXXXX" className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-6 focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-2">Email Address</Label>
                      <Input type="email" required value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="parent@example.com" className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-6 focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-2">Additional Remarks (Optional)</Label>
                      <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Any specific details you would like us to know..." className="min-h-[120px] rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 resize-y focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <Button type="submit" disabled={loading} size="lg" className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/20 group uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] w-full">
                        {loading ? "Submitting..." : "Submit Application"}
                        <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform h-5 w-5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => navigate('/track-admission')}
                        className="h-16 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-lg group uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] w-full"
                      >
                        Track Application
                        <Search className="ml-3 h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
