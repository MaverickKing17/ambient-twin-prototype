import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from './GlassCard';
import { HeartbeatGraph } from './HeartbeatGraph';
import { generateEfficiencyCertificate } from '../services/ledgerService';
import { 
  SystemStrainPrediction, 
  EfficiencyCertificate, 
  ProviderType, 
  TelemetryReading,
  HvacMode
} from '../types';

// Icons using standard SVG for zero dependencies in this example
const Icons = {
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Zap: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Award: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Thermometer: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>,
  ShieldCheck: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  AlertTriangle: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
};

// Mock Data Generator
const generateMockData = (): TelemetryReading[] => {
  const now = Date.now();
  return Array.from({ length: 15 }, (_, i) => ({
    timestamp: new Date(now - (14 - i) * 60000 * 30).toISOString(), // Every 30 mins
    indoorTemp: 20 + Math.random() * 2,
    outdoorTemp: 10 + Math.random() * 3,
    humidity: 45 + Math.random() * 10,
    targetTemp: 21,
    fanStatus: Math.random() > 0.5,
    compressorStatus: Math.random() > 0.7,
    hvacMode: HvacMode.AUTO,
    powerUsageWatts: 500 + Math.random() * 1000
  }));
};

export const Dashboard: React.FC = () => {
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [prediction, setPrediction] = useState<SystemStrainPrediction | null>(null);
  const [certificate, setCertificate] = useState<EfficiencyCertificate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize Data
  useEffect(() => {
    setReadings(generateMockData());
    
    // Simulate ML Analysis result
    setTimeout(() => {
      setPrediction({
        strainScore: 32, // Low strain
        efficiencyIndex: 0.94,
        predictedFailureRisk: 'LOW',
        anomalies: [],
        recommendations: ['Maintain current filter schedule', 'Optimized for rebate tier 1']
      });
    }, 1000);
  }, []);

  const handleMintCertificate = useCallback(async () => {
    if (!prediction) return;
    setIsGenerating(true);
    try {
      const cert = await generateEfficiencyCertificate('ECOBEE-X92-2025', prediction);
      setCertificate(cert);
    } catch (e) {
      console.error("Ledger error", e);
    } finally {
      setIsGenerating(false);
    }
  }, [prediction]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Digital Twin Dashboard
          </h1>
          <p className="text-white/60 text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Online • Connected to {ProviderType.ECOBEE}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2 text-sm text-cyan-300">
          <Icons.ShieldCheck />
          <span>ML Model v2.5.1 Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Rebate */}
        <div className="space-y-6 lg:col-span-1">
          {/* Rebate Card */}
          <GlassCard className="border-t-4 border-t-green-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="transform scale-150 rotate-12 text-green-500">
                <Icons.Award />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-400 font-semibold uppercase tracking-wider text-xs">
                Enbridge Rebate Eligible
              </div>
              <div>
                <span className="text-4xl font-bold text-white">$12,000</span>
                <span className="text-white/50 ml-2">max potential</span>
              </div>
              <p className="text-sm text-white/70">
                Your system efficiency score of <span className="text-green-400 font-bold">{Math.round((prediction?.efficiencyIndex || 0) * 100)}%</span> qualifies you for Tier 1 rebate incentives.
              </p>
              <button 
                className="w-full py-2.5 px-4 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 transition-all text-sm font-medium"
              >
                Apply for Rebate
              </button>
            </div>
          </GlassCard>

          {/* Current Readings */}
          <div className="grid grid-cols-2 gap-4">
             <GlassCard className="flex flex-col items-center justify-center py-6">
                <div className="text-white/50 text-xs uppercase mb-1">Indoor</div>
                <div className="text-2xl font-bold text-cyan-300 flex items-center gap-1">
                  21.5 <span className="text-sm text-white/40">°C</span>
                </div>
             </GlassCard>
             <GlassCard className="flex flex-col items-center justify-center py-6">
                <div className="text-white/50 text-xs uppercase mb-1">Strain</div>
                <div className="text-2xl font-bold text-pink-400 flex items-center gap-1">
                  {prediction?.strainScore || '--'} <span className="text-sm text-white/40">/ 100</span>
                </div>
             </GlassCard>
          </div>
        </div>

        {/* Middle Column: Heartbeat */}
        <div className="lg:col-span-2 space-y-6">
           <GlassCard title="System Heartbeat & Efficiency" icon={<Icons.Activity />}>
              <HeartbeatGraph data={readings} />
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
                <div className="text-center">
                  <div className="text-xs text-white/40 mb-1">Compressor</div>
                  <div className="text-sm font-medium text-green-400">Optimal</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-white/40 mb-1">Airflow</div>
                  <div className="text-sm font-medium text-blue-400">98% Rated</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-white/40 mb-1">Delta T</div>
                  <div className="text-sm font-medium text-white">8.5 °C</div>
                </div>
              </div>
           </GlassCard>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* ML Insights */}
             <GlassCard title="System Strain Prediction" icon={<Icons.Zap />}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Failure Risk</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${prediction?.predictedFailureRisk === 'LOW' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {prediction?.predictedFailureRisk || 'ANALYZING...'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-pink-500 transition-all duration-1000"
                      style={{ width: `${prediction?.strainScore || 0}%` }}
                    />
                  </div>
                  <div className="space-y-2">
                    {prediction?.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                        <span className="mt-0.5 text-cyan-400">•</span>
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
             </GlassCard>

             {/* Web 3.0 Ledger */}
             <GlassCard title="Efficiency Ledger" icon={<Icons.ShieldCheck />}>
                {!certificate ? (
                  <div className="h-full flex flex-col justify-center items-center text-center space-y-4">
                    <p className="text-sm text-white/60">
                      Verify your system's health on the private energy ledger to unlock premium rebate rates.
                    </p>
                    <button 
                      onClick={handleMintCertificate}
                      disabled={isGenerating || !prediction}
                      className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Minting...
                        </>
                      ) : 'Mint Certificate'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                      <Icons.Award /> Certificate Minted
                    </div>
                    <div className="space-y-1 text-xs text-white/60 font-mono break-all">
                      <div className="flex justify-between">
                        <span>ID:</span> <span className="text-white">{certificate.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Block:</span> <span className="text-blue-300">#{certificate.timestamp.toString().slice(-6)}</span>
                      </div>
                      <div className="border-t border-white/5 pt-1 mt-1 text-[10px] text-white/30">
                        {certificate.blockHash}
                      </div>
                    </div>
                  </div>
                )}
             </GlassCard>
           </div>
        </div>
      </div>
    </div>
  );
};
