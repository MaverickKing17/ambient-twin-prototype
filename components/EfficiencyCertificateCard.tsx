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
    <div className="relative w-full overflow-hidden rounded-[4px] p-[1px] bg-gradient-to-br from-white/30 via-white/10 to-transparent shadow-xl group transition-all hover:scale-[1.01] duration-500">
      
      {/* Holographic Background Effect - Darker for contrast */}
      <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-3xl rounded-[3px] z-0" />
      
      {/* Iridescent Sheen - Warmer tones */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-white/5 to-transparent opacity-40 mix-blend-overlay pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-400/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 p-6 flex flex-col h-full justify-between min-h-[460px]">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mb-1">Web 3.0 Trust Layer</span>
            <h3 className="text-xl font-semibold text-white tracking-tight">Efficiency Certificate</h3>
          </div>
          {/* Simulated Chip/Hologram - Orange */}
          <div className="w-12 h-9 rounded-sm bg-gradient-to-br from-orange-200/20 to-orange-600/20 border border-orange-400/30 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
             <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer absolute transform -skew-x-12 translate-x-[-150%]" />
             <svg className="w-6 h-6 text-orange-400/90" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
          </div>
        </div>

        {/* Grade Display */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative">
            <h1 className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-orange-200 drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              {certificate.grade}
            </h1>
            <div className="absolute -right-6 top-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
              VERIFIED
            </div>
          </div>
          <div className="mt-2 text-sm text-white/60 font-medium">
            Score: {certificate.efficiencyScore}/100
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 rounded-sm p-3 border border-white/10 flex flex-col items-center backdrop-blur-sm">
            <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">SEER2</span>
            <span className="text-xl font-bold text-white">{certificate.metrics.seer2}</span>
          </div>
          <div className="bg-white/5 rounded-sm p-3 border border-white/10 flex flex-col items-center backdrop-blur-sm">
            <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">HSPF2</span>
            <span className="text-xl font-bold text-white">{certificate.metrics.hspf2}</span>
          </div>
        </div>

        {/* Enbridge Badge */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-sm p-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Enbridge Certified</span>
            <span className="text-[10px] text-white/60">Eligible for $12k Rebate</span>
          </div>
        </div>

        {/* Footer / Hash / Publish */}
        <div className="space-y-4 border-t border-white/10 pt-4">
          
          <div className="flex justify-between items-end text-[10px] font-mono text-white/40">
            <div className="flex flex-col gap-1 max-w-[65%]">
              <span className="uppercase tracking-widest text-white/20 font-bold">Asset Hash</span>
              <span className="break-all leading-tight">{certificate.assetHash}</span>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <span className="uppercase tracking-widest text-white/20 font-bold">Timestamp</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-black/20 rounded-sm p-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70 ml-1 font-medium">Homeowner View</span>
              {certificate.isPublished ? (
                <div className="flex items-center gap-2">
                  <a 
                    href={`#verify/${certificate.assetHash}`}
                    className="text-xs text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors font-semibold"
                  >
                    View Public URL
                  </a>
                  <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse"></div>
                </div>
              ) : (
                <button 
                  onClick={handleTogglePublish}
                  disabled={isPublishing}
                  className={`
                    relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900
                    ${isPublishing ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                    bg-white/10 hover:bg-white/20
                  `}
                >
                  <span className="sr-only">Publish</span>
                  <span className="inline-block h-3 w-3 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              )}
            </div>

            {/* Realtor Button */}
            <button
              onClick={generateRealtorPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white/10 hover:bg-orange-500 hover:text-white border border-white/10 text-[10px] uppercase font-bold tracking-wider text-white transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Share with Realtor
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};