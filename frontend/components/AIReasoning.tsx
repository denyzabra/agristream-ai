
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIStep } from '../types';
import { OutbreakPrediction } from '../hooks/useKafkaStream';
import GlassCard from './GlassCard';

interface AIReasoningProps {
  currentStep: AIStep;
  latestPrediction?: OutbreakPrediction | null;
}

const AIReasoning: React.FC<AIReasoningProps> = ({ currentStep, latestPrediction }) => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (currentStep !== AIStep.IDLE) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] > ${currentStep}...`].slice(-6));
    }
  }, [currentStep]);

  // Update logs when AI-enriched prediction arrives
  useEffect(() => {
    if (latestPrediction?.aiGenerated && latestPrediction.aiPestType) {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [
        `[${timestamp}] PEST IDENTIFIED: ${latestPrediction.aiPestType}`,
        `[${timestamp}] CONFIDENCE: ${Math.round((latestPrediction.aiConfidence || 0) * 100)}%`,
        `[${timestamp}] RISK LEVEL: ${latestPrediction.riskLevel}`,
        ...prev
      ].slice(0, 6));
    }
  }, [latestPrediction]);

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
              </React.Fragment>
            ))}
          </svg>
        </div>

        {/* AI-Generated Insights Display */}
        {latestPrediction?.aiGenerated && latestPrediction.aiPestType ? (
          <div className="flex-1 flex flex-col gap-3 relative z-10">
            {/* Detected Pest */}
            <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
              <div className="text-[10px] text-purple-400 uppercase mb-2 font-bold tracking-wider">Detected Pest</div>
              <div className="text-xl font-bold text-white">
                {latestPrediction.aiPestType}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Confidence: {Math.round((latestPrediction.aiConfidence || 0) * 100)}%
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex-1">
              <div className="text-[10px] text-purple-400 uppercase mb-2 font-bold tracking-wider">AI Reasoning</div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {latestPrediction.aiReasoning}
              </p>
            </div>

            {/* Recommended Action */}
            <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/20">
              <div className="text-[10px] text-cyan-400 uppercase mb-2 font-bold tracking-wider">Recommended Action</div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {latestPrediction.aiRecommendation}
              </p>
            </div>
          </div>
        ) : (
          /* Fallback: Static Animation */
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

            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-1">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className={`h-1 w-4 rounded-full ${i < 8 ? 'bg-purple-500' : 'bg-white/10'}`} />
                ))}
              </div>
              <span className="text-[10px] font-mono text-gray-500">MLX-7 NODE_09</span>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default AIReasoning;
