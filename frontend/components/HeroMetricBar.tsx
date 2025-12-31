
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Metric: React.FC<{ label: string; value: number | string; color: string; prefix?: string }> = ({ label, value, color, prefix }) => {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">{label}</span>
      <div className="flex items-baseline gap-1">
        {prefix && <span className="text-lg font-bold opacity-50">{prefix}</span>}
        <motion.span 
          key={value}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold font-mono tracking-tighter"
          style={{ color }}
        >
          {value}
        </motion.span>
      </div>
    </div>
  );
};

const HeroMetricBar: React.FC<{ health: number; alerts: number; farms: number; predictions: number }> = ({ health, alerts, farms, predictions }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex items-center justify-between px-8 py-4 bg-[#0a0f1a]/80 backdrop-blur-md border-b border-white/5 z-50 sticky top-0"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-slate-900" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0a0f1a] flex items-center justify-center border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            AgriStream <span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-[10px] uppercase font-mono text-gray-500 tracking-widest">
            Global Network Active • {new Date().toLocaleDateString('en-GB')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-12">
        <Metric label="System Health" value={health} color={health > 90 ? '#22ff88' : '#ffaa00'} prefix="%" />
        <div className="h-8 w-px bg-white/10" />
        <Metric label="Active Alerts" value={alerts} color={alerts > 5 ? '#ff3366' : '#22ff88'} />
        <div className="h-8 w-px bg-white/10" />
        <Metric label="Farms Monitored" value={farms} color="#00f5ff" />
        <div className="h-8 w-px bg-white/10" />
        <Metric label="Today's Predictions" value={predictions} color="#a855f7" />
      </div>

      <div className="flex items-center gap-4">
        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-medium transition-all">
          Command Panel
        </button>
      </div>
    </motion.div>
  );
};

export default HeroMetricBar;
