import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { Button } from '../../components/ui/button';
import { ShieldCheck, AlertCircle, ArrowRight, Lock, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function Login() {
  const [schoolId, setSchoolId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState<number | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Security: Input Sanitization
    const sanitizedId = schoolId.trim().toUpperCase();
    const sanitizedPassword = password.trim();

    if (cooldown && Date.now() < cooldown) {
      const remaining = Math.ceil((cooldown - Date.now()) / 1000);
      setError(`Too many attempts. Please wait ${remaining}s.`);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await login(sanitizedId, sanitizedPassword);
      const storedUser = localStorage.getItem('bls_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (from && from !== '/') {
          navigate(from, { replace: true });
        } else {
          navigate(`/${user.role}/dashboard`, { replace: true });
        }
      }
    } catch (err: unknown) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      const errorMessage = err instanceof Error ? err.message : 'Invalid School ID or Password';

      if (newAttempts >= 5) {
        const cooldownTime = Date.now() + 30000; // 30s block
        setCooldown(cooldownTime);
        setAttempts(0);
        setError('Security cooldown active. Please wait 30 seconds.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6 py-12 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <img src="/assets/hero-cinematic.png" className="w-full h-full object-cover blur-sm brightness-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-emerald-950/40" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="bg-slate-900/40 backdrop-blur-2xl p-10 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <Link to="/" className="inline-block group mb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 border border-white/20 p-2 shadow-lg group-hover:scale-110 transition-transform">
                <img src="/assets/logo.png" className="w-full h-full object-contain" alt="BLS Logo" />
              </div>
            </Link>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">LMS Portal</h2>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Isakhel Blended Learning System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">School ID</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value.toUpperCase())}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 text-white font-medium placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all outline-none"
                    placeholder="e.g. STU001"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 text-white font-medium placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm font-semibold"
              >
                <AlertCircle className="h-5 w-5 shrink-0" /> {error}
              </motion.div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}