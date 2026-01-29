
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GlassCard } from './GlassCard';
import { SalesLead } from '../types';
import { supabaseService } from '../services/supabaseService';

interface Props {
  lead: SalesLead;
  onClose: () => void;
}

export const OutreachGen: React.FC<Props> = ({ lead, onClose }) => {
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    generateEmail();
  }, []);

  const generateEmail = async () => {
    if (!process.env.API_KEY) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Role: B2B Tech Founder
        Target: HVAC Business Owner at ${lead.address.split('|')[0].trim()}
        Context: You are pitching them 'Ambient Twin' - a digital twin platform for their HVAC installs.
        
        Value Props to include:
        1. Eliminate 'No-Heat' callbacks by predicting system strain before it happens.
        2. Automate the Enbridge HER+ $12,000 grant documentation for their customers.
        3. Provide a 'Property Passport' (Blockchain-verified) that their customers can give to Realtors to increase home value.
        
        Tone: Bold, technical, executive-level. No fluff. 
        Subject: [Tech Partnership] Digital Twin layer for your Etobicoke installs?
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setDraft(response.text || "Drafting failed.");
    } catch (e) {
      setDraft("System error generating draft. Please check Uplink.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    navigator.clipboard.writeText(draft);
    await supabaseService.updateLeadStatus(lead.address, 'contacted');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <GlassCard title="B2B Outreach Architect" className="border-2 border-orange-500/30">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest">Partner Lead: {lead.address.split('|')[0]}</span>
               <button onClick={generateEmail} className="text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors">Regenerate Strategic Draft</button>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-xl p-8 relative min-h-[400px]">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                   <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Strategizing...</span>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-white font-sans text-sm leading-relaxed select-all">
                  {draft}
                </pre>
              )}
            </div>
            <div className="flex gap-4">
               <button onClick={onClose} className="flex-1 py-4 bg-white/5 text-white font-black text-[11px] uppercase tracking-widest rounded-xl">Dismiss</button>
               <button 
                 onClick={handleCopy}
                 className="flex-[2] py-4 bg-orange-600 hover:bg-orange-500 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-xl transition-all shadow-xl shadow-orange-900/40"
               >
                 Copy & Mark as Contacted
               </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
