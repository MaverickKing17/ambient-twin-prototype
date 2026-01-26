
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

const PortalIcons = {
  Pulse: () => (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
    </span>
  ),
  Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Chat: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Lock: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Alert: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
};

export const HomeownerPortal: React.FC<Props> = ({ homeId }) => {
  const [accessState, setAccessState] = useState<'verifying' | 'granted' | 'denied'>('verifying');
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [sendingLead, setSendingLead] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);

  const profile = {
    address: "123 Maple Avenue, Toronto",
    system: "Lennox 80% AFUE Furnace (2014)",
    rebateAmount: 10600,
    monthlyWaste: 145,
    contractor: "Elite HVAC Solutions"
  };

  useEffect(() => {
    document.title = `Audit: ${profile.address} | Ambient Twin`;
    const timer = setTimeout(() => {
      setAccessState('granted');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleConsult = async () => {
    setSendingLead(true);
    const success = await supabaseService.captureLead({
      home_id: homeId,
      address: profile.address,
      rebate_amount: profile.rebateAmount
    });
    if (success) {
      setLeadCaptured(true);
    }
    setSendingLead(false);
  };

  const downloadGuide = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("Enbridge Home Efficiency Report", 20, 30);
    doc.setFontSize(14);
    doc.text(`Prepared for: ${profile.address}`, 20, 45);
    doc.setTextColor(249, 115, 22);
    doc.setFontSize(40);
    doc.text(`$${profile.rebateAmount.toLocaleString()} Approved`, 20, 70);
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(12);
    doc.text("Based on your Digital Twin analysis, upgrading your", 20, 90);
    doc.text(`${profile.system} will qualify for the Tier 1`, 20, 96);
    doc.text("Enbridge Home Efficiency Rebate Program.", 20, 102);
    doc.save("Rebate_Eligibility_2026.pdf");
  };

  const chartData = [
    { name: 'Jan', current: 320, optimized: 180, reason: "Inefficient Gas Combustion" },
    { name: 'Feb', current: 300, optimized: 165, reason: "Thermal Envelope Loss" },
    { name: 'Mar', current: 280, optimized: 150, reason: "Furnace Short Cycling" },
    { name: 'Apr', current: 220, optimized: 120, reason: "Ductwork Air Leakage" },
    { name: 'May', current: 180, optimized: 90, reason: "Old Compressor Strain" },
    { name: 'Jun', current: 240, optimized: 110, reason: "Poor SEER Rating" },
  ];

  if (accessState === 'verifying') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse"></div>
          <div className="relative bg-white/5 border border-white/10 p-4 rounded-full">
            <PortalIcons.Lock />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
           <h2 className="text-white font-semibold tracking-wider uppercase text-sm">Securing Connection</h2>
           <div className="flex gap-1">
             <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-0"></div>
             <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-100"></div>
             <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-200"></div>
           </div>
           <p className="text-white/40 text-xs font-mono mt-2">Verifying Magic Link Token: {homeId.slice(0, 8)}...</p>
        </div>
      </div>
    );
  }

  const selectedData = selectedMonthIndex !== null ? chartData[selectedMonthIndex] : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-fade-in relative z-10">
      <div className="flex items-center justify-between py-4 px-2">
        <div className="flex items-center gap-2">
           <div className="h-6 w-6 rounded bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-orange-500/20">AT</div>
           <span className="text-sm font-semibold text-white tracking-tight">Ambient Twin</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-white/40 bg-white/5 px-2 py-1 rounded border border-white/5">
            <PortalIcons.Shield />
            <span>Encrypted Session</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 backdrop-blur-md">
            <PortalIcons.Pulse />
            <span className="text-xs font-medium text-emerald-400">Live</span>
          </div>
        </div>
      </div>

      <GlassCard className="text-center py-10 relative overflow-hidden border-t-4 border-t-orange-500 group">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/10 via-slate-900/0 to-slate-900/0 pointer-events-none"></div>
        <h2 className="text-white/60 text-xs md:text-sm uppercase tracking-[0.2em] font-bold mb-3">2026 Efficiency Audit</h2>
        <h1 className="text-xl md:text-3xl font-bold text-white mb-6 px-4">{profile.address}</h1>
        <div className="inline-block relative transform transition-transform duration-500 group-hover:scale-105">
           <div className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 tracking-tighter drop-shadow-2xl">
             ${profile.rebateAmount.toLocaleString()}
           </div>
           <div className="absolute -top-4 -right-8 rotate-12 bg-orange-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded shadow-lg border border-orange-400">ELIGIBLE</div>
        </div>
        <p className="mt-4 text-orange-400 font-medium text-sm md:text-base">Total Enbridge Rebate Available</p>
      </GlassCard>

      <GlassCard title="Projected Financial Waste (6 Mo)">
         <div className="mb-4 text-sm text-white/70">
           Your current <span className="text-white font-bold">{profile.system}</span> is operating at <span className="text-red-400 font-bold">80% efficiency</span>. 
           {selectedMonthIndex === null ? (
             <span> You are losing approximately <span className="text-white font-bold">${profile.monthlyWaste}/month</span> in potential savings.</span>
           ) : (
             <span className="text-orange-300 ml-1">Leakage source details revealed below.</span>
           )}
         </div>
         <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} onClick={(data) => { if (data && data.activeTooltipIndex !== undefined) setSelectedMonthIndex(data.activeTooltipIndex); }} cursor="pointer">
                <defs>
                   <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/><stop offset="100%" stopColor="#ef4444" stopOpacity={0.3}/></linearGradient>
                   <linearGradient id="optGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="100%" stopColor="#10b981" stopOpacity={0.3}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                <Bar dataKey="current" name="Current Bill" fill="url(#currentGradient)" radius={[4, 4, 0, 0]} barSize={12}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fillOpacity={selectedMonthIndex !== null && selectedMonthIndex !== index ? 0.3 : 1} stroke={selectedMonthIndex === index ? '#fff' : 'none'} strokeWidth={selectedMonthIndex === index ? 1 : 0} />)}
                </Bar>
                <Bar dataKey="optimized" name="With Heat Pump" fill="url(#optGradient)" radius={[4, 4, 0, 0]} barSize={12}>
                   {chartData.map((entry, index) => <Cell key={`cell-opt-${index}`} fillOpacity={selectedMonthIndex !== null && selectedMonthIndex !== index ? 0.3 : 1} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {selectedMonthIndex === null && (
               <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 pointer-events-none bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] text-white/70 border border-white/10 animate-pulse">Tap any bar to inspect</div>
            )}
         </div>
         <div className={`mt-6 rounded border border-white/5 bg-gradient-to-r from-white/5 to-transparent transition-all duration-500 ease-out overflow-hidden ${selectedData ? 'opacity-100 max-h-40' : 'opacity-50 max-h-12'}`}>
            {selectedData ? (
               <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-shrink-0 p-3 rounded-full bg-red-500/20 text-red-400 border border-red-500/30"><PortalIcons.Alert /></div>
                  <div className="flex-1 w-full text-center md:text-left">
                     <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Diagnosis for {selectedData.name}</div>
                     <h3 className="text-white font-bold text-lg mb-1">{selectedData.reason}</h3>
                     <p className="text-xs text-white/60">System efficiency drops due to mechanical strain, causing excess energy draw.</p>
                  </div>
                  <div className="flex-shrink-0 text-center md:text-right bg-black/20 p-3 rounded-md border border-white/5">
                     <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1">Recoverable</div>
                     <div className="text-2xl font-bold text-emerald-400">${selectedData.current - selectedData.optimized}</div>
                  </div>
               </div>
            ) : (
               <div className="p-4 flex items-center justify-center text-white/30 text-xs italic gap-2"><PortalIcons.Info />Select a month above to reveal mechanical failure cause.</div>
            )}
         </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="flex flex-col justify-between h-full bg-gradient-to-br from-white/5 to-white/10 hover:border-white/20 transition-all">
           <div className="space-y-2">
             <h3 className="text-lg font-bold text-white">Official Rebate Guide</h3>
             <p className="text-xs text-white/60 leading-relaxed">Download your personalized PDF report for claiming the $10,600.</p>
           </div>
           <button onClick={downloadGuide} className="mt-6 w-full py-3 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"><PortalIcons.Download />Download PDF</button>
        </GlassCard>
        <GlassCard className="flex flex-col justify-between h-full border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent hover:border-orange-500/50 transition-all">
           <div className="space-y-2">
             <h3 className="text-lg font-bold text-white">Claim Your Rebate</h3>
             <p className="text-xs text-white/60 leading-relaxed">Schedule verification with <strong>{profile.contractor}</strong> to lock in eligibility.</p>
           </div>
           <button onClick={handleConsult} disabled={leadCaptured || sendingLead} className={`mt-6 w-full py-3 rounded text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-900/40 ${leadCaptured ? 'bg-emerald-600 text-white cursor-default' : 'bg-orange-500 hover:bg-orange-600 text-white'} ${sendingLead ? 'opacity-70 cursor-wait' : ''}`}>
             {sendingLead ? <span className="animate-pulse">Sending Request...</span> : leadCaptured ? <><PortalIcons.Check />Request Sent</> : <><PortalIcons.Chat />Consult {profile.contractor}</>}
           </button>
        </GlassCard>
      </div>
    </div>
  );
};
