import React from 'react';
import { GlassCard } from './GlassCard';
import { EfficiencyCertificate } from '../types';

interface Props {
  hash: string;
}

export const PublicVerificationPage: React.FC<Props> = ({ hash }) => {
  // Mock data simulation based on hash - in production this comes from the chain
  const mockPublicData = {
    address: "123 Maple Avenue, Toronto, ON",
    serialNumber: "SN-ECO-998877-X",
    status: "OPERATIONAL",
    lastVerified: new Date().toLocaleDateString(),
    systemGrade: "A+",
    rebateStatus: "TIER 1 ELIGIBLE"
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 animate-fade-in">
      <header className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold tracking-widest uppercase">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Ambient Trust Layer
        </div>
        <h1 className="text-4xl font-bold text-white">Public Asset Verification</h1>
        <p className="text-white/70 max-w-lg font-light">
          This page displays immutable, blockchain-verified health data for the HVAC asset located at the property below. Homeowner PII has been redacted for privacy.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Verification Card */}
        <GlassCard className="border-t-4 border-t-orange-500">
          <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M17 21v-8.5a2.5 2.5 0 0 0-5 0V21"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Property Details</h3>
                <span className="text-xs text-orange-400 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  Address Verified
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Property Address</label>
                <div className="text-lg text-white font-medium">{mockPublicData.address}</div>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">HVAC Serial Number</label>
                <div className="text-base text-orange-300 font-mono">{mockPublicData.serialNumber}</div>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Asset Hash (Ledger ID)</label>
                <div className="text-xs text-white/60 font-mono break-all bg-black/20 p-2 rounded border border-white/10">
                  {hash}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Live Health Card */}
        <GlassCard className="border-t-4 border-t-white">
           <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Live System Read</h3>
                <span className="text-xs text-white/80 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  Real-time Connection
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-sm p-4 text-center border border-white/10">
                <div className="text-xs text-white/50 uppercase mb-1 font-bold">Operational Status</div>
                <div className="text-orange-400 font-bold">{mockPublicData.status}</div>
              </div>
              <div className="bg-white/5 rounded-sm p-4 text-center border border-white/10">
                <div className="text-xs text-white/50 uppercase mb-1 font-bold">Efficiency Grade</div>
                <div className="text-white font-bold text-xl">{mockPublicData.systemGrade}</div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-sm p-4">
               <div className="flex items-start gap-3">
                 <div className="mt-1 text-orange-400">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-white">Value Addendum: Rebate Active</h4>
                   <p className="text-xs text-white/70 mt-1">
                     This system is currently verified as <strong className="text-orange-400">{mockPublicData.rebateStatus}</strong> for the $12,000 Enbridge Home Efficiency Rebate.
                   </p>
                 </div>
               </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="text-center pt-8 border-t border-white/10">
        <button 
          onClick={() => window.location.hash = ''}
          className="text-sm text-white/50 hover:text-white transition-colors font-medium cursor-pointer bg-transparent border-none p-0"
        >
          &larr; Return to Main Application
        </button>
      </div>
    </div>
  );
};