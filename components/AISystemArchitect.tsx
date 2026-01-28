
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
      title="Smart System Analysis" 
      icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>}
      className="bg-gradient-to-br from-orange-500/[0.05] to-transparent border-orange-500/20 relative"
    >
      <div className="min-h-[160px] flex flex-col justify-between">
        {isLoading ? (
          <div className="space-y-4 animate-pulse pt-2">
            <div className="h-3 bg-white/20 rounded w-full"></div>
            <div className="h-3 bg-white/20 rounded w-11/12"></div>
            <div className="h-3 bg-white/20 rounded w-9/12"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-[14px] text-white leading-[1.6] font-bold">
               <span className="text-orange-400 font-black mr-2 uppercase tracking-tighter italic">
                 {isCached ? 'SAVED SUMMARY:' : 'LIVE AI SUMMARY:'}
               </span>
               {insight}
            </div>
            
            {sources.length > 0 && (
              <div className="pt-4 border-t border-white/5 space-y-2">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Reference Links:</p>
                <div className="flex flex-wrap gap-2">
                  {sources.map((s, i) => (
                    <a 
                      key={i} 
                      href={s.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[9px] font-black bg-white/5 hover:bg-orange-500/20 px-2 py-1 rounded border border-white/10 text-orange-400 transition-colors uppercase truncate max-w-[180px]"
                    >
                      {s.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-orange-500 animate-ping' : isCached ? 'bg-orange-500/50' : 'bg-emerald-500'}`} />
               <span className="text-[10px] uppercase font-black tracking-widest text-white/40">
                 {isLoading ? 'Thinking...' : <span>Last Updated: <strong className="text-white font-black text-xs">{lastAnalyzed?.toLocaleTimeString() || 'Pending'}</strong></span>}
               </span>
            </div>
          </div>
          
          <button 
            onClick={() => fetchInsight(true)}
            disabled={isLoading}
            className="px-4 py-1.5 bg-white/5 hover:bg-orange-600 border border-white/10 rounded text-[9px] font-black text-white uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
          >
            Re-Analyze
          </button>
        </div>
      </div>
    </GlassCard>
  );
};
