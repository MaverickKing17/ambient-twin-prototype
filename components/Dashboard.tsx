
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
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
};

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'twin' | 'leads'>('twin');
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [prediction, setPrediction] = useState<SystemStrainPrediction | null>(null);
  const [certificate, setCertificate] = useState<EfficiencyCertificate | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  
  // Magic Link Generator State
  const [newLeadAddress, setNewLeadAddress] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  // Connection State
  const [connectedProvider, setConnectedProvider] = useState<ProviderType | null>(null);
  const [activeDevice, setActiveDevice] = useState<SeamDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const isDemoMode = !SEAM_API_KEY || SEAM_API_KEY.length < 5;

  const refreshLeads = useCallback(async () => {
    const data = await supabaseService.fetchLeads();
    setLeads(data);
  }, []);

  useEffect(() => {
    if (activeTab === 'leads') refreshLeads();
  }, [activeTab, refreshLeads]);

  const initializeSession = async (provider: ProviderType, token: string) => {
    setConnectedProvider(provider);
    setIsConnecting(true);
    try {
      const devices = await seamService.listDevices(token, provider);
      if (devices.length > 0) {
        setActiveDevice(devices[0]);
        await loadDeviceData(devices[0]);
      }
    } catch (e) {
      console.error("Failed to init session", e);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectProvider = async (provider: ProviderType) => {
    setIsConnecting(true);
    // If it's a real connect, usually we'd launch a webview, but here we'll simulate if no real key
    await initializeSession(provider, SEAM_API_KEY || 'mock_token_123');
  };

  const loadDeviceData = async (device: SeamDevice) => {
    try {
      const newReadings = await seamService.getTelemetryHistory(device.device_id);
      setReadings(newReadings);
      setCertificate(null);
      const newPrediction = await supabaseService.generatePrediction(device.device_id, newReadings);
      setPrediction(newPrediction);
    } catch (error) {
      console.error("Data Load Error:", error);
    }
  };

  const updateStatus = async (address: string, newStatus: SalesLead['status']) => {
    const success = await supabaseService.updateLeadStatus(address, newStatus);
    if (success) refreshLeads();
  };

  const handleGenerateMagicLink = () => {
    if (!newLeadAddress) return;
    const mockId = Math.random().toString(36).substring(7).toUpperCase();
    const url = `${window.location.origin}/#portal/${mockId}`;
    setGeneratedLink(url);
  };

  const handleSharePortal = () => {
    const mockHomeId = activeDevice ? `HOME-${activeDevice.device_id.substr(0,4).toUpperCase()}` : "DEMO";
    const url = `${window.location.origin}/#portal/${mockHomeId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  // Fix: Implemented handleMintCertificate to resolve the missing name error
  const handleMintCertificate = async () => {
    if (!activeDevice || !prediction) return;
    setIsMinting(true);
    try {
      const cert = await generateEfficiencyCertificate(activeDevice.device_id, prediction);
      setCertificate(cert);
    } catch (error) {
      console.error("Minting Error:", error);
    } finally {
      setIsMinting(false);
    }
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
               {isDemoMode ? 'Sandbox Environment' : 'Production Active'}
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

        {activeTab === 'twin' && (
          <div className="flex items-center gap-3">
            {!connectedProvider ? (
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => handleConnectProvider(ProviderType.HONEYWELL)}
                  className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold uppercase transition-all shadow-lg shadow-orange-900/20"
                >
                  Connect Honeywell
                </button>
                <button 
                  onClick={() => handleConnectProvider(ProviderType.ECOBEE)}
                  className="px-4 py-2 rounded bg-white/5 border border-white/20 hover:bg-white/10 text-white text-[10px] font-bold uppercase transition-all"
                >
                  Connect Ecobee
                </button>
              </div>
            ) : (
              <button 
                onClick={handleSharePortal}
                className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold uppercase flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20"
              >
                <Icons.Share />
                {linkCopied ? 'Link Copied!' : 'Copy Portal Link'}
              </button>
            )}
          </div>
        )}
      </header>

      {activeTab === 'leads' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Magic Link Generator Tool */}
          <div className="lg:col-span-1">
            <GlassCard title="Magic Link Generator" icon={<Icons.Zap />}>
              <div className="space-y-4">
                <p className="text-xs text-white/50 leading-relaxed">
                  Enter an address from your leads list to generate a personalized Ambient Twin portal link.
                </p>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase mb-1 block">Property Address</label>
                  <input 
                    type="text" 
                    value={newLeadAddress}
                    onChange={(e) => setNewLeadAddress(e.target.value)}
                    placeholder="e.g. 742 Evergreen Terrace"
                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm text-white focus:border-orange-500 outline-none"
                  />
                </div>
                <button 
                  onClick={handleGenerateMagicLink}
                  className="w-full py-2 bg-orange-500 hover:bg-orange-600 rounded text-[10px] font-bold uppercase text-white transition-all"
                >
                  Generate Portal Link
                </button>

                {generatedLink && (
                  <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded animate-fade-in">
                    <label className="text-[9px] font-bold text-emerald-400 uppercase block mb-1">Generated Link</label>
                    <div className="flex gap-2">
                      <input readOnly value={generatedLink} className="bg-transparent text-[10px] text-white/80 w-full outline-none" />
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedLink);
                          alert('Link copied for your email campaign!');
                        }}
                        className="text-emerald-400 hover:text-white"
                      >
                        <Icons.Copy />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Leads CRM Table */}
          <div className="lg:col-span-2">
            <GlassCard title="Active Leads CRM" icon={<Icons.Users />}>
              {leads.length === 0 ? (
                <div className="py-20 text-center text-white/20 uppercase tracking-widest text-xs">No leads captured yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/5">
                        <th className="py-4 px-4 font-bold">Lead Address</th>
                        <th className="py-4 px-4 font-bold">Est. Rebate</th>
                        <th className="py-4 px-4 font-bold">Status</th>
                        <th className="py-4 px-4 font-bold text-right">CRM Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {leads.map((lead, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 text-white font-medium">{lead.address}</td>
                          <td className="py-4 px-4 text-orange-400 font-bold">${lead.rebate_amount.toLocaleString()}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase border 
                              ${lead.status === 'new' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                                lead.status === 'contacted' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 
                                'bg-white/10 border-white/20 text-white/60'}`}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right space-x-2">
                            {lead.status === 'new' && (
                              <button 
                                onClick={() => updateStatus(lead.address, 'contacted')}
                                className="text-[10px] font-bold text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-500 transition-all"
                              >
                                Mark Contacted
                              </button>
                            )}
                            {lead.status === 'contacted' && (
                              <button 
                                onClick={() => updateStatus(lead.address, 'closed')}
                                className="text-[10px] font-bold text-white bg-emerald-600 px-3 py-1 rounded hover:bg-emerald-500 transition-all"
                              >
                                Mark Closed
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      ) : (
        /* Digital Twin Content */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {!connectedProvider ? (
            <div className="lg:col-span-3 flex items-center justify-center h-[400px]">
              <GlassCard className="text-center p-12 max-w-md">
                <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-orange-400 mb-4 animate-pulse">
                  <Icons.Link />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Awaiting Device Sync</h2>
                <p className="text-white/70 mb-6 font-light">
                  Choose a thermostat brand to launch a virtual digital twin and begin performance stress tests.
                </p>
              </GlassCard>
            </div>
          ) : (
            <>
              <div className="space-y-6 lg:col-span-1">
                <GlassCard className="border-t-4 border-t-orange-500">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-orange-400 font-bold uppercase tracking-wider text-xs">AI Rebate Analysis</div>
                    <div>
                      <span className="text-4xl font-bold text-white">$12,000</span>
                      <span className="text-white/50 ml-2 font-light">Max Reward</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Sync complete. This unit is operating at high strain, qualifying for Tier 1 efficiency incentives.
                    </p>
                  </div>
                </GlassCard>
                <div className="grid grid-cols-2 gap-4">
                  <GlassCard className="text-center py-6">
                    <div className="text-[10px] text-white/40 uppercase mb-1 font-bold">Indoor Temp</div>
                    <div className="text-xl font-bold text-white">{currentTemp}°C</div>
                  </GlassCard>
                  <GlassCard className="text-center py-6">
                    <div className="text-[10px] text-white/40 uppercase mb-1 font-bold">Strain Score</div>
                    <div className="text-xl font-bold text-orange-400">{prediction?.strain_score || '--'}</div>
                  </GlassCard>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <GlassCard title="Telemetry Heartbeat" icon={<Icons.Activity />}>
                  <HeartbeatGraph data={readings} />
                </GlassCard>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard title="ML System Diagnosis" icon={<Icons.Zap />}>
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
                    <GlassCard title="Digital Trust Mint" icon={<Icons.ShieldCheck />}>
                      <button onClick={handleMintCertificate} className="w-full py-4 bg-orange-500 hover:bg-orange-600 rounded text-sm font-bold transition-all shadow-lg shadow-orange-900/30">
                        {isMinting ? 'Minting Blockchain ID...' : 'Verify Asset on Ledger'}
                      </button>
                    </GlassCard>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
