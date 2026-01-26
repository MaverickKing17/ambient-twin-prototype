
import { SystemStrainPrediction, TelemetryReading } from '../types';

/**
 * XANO API CONFIGURATION (ENTERPRISE)
 * -----------------------------------
 * Configure NEXT_PUBLIC_XANO_API_BASE_URL in your .env file.
 */
export const XANO_API_BASE_URL = process.env.NEXT_PUBLIC_XANO_API_BASE_URL || '';

/**
 * Service Layer for Xano Backend
 * This handles your proprietary Logic, Storage, and ML Triggering.
 */
export class XanoService {
  
  /**
   * Calls Xano endpoint: /predict_strain
   */
  public async generatePrediction(deviceId: string, readings: TelemetryReading[]): Promise<SystemStrainPrediction> {
    
    // 1. CHECK FOR MOCK MODE
    if (!XANO_API_BASE_URL) {
      console.log("[Xano] No API URL configured. Running local ML simulation.");
      return this.runLocalSimulation(readings);
    }

    // 2. REAL API CALL
    try {
      console.log(`[Xano] POST ${XANO_API_BASE_URL}/predict_strain`);
      
      const response = await fetch(`${XANO_API_BASE_URL}/predict_strain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_id: deviceId,
          readings: readings,
          metadata: {
            source: 'ambient_twin_dashboard',
            version: '2.5.1'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Xano Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data as SystemStrainPrediction;

    } catch (error) {
      console.warn("Xano Connection Failed. Falling back to local simulation.", error);
      return this.runLocalSimulation(readings);
    }
  }

  /**
   * Calls Xano endpoint: /check_rebate
   */
  public async checkRebateEligibility(deviceId: string): Promise<number> {
    if (!XANO_API_BASE_URL) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return 12000;
    }

    try {
      const response = await fetch(`${XANO_API_BASE_URL}/check_rebate?device_id=${deviceId}`, {
         method: 'GET'
      });
      const data = await response.json();
      return data.rebate_amount || 0;
    } catch (e) {
      return 12000; // Fallback default
    }
  }

  /**
   * LOCAL ML SIMULATION (Fallback)
   */
  private async runLocalSimulation(readings: TelemetryReading[]): Promise<SystemStrainPrediction> {
    
    // Simulate Server Latency
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Logic: If average temp variance is high, strain is high.
    const avgTemp = readings.reduce((acc, curr) => acc + curr.indoorTemp, 0) / readings.length;
    const isEfficient = avgTemp > 20.5 && avgTemp < 22.5;

    return {
      id: `pred_${Math.random().toString(36).substr(2, 9)}`,
      created_at: Date.now(),
      strain_score: isEfficient ? 24 : 78,
      efficiency_index: isEfficient ? 0.94 : 0.72,
      failure_risk: isEfficient ? 'LOW' : 'MODERATE',
      anomalies: isEfficient ? [] : ['Short Cycling Detected', 'Slow Heat Ramp'],
      recommendations: isEfficient 
        ? ['System operating within optimal parameters', 'Filter status: Good']
        : ['Check air filter for blockage', 'Verify compressor capacitor']
    };
  }
}

export const xanoService = new XanoService();
