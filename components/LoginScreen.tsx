
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { GlassCard } from './GlassCard';

interface Props {
  onLogin: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Connection Status State
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error' | 'demo'>('checking');
  const [detailedError, setDetailedError] = useState<string>('');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
        setDbStatus('demo');
        return;
      }

      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { error } = await supabase
          .from('leads')
          .select('count', { count: 'exact', head: true });

        if (error) {
          setDetailedError(error.message);
          setDbStatus('error');
        } else {
          setDbStatus('connected');
        }
      } catch (e: any) {
        setDetailedError(e.message || "Unreachable");
        setDbStatus('error');
      }
    };

    const timer = setTimeout(checkConnection, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLoginSequence();
  };

  const handleDemoLogin = () => {
    setEmail('demo@ambient-twin.ai');
    setPassword('efficiency_2026');
    handleLoginSequence();
  };

  const handleLoginSequence = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1200);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[90vh] w-full overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 -z-20 bg-[#0B1121]">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div 
        className="w-full max-w-md transition-transform duration-200 ease-out"
        style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
      >
        <GlassCard className="p-0 border-t border-t-orange-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="relative p-8 pb-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-16 h-16 mb-6 group">
                <div className="absolute inset-0 bg-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Ambient Twin</h1>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold">Enterprise Command Center</p>
            </div>
          </div>

          <div className="p-8 pt-6 bg-black/20 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5 group">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Partner ID / Email</label>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email..."
                  className="w-full bg-slate-900/50 border border-white/10 rounded-sm px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="space-y-1.5 group">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Security Key</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-sm px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 rounded-sm transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-3 mt-6"
              >
                {isLoading ? <span className="text-sm">Authenticating...</span> : <span className="text-sm">Initiate Session</span>}
              </button>
            </form>
            
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col items-center gap-2">
               <button onClick={handleDemoLogin} className="text-xs text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-4 decoration-orange-500/30">
                 Auto-Fill Demo Credentials &rarr;
               </button>
            </div>
          </div>
        </GlassCard>

        {/* --- Fix: Updated Developer Resources Section --- */}
        <div className="mt-8 grid grid-cols-1 gap-4">
           <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-md animate-fade-in">
              <div className="flex items-start gap-3">
                 <div className="text-orange-400 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                 </div>
                 <div>
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Resideo Sandbox Tip</h4>
                    <p className="text-[10px] text-white/60 leading-normal">
                      To bypass the Resideo login screen, use any email/password. Seam Sandbox usually accepts <span className="text-orange-400 font-mono">sandbox-user@getseam.com</span>.
                    </p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 opacity-80 hover:opacity-100 transition-opacity">
              <a 
                href="https://docs.getseam.com/device-providers/honeywell-resideo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/5 border border-white/10 p-3 rounded-md hover:bg-white/10 transition-all group"
              >
                  <div className="text-[9px] font-bold text-orange-400 uppercase tracking-widest mb-1">Honeywell Guide</div>
                  <div className="text-[10px] text-white/70 group-hover:text-white leading-tight">Provider Docs &rarr;</div>
              </a>
              <a 
                href="https://docs.getseam.com/getting-started/sandbox-devices" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/5 border border-white/10 p-3 rounded-md hover:bg-white/10 transition-all group"
              >
                  <div className="text-[9px] font-bold text-orange-400 uppercase tracking-widest mb-1">Sandbox Info</div>
                  <div className="text-[10px] text-white/70 group-hover:text-white leading-tight">Virtual Device setup &rarr;</div>
              </a>
           </div>
        </div>
      </div>
    </div>
  );
};
