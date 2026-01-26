
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
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Zap: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  ShieldCheck: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  Share: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Cpu: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>,
  Location: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
};

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'twin' | 'leads'>('twin');
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [prediction, setPrediction] = useState<SystemStrainPrediction | null>(null);
  const [certificate, setCertificate] = useState<EfficiencyCertificate | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  
  const [devices, setDevices] = useState<SeamDevice[]>([]);
  const [activeDevice, setActiveDevice] = useState<SeamDevice | null>(null);
  const [connectedProvider, setConnectedProvider] = useState<ProviderType | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const isDemoMode = !SEAM_API_KEY || SEAM_API_KEY.length < 5;

  const refreshLeads = useCallback(async () => {
    const data = await supabaseService.fetchLeads();
    setLeads(data);
  }, []);

  useEffect(() => {
    if (activeTab === 'leads') refreshLeads();
  }, [activeTab, refreshLeads]);

  useEffect(() => {
    if (isDemoMode) {
      const timer = setTimeout(() => {
         handleConnectProvider(ProviderType.HONEYWELL);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const initializeSession = async (provider: ProviderType, token: string) => {
    setConnectedProvider(provider);
    setIsConnecting(true);
    try {
      const discoveredDevices = await seamService.listDevices(token, provider);
      setDevices(discoveredDevices);
      if (discoveredDevices.length > 0) {
        const firstOnline = discoveredDevices.find(d => d.properties.online) || discoveredDevices[0];
        setActiveDevice(firstOnline);
        await loadDeviceData(firstOnline);
      }
    } catch (e) {
      console.error("Failed to init session", e);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectProvider = async (provider: ProviderType) => {
    setIsConnecting(true);
    await initializeSession(provider, SEAM_API_KEY || 'mock_token_123');
  };

  const loadDeviceData = async (device: SeamDevice) => {
    setIsConnecting(true);
    try {
      const newReadings = await seamService.getTelemetryHistory(device.device_id);
      setReadings(newReadings);
      setCertificate(null);
      const newPrediction = await supabaseService.generatePrediction(device.device_id, newReadings);
      setPrediction(newPrediction);
    } catch (error) {
      console.error("Data Load Error:", error);
    } finally {
      setIsConnecting(false);
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

  const currentTemp = readings.length > 0 ? readings[readings.length-1].indoorTemp.toFixed(1) : '--';

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-8 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
               <Icons.Cpu />
             </div>
             <div>
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">Ambient Twin <span className="text-orange-500">Pro</span></h1>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                  <Icons.Location />
                  Greater Toronto Operations
                </div>
             </div>
          </div>
        </div>

        <nav className="flex items-center gap-8 mt-6 lg:mt-0">
          <button 
            onClick={() => setActiveTab('twin')}
            className={`text-xs font-black uppercase tracking-[0.2em] transition-all relative py-2 ${activeTab === 'twin' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
          >
            System Twin
            {activeTab === 'twin' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('leads')}
            className={`text-xs font-black uppercase tracking-[0.2em] transition-all relative py-2 ${activeTab === 'leads' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
          >
            Pipeline
            {activeTab === 'leads' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full" />}
          </button>
          <div className="h-6 w-px bg-white/10 mx-2" />
          {activeDevice && (
            <button 
              onClick={handleSharePortal}
              className="px-6 py-3 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-xl"
            >
              {linkCopied ? 'Link Copied' : 'Share Homeowner Portal'}
            </button>
          )}
        </nav>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <aside className="lg:col-span-3 space-y-6">
           <GlassCard title="Managed Fleet" icon={<Icons.Activity />} className="p-0">
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                 {devices.map((d) => (
                    <button
                      key={d.device_id}
                      onClick={() => switchDevice(d)}
                      className={`w-full p-5 border-b border-white/5 text-left transition-all flex items-center justify-between group ${activeDevice?.device_id === d.device_id ? 'bg-orange-500/10 border-r-4 border-r-orange-500' : 'hover:bg-white/[0.02]'}`}
                    >
                       <div className="flex flex-col gap-1">
                          <span className="text-xs font-black text-white uppercase tracking-wider group-hover:text-orange-400 transition-colors">
                            {d.properties.name}
                          </span>
                          <span className="text-[9px] text-white/30 font-mono tracking-tighter">
                            MAC: {d.device_id.split('_').pop()?.toUpperCase() || 'UNKNOWN'}
                          </span>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                          <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${d.properties.online ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {d.properties.online ? 'Online' : 'Offline'}
                          </div>
                          <div className="flex gap-0.5 h-3 items-end">
                            {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8].map((v, i) => (
                              <div key={i} className="w-0.5 bg-white/20 rounded-full" style={{ height: `${v * 100}%` }} />
                            ))}
                          </div>
                       </div>
                    </button>
                 ))}
              </div>
           </GlassCard>

           <GlassCard variant="premium" className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">GTA Weather Sync</span>
                    <span className="text-[10px] font-bold text-orange-400">Toronto, ON</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-white">-2 Celsius</div>
                    <div className="text-xs text-white/60">Cloudy</div>
                 </div>
                 <p className="text-[10px] leading-relaxed text-white/40 italic">
                   Current outside temp indicates high heating load for Residential Zone 5 units.
                 </p>
              </div>
           </GlassCard>
        </aside>

        <main className="lg:col-span-9 space-y-8">
           {!activeDevice ? (
              <GlassCard className="flex flex-col items-center justify-center py-60 border-dashed border-2">
                 <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-orange-500 mb-6 animate-pulse border border-white/10">
                    <Icons.Cpu />
                 </div>
                 <h2 className="text-2xl font-black text-white uppercase tracking-[0.3em]">Initialize Fleet Trace</h2>
                 <p className="text-white/30 text-xs mt-2 uppercase tracking-widest font-bold">Select hardware to bridge digital twin</p>
              </GlassCard>
           ) : (
              <div className="space-y-8 animate-fade-in">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <GlassCard className="relative group overflow-hidden border-l-4 border-l-orange-500" variant="premium">
                       <div className="relative z-10 space-y-4">
                         <div className="text-orange-500 font-black uppercase tracking-widest text-[9px]">Real-time Telemetry</div>
                         <h2 className="text-3xl font-black text-white uppercase">{activeDevice.properties.name}</h2>
                         <div className="flex items-baseline gap-3">
                            <span className="text-5xl font-black text-white tracking-tighter">{currentTemp}deg</span>
                            <span className="text-white/20 text-xs font-bold uppercase tracking-widest">Celsius</span>
                         </div>
                       </div>
                    </GlassCard>
                    <div className="md:col-span-2">
                       <AISystemArchitect device={activeDevice} readings={readings} />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                       <GlassCard title="System Load & Efficiency Heartbeat" icon={<Icons.Activity />}>
                          <HeartbeatGraph data={readings} />
                       </GlassCard>
                    </div>
                    <div className="lg:col-span-4 space-y-8">
                       <GlassCard title="Predictive Triage" icon={<Icons.Zap />}>
                          <div className="space-y-6">
                             <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Strain Score</span>
                                <span className={`text-4xl font-black ${prediction?.strain_score && prediction.strain_score > 50 ? 'text-orange-500' : 'text-emerald-400'}`}>
                                  {prediction?.strain_score || '--'}%
                                </span>
                             </div>
                             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)] transition-all duration-1000" style={{ width: `${prediction?.strain_score || 0}%` }} />
                             </div>
                             <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                                {prediction?.recommendations.slice(0, 2).map((r, i) => (
                                  <div key={i} className="text-[10px] text-white/60 flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    {r}
                                  </div>
                                ))}
                             </div>
                          </div>
                       </GlassCard>
                       {certificate ? (
                          <EfficiencyCertificateCard certificate={certificate} onUpdate={setCertificate} />
                       ) : (
                          <GlassCard title="Web 3.0 Verification" icon={<Icons.ShieldCheck />} variant="premium">
                             <div className="space-y-4">
                                <p className="text-[10px] text-white/40 leading-relaxed uppercase font-bold tracking-widest">
                                  Secure asset hash for Enbridge HER+ rebate eligibility.
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
                                  className="w-full py-4 bg-orange-500 hover:bg-white hover:text-black rounded-lg text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-2xl"
                                >
                                  {isMinting ? 'Hashing Ledger...' : 'Authenticate Unit'}
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
