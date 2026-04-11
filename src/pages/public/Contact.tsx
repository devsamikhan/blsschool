import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, ShieldCheck, ArrowRight, Search, Copy, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { PublicLayout } from '../../components/layout/PublicLayout';
import { createInquiry } from '../../lib/api';
import { EVENTS } from '../../lib/events';
import { cn } from '../../lib/utils';

export function Contact() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please provide all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await createInquiry({
        name,
        email,
        message,
        status: 'unread',
        submittedAt: new Date().toISOString()
      });
      setSubmittedId(response.id);
      toast.success("Message received! Your Tracking ID is " + response.id);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast.error("Transmission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div ref={containerRef}>
        {/* ─── Hero Overview ─── */}
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 bg-slate-950 overflow-hidden min-h-[40vh] md:min-h-[50vh] flex items-center">
          <motion.div style={{ y: heroY, opacity: heroOpacity, willChange: 'transform, opacity' }} className="absolute inset-0 opacity-25">
            <img src="/assets/contact_center_v2.png" className="w-full h-full object-cover blur-[2px] brightness-50" alt="Contact Hub" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </motion.div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-3 mb-8 px-5 py-2 rounded-full border border-emerald-500/50 bg-slate-900/50 backdrop-blur-3xl text-emerald-300 text-xs font-bold uppercase tracking-widest shadow-lg">
              Communication Protocol: Established
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
              className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tight mb-8 leading-tight shadow-xl drop-shadow-lg">
              Contact <span className="text-emerald-500 italic drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">BLS School.</span>
            </motion.h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed opacity-100 drop-shadow-md bg-slate-950/20 p-4 rounded-2xl backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none lg:p-0">
              Connect with the BLS Isakhel administrative hub for admissions, technology inquiries, and institutional collaborations.
            </p>
          </div>
        </section>

        {/* ─── Contact Info Grid ─── */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {[
                { icon: Phone, title: "Phone Line", detail: "0300 0136840", sub: "Operational: 08:00 - 15:00", color: "from-emerald-600 to-teal-500" },
                { icon: Mail, title: "Email Services", detail: "blendedlearningschoolpk@gmail.com", sub: "Response time: < 24h", color: "from-blue-600 to-indigo-500" },
                { icon: MapPin, title: "Campus Address", detail: "Isakhel, Punjab", sub: "Official Headquarters", color: "from-purple-600 to-fuchsia-500" },
              ].map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className="rounded-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:shadow-xl transition-all group overflow-hidden h-full">
                    <CardContent className="p-8 md:p-10 text-center">
                      <div className={cn("h-16 w-16 md:h-20 md:w-20 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-6 md:mb-8 shadow-md transform group-hover:rotate-6 transition-transform duration-300", item.color)}>
                        <item.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight italic">{item.title}</h3>
                      <p className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{item.detail}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{item.sub}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Map & Form Phase ─── */}
        <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-stretch">
              {/* Map Placeholder */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1 }}
                className="relative min-h-[400px] md:min-h-[500px] rounded-3xl md:rounded-[4rem] overflow-hidden shadow-xl border-8 md:border-[12px] border-white dark:border-slate-800 group">
                <motion.img
                  style={{ scale: useTransform(scrollYProgress, [0.3, 0.9], [1, 1.1]), willChange: 'transform' }}
                  src="https://scontent.flhe2-2.fna.fbcdn.net/v/t39.30808-6/654415226_122161281350717256_4642760663152406630_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeHzkHyEeIeYyLeN9y8JsHG_4Rp28Un-Ai7hGnbxSf4CLgYKrfcj-vyMgErmRgguKwH0H_xFgN4oUHFs6Yy8NoEy&_nc_ohc=S2pDlhlW0yIQ7kNvwHGY4k2&_nc_oc=Adre6ZzQyvPIc-Y9tpyEsIoDYdZ2Xd55OZ37z8ZVjDLAEmIN80EG62My031saBt9amU&_nc_zt=23&_nc_ht=scontent.flhe2-2.fna&_nc_gid=AIog5mbXmB9NNARq4bkZgA&_nc_ss=7a32e&oh=00_AfyhzUKyb5USUZS5BF-jVpn_LnxC7x-3OiAbYoi_4Ui1gQ&oe=69CE8ED8"
                  className="w-full h-full object-cover"
                  alt="Location"
                />
                <div className="absolute inset-0 bg-emerald-600/10 flex flex-col items-center justify-center text-white p-8 md:p-12 text-center backdrop-blur-sm group-hover:bg-emerald-600/20 transition-colors duration-500">
                  <MapPin className="h-16 w-16 md:h-24 md:w-24 mb-6 md:mb-8 text-emerald-500 animate-bounce" />
                  <h3 className="text-3xl md:text-5xl font-black tracking-tight mb-3 md:mb-4 italic">Esakhel Campus</h3>
                  <p className="text-base md:text-xl font-medium text-emerald-100 max-w-sm px-4">The primary engineering hub of BLS is located in the heart of Esakhel.</p>
                  <Button className="mt-8 md:mt-10 rounded-full h-14 md:h-16 px-8 md:px-10 bg-white text-slate-900 font-bold uppercase tracking-widest text-xs hover:bg-emerald-50">
                    Open Coordinates
                  </Button>
                </div>
              </motion.div>

              {/* Form */}
              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
                <Card className="h-full rounded-3xl md:rounded-[4rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 md:p-16 shadow-2xl">
                  <div className="mb-10 md:mb-12">
                    <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight italic leading-tight mb-3">Get in <br className="hidden md:block" /> Touch.</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">We would love to hear from you</p>
                  </div>
                  {submittedId ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 py-12 text-center">
                      <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white italic mb-2 tracking-tight">Message Received.</h4>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Your inquiry has been sent to the administration.</p>
                      </div>

                      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                          <ShieldCheck className="h-12 w-12 text-white" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-3">Unique Tracking Reference</p>
                        <div className="flex items-center justify-center gap-4">
                          <code className="text-3xl font-black text-white tracking-widest uppercase">{submittedId}</code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(submittedId);
                              toast.info("ID Copied to Clipboard");
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                          >
                            <Copy className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <Button
                          onClick={() => navigate('/track-admission')}
                          className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg group uppercase tracking-widest shadow-xl shadow-emerald-500/20"
                        >
                          Track Status Now
                          <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSubmittedId(null)}
                          className="h-16 rounded-2xl border-slate-200 dark:border-slate-800 font-bold uppercase tracking-widest text-slate-500"
                        >
                          Submit Another Query
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                      <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-2">Full Name</Label>
                        <Input required value={name} onChange={e => setName(e.target.value)} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-6 font-medium focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="First & Last Name" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-2">Email Address</Label>
                        <Input required value={email} onChange={e => setEmail(e.target.value)} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-6 font-medium focus:ring-2 focus:ring-emerald-500 outline-none" type="email" placeholder="contact@domain.com" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-2">Your Message</Label>
                        <Textarea required value={message} onChange={e => setMessage(e.target.value)} className="min-h-[140px] md:min-h-[160px] rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 font-medium resize-y focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="How can we help you?..." />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <Button type="submit" disabled={loading} size="lg" className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/20 group uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] w-full">
                          {loading ? "Sending..." : "Submit Inquiry"}
                          <Send className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform h-5 w-5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => navigate('/track-admission')}
                          className="h-16 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-lg group uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] w-full"
                        >
                          Track Status
                          <Search className="ml-3 h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        </Button>
                      </div>
                    </form>
                  )}
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
