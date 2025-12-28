
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIStep } from '../types';
import GlassCard from './GlassCard';

const AIReasoning: React.FC<{ currentStep: AIStep }> = ({ currentStep }) => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (currentStep !== AIStep.IDLE) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] > ${currentStep}...`].slice(-6));
    }
  }, [currentStep]);

  return (
    <GlassCard title="Predictive AI Cognition" className="h-[400px]">
      <div className="relative h-full flex flex-col">
        {/* Neural Network Background Visualization */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 400 300">
            {Array.from({ length: 8 }).map((_, i) => (
              <React.Fragment key={i}>
                <motion.circle
                  cx={100 + Math.random() * 200}
                  cy={50 + Math.random() * 200}
                  r="2"
                  fill="#a855f7"
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                />
                <motion.line
                  x1={100 + Math.random() * 200}
                  y1={50 + Math.random() * 200}
                  x2={100 + Math.random() * 200}
                  y2={50 + Math.random() * 200}
                  stroke="#a855f7"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: [0, 1, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                />
              </React.Fragment>
            ))}
          </svg>
        </div>

        <div className="flex-1 flex flex-col justify-end gap-2 font-mono relative z-10">
          <div className="mb-4">
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block mb-2">Active Reasoning Cycle</span>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ height: [4, 16, 4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1 bg-purple-500 rounded-full"
                  />
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentStep}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="text-lg text-white font-medium"
                >
                  {currentStep}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-1">
            {logs.map((log, i) => (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                key={i}
                className="text-[10px] text-gray-500 flex gap-2"
              >
                <span className="text-purple-500/50">#</span>
                {log}
              </motion.div>
            ))}
            <div className="text-[10px] text-purple-400 animate-pulse">_</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={`h-1 w-4 rounded-full ${i < 8 ? 'bg-purple-500' : 'bg-white/10'}`} />
            ))}
          </div>
          <span className="text-[10px] font-mono text-gray-500">MLX-7 NODE_09</span>
        </div>
      </div>
    </GlassCard>
  );
};

export default AIReasoning;
