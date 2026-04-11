import { Link } from 'react-router-dom';
import { Facebook, Youtube, Globe, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    quickLinks: [
      { label: 'Academics', to: '/academics' },
      { label: 'Admissions', to: '/admissions' },
      { label: 'Gallery', to: '/gallery' },
      { label: 'News & Updates', to: '/news' },
      { label: 'Heritage', to: '/about' },
      { label: 'Support', to: '/contact' },
    ],
    socialPresence: [
      {
        title: 'TikTok',
        href: 'https://www.tiktok.com/@blendedlearningschoolpk?_r=1&_t=ZS-94lcoHr1azM',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
          </svg>
        )
      },
      { title: 'Facebook', href: 'https://www.facebook.com/share/1DMqmQTQA3/', icon: <Facebook className="h-5 w-5" /> },
      { title: 'YouTube', href: 'https://www.youtube.com/@blendedlearningschoolpk?si=yNYthRQ4wMIKmfgY', icon: <Youtube className="h-5 w-5" /> },
    ]
  };

  return (
    <footer className="bg-slate-950 text-white py-24 border-t border-white/5 relative overflow-hidden">
      {/* Decorative Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10">
        {/* Brand Section */}
        <div className="lg:col-span-1 space-y-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center overflow-hidden p-2.5 shadow-2xl group hover:border-emerald-500/30 transition-colors">
              <img src="/assets/logo.png" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt="BLS Logo" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-3xl tracking-tight text-white leading-none">BLS Esakhel</span>
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] mt-3 drop-shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                21<span className="text-[0.7em] lowercase relative -top-[0.4em] ml-0.5">st</span>&nbsp;Century's Skills
              </span>
            </div>
          </div>
          <p className="text-slate-400 max-w-sm font-medium leading-relaxed text-sm opacity-80">
            Pioneering excellence through a synergy of traditional values and 21st-century technological mastery. Leveling the future, one student at a time.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-emerald-500/90 flex items-center gap-2">
            Navigation Hub
            <div className="h-[1px] w-8 bg-emerald-500/20" />
          </h4>
          <ul className="space-y-4 text-slate-400 font-semibold text-sm">
            {footerLinks.quickLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-emerald-400 transition-all flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-0 opacity-0 group-hover:opacity-100 group-hover:mr-2 transition-all duration-300" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-1">
          <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-emerald-500/90 flex items-center gap-2">
            Strategic Presence
            <div className="h-[1px] w-8 bg-emerald-500/20" />
          </h4>
          <div className="space-y-6">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60">HQ Location</p>
              <p className="text-slate-300 text-sm font-semibold leading-relaxed">
                Near Police Station Isakhel,<br />
                District Mianwali, Pakistan
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60">Digital Outreach</p>
              <p className="text-slate-200 text-base font-bold tracking-tight">+92 300 0136840</p>
            </div>
          </div>
        </div>

        {/* Social Presence */}
        <div className="lg:col-span-1">
          <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-emerald-500/90 flex items-center gap-2">
            Global Connect
            <div className="h-[1px] w-8 bg-emerald-500/20" />
          </h4>
          <div className="flex gap-4">
            {footerLinks.socialPresence.map((social) => (
              <a
                key={social.title}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all hover:-translate-y-1 shadow-lg group"
                title={social.title}
              >
                {social.icon}
              </a>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-3 text-slate-500 group cursor-default">
            <div className="p-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
              <Globe className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">International Gateway</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 mt-24 pt-12 max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span>© {currentYear} BLS Esakhel — All rights reserved.</span>
          <span className="text-emerald-500/40 text-[9px] font-semibold tracking-[0.3em] uppercase leading-none">
            ENGINEERED BY <span className="text-emerald-500/60">SAMI ULLAH KHAN</span>
          </span>
        </div>
        <div className="flex gap-8 items-center bg-white/5 px-8 py-3 rounded-full border border-white/5 backdrop-blur-sm">
          <span className="hover:text-emerald-400 cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-emerald-400 cursor-pointer transition-colors">Terms</span>
          <div className="w-[1px] h-4 bg-white/10" />
          <Link to="/login" className="text-emerald-500 hover:text-emerald-400 cursor-pointer transition-colors">Admin Portal</Link>
        </div>
      </div>
    </footer>
  );
}
