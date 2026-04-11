import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { BrainCircuit, Cpu, Rocket, Globe2, BookOpen, Monitor, PlayCircle, Lightbulb, Award, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicLayout } from '../../components/layout/PublicLayout';
import { cn } from '../../lib/utils';

const courses = [
  {
    key: "robotics",
    label: "Robotics & AI",
    icon: Cpu,
    gradient: "from-emerald-600 to-teal-500",
    subjects: ["Arduino Programming", "Drone Mechanics", "Intro to Robotics", "Python for Robotics", "Basic Coding & Programming"],
    image: "/assets/robotics_icon.png"
  },
  {
    key: "digital",
    label: "Digital Design",
    icon: Monitor,
    gradient: "from-blue-600 to-indigo-500",
    subjects: ["UI/UX Designing", "3D Modeling", "Creative Media", "Frontend Development", "Motion Graphics"],
    image: "/assets/digital_design_icon.png"
  },
  {
    key: "core",
    label: "Core Sciences",
    icon: BrainCircuit,
    gradient: "from-amber-500 to-orange-600",
    subjects: ["Physics", "Math", "Biology", "Science", "English"],
    image: "/assets/core_sciences_icon.png"
  },
];

export function Academics() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <PublicLayout>
      <div ref={containerRef}>
        {/* ─── Hero Section ─── */}
        <section className="relative pt-48 pb-32 bg-slate-950 overflow-hidden min-h-[60vh] flex items-center">
          <motion.div style={{ y: heroY, opacity: heroOpacity, willChange: 'transform, opacity' }} className="absolute inset-0 opacity-30">
            <img src="/assets/home_lab_hero_v2.png" className="w-full h-full object-cover blur-[2px] brightness-50" alt="Academics" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </motion.div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-3 mb-8 px-5 py-2 rounded-full border border-emerald-500/50 bg-slate-900/50 backdrop-blur-3xl text-emerald-300 text-xs font-bold uppercase tracking-widest shadow-lg">
              <Rocket className="h-4 w-4" /> Academic Excellence Protocol
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight mb-8 shadow-xl relative drop-shadow-lg">
              Strategic <span className="text-emerald-500 italic drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] inline-block">Learning.</span>
            </motion.h1>
            <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed opacity-100 drop-shadow-md bg-slate-950/20 p-2 rounded-xl backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none sm:p-0">
              Our unique blended methodology merges classical academic rigour with advanced technological studies.
            </p>
          </div>
        </section>

        {/* ─── Methodology ─── */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tight leading-tight">Blended <br /><span className="text-emerald-600 italic">Methodology.</span></h2>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 font-medium leading-relaxed italic border-l-4 border-emerald-500 pl-6">
                  At BLS Isakhel, we don't just teach from books. Students experience a high-tech ecosystem where digital labs meet hands-on physical engineering.
                </p>
                <div className="space-y-8">
                  {[
                    { title: "Project-Based Learning", desc: "Hands-on projects with modern hardware and academic research in our specialized labs.", icon: Lightbulb },
                    { title: "Adaptive Curriculum", desc: "Digital learning units that evolve according to the student's unique academic progress.", icon: Globe2 },
                  ].map((m, i) => (
                    <div key={i} className="flex gap-4 sm:gap-6 p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative">
                      <div className="h-14 w-14 shrink-0 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                        <m.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight italic">{m.title}</h4>
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{m.desc}</p>
                      </div>
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <m.icon className="h-24 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1 }}
                className="relative group">
                <div className="absolute -inset-10 bg-emerald-500/10 blur-[120px] rounded-full" />
                <motion.img
                  style={{ y: useTransform(scrollYProgress, [0.1, 0.7], [50, -50]), willChange: 'transform' }}
                  src="/assets/student_vr.png"
                  alt="Methodology Visual"
                  className="w-full h-auto aspect-square object-cover relative z-10 rounded-[4rem] shadow-2xl border-[15px] border-white dark:border-slate-900 transition-all duration-1000"
                />
                <motion.div
                  style={{ y: useTransform(scrollYProgress, [0.1, 0.7], [-50, 50]), willChange: 'transform' }}
                  className="absolute -top-10 -left-10 p-8 rounded-3xl bg-slate-950 text-white shadow-2xl z-20 hidden md:block border border-white/10 group-hover:scale-105 transition-transform duration-700">
                  <p className="text-3xl font-black text-emerald-500">85%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Retention Rate</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Departments ─── */}
        <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-16 tracking-tight italic">Academic Hubs</motion.h2>

            <Tabs defaultValue="robotics" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-16 md:h-20 rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 shadow-sm">
                {courses.map(c => (
                  <TabsTrigger key={c.key} value={c.key} className="rounded-xl md:rounded-2xl font-bold text-[10px] sm:text-xs md:text-sm uppercase tracking-widest data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300">
                    {c.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {courses.map(c => (
                <TabsContent key={c.key} value={c.key} className="mt-16 outline-none">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <Card className="rounded-3xl md:rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 p-8 md:p-16 relative overflow-hidden">
                      <div className={cn("absolute top-0 right-0 w-80 h-80 bg-gradient-to-br blur-[120px] rounded-full opacity-10", c.gradient)} />
                      <CardContent className="p-0 text-left grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
                        <div>
                          <div className={cn("h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-8 shadow-md transform rotate-3", c.gradient)}>
                            <c.icon className="h-8 w-8" />
                          </div>
                          <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 italic tracking-tight leading-tight">{c.label} <br /> Sector.</h3>
                          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium mb-10 italic leading-relaxed border-l-4 border-emerald-500 pl-4">
                            Our focus is on the structural integration of {c.label.toLowerCase()} into the students' cognitive framework for world-building.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {c.subjects.map(s => (
                              <div key={s} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {s}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="hidden lg:block relative group">
                          <div className="absolute inset-0 bg-emerald-600/10 blur-[100px] rounded-full group-hover:bg-emerald-600/20 transition-all duration-1000" />
                          <div className="relative aspect-square w-[70%] mx-auto rounded-[3.5rem] bg-slate-950 flex items-center justify-center border border-white/10 shadow-inner group overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
                            <div className="relative w-1/2 h-1/2 bg-white rounded-3xl p-3 shadow-2xl group-hover:scale-110 transition-transform duration-1000 flex items-center justify-center">
                              <img src={c.image} className="w-full h-full object-contain" alt={`${c.label} Icon`} />
                            </div>
                            <div className="absolute inset-4 border border-white/5 rounded-2xl" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>
        {/* ─── Academic Thresholds (Grades) ─── */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tight leading-tight italic">Academic <br /> <span className="text-emerald-600">Thresholds.</span></h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-10 italic border-l-4 border-emerald-500 pl-6">
                  We provide a structured progression through two primary educational phases, ensuring foundational strength before advanced technical specialization.
                </p>
              </motion.div>

              <div className="grid gap-8">
                {[
                  { label: "Primary Phase", grades: "PG to Class 2", subjects: ["English", "Mathematics", "Science", "Urdu", "QURAN", "Computer Studies"] },
                  { label: "Middle Phase", grades: "Class 3 to 8", subjects: ["Advanced Science", "Social Studies", "Robotics & AI", "Algebraic Math", "English"] },
                ].map((p, i) => (
                  <motion.div key={p.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Card className="rounded-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden p-8 md:p-10 hover:shadow-lg transition-all">
                      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{p.label}</h3>
                          <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mt-1">{p.grades}</p>
                        </div>
                        <Badge className="w-fit bg-slate-900 text-white font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border-none hover:bg-emerald-600">Sector {i + 1}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {p.subjects.map(s => (
                          <div key={s} className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                            {s}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
