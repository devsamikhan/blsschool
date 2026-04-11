import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { PublicLayout } from '../../components/layout/PublicLayout';
import {
  Zap, Shield, TrendingUp, Star, CheckCircle2, MonitorPlay,
  Cpu, Rocket, BrainCircuit, Globe2, Lightbulb, PlayCircle,
  ArrowRight, Users, Award, GraduationCap, ChevronRight, Monitor,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';

const stats = [
  { label: 'Innovators Trained', value: 1200, icon: Users, color: 'from-emerald-500 via-emerald-400 to-teal-500' },
  { label: 'Robotic Labs', value: 12, icon: Cpu, color: 'from-blue-500 via-indigo-500 to-violet-600' },
  { label: 'Global Ranking', value: 5, icon: Globe2, color: 'from-amber-400 via-orange-500 to-rose-500' },
  { label: 'AI Projects', value: 450, icon: BrainCircuit, color: 'from-purple-500 via-pink-500 to-fuchsia-600' },
];

export function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  
  // Advanced Parallax Scales & Opacities
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <PublicLayout>
      {/* ─── Ultra-Realistic Hero ─── */}
      <section ref={heroRef} className="relative min-h-[100svh] lg:min-h-[110vh] flex items-center justify-center overflow-hidden pt-24 lg:pt-32">
        {/* Cinematic Backdrop */}
        <motion.div style={{ scale: heroScale, opacity: heroOpacity, willChange: "transform, opacity" }} className="absolute inset-0">
          <img src="/assets/home_lab_hero_v2.png" alt="Futuristic Lab" className="w-full h-full object-cover brightness-[0.45] grayscale-[0.2]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950/20" />
        </motion.div>

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-teal-500/10 blur-[150px] rounded-full" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center py-16 lg:py-24">
          <motion.div style={{ y: yParallax, opacity: heroOpacity, willChange: "transform, opacity" }}
            className="text-center lg:text-left space-y-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="inline-flex items-center gap-3 mb-8 px-5 py-2.5 rounded-full border border-emerald-500/50 bg-slate-900/50 backdrop-blur-2xl text-emerald-300 text-xs font-bold uppercase tracking-widest shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Academic Session 2026 Open
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-black text-white leading-[1.1] tracking-tighter mb-8 sm:mb-10 relative drop-shadow-2xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">Institutional</span> <br />
              <span className="text-emerald-500 italic drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">Excellence.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} className="text-base md:text-lg lg:text-xl text-slate-200 max-w-lg mx-auto lg:mx-0 leading-relaxed mb-10 font-medium bg-slate-950/40 lg:bg-transparent p-4 lg:p-0 rounded-2xl backdrop-blur-md lg:backdrop-blur-none border border-white/5 lg:border-none">
              At Blended Learning School, our mission is to provide quality education by combining traditional teaching with modern technology. We aim to develop confident, skilled, and responsible students equipped with 21st-century skills such as critical thinking, creativity, and digital literacy.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 md:gap-6">
              <Button asChild size="xl" className="h-16 md:h-20 px-8 md:px-12 rounded-[1.5rem] md:rounded-3xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg md:text-xl shadow-[0_20px_50px_-10px_rgba(5,150,105,0.4)] group w-full sm:w-auto transition-all hover:scale-105 active:scale-95">
                <Link to="/admissions" className="flex items-center justify-center">Admission Hub <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform h-5 w-5 md:h-6 md:w-6" /></Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="h-16 md:h-20 px-8 md:px-12 rounded-[1.5rem] md:rounded-3xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-lg md:text-xl backdrop-blur-2xl w-full sm:w-auto transition-all hover:border-emerald-500/30 group">
                <Link to="/gallery" className="flex items-center justify-center"><PlayCircle className="mr-3 h-5 w-5 md:h-6 md:w-6 text-emerald-400 group-hover:scale-110 transition-transform" /> Experience BLS</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]), willChange: "transform" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            className="flex justify-center relative w-full pb-16 lg:pb-0">
            <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] md:blur-[150px] rounded-full animate-pulse-slow scale-150" />
            
            <div className="relative z-10 w-full group">
              {/* Main Mascot Visual */}
              <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, 50]), willChange: "transform" }} className="relative animate-float pt-10">
                <img 
                  src="/assets/robot-mascot.png" 
                  alt="BLS Robot Mascot" 
                  className="w-full sm:w-[85%] mx-auto h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform duration-700 relative z-10" 
                />
                
                {/* Floating Tech Orbs */}
                <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, -80]), willChange: "transform" }} className="absolute -top-10 -left-2 md:-left-6 p-6 md:p-8 rounded-3xl md:rounded-2xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-bounce-slow hidden md:block">
                  <Monitor className="h-8 w-8 text-emerald-400 opacity-90" />
                </motion.div>
                <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, 60]), willChange: "transform" }} className="absolute top-1/2 -right-4 md:-right-12 p-6 rounded-2xl bg-emerald-950/40 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_20px_40px_rgba(16,185,129,0.2)] animate-pulse hidden md:block group-hover:border-emerald-500/50 transition-colors">
                  <ShieldCheck className="h-8 w-8 text-emerald-500 opacity-90" />
                </motion.div>
              </motion.div>

              {/* Status Indicator Overlay */}
              <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, -40]), willChange: "transform" }} className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[92%] sm:w-[80%] lg:w-[88%] p-4 md:p-5 rounded-2xl md:rounded-3xl bg-slate-950/90 backdrop-blur-3xl border border-white/10 shadow-2xl flex items-center justify-between group-hover:border-emerald-500/30 transition-all duration-700 hover:scale-[1.02] cursor-default z-20">
                <div className="pr-2 md:pr-4">
                   <p className="text-emerald-500 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                     <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                     Academic Status
                   </p>
                   <p className="text-white font-black text-xl md:text-3xl tracking-tighter italic leading-none">ADMISSIONS OPEN</p>
                </div>
                <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/5 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-500">
                   <Zap className="h-8 w-8 md:h-10 md:w-10 group-hover:animate-pulse" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── The Strategic Stats Overlay ─── */}
      <section className="relative z-20 mt-8 md:-mt-16 pb-12 md:pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white dark:bg-slate-900 rounded-3xl md:rounded-[4rem] shadow-xl border border-slate-200 dark:border-slate-800 p-8 md:p-16 grid grid-cols-2 lg:grid-cols-4 gap-8 items-start lg:items-center">
            {stats.map((s, i) => (
              <div key={s.label} className="flex flex-col items-center text-center group">
                <div className={cn("p-4 md:p-5 rounded-2xl md:rounded-3xl bg-gradient-to-br mb-4 shadow-md text-white transform group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3", s.color)}>
                  <s.icon className="h-7 w-7 md:h-8 md:w-8" />
                </div>
                <div className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2 italic">
                  {s.value}+
                </div>
                <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest leading-snug">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Immersive Experience Section ─── */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
              className="relative order-2 lg:order-1">
              <motion.img 
                style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]), willChange: "transform" }}
                src="/assets/robotics_students.png" 
                className="w-full sm:w-[95%] mx-auto h-auto rounded-3xl md:rounded-[4rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] hover:scale-[1.02] transition-transform duration-700 cursor-pointer object-cover aspect-square" 
                alt="Students Building Robotics" 
              />
               <motion.div 
                 style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]), willChange: "transform" }}
                 className="absolute top-10 left-4 lg:-left-4 xl:-left-10 p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-2xl border border-slate-200 dark:border-slate-700 hidden md:block hover:scale-110 transition-transform cursor-pointer">
                  <Monitor className="h-10 w-10 text-emerald-500 mb-3" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Smart Classes</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1 italic tracking-tight">Interactive Learning</p>
               </motion.div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
              className="order-1 lg:order-2">
              <div className="h-1.5 w-24 bg-emerald-500 mb-8 rounded-full shadow-md" />
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-8">
                Modern <br />
                <span className="text-emerald-600 italic">Education.</span>
              </h2>
              <div className="space-y-8 md:space-y-10">
                {[
                  { title: "Modern Computer & AI Lab", desc: "Students learn computers, coding, and basic artificial intelligence through hands-on activities in environment.", icon: Rocket },
                  { title: "Student-Centered Learning", desc: "We focus on each student’s learning pace using simple teaching methods for better understanding.", icon: Lightbulb },
                  { title: "Blended Learning System", desc: "We combine classroom teaching with online classes and recorded lectures to ensure continuous learning.", icon: Award },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="h-12 w-12 md:h-16 md:w-16 shrink-0 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <item.icon className="h-6 w-6 md:h-8 md:w-8" />
                    </div>
                    <div>
                      <h4 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{item.title}</h4>
                      <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Premium Enrollment CTA ─── */}
      <section className="py-24 md:py-32 relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
           <img src="/assets/campus_exterior_v2.png" className="w-full h-full object-cover grayscale brightness-50" alt="Background Texture" />
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-8 tracking-tight uppercase drop-shadow-md">
              Shape Your <br />
              <span className="text-emerald-500 italic">Future.</span>
            </h2>
            <p className="text-base md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Don't just witness the future — engineer it. Admissions for the 2026 academic threshold are closing rapidly across all sectors.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
               <Button asChild size="xl" className="h-16 px-10 md:px-12 rounded-full bg-white text-slate-950 hover:bg-emerald-50 font-bold text-lg shadow-lg transition-all hover:scale-105 active:scale-95 w-full sm:w-auto">
                 <Link to="/admissions" className="flex items-center justify-center">Apply Now <ArrowRight className="ml-3 h-5 w-5" /></Link>
               </Button>
               <div className="flex flex-col justify-center items-center sm:items-start text-center sm:text-left mt-4 sm:mt-0">
                  <p className="text-xl font-bold text-emerald-400 tracking-tight leading-none italic mb-1">Limited Seats</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Apply Today</p>
               </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}