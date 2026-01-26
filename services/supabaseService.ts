
import { createClient } from '@supabase/supabase-js';
import { SystemStrainPrediction, TelemetryReading, SalesLead } from '../types';

// Initialize Supabase Client
// CRITICAL FIX: Handle missing env vars gracefully to prevent app crash on load.
// If variables are missing, supabase instance will be null, and service acts in "Demo Mode".
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey && !supabaseUrl.includes('YOUR_SUPABASE_URL'))
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export class SupabaseService {
  
  /**
   * GENERATE PREDICTION (Supabase Backend)
   * --------------------------------------
   * 1. Runs heuristic analysis (Edge ML).
   * 2. Persists the result to Supabase 'predictions' table for audit trails.
   */
  public async generatePrediction(deviceId: string, readings: TelemetryReading[]): Promise<SystemStrainPrediction> {
    
    // 1. Run "Edge ML" Logic (Heuristics)
    // In a real enterprise app, this might call a Supabase Edge Function (Deno/Python).
    // Here we simulate the logic to keep the demo self-contained.
    const avgTemp = readings.reduce((acc, curr) => acc + curr.indoorTemp, 0) / readings.length;
    const targetTemp = readings[0]?.targetTemp || 22;
    const tempVariance = Math.abs(avgTemp - targetTemp);
    
    // Logic: If variance > 1.5 degrees, efficiency drops.
    const isEfficient = tempVariance < 1.5;

    const prediction: SystemStrainPrediction = {
      id: `PRED-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      created_at: Date.now(),
      strain_score: isEfficient ? 12 : 68,
      efficiency_index: isEfficient ? 0.96 : 0.78,
      failure_risk: isEfficient ? 'LOW' : 'MODERATE',
      anomalies: isEfficient ? [] : ['Compressor Short Cycling', 'High Static Pressure'],
      recommendations: isEfficient 
        ? ['System performing optimally', 'Continue standard filter schedule']
        : ['Inspect blower motor capacitor', 'Check ductwork for leakage']
    };

    // 2. Persist to Supabase (System of Record)
    // Only attempt if client exists and URL is valid
    if (supabase) {
        try {
            const { error } = await supabase.from('predictions').insert({
                device_id: deviceId,
                strain_score: prediction.strain_score,
                efficiency_index: prediction.efficiency_index,
                failure_risk: prediction.failure_risk,
                raw_data: prediction, // Store full JSON
                created_at: new Date().toISOString()
            });

            if (error) {
                console.warn("[Supabase] Failed to log prediction:", error.message);
            } else {
                console.log("[Supabase] Prediction logged successfully.");
            }
        } catch (e) {
            console.warn("[Supabase] Connection error during log.", e);
        }
    }

    return prediction;
  }

  /**
   * CAPTURE SALES LEAD
   * Called when homeowner clicks "Consult"
   */
  public async captureLead(leadData: Partial<SalesLead>): Promise<boolean> {
    if (!supabase) {
        console.warn("Supabase not configured. Lead not saved.");
        return true; // Pretend success in demo mode
    }

    try {
        const { error } = await supabase.from('leads').insert({
            home_id: leadData.home_id,
            address: leadData.address,
            rebate_amount: leadData.rebate_amount,
            status: 'new'
        });

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Failed to capture lead:", e);
        return false;
    }
  }

  /**
   * CHECK REBATE ELIGIBILITY
   * Queries Supabase 'rebates' table or returns default logic.
   */
  public async checkRebateEligibility(deviceId: string): Promise<number> {
    // Check if we have a custom override in DB
    if (supabase) {
        try {
            const { data } = await supabase
                .from('rebate_eligibility')
                .select('amount')
                .eq('device_id', deviceId)
                .single();
            
            if (data) return data.amount;
        } catch (e) {
            // Ignore error (table might not exist yet or no record), return default
        }
    }
    
    // Default Ontario Enbridge Rebate
    return 12000;
  }
}

export const supabaseService = new SupabaseService();
