
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { jsPDF } from "jspdf";
import { supabaseService } from '../services/supabaseService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface Props {
  homeId: string;
}

const Icons = {
  Shield: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>,
  Alert: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Chat: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  Lock: () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
};

export const HomeownerPortal: React.FC<Props> = ({ homeId }) => {
  const [accessState, setAccessState] = useState<'verifying' | 'granted'>('verifying');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const profile = {
    address: "123 Maple Avenue, Toronto",
    system: "Lennox 80% AFUE Gas Unit",
    rebateAmount: 10600,
    monthlyWaste: 142,
    contractor: "Elite HVAC Solutions"
  };

  useEffect(() => {
    const timer = setTimeout(() => setAccessState('granted'), 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleConsult = async () => {
    setIsSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setIsSending(false);
  };

  const chartData = [
    { name: 'Jan', current: 340, optimized: 190, reason: "Thermal Leakage" },
    { name: 'Feb', current: 310, optimized: 175, reason: "Blower Motor Inefficiency" },
    { name: 'Mar', current: 290, optimized: 160, reason: "Ductwork Air Leakage" },
    { name: 'Apr', current: 240, optimized: 130, reason: "Short Cycling Waste" },
    { name: 'May', current: 190, optimized: 95, reason: "Static Pressure Resistance" },
    { name: 'Jun', current: 260, optimized: 120, reason: "Low SEER Rating Draw" },
  ];

  if (accessState === 'verifying') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1120] text-white">
         <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 animate-pulse mb-8 shadow-[0_0_40px_rgba(37,99,235,0.2)]">
            <Icons.Lock />
         </div>
         <h2 className="text-xl font-bold uppercase tracking-[0.3em] mb-2">Establishing Tunnel</h2>
         <p className="text-orange-400 text-xs font-mono font-bold tracking-widest uppercase">ENCRYPTED ID: {homeId.toUpperCase()}</p>
      </div>
    );
  }

  const activeMonth = selectedMonthIndex !== null ? chartData[selectedMonthIndex] : null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-32 animate-fade-in relative z-10 px-4">
      
      {/* PROFESSIONAL TOP NAV */}
      <div className="flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
           <div className="h-8 w-8 rounded bg-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">A</div>
           <span className="text-lg font-bold text-white tracking-tight uppercase">Ambient Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.hash = ''}
            className="flex items-center gap-2 px-4 py-1.5 rounded bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-400 transition-all shadow-lg shadow-orange-900/20"
          >
            &larr; Exit to Dashboard
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest hidden md:flex">
            <Icons.Shield />
            <span>Secure Tunnel</span>
          </div>
        </div>
      </div>

      {/* REBATE HERO */}
      <GlassCard variant="mica" className="text-center py-16 border-t-4 border-t-orange-500 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
        <span className="text-xs font-black text-white uppercase tracking-[0.4em] mb-4 block">Official 2026 Audit Result</span>
        <h1 className="text-3xl font-black text-white mb-8">{profile.address}</h1>
        
        <div className="relative inline-block mb-8">
           <div className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
             ${profile.rebateAmount.toLocaleString()}
           </div>
           <div className="absolute -top-6 -right-12 rotate-12 bg-emerald-500 text-white text-[11px] font-black px-3 py-1 rounded shadow-xl border border-emerald-400">APPROVED</div>
        </div>
        
        <div className="flex flex-col items-center gap-1">
           <span className="text-lg font-bold text-emerald-400 tracking-tight">Enbridge HER+ Rebate Eligibility</span>
           <span className="text-xs text-orange-200 uppercase font-black tracking-widest">Pre-Verified via Digital Twin</span>
        </div>
      </GlassCard>

      {/* ANALYTICS SECTION */}
      <GlassCard title="Projected Resource Waste Analysis" icon={<Icons.Activity />} variant="mica">
         <div className="mb-8 p-6 bg-red-500/5 border border-red-500/20 rounded shadow-inner">
            <p className="text-sm text-white leading-relaxed font-semibold">
              Your current <span className="text-orange-400 font-black">{profile.system}</span> is losing <span className="text-orange-400 font-black">${profile.monthlyWaste}/mo</span> in mechanical waste. 
              <span className="text-blue-400 font-black ml-1 cursor-default uppercase tracking-tight">Select a month below for diagnostics.</span>
            </p>
         </div>

         <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} onClick={(v) => v && v.activeTooltipIndex !== undefined && setSelectedMonthIndex(v.activeTooltipIndex)} cursor="pointer">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#fff" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#fff" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#161d2e', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="current" name="Waste Profile" fill="#F97316" radius={[4, 4, 0, 0]} barSize={24}>
                   {chartData.map((e, i) => <Cell key={i} fillOpacity={selectedMonthIndex === i ? 1 : 0.4} fill={selectedMonthIndex === i ? '#F97316' : '#fff'} />)}
                </Bar>
                <Bar dataKey="optimized" name="Optimal Performance" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} fillOpacity={0.2} />
              </BarChart>
            </ResponsiveContainer>
         </div>

         <div className={`mt-8 transition-all duration-500 ${activeMonth ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
            {activeMonth && (
               <div className="p-6 bg-white/[0.04] border border-orange-500/20 rounded-lg flex flex-col md:flex-row items-center gap-6 animate-fade-in shadow-xl">
                  <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center text-white border border-orange-400 shadow-lg shadow-orange-900/30">
                    <Icons.Alert />
                  </div>
                  <div className="flex-1">
                     <div className="text-[10px] font-black uppercase text-orange-400 tracking-[0.2em] mb-1">{activeMonth.name} Technical Diagnosis</div>
                     <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight">{activeMonth.reason}</h3>
                     <p className="text-xs text-white/80 font-medium">Sub-optimal system pressure is causing over-cycle conditions, increasing hydro draw by <span className="text-orange-400 font-black">${activeMonth.current - activeMonth.optimized}</span> this month.</p>
                  </div>
               </div>
            )}
         </div>
      </GlassCard>

      {/* CALLS TO ACTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="p-8 bg-white/[0.04] border border-white/10 rounded-xl flex flex-col justify-between hover:bg-white/[0.06] transition-all shadow-xl">
            <div className="space-y-3 mb-8">
               <h4 className="text-xl font-black text-white uppercase tracking-tight">Full Energy Report</h4>
               <p className="text-sm text-white/70 font-medium leading-relaxed">Download your blockchain-verified technical addendum for your home appraisal or realtor files.</p>
            </div>
            <button className="w-full py-4 bg-white/10 hover:bg-orange-600 border border-white/20 rounded text-xs font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-3 transition-all">
               <Icons.Download />
               Get PDF Summary
            </button>
         </div>

         <div className="p-8 bg-orange-600 border border-orange-400 rounded-xl flex flex-col justify-between shadow-2xl shadow-orange-900/40 group hover:bg-orange-500 transition-all">
            <div className="space-y-3 mb-8">
               <h4 className="text-xl font-black text-white uppercase tracking-tight">Secure Rebate Lock</h4>
               <p className="text-sm text-white font-medium leading-relaxed">Schedule your pre-retrofit verification with <strong>{profile.contractor}</strong> to finalize your $10,600 claim.</p>
            </div>
            <button 
               onClick={handleConsult}
               disabled={sent || isSending}
               className={`w-full py-4 rounded text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all
                  ${sent ? 'bg-emerald-500 text-white cursor-default' : 'bg-white text-orange-600 hover:scale-[1.02] shadow-xl shadow-orange-900/20'}
               `}
            >
               {isSending ? 'Syncing...' : sent ? 'Verified & Sent' : <><Icons.Chat />Initiate Claim Process</>}
            </button>
         </div>
      </div>

      <div className="text-center pt-10">
         <button 
           onClick={() => window.location.hash = ''}
           className="text-[10px] text-white/30 hover:text-orange-400 font-black uppercase tracking-[0.5em] transition-all"
         >
           &larr; Return to Central Hub
         </button>
      </div>

    </div>
  );
};
