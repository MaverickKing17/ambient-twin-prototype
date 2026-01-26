
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
        x: (e.clientX / window.innerWidth) * 15 - 7.5,
        y: (e.clientY / window.innerHeight) * 15 - 7.5,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setErrorMsg(null);

    if (!supabase) {
      // Fallback for environment where Supabase isn't configured correctly
      console.warn("Supabase not connected. Using demo login.");
      setTimeout(() => {
        setIsLoading(false);
        onLogin();
      }, 1000);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        onLogin();
      }
    } catch (e: any) {
      setErrorMsg("An unexpected connection error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@ambient-twin.ai');
    setPassword('efficiency_2026');
    setErrorMsg("Note: Ensure user exists in Supabase or use credentials provided by admin.");
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-[#0B1121]">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div 
        className="w-full max-w-md p-4 transition-transform duration-300 ease-out"
        style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
      >
        <GlassCard className="p-0 border-t border-t-white/10 shadow-2xl overflow-visible">
          <div className="relative p-10 pb-6 text-center border-b border-white/5">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-900/40 mb-6">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Ambient Twin</h1>
            <p className="text-[10px] text-blue-400 font-black tracking-[0.4em] uppercase mt-1">Enterprise Command</p>
          </div>

          <div className="p-10 pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold text-center">
                  {errorMsg}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Authorized Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contractor@enterprise.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Access Token / Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : "Establish Connection"}
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
               <button onClick={handleDemoLogin} className="text-[10px] text-slate-500 hover:text-white font-bold uppercase tracking-widest transition-colors">
                 Request Sandbox Access &rarr;
               </button>
            </div>
          </div>
        </GlassCard>

        <div className="mt-8 text-center">
           <p className="text-[10px] text-white/20 font-mono uppercase tracking-tighter">
             Secure Node: {supabase ? "SUPABASE_CONNECTED" : "DB_OFFLINE_DEMO_MODE"}
           </p>
        </div>
      </div>
    </div>
  );
};
