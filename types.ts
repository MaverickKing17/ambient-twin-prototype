
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

// Supabase Database Schema: 'leads'
export interface SalesLead {
  home_id: string;
  address: string;
  rebate_amount: number;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
  asset_grade?: 'A+' | 'A' | 'B' | 'C' | 'D';
  audit_progress?: number; // 0-100
  grid_impact?: 'Low' | 'Moderate' | 'High'; // Toronto-specific demand response
  program?: 'HER+' | 'Greener Homes' | 'Clean Energy Toronto';
}

export interface SystemStrainPrediction {
  id: string;
  created_at: number;
  strain_score: number;
  efficiency_index: number;
  failure_risk: 'LOW' | 'MODERATE' | 'CRITICAL';
  anomalies: string[];
  recommendations: string[];
}

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
