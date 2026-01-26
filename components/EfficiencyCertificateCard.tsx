
import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import { EfficiencyCertificate } from '../types';
import { publishCertificate } from '../services/ledgerService';

interface Props {
  certificate: EfficiencyCertificate;
  onUpdate: (cert: EfficiencyCertificate) => void;
}

export const EfficiencyCertificateCard: React.FC<Props> = ({ certificate, onUpdate }) => {
  const [isPublishing, setIsPublishing] = useState(false);

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

  const generateRealtorPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("HVAC Home Value Addendum", 20, 20);
    doc.setFontSize(10);
    doc.text("Blockchain-Verified Property Asset", 20, 30);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("Property Feature: High-Efficiency Climate System", 20, 60);
    doc.save(`Realtor_Addendum_${certificate.id}.pdf`);
  };

  const formattedDate = new Date(certificate.timestamp).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="relative w-full overflow-hidden rounded-lg p-[1.5px] bg-gradient-to-br from-orange-400/40 via-white/5 to-transparent shadow-2xl group transition-all hover:scale-[1.01] duration-700">
      <div className="absolute inset-0 bg-[#0f172a] backdrop-blur-3xl rounded-lg z-0" />
      
      <div className="relative z-10 p-6 flex flex-col h-full justify-between min-h-[520px]">
        
        {/* Header with Clarity Labels */}
        <div className="flex justify-between items-start border-b border-white/10 pb-4">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-black tracking-[0.3em] text-orange-400 mb-1">Asset Appraisal Tool</span>
            <h3 className="text-xl font-black text-white tracking-tight uppercase">Efficiency Ledger</h3>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-1">Proof of High-Performance Home Value</p>
          </div>
          <div className="w-14 h-10 rounded bg-gradient-to-br from-orange-100/30 to-orange-700/40 border border-orange-400/50 flex items-center justify-center relative overflow-hidden shadow-lg shadow-orange-900/20">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
             <svg className="w-7 h-7 text-white/90 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
          </div>
        </div>

        {/* The "Why it Matters" Summary for Realtors/Homeowners */}
        <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded">
           <p className="text-[11px] text-white leading-relaxed font-bold italic">
             "This system is certified <span className="text-orange-400">Elite Grade</span>. This record increases home value by validating a $12,000 rebate eligibility and 40% lower energy bills than the regional average."
           </p>
        </div>

        {/* Grade Display */}
        <div className="flex flex-col items-center justify-center my-4 relative">
          <div className="absolute -z-10 w-48 h-48 bg-orange-600/20 blur-[60px] rounded-full animate-pulse" />
          <div className="relative group cursor-default">
            <h1 className="text-9xl font-black bg-clip-text text-transparent bg-gradient-to-b from-orange-300 via-orange-500 to-orange-700 drop-shadow-[0_15px_35px_rgba(249,115,22,0.6)] tracking-tighter">
              {certificate.grade}
            </h1>
            <div className="absolute -right-10 top-4 bg-white text-orange-600 text-[11px] font-black px-3 py-1 rounded shadow-2xl border border-orange-200 transform rotate-6 scale-110">
              ELITE
            </div>
          </div>
          <div className="mt-2 text-[10px] text-orange-200 font-black tracking-[0.2em] uppercase">
            Optimization Score: {certificate.efficiencyScore}.0 / 100
          </div>
        </div>

        {/* Metrics Grid with Plain-Language Subtitles */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/[0.03] rounded border border-white/10 p-3 flex flex-col items-center">
            <span className="text-[9px] text-orange-400 uppercase tracking-[0.2em] font-black mb-1">Standard SEER2</span>
            <span className="text-2xl font-black text-white">{certificate.metrics.seer2}</span>
            <span className="text-[8px] text-white/40 uppercase font-black mt-1">Cooling Efficiency</span>
          </div>
          <div className="bg-white/[0.03] rounded border border-white/10 p-3 flex flex-col items-center">
            <span className="text-[9px] text-orange-400 uppercase tracking-[0.2em] font-black mb-1">HSPF2 Rating</span>
            <span className="text-2xl font-black text-white">{certificate.metrics.hspf2}</span>
            <span className="text-[8px] text-white/40 uppercase font-black mt-1">Heating Performance</span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded p-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/40 shrink-0">
             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-white uppercase tracking-wider">Financial Verification</span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">Qualified for $12,000 Rebate Tier</span>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-4 border-t border-white/10 pt-4">
          <div className="flex justify-between items-center text-[9px] font-mono text-white/30 tracking-tight">
            <span className="uppercase text-[8px] tracking-[0.2em] text-white/20 font-black">Digital Signature: {certificate.id}</span>
            <span className="text-white/50">{formattedDate}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={generateRealtorPDF}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded bg-white/[0.05] hover:bg-orange-600 text-[10px] uppercase font-black tracking-[0.2em] text-white transition-all border border-white/5 hover:border-orange-400"
            >
              Export Appraisal Addendum
            </button>
            <button 
              onClick={handleTogglePublish}
              className={`px-4 py-3 rounded text-[10px] uppercase font-black tracking-[0.2em] transition-all border ${certificate.isPublished ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500 text-white border-orange-400'}`}
            >
              {certificate.isPublished ? 'Live Link Active' : 'Go Public'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
