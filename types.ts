// ML Schema for System Strain Predictor

export enum ProviderType {
  ECOBEE = 'ECOBEE',
  HONEYWELL = 'HONEYWELL',
  NEST = 'NEST'
}

export enum HvacMode {
  COOL = 'cool',
  HEAT = 'heat',
  AUTO = 'auto',
  OFF = 'off'
}

export interface TelemetryReading {
  timestamp: string;
  indoorTemp: number;
  outdoorTemp: number;
  humidity: number;
  targetTemp: number;
  fanStatus: boolean;
  compressorStatus: boolean;
  hvacMode: HvacMode;
  powerUsageWatts: number;
}

// Input schema for the ML Model
export interface SystemStrainInput {
  deviceId: string;
  provider: ProviderType;
  readings: TelemetryReading[]; // Window of readings (e.g., last 24h)
  metadata: {
    firmwareVersion: string;
    lastServiceDate: string;
    sqFootage: number;
  };
}

// Output schema from the ML Model
export interface SystemStrainPrediction {
  strainScore: number; // 0-100 (Higher is worse)
  efficiencyIndex: number; // 0-1 (1 is perfect efficiency)
  predictedFailureRisk: 'LOW' | 'MODERATE' | 'CRITICAL';
  anomalies: string[];
  recommendations: string[];
}

// Web 3.0 Ledger Interface
export interface EfficiencyCertificate {
  id: string;
  blockHash: string;
  deviceId: string;
  timestamp: number;
  efficiencyScore: number;
  savingsProjected: number;
  signature: string;
  status: 'PENDING' | 'VERIFIED' | 'MINTED';
}
