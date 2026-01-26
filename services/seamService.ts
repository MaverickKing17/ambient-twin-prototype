
import { ProviderType, SeamDevice, TelemetryReading, HvacMode } from '../types';

/**
 * SEAM API CONFIGURATION
 * ----------------------
 * 1. Go to your Seam Dashboard (https://console.seam.co)
 * 2. Click Settings > API Keys
 * 3. Copy your key (starts with "seam_test_") and paste it below.
 */
export const SEAM_API_KEY = 'seam_test_PASTE_YOUR_KEY_HERE'; 

const SEAM_ENDPOINT = 'https://connect.getseam.com';

export class SeamService {
  
  /**
   * CONNECT FLOW
   * In a real app, this generates a "Connect Webview" link.
   * For your specific Sandbox testing, we will just list the devices 
   * associated with your API Key directly.
   */
  public async createConnectWebview(provider: ProviderType): Promise<string> {
    console.log(`[Seam] Bypassing Webview for Direct API Access (Sandbox Mode)...`);
    
    // In Sandbox mode with a direct API key, we don't need to "Log In" to Nest.
    // We already own the Sandbox. We just reload the page with a success flag.
    const currentUrl = window.location.origin;
    return `${currentUrl}/?success=true&provider=${provider}&mock_token=${SEAM_API_KEY}`;
  }

  /**
   * LIST DEVICES (Real API Call or Simulation)
   * Fetches the actual Sandbox devices you created in the Seam Console.
   */
  public async listDevices(accessToken: string, providerHint?: ProviderType): Promise<SeamDevice[]> {
    
    // 1. Fallback: If user hasn't set up the key, use Virtual Twin immediately.
    if (accessToken.includes('PASTE_YOUR_KEY_HERE') || !accessToken) {
      console.warn("Seam API Key is missing. activating Virtual Twin Mode.");
      return this.getMockDevice(providerHint);
    }

    try {
      console.log("[Seam] Fetching real devices from API...");
      
      const response = await fetch(`${SEAM_ENDPOINT}/devices/list`, {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${accessToken}`, 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`Seam API Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // 2. Fallback: If Key is valid but Sandbox is empty, use Virtual Twin.
      if (data.devices.length === 0) {
        console.warn("No devices found in Seam Sandbox. Activating Virtual Twin Mode.");
        return this.getMockDevice(providerHint);
      }
      
      // Transform Seam API response to our Dashboard Type
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
      console.error("Failed to fetch Seam devices, falling back to mock:", error);
      return this.getMockDevice(providerHint); 
    }
  }

  /**
   * TELEMETRY (Hybrid)
   * Sandbox devices are static (they don't have months of history).
   * We will fetch the CURRENT REAL status, and generate a history curve
   * that leads up to that real point.
   */
  public async getTelemetryHistory(deviceId: string): Promise<TelemetryReading[]> {
    
    // 1. Get Current Real Status
    let currentTemp = 21;
    let targetTemp = 22;
    let mode = HvacMode.HEAT;

    // Only try to fetch real data if we have a real key AND it's not a mock device
    const isVirtualDevice = deviceId.startsWith('mock_');
    const hasRealKey = SEAM_API_KEY && !SEAM_API_KEY.includes('PASTE_YOUR_KEY');

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
      } catch (e) {
        console.error("Could not fetch device details", e);
      }
    }

    // 2. Generate History leading up to Current Status
    const now = Date.now();
    const readings: TelemetryReading[] = Array.from({ length: 24 }, (_, i) => {
      const timeOffset = (23 - i) * 3600000;
      
      // Make the last reading match the REAL current temp exactly
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

  /**
   * Helper: Returns a virtual device to unblock the UI if Seam is empty/unconfigured.
   */
  private getMockDevice(provider: ProviderType = ProviderType.NEST): SeamDevice[] {
    const isEcobee = provider === ProviderType.ECOBEE;
    return [{
      device_id: `mock_${provider}_twin_01`,
      device_type: isEcobee ? "ecobee_thermostat" : "nest_thermostat",
      properties: {
        name: isEcobee ? "Virtual Ecobee Twin" : "Virtual Nest Twin",
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
