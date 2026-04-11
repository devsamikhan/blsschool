import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Bell, Zap, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getAllNews } from '../../lib/api';
import { EVENTS, useEventListener } from '../../lib/events';
import { NewsItem } from '../../types';
import { cn } from "@/lib/utils";

const announcements = [
  { title: "Annual Science Fair 2026", date: "March 15, 2026", category: "Event", desc: "Students from all grades showcase their innovative science projects. Parents and community members are welcome!" },
  { title: "New STEM Lab Inauguration", date: "March 10, 2026", category: "News", desc: "State-of-the-art innovation lab with specialized robotics stations now open for students." },
  { title: "Parent-Teacher Advisory", date: "March 20, 2026", category: "Meeting", desc: "Quarterly strategic PTM for all grades. Please check your digital schedule." },
  { title: "Sports Excellence Week", date: "April 1, 2026", category: "Event", desc: "A week of inter-house competitions in cricket, football, and athletic logic." },
  { title: "Academic Admissions 2026", date: "Feb 28, 2026", category: "Admissions", desc: "Applications are now active for the upcoming session across all academic phases." },
];

const upcomingEvents = [
  { title: "Innovation Fair", date: "March 15", time: "09:00 - 15:00" },
  { title: "PTM Advisory", date: "March 20", time: "10:00 - 13:00" },
  { title: "Sports Week", date: "April 1-5", time: "Institutional" },
];

export function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await getAllNews();
      // Filter for active news and sort by date descending
      const activeNews = data
        .filter(n => n.isActive)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      setNews(activeNews);
    } catch (error) {
      console.error("Failed to load news", error);
      setNews([]); // ensure it's empty on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEventListener(EVENTS.NEWS_CHANGE, fetchNews);

  return (
    <PublicLayout>
      {/* ─── Hero Overview ─── */}
      <section className="relative pt-48 pb-32 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
           <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600" className="w-full h-full object-cover blur-sm" alt="Background" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-3 mb-10 px-6 py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-3xl text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">
             Institutional Bulletin
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
            className="text-5xl sm:text-7xl lg:text-9xl font-black text-white tracking-tighter mb-10 leading-[0.85] shadow-2xl">
            News & <span className="text-emerald-500 italic">Announcements.</span>
          </motion.h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed opacity-90 italic">
            Stay synchronized with the latest updates, event reports, and strategic bulletins from BLS Isakhel.
          </p>
        </div>
      </section>

      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 grid gap-20 lg:grid-cols-3">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-12">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic flex items-center gap-4">
               <Zap className="h-8 w-8 text-emerald-500" /> Latest Updates
            </h2>
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : news.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                  <p className="text-slate-500 font-medium text-lg mb-6">Unable to sync with bulletin server.</p>
                  <Button 
                    onClick={fetchNews} 
                    variant="outline" 
                    className="rounded-full px-8 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600 font-bold"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Try Re-sync
                  </Button>
                </div>
              ) : (
                news.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Card className="rounded-3xl border-none ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-900 hover:shadow-2xl transition-all group overflow-hidden">
                      {item.imageUrl && (
                        <div className="aspect-[21/9] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative border-b border-slate-100 dark:border-slate-800">
                           <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                      )}
                      <CardContent className={cn("p-10", !item.imageUrl && "pt-12")}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                          <div className="flex items-center gap-4">
                             <Badge className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border-none">{item.category}</Badge>
                             <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                               <Calendar className="h-4 w-4" /> {new Date(item.publishedAt).toLocaleDateString()}
                             </span>
                          </div>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 italic tracking-tight group-hover:text-emerald-600 transition-colors uppercase">{item.title}</h3>
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed opacity-80 mb-8">{item.content}</p>
                        <Button variant="ghost" className="p-0 h-auto font-black text-xs uppercase tracking-[0.2em] text-emerald-600 group/btn">
                          Read Full Bulletin <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-2 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-12">
             <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic flex items-center gap-4">
                <Bell className="h-8 w-8 text-emerald-500" /> Key Dates
             </h2>
             <Card className="rounded-[4rem] border-none ring-1 ring-slate-100 dark:ring-slate-800 bg-slate-50 dark:bg-slate-950 p-10 shadow-xl overflow-hidden relative">
                <div className="absolute -top-10 -right-10 p-10 opacity-5">
                   <Bell className="h-40 w-40 rotate-12" />
                </div>
                <div className="space-y-8 relative z-10">
                  {upcomingEvents.map((e) => (
                    <div key={e.title} className="group cursor-default">
                      <h4 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors uppercase tracking-tighter mb-2 italic">{e.title}</h4>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-emerald-500" /> {e.date}</span>
                        <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-500" /> {e.time}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                     <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 italic leading-relaxed">Verification of events via BLS Digital Hub 2026.</p>
                     <Button className="w-full h-16 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-slate-800">Download Semester Guide</Button>
                  </div>
                </div>
             </Card>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
