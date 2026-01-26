
import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from './GlassCard';
import { HeartbeatGraph } from './HeartbeatGraph';
import { EfficiencyCertificateCard } from './EfficiencyCertificateCard';
import { generateEfficiencyCertificate } from '../services/ledgerService';
import { thermostatConnector } from '../services/ThermostatConnector';
import { 
  SystemStrainPrediction, 
  EfficiencyCertificate, 
  ProviderType, 
  TelemetryReading
} from '../types';

const Icons = {
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Zap: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Award: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  ShieldCheck: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  Link: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Share: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
};

export const Dashboard: React.FC = () => {
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [prediction, setPrediction] = useState<SystemStrainPrediction | null>(null);
  const [certificate, setCertificate] = useState<EfficiencyCertificate | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
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
        await thermostatConnector.initiateAuth(provider);
        console.log(`Redirecting...`); 
        await thermostatConnector.handleCallback(provider, 'mock_auth_code_123');
      }

      const { readings: newReadings } = await thermostatConnector.fetchSystemStrainData(provider);
      
      setConnectedProvider(provider);
      setReadings(newReadings);
      setCertificate(null);

      // Simulate ML Prediction
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

  const handleSharePortal = () => {
    const mockHomeId = "HOME-8829-X";
    const url = `${window.location.origin}/#portal/${mockHomeId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Digital Twin Dashboard
          </h1>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            {!connectedProvider ? (
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => handleProviderSelect(ProviderType.ECOBEE)}
                  disabled={isConnecting}
                  className="px-4 py-1.5 rounded-sm bg-white/5 hover:bg-orange-500 hover:text-white border border-white/20 text-xs font-semibold uppercase tracking-wide transition-all flex items-center gap-2"
                >
                   {isConnecting ? 'Connecting...' : 'Connect Ecobee'}
                </button>
                <button 
                   onClick={() => handleProviderSelect(ProviderType.NEST)}
                   disabled={isConnecting}
                   className="px-4 py-1.5 rounded-sm bg-white/5 hover:bg-orange-500 hover:text-white border border-white/20 text-xs font-semibold uppercase tracking-wide transition-all flex items-center gap-2"
                >
                   {isConnecting ? 'Connecting...' : 'Connect Nest'}
                </button>
                <button 
                   onClick={() => handleProviderSelect(ProviderType.HONEYWELL)}
                   disabled={isConnecting}
                   className="px-4 py-1.5 rounded-sm bg-white/5 hover:bg-orange-500 hover:text-white border border-white/20 text-xs font-semibold uppercase tracking-wide transition-all flex items-center gap-2"
                >
                   {isConnecting ? 'Connecting...' : 'Connect Honeywell'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                 <span className="flex items-center gap-2 text-sm text-orange-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                    Connected to {connectedProvider}
                 </span>
                 <button 
                    onClick={handleDisconnect}
                    className="text-xs text-white/60 hover:text-white underline ml-2"
                 >
                    Disconnect
                 </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSharePortal}
            disabled={!connectedProvider}
            className={`
              px-4 py-1.5 rounded-sm border border-white/20 text-xs font-semibold uppercase tracking-wide transition-all flex items-center gap-2
              ${!connectedProvider ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}
            `}
          >
             <Icons.Share />
             {linkCopied ? 'Link Copied!' : 'Generate Portal Link'}
          </button>
          <div className="bg-white/5 border border-white/10 rounded-sm px-4 py-1.5 flex items-center gap-2 text-sm text-white font-medium">
            <span className="text-orange-400"><Icons.ShieldCheck /></span>
            <span>ML Model v2.5.1 Active</span>
          </div>
        </div>
      </header>

      {/* Main Content - Only show if connected */}
      {!connectedProvider ? (
        <div className="flex items-center justify-center h-[400px]">
          <GlassCard className="text-center p-12 max-w-md">
            <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-orange-400 mb-4">
              <Icons.Link />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connect Your Thermostat</h2>
            <p className="text-white/70 mb-6 font-light">
              Link your Ecobee, Nest, or Honeywell account to ingest live telemetry, analyze system strain, and mint your efficiency certificate.
            </p>
          </GlassCard>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Stats & Rebate */}
          <div className="space-y-6 lg:col-span-1">
            {/* Rebate Card */}
            <GlassCard className="border-t-4 border-t-orange-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className="transform scale-150 rotate-12 text-orange-500">
                  <Icons.Award />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-400 font-bold uppercase tracking-wider text-xs">
                  Enbridge Rebate Eligible
                </div>
                <div>
                  <span className="text-4xl font-bold text-white">$12,000</span>
                  <span className="text-white/50 ml-2">max potential</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  Your system efficiency score of <span className="text-orange-400 font-bold">{Math.round((prediction?.efficiencyIndex || 0) * 100)}%</span> qualifies you for Tier 1 rebate incentives.
                </p>
                <button 
                  className="w-full py-2.5 px-4 rounded-sm bg-orange-500 hover:bg-orange-600 text-white transition-all text-sm font-semibold shadow-lg shadow-orange-900/20"
                >
                  Apply for Rebate
                </button>
              </div>
            </GlassCard>

            {/* Current Readings */}
            <div className="grid grid-cols-2 gap-4">
               <GlassCard className="flex flex-col items-center justify-center py-6">
                  <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Indoor</div>
                  <div className="text-2xl font-bold text-white flex items-center gap-1">
                    {readings[readings.length-1]?.indoorTemp.toFixed(1)} <span className="text-sm text-orange-400">°C</span>
                  </div>
               </GlassCard>
               <GlassCard className="flex flex-col items-center justify-center py-6">
                  <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Strain</div>
                  <div className="text-2xl font-bold text-white flex items-center gap-1">
                    {prediction?.strainScore || '--'} <span className="text-sm text-orange-400">/ 100</span>
                  </div>
               </GlassCard>
            </div>
          </div>

          {/* Middle Column: Heartbeat */}
          <div className="lg:col-span-2 space-y-6">
             <GlassCard title="System Heartbeat & Efficiency" icon={<Icons.Activity />}>
                <HeartbeatGraph data={readings} />
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-xs text-white/50 mb-1 font-medium uppercase">Compressor</div>
                    <div className="text-sm font-bold text-white">Optimal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-white/50 mb-1 font-medium uppercase">Airflow</div>
                    <div className="text-sm font-bold text-white">98% Rated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-white/50 mb-1 font-medium uppercase">Delta T</div>
                    <div className="text-sm font-bold text-white">8.5 °C</div>
                  </div>
                </div>
             </GlassCard>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* ML Insights */}
               <GlassCard title="System Strain Prediction" icon={<Icons.Zap />}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/70">Failure Risk</span>
                      <span className={`px-2 py-0.5 rounded-sm text-xs font-bold ${prediction?.predictedFailureRisk === 'LOW' ? 'bg-white/10 text-white border border-white/20' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                        {prediction?.predictedFailureRisk || 'ANALYZING...'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-1000"
                        style={{ width: `${prediction?.strainScore || 0}%` }}
                      />
                    </div>
                    <div className="space-y-2 pt-2">
                      {prediction?.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-white/80">
                          <span className="mt-0.5 text-orange-400 font-bold">•</span>
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
               </GlassCard>

               {/* Web 3.0 Ledger (Now using the new component or mint state) */}
               {certificate ? (
                 <EfficiencyCertificateCard 
                    certificate={certificate} 
                    onUpdate={setCertificate}
                 />
               ) : (
                  <GlassCard title="Efficiency Ledger" icon={<Icons.ShieldCheck />}>
                    <div className="h-full flex flex-col justify-center items-center text-center space-y-4 min-h-[300px]">
                      <p className="text-sm text-white/70">
                        Verify your system's health on the private energy ledger to unlock premium rebate rates.
                      </p>
                      <button 
                        onClick={handleMintCertificate}
                        disabled={isMinting || !prediction}
                        className="px-6 py-2.5 rounded-sm bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                      >
                        {isMinting ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Minting on Ledger...
                          </>
                        ) : 'Mint Digital Certificate'}
                      </button>
                    </div>
                  </GlassCard>
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
