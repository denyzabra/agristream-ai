
export interface SensorDataPoint {
  timestamp: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  farmId: string;
}

export interface FarmRegion {
  id: string;
  name: string;
  riskLevel: number; // 0-100
  sensors: number;
}

export enum AIStep {
  IDLE = 'Standby',
  ANALYZING = 'Analyzing Neural Stream',
  CORRELATING = 'Correlating Multi-Spectral Data',
  PREDICTING = 'Predicting Outbreak Vectors',
  RECOMMENDING = 'Synthesizing Counter-Measures'
}
