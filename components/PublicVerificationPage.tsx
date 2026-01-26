
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
    <div className="max-w-6xl mx-auto p-6 space-y-10 animate-fade-in pb-32">
      <header className="flex flex-col items-center text-center space-y-8 mb-20 pt-10">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black tracking-[0.4em] uppercase shadow-lg shadow-orange-900/10">
          <Icons.Vault />
          Secure Trust Gateway
        </div>
        <h1 className="text-6xl font-black text-white tracking-tighter leading-none uppercase">Asset Authenticator</h1>
        <p className="text-white/80 max-w-2xl text-xl font-semibold leading-relaxed">
          Access the <span className="text-orange-500 underline decoration-2 underline-offset-8">blockchain-anchored</span> efficiency certificate for this property's high-performance HVAC infrastructure.
        </p>
      </header>

      {isVerifying ? (
        <div className="flex flex-col items-center py-24 space-y-6">
           <div className="w-16 h-16 border-4 border-white/5 border-t-orange-500 rounded-full animate-spin shadow-[0_0_50px_rgba(249,115,22,0.4)]"></div>
           <span className="text-[10px] font-black text-white uppercase tracking-[0.5em]">Establishing Proof of Origin...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-7 space-y-8">
            <GlassCard variant="mica" className="border-l-4 border-l-orange-500 shadow-2xl bg-white/[0.02]">
              <div className="flex items-center gap-4 mb-12">
                <div className="p-4 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-900/40">
                  <Icons.Home />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">Technical Identity</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-[0.25em] mt-1">
                    <Icons.Verified />
                    Hardware Handshake Valid
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="text-[10px] text-orange-400 uppercase tracking-[0.3em] font-black mb-3 block">Property Registry</label>
                    <div className="text-2xl text-white font-black leading-tight tracking-tight uppercase">{mockPublicData.address}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-orange-400 uppercase tracking-[0.3em] font-black mb-3 block">Digital Twin ID</label>
                    <div className="text-xl text-white font-mono font-black tracking-tighter uppercase">{mockPublicData.serialNumber}</div>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/10">
                  <label className="text-[10px] text-orange-400 uppercase tracking-[0.3em] font-black mb-4 block">Asset Signature (SHA-256)</label>
                  <div className="bg-black/60 p-6 rounded-lg border border-white/10 font-mono text-[11px] text-white/70 break-all leading-relaxed shadow-inner">
                    {hash}
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="bg-emerald-500/10 border border-emerald-500/30 p-10 rounded-xl flex items-center gap-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="h-16 w-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/40 shrink-0 transform group-hover:rotate-6 transition-transform">
                  <Icons.Verified />
               </div>
               <div>
                  <h4 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">Rebate Eligibility Certified</h4>
                  <p className="text-lg text-white/80">Confirmed for <span className="text-emerald-400 font-black tracking-tight">{mockPublicData.rebateAmount} CAD</span> via Enbridge HER+.</p>
               </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <GlassCard title="Real-Time Performance" icon={<Icons.Activity />} variant="mica" className="relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 blur-[60px] pointer-events-none" />
               <div className="space-y-12 py-6">
                  <div className="flex justify-between items-center py-5 border-b border-white/10">
                    <span className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Operational Health</span>
                    <span className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white text-[10px] font-black uppercase rounded shadow-xl shadow-orange-900/40 tracking-[0.2em] animate-pulse">
                      {mockPublicData.status}
                    </span>
                  </div>

                  <div className="text-center py-10 relative">
                    <div className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-6">Efficiency Performance Rating</div>
                    <div className="relative inline-block">
                      <div className="text-[140px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-700 tracking-tighter filter drop-shadow-[0_20px_40px_rgba(249,115,22,0.6)]">
                        {mockPublicData.systemGrade}
                      </div>
                    </div>
                    <div className="text-[11px] font-black text-orange-400 mt-10 tracking-[0.4em] uppercase border-y border-orange-500/30 py-2 inline-block">
                      Peak Optimization Curve
                    </div>
                  </div>

                  <div className="bg-white/[0.08] p-6 rounded-xl border border-white/10 text-center shadow-inner">
                     <p className="text-[11px] text-white leading-relaxed font-black uppercase tracking-wider">
                       Telemetry streamed via Secure MQTT.<br/>
                       <span className="text-orange-400">Next cryptographic update: 42s</span>
                     </p>
                  </div>
               </div>
            </GlassCard>
          </div>

        </div>
      )}
    </div>
  );
};
