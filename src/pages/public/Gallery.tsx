import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Maximize2, X } from "lucide-react";

const categories = ["All", "Campus", "Events", "Classroom", "Sports", "Activities"];

const images = [
  { src: "/assets/campus_exterior.png", cat: "Campus", alt: "Modern Campus Architecture" },
  { src: "/assets/classroom_lecture.png", cat: "Classroom", alt: "Collaborative Learning Space" },
  { src: "/assets/66.png", cat: "Events", alt: "Annual Merit Ceremony" },
  { src: "/assets/55.png", cat: "Sports", alt: "Athletic Excellence" },
  { src: "/assets/student_vr.png", cat: "Classroom", alt: "Digital Innovation Lab" },
  { src: "/assets/robotics_students.png", cat: "Activities", alt: "Creative Arts Studio" },
  { src: "/assets/44.png", cat: "Campus", alt: "Institutional Library" },
  { src: "/assets/ai-learning.png", cat: "Activities", alt: "Scientific Exploration" },
  { src: "/assets/898.png", cat: "Events", alt: "Cultural Festival" },
  { src: "/assets/classroom_lecture_v2.png", cat: "Classroom", alt: "Interactive Seminar" },
  { src: "/assets/campus_exterior_v2.png", cat: "Campus", alt: "Main Academic Block" },
];

export function Gallery() {
  const [active, setActive] = useState("All");
  const [selectedImage, setSelectedImage] = useState<typeof images[0] | null>(null);
  const filtered = active === "All" ? images : images.filter((i) => i.cat === active);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <PublicLayout>
      {/* ─── Hero Overview ─── */}
      <section ref={heroRef} className="relative pt-48 pb-32 bg-slate-950 overflow-hidden min-h-[60vh] flex items-center justify-center">
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="absolute inset-0">
           <img src="/assets/campus_exterior_v2.png" className="w-full h-full object-cover grayscale-[0.2] brightness-50" alt="Background" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </motion.div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div style={{ y: yParallax }} className="relative">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-3 mb-10 px-6 py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-3xl text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">
               Visual Archive
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
              className="text-5xl sm:text-7xl lg:text-9xl font-black text-white tracking-tighter mb-10 leading-[0.85] shadow-2xl">
              Campus <span className="text-emerald-500 italic">Chronicles.</span>
            </motion.h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed opacity-90 italic">
              A window into the vibrant life and technological spirit of Blended Learning School.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 flex flex-wrap justify-center gap-4">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={cn(
                  "rounded-full px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
                  active === c 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                    : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
            {filtered.map((img, i) => (
              <motion.div
                key={img.src + active}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 cursor-pointer shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2",
                  (i === 0 || i === 7) && "md:row-span-2",
                  (i === 2 || i === 5) && "md:col-span-2"
                )}
                onClick={() => setSelectedImage(img)}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-10">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em] mb-3">{img.cat}</p>
                    <p className="text-white font-black text-2xl tracking-tighter italic leading-none">{img.alt}</p>
                  </div>
                </div>
                <div className="absolute top-8 right-8 h-14 w-14 rounded-2x border border-white/20 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 shadow-2xl">
                   <Maximize2 className="h-6 w-6" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Lightbox ─── */}
      {selectedImage && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 md:p-20"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-10 right-10 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
            <X className="h-8 w-8" />
          </button>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-5xl w-full aspect-video rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <img src={selectedImage.src} className="w-full h-full object-cover" alt={selectedImage.alt} />
            <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent">
               <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.4em] mb-3">{selectedImage.cat}</p>
               <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-none">{selectedImage.alt}</h2>
            </div>
          </motion.div>
        </motion.div>
      )}
    </PublicLayout>
  );
}
