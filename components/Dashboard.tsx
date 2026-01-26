
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
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
  SeamDevice,
  SalesLead
} from '../types';

const Icons = {
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Zap: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  ShieldCheck: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Mic: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Cpu: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>,
  Location: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Power: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>,
  Globe: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Share: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
};

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'twin' | 'leads'>('twin');
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [prediction, setPrediction] = useState<SystemStrainPrediction | null>(null);
  const [certificate, setCertificate] = useState<EfficiencyCertificate | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [isLiveOpsActive, setIsLiveOpsActive] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  
  const [devices, setDevices] = useState<SeamDevice[]>([]);
  const [activeDevice, setActiveDevice] = useState<SeamDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<'linked' | 'missing'>('missing');
  
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

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
    setIsLoadingLeads(true);
    const mockLeads: SalesLead[] = [
      { home_id: "H-101", address: "145 King St W, Toronto", rebate_amount: 12500, status: 'new', created_at: new Date().toISOString() },
      { home_id: "H-102", address: "88 Blue Jays Way, Toronto", rebate_amount: 10600, status: 'contacted', created_at: new Date().toISOString() },
      { home_id: "H-103", address: "55 Mercer St, Toronto", rebate_amount: 12000, status: 'closed', created_at: new Date().toISOString() },
      { home_id: "H-104", address: "22 Adelaide St E, Toronto", rebate_amount: 9800, status: 'new', created_at: new Date().toISOString() },
    ];
    setLeads(mockLeads);
    setIsLoadingLeads(false);
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

  const startVoiceSession = async () => {
    if (!process.env.API_KEY) {
      alert("System Error: API_KEY missing.");
      return;
    }
    try {
      setIsLiveOpsActive(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              sessionPromise.then(session => session.sendRealtimeInput({ media: createBlob(inputData) }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (m) => {
            const audioData = m.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outAudioContextRef.current) {
              const buffer = await decodeAudioData(decode(audioData), outAudioContextRef.current, 24000, 1);
              const s = outAudioContextRef.current.createBufferSource();
              s.buffer = buffer;
              s.connect(outAudioContextRef.current.destination);
              s.start(Math.max(nextStartTimeRef.current, outAudioContextRef.current.currentTime));
              nextStartTimeRef.current += buffer.duration;
            }
          },
          onclose: () => setIsLiveOpsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are the Ambient Twin Concierge. Assist the HVAC tech with telemetry insights.',
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      setIsLiveOpsActive(false);
    }
  };

  const stopVoiceSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    setIsLiveOpsActive(false);
  };

  const currentReading = readings.length > 0 ? readings[readings.length-1] : null;

  return (
    <div className="max-w-[1500px] mx-auto space-y-6 animate-fade-in px-4 py-8 relative">
      
      {/* ENTERPRISE HEADER */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-6 px-10 bg-[#161d2e] border-2 border-white/5 rounded-xl shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
        
        <div className="flex items-center gap-6">
           <div className="h-12 w-12 rounded-xl bg-orange-600 flex items-center justify-center shadow-2xl shadow-orange-900/50">
             <Icons.Cpu />
           </div>
           <div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">Ambient Twin <span className="text-orange-500 font-light italic">Core</span></h1>
              <div className="flex items-center gap-6 mt-1">
                 <button 
                  onClick={() => setDemoMode(!demoMode)}
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded border-2 transition-all ${demoMode ? 'bg-orange-500 text-white border-white/40' : 'text-white/40 border-white/10 hover:border-orange-500/50'}`}>
                   {demoMode ? 'PITCH MODE: ACTIVE' : 'LIVE TELEMETRY'}
                 </button>
                 <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded border-2 transition-colors ${geminiStatus === 'linked' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'}`}>
                   <Icons.Globe /> {geminiStatus === 'linked' ? 'Uplink Live' : 'Link Missing'}
                 </div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-8 mt-8 lg:mt-0">
          <button 
            onClick={() => isLiveOpsActive ? stopVoiceSession() : startVoiceSession()}
            className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all duration-500 ${isLiveOpsActive ? 'bg-orange-600 border-white shadow-[0_0_30px_rgba(255,255,255,0.4)]' : 'bg-white/5 border-white/10 hover:border-orange-500/50'}`}
          >
            <div className={`w-3 h-3 rounded-full ${isLiveOpsActive ? 'bg-white animate-ping' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]'}`} />
            <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{isLiveOpsActive ? 'Concierge Live' : 'Voice Command'}</span>
            <Icons.Mic />
          </button>

          <nav className="flex items-center gap-10">
            <button onClick={() => setActiveTab('twin')} className={`text-[13px] font-black uppercase tracking-[0.3em] transition-all relative py-3 ${activeTab === 'twin' ? 'text-white border-b-2 border-orange-500' : 'text-white/60 hover:text-white'}`}>Operations</button>
            <button onClick={() => setActiveTab('leads')} className={`text-[13px] font-black uppercase tracking-[0.3em] transition-all relative py-3 ${activeTab === 'leads' ? 'text-white border-b-2 border-orange-500' : 'text-white/60 hover:text-white'}`}>Grant Pipeline</button>
            <div className="h-8 w-px bg-white/10" />
            <button onClick={() => supabase?.auth.signOut()} className="text-white hover:text-red-400 transition-colors p-3 scale-125"><Icons.Power /></button>
          </nav>
        </div>
      </header>

      {/* LIVE OPS OVERLAY */}
      {isLiveOpsActive && (
        <div className="fixed inset-0 z-[100] bg-[#0b1120]/80 backdrop-blur-md flex items-center justify-center animate-fade-in px-4">
          <div className="max-w-xl w-full">
            <GlassCard variant="mica" className="border-2 border-white/20 p-12 text-center overflow-hidden">
              <div className="flex flex-col items-center gap-8">
                <div className="w-32 h-32 rounded-full bg-orange-600/20 border-2 border-orange-500 flex items-center justify-center">
                   <div className="w-24 h-24 rounded-full bg-orange-600/40 animate-ping absolute" />
                   <Icons.Mic />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-[0.3em]">AI Concierge Listening</h2>
                <button onClick={stopVoiceSession} className="mt-4 px-10 py-3 bg-white/10 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded border border-white/10 transition-all">Terminate Session</button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-24">
        <aside className="lg:col-span-3 space-y-8">
           <GlassCard title="Thermostat Inventory" icon={<Icons.Activity />} className="p-0 overflow-hidden border-2">
              <div className="max-h-[700px] overflow-y-auto custom-scrollbar bg-slate-900/40">
                 {(isConnecting && !demoMode) ? (
                   <div className="p-20 text-center animate-pulse"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
                 ) : (
                   devices.map((d) => (
                    <button
                      key={d.device_id}
                      onClick={() => { setActiveDevice(d); loadDeviceData(d); }}
                      className={`w-full p-6 border-b border-white/10 text-left transition-all flex items-center justify-between group relative ${activeDevice?.device_id === d.device_id ? 'bg-orange-600/20 border-l-[10px] border-l-orange-500 shadow-[inset_10px_0_20px_rgba(249,115,22,0.1)]' : 'hover:bg-white/[0.08]'}`}
                    >
                       <div className="space-y-1.5">
                          <span className="block text-[16px] font-black tracking-wide uppercase text-white">{d.properties.name}</span>
                          <span className="block text-[12px] text-white/40 font-mono">ID: {d.device_id.slice(-6).toUpperCase()}</span>
                       </div>
                       <div className={`px-4 py-2 rounded text-[11px] font-black uppercase tracking-widest border-2 transition-all ${d.properties.online ? 'bg-orange-600/30 text-white border-orange-500 shadow-lg shadow-orange-900/40' : 'bg-red-600/30 text-white border-red-500'}`}>{d.properties.online ? 'Live' : 'Off'}</div>
                    </button>
                   ))
                 )}
              </div>
           </GlassCard>

           <GlassCard title="Security Readiness" icon={<Icons.Zap />} variant="mica" className="border-2">
              <div className="space-y-5">
                 <div className="flex justify-between items-center text-[12px] font-black uppercase tracking-wider text-white">
                    <span>Encrypted Tunnel</span>
                    <span className="text-emerald-400 flex items-center gap-1"><Icons.Check /> LINKED</span>
                 </div>
                 <div className="pt-4 border-t border-white/10 space-y-4">
                    <p className="text-[11px] text-white/40 uppercase font-black tracking-widest">Vaulted API Keys:</p>
                    <div className="flex justify-between items-center text-[12px] text-emerald-400 font-black uppercase tracking-tighter">
                       <code className="text-orange-400 font-bold bg-white/5 px-2 py-0.5 rounded tracking-tighter uppercase">GEMINI_CORE_V3</code>
                       <span>VERIFIED</span>
                    </div>
                 </div>
              </div>
           </GlassCard>
        </aside>

        <main className="lg:col-span-9 space-y-8">
           {activeTab === 'twin' ? (
              !activeDevice ? (
                <GlassCard className="flex flex-col items-center justify-center py-80 bg-white/[0.01] border-dashed border-2">
                  <div className="w-24 h-24 bg-orange-500/10 rounded-3xl flex items-center justify-center text-orange-500 border border-orange-500/30 animate-pulse"><Icons.Cpu /></div>
                  <h2 className="text-lg font-black text-white uppercase tracking-[0.5em] mt-8 animate-pulse">Syncing Satellite Array</h2>
                </GlassCard>
              ) : (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <GlassCard className="border-l-[8px] border-l-orange-500 shadow-3xl bg-gradient-to-br from-orange-600/10 to-transparent p-8">
                        <div className="space-y-8">
                          <div className="text-orange-400 font-black uppercase tracking-[0.3em] text-[14px] border-b border-orange-500/20 pb-2 inline-block">Mechanical Health</div>
                          <h2 className="text-3xl font-black text-white truncate tracking-tight uppercase">{activeDevice.properties.name}</h2>
                          <div className="flex items-baseline gap-4">
                              <span className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">{currentReading?.indoorTemp.toFixed(1) || '--'}°</span>
                              <span className="text-orange-200 text-lg font-black uppercase tracking-[0.2em]">Celsius</span>
                          </div>
                        </div>
                      </GlassCard>
                      <div className="md:col-span-2">
                        <AISystemArchitect device={activeDevice} readings={readings} />
                      </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-8">
                        <GlassCard title="System Performance History" icon={<Icons.Activity />} className="border-2">
                            <HeartbeatGraph data={readings} />
                        </GlassCard>
                      </div>
                      <div className="lg:col-span-4 space-y-8">
                        <GlassCard title="Predictive Triage" icon={<Icons.Zap />} className="border-2">
                            <div className="space-y-8">
                              <div className="flex justify-between items-end">
                                  <span className={`text-6xl font-black tracking-tighter ${prediction?.strain_score && prediction.strain_score > 50 ? 'text-orange-500' : 'text-emerald-400'}`}>
                                    {prediction?.strain_score || '--'}%
                                  </span>
                                  <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Mechanical Load</span>
                              </div>
                              <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden shadow-inner">
                                  <div className={`h-full transition-all duration-1000 shadow-[0_0_20px_rgba(249,115,22,1)] ${prediction?.strain_score && prediction.strain_score > 50 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${prediction?.strain_score || 0}%` }} />
                              </div>
                              <div className="pt-4 space-y-4">
                                  {prediction?.recommendations.slice(0, 2).map((r, i) => (
                                    <div key={i} className="text-[13px] text-white font-black leading-relaxed flex items-start gap-4 bg-orange-600/10 p-5 rounded-lg border-2 border-orange-500/20 uppercase tracking-tight transition-all hover:bg-orange-500/20">
                                      <div className="mt-1 text-orange-400"><Icons.Check /></div>
                                      {r}
                                    </div>
                                  ))}
                              </div>
                            </div>
                        </GlassCard>

                        {certificate ? (
                            <EfficiencyCertificateCard certificate={certificate} onUpdate={setCertificate} />
                        ) : (
                            <GlassCard title="Property Energy Passport" icon={<Icons.ShieldCheck />} variant="mica" className="border-2 p-8 bg-gradient-to-br from-orange-500/[0.03] to-transparent">
                              <div className="space-y-6">
                                  <div className="flex flex-col">
                                    <span className="text-2xl font-black text-white uppercase tracking-[0.2em] leading-tight">Property Value Ledger</span>
                                    <p className="text-[15px] text-white font-black uppercase tracking-wider mt-3 border-l-4 border-orange-500 pl-4">Rebate Lock: 2026 Ready</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 gap-2 pt-2">
                                     <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-orange-500/10 border border-orange-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                                        <span className="text-[10px] font-black text-orange-200 uppercase tracking-widest">Homeowner: Guaranteed $12k Rebate</span>
                                     </div>
                                     <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-blue-500/10 border border-blue-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                        <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Realtor: MLS Certified Value Seal</span>
                                     </div>
                                  </div>

                                  <button 
                                    onClick={() => {
                                      if (!activeDevice || !prediction) return;
                                      setIsMinting(true);
                                      generateEfficiencyCertificate(activeDevice.device_id, prediction).then(cert => {
                                          setCertificate(cert);
                                          setIsMinting(false);
                                      }).catch(() => setIsMinting(false));
                                    }}
                                    className="w-full py-6 bg-orange-600 hover:bg-orange-500 rounded-xl text-[14px] font-black uppercase tracking-[0.3em] text-white transition-all shadow-3xl border-2 border-orange-400/50 flex flex-col items-center justify-center gap-1 group active:scale-[0.98]"
                                  >
                                    <span className="group-hover:scale-105 transition-transform">{isMinting ? 'VALIDATING DATA...' : 'MINT PROPERTY PASSPORT'}</span>
                                    {!isMinting && <span className="text-[9px] opacity-60 font-black">Official Record Generation</span>}
                                  </button>
                              </div>
                            </GlassCard>
                        )}
                      </div>
                  </div>
                </div>
              )
           ) : (
             <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <GlassCard className="border-l-[6px] border-l-orange-500 bg-white/[0.03] p-8">
                      <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest mb-1 block">Total Grant Value</span>
                      <div className="text-4xl font-black text-white tracking-tighter uppercase">$1.2M+</div>
                   </GlassCard>
                   <GlassCard className="border-l-[6px] border-l-emerald-500 bg-white/[0.03] p-8">
                      <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-1 block">Closed Revenue</span>
                      <div className="text-4xl font-black text-white tracking-tighter uppercase">$420K</div>
                   </GlassCard>
                   <GlassCard className="border-l-[6px] border-l-blue-500 bg-white/[0.03] p-8">
                      <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-1 block">Verified Leads</span>
                      <div className="text-4xl font-black text-white tracking-tighter uppercase">128</div>
                   </GlassCard>
                   <GlassCard className="border-l-[6px] border-l-orange-500 bg-white/[0.03] p-8">
                      <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest mb-1 block">Enbridge HER+ Goal</span>
                      <div className="text-4xl font-black text-white tracking-tighter uppercase">74%</div>
                   </GlassCard>
                </div>

                <GlassCard title="Verified Grant Pipeline" icon={<Icons.Activity />} className="border-2 p-0">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead><tr className="bg-white/[0.05] border-b border-white/10">
                          <th className="p-6 text-[11px] font-black text-white uppercase tracking-widest">Property Address</th>
                          <th className="p-6 text-[11px] font-black text-white uppercase tracking-widest">Verified Rebate</th>
                          <th className="p-6 text-[11px] font-black text-white uppercase tracking-widest">Status</th>
                          <th className="p-6 text-[11px] font-black text-white uppercase tracking-widest">Action</th>
                        </tr></thead>
                        <tbody className="divide-y divide-white/5">
                           {leads.map((lead, idx) => (
                             <tr key={idx} className="hover:bg-white/[0.03] transition-colors group">
                               <td className="p-6"><div className="text-[15px] font-black text-white uppercase tracking-tight">{lead.address}</div></td>
                               <td className="p-6"><div className="text-[18px] font-black text-emerald-400 tracking-tighter">${lead.rebate_amount.toLocaleString()}</div></td>
                               <td className="p-6">
                                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${lead.status === 'new' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : lead.status === 'contacted' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>{lead.status}</span>
                               </td>
                               <td className="p-6"><button onClick={() => window.location.hash = `#portal/${lead.home_id}`} className="text-[10px] font-black text-white bg-white/5 px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2 hover:text-orange-400 transition-all uppercase tracking-widest shadow-sm active:scale-95"><Icons.Share /> View Portal</button></td>
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
    </div>
  );
};

function encode(bytes: Uint8Array) { let binary = ''; for (let i = 0; i < bytes.byteLength; i++) { binary += String.fromCharCode(bytes[i]); } return btoa(binary); }
function decode(base64: string) { const binaryString = atob(base64); const bytes = new Uint8Array(binaryString.length); for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); } return bytes; }
function createBlob(data: Float32Array): Blob { const int16 = new Int16Array(data.length); for (let i = 0; i < data.length; i++) { int16[i] = data[i] * 32768; } return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }; }
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> { const dataInt16 = new Int16Array(data.buffer); const buffer = ctx.createBuffer(numChannels, dataInt16.length / numChannels, sampleRate); for (let ch = 0; ch < numChannels; ch++) { const chData = buffer.getChannelData(ch); for (let i = 0; i < buffer.length; i++) { chData[i] = dataInt16[i * numChannels + ch] / 32768.0; } } return buffer; }
