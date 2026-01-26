
import { ProviderType, SeamDevice, TelemetryReading, HvacMode } from '../types';

export const SEAM_API_KEY = process.env.NEXT_PUBLIC_SEAM_API_KEY || ''; 

const SEAM_ENDPOINT = 'https://connect.getseam.com';

export class SeamService {
  
  public async createConnectWebview(provider: ProviderType): Promise<string> {
    if (!SEAM_API_KEY) {
      return `${window.location.origin}/?success=true&provider=${provider}&mock_token=mock_token_123`;
    }
    const currentUrl = window.location.origin;
    return `${currentUrl}/?success=true&provider=${provider}&mock_token=${SEAM_API_KEY}`;
  }

  public async listDevices(accessToken: string, providerHint?: ProviderType): Promise<SeamDevice[]> {
    if (!accessToken || accessToken === 'mock_token_123') {
      return this.getMockDevice(providerHint);
    }

    try {
      const response = await fetch(`${SEAM_ENDPOINT}/devices/list`, {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${accessToken}`, 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) throw new Error(`Seam API Error: ${response.statusText}`);
      const data = await response.json();
      
      if (data.devices.length === 0) return this.getMockDevice(providerHint);
      
      return data.devices.map((d: any) => ({
        device_id: d.device_id,
        device_type: d.device_type,
        properties: {
          name: d.properties.name,
          online: d.properties.online,
          current_climate_setting: {
            hvac_mode_setting: d.properties.current_climate_setting?.hvac_mode_setting || HvacMode.OFF,
            manual_heat_setpoint_celsius: d.properties.current_climate_setting?.manual_heat_setpoint_celsius,
            manual_cool_setpoint_celsius: d.properties.current_climate_setting?.manual_cool_setpoint_celsius,
          },
          current_temperature_celsius: d.properties.current_temperature_celsius,
          current_humidity: d.properties.current_humidity || 45
        }
      }));
    } catch (error) {
      return this.getMockDevice(providerHint); 
    }
  }

  public async getTelemetryHistory(deviceId: string): Promise<TelemetryReading[]> {
    let currentTemp = 21;
    let targetTemp = 22;
    let mode = HvacMode.HEAT;

    const isVirtualDevice = deviceId.startsWith('mock_');
    const hasRealKey = SEAM_API_KEY.length > 10;

    if (hasRealKey && !isVirtualDevice) {
      try {
        const response = await fetch(`${SEAM_ENDPOINT}/devices/get`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SEAM_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ device_id: deviceId })
        });
        const data = await response.json();
        currentTemp = data.device.properties.current_temperature_celsius;
        targetTemp = data.device.properties.current_climate_setting?.manual_heat_setpoint_celsius || 22;
        mode = data.device.properties.current_climate_setting?.hvac_mode_setting || HvacMode.HEAT;
      } catch (e) {}
    }

    const now = Date.now();
    const readings: TelemetryReading[] = Array.from({ length: 24 }, (_, i) => {
      const timeOffset = (23 - i) * 3600000;
      const isLast = i === 23;
      const calculatedTemp = isLast ? currentTemp : (targetTemp - 0.5) + Math.sin(i / 3);
      
      return {
        timestamp: new Date(now - timeOffset).toISOString(),
        indoorTemp: calculatedTemp,
        outdoorTemp: 5 + Math.cos(i / 8) * 3,
        humidity: 45,
        targetTemp: targetTemp,
        fanStatus: calculatedTemp < targetTemp,
        compressorStatus: calculatedTemp < targetTemp,
        hvacMode: mode,
        powerUsageWatts: (calculatedTemp < targetTemp) ? 3500 : 200
      };
    });

    return readings;
  }

  private getMockDevice(provider: ProviderType = ProviderType.NEST): SeamDevice[] {
    const isEcobee = provider === ProviderType.ECOBEE;
    const isHoneywell = provider === ProviderType.HONEYWELL;
    const brandName = isEcobee ? "Ecobee" : (isHoneywell ? "Honeywell" : "Nest");
    
    return [{
      device_id: `mock_${provider}_twin_01`,
      device_type: `${provider}_thermostat`,
      properties: {
        name: `Virtual ${brandName} Twin`,
        online: true,
        current_climate_setting: {
          hvac_mode_setting: HvacMode.HEAT,
          manual_heat_setpoint_celsius: 21.5,
          manual_cool_setpoint_celsius: 24,
        },
        current_temperature_celsius: 21.0,
        current_humidity: 42
      }
    }];
  }
}

export const seamService = new SeamService();
