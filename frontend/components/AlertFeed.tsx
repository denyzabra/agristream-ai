
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert } from '../types';
import { FarmerAlert } from '../hooks/useKafkaStream';
import GlassCard from './GlassCard';

const LiveTimestamp: React.FC<{ date: Date | string }> = ({ date }) => {
  const [text, setText] = useState('just now');

  useEffect(() => {
    const updateText = () => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const diff = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
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

const AlertCard: React.FC<{ alert: Alert | FarmerAlert }> = ({ alert }) => {
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

  // Check if alert has AI enrichment (type guard)
  const farmerAlert = alert as FarmerAlert;
  const hasAI = farmerAlert.aiPestType || farmerAlert.aiRecommendation;

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
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase">{alert.farmId}</span>
              {/* AI Badge */}
              {hasAI && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 rounded-full border border-purple-500/30">
                  <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-[9px] text-purple-300 font-bold">AI</span>
                </div>
              )}
            </div>
            <LiveTimestamp date={alert.timestamp} />
          </div>

          {/* AI Pest Type Badge */}
          {farmerAlert.aiPestType && (
            <div className="mb-2">
              <span className="inline-block px-2 py-1 bg-purple-500/10 rounded text-[10px] text-purple-300 font-mono border border-purple-500/20">
                🐛 {farmerAlert.aiPestType}
              </span>
            </div>
          )}

          <h4 className="text-sm font-bold text-white mb-1">{alert.title}</h4>
          <p className="text-xs text-gray-400 leading-relaxed">{alert.message}</p>

          {/* AI Recommendation */}
          {farmerAlert.aiRecommendation && (
            <div className="mt-3 p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
              <div className="text-[9px] text-purple-400 uppercase mb-1 font-bold tracking-wider">AI Recommendation</div>
              <p className="text-xs text-purple-200 leading-relaxed">{farmerAlert.aiRecommendation}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AlertFeed: React.FC<{ alerts: (Alert | FarmerAlert)[] }> = ({ alerts }) => {
  return (
    <GlassCard title="Real-Time Incident Stream" className="h-full" noPadding>
      <div className="p-4 h-[calc(100vh-280px)] overflow-y-auto overflow-x-hidden scroll-smooth">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert, index) => (
            <AlertCard key={alert.id || `alert-${index}-${alert.timestamp}`} alert={alert} />
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
