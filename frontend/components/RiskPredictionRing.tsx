
import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import GlassCard from './GlassCard';

const data = [
  { value: 40 }, { value: 35 }, { value: 45 }, { value: 42 }, 
  { value: 50 }, { value: 55 }, { value: 48 }, { value: 62 },
  { value: 68 }, { value: 72 }, { value: 75 }, { value: 74 }
];

const RiskPredictionRing: React.FC<{ risk: number }> = ({ risk }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (risk / 100) * circumference;

  const isHigh = risk >= 70;
  const isCritical = risk >= 90;

  return (
    <GlassCard title="Global Outbreak Risk" className="h-[500px] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center relative py-4">
        {/* SVG Gauge */}
        <div className="relative w-48 h-48">
          {/* Pulsing Background Glow */}
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
            animate={isHigh ? {
              backgroundColor: isCritical ? 'rgba(255, 51, 102, 0.15)' : 'rgba(255, 170, 0, 0.1)',
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            } : { opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <svg className="w-full h-full -rotate-90 relative z-10">
            {/* Background Track */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Progress Arc */}
            <motion.circle
              cx="96"
              cy="96"
              r={radius}
              stroke="url(#riskGradient)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ 
                strokeDashoffset: offset,
                strokeWidth: isCritical ? [12, 14, 12] : 12
              }}
              transition={{ 
                strokeDashoffset: { duration: 2, ease: "easeOut" },
                strokeWidth: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f5ff" />
                <stop offset="50%" stopColor="#ffaa00" />
                <stop offset="100%" stopColor="#ff3366" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <motion.span 
              key={risk}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-4xl font-mono font-bold transition-colors duration-500 ${isCritical ? 'text-red-500' : (isHigh ? 'text-amber-400' : 'text-white')}`}
            >
              {risk}
              <span className="text-sm opacity-50">%</span>
            </motion.span>
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-mono mt-1">
              {isCritical ? 'Status: Critical' : (isHigh ? 'Status: Elevated' : 'Status: Nominal')}
            </span>
          </div>

          {/* Orbiting Particle */}
          <motion.div
            className={`absolute top-1/2 left-1/2 w-3 h-3 rounded-full z-10 transition-colors duration-500 ${isCritical ? 'bg-red-500 shadow-[0_0_20px_rgba(255,51,102,0.8)]' : 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]'}`}
            animate={{
              x: Math.cos((risk / 100) * 2 * Math.PI - Math.PI / 2) * radius,
              y: Math.sin((risk / 100) * 2 * Math.PI - Math.PI / 2) * radius,
            }}
            transition={{ type: "spring", stiffness: 50 }}
            style={{ marginLeft: -6, marginTop: -6 }}
          />
        </div>

        {/* Status Indicators */}
        <div className="mt-8 grid grid-cols-2 gap-8 w-full">
          <div className="text-center">
            <div className="text-[10px] text-gray-500 font-mono uppercase mb-1">Confidence</div>
            <div className="text-xl font-mono text-cyan-400">98.2%</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 font-mono uppercase mb-1">Threat Trajectory</div>
            <div className={`text-xl font-mono transition-colors duration-500 ${isHigh ? 'text-red-400' : 'text-green-400'}`}>
              {risk > 50 ? 'Rising' : 'Stable'}
            </div>
          </div>
        </div>
      </div>

      {/* History Sparkline */}
      <div className="h-20 w-full mt-auto border-t border-white/5 pt-4">
        <div className="text-[10px] text-gray-500 font-mono uppercase mb-2">24H Trend Analysis</div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#00f5ff" 
              strokeWidth={2} 
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export default RiskPredictionRing;
