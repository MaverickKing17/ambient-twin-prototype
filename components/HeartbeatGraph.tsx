import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TelemetryReading } from '../types';

interface HeartbeatGraphProps {
  data: TelemetryReading[];
}

export const HeartbeatGraph: React.FC<HeartbeatGraphProps> = ({ data }) => {
  const formattedData = data.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: d.indoorTemp,
    efficiency: d.powerUsageWatts > 0 ? (Math.abs(d.targetTemp - d.indoorTemp) / d.powerUsageWatts) * 1000 : 0
  }));

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            minTickGap={30}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              backdropFilter: 'blur(4px)',
              color: '#fff'
            }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Area 
            type="monotone" 
            dataKey="temp" 
            stroke="#06b6d4" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorTemp)" 
            name="Indoor Temp (°C)"
          />
           <Area 
            type="monotone" 
            dataKey="efficiency" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorEff)" 
            name="Efficiency Index"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
