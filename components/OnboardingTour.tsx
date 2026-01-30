import React, { useState, useEffect } from 'react';

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: 'bottom' | 'top' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-header',
    title: 'GTA Command Hub',
    content: 'Welcome to the Toronto HVAC sector. This header tracks your active uplink to the city-wide mechanical grid.',
    position: 'bottom'
  },
  {
    targetId: 'tour-health',
    title: 'Asset Wellness Score',
    content: 'This is your primary KPI. It represents the real-time health of the property assets. Aim for >85% for grant eligibility.',
    position: 'right'
  },
  {
    targetId: 'tour-ai',
    title: 'AI Infrastructure Log',
    content: 'Our Gemini-powered Oracle analyzes telemetry to find energy waste and rebate opportunities automatically.',
    position: 'left'
  },
  {
    targetId: 'tour-alerts',
    title: 'Infrastructure Triage',
    content: 'Critical faults appear here. Use these to justify Enbridge HER+ $12,000 grant claims for your clients.',
    position: 'top'
  },
  {
    targetId: 'tour-passport',
    title: 'Digital Asset Passport',
    content: 'Mint your efficiency scores as verifiable property certificates. Realtors use these to boost listing prices.',
    position: 'top'
  }
];

interface Props {
  onComplete: () => void;
}

export const OnboardingTour: React.FC<Props> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [style, setStyle] = useState<React.CSSProperties>({});
  
  useEffect(() => {
    const step = TOUR_STEPS[currentStep];
    const element = document.getElementById(step.targetId);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      setStyle({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        position: 'absolute',
        zIndex: 1000,
        boxShadow: '0 0 0 9999px rgba(11, 17, 33, 0.85)',
        borderRadius: '12px',
        border: '3px solid #f97316',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      });
      
      // Scroll to element
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(curr => curr - 1);
  };

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-none overflow-hidden">
      {/* Target Highlight */}
      <div style={style} className="pointer-events-none">
        <div className="absolute inset-0 bg-orange-500/10 animate-pulse rounded-lg" />
      </div>

      {/* Control Card */}
      <div 
        className="fixed z-[1001] pointer-events-auto transition-all duration-500"
        style={{
          bottom: '10%',
          right: '50%',
          transform: 'translateX(50%)',
          width: 'min(90vw, 420px)'
        }}
      >
        <div className="bg-[#161d2e] border-2 border-orange-500/40 rounded-3xl p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
              <div 
                className="h-full bg-orange-500 transition-all duration-500" 
                style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
              />
           </div>
           
           <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.4em]">Sector Guide {currentStep + 1}/{TOUR_STEPS.length}</span>
              <button onClick={onComplete} className="text-[9px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-colors">Terminate</button>
           </div>
           
           <h3 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase">{step.title}</h3>
           <p className="text-sm text-white/70 font-medium leading-relaxed mb-8">{step.content}</p>
           
           <div className="flex gap-4">
              <button 
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex-1 py-4 rounded-xl border border-white/10 text-[11px] font-black text-white/50 hover:text-white uppercase tracking-widest transition-all disabled:opacity-0"
              >
                Back
              </button>
              <button 
                onClick={handleNext}
                className="flex-[2] py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-[11px] font-black text-white uppercase tracking-[0.3em] transition-all shadow-xl shadow-orange-900/40"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Start Mission' : 'Next Step'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};