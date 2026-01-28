import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { HeartbeatGraph } from './HeartbeatGraph';
import { EfficiencyCertificateCard } from './EfficiencyCertificateCard';
import { AISystemArchitect } from './AISystemArchitect';
import { LeadImporter } from './LeadImporter';
import { OutreachGen } from './OutreachGen';
import { generateEfficiencyCertificate } from '../services/ledgerService';
import { seamService, SEAM_API_KEY } from '../services/seamService';
import { supabaseService, supabase } from '../services/supabaseService'; 
import { 
  SystemStrainPrediction, 
  EfficiencyCertificate, 
  ProviderType, 
  TelemetryReading,
  SeamDevice,
  SalesLead
} from '../types';

const Icons = {
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Zap: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  ShieldCheck: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  Globe: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Cpu: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>,
  Power: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>,
  Bell: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
};

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'twin' | 'leads'>('twin');
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [prediction, setPrediction] = useState<SystemStrainPrediction | null>(null);
  const [certificate, setCertificate] = useState<EfficiencyCertificate | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [activeOutreachLead, setActiveOutreachLead] = useState<SalesLead | null>(null);
  
  const [devices, setDevices] = useState<SeamDevice[]>([]);
  const [activeDevice, setActiveDevice] = useState<SeamDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<'linked' | 'missing'>('missing');
  const [leads, setLeads] = useState<SalesLead[]>([]);

  useEffect(() => {
    handleConnectProvider(ProviderType.HONEYWELL);
    if (process.env.API_KEY) {
      setGeminiStatus('linked');
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'leads') {
      loadLeads();
    }
  }, [activeTab]);

  const loadLeads = async () => {
    const realLeads = await supabaseService.fetchLeads();
    if (realLeads && realLeads.length > 0) {
      setLeads(realLeads);
    } else {
      setLeads([
        { home_id: "H-101", address: "123 Maple Avenue, Etobicoke", rebate_amount: 12500, status: 'new', created_at: new Date().toISOString(), asset_grade: 'A+', audit_progress: 85, grid_impact: 'Low', program: 'HER+' },
        { home_id: "H-102", address: "456 Royal York Rd, Etobicoke", rebate_amount: 10600, status: 'contacted', created_at: new Date().toISOString(), asset_grade: 'B', audit_progress: 40, grid_impact: 'Moderate', program: 'HER+' },
        { home_id: "H-103", address: "789 The Queensway, Etobicoke", rebate_amount: 12000, status: 'new', created_at: new Date().toISOString(), asset_grade: 'A', audit_progress: 75, grid_impact: 'Low', program: 'Greener Homes' },
        { home_id: "H-104", address: "32 Mimico Ave, Etobicoke", rebate_amount: 9800, status: 'new', created_at: new Date().toISOString(), asset_grade: 'C', audit_progress: 15, grid_impact: 'High', program: 'Clean Energy Toronto' },
      ]);
    }
  };

  const handleConnectProvider = async (provider: ProviderType) => {
    setIsConnecting(true);
    try {
      const discoveredDevices = await seamService.listDevices(SEAM_API_KEY || 'mock', provider);
      setDevices(discoveredDevices);
      if (discoveredDevices.length > 0) {
        const first = discoveredDevices.find(d => d.properties.online) || discoveredDevices[0];
        setActiveDevice(first);
        loadDeviceData(first);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  };

  const loadDeviceData = async (device: SeamDevice) => {
    try {
      const newReadings = await seamService.getTelemetryHistory(device.device_id);
      setReadings(newReadings);
      setCertificate(null);
      const newPrediction = await supabaseService.generatePrediction(device.device_id, newReadings);
      setPrediction(newPrediction);
    } catch (error) {
      console.error(error);
    }
  };

  const currentReading = readings.length > 0 ? readings[readings.length-1] : null;
  const healthScore = prediction ? Math.round(prediction.efficiency_index * 100) : 0;

  return (
    <div className="max-w-[1500px] mx-auto space-y-6 animate-fade-in px-4 py-8 relative">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-6 px-10 bg-[#161d2e] border-2 border-white/5 rounded-xl shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
        <div className="flex items-center gap-6">
           <div className="h-12 w-12 rounded-xl bg-orange-600 flex items-center justify-center shadow-2xl shadow-orange-900/50">
             <Icons.Cpu />
           </div>
           <div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">Ambient Twin | <span className="text-orange-500 font-light italic text-lg lg:text-xl">GTA Command Center</span></h1>
              <div className="flex items-center gap-6 mt-1">
                 <button onClick={() => setDemoMode(!demoMode)} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded border-2 transition-all ${demoMode ? 'bg-orange-500 text-white border-white/40' : 'text-white/40 border-white/10 hover:border-orange-500/50'}`}>
                   {demoMode ? 'SANDBOX ACTIVE' : 'LIVE GTA DATA'}
                 </button>
                 <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded border-2 transition-colors ${geminiStatus === 'linked' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'}`}>
                   <Icons.Globe /> {geminiStatus === 'linked' ? 'AI Online' : 'AI Offline'}
                 </div>
              </div>
           </div>
        </div>
        <nav className="flex items-center gap-10 mt-8 lg:mt-0">
          <button onClick={() => setActiveTab('twin')} className={`text-[13px] font-black uppercase tracking-[0.3em] transition-all relative py-3 ${activeTab === 'twin' ? 'text-white border-b-2 border-orange-500' : 'text-white/60 hover:text-white'}`}>Home Health Twin</button>
          <button onClick={() => setActiveTab('leads')} className={`text-[13px] font-black uppercase tracking-[0.3em] transition-all relative py-3 ${activeTab === 'leads' ? 'text-white border-b-2 border-orange-500' : 'text-white/60 hover:text-white'}`}>GTA Grant Ledger</button>
          <div className="h-8 w-px bg-white/10" />
          <button onClick={() => supabase?.auth.signOut()} className="text-white hover:text-red-400 transition-colors p-3 scale-125"><Icons.Power /></button>
        </nav>
      </header>

      {showImporter && <LeadImporter onComplete={() => { setShowImporter(false); loadLeads(); }} onClose={() => setShowImporter(false)} />}
      {activeOutreachLead && <OutreachGen lead={activeOutreachLead} onClose={() => { setActiveOutreachLead(null); loadLeads(); }} />}

      <main className="space-y-8 pb-20">
        {activeTab === 'twin' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* HERO: PROMINENT HEALTH SCORE GAUGE */}
            <div className="lg:col-span-5">
              <GlassCard className="h-full border-l-[12px] border-l-orange-500 shadow-3xl bg-gradient-to-br from-orange-600/20 via-slate-900/80 to-transparent p-10 relative overflow-hidden flex flex-col justify-between">
                 <div className="absolute top-0 right-0 p-8 opacity-5 scale-[4] pointer-events-none"><Icons.Zap /></div>
                 <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-start">
                       <div className="space-y-2">
                          <span className="text-orange-400 font-black uppercase tracking-[0.4em] text-[12px]">Property Asset Wellness</span>
                          <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{activeDevice?.properties?.name || 'Scanning GTA...'}</h2>
                          <p className="text-white/40 text-[11px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                            <Icons.Activity /> System Uplink: <span className="text-emerald-400 font-bold uppercase">Stable</span>
                          </p>
                       </div>
                       <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center shadow-xl">
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Live Zone</span>
                          <span className="text-4xl font-black text-white tracking-tighter">{currentReading?.indoorTemp?.toFixed(1) || '--'}°</span>
                       </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-12 pt-4">
                       <div className="relative group">
                          <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full animate-pulse group-hover:bg-orange-500/40 transition-all" />
                          <svg className="w-44 h-44 transform -rotate-90 relative z-10">
                             <circle cx="88" cy="88" r="78" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-white/5" />
                             <circle cx="88" cy="88" r="78" stroke="currentColor" strokeWidth="14" fill="transparent" strokeDasharray={490} strokeDashoffset={490 - (490 * healthScore) / 100} strokeLinecap="round" className={`transition-all duration-1000 ${healthScore > 80 ? 'text-emerald-500' : healthScore > 60 ? 'text-orange-500' : 'text-red-500'}`} />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                             <span className="text-5xl font-black text-white tracking-tighter">{healthScore}%</span>
                             <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Efficiency</span>
                          </div>
                       </div>
                       <div className="flex-1 space-y-6 w-full">
                          <div className="space-y-2 text-center md:text-left">
                             <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">Mechanical Triage</span>
                             <p className={`text-2xl font-black uppercase leading-tight tracking-tighter ${healthScore > 80 ? 'text-emerald-400' : healthScore > 60 ? 'text-orange-400' : 'text-red-500'}`}>
                                {healthScore > 80 ? 'Peak Condition' : healthScore > 60 ? 'Optimal Performance' : 'Intervention Needed'}
                             </p>
                          </div>
                          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                             <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Failure Probability</span>
                                <span className={`text-[11px] font-black ${prediction?.strain_score && prediction.strain_score > 50 ? 'text-orange-500' : 'text-emerald-400'}`}>{prediction?.strain_score || 0}%</span>
                             </div>
                             <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${prediction?.strain_score && prediction.strain_score > 50 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${prediction?.strain_score || 0}%` }} />
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </GlassCard>
            </div>

            {/* AI ANALYSIS SECTION */}
            <div className="lg:col-span-7">
              <AISystemArchitect device={activeDevice!} readings={readings} />
            </div>

            {/* HIGH PROMINENCE RECENT ALERTS */}
            <div className="lg:col-span-12">
               <GlassCard title="Live Infrastructure Alerts & Triage" icon={<Icons.Bell />} variant="mica" className="border-2 border-orange-500/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {prediction && prediction.anomalies.length > 0 ? (
                      prediction.anomalies.map((anomaly, idx) => (
                        <div key={idx} className="p-5 bg-orange-500/10 border-2 border-orange-500/30 rounded-xl flex items-start gap-4 animate-fade-in hover:bg-orange-500/20 transition-all cursor-default group">
                          <div className="w-3 h-3 rounded-full bg-orange-500 mt-1.5 shadow-[0_0_12px_#f97316] shrink-0 animate-pulse" />
                          <div className="flex flex-col">
                            <span className="text-[13px] font-black text-white uppercase tracking-tight">{anomaly}</span>
                            <span className="text-[10px] font-black text-orange-400 uppercase mt-1 tracking-widest">Action Required for HER+ Grant</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 p-10 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-xl flex flex-col items-center justify-center space-y-4">
                        <Icons.ShieldCheck />
                        <span className="text-[14px] font-black text-white/60 uppercase tracking-[0.4em]">No Critical Infrastructure Faults Detected</span>
                      </div>
                    )}
                  </div>
               </GlassCard>
            </div>

            {/* SECONDARY DATA: GRAPHS & CERTIFICATES */}
            <div className="lg:col-span-8">
              <GlassCard title="Mechanical Heartbeat" icon={<Icons.Activity />} className="border-2 shadow-2xl">
                <HeartbeatGraph data={readings} />
              </GlassCard>
            </div>
            <div className="lg:col-span-4">
              {certificate ? <EfficiencyCertificateCard certificate={certificate} onUpdate={setCertificate} /> : (
                  <GlassCard title="Asset Passport" icon={<Icons.ShieldCheck />} variant="mica" className="border-2 p-10 bg-gradient-to-br from-orange-600/10 to-transparent">
                    <p className="text-[11px] text-white/60 font-medium uppercase text-center mb-6 leading-relaxed">Seal your HVAC efficiency on the Toronto Ledger to unlock Enbridge $12k grants and boost property value.</p>
                    <button onClick={() => { setIsMinting(true); generateEfficiencyCertificate(activeDevice!.device_id, prediction!).then(c => { setCertificate(c); setIsMinting(false); }); }} className="w-full py-6 bg-orange-600 rounded-2xl text-[14px] font-black uppercase tracking-[0.4em] text-white shadow-2xl shadow-orange-900/60 hover:bg-orange-500 transition-all active:scale-[0.98]">
                      {isMinting ? 'Verifying GTA Data...' : 'Issue Asset Passport'}
                    </button>
                  </GlassCard>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <GlassCard title="GTA Energy Grant Ledger" icon={<Icons.Activity />} className="border-2 p-0 overflow-hidden shadow-3xl bg-slate-900/40">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead><tr className="bg-white/[0.08] border-b border-white/10">
                      <th className="p-8 text-[12px] font-black text-white uppercase tracking-[0.2em]">Toronto Property Address</th>
                      <th className="p-8 text-[12px] font-black text-white uppercase tracking-[0.2em]">Asset Grade</th>
                      <th className="p-8 text-[12px] font-black text-white uppercase tracking-[0.2em]">Grant Value (HER+)</th>
                      <th className="p-8 text-[12px] font-black text-white uppercase tracking-[0.2em] text-right">Strategic Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                       {leads.map((lead, idx) => (
                         <tr key={idx} className="hover:bg-white/[0.05] transition-colors group">
                           <td className="p-8">
                             <div className="text-[18px] font-black text-white uppercase tracking-tight group-hover:text-orange-400 transition-colors">{lead.address}</div>
                             <div className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mt-2">ID: {lead.home_id}</div>
                           </td>
                           <td className="p-8">
                             <div className={`text-3xl font-black tracking-tighter ${lead.asset_grade?.startsWith('A') ? 'text-emerald-400' : 'text-orange-400'}`}>{lead.asset_grade}</div>
                           </td>
                           <td className="p-8">
                             <div className="text-[22px] font-black text-white tracking-tighter">${lead.rebate_amount.toLocaleString()}</div>
                           </td>
                           <td className="p-8 text-right">
                              <button onClick={() => setActiveOutreachLead(lead)} className="text-[11px] font-black text-white bg-orange-600/10 px-5 py-3 rounded-xl border-2 border-orange-500/30 hover:bg-orange-600 transition-all uppercase tracking-[0.2em]">AI Pitch</button>
                           </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
            </GlassCard>
          </div>
        )}
      </main>
    </div>
  );
};