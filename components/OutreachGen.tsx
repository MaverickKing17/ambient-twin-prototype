
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GlassCard } from './GlassCard';
import { SalesLead } from '../types';

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
      const prompt = `Write a high-converting B2B cold outreach email for a local HVAC company. 
      The target is a homeowner at ${lead.address}. 
      Reference that their property is eligible for a ${lead.rebate_amount} grant (like Enbridge HER+). 
      Pitch the "Ambient Twin" technology which uses a Digital Twin of their system to guarantee performance and secure the grant. 
      Keep it professional, high-tech, and value-driven. Subject line should be urgent and personalized.`;
      
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

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <GlassCard title="AI Outreach Architect" className="border-2 border-orange-500/30">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest">Lead: {lead.address}</span>
               <button onClick={generateEmail} className="text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors">Regenerate Draft</button>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-xl p-8 relative min-h-[400px]">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                   <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Forensic Drafting...</span>
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
                 onClick={() => {
                   navigator.clipboard.writeText(draft);
                   onClose();
                 }}
                 className="flex-[2] py-4 bg-orange-600 hover:bg-orange-500 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-xl transition-all shadow-xl shadow-orange-900/40"
               >
                 Copy to Clipboard
               </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
