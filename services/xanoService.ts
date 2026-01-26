
import { SystemStrainPrediction, TelemetryReading } from '../types';

/**
 * Service Layer for Xano Backend
 * This handles your proprietary Logic, Storage, and ML Triggering.
 */
export class XanoService {
  
  /**
   * Calls Xano endpoint: /api:main/calculate_strain
   * This runs your "Secret Sauce" logic on the server.
   */
  public async generatePrediction(deviceId: string, readings: TelemetryReading[]): Promise<SystemStrainPrediction> {
    console.log(`[Xano] Calculating strain for device ${deviceId} based on ${readings.length} data points...`);
    
    // Simulate Server Calculation Latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock Response from Xano
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

  /**
   * Calls Xano endpoint: /api:main/homeowners
   * Checks if this device matches an address eligible for rebates.
   */
  public async checkRebateEligibility(deviceId: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Hardcoded logic for demo: "If device ID is odd, eligible"
    return 12000;
  }
}

export const xanoService = new XanoService();
