
import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from './GlassCard';
import { HeartbeatGraph } from './HeartbeatGraph';
import { EfficiencyCertificateCard } from './EfficiencyCertificateCard';
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
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Zap: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Award: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  ShieldCheck: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  Link: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Share: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Terminal: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  Cpu: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>
};

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'twin' | 'leads'>('twin');
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [prediction, setPrediction] = useState<SystemStrainPrediction | null>(null);
  const [certificate, setCertificate] = useState<EfficiencyCertificate | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  
  // Fleet State
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

  // If we already have a key or we're in demo mode, auto-fetch to make it feel seamless
  useEffect(() => {
    if (isDemoMode) {
      // Small delay to feel like a real scan
      setTimeout(() => {
         handleConnectProvider(ProviderType.HONEYWELL);
      }, 1000);
    }
  }, []);

  const initializeSession = async (provider: ProviderType, token: string) => {
    setConnectedProvider(provider);
    setIsConnecting(true);
    try {
      const discoveredDevices = await seamService.listDevices(token, provider);
      setDevices(discoveredDevices);
      if (discoveredDevices.length > 0) {
        // Automatically pick the first online device if possible
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

  const updateStatus = async (address: string, newStatus: SalesLead['status']) => {
    const success = await supabaseService.updateLeadStatus(address, newStatus);
    if (success) refreshLeads();
  };

  const currentTemp = readings.length > 0 ? readings[readings.length-1].indoorTemp.toFixed(1) : '--';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-semibold text-white tracking-tight">
               Ambient Command Center
             </h1>
             <span className={`px-2 py-0.5 rounded text-[10px] border font-bold uppercase tracking-wider ${isDemoMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
               {isDemoMode ? 'Fleet Sync Success' : 'Production Active'}
             </span>
          </div>
          
          <nav className="flex items-center gap-4 mt-4">
            <button 
              onClick={() => setActiveTab('twin')}
              className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'twin' ? 'border-orange-500 text-white' : 'border-transparent text-white/40 hover:text-white/60'}`}
            >
              System Analytics
            </button>
            <button 
              onClick={() => setActiveTab('leads')}
              className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-all flex items-center gap-2 ${activeTab === 'leads' ? 'border-orange-500 text-white' : 'border-transparent text-white/40 hover:text-white/60'}`}
            >
              HVAC Sales Pipeline
              {leads.length > 0 && <span className="bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">{leads.filter(l => l.status === 'new').length}</span>}
            </button>
          </nav>
        </div>
      </header>

      {activeTab === 'leads' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CRM UI remains same */}
          <div className="lg:col-span-1">
             <GlassCard title="Magic Link Generator" icon={<Icons.Zap />}>
                <div className="py-4 text-center text-white/40 text-xs">Generating secure portal links...</div>
             </GlassCard>
          </div>
          <div className="lg:col-span-2">
            <GlassCard title="Active Leads CRM" icon={<Icons.Users />}>
               <div className="py-20 text-center text-white/20 uppercase tracking-widest text-xs">Awaiting data sync...</div>
            </GlassCard>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: FLEET LIST */}
          <div className="lg:col-span-3 space-y-4">
             <GlassCard title="Honeywell Fleet" icon={<Icons.Cpu />}>
                <div className="space-y-2">
                   {devices.map((d) => (
                      <button
                        key={d.device_id}
                        onClick={() => switchDevice(d)}
                        className={`w-full p-3 rounded text-left transition-all border flex items-center justify-between group ${activeDevice?.device_id === d.device_id ? 'bg-orange-500/20 border-orange-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                      >
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">{d.properties.name}</span>
                            <span className="text-[9px] text-white/40 font-mono">{d.device_id.substring(0,12)}</span>
                         </div>
                         <div className={`w-2 h-2 rounded-full ${d.properties.online ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                      </button>
                   ))}
                   {devices.length === 0 && !isConnecting && (
                      <div className="py-8 text-center text-white/20 text-[10px] uppercase font-bold tracking-widest">No devices detected</div>
                   )}
                   {isConnecting && (
                      <div className="py-8 flex flex-col items-center gap-2">
                         <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                         <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Scanning...</span>
                      </div>
                   )}
                </div>
             </GlassCard>

             <GlassCard className="bg-gradient-to-br from-orange-500/10 to-transparent">
                <div className="flex items-start gap-3">
                   <div className="text-orange-400 mt-1"><Icons.Info /></div>
                   <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Fleet Summary</h4>
                      <p className="text-[10px] text-white/60 leading-normal">
                         Currently managing <span className="text-white font-bold">{devices.length} assets</span>. 
                         <span className="text-emerald-400 font-bold ml-1">{devices.filter(d => d.properties.online).length} online</span>.
                      </p>
                   </div>
                </div>
             </GlassCard>
          </div>

          {/* RIGHT COLUMN: ACTIVE TWIN DETAIL */}
          <div className="lg:col-span-9 space-y-6">
             {!activeDevice ? (
                <GlassCard className="flex flex-col items-center justify-center py-40">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-orange-400 mb-4 animate-pulse">
                      <Icons.Activity />
                   </div>
                   <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Select an Asset</h2>
                   <p className="text-white/40 text-xs">Initialize Digital Twin telemetry by selecting a device from your fleet.</p>
                </GlassCard>
             ) : (
                <>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <GlassCard className="border-t-4 border-t-orange-500 md:col-span-1">
                         <div className="space-y-3">
                           <div className="text-orange-400 font-bold uppercase tracking-widest text-[10px]">Active Digital Twin</div>
                           <h2 className="text-2xl font-bold text-white">{activeDevice.properties.name}</h2>
                           <div className="flex items-center gap-2">
                              <span className="text-4xl font-bold text-white">{currentTemp}°C</span>
                              <span className="text-white/30 text-xs uppercase tracking-tighter">Current Temp</span>
                           </div>
                         </div>
                      </GlassCard>
                      
                      <GlassCard className="md:col-span-2">
                         <div className="grid grid-cols-2 gap-4 h-full">
                            <div className="flex flex-col justify-center border-r border-white/5">
                               <span className="text-[10px] text-white/40 uppercase font-bold mb-1">System Strain</span>
                               <span className={`text-3xl font-bold ${prediction?.strain_score && prediction.strain_score > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                                  {prediction?.strain_score || '--'}/100
                               </span>
                            </div>
                            <div className="flex flex-col justify-center">
                               <span className="text-[10px] text-white/40 uppercase font-bold mb-1">Risk Assessment</span>
                               <span className={`text-lg font-bold uppercase tracking-wider ${prediction?.failure_risk === 'CRITICAL' ? 'text-red-500' : 'text-white'}`}>
                                  {prediction?.failure_risk || 'CALCULATING'}
                               </span>
                            </div>
                         </div>
                      </GlassCard>
                   </div>

                   <GlassCard title="Telemetry Heartbeat" icon={<Icons.Activity />}>
                      <HeartbeatGraph data={readings} />
                   </GlassCard>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <GlassCard title="Machine Learning Insights" icon={<Icons.Zap />}>
                         <div className="space-y-3">
                            {prediction?.recommendations.map((r, i) => (
                              <div key={i} className="text-[11px] text-white/80 border-l-2 border-orange-500 pl-3 py-2 bg-white/5 flex items-center gap-2">
                                <Icons.Check />
                                {r}
                              </div>
                            ))}
                         </div>
                      </GlassCard>

                      {certificate ? (
                        <EfficiencyCertificateCard certificate={certificate} onUpdate={setCertificate} />
                      ) : (
                        <GlassCard title="Asset Trust Verification" icon={<Icons.ShieldCheck />}>
                          <div className="space-y-4">
                             <p className="text-xs text-white/50 leading-relaxed italic">
                               Verify this specific hardware signature on the public ledger to lock in Enbridge rebate eligibility.
                             </p>
                             <button 
                               onClick={() => {
                                  setIsMinting(true);
                                  setTimeout(() => {
                                     generateEfficiencyCertificate(activeDevice.device_id, prediction!).then(cert => {
                                        setCertificate(cert);
                                        setIsMinting(false);
                                     });
                                  }, 1500);
                               }}
                               className="w-full py-4 bg-orange-500 hover:bg-orange-600 rounded text-xs font-bold uppercase tracking-widest text-white transition-all shadow-lg shadow-orange-900/30"
                             >
                               {isMinting ? 'Authenticating Asset...' : 'Mint Efficiency ID'}
                             </button>
                          </div>
                        </GlassCard>
                      )}
                   </div>
                </>
             )}
          </div>

        </div>
      )}
    </div>
  );
};
