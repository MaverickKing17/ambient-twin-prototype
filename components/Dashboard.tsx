
import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from './GlassCard';
import { HeartbeatGraph } from './HeartbeatGraph';
import { EfficiencyCertificateCard } from './EfficiencyCertificateCard';
import { AISystemArchitect } from './AISystemArchitect';
import { generateEfficiencyCertificate } from '../services/ledgerService';
import { seamService, SEAM_API_KEY } from '../services/seamService';
import { supabaseService } from '../services/supabaseService'; 
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
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Cpu: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>,
  Location: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Signal: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 20V4"/></svg>
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

  const isDemoMode = !SEAM_API_KEY || SEAM_API_KEY.length < 5;

  useEffect(() => {
    if (isDemoMode) {
      const timer = setTimeout(() => handleConnectProvider(ProviderType.HONEYWELL), 600);
      return () => clearTimeout(timer);
    }
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

  const switchDevice = (device: SeamDevice) => {
    setActiveDevice(device);
    loadDeviceData(device);
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
    <div className="max-w-[1500px] mx-auto space-y-6 animate-fade-in px-4">
      
      {/* CORPORATE NAV BAR */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-4 px-6 bg-[#161d2e] border border-white/5 rounded-lg shadow-xl">
        <div className="flex items-center gap-4">
           <div className="h-9 w-9 rounded bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
             <Icons.Cpu />
           </div>
           <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Ambient Twin <span className="text-blue-400 font-light">Enterprise</span></h1>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                <Icons.Location />
                GTA Operational Hub
              </div>
           </div>
        </div>

        <nav className="flex items-center gap-8 mt-6 lg:mt-0">
          <button onClick={() => setActiveTab('twin')} className={`text-[11px] font-bold uppercase tracking-widest transition-all relative py-2 ${activeTab === 'twin' ? 'text-white border-b-2 border-blue-500' : 'text-white/40 hover:text-white/70'}`}>
            Operations
          </button>
          <button onClick={() => setActiveTab('leads')} className={`text-[11px] font-bold uppercase tracking-widest transition-all relative py-2 ${activeTab === 'leads' ? 'text-white border-b-2 border-blue-500' : 'text-white/40 hover:text-white/70'}`}>
            CRM & Rebates
          </button>
          <div className="h-5 w-px bg-white/10" />
          {activeDevice && (
            <button 
              onClick={handleSharePortal}
              className="px-5 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white transition-all"
            >
              {linkCopied ? 'Link Copied' : 'Share Portal'}
            </button>
          )}
        </nav>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ASSET SELECTOR SIDEBAR */}
        <aside className="lg:col-span-3 space-y-6">
           <GlassCard title="Fleet Hierarchy" icon={<Icons.Activity />} className="p-0">
              <div className="max-h-[550px] overflow-y-auto">
                 {isConnecting ? (
                   <div className="p-10 text-center space-y-3">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Initializing...</div>
                   </div>
                 ) : (
                   devices.map((d) => (
                    <button
                      key={d.device_id}
                      onClick={() => switchDevice(d)}
                      className={`w-full p-4 border-b border-white/5 text-left transition-all flex items-center justify-between group ${activeDevice?.device_id === d.device_id ? 'bg-blue-500/10 border-l-4 border-l-blue-500' : 'hover:bg-white/[0.01]'}`}
                    >
                       <div>
                          <span className="block text-[11px] font-bold text-white tracking-wide">{d.properties.name}</span>
                          <span className="text-[9px] text-white/20 font-mono">ID: {d.device_id.slice(-6).toUpperCase()}</span>
                       </div>
                       <div className="flex flex-col items-end gap-1.5">
                          <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${d.properties.online ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {d.properties.online ? 'Online' : 'Signal Lost'}
                          </div>
                          <Icons.Signal />
                       </div>
                    </button>
                   ))
                 )}
              </div>
           </GlassCard>

           <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Climate Aware</span>
                 <span className="text-[10px] font-bold text-blue-400">Toronto, ON</span>
              </div>
              <div className="flex items-baseline gap-2">
                 <span className="text-2xl font-bold text-white">-2°C</span>
                 <span className="text-[10px] text-white/40 font-medium">Overcast</span>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-white/40 italic">
                HVAC loads adjusting for regional thermal humidity fluctuations.
              </p>
           </div>
        </aside>

        {/* DATA COMMAND VIEW */}
        <main className="lg:col-span-9 space-y-6">
           {!activeDevice ? (
              <GlassCard className="flex flex-col items-center justify-center py-52 bg-white/[0.01]">
                 <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 mb-4 animate-pulse">
                    <Icons.Cpu />
                 </div>
                 <h2 className="text-sm font-bold text-white/40 uppercase tracking-[0.3em]">Awaiting Asset Selection</h2>
              </GlassCard>
           ) : (
              <div className="space-y-6 animate-fade-in">
                 
                 {/* PRIMARY STATS */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard className="border-l-4 border-l-blue-500">
                       <div className="space-y-4">
                         <div className="text-white/40 font-bold uppercase tracking-widest text-[9px]">Live Telemetry</div>
                         <h2 className="text-xl font-bold text-white truncate">{activeDevice.properties.name}</h2>
                         <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white tracking-tighter">{currentReading?.indoorTemp.toFixed(1) || '--'}°</span>
                            <span className="text-white/20 text-xs font-bold uppercase tracking-widest">Celsius</span>
                         </div>
                       </div>
                    </GlassCard>
                    <div className="md:col-span-2">
                       <AISystemArchitect device={activeDevice} readings={readings} />
                    </div>
                 </div>

                 {/* VISUALS */}
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8">
                       <GlassCard title="Telemetry Flux Analysis" icon={<Icons.Activity />}>
                          <HeartbeatGraph data={readings} />
                       </GlassCard>
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                       <GlassCard title="Predictive Triage" icon={<Icons.Zap />}>
                          <div className="space-y-5">
                             <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Strain Score</span>
                                <span className={`text-3xl font-bold ${prediction?.strain_score && prediction.strain_score > 50 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                  {prediction?.strain_score || '--'}%
                                </span>
                             </div>
                             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${prediction?.strain_score || 0}%` }} />
                             </div>
                             <div className="pt-2 flex flex-col gap-2">
                                {prediction?.recommendations.slice(0, 2).map((r, i) => (
                                  <div key={i} className="text-[10px] text-white/60 flex items-start gap-3 bg-white/[0.02] p-2 rounded">
                                    <div className="mt-0.5"><Icons.Check /></div>
                                    {r}
                                  </div>
                                ))}
                             </div>
                          </div>
                       </GlassCard>

                       {certificate ? (
                          <EfficiencyCertificateCard certificate={certificate} onUpdate={setCertificate} />
                       ) : (
                          <GlassCard title="Certification Engine" icon={<Icons.ShieldCheck />} variant="mica">
                             <div className="space-y-4">
                                <p className="text-[10px] text-white/40 leading-relaxed uppercase font-bold tracking-widest">
                                  Bridge hardware profile to Enbridge rebate ledger.
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
                                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded text-[10px] font-bold uppercase tracking-widest text-white transition-all shadow-xl"
                                >
                                  {isMinting ? 'Validating Hash...' : 'Mint Efficiency Unit'}
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