import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Target, Eye, ShieldCheck, Users, Award, BookOpen, GraduationCap, Globe2 } from 'lucide-react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { cn } from '../../lib/utils';


export function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <PublicLayout>
      <div ref={containerRef}>
        {/* ─── Hero Phase ─── */}
        <section className="relative pt-48 pb-32 bg-slate-950 overflow-hidden min-h-[70vh] flex items-center">
          <motion.div style={{ y: heroY, opacity: heroOpacity, willChange: 'transform, opacity' }} className="absolute inset-0 opacity-30">
            <img src="/assets/campus_exterior_v2.png" className="w-full h-full object-cover blur-[2px] brightness-50" alt="Campus Exterior" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </motion.div>

          {/* Ambient Decorative Assets */}
          <div className="absolute top-20 right-[15%] w-64 h-64 bg-emerald-500/10 blur-[100px] animate-pulse-slow" />
          <div className="absolute bottom-20 left-[10%] w-[40vw] h-[40vw] bg-blue-500/5 blur-[120px] animate-blob" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-3 mb-10 px-6 py-3 rounded-full border border-emerald-500/50 bg-slate-900/50 backdrop-blur-3xl text-emerald-300 text-xs font-bold uppercase tracking-widest shadow-lg">
              <Globe2 className="h-4 w-4" /> Global Academic Excellence
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight mb-8 leading-[1.1] drop-shadow-xl">
              Architects of <br /><span className="text-emerald-500 italic drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">Tomorrow.</span>
            </motion.h1>
            <p className="text-xl md:text-2xl text-slate-200 max-w-4xl mx-auto font-medium leading-relaxed opacity-100 drop-shadow-md bg-slate-950/20 p-4 rounded-2xl backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none lg:p-0">
              Since its inception, BLS Isakhel has been the cornerstone of educational transformation, bridging local heritage with global academic leadership.
            </p>
          </div>
          {/* ─── The Narrative ─── */}
        </section>

        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-[50vw] h-[50vw] bg-emerald-600/5 blur-[120px] rounded-full -translate-x-1/2" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1 }}
                className="relative lg:pr-10 order-2 lg:order-1 group">
                <div className="absolute -inset-10 bg-emerald-500/5 blur-[120px] rounded-full" />
                <motion.img
                  style={{ y: useTransform(scrollYProgress, [0.2, 0.8], [50, -50]), willChange: 'transform' }}
                  src="https://scontent.flhe2-3.fna.fbcdn.net/v/t39.30808-6/655103361_122161227980717256_5246381721028486332_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeE4xX9GxW-0CL8AKnE3zjzj8bt4zXJDlwHxu3jNckOXAcFMrI2FSKhNA5w7N0XFkV4EqKNV8wjE8CNOAZMIfnQ1&_nc_ohc=El_pQpUiILsQ7kNvwExS0aV&_nc_oc=Adr4xNrUWEMz_ExQMgYgDqGeonhzhLzp4vYZ0ny1aV_drvv72jBMp-q81Z8UatB6Opk&_nc_zt=23&_nc_ht=scontent.flhe2-3.fna&_nc_gid=wJwBQJyHryFm2z_nTSTrMw&_nc_ss=7a32e&oh=00_AfwiOoo-hmHeLUcfmxvYlDhCkZaeoBt6GTKyjBplStpWSg&oe=69CE6FED"
                  className="w-full h-auto aspect-square object-cover relative z-10 rounded-3xl md:rounded-[4rem] shadow-xl border-8 md:border-[12px] border-white dark:border-slate-800 transition-transform duration-700 group-hover:scale-[1.02]"
                  alt="Classroom Education"
                />
                <motion.div
                  style={{ y: useTransform(scrollYProgress, [0.2, 0.8], [-50, 50]), willChange: 'transform' }}
                  className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 p-6 md:p-10 rounded-2xl md:rounded-2xl bg-emerald-600 text-white shadow-lg md:shadow-[0_40px_80px_-15px_rgba(16,185,129,0.5)] z-20 hidden sm:block">
                  <p className="text-3xl md:text-5xl font-black tracking-tight mb-1 leading-none italic">EST.</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">2024 & BEYOND</p>
                </motion.div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
                className="order-1 lg:order-2">
                <div className="h-1.5 w-24 bg-emerald-500 mb-8 rounded-full shadow-md" />
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tight leading-tight">A Legacy of <br /> <span className="text-emerald-600 italic">Future Leaders.</span></h2>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-10 italic border-l-4 border-emerald-500 pl-6">
                  Isakhel is a cradle of enormous potential. At BLS, we treat education as a strategic journey to empower every student with technical prowess and ethical leadership.
                </p>
                <div className="grid gap-8">
                  {[
                    { label: "Academic Integrity", desc: "Upholding the highest standards of research and academic honesty." },
                    { label: "Technological Core", desc: "Integrating advanced STEM modules into the foundational curriculum." },
                    { label: "Community Impact", desc: "Graduates serving as catalysts for positive change in their regions." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-6 group">
                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner mt-1">
                        <Award className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white uppercase text-sm or tracking-widest mb-1">{item.label}</p>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Values Grid ─── */}
        <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse-slow" />
          <div className="max-w-7xl mx-auto px-6">
            <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white text-center mb-16 md:mb-20 tracking-tight italic">Core Values.</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {[
                { title: "Our Mission", desc: "To empower students with technical mastery and values-driven leadership.", icon: Target, gradient: "from-emerald-600 to-emerald-400" },
                { title: "Our Vision", desc: "To set the global standard for modern, research-based education.", icon: Eye, gradient: "from-blue-600 to-indigo-500" },
                { title: "Our Values", desc: "Innovation. Discipline. Integrity — we build the pioneers of a better world.", icon: ShieldCheck, gradient: "from-purple-600 to-fuchsia-500" },
              ].map((v, i) => (
                <motion.div key={v.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="p-10 text-center sm:text-left sm:p-12 md:p-14 rounded-3xl md:rounded-[4rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden">
                  <div className={cn("h-16 w-16 mx-auto sm:mx-0 bg-gradient-to-br rounded-2xl flex items-center justify-center text-white mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-md", v.gradient)}>
                    <v.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 italic tracking-tight">{v.title}</h3>
                  <p className="text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{v.desc}</p>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 dark:bg-slate-800/30 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-700" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Leadership Quote ─── */}
        <section className="py-24 relative overflow-hidden bg-emerald-600 text-white">
          <motion.div style={{ rotate: useTransform(scrollYProgress, [0.5, 1], [0, 45]), scale: useTransform(scrollYProgress, [0.5, 1], [1, 1.2]), willChange: 'transform' }} className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Award className="h-[120vw] sm:h-[80vw] w-auto text-white" />
          </motion.div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}>
              <GraduationCap className="h-12 w-12 mx-auto mb-8 opacity-60" />
              <h2 className="text-2xl md:text-4xl font-bold leading-relaxed tracking-tight mb-8">
                "Education is not just about learning code; it's about learning how to solve the world's most complex problems with a human heart."
              </h2>
              <div className="h-1 w-16 bg-white/40 mx-auto mb-6 rounded-full" />
              <p className="text-base font-bold uppercase tracking-widest opacity-90">Principal, BLS Isakhel</p>
            </motion.div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}