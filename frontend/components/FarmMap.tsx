
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

const FarmMap: React.FC = () => {
  const grid = Array.from({ length: 400 });

  // Generate consistent sensor nodes
  const nodes = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: 10 + Math.random() * 80, // % values
      y: 10 + Math.random() * 80,
      active: Math.random() > 0.2
    }));
  }, []);

  // Define lines between nearby nodes
  const connections = useMemo(() => {
    const lines: { x1: number, y1: number, x2: number, y2: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 25) { // Connection threshold
          lines.push({ x1: nodes[i].x, y1: nodes[i].y, x2: nodes[j].x, y2: nodes[j].y });
        }
      }
    }
    return lines;
  }, [nodes]);

  return (
    <GlassCard title="Multi-Spectral Farm Neural Mesh" className="h-[500px]" noPadding>
      <div className="relative w-full h-full overflow-hidden bg-slate-900/40">
        {/* Topographic Lines Background */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1000 1000">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="4" />
            <feDisplacementMap in="SourceGraphic" scale="20" />
          </filter>
          {Array.from({ length: 15 }).map((_, i) => (
            <circle
              key={i}
              cx="500"
              cy="500"
              r={100 + i * 50}
              fill="none"
              stroke="#00f5ff"
              strokeWidth="1"
              style={{ filter: 'url(#noise)' }}
            />
          ))}
        </svg>

        {/* Heatmap Grid */}
        <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 p-8 gap-0.5 opacity-40">
          {grid.map((_, i) => {
            const risk = Math.random();
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: risk > 0.8 ? [0.1, 0.4, 0.1] : 0.05,
                  backgroundColor: risk > 0.9 ? '#ff3366' : (risk > 0.8 ? '#ffaa00' : '#22ff88')
                }}
                transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 5 }}
                className="w-full h-full rounded-[1px]"
              />
            );
          })}
        </div>

        {/* Neural Mesh: Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {connections.map((line, i) => (
            <motion.line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(0, 245, 255, 0.15)"
              strokeWidth="0.1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, delay: i * 0.1 }}
            />
          ))}
          {/* Animated "data pulses" along lines */}
          {connections.slice(0, 8).map((line, i) => (
            <motion.circle
              key={`pulse-${i}`}
              r="0.3"
              fill="#00f5ff"
              initial={{ offsetDistance: "0%" }}
              animate={{ offsetDistance: "100%" }}
              style={{
                offsetPath: `path('M ${line.x1} ${line.y1} L ${line.x2} ${line.y2}')`,
                offsetRotate: "0deg"
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5
              }}
            />
          ))}
        </svg>

        {/* Sensor Nodes */}
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            className="absolute w-2 h-2 -ml-1 -mt-1 rounded-full z-20"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-20" />
            <div className={`relative w-full h-full rounded-full border border-white/20 ${node.active ? 'bg-cyan-500 shadow-[0_0_10px_rgba(0,245,255,0.5)]' : 'bg-slate-700'}`} />
          </motion.div>
        ))}

        {/* Labels & Callouts */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[30%] bg-black/60 backdrop-blur-lg border border-cyan-500/30 p-2 rounded-lg z-30"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-cyan-400">UNIT_042</span>
          </div>
          <div className="text-[12px] font-mono mt-1">NOMINAL: 24.5°C</div>
        </motion.div>

        {/* Map Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-40">
          <button className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <span className="text-sm">+</span>
          </button>
          <button className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <span className="text-sm">-</span>
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 flex items-center gap-4 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider text-gray-400 z-40">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" /> Healthy
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" /> Risk
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cyan-500" /> Sensor
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default FarmMap;
