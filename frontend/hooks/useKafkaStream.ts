/**
 * AgriStream AI - React Hook for Kafka SSE Streams
 * Connects to FastAPI backend SSE endpoints
 */

import { useState, useEffect, useRef } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

interface UseKafkaStreamOptions<T> {
  endpoint: string;
  onMessage?: (data: T) => void;
  maxItems?: number;  // Keep only last N items
  enabled?: boolean;
}

export function useKafkaStream<T>({
  endpoint,
  onMessage,
  maxItems = 50,
  enabled = true
}: UseKafkaStreamOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [latest, setLatest] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const url = `${BACKEND_URL}${endpoint}`;
    console.log(`[SSE] Connecting to ${url}`);

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log(`[SSE] Connected to ${endpoint}`);
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const parsedData: T = JSON.parse(event.data);

        setLatest(parsedData);
        setData((prev) => {
          const updated = [parsedData, ...prev];
          return updated.slice(0, maxItems);  // Keep only last N items
        });

        onMessage?.(parsedData);
      } catch (err) {
        console.error(`[SSE] Parse error:`, err);
        setError('Failed to parse message');
      }
    };

    eventSource.onerror = (err) => {
      console.error(`[SSE] Connection error for ${endpoint}:`, err);
      setIsConnected(false);
      setError('Connection lost');

      // EventSource will auto-reconnect
    };

    return () => {
      console.log(`[SSE] Disconnecting from ${endpoint}`);
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [endpoint, enabled, maxItems]);

  return {
    data,
    latest,
    isConnected,
    error,
    clear: () => setData([])
  };
}


// Convenience hooks for specific streams

export interface SensorReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  sensorId: string;
  farmId: string;
  location: string;
}

export interface OutbreakPrediction {
  sensorId: string;
  farmId: string;
  location: string;
  riskScore: number;
  riskLevel: string;
  temperature: number;
  humidity: number;
  recommendation: string;
  timestamp: string;
}

export interface FarmerAlert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  farmId: string;
  sensorId: string;
  riskScore: number;
  priority: string;
  actionRequired: string;
}

export function useSensorStream() {
  return useKafkaStream<SensorReading>({
    endpoint: '/stream/sensors',
    maxItems: 100
  });
}

export function usePredictionStream() {
  return useKafkaStream<OutbreakPrediction>({
    endpoint: '/stream/predictions',
    maxItems: 50
  });
}

export function useAlertStream() {
  return useKafkaStream<FarmerAlert>({
    endpoint: '/stream/alerts',
    maxItems: 20
  });
}
