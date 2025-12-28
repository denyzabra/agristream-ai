
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert } from '../types';
import GlassCard from './GlassCard';

const LiveTimestamp: React.FC<{ date: Date }> = ({ date }) => {
  const [text, setText] = useState('just now');

  useEffect(() => {
    const updateText = () => {
      const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      if (diff < 60) setText(`${diff}s ago`);
      else if (diff < 3600) setText(`${Math.floor(diff / 60)}m ago`);
      else setText(`${Math.floor(diff / 3600)}h ago`);
    };

    updateText();
    const interval = setInterval(updateText, 1000);
    return () => clearInterval(interval);
  }, [date]);

  return <span className="text-[10px] font-mono text-gray-500">{text}</span>;
};

const AlertCard: React.FC<{ alert: Alert }> = ({ alert }) => {
  const colorMap = {
    info: 'border-cyan-500',
    warning: 'border-amber-500',
    critical: 'border-red-500 bg-red-500/5'
  };

  const iconMap = {
    info: (
      <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-cyan-500" />
      </div>
    ),
    warning: (
      <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-amber-500" />
      </div>
    ),
    critical: (
      <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
        <div className="w-2 h-2 rounded-full bg-red-500" />
      </div>
    )
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      className={`p-4 rounded-2xl border-l-4 ${colorMap[alert.type]} bg-white/5 border border-white/5 group hover:bg-white/10 transition-all duration-300 mb-3`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">{iconMap[alert.type]}</div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase">{alert.farmId}</span>
            <LiveTimestamp date={alert.timestamp} />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">{alert.title}</h4>
          <p className="text-xs text-gray-400 leading-relaxed">{alert.message}</p>
        </div>
      </div>
    </motion.div>
  );
};

const AlertFeed: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
  return (
    <GlassCard title="Real-Time Incident Stream" className="h-full" noPadding>
      <div className="p-4 h-[calc(100vh-280px)] overflow-y-auto overflow-x-hidden scroll-smooth">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </AnimatePresence>
        {alerts.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 font-mono text-[10px] uppercase opacity-50 space-y-2">
            <div className="w-8 h-8 rounded-full border border-dashed border-gray-600 animate-spin" />
            <span>Scanning Network...</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default AlertFeed;
