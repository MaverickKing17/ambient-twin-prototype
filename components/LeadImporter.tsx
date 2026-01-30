
import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { supabaseService } from '../services/supabaseService';

interface Props {
  onComplete: () => void;
  onClose: () => void;
}

export const LeadImporter: React.FC<Props> = ({ onComplete, onClose }) => {
  const [data, setData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImport = async () => {
    setIsProcessing(true);
    
    // Split by lines
    const rows = data.split('\n').filter(r => r.trim());
    if (rows.length === 0) {
      setIsProcessing(false);
      return;
    }

    // Check if first row is header
    const hasHeader = rows[0].toLowerCase().includes('name') || rows[0].toLowerCase().includes('address');
    const startIndex = hasHeader ? 1 : 0;
    const headerRow = hasHeader ? rows[0].split(',') : [];

    // Find column indices
    const nameIdx = headerRow.findIndex(h => h.trim().toLowerCase() === 'name');
    const addressIdx = headerRow.findIndex(h => h.trim().toLowerCase() === 'full address');
    
    for (let i = startIndex; i < rows.length; i++) {
      // Basic CSV parse (handles commas inside quotes)
      const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
      const parts = rows[i].match(regex)?.map(p => p.replace(/"/g, '').trim()) || [];
      
      const companyName = nameIdx !== -1 ? parts[nameIdx] : parts[0];
      const address = addressIdx !== -1 ? parts[addressIdx] : (parts[1] || 'Unknown Address');
      
      if (companyName && address) {
        await supabaseService.captureLead({
          home_id: `H-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          address: `${companyName} | ${address}`,
          rebate_amount: 12000, // Default for 2026 HER+ estimates
          status: 'new'
        });
      }
    }
    
    setIsProcessing(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <GlassCard title="Enterprise CSV Importer" className="border-2 border-orange-500/30">
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">Paste raw CSV data (with headers):</p>
              <span className="text-[9px] font-black text-orange-400 uppercase bg-orange-400/10 px-2 py-1 rounded">Auto-Detect Enabled</span>
            </div>
            <textarea 
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Name,Full Address,Website...&#10;Enercare,123 Judge Rd,www.enercare.ca"
              className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-6 text-white font-mono text-xs focus:border-orange-500/50 outline-none transition-all custom-scrollbar"
            />
            <div className="flex gap-4">
               <button onClick={onClose} className="flex-1 py-4 bg-white/5 text-white font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">Cancel</button>
               <button 
                 onClick={handleImport}
                 disabled={isProcessing || !data}
                 className="flex-[2] py-4 bg-orange-600 hover:bg-orange-500 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-xl transition-all shadow-xl shadow-orange-900/40 disabled:opacity-50"
               >
                 {isProcessing ? 'PARSING DATASET...' : 'Sync Pipeline'}
               </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
