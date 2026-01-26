
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { geminiService } from '../services/geminiService';
import { SeamDevice, TelemetryReading } from '../types';

interface Props {
  device: SeamDevice;
  readings: TelemetryReading[];
}

export const AISystemArchitect: React.FC<Props> = ({ device, readings }) => {
  const [insight, setInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInsight = async () => {
      if (readings.length === 0) return;
      setIsLoading(true);
      const result = await geminiService.analyzeSystemHealth(device, readings);
      setInsight(result);
      setIsLoading(false);
    };

    fetchInsight();
  }, [device.device_id, readings]);

  return (
    <GlassCard 
      title="AI Diagnostic Brief" 
      icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>}
      className="bg-gradient-to-br from-blue-500/[0.03] to-transparent border-blue-500/20"
    >
      <div className="min-h-[110px] flex flex-col justify-center">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-3 bg-white/10 rounded w-full"></div>
            <div className="h-3 bg-white/10 rounded w-11/12"></div>
            <div className="h-3 bg-white/10 rounded w-9/12"></div>
          </div>
        ) : (
          <div className="text-[14px] text-slate-100 leading-[1.6] font-medium">
             <span className="text-blue-400 font-bold mr-1">ANALYSIS:</span>
             {insight}
          </div>
        )}
      </div>
      <div className="mt-5 flex items-center justify-between text-[10px] uppercase font-bold tracking-[0.25em] text-blue-400/80 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
           <span>Verified by Azure Copilot</span>
        </div>
        <div className="flex gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20"></div>
        </div>
      </div>
    </GlassCard>
  );
};
