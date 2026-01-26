
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { HeartbeatGraph } from './HeartbeatGraph';
import { EfficiencyCertificateCard } from './EfficiencyCertificateCard';
import { AISystemArchitect } from './AISystemArchitect';
import { generateEfficiencyCertificate } from '../services/ledgerService';
import { seamService, SEAM_API_KEY } from '../services/seamService';
import { supabaseService, supabase } from '../services/supabaseService'; 
import { 
  SystemStrainPrediction, 
  EfficiencyCertificate, 
  ProviderType, 
  TelemetryReading,
  SeamDevice
} from '../types';

const Icons = {
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Zap: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  ShieldCheck: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Cpu: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>,
  Location: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Power: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>,
  Lock: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
};

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'twin' | 'leads'>('twin');
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [prediction, setPrediction] = useState<SystemStrainPrediction | null>(null);
  const [certificate, setCertificate] = useState<EfficiencyCertificate | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const [devices, setDevices] = useState<SeamDevice[]>([]);
  const [activeDevice, setActiveDevice] = useState<SeamDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    handleConnectProvider(ProviderType.HONEYWELL);
  }, []);

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

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  const handleSharePortal = () => {
    const mockHomeId = activeDevice ? `GTA-${activeDevice.device_id.slice(-6).toUpperCase()}` : "DEMO";
    const url = `${window.location.origin}/#portal/${mockHomeId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const currentReading = readings.length > 0 ? readings[readings.length-1] : null;

  return (
    <div className="max-w-[1500px] mx-auto space-y-6 animate-fade-in px-4 py-8">
      
      {/* ENTERPRISE HEADER */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-5 px-8 bg-[#161d2e] border border-white/5 rounded-lg shadow-2xl">
        <div className="flex items-center gap-5">
           <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
             <Icons.Cpu />
           </div>
           <div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase">Ambient Twin <span className="text-blue-400 font-light">Prod.</span></h1>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                   <Icons.Location />
                   Toronto HQ
                 </div>
                 <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                   <Icons.Lock />
                   Vault Active (Keys Hidden)
                 </div>
              </div>
           </div>
        </div>

        <nav className="flex items-center gap-8 mt-6 lg:mt-0">
          <button onClick={() => setActiveTab('twin')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative py-2 ${activeTab === 'twin' ? 'text-white border-b-2 border-blue-500' : 'text-white/40 hover:text-white/70'}`}>
            Operations
          </button>
          <button onClick={() => setActiveTab('leads')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative py-2 ${activeTab === 'leads' ? 'text-white border-b-2 border-blue-500' : 'text-white/40 hover:text-white/70'}`}>
            Rebate CRM
          </button>
          <div className="h-6 w-px bg-white/10" />
          <button 
              onClick={handleSharePortal}
              className="px-6 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-lg"
            >
              {linkCopied ? 'Token Copied' : 'Sync Portal'}
            </button>
          <button onClick={handleLogout} className="text-white/30 hover:text-red-400 transition-colors p-2">
            <Icons.Power />
          </button>
        </nav>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        <aside className="lg:col-span-3 space-y-6">
           <GlassCard title="Global Asset Inventory" icon={<Icons.Activity />} className="p-0 overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                 {isConnecting ? (
                   <div className="p-16 text-center space-y-4">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                   </div>
                 ) : (
                   devices.map((d) => (
                    <button
                      key={d.device_id}
                      onClick={() => { setActiveDevice(d); loadDeviceData(d); }}
                      className={`w-full p-5 border-b border-white/5 text-left transition-all flex items-center justify-between group ${activeDevice?.device_id === d.device_id ? 'bg-blue-600/10 border-l-[6px] border-l-blue-500' : 'hover:bg-white/[0.02]'}`}
                    >
                       <div>
                          <span className="block text-[12px] font-bold text-white tracking-wide">{d.properties.name}</span>
                          <span className="text-[9px] text-white/20 font-mono tracking-tighter uppercase">{d.device_id.slice(-12)}</span>
                       </div>
                       <div className={`px-2 py-0.5 rounded-[2px] text-[8px] font-black uppercase tracking-tighter ${d.properties.online ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                         {d.properties.online ? 'Synced' : 'Critical'}
                       </div>
                    </button>
                   ))
                 )}
              </div>
           </GlassCard>

           <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Regional Flux</span>
                 <span className="text-[10px] font-bold text-blue-400">Toronto, ON</span>
              </div>
              <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-black text-white">-2°C</span>
                 <span className="text-[10px] text-blue-400/60 font-black uppercase">Frost Point</span>
              </div>
           </div>
        </aside>

        <main className="lg:col-span-9 space-y-6">
           {!activeDevice ? (
              <GlassCard className="flex flex-col items-center justify-center py-64 bg-white/[0.01]">
                 <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-white/10 mb-6 animate-pulse">
                    <Icons.Cpu />
                 </div>
                 <h2 className="text-sm font-black text-white/20 uppercase tracking-[0.5em]">Awaiting Uplink</h2>
              </GlassCard>
           ) : (
              <div className="space-y-6 animate-fade-in">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard className="border-l-4 border-l-blue-500 shadow-xl">
                       <div className="space-y-6">
                         <div className="text-blue-400 font-black uppercase tracking-[0.3em] text-[10px]">Active Telemetry</div>
                         <h2 className="text-2xl font-black text-white truncate tracking-tight">{activeDevice.properties.name}</h2>
                         <div className="flex items-baseline gap-3">
                            <span className="text-6xl font-black text-white tracking-tighter">{currentReading?.indoorTemp.toFixed(1) || '--'}°</span>
                            <span className="text-white/20 text-xs font-black uppercase tracking-[0.2em]">Celsius</span>
                         </div>
                       </div>
                    </GlassCard>
                    <div className="md:col-span-2">
                       <AISystemArchitect device={activeDevice} readings={readings} />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8">
                       <GlassCard title="Spectral Analysis Curve" icon={<Icons.Activity />}>
                          <HeartbeatGraph data={readings} />
                       </GlassCard>
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                       <GlassCard title="Predictive Triage Engine" icon={<Icons.Zap />}>
                          <div className="space-y-6">
                             <div className="flex justify-between items-end">
                                <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Mechanical Strain</span>
                                <span className={`text-4xl font-black tracking-tighter ${prediction?.strain_score && prediction.strain_score > 50 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                  {prediction?.strain_score || '--'}%
                                </span>
                             </div>
                             <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${prediction?.strain_score || 0}%` }} />
                             </div>
                             <div className="pt-2 flex flex-col gap-3">
                                {prediction?.recommendations.slice(0, 2).map((r, i) => (
                                  <div key={i} className="text-[11px] text-white/60 leading-relaxed flex items-start gap-4 bg-white/[0.03] p-3 rounded border border-white/5">
                                    <div className="mt-1 text-emerald-400"><Icons.Check /></div>
                                    {r}
                                  </div>
                                ))}
                             </div>
                          </div>
                       </GlassCard>

                       {certificate ? (
                          <EfficiencyCertificateCard certificate={certificate} onUpdate={setCertificate} />
                       ) : (
                          <GlassCard title="Ledger Verification" icon={<Icons.ShieldCheck />} variant="mica">
                             <div className="space-y-5">
                                <p className="text-[11px] text-white/40 leading-relaxed uppercase font-black tracking-[0.2em]">
                                  Generate immutable asset hash for Enbridge HER+ compliance.
                                </p>
                                <button 
                                  onClick={() => {
                                     if (!activeDevice || !prediction) return;
                                     setIsMinting(true);
                                     generateEfficiencyCertificate(activeDevice.device_id, prediction).then(cert => {
                                        setCertificate(cert);
                                        setIsMinting(false);
                                     }).catch(() => setIsMinting(false));
                                  }}
                                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-xl active:scale-[0.98]"
                                >
                                  {isMinting ? 'Hashing Node...' : 'Mint Certificate'}
                                </button>
                             </div>
                          </GlassCard>
                       )}
                    </div>
                 </div>
              </div>
           )}
        </main>
      </div>
    </div>
  );
};
