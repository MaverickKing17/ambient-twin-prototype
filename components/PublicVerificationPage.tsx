
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';

interface Props {
  hash: string;
}

const Icons = {
  Verified: () => <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
  Vault: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>,
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
};

export const PublicVerificationPage: React.FC<Props> = ({ hash }) => {
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVerifying(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const mockPublicData = {
    address: "123 Maple Avenue, Toronto, ON",
    serialNumber: "SN-ECO-998877-X",
    status: "OPERATIONAL",
    lastVerified: new Date().toLocaleDateString(),
    systemGrade: "A+",
    rebateStatus: "TIER 1 ELIGIBLE",
    rebateAmount: "$12,000"
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10 animate-fade-in pb-20">
      <header className="flex flex-col items-center text-center space-y-6 mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold tracking-[0.3em] uppercase">
          <Icons.Vault />
          Secure Trust Gateway
        </div>
        <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">Public Asset Verification</h1>
        <p className="text-slate-300 max-w-2xl text-lg font-normal leading-relaxed">
          Access high-fidelity telemetry and immutable efficiency certification for the 
          <span className="text-white font-bold"> primary HVAC asset </span> 
          at the verified property listed below.
        </p>
      </header>

      {isVerifying ? (
        <div className="flex flex-col items-center py-20 space-y-4">
           <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
           <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Bridging Ledger...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-7 space-y-8">
            <GlassCard variant="mica" className="border-l-4 border-l-blue-500 shadow-2xl">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                  <Icons.Home />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Technical Identity</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                    <Icons.Verified />
                    Validated Hardware Link
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mb-2 block">Verified Property Address</label>
                    <div className="text-2xl text-white font-bold leading-tight tracking-tight">{mockPublicData.address}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mb-2 block">Asset Serial Code</label>
                    <div className="text-xl text-blue-400 font-mono font-bold tracking-tight">{mockPublicData.serialNumber}</div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mb-3 block">Blockchain Asset Signature (SHA-256)</label>
                  <div className="bg-black/40 p-5 rounded border border-white/5 font-mono text-[11px] text-slate-400 break-all leading-relaxed">
                    {hash}
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded flex items-center gap-8 shadow-xl">
               <div className="h-14 w-14 bg-emerald-500 rounded flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 shrink-0">
                  <Icons.Verified />
               </div>
               <div>
                  <h4 className="text-xl font-bold text-white mb-1">Incentive Eligibility Certified</h4>
                  <p className="text-sm text-slate-300">Confirmed for <span className="text-white font-bold">{mockPublicData.rebateAmount}</span> via the Enbridge Home Efficiency Rebate Plus program.</p>
               </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <GlassCard title="Real-Time Performance" icon={<Icons.Activity />} variant="mica">
               <div className="space-y-10 py-4">
                  <div className="flex justify-between items-center py-4 border-b border-white/10">
                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Operational Health</span>
                    <span className="px-4 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded shadow-lg">
                      {mockPublicData.status}
                    </span>
                  </div>

                  <div className="text-center py-8">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Certified Efficiency Grade</div>
                    <div className="text-[120px] leading-none font-black text-white tracking-tighter filter drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]">
                      {mockPublicData.systemGrade}
                    </div>
                    <div className="text-xs font-bold text-emerald-400 mt-6 tracking-widest uppercase">Peak Performance Range</div>
                  </div>

                  <div className="bg-white/[0.04] p-5 rounded border border-white/5 text-center">
                     <p className="text-xs text-slate-300 leading-relaxed">
                       Dynamic twin data is streamed via encrypted Resideo MQTT. Next update: 54s.
                     </p>
                  </div>
               </div>
            </GlassCard>
            
            <button 
              onClick={() => window.location.hash = ''}
              className="w-full py-4 text-xs font-bold text-slate-500 hover:text-white transition-all uppercase tracking-[0.3em] text-center border border-transparent hover:border-white/10 rounded"
            >
              &larr; Return to Dashboard
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
