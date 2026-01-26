
// ML Schema for System Strain Predictor

export enum ProviderType {
  ECOBEE = 'ecobee',
  HONEYWELL = 'honeywell',
  NEST = 'nest'
}

export enum HvacMode {
  COOL = 'cool',
  HEAT = 'heat',
  AUTO = 'auto',
  OFF = 'off'
}

// Mimics Seam Device Object
export interface SeamDevice {
  device_id: string;
  device_type: string;
  properties: {
    name: string;
    online: boolean;
    current_climate_setting?: {
      hvac_mode_setting: HvacMode;
      manual_cool_setpoint_celsius?: number;
      manual_heat_setpoint_celsius?: number;
    };
    current_temperature_celsius?: number;
    current_humidity?: number;
  };
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

// Xano Database Schema: 'system_strain_logs'
export interface SystemStrainInput {
  user_id: string; // Link to Xano User Table
  device_id: string;
  provider: ProviderType;
  readings: TelemetryReading[]; 
  metadata: {
    firmware_version: string;
    last_service_date: string;
    sq_footage: number;
  };
}

// Xano Database Schema: 'predictions'
export interface SystemStrainPrediction {
  id: string;
  created_at: number;
  strain_score: number; // 0-100 (Higher is worse)
  efficiency_index: number; // 0-1 (1 is perfect efficiency)
  failure_risk: 'LOW' | 'MODERATE' | 'CRITICAL';
  anomalies: string[];
  recommendations: string[];
}

// Web 3.0 Ledger Interface
export interface EfficiencyCertificate {
  id: string;
  assetHash: string; 
  deviceId: string;
  timestamp: number;
  efficiencyScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D'; 
  metrics: {
    seer2: number;
    hspf2: number;
  };
  savingsProjected: number;
  signature: string;
  status: 'PENDING' | 'VERIFIED' | 'MINTED';
  isPublished: boolean;
  publicUrl?: string;
}
