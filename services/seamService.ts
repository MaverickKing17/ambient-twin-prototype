
import { ProviderType, SeamDevice, TelemetryReading, HvacMode } from '../types';

// INSTRUCTIONS FOR ENTERPRISE:
// 1. In Production, replace 'https://connect.getseam.com' with your Xano Backend URL.
// 2. Never expose your Seam Secret Key in the frontend code.
// 3. For this DEMO/SANDBOX, we can use a Publishable Key or direct calls if configured.

const SEAM_API_URL = 'https://connect.getseam.com'; 
const MOCK_MODE = true; // Set to FALSE when you have a real Seam API Key

export class SeamService {
  
  /**
   * Generates the Connect Webview URL.
   * This allows the user to log in to their Nest/Ecobee account securely.
   */
  public async createConnectWebview(provider: ProviderType): Promise<string> {
    
    if (MOCK_MODE) {
      console.log(`[Seam Mock] Generating Connect Webview for ${provider}...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In mock mode, we just return a self-ref link that simulates a successful callback
      // This tricks the app into thinking we went to Seam and came back
      const currentUrl = window.location.origin;
      return `${currentUrl}/?success=true&provider=${provider}&mock_token=seam_sandbox_token_123`;
    }

    // REAL ENTERPRISE IMPLEMENTATION (Call your Xano Backend):
    /*
    const response = await fetch('https://your-xano-api.com/seam/connect_webview', {
      method: 'POST',
      body: JSON.stringify({ provider, accepted_providers: [provider] })
    });
    const data = await response.json();
    return data.connect_webview.url;
    */
   return '';
  }

  /**
   * Fetches the list of devices associated with the connected account.
   */
  public async listDevices(accessToken: string): Promise<SeamDevice[]> {
    
    if (MOCK_MODE || accessToken.includes('mock_token')) {
      console.log(`[Seam Mock] Fetching devices using token: ${accessToken}...`);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Return a "Perfect" Sandbox Device
      return [{
        device_id: `device_sandbox_${Math.random().toString(36).substr(2, 5)}`,
        device_type: `nest_thermostat`,
        properties: {
          name: `Living Room (Sandbox)`,
          online: true,
          current_climate_setting: {
            hvac_mode_setting: HvacMode.HEAT,
            manual_heat_setpoint_celsius: 22
          },
          current_temperature_celsius: 21.5,
          current_humidity: 48
        }
      }];
    }

    // REAL SEAM API CALL
    // In production, your Xano backend should handle this to keep tokens secure.
    // However, if using Client Session Tokens, you can call Seam directly:
    /*
    const response = await fetch(`${SEAM_API_URL}/devices/list`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data.devices;
    */
    return [];
  }

  /**
   * Polls for Device Telemetry (History).
   */
  public async getTelemetryHistory(deviceId: string): Promise<TelemetryReading[]> {
    // In a real Seam app, you don't "poll" history from the device directly.
    // Seam sends Webhooks to Xano -> Xano stores it -> Frontend reads Xano.
    // For this dashboard, we will simulate the data structure that Xano would return.
    
    await new Promise(resolve => setTimeout(resolve, 600));

    const now = Date.now();
    const readings: TelemetryReading[] = Array.from({ length: 24 }, (_, i) => {
      const timeOffset = (23 - i) * 3600000; // Hourly points
      
      // Generate realistic HVAC curves
      // If it's colder outside, heating runs more (Simulated Physics)
      const hour = new Date(now - timeOffset).getHours();
      const isNight = hour < 6 || hour > 20;
      
      const outdoorTemp = 5 + Math.cos((hour - 14) / 12 * Math.PI) * 5; // Warmer at 2PM
      const targetTemp = isNight ? 20 : 22; // Setback at night
      const indoorTemp = targetTemp - (Math.random() * 0.5); // Slightly below target usually
      
      const isRunning = indoorTemp < targetTemp - 0.5;

      return {
        timestamp: new Date(now - timeOffset).toISOString(),
        indoorTemp: indoorTemp,
        outdoorTemp: outdoorTemp,
        humidity: 40 + (Math.random() * 5),
        targetTemp: targetTemp,
        fanStatus: isRunning,
        compressorStatus: isRunning, // Heating active
        hvacMode: HvacMode.HEAT,
        powerUsageWatts: isRunning ? 3500 : 200 // Heat pump usage vs Standby
      };
    });

    return readings;
  }
}

export const seamService = new SeamService();
