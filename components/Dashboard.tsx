import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from './GlassCard';
import { HeartbeatGraph } from './HeartbeatGraph';
import { generateEfficiencyCertificate } from '../services/ledgerService';
import { thermostatConnector } from '../services/ThermostatConnector';
import { 
  SystemStrainPrediction, 
  EfficiencyCertificate, 
  ProviderType, 
  TelemetryReading,
  HvacMode
} from '../types';

const Icons = {
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Zap: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Award: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Thermometer: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>,
  ShieldCheck: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  Link: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  CheckCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
};

export const Dashboard: React.FC = () => {
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [prediction, setPrediction] = useState<SystemStrainPrediction | null>(null);
  const [certificate, setCertificate] = useState<EfficiencyCertificate | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  
  // Connection State
  const [connectedProvider, setConnectedProvider] = useState<ProviderType | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load initial data if connected
  useEffect(() => {
    // Check if we have an existing session
    if (thermostatConnector.isConnected(ProviderType.ECOBEE)) {
      handleProviderSelect(ProviderType.ECOBEE, false);
    } else if (thermostatConnector.isConnected(ProviderType.NEST)) {
      handleProviderSelect(ProviderType.NEST, false);
    } else if (thermostatConnector.isConnected(ProviderType.HONEYWELL)) {
      handleProviderSelect(ProviderType.HONEYWELL, false);
    }
  }, []);

  const handleProviderSelect = async (provider: ProviderType, performAuth = true) => {
    setIsConnecting(true);
    try {
      if (performAuth) {
        // 1. Initiate Auth (Mock URL generation)
        const authUrl = await thermostatConnector.initiateAuth(provider);
        console.log(`Redirecting to ${authUrl}...`); // Demo purpose
        
        // 2. Handle Callback (Mock Code Exchange)
        await thermostatConnector.handleCallback(provider, 'mock_auth_code_123');
      }

      // 3. Fetch Data
      const { readings: newReadings, metadata } = await thermostatConnector.fetchSystemStrainData(provider);
      
      setConnectedProvider(provider);
      setReadings(newReadings);
      setCertificate(null); // Reset certificate on new connection

      // 4. Simulate ML Prediction based on new data
      setTimeout(() => {
        let strainScore = 35;
        let efficiencyIndex = 0.92;
        let recommendations = ['Check filter in 15 days', 'Optimized for rebate tier 1'];

        if (provider === ProviderType.NEST) {
          strainScore = 24;
          efficiencyIndex = 0.96;
          recommendations = ['System optimized', 'Continue usage pattern'];
        } else if (provider === ProviderType.HONEYWELL) {
          strainScore = 29;
          efficiencyIndex = 0.94;
          recommendations = ['Calibration recommended', 'Cycle times are optimal'];
        }

        setPrediction({
          strainScore,
          efficiencyIndex,
          predictedFailureRisk: 'LOW',
          anomalies: [],
          recommendations
        });
      }, 800);

    } catch (error) {
      console.error("Connection failed", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (connectedProvider) {
      thermostatConnector.disconnect(connectedProvider);
      setConnectedProvider(null);
      setReadings([]);
      setPrediction(null);
      setCertificate(null);
    }
  };

  const handleMintCertificate = useCallback(async () => {
    if (!prediction || !connectedProvider) return;
    setIsMinting(true);
    try {
      const cert = await generateEfficiencyCertificate(`${connectedProvider}-DEVICE-001`, prediction);
      setCertificate(cert);
    } catch (e) {
      console.error("Ledger error", e);
    } finally {
      setIsMinting(false);
    }
  }, [prediction, connectedProvider]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Digital Twin Dashboard
          </h1>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            {!connectedProvider ? (
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => handleProviderSelect(ProviderType.ECOBEE)}
                  disabled={isConnecting}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition-colors flex items-center gap-2"
                >
                   {isConnecting ? 'Connecting...' : 'Connect Ecobee'}
                </button>
                <button 
                   onClick={() => handleProviderSelect(ProviderType.NEST)}
                   disabled={isConnecting}
                   className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition-colors flex items-center gap-2"
                >
                   {isConnecting ? 'Connecting...' : 'Connect Nest'}
                </button>
                <button 
                   onClick={() => handleProviderSelect(ProviderType.HONEYWELL)}
                   disabled={isConnecting}
                   className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition-colors flex items-center gap-2"
                >
                   {isConnecting ? 'Connecting...' : 'Connect Honeywell'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                 <span className="flex items-center gap-2 text-sm text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Connected to {connectedProvider}
                 </span>
                 <button 
                    onClick={handleDisconnect}
                    className="text-xs text-white/40 hover:text-white underline ml-2"
                 >
                    Disconnect
                 </button>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2 text-sm text-cyan-300">
          <Icons.ShieldCheck />
          <span>ML Model v2.5.1 Active</span>
        </div>
      </header>

      {/* Main Content - Only show if connected */}
      {!connectedProvider ? (
        <div className="flex items-center justify-center h-[400px]">
          <GlassCard className="text-center p-12 max-w-md">
            <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mb-4">
              <Icons.Link />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connect Your Thermostat</h2>
            <p className="text-white/60 mb-6">
              Link your Ecobee, Nest, or Honeywell account to ingest live telemetry, analyze system strain, and mint your efficiency certificate.
            </p>
          </GlassCard>
        </div>
      ) : (
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
                    {readings[readings.length-1]?.indoorTemp.toFixed(1)} <span className="text-sm text-white/40">°C</span>
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
                        disabled={isMinting || !prediction}
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isMinting ? (
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
                        <Icons.CheckCircle /> Certificate Minted
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
      )}
    </div>
  );
};