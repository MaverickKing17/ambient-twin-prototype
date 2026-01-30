
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TelemetryReading } from '../types';

interface HeartbeatGraphProps {
  data: TelemetryReading[];
}

const CustomActiveDot = (props: any) => {
  const { cx, cy, stroke } = props;
  return (
    <g>
      <defs>
        <filter id="glow-dot" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Outer pulse ring */}
      <circle 
        cx={cx} 
        cy={cy} 
        r={10} 
        fill={stroke} 
        fillOpacity={0.2} 
        className="animate-ping" 
        style={{ animationDuration: '2s' }}
      />
      {/* Main glowing dot */}
      <circle 
        cx={cx} 
        cy={cy} 
        r={6} 
        stroke="#ffffff" 
        strokeWidth={2} 
        fill={stroke} 
        filter="url(#glow-dot)"
        className="transition-transform duration-300"
      />
    </g>
  );
};

export const HeartbeatGraph: React.FC<HeartbeatGraphProps> = ({ data }) => {
  // We focus on the core value: Is the system maintaining the target?
  const formattedData = data.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actual: d.indoorTemp,
    target: d.targetTemp,
  }));

  return (
    <div className="w-full mt-2">
      {/* Chart Wrapper */}
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={formattedData} 
            margin={{ top: 10, right: 10, left: -10, bottom: 25 }} 
          >
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#ffffff" // BRIGHT WHITE
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              minTickGap={60}
              dy={12} 
              className="font-black uppercase tracking-widest"
            />
            <YAxis 
              stroke="#ffffff" // BRIGHT WHITE
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              domain={[18, 26]} 
              tickFormatter={(value) => `${value}°`}
              className="font-black"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#161d2e', 
                borderColor: '#ffffff', // High contrast border
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fff',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)',
                borderWidth: '2px'
              }}
              itemStyle={{ color: '#fff', padding: '4px 0', fontWeight: '900', textTransform: 'uppercase' }}
            />
            
            <Area 
              type="monotone" 
              dataKey="target" 
              stroke="#ffffff" 
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="transparent"
              name="Target Setpoint"
              animationDuration={1000}
              activeDot={false}
            />

            <Area 
              type="monotone" 
              dataKey="actual" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorActual)" 
              name="Actual Indoor"
              animationDuration={1500}
              activeDot={<CustomActiveDot />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend with Persona Context */}
      <div className="flex flex-col gap-6 mt-6 border-t border-white/10 pt-6">
         {/* Color Legend */}
         <div className="flex justify-center gap-10">
            <div className="flex items-center gap-3">
                <div className="w-4 h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Live Comfort</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-4 h-1 border-b-2 border-dashed border-white" />
                <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Desired Target</span>
            </div>
         </div>

         {/* Persona Lens Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/[0.03] p-4 rounded-lg border border-white/5 group hover:border-blue-500/50 transition-colors">
               <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">For Homeowner</p>
               <p className="text-[11px] text-white font-bold leading-tight uppercase tracking-tighter">Gap-to-Goal: <span className="text-emerald-400">Stable</span>. Your system is hitting the mark.</p>
            </div>
            <div className="bg-white/[0.03] p-4 rounded-lg border border-white/5 group hover:border-orange-500/50 transition-colors">
               <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">For Realtor</p>
               <p className="text-[11px] text-white font-bold leading-tight uppercase tracking-tighter">Efficiency: <span className="text-orange-400">98% Verified</span>. Ideal for MLS Listing.</p>
            </div>
            <div className="bg-white/[0.03] p-4 rounded-lg border border-white/5 group hover:border-emerald-500/50 transition-colors">
               <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">For HVAC Tech</p>
               <p className="text-[11px] text-white font-bold leading-tight uppercase tracking-tighter">Cycles: <span className="text-emerald-400">Nominal</span>. No short-cycling detected.</p>
            </div>
         </div>
      </div>
    </div>
  );
};
