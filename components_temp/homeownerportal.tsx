
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { jsPDF } from "jspdf";
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
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Building: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="2"/><line x1="17" y1="22" x2="17" y2="2"/></svg>
};

export const HomeownerPortal: React.FC<Props> = ({ homeId }) => {
  const [accessState, setAccessState] = useState<'verifying' | 'granted'>('verifying');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const profile = {
    address: "123 Maple Avenue, Toronto",
    system: "Lennox High-Efficiency Gas Unit",
    rebateAmount: 12000,
    monthlyWaste: 142,
    contractor: "Your HVAC Partner Name"
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("PROPERTY ENERGY PASSPORT", 20, 30);
    doc.setFontSize(10);
    doc.text(`PROPERTY ID: ${homeId.toUpperCase()}`, 20, 42);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Efficiency & Rebate Summary", 20, 70);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Property Address: ${profile.address}`, 20, 80);
    doc.text(`Equipment Class: ${profile.system}`, 20, 90);
    doc.text(`Rebate Qualification: $${profile.rebateAmount.toLocaleString()} CAD`, 20, 100);
    doc.save(`Energy_Passport_${homeId.toUpperCase()}.pdf`);
  };

  const chartData = [
    { name: 'Jan', current: 340, optimized: 190, reason: "Thermal Leakage" },
    { name: 'Feb', current: 310, optimized: 175, reason: "Blower Motor Drag" },
    { name: 'Mar', current: 290, optimized: 160, reason: "Ductwork Air Escape" },
    { name: 'Apr', current: 240, optimized: 130, reason: "Cycle Latency" },
    { name: 'May', current: 190, optimized: 95, reason: "Static Resistance" },
    { name: 'Jun', current: 260, optimized: 120, reason: "Low SEER Rating Draw" },
  ];

  if (accessState === 'verifying') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1120] text-white">
         <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 animate-pulse mb-8 shadow-[0_0_40px_rgba(37,99,235,0.2)]">
            <Icons.Lock />
         </div>
         <h2 className="text-xl font-bold uppercase tracking-[0.3em] mb-2 animate-pulse">Initializing Portal</h2>
         <p className="text-orange-400 text-xs font-mono font-bold tracking-widest uppercase">TUNNEL ID: {homeId.toUpperCase()}</p>
      </div>
    );
  }

  const activeMonth = selectedMonthIndex !== null ? chartData[selectedMonthIndex] : null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-32 animate-fade-in relative z-10 px-4">
      
      {/* BRANDED HEADER FOR PARTNERS */}
      <div className="flex items-center justify-between py-6 border-b border-white/5">
        <div className="flex items-center gap-4">
           <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 shadow-inner group transition-all hover:border-orange-500/50">
              <Icons.Building />
           </div>
           <div className="flex flex-col">
              <span className="text-[14px] font-black text-white tracking-tight uppercase">{profile.contractor}</span>
              <span className="text-[9px] text-orange-400 font-black tracking-[0.2em] uppercase">Authorized Energy Partner</span>
           </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.hash = ''}
            className="flex items-center gap-2 px-4 py-2 rounded bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-400 transition-all shadow-xl shadow-orange-900/40 active:scale-95"
          >
            &larr; Exit
          </button>
        </div>
      </div>

      {/* REBATE STATUS HERO */}
      <GlassCard variant="mica" className="text-center py-16 border-t-4 border-t-orange-500 relative overflow-hidden group bg-gradient-to-br from-orange-500/[0.05] to-transparent">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        <span className="text-xs font-black text-white uppercase tracking-[0.4em] mb-4 block">Official Efficiency Audit Result</span>
        <h1 className="text-3xl font-black text-white mb-8 tracking-tighter uppercase">{profile.address}</h1>
        
        <div className="relative inline-block mb-8">
           <div className="text-9xl font-black text-white tracking-tighter drop-shadow-2xl">
             ${profile.rebateAmount.toLocaleString()}
           </div>
           <div className="absolute -top-6 -right-16 rotate-12 bg-emerald-500 text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-2xl border-2 border-emerald-300 animate-bounce">2026 QUALIFIED</div>
        </div>
        
        <div className="flex flex-col items-center gap-1">
           <span className="text-xl font-black text-emerald-400 tracking-tight uppercase">Enbridge HER+ Grant Locked</span>
           <span className="text-[10px] text-white/40 uppercase font-black tracking-[0.3em] mt-2">Verified via Ambient Twin Telemetry Pipeline</span>
        </div>
      </GlassCard>

      {/* RESOURCE ANALYSIS */}
      <GlassCard title="Real-Time Resource Triage" icon={<Icons.Activity />} variant="mica">
         <div className="mb-8 p-6 bg-red-500/5 border border-red-500/20 rounded shadow-inner">
            <p className="text-[13px] text-white leading-relaxed font-black uppercase tracking-tight">
              Your mechanical effort is currently costing you <span className="text-orange-400 underline decoration-2 underline-offset-4">${profile.monthlyWaste}/mo</span> in preventable waste. 
              <span className="text-blue-400 ml-1 italic">Select a data bar below for mechanical diagnostics.</span>
            </p>
         </div>

         <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} onClick={(v) => v && v.activeTooltipIndex !== undefined && setSelectedMonthIndex(v.activeTooltipIndex)} cursor="pointer">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#fff" fontSize={11} axisLine={false} tickLine={false} className="font-black uppercase" />
                <YAxis stroke="#fff" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} className="font-black" />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#161d2e', border: '2px solid white', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="current" name="System Waste" fill="#F97316" radius={[4, 4, 0, 0]} barSize={24}>
                   {chartData.map((e, i) => <Cell key={i} fillOpacity={selectedMonthIndex === i ? 1 : 0.4} fill={selectedMonthIndex === i ? '#F97316' : '#fff'} />)}
                </Bar>
                <Bar dataKey="optimized" name="Theoretical Floor" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} fillOpacity={0.2} />
              </BarChart>
            </ResponsiveContainer>
         </div>

         <div className={`mt-8 transition-all duration-500 ${activeMonth ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
            {activeMonth && (
               <div className="p-8 bg-white/[0.04] border border-orange-500/30 rounded-xl flex flex-col md:flex-row items-center gap-8 animate-fade-in shadow-3xl">
                  <div className="h-14 w-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white border-2 border-orange-400 shadow-2xl shadow-orange-900/60 shrink-0">
                    <Icons.Alert />
                  </div>
                  <div className="flex-1">
                     <div className="text-[10px] font-black uppercase text-orange-400 tracking-[0.3em] mb-1">{activeMonth.name} Forensic Triage</div>
                     <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter">{activeMonth.reason}</h3>
                     <p className="text-sm text-white/80 font-bold uppercase tracking-tight leading-snug">The Digital Twin detected mechanical drag causing a <span className="text-orange-400 font-black">${activeMonth.current - activeMonth.optimized} loss</span>. Proactive retrofit required for grant clearance.</p>
                  </div>
               </div>
            )}
         </div>
      </GlassCard>

      {/* CALLS TO ACTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="p-8 bg-white/[0.04] border border-white/10 rounded-2xl flex flex-col justify-between hover:bg-white/[0.08] transition-all shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full" />
            <div className="space-y-3 mb-10">
               <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Energy Passport</h4>
               <p className="text-sm text-white/60 font-black uppercase tracking-tight leading-relaxed">Secure your blockchain-verified addendum for your next property appraisal or Realtor file.</p>
            </div>
            <button 
               onClick={handleDownloadPDF}
               className="w-full py-5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] text-white flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg"
            >
               <Icons.Download />
               Generate Passport PDF
            </button>
         </div>

         <div className="p-8 bg-orange-600 border border-orange-400 rounded-2xl flex flex-col justify-between shadow-3xl shadow-orange-900/60 group hover:bg-orange-500 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-3xl rounded-full animate-pulse" />
            <div className="space-y-3 mb-10">
               <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Finalize Rebate</h4>
               <p className="text-sm text-white font-black uppercase tracking-tight leading-relaxed">Schedule your pre-retrofit verification with <strong>{profile.contractor}</strong> to lock in your ${profile.rebateAmount.toLocaleString()} claim.</p>
            </div>
            <button 
               onClick={handleConsult}
               disabled={sent || isSending}
               className={`w-full py-5 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-2xl active:scale-95
                  ${sent ? 'bg-emerald-500 text-white cursor-default border-2 border-emerald-300' : 'bg-white text-orange-600 hover:shadow-orange-900/50'}
               `}
            >
               {isSending ? 'Establishing Tunnel...' : sent ? <><Icons.Shield /> Request Established</> : <><Icons.Chat />Initiate Claim Process</>}
            </button>
         </div>
      </div>

      <div className="text-center pt-12">
         <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] mb-4 italic">Ambient Core v2.5 Deployment | Secure B2B Sync Enabled</p>
         <button 
           onClick={() => window.location.hash = ''}
           className="text-[11px] text-orange-400/50 hover:text-orange-400 font-black uppercase tracking-[0.6em] transition-all hover:scale-110"
         >
           &larr; Return to Core
         </button>
      </div>

    </div>
  );
};
