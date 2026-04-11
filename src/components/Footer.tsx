import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Youtube } from "lucide-react";
import logo from "@/assets/logo-bls.jpeg";

export function Footer() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="BLS Logo" className="h-10 w-10 rounded-lg object-contain" />
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tight leading-none text-white">BLS Esakhel</span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-500 uppercase mt-1">FUTURE PIONEERS HUB</span>
            </div>
          </div>
          <p className="text-sm font-black tracking-widest text-emerald-500 uppercase mb-6 drop-shadow-sm">
            21ST CENTURY'S SKILLS
          </p>
          <div className="flex gap-4">
            <a href="#" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all group" title="Facebook">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all group" title="YouTube">
              <Youtube className="h-4 w-4" />
            </a>
            <a href="#" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all group" title="TikTok">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-['Playfair_Display'] text-sm font-semibold text-secondary">Quick Links</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            {["About", "Programs", "Admissions", "Gallery"].map((l) =>
            <li key={l}>
                <Link to={`/${l.toLowerCase()}`} className="hover:text-secondary transition-colors">
                  {l}
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-['Playfair_Display'] text-sm font-semibold text-secondary">Portal</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/login" className="hover:text-secondary transition-colors">Login</Link></li>
            <li><Link to="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
            <li><Link to="/news" className="hover:text-secondary transition-colors">News & Events</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-['Playfair_Display'] text-sm font-semibold text-secondary">Contact</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" />+923426870929</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" />BLS.SCHOOL@GMAIL.COM</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />CITY ESAKHEL, MIANWALI</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 py-4">
        <p className="text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} BLS Esakhel. All rights reserved.
        </p>
      </div>
    </footer>);

}