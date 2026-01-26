
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
    <div className="h-[250px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            minTickGap={40}
            dy={10}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            domain={['dataMin - 1', 'dataMax + 1']}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#161d2e', 
              borderColor: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#fff',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
            }}
            itemStyle={{ color: '#fff', padding: '2px 0' }}
          />
          <Area 
            type="monotone" 
            dataKey="temp" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorTemp)" 
            name="Temp (°C)"
            animationDuration={1500}
          />
           <Area 
            type="monotone" 
            dataKey="efficiency" 
            stroke="#ffffff" 
            strokeWidth={1}
            strokeDasharray="4 2"
            fillOpacity={1} 
            fill="url(#colorEff)" 
            name="Efficiency"
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};