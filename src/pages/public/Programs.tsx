import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { BookOpen, Monitor, Palette, Dumbbell, Rocket, Cpu, BrainCircuit, CheckCircle2, ArrowRight, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const grades = [
  { 
    key: "primary", 
    label: "Primary Phase", 
    level: "PG to Class 2",
    icon: BrainCircuit,
    color: "from-emerald-600 to-teal-500",
    subjects: ["English Language", "Mathematics", "Science", "Urdu", "QURAN Study", "Computer Studies", "Creative Arts"] 
  },
  { 
    key: "middle", 
    label: "Middle Phase", 
    level: "Class 3 to 8",
    icon: Cpu,
    color: "from-blue-600 to-indigo-500",
    subjects: ["Advanced Science", "Social Studies", "Robotics & AI", "Algebraic Math", "English Pro", "Digital Literacy", "Islamic Studies"] 
  },
];

const extras = [
  { icon: Monitor, title: "Robotics & Coding", desc: "Hands-on STEM projects with Arduino, Python, and web development.", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800" },
  { icon: Palette, title: "Arts & Media", desc: "Visual arts, drama, graphic design, and video production.", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800" },
  { icon: Dumbbell, title: "Sports Academy", desc: "Cricket, football, and athletics with professional logic coaching.", image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800" },
  { icon: BookOpen, title: "Leadership Skills", desc: "Debates, creative writing workshops, and public speaking.", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800" },
];

export function Programs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <PublicLayout>
      <div ref={containerRef}>
        {/* ─── Hero Overview ─── */}
        <section className="relative pt-48 pb-32 bg-slate-950 overflow-hidden min-h-[70vh] flex items-center">
          <motion.div style={{ y: heroY, opacity: heroOpacity, willChange: 'transform, opacity' }} className="absolute inset-0 opacity-25">
             <img src="/assets/classroom_lecture_v2.png" className="w-full h-full object-cover blur-sm brightness-50" alt="Curriculum" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </motion.div>
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse-slow" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-3 mb-8 px-5 py-2 rounded-full border border-emerald-500/50 bg-slate-900/50 backdrop-blur-3xl text-emerald-300 text-xs font-bold uppercase tracking-widest shadow-lg">
             Academic Architecture
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight mb-8 leading-tight shadow-xl drop-shadow-lg">
            Programs & <br /><span className="text-emerald-500 italic drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">Curriculum.</span>
          </motion.h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto font-medium leading-relaxed opacity-100 drop-shadow-md bg-slate-950/20 p-2 rounded-xl backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none sm:p-0">
            Architecting the cognitive future through a 60/40 blended methodology — 
            where interactive classroom wisdom meets digital mastery.
          </p>
        </div>
      </section>

      {/* ─── Strategic Sectors (Tabs) ─── */}
      <section className="py-20 md:py-32 bg-white dark:bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-emerald-500/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-24">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-8 italic">Strategic <br /> <span className="text-emerald-600">Phases.</span></h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic border-l-4 border-emerald-500 pl-6 mb-10">
                Our curriculum is meticulously segmented into specialized phases, ensuring students achieve foundational mastery before technical specialization.
              </p>
               <div className="flex gap-4">
                 <Button asChild size="lg" className="rounded-2xl bg-slate-900 text-white hover:bg-emerald-600 transition-all font-bold uppercase tracking-widest text-xs h-14 px-8 shadow-md">
                   <Link to="/admissions">Join Phase 2026</Link>
                 </Button>
               </div>
            </motion.div>
            
            <div className="relative">
              <Tabs defaultValue="primary" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 p-2 shadow-sm border border-slate-200 dark:border-slate-800">
                  {grades.map(g => (
                    <TabsTrigger key={g.key} value={g.key} className="rounded-xl font-bold text-xs uppercase tracking-widest data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all h-full">
                      {g.label.split(' ')[0]} Phase
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {grades.map(g => (
                  <TabsContent key={g.key} value={g.key} className="mt-8 outline-none">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                      <Card className="rounded-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 md:p-12 shadow-md hover:shadow-xl transition-all relative overflow-hidden group">
                        <div className={cn("absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br blur-[60px] rounded-full opacity-20", g.color)} />
                        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 mb-8">
                           <div className={cn("h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center text-white shadow-md transform -rotate-3", g.color)}>
                             <g.icon className="h-8 w-8" />
                           </div>
                           <div>
                             <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white italic tracking-tight">{g.label}</h3>
                             <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mt-1">{g.level}</p>
                           </div>
                        </div>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                          {g.subjects.map(s => (
                            <div key={s} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {s}
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>

          {/* ─── Extra-Curricular Hub ─── */}
          <div className="pt-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 px-0 md:px-6">
              <div>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight italic mb-2 uppercase">Core <br /> <span className="text-emerald-600">Extracurriculars.</span></h2>
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Multidimensional Development Protocol</p>
              </div>
              <p className="text-slate-600 dark:text-slate-400 max-w-sm text-left md:text-right font-medium italic">
                Beyond the curriculum lies the realm of pure creativity and physical mastery.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {extras.map((e, i) => (
                <motion.div key={e.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className="h-full rounded-3xl md:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:shadow-xl transition-all group overflow-hidden">
                    <div className="h-48 overflow-hidden relative">
                       <img src={e.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={e.title} />
                       <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors" />
                       <div className="absolute top-4 right-4 h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                          <e.icon className="h-5 w-5" />
                       </div>
                    </div>
                    <CardContent className="p-6 md:p-8">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight italic">{e.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{e.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Premium Call to Action ─── */}
      <section className="py-24 md:py-32 relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <img src="https://images.unsplash.com/photo-1523050335392-46301c09b18f?w=1600" className="w-full h-full object-cover grayscale" alt="Background" />
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-8 tracking-tight uppercase drop-shadow-md">
              Architect your <br />
              <span className="text-emerald-500 italic">Legacy.</span>
            </h2>
            <p className="text-base md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium italic">
              Enrollment for the 2026 Academic sessions is currently in strategic intake phase.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
               <Button asChild size="xl" className="h-16 px-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-lg transition-all hover:scale-105 active:scale-95 group w-full sm:w-auto">
                 <Link to="/admissions" className="flex items-center justify-center">Apply to BLS Hub <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" /></Link>
               </Button>
               <Button asChild variant="outline" size="xl" className="h-16 px-10 rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-lg backdrop-blur-md transition-all shadow-md w-full sm:w-auto">
                 <Link to="/gallery" className="flex items-center justify-center"><PlayCircle className="mr-3 h-5 w-5 text-emerald-500" /> Virtual Campus Tour</Link>
               </Button>
            </div>
          </motion.div>
        </div>
        </section>
      </div>
    </PublicLayout>
  );
}

export default Programs;
