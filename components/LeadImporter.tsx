
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
    const rows = data.split('\n').filter(r => r.trim());
    
    for (const row of rows) {
      const parts = row.split(',').map(p => p.trim());
      // Expecting: Address, Rebate (Optional)
      if (parts[0]) {
        await supabaseService.captureLead({
          home_id: `H-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          address: parts[0],
          rebate_amount: parseInt(parts[1]) || 12000,
          status: 'new'
        });
      }
    }
    
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <GlassCard title="Enterprise Lead Importer" className="border-2 border-orange-500/30">
          <div className="space-y-6">
            <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">Paste rows from Google Sheets (Address, Potential Rebate):</p>
            <textarea 
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="123 Example St, 12000&#10;456 Road Ave, 10500"
              className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-6 text-white font-mono text-sm focus:border-orange-500/50 outline-none transition-all"
            />
            <div className="flex gap-4">
               <button onClick={onClose} className="flex-1 py-4 bg-white/5 text-white font-black text-[11px] uppercase tracking-widest rounded-xl">Cancel</button>
               <button 
                 onClick={handleImport}
                 disabled={isProcessing}
                 className="flex-[2] py-4 bg-orange-600 hover:bg-orange-500 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-xl transition-all shadow-xl shadow-orange-900/40"
               >
                 {isProcessing ? 'SYNCHRONIZING...' : 'Establish Pipeline'}
               </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
