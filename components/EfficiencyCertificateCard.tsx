
import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import { EfficiencyCertificate } from '../types';
import { publishCertificate } from '../services/ledgerService';

interface Props {
  certificate: EfficiencyCertificate;
  onUpdate: (cert: EfficiencyCertificate) => void;
}

const Icons = {
  Value: () => <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  House: () => <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Link: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
};

export const EfficiencyCertificateCard: React.FC<Props> = ({ certificate, onUpdate }) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTogglePublish = async () => {
    setIsPublishing(true);
    try {
      const updated = await publishCertificate(certificate);
      onUpdate(updated);
    } catch (e) {
      console.error("Failed to publish", e);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = () => {
    const link = `https://ambient.twin/verify/${certificate.assetHash}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateRealtorPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("HVAC Home Value Passport", 20, 20);
    doc.setFontSize(10);
    doc.text("Blockchain-Verified Property Asset", 20, 30);
    doc.save(`Property_Passport_${certificate.id}.pdf`);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl p-[1px] bg-gradient-to-br from-orange-400/40 via-white/10 to-transparent shadow-2xl group transition-all hover:scale-[1.01] duration-700">
      <div className="absolute inset-0 bg-[#0f172a] backdrop-blur-3xl rounded-xl z-0" />
      
      <div className="relative z-10 p-6 flex flex-col h-full justify-between min-h-[580px]">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-5">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-orange-500 mb-1">Asset Appraisal Tool</span>
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">Property Passport</h3>
            <p className="text-[12px] text-white font-bold uppercase tracking-widest mt-2 italic underline decoration-orange-500/50 underline-offset-4">Verified by AI Oracle</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleCopyLink} className="p-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all shadow-lg active:scale-95">
                {copied ? <span className="text-[9px] font-black uppercase tracking-tighter">COPIED!</span> : <Icons.Link />}
             </button>
             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-800/40 border border-orange-500/30 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
             </div>
          </div>
        </div>

        {/* Value Grid */}
        <div className="mt-6 space-y-3">
           <div className="grid grid-cols-1 gap-2">
              <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 flex items-center gap-4">
                 <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20"><Icons.Value /></div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-emerald-400">Homeowner Impact</span>
                    <span className="text-sm font-bold text-white tracking-tight">Confirmed <span className="text-emerald-400 font-black">$12,000</span> Grant Ready</span>
                 </div>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 flex items-center gap-4">
                 <div className="p-2.5 bg-orange-500/10 rounded-lg border border-orange-500/20"><Icons.House /></div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-orange-400">Realtor Utility</span>
                    <span className="text-sm font-bold text-white tracking-tight">Elite <span className="text-orange-400 font-black">Comfort Seal</span> for Listing</span>
                 </div>
              </div>
           </div>
           <div className="px-4 py-2 rounded bg-orange-500/5 border border-dashed border-orange-500/20 text-center">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Share Passport link with Realtor for MLS boost</span>
           </div>
        </div>

        {/* Grade */}
        <div className="flex flex-col items-center justify-center my-6 relative">
          <div className="absolute -z-10 w-48 h-48 bg-orange-600/20 blur-[60px] rounded-full animate-pulse" />
          <h1 className="text-[120px] leading-none font-black bg-clip-text text-transparent bg-gradient-to-b from-orange-300 via-orange-500 to-orange-700 drop-shadow-[0_15px_35px_rgba(249,115,22,0.6)] tracking-tighter">
            {certificate.grade}
          </h1>
          <div className="mt-2 text-[12px] text-orange-200 font-black tracking-[0.3em] uppercase">Score: {certificate.efficiencyScore}/100</div>
        </div>

        {/* Actions */}
        <div className="space-y-4 border-t border-white/5 pt-6">
          <div className="flex justify-between items-center font-mono">
            <span className="text-[12px] tracking-widest text-white/40 font-black uppercase">ID: {certificate.id}</span>
            <span className="text-[12px] text-white/40 font-black uppercase tracking-tight">{new Date(certificate.timestamp).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={generateRealtorPDF}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-[11px] uppercase font-black tracking-[0.2em] text-white transition-all border border-white/10 active:scale-95"
            >
              Print Record
            </button>
            <button 
              onClick={handleTogglePublish}
              className={`px-6 py-4 rounded-lg text-[11px] uppercase font-black tracking-[0.2em] transition-all border shadow-lg active:scale-95 ${certificate.isPublished ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-orange-600 text-white border-orange-400 hover:bg-orange-500'}`}
            >
              {certificate.isPublished ? 'SYNCED TO LEDGER' : 'PUBLISH ASSET'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
