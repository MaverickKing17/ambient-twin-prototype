
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';

interface Props {
  hash: string;
}

const Icons = {
  Verified: () => <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
  Vault: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>,
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Info: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  // Added missing Check icon to fix line 116 error
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
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
    <div className="max-w-6xl mx-auto p-6 space-y-10 animate-fade-in pb-32">
      <header className="flex flex-col items-center text-center space-y-8 mb-20 pt-10">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[12px] font-black tracking-[0.4em] uppercase shadow-2xl">
          <Icons.Vault />
          Secure Trust Gateway
        </div>
        <h1 className="text-7xl font-black text-white tracking-tighter leading-none uppercase">Asset Authenticator</h1>
        <p className="text-white max-w-3xl text-2xl font-bold leading-tight">
          Access the <span className="text-orange-500 underline decoration-4 underline-offset-8">blockchain-anchored</span> efficiency certificate for this property's high-performance HVAC infrastructure.
        </p>
      </header>

      {isVerifying ? (
        <div className="flex flex-col items-center py-24 space-y-8">
           <div className="w-20 h-20 border-[6px] border-white/5 border-t-orange-500 rounded-full animate-spin shadow-[0_0_80px_rgba(249,115,22,0.4)]"></div>
           <span className="text-[14px] font-black text-white uppercase tracking-[0.5em]">Establishing Proof of Origin...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-7 space-y-8">
            <GlassCard variant="mica" className="border-l-[6px] border-l-orange-500 shadow-2xl bg-white/[0.03] p-10">
              <div className="flex items-center gap-5 mb-14">
                <div className="p-5 bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-900/50">
                  <Icons.Home />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight uppercase">System DNA</h3>
                  <div className="flex items-center gap-2 text-[13px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-2">
                    <Icons.Verified />
                    Hardware Handshake Validated
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-[13px] text-orange-500 uppercase tracking-[0.3em] font-black">Property Registry</label>
                      <span className="bg-white/10 px-2 py-0.5 rounded text-[9px] text-white font-black uppercase">For Realtors</span>
                    </div>
                    <div className="text-3xl text-white font-black leading-tight tracking-tight uppercase">{mockPublicData.address}</div>
                    <p className="text-[13px] text-white font-bold opacity-80 uppercase tracking-tight italic">Verified Site for MLS Feature Listing</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-[13px] text-orange-500 uppercase tracking-[0.3em] font-black">Digital Twin ID</label>
                      <span className="bg-white/10 px-2 py-0.5 rounded text-[9px] text-white font-black uppercase tracking-tighter">For Techs</span>
                    </div>
                    <div className="text-2xl text-white font-mono font-black tracking-tighter uppercase">{mockPublicData.serialNumber}</div>
                    <p className="text-[13px] text-white font-bold opacity-80 uppercase tracking-tight italic">System Match Confirmed</p>
                  </div>
                </div>

                <div className="pt-12 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-[13px] text-orange-500 uppercase tracking-[0.3em] font-black">Asset Signature (SHA-256)</label>
                    <div className="flex items-center gap-2 text-[10px] text-white font-black bg-white/5 px-3 py-1 rounded">
                      <Icons.Info /> Technical Proof for Lenders
                    </div>
                  </div>
                  <div className="bg-black/80 p-8 rounded-xl border border-white/10 font-mono text-[12px] text-white break-all leading-relaxed shadow-inner">
                    {hash}
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="bg-emerald-500/10 border-2 border-emerald-500/40 p-12 rounded-2xl flex items-center gap-10 shadow-3xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="h-24 w-24 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/60 shrink-0 transform group-hover:rotate-6 transition-transform">
                  <Icons.Verified />
               </div>
               <div>
                  <h4 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Rebate Eligibility Certified</h4>
                  <p className="text-2xl text-white font-bold">
                    Confirmed for <span className="text-emerald-400 font-black tracking-tight">{mockPublicData.rebateAmount} CAD</span> Cash-Back.
                  </p>
                  <p className="text-[14px] text-emerald-400 font-black uppercase mt-3 tracking-widest flex items-center gap-2">
                    <Icons.Check /> Homeowner Savings: Guaranteed through Enbridge HER+
                  </p>
               </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <GlassCard title="Real-Time Performance" icon={<Icons.Activity />} variant="mica" className="relative p-8">
               <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/30 blur-[80px] pointer-events-none" />
               <div className="space-y-12 py-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-6 border-b border-white/10">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-black text-white uppercase tracking-[0.3em]">Reliability Status</span>
                        <span className="text-[11px] text-white font-bold uppercase tracking-tight opacity-70">Peace-of-Mind for Homeowners</span>
                      </div>
                      <span className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-800 text-white text-[12px] font-black uppercase rounded shadow-2xl tracking-[0.2em] animate-pulse">
                        {mockPublicData.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-center py-12 relative">
                    <div className="flex flex-col items-center mb-8">
                      <span className="text-[14px] font-black text-white uppercase tracking-[0.4em]">Home Value Grade</span>
                      <span className="text-[11px] text-orange-400 font-black uppercase tracking-widest mt-2 border border-orange-500/40 px-3 py-1 rounded">High-Resale Advantage (For Realtors)</span>
                    </div>
                    <div className="relative inline-block">
                      <div className="text-[160px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-700 tracking-tighter filter drop-shadow-[0_20px_50px_rgba(249,115,22,0.8)]">
                        {mockPublicData.systemGrade}
                      </div>
                    </div>
                    <div className="text-[13px] font-black text-white mt-12 tracking-[0.3em] uppercase border-y border-white/20 py-3 inline-block">
                      Top 5% Energy Performance Curve
                    </div>
                  </div>

                  <div className="bg-white/[0.12] p-8 rounded-2xl border border-white/10 text-center shadow-inner">
                     <p className="text-[13px] text-white leading-relaxed font-black uppercase tracking-wider">
                       Telemetry Secure Uplink (Verified MQTT)<br/>
                       <span className="text-orange-400 font-black mt-2 block">Next Cryptographic Update: 42s</span>
                     </p>
                  </div>
               </div>
            </GlassCard>
            
            <button 
              onClick={() => window.location.hash = ''}
              className="w-full py-6 text-[14px] font-black text-white hover:text-white transition-all uppercase tracking-[0.5em] text-center border-2 border-orange-500/60 hover:border-orange-500 rounded-2xl bg-orange-600 shadow-3xl shadow-orange-900/60 active:scale-[0.98] mt-4"
            >
              &larr; Exit to Command Center
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
