
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
};

export const HomeownerPortal: React.FC<Props> = ({ homeId }) => {
  const [loading, setLoading] = useState(true);
  const [leadCaptured, setLeadCaptured] = useState(false);

  // Mock Data mimicking a fetch based on homeId
  const profile = {
    address: "123 Maple Avenue, Toronto",
    system: "Lennox 80% AFUE Furnace (2014)",
    rebateAmount: 10600,
    monthlyWaste: 145,
    contractor: "Elite HVAC Solutions"
  };

  useEffect(() => {
    // Simulate data fetch
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleConsult = () => {
    setLeadCaptured(true);
    // Logic to send webhook to dashboard would go here
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
    { name: 'Jan', current: 320, optimized: 180 },
    { name: 'Feb', current: 300, optimized: 165 },
    { name: 'Mar', current: 280, optimized: 150 },
    { name: 'Apr', current: 220, optimized: 120 },
    { name: 'May', current: 180, optimized: 90 },
    { name: 'Jun', current: 240, optimized: 110 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
           <div className="text-white/50 text-sm tracking-widest uppercase">Syncing Digital Twin...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-fade-in">
      
      {/* Navbar / Status Bar */}
      <div className="flex items-center justify-between py-2 px-1">
        <div className="flex items-center gap-2">
           <div className="h-6 w-6 rounded bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-orange-500/20">
             AT
           </div>
           <span className="text-sm font-semibold text-white tracking-tight">Ambient Twin</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
          <PortalIcons.Pulse />
          <span className="text-xs font-medium text-emerald-400">Live Connection</span>
        </div>
      </div>

      {/* Hero Section */}
      <GlassCard className="text-center py-10 relative overflow-hidden border-t-4 border-t-orange-500">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none"></div>
        <h2 className="text-white/60 text-sm uppercase tracking-widest font-semibold mb-2">2026 Efficiency Audit</h2>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">{profile.address}</h1>
        
        <div className="inline-block relative">
           <div className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 tracking-tighter drop-shadow-2xl">
             ${profile.rebateAmount.toLocaleString()}
           </div>
           <div className="absolute -top-4 -right-8 rotate-12 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
             ELIGIBLE
           </div>
        </div>
        
        <p className="mt-4 text-orange-400 font-medium text-sm md:text-base">
          Total Enbridge Rebate Available
        </p>
      </GlassCard>

      {/* Financial Leakage */}
      <GlassCard title="Projected Financial Waste (6 Mo)">
         <div className="mb-4 text-sm text-white/70">
           Your current <span className="text-white font-bold">{profile.system}</span> is operating at 
           <span className="text-red-400 font-bold"> 80% efficiency</span>. You are losing approximately 
           <span className="text-white font-bold"> ${profile.monthlyWaste}/month</span> in potential savings.
         </div>
         <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                   <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3}/>
                   </linearGradient>
                   <linearGradient id="optGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.3}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <Bar dataKey="current" name="Current Bill" fill="url(#currentGradient)" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="optimized" name="With Heat Pump" fill="url(#optGradient)" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
         </div>
         <div className="flex justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-500/50"></span>
              <span className="text-white/60">Current Waste</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500/50"></span>
              <span className="text-white/60">Optimized Savings</span>
            </div>
         </div>
      </GlassCard>

      {/* Action Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="flex flex-col justify-between h-full bg-gradient-to-br from-white/5 to-white/10">
           <div className="space-y-2">
             <h3 className="text-lg font-bold text-white">Official Rebate Guide</h3>
             <p className="text-xs text-white/60 leading-relaxed">
               Download your personalized PDF report detailing the technical specifications required to claim the $10,600.
             </p>
           </div>
           <button 
             onClick={downloadGuide}
             className="mt-6 w-full py-3 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
           >
             <PortalIcons.Download />
             Download PDF
           </button>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between h-full border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent">
           <div className="space-y-2">
             <h3 className="text-lg font-bold text-white">Claim Your Rebate</h3>
             <p className="text-xs text-white/60 leading-relaxed">
               Schedule a verification call with <strong>{profile.contractor}</strong> to lock in your 2026 eligibility before funds run out.
             </p>
           </div>
           <button 
             onClick={handleConsult}
             disabled={leadCaptured}
             className={`mt-6 w-full py-3 rounded text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-900/40
               ${leadCaptured 
                 ? 'bg-emerald-600 text-white cursor-default' 
                 : 'bg-orange-500 hover:bg-orange-600 text-white'}
             `}
           >
             {leadCaptured ? (
               <>
                 <PortalIcons.Check />
                 Request Sent
               </>
             ) : (
               <>
                 <PortalIcons.Chat />
                 Consult {profile.contractor}
               </>
             )}
           </button>
        </GlassCard>
      </div>

      <div className="text-center pt-8">
        <p className="text-[10px] text-white/30 max-w-xs mx-auto">
          Secure Link ID: {homeId} • Verified by Ambient Twin™ • All data is encrypted and anonymized.
        </p>
      </div>
    </div>
  );
};
