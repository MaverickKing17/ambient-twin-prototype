
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TelemetryReading } from '../types';

interface HeartbeatGraphProps {
  data: TelemetryReading[];
}

export const HeartbeatGraph: React.FC<HeartbeatGraphProps> = ({ data }) => {
  // We focus on the core value: Is the system maintaining the target?
  const formattedData = data.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actual: d.indoorTemp,
    target: d.targetTemp,
  }));

  return (
    <div className="h-[250px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            minTickGap={60}
            dy={10}
            className="font-black uppercase tracking-widest"
          />
          <YAxis 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            domain={[18, 26]} // Focus on the comfort range
            tickFormatter={(value) => `${value}°`}
            className="font-black"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#161d2e', 
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '11px',
              color: '#fff',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              borderWidth: '2px'
            }}
            itemStyle={{ color: '#fff', padding: '4px 0', fontWeight: 'bold', textTransform: 'uppercase' }}
          />
          
          {/* Target Line - The Goal */}
          <Area 
            type="monotone" 
            dataKey="target" 
            stroke="#ffffff" 
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="transparent"
            name="Target Setpoint"
            animationDuration={1000}
          />

          {/* Actual Line - The Reality */}
          <Area 
            type="monotone" 
            dataKey="actual" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorActual)" 
            name="Actual Indoor"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Visual Legend */}
      <div className="flex justify-center gap-8 mt-4">
         <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Current Temp</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 border-b-2 border-dashed border-white/40" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Desired Target</span>
         </div>
      </div>
    </div>
  );
};
