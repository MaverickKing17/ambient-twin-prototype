
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
      title="AI System Architect" 
      icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12L2.69 7"/><path d="M12 12l5.63 8.36"/></svg>}
      className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20"
    >
      <div className="min-h-[100px] flex flex-col justify-center">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-white/10 rounded w-full"></div>
            <div className="h-3 bg-white/10 rounded w-4/5"></div>
            <div className="h-3 bg-white/10 rounded w-2/3"></div>
          </div>
        ) : (
          <p className="text-xs text-white/80 leading-relaxed font-light italic">
            "{insight}"
          </p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-blue-400">
        <span>Gemini 3 Flash Engine</span>
        <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
      </div>
    </GlassCard>
  );
};
