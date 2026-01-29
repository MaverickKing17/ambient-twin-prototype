import React, { useState } from 'react';
import { Check, Zap, Shield, Rocket, Activity, ChevronRight } from 'lucide-react';

const PricingSection = () => {
  // ROI Calculator State
  const [truckRolls, setTruckRolls] = useState(25);
  const [techs, setTechs] = useState(5);
  
  // GTA Market Assumptions
  const costPerRoll = 200; // CAD
  const savingsRate = 0.20; // 20% reduction in dry runs with Pro
  
  // Calculations
  const monthlySavings = (truckRolls * costPerRoll) * savingsRate;
  const annualSavings = monthlySavings * 12;
  const proCostYearly = (299 * 12) + 3000; // SaaS + Implementation
  const paybackDays = Math.round((3000 / (monthlySavings)) * 30);

  return (
    <div className="w-full bg-slate-900 py-24 px-4 sm:px-6 lg:px-8 font-sans border-t border-slate-800">
      
      {/* SECTION HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
          Operational Infrastructure for <span className="text-emerald-400">High-Performance Teams</span>
        </h2>
        <p className="text-slate-400 text-lg">
          Stop bleeding margin on dry truck rolls. Our Pro Tier pays for itself in less than 90 days.
        </p>
      </div>

      {/* 1. ROI CALCULATOR COMPONENT */}
      <div className="max-w-5xl mx-auto bg-slate-800/50 rounded-3xl p-8 mb-20 border border-slate-700 shadow-2xl backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
          
          {/* Inputs */}
          <div className="flex-1 w-full space-y-8">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">Avg. Monthly Truck Rolls (Per Tech)</label>
                <span className="text-emerald-400 font-bold text-lg">{truckRolls}</span>
              </div>
              <input 
                type="range" min="10" max="100" value={truckRolls} 
                onChange={(e) => setTruckRolls(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">Number of Service Techs</label>
                <span className="text-emerald-400 font-bold text-lg">{techs}</span>
              </div>
              <input 
                type="range" min="1" max="50" value={techs} 
                onChange={(e) => setTechs(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
              />
            </div>
          </div>

          {/* Results Display */}
          <div className="bg-slate-900/80 p-8 rounded-2xl border border-emerald-500/30 w-full md:w-auto min-w-[320px] text-center shadow-lg">
            <h3 className="text-slate-400 text-sm uppercase tracking-widest font-semibold mb-2">Est. Annual Savings</h3>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">
              ${(annualSavings * techs).toLocaleString()} <span className="text-lg font-medium text-slate-500">CAD</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mt-2">
              <Activity className="w-3 h-3" />
              ROI Break-even: ~{Math.max(1, Math.round((3000 / (monthlySavings * techs)) * 30))} Days
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRICING TIERS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* BASIC TIER */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-all duration-300">
          <h3 className="text-xl font-bold text-white mb-2">Basic</h3>
          <p className="text-slate-400 text-sm mb-6">Visibility for small fleets.</p>
          <div className="flex items-baseline mb-2">
            <span className="text-4xl font-bold text-white">$149</span>
            <span className="text-slate-500 ml-2">/mo</span>
          </div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-8">+$1,500 Implementation</p>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center text-slate-300 text-sm"><Check className="w-4 h-4 text-emerald-500 mr-3" /> Live Fleet Map</li>
            <li className="flex items-center text-slate-300 text-sm"><Check className="w-4 h-4 text-emerald-500 mr-3" /> Basic Telemetry</li>
            <li className="flex items-center text-slate-300 text-sm"><Check className="w-4 h-4 text-emerald-500 mr-3" /> Email Support</li>
          </ul>
          <button className="w-full py-3 rounded-lg border border-slate-600 text-white font-semibold hover:bg-slate-700 transition-colors">
            Select Basic
          </button>
        </div>

        {/* PRO TIER (HIGHLIGHTED) */}
        <div className="bg-slate-800 rounded-2xl p-8 border-2 border-emerald-500 relative transform md:-translate-y-4 shadow-2xl shadow-emerald-900/20">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">MOST POPULAR</div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            Pro <Rocket className="w-4 h-4 text-emerald-400" />
          </h3>
          <p className="text-emerald-400/80 text-sm mb-6">Operational efficiency engine.</p>
          <div className="flex items-baseline mb-2">
            <span className="text-5xl font-bold text-white">$299</span>
            <span className="text-slate-500 ml-2">/mo</span>
          </div>
          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wide mb-8">+$3,000 Implementation</p>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center text-white text-sm font-medium"><Check className="w-4 h-4 text-emerald-400 mr-3" /> Predictive Drift Alerts</li>
            <li className="flex items-center text-white text-sm font-medium"><Check className="w-4 h-4 text-emerald-400 mr-3" /> Automated Diagnostic Pre-Briefs</li>
            <li className="flex items-center text-white text-sm font-medium"><Check className="w-4 h-4 text-emerald-400 mr-3" /> Predictive Lead Generation</li>
            <li className="flex items-center text-slate-300 text-sm"><Check className="w-4 h-4 text-emerald-500 mr-3" /> One-Click FSM Export</li>
            <li className="flex items-center text-slate-300 text-sm"><Check className="w-4 h-4 text-emerald-500 mr-3" /> 250 Unit Capacity</li>
          </ul>
          <button className="w-full py-4 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2">
            Start Implementation <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ENTERPRISE TIER */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-all duration-300">
          <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
          <p className="text-slate-400 text-sm mb-6">Full scale automation.</p>
          <div className="flex items-baseline mb-2">
            <span className="text-4xl font-bold text-white">$599+</span>
            <span className="text-slate-500 ml-2">/mo</span>
          </div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-8">Custom Setup</p>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center text-slate-300 text-sm"><Check className="w-4 h-4 text-emerald-500 mr-3" /> Full ServiceTitan Sync</li>
            <li className="flex items-center text-slate-300 text-sm"><Check className="w-4 h-4 text-emerald-500 mr-3" /> Unlimited Units</li>
            <li className="flex items-center text-slate-300 text-sm"><Check className="w-4 h-4 text-emerald-500 mr-3" /> Dedicated Success Manager</li>
            <li className="flex items-center text-slate-300 text-sm"><Check className="w-4 h-4 text-emerald-500 mr-3" /> Custom SLA</li>
          </ul>
          <button className="w-full py-3 rounded-lg border border-slate-600 text-white font-semibold hover:bg-slate-700 transition-colors">
            Contact Sales
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default PricingSection;
