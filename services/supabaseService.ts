
import { createClient } from '@supabase/supabase-js';
import { SystemStrainPrediction, TelemetryReading, SalesLead } from '../types';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey && !supabaseUrl.includes('YOUR_SUPABASE_URL'))
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export class SupabaseService {
  
  /**
   * GENERATE PREDICTION (Supabase Backend)
   */
  public async generatePrediction(deviceId: string, readings: TelemetryReading[]): Promise<SystemStrainPrediction> {
    const avgTemp = readings.reduce((acc, curr) => acc + curr.indoorTemp, 0) / readings.length;
    const targetTemp = readings[0]?.targetTemp || 22;
    const tempVariance = Math.abs(avgTemp - targetTemp);
    
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

    if (supabase) {
        try {
            await supabase.from('predictions').insert({
                device_id: deviceId,
                strain_score: prediction.strain_score,
                efficiency_index: prediction.efficiency_index,
                failure_risk: prediction.failure_risk,
                raw_data: prediction,
                created_at: new Date().toISOString()
            });
        } catch (e) {
            console.warn("[Supabase] Connection error during log.", e);
        }
    }

    return prediction;
  }

  /**
   * CAPTURE SALES LEAD
   */
  public async captureLead(leadData: Partial<SalesLead>): Promise<boolean> {
    if (!supabase) return true; 

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
   * UPDATE LEAD STATUS (CRM)
   */
  public async updateLeadStatus(address: string, status: SalesLead['status']): Promise<boolean> {
    if (!supabase) return true;
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('address', address);
      
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Failed to update lead:", e);
      return false;
    }
  }

  /**
   * FETCH ALL LEADS (Contractor Dashboard)
   */
  public async fetchLeads(): Promise<SalesLead[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SalesLead[];
    } catch (e) {
      console.error("Failed to fetch leads:", e);
      return [];
    }
  }

  /**
   * CHECK REBATE ELIGIBILITY
   */
  public async checkRebateEligibility(deviceId: string): Promise<number> {
    if (supabase) {
        try {
            const { data } = await supabase
                .from('rebate_eligibility')
                .select('amount')
                .eq('device_id', deviceId)
                .single();
            if (data) return data.amount;
        } catch (e) {}
    }
    return 12000;
  }
}

export const supabaseService = new SupabaseService();
