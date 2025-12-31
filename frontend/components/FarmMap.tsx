import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSensorStream, usePredictionStream, FarmerAlert } from '../hooks/useKafkaStream';

interface FarmMapProps {
  alerts: FarmerAlert[];
}

const FarmMap: React.FC<FarmMapProps> = ({ alerts = [] }) => {
  const { data: sensorData } = useSensorStream();
  const { data: predictions } = usePredictionStream();
  const [zoom, setZoom] = React.useState(1);

  // Get sensors with recent alerts (last 2 minutes)
  const alertedSensors = useMemo(() => {
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    const recentAlerts = new Map();

    alerts.forEach(alert => {
      const alertTime = new Date(alert.timestamp).getTime();
      if (alertTime > twoMinutesAgo && alert.sensorId) {
        if (!recentAlerts.has(alert.sensorId)) {
          recentAlerts.set(alert.sensorId, []);
        }
        recentAlerts.get(alert.sensorId).push(alert);
      }
    });

    return recentAlerts;
  }, [alerts]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.6));

  // Fixed sensor positions for 3 farms (2 sensors each)
  const sensorPositions: Record<string, { x: number; y: number }> = {
    'SENSOR-001': { x: 25, y: 30 },
    'SENSOR-002': { x: 35, y: 45 },
    'SENSOR-003': { x: 50, y: 25 },
    'SENSOR-004': { x: 55, y: 60 },
    'SENSOR-005': { x: 70, y: 35 },
    'SENSOR-006': { x: 75, y: 70 }
  };

  const nodes = useMemo(() => {
    const baseNodes = Object.entries(sensorPositions).map(([id, pos]) => ({
      id,
      x: pos.x,
      y: pos.y,
      active: false,
      temp: 24.0,
      risk: 0
    }));

    if (!sensorData || sensorData.length === 0) {
      return baseNodes;
    }

    const latestBySensor = new Map();
    sensorData.forEach(reading => {
      if (reading?.sensorId && !latestBySensor.has(reading.sensorId)) {
        latestBySensor.set(reading.sensorId, reading);
      }
    });

    const riskBySensor = new Map();
    predictions?.forEach(pred => {
      if (pred?.sensorId) {
        riskBySensor.set(pred.sensorId, pred.riskScore || 0);
      }
    });

    return baseNodes.map(node => {
      const reading = latestBySensor.get(node.id);
      if (reading) {
        return {
          ...node,
          active: true,
          temp: reading.temperature || 24.0,
          risk: riskBySensor.get(node.id) || 0
        };
      }
      return node;
    });
  }, [sensorData, predictions]);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-[#111827]/40 backdrop-blur-2xl border border-white/10 h-[500px] group hover:border-white/20 transition-all duration-500">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-gray-400 font-mono">
          Multi-Spectral Farm Neural Mesh
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 font-mono">
            {nodes.filter(n => n.active).length}/{nodes.length} ACTIVE
          </span>
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative w-full h-[calc(100%-60px)] bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >

        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(#00f5ff 1px, transparent 1px), linear-gradient(90deg, #00f5ff 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Topographic Circles */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 100">
          {Array.from({ length: 12 }).map((_, i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={5 + i * 4}
              fill="none"
              stroke="#00f5ff"
              strokeWidth="0.1"
            />
          ))}
        </svg>

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
          {nodes.map((node1, i) =>
            nodes.slice(i + 1).map((node2, j) => {
              const dx = node1.x - node2.x;
              const dy = node1.y - node2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 35) {
                return (
                  <motion.line
                    key={`${i}-${j}`}
                    x1={node1.x}
                    y1={node1.y}
                    x2={node2.x}
                    y2={node2.y}
                    stroke="rgba(6, 182, 212, 0.2)"
                    strokeWidth="0.15"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, delay: (i + j) * 0.1 }}
                  />
                );
              }
              return null;
            })
          )}
        </svg>

        {/* Sensor Nodes */}
        {nodes.map((node, i) => {
          const hasAlert = alertedSensors.has(node.id);
          const alertCount = hasAlert ? alertedSensors.get(node.id).length : 0;
          const isHighRisk = node.risk > 70;
          const isMediumRisk = node.risk > 50;

          // Override color if sensor has active alert
          const color = hasAlert ? '#ef4444' : // Red for alerted sensors
                       !node.active ? '#64748b' :
                       isHighRisk ? '#ef4444' :
                       isMediumRisk ? '#f59e0b' : '#06b6d4';

          return (
            <motion.div
              key={node.id}
              className="absolute z-30"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1, type: "spring" }}
            >
              {/* Ping animation - stronger for alerted sensors */}
              <div
                className={`absolute inset-0 rounded-full animate-ping ${hasAlert ? 'opacity-40' : 'opacity-20'}`}
                style={{
                  width: hasAlert ? '30px' : '20px',
                  height: hasAlert ? '30px' : '20px',
                  backgroundColor: color,
                  margin: hasAlert ? '-11px' : '-6px'
                }}
              />

              {/* Alert pulse ring */}
              {hasAlert && (
                <div
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    width: '24px',
                    height: '24px',
                    margin: '-8px',
                    border: '2px solid #ef4444',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)'
                  }}
                />
              )}

              {/* Sensor dot */}
              <div
                className={`relative rounded-full border-2 ${hasAlert ? 'border-white' : 'border-white/40'}`}
                style={{
                  width: hasAlert ? '12px' : '8px',
                  height: hasAlert ? '12px' : '8px',
                  backgroundColor: color,
                  boxShadow: hasAlert ? `0 0 20px ${color}` : `0 0 15px ${color}80`
                }}
              >
                {/* Alert count badge */}
                {hasAlert && alertCount > 1 && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
                    {alertCount}
                  </div>
                )}
              </div>

              {/* Label - appears on hover OR always for alerted sensors */}
              <div className={`absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap transition-opacity ${hasAlert ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <div
                  className={`backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono border ${hasAlert ? 'bg-red-900/90 border-red-500' : 'bg-black/90'}`}
                  style={{
                    color: hasAlert ? '#fff' : color,
                    borderColor: hasAlert ? '#ef4444' : `${color}40`
                  }}
                >
                  {hasAlert && <span className="text-red-300">⚠️ </span>}
                  {node.id.replace('SENSOR-', 'S')}
                  <span className="text-white"> • {node.temp.toFixed(1)}°C</span>
                  {node.risk > 0 && <span className="text-amber-400"> • {node.risk.toFixed(0)}% risk</span>}
                  {hasAlert && <div className="text-red-200 text-[9px] mt-0.5 border-t border-red-500/30 pt-0.5">{alertCount} active alert{alertCount > 1 ? 's' : ''}</div>}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-black/70 backdrop-blur-md border border-white/10 px-3 py-2 rounded-lg z-40">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-[10px] text-gray-400 font-mono">NOMINAL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] text-gray-400 font-mono">WARNING</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-gray-400 font-mono">CRITICAL</span>
          </div>
        </div>

        {/* No data overlay */}
        {(!sensorData || sensorData.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-50"
          >
            <div className="text-center">
              <div className="flex gap-1 justify-center mb-3">
                {[0,1,2].map(i => (
                  <div
                    key={i}
                    className="w-1 h-8 bg-cyan-500 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-400 font-mono">Awaiting sensor telemetry...</div>
              <div className="text-xs text-gray-500 mt-1">Press EXECUTE PROTOCOL to simulate data</div>
            </div>
          </motion.div>
        )}

        </div> {/* End zoom wrapper */}

        {/* Map Controls - Outside zoom wrapper */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-50">
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 2}
            className="w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="text-sm text-white font-bold">+</span>
          </button>
          <div className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <span className="text-[10px] text-cyan-400 font-mono">{(zoom * 100).toFixed(0)}%</span>
          </div>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.6}
            className="w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="text-sm text-white font-bold">−</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmMap;
