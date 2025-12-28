
import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, ReferenceLine } from 'recharts';
import GlassCard from './GlassCard';

const generateData = (base: number, variance: number) => {
  return Array.from({ length: 20 }).map((_, i) => ({
    time: i,
    value: base + (Math.random() - 0.5) * variance
  }));
};

const MiniStream: React.FC<{ label: string; data: any[]; color: string; unit: string; threshold: number }> = ({ label, data, color, unit, threshold }) => {
  const currentValue = data[data.length - 1].value.toFixed(1);
  const isAboveThreshold = Number(currentValue) > threshold;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end px-1">
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{label}</span>
        <span className={`text-sm font-mono font-bold ${isAboveThreshold ? 'text-red-400 animate-pulse' : ''}`}>
          {currentValue}{unit}
        </span>
      </div>
      <div className="h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
            <ReferenceLine y={threshold} stroke={color} strokeDasharray="3 3" opacity={0.3} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              fillOpacity={1} 
              fill={`url(#grad-${label})`} 
              strokeWidth={1.5}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const SensorStreams: React.FC<{ data: any }> = ({ data }) => {
  return (
    <GlassCard title="Atmospheric Neural Feed" className="h-[400px]">
      <div className="flex flex-col gap-6 h-full justify-between">
        <MiniStream 
          label="Temperature" 
          unit="°C" 
          data={data.temp} 
          color="#00f5ff" 
          threshold={28}
        />
        <MiniStream 
          label="Humidity" 
          unit="%" 
          data={data.humidity} 
          color="#a855f7" 
          threshold={85}
        />
        <MiniStream 
          label="Soil Moisture" 
          unit="%" 
          data={data.moisture} 
          color="#22ff88" 
          threshold={40}
        />
      </div>
    </GlassCard>
  );
};

export default SensorStreams;
