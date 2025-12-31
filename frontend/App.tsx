
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import HeroMetricBar from './components/HeroMetricBar';
import FarmMap from './components/FarmMap';
import RiskPredictionRing from './components/RiskPredictionRing';
import SensorStreams from './components/SensorStreams';
import AlertFeed from './components/AlertFeed';
import AIReasoning from './components/AIReasoning';
import QuickActions from './components/QuickActions';
import { Alert, AIStep } from './types';
import { useSensorStream, usePredictionStream, useAlertStream } from './hooks/useKafkaStream';

const App: React.FC = () => {
  // Real-time Kafka Streams
  const { data: sensorData, isConnected: sensorsConnected } = useSensorStream();
  const { data: predictions, latest: latestPrediction } = usePredictionStream();
  const { data: kafkaAlerts } = useAlertStream();

  // Global System Stats
  const [health, setHealth] = useState(94);
  const [aiStep, setAiStep] = useState<AIStep>(AIStep.IDLE);

  // Transform sensor data for charts
  const streams = useMemo(() => {
    if (sensorData.length === 0) {
      // Fallback to mock data if no real data yet
      return {
        temp: Array.from({ length: 20 }, (_, i) => ({ time: i, value: 24 + Math.random() * 2 })),
        humidity: Array.from({ length: 20 }, (_, i) => ({ time: i, value: 78 + Math.random() * 5 })),
        moisture: Array.from({ length: 20 }, (_, i) => ({ time: i, value: 32 + Math.random() * 4 })),
      };
    }

    return {
      temp: sensorData.slice(0, 20).reverse().map((s, i) => ({ time: i, value: s.temperature })),
      humidity: sensorData.slice(0, 20).reverse().map((s, i) => ({ time: i, value: s.humidity })),
      moisture: sensorData.slice(0, 20).reverse().map((s, i) => ({ time: i, value: s.soilMoisture })),
    };
  }, [sensorData]);

  // Current risk from latest prediction
  const risk = latestPrediction?.riskScore ?? 74;

  // Cycle AI reasoning steps
  useEffect(() => {
    const interval = setInterval(() => {
      const steps = [AIStep.ANALYZING, AIStep.CORRELATING, AIStep.PREDICTING, AIStep.RECOMMENDING];
      setAiStep(steps[Math.floor(Date.now() / 3000) % steps.length]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pb-32 selection:bg-cyan-500/30">
      {/* Dynamic Background Noise/Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/carbon-fibre.png")` }} />
      </div>

      <HeroMetricBar
        health={Math.round(health)}
        alerts={kafkaAlerts.filter((a: Alert) => a.type !== 'info').length}
        farms={124}
        predictions={predictions.length}
      />

      <main className="max-w-[1800px] mx-auto p-6 relative z-10">
        {/* Connection Status Indicator */}
        {!sensorsConnected && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 text-sm">
            🔌 Connecting to live data stream...
          </div>
        )}

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6 items-start">

          {/* Main Map Tile (Bento Large) */}
          <div className="col-span-12 lg:col-span-8">
            <FarmMap alerts={kafkaAlerts} />
          </div>

          {/* Alert Feed (Bento Vertical) */}
          <div className="col-span-12 lg:col-span-4 lg:row-span-2">
            <AlertFeed alerts={kafkaAlerts} />
          </div>

          {/* Risk Ring (Bento Medium) */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <RiskPredictionRing risk={Math.round(risk)} />
          </div>

          {/* Sensor Streams (Bento Medium) */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <SensorStreams data={streams} />
          </div>

          {/* AI Reasoning (Bento Small/Wide) */}
          <div className="col-span-12 lg:col-span-8">
            <AIReasoning currentStep={aiStep} latestPrediction={latestPrediction} />
          </div>

        </div>
      </main>

      <QuickActions />
    </div>
  );
};

export default App;
