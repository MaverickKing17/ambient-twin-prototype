import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from './GlassCard';
import { geminiService } from '../services/geminiService';
import { SeamDevice, TelemetryReading } from '../types';

interface Props {
  device: SeamDevice;
  readings: TelemetryReading[];
}

export const AISystemArchitect: React.FC<Props> = ({ device, readings }) => {
  const [insight, setInsight] = useState<string>('');
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);

  const fetchInsight = useCallback(async (isManual = false) => {
    if (readings.length === 0) return;
    setIsLoading(true);
    try {
      const result = await geminiService.analyzeSystemHealth(device, readings);
      setInsight(result.text);
      setSources(result.sources);
      setIsCached(!!result.isCached);
      setLastAnalyzed(new Date());
    } catch (e) {
      setInsight("Unable to connect to AI server. Check internet.");
    } finally {
      setIsLoading(false);
    }
  }, [device.device_id, readings]);

  useEffect(() => {
    fetchInsight();
  }, [device.device_id]);

  return (
    <GlassCard 
      title="Toronto AI Infrastructure Log" 
      icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>}
      className="bg-gradient-to-br from-orange-500/[0.08] to-transparent border-orange-500/30 relative shadow-2xl h-full"
    >
      <div className="min-h-[220px] flex flex-col justify-between p-2">
        {isLoading ? (
          <div className="space-y-6 animate-pulse pt-4">
            <div className="h-4 bg-white/20 rounded-lg w-full"></div>
            <div className="h-4 bg-white/20 rounded-lg w-11/12"></div>
            <div className="h-4 bg-white/20 rounded-lg w-9/12"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-[17px] text-white leading-[1.6] font-bold">
               <span className="text-orange-400 font-black mr-3 uppercase tracking-tighter italic border-b-2 border-orange-500/50">
                 {isCached ? 'SAVED REBATE LOG:' : 'LIVE TORONTO AI LOG:'}
               </span>
               {insight || "Awaiting system telemetry stream..."}
            </div>
            
            {sources.length > 0 && (
              <div className="pt-6 border-t border-white/10 space-y-4">
                <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">Enbridge & GTA Sector Refs:</p>
                <div className="flex flex-wrap gap-3">
                  {sources.map((s, i) => (
                    <a 
                      key={i} 
                      href={s.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-black bg-white/5 hover:bg-orange-500/20 px-4 py-2 rounded-xl border border-white/10 text-orange-400 transition-all uppercase truncate max-w-[220px] shadow-lg"
                    >
                      {s.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
               <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-orange-500 animate-ping' : isCached ? 'bg-orange-500/50' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
               <span className="text-[11px] uppercase font-black tracking-widest text-white/50">
                 {isLoading ? 'Processing Grid...' : <span>Last Updated: <strong className="text-white font-black text-sm ml-2 tracking-tight border-b-2 border-orange-500/20">{lastAnalyzed?.toLocaleTimeString() || 'Pending Connection'}</strong></span>}
               </span>
            </div>
          </div>
          
          <button 
            onClick={() => fetchInsight(true)}
            disabled={isLoading}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 border-2 border-orange-400/20 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-orange-900/40"
          >
            Force GTA Re-Sync
          </button>
        </div>
      </div>
    </GlassCard>
  );
};