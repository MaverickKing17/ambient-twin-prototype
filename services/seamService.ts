
import { ProviderType, SeamDevice, TelemetryReading, HvacMode } from '../types';
import { supabase } from './supabaseService';

export const SEAM_API_KEY = process.env.NEXT_PUBLIC_SEAM_API_KEY || ''; 

export class SeamService {
  
  public async listDevices(accessToken: string, providerHint?: ProviderType): Promise<SeamDevice[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('seam-proxy', {
          body: { action: 'list_devices', provider: providerHint }
        });
        if (!error && data?.devices) return data.devices;
      } catch (e) {
        console.warn("[Seam Proxy] Falling back to direct/mock logic.");
      }
    }

    return this.getMockDeviceFleet();
  }

  public async getTelemetryHistory(deviceId: string): Promise<TelemetryReading[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('seam-proxy', {
          body: { action: 'get_telemetry', device_id: deviceId }
        });
        if (!error && data?.readings) return data.readings;
      } catch (e) {}
    }

    const now = Date.now();
    return Array.from({ length: 24 }, (_, i) => {
      const timeOffset = (23 - i) * 3600000;
      const calculatedTemp = 21 + Math.sin(i / 3);
      return {
        timestamp: new Date(now - timeOffset).toISOString(),
        indoorTemp: calculatedTemp,
        outdoorTemp: 5 + Math.cos(i / 8) * 3,
        humidity: 45,
        targetTemp: 22,
        fanStatus: calculatedTemp < 22,
        compressorStatus: calculatedTemp < 22,
        hvacMode: HvacMode.HEAT,
        powerUsageWatts: (calculatedTemp < 22) ? 3500 : 200
      };
    });
  }

  private getMockDeviceFleet(): SeamDevice[] {
    // Technical IDs mapped to Real Room Names
    const devices = [
      { name: "Master Bedroom", online: true, id: "01" },
      { name: "Main Floor Living", online: true, id: "02" },
      { name: "Basement Studio", online: true, id: "03" },
      { name: "Home Office", online: true, id: "04" },
      { name: "Kitchen / Dining", online: false, id: "05" },
      { name: "Guest Suite", online: true, id: "06" },
      { name: "Garage Workshop", online: false, id: "07" },
    ];

    return devices.map(d => ({
      device_id: `mock_honeywell_${d.id}`,
      device_type: `honeywell_thermostat`,
      properties: {
        name: d.name,
        online: d.online,
        current_climate_setting: {
          hvac_mode_setting: HvacMode.HEAT,
          manual_heat_setpoint_celsius: 21,
          manual_cool_setpoint_celsius: 24,
        },
        current_temperature_celsius: d.online ? 21.0 : 18.5,
        current_humidity: 42
      }
    }));
  }
}

export const seamService = new SeamService();
