
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { supabase } from '../services/supabaseService';

interface Props {
  onLogin: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 10 - 5,
        y: (e.clientY / window.innerHeight) * 10 - 5,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDATION FIX: Provide feedback if empty instead of doing nothing
    if (!email || !password) {
      setErrorMsg("Unauthorized: Credentials Required");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg(null);

    // If Supabase is not configured via env vars, we use the Demo Logic
    if (!supabase) {
      console.warn("Supabase Config Missing: Defaulting to Sandbox Session.");
      setTimeout(() => {
        setIsLoading(false);
        onLogin();
      }, 800);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
      } else {
        onLogin();
      }
    } catch (e: any) {
      setErrorMsg("Protocol Error: Connection Timed Out");
      setIsLoading(false);
    }
  };

  // IMPROVEMENT: One-click bypass for quick testing
  const handleQuickSandbox = () => {
    setIsLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      onLogin();
    }, 500);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-[#0B1121]">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-600/5 via-transparent to-orange-600/5" />
      </div>

      <div 
        className="w-full max-w-md p-4 transition-transform duration-700 ease-out"
        style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
      >
        <GlassCard className="p-0 border-t border-t-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] overflow-visible">
          <div className="relative p-10 pb-8 text-center border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.4)] mb-6 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Ambient Twin</h1>
            <p className="text-[10px] text-blue-400 font-black tracking-[0.4em] uppercase mt-1">Enterprise Command</p>
          </div>

          <div className="p-10 pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-4 rounded border border-red-500/20 bg-red-500/10 text-red-400 text-[11px] font-black uppercase tracking-wider text-center animate-shake">
                  {errorMsg}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Authorized Email</label>
                <input 
                  type="email" 
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contractor@enterprise.com"
                  className={`w-full bg-white/[0.03] border rounded px-4 py-4 text-sm text-white focus:outline-none transition-all font-medium ${errorMsg && !email ? 'border-red-500/50' : 'border-white/10 focus:border-blue-500/50'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Access Token / Password</label>
                <input 
                  type="password" 
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full bg-white/[0.03] border rounded px-4 py-4 text-sm text-white focus:outline-none transition-all ${errorMsg && !password ? 'border-red-500/50' : 'border-white/10 focus:border-blue-500/50'}`}
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded text-[11px] uppercase tracking-[0.25em] transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : "Establish Connection"}
              </button>
            </form>
            
            <div className="mt-10 pt-8 border-t border-white/5 text-center">
               <button 
                 onClick={handleQuickSandbox} 
                 className="text-[10px] text-slate-500 hover:text-blue-400 font-black uppercase tracking-[0.3em] transition-colors bg-transparent border-none p-2"
               >
                 Request Sandbox Access &rarr;
               </button>
            </div>
          </div>
        </GlassCard>

        <div className="mt-12 text-center">
           <p className="text-[9px] text-white/10 font-mono uppercase tracking-[0.2em]">
             Ambient Node ID: {supabase ? "PROD_CLOUD_LINKED" : "LOCAL_SANDBOX_STUB"}
           </p>
        </div>
      </div>
    </div>
  );
};
