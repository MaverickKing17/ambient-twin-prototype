
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';

interface Props {
  onLogin: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Subtle parallax effect on mouse move
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
    // Simulate API Auth Latency
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1200);
  };

  return (
    <div className="relative flex items-center justify-center min-h-[90vh] w-full overflow-hidden">
      
      {/* --- Technical Background Layer --- */}
      <div className="absolute inset-0 -z-20 bg-[#0B1121]">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        {/* Radar / Spotlight Effect */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
           <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
           <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
        </div>
      </div>

      <div 
        className="w-full max-w-md transition-transform duration-200 ease-out"
        style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
      >
        <GlassCard className="p-0 border-t border-t-orange-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Header Section */}
          <div className="relative p-8 pb-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>
            
            <div className="flex flex-col items-center text-center">
              <div className="relative w-16 h-16 mb-6 group">
                <div className="absolute inset-0 bg-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
                </div>
                {/* Status Dot */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0f172a] rounded-full flex items-center justify-center">
                   <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Ambient Twin</h1>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold">Enterprise Command Center</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 pt-6 bg-black/20 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email Input */}
              <div className="space-y-1.5 group">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider group-focus-within:text-orange-400 transition-colors">Partner ID / Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30 group-focus-within:text-orange-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter any email for demo..."
                    className="w-full bg-slate-900/50 border border-white/10 rounded-sm pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-orange-500/50 focus:bg-slate-900/80 focus:shadow-[0_0_15px_rgba(249,115,22,0.1)] transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 group">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider group-focus-within:text-orange-400 transition-colors">Security Key</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30 group-focus-within:text-orange-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-sm pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-orange-500/50 focus:bg-slate-900/80 focus:shadow-[0_0_15px_rgba(249,115,22,0.1)] transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 rounded-sm transition-all transform active:scale-[0.98] shadow-lg shadow-orange-900/20 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-3 group mt-6"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span className="text-sm">Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">Initiate Session</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </>
                )}
              </button>
            </form>
            
            {/* Quick Demo Login */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col items-center gap-2">
               <span className="text-[10px] text-white/30 uppercase tracking-widest">Or access preview mode</span>
               <button 
                 onClick={handleDemoLogin}
                 disabled={isLoading}
                 className="text-xs text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-4 decoration-orange-500/30 hover:decoration-orange-500 transition-all"
               >
                 Auto-Fill Demo Credentials &rarr;
               </button>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] text-white/30 font-mono">SYSTEM OPERATIONAL</span>
              </div>
              <div className="text-[10px] text-white/30 font-mono">
                v2.5.1
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
