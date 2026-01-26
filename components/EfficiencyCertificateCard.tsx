
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
    
    // Header Branding - Corporate Dark Blue/Slate
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("HVAC Home Value Addendum", 20, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Blockchain-Verified Property Asset", 20, 30);

    // Certificate Details
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Property Feature: High-Efficiency Climate System", 20, 60);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`Certificate ID: ${certificate.id}`, 20, 70);
    doc.text(`Mint Date: ${new Date(certificate.timestamp).toLocaleDateString()}`, 20, 78);
    
    // Grade Box - Orange Border
    doc.setDrawColor(249, 115, 22); // Orange-500
    doc.setLineWidth(1);
    doc.roundedRect(20, 90, 170, 50, 3, 3);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Efficiency Performance Grade", 30, 105);
    
    doc.setFontSize(36);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(249, 115, 22); // Orange Text
    doc.text(certificate.grade, 30, 130);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`SEER2 Rating: ${certificate.metrics.seer2}`, 80, 115);
    doc.text(`HSPF2 Rating: ${certificate.metrics.hspf2}`, 80, 125);
    doc.text(`Calculated Efficiency: ${certificate.efficiencyScore}/100`, 80, 135);

    // Value Propositions
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Financial Benefits for New Homeowners", 20, 160);
    
    const bulletY = 175;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(`• $12,000 Enbridge Rebate Certified (Tier 1 Status)`, 25, bulletY);
    doc.text(`• $${certificate.savingsProjected.toLocaleString()} Estimated 10-Year Energy Savings`, 25, bulletY + 10);
    doc.text(`• Immutable Service History on Private Ledger`, 25, bulletY + 20);
    doc.text(`• Transferable Warranty Eligibility`, 25, bulletY + 30);

    // Footer / Hash
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Asset Hash (SHA-256):", 20, 270);
    doc.text(certificate.assetHash, 20, 275);
    doc.text("Verified by Ambient Digital Twin", 20, 285);

    doc.save(`Realtor_Addendum_${certificate.id}.pdf`);
  };

  const formattedDate = new Date(certificate.timestamp).toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="relative w-full overflow-hidden rounded-lg p-[1.5px] bg-gradient-to-br from-orange-400/40 via-white/5 to-transparent shadow-2xl group transition-all hover:scale-[1.01] duration-700">
      
      {/* Metallic Dark Background */}
      <div className="absolute inset-0 bg-[#0f172a] backdrop-blur-3xl rounded-lg z-0" />
      
      {/* Iridescent Energy Wave */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/10 via-white/5 to-transparent opacity-60 mix-blend-overlay pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-orange-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 p-6 flex flex-col h-full justify-between min-h-[480px]">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-black tracking-[0.3em] text-orange-400/70 mb-1">Diligence Ready Asset</span>
            <h3 className="text-xl font-black text-white tracking-tight uppercase">Efficiency Ledger</h3>
          </div>
          {/* Simulated Chip/Hologram - High-End Gold/Orange */}
          <div className="w-14 h-10 rounded bg-gradient-to-br from-orange-100/30 to-orange-700/40 border border-orange-400/50 flex items-center justify-center relative overflow-hidden shadow-lg shadow-orange-900/20">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
             <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer absolute transform -skew-x-12 translate-x-[-150%]" />
             <svg className="w-7 h-7 text-white/90 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
          </div>
        </div>

        {/* PRO GRADE DISPLAY - REFACTORED FOR ORANGE IMPACT */}
        <div className="flex flex-col items-center justify-center my-8 relative">
          <div className="absolute -z-10 w-48 h-48 bg-orange-600/20 blur-[60px] rounded-full animate-pulse" />
          <div className="relative group cursor-default">
            <h1 className="text-9xl font-black bg-clip-text text-transparent bg-gradient-to-b from-orange-300 via-orange-500 to-orange-700 drop-shadow-[0_15px_35px_rgba(249,115,22,0.6)] tracking-tighter">
              {certificate.grade}
            </h1>
            <div className="absolute -right-10 top-4 bg-white text-orange-600 text-[11px] font-black px-3 py-1 rounded shadow-2xl border border-orange-200 transform rotate-6 scale-110">
              ELITE
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
             <div className="h-px w-8 bg-orange-500/30" />
             <div className="text-[12px] text-orange-200 font-black tracking-[0.2em] uppercase">
               Score: {certificate.efficiencyScore}.0
             </div>
             <div className="h-px w-8 bg-orange-500/30" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/[0.03] rounded border border-white/10 p-3 flex flex-col items-center backdrop-blur-xl group-hover:border-orange-500/30 transition-colors">
            <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-black mb-1">Standard SEER2</span>
            <span className="text-2xl font-black text-white">{certificate.metrics.seer2}</span>
          </div>
          <div className="bg-white/[0.03] rounded border border-white/10 p-3 flex flex-col items-center backdrop-blur-xl group-hover:border-orange-500/30 transition-colors">
            <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-black mb-1">HSPF2 Rating</span>
            <span className="text-2xl font-black text-white">{certificate.metrics.hspf2}</span>
          </div>
        </div>

        {/* Performance Banner */}
        <div className="flex items-center gap-4 bg-orange-600/10 border border-orange-500/20 rounded p-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/40">
             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-white uppercase tracking-wider">Enbridge Rebate Certified</span>
            <span className="text-[10px] text-orange-200/80 font-bold">Tier 1 Status: $12,000 Verified</span>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-5 border-t border-white/10 pt-5">
          <div className="flex justify-between items-center text-[9px] font-mono text-white/30 tracking-tight">
            <div className="flex flex-col gap-1 max-w-[65%]">
              <span className="uppercase text-[8px] tracking-[0.2em] text-white/20 font-black">Node Signature</span>
              <span className="break-all opacity-50">{certificate.assetHash}</span>
            </div>
            <div className="text-right">
              <span className="uppercase text-[8px] tracking-[0.2em] text-white/20 font-black block mb-1">Vault Sync</span>
              <span className="text-white/50">{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={generateRealtorPDF}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded bg-white/[0.05] hover:bg-orange-600 text-[10px] uppercase font-black tracking-[0.2em] text-white transition-all border border-white/5 hover:border-orange-400 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Addendum
            </button>
            
            <button 
              onClick={handleTogglePublish}
              disabled={isPublishing}
              className={`
                px-4 py-3 rounded text-[10px] uppercase font-black tracking-[0.2em] transition-all border
                ${certificate.isPublished 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-900/30'}
                ${isPublishing ? 'opacity-50 cursor-wait' : 'cursor-pointer active:scale-95'}
              `}
            >
              {isPublishing ? '...' : certificate.isPublished ? 'Synced' : 'Go Public'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
