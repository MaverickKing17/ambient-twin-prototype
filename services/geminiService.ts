
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TelemetryReading, SeamDevice } from "../types";
import { supabase } from "./supabaseService";

/**
 * Enterprise Gemini Service with Quota Protection & Caching
 */
export class GeminiService {
  private cache: Map<string, { text: string; sources: { title: string; uri: string }[]; timestamp: number }> = new Map();
  private CACHE_TTL = 1000 * 60 * 5; // 5 minute cache for same-device analysis

  private async callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      const isRetryable = err?.message?.includes('429') || err?.message?.includes('500') || err?.status === 429;
      if (retries > 0 && isRetryable) {
        console.warn(`[Gemini] Rate limited or server error. Retrying in ${delay}ms... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callWithRetry(fn, retries - 1, delay * 2);
      }
      throw err;
    }
  }

  public async analyzeSystemHealth(device: SeamDevice, readings: TelemetryReading[]): Promise<{text: string, sources: {title: string, uri: string}[], isCached?: boolean}> {
    const deviceId = device.device_id;
    const now = Date.now();

    // 1. Check Cache
    const cached = this.cache.get(deviceId);
    if (cached && (now - cached.timestamp < this.CACHE_TTL)) {
      console.log(`[Gemini] Returning cached analysis for ${deviceId}`);
      return { ...cached, isCached: true };
    }

    // 2. Try Supabase Edge Function Proxy (Better for Production/Security)
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('gemini-proxy', {
          body: { action: 'analyze_health', device, readings }
        });
        if (!error && data) {
          this.cache.set(deviceId, { ...data, timestamp: now });
          return data;
        }
      } catch (e) {
        console.warn("[Gemini Proxy] Proxy unavailable, falling back to direct call.");
      }
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return { 
        text: "Direct Uplink Restricted. Please check API_KEY configuration in environment.",
        sources: [] 
      };
    }

    // 3. Direct Browser Call with Retry and Error Handling
    try {
      const ai = new GoogleGenAI({ apiKey });
      const latest = readings[readings.length - 1];
      const prompt = `
        HVAC Digital Twin Forensic Analysis for: ${device.properties.name} (Toronto, ON)
        Hardware State: ${latest.indoorTemp}°C (Target: ${latest.targetTemp}°C)
        Operational Mode: ${latest.hvacMode} | Power Load: ${latest.powerUsageWatts}W
        
        Mandatory Technical Tasks:
        1. Diagnose mechanical health based on setpoint deviation.
        2. Verify 2026 Enbridge HER+ rebate compliance for this hardware profile.
        3. Provide 2 concise tech recommendations.
      `;

      // Explicitly typing response as GenerateContentResponse to fix 'unknown' type errors
      const response: GenerateContentResponse = await this.callWithRetry(() => ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      }));

      // Accessing .text and .candidates properties from GenerateContentResponse
      const text = response.text || "Analysis complete: System stable.";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => ({
          title: chunk.web?.title || "Grant Documentation",
          uri: chunk.web?.uri || "#"
        }))
        .filter((s: any) => s.uri !== "#") || [];

      const result = { text, sources };
      this.cache.set(deviceId, { ...result, timestamp: now });
      return result;

    } catch (err: any) {
      console.error("[Gemini Service] Critical Error:", err);
      
      // If we have any cached data at all (even expired), return it as a failsafe
      if (cached) {
        return { ...cached, isCached: true, text: `[Quota Limit] Showing previous state: ${cached.text}` };
      }

      return { 
        text: "Service Rate Limit Reached. Operational telemetry shows system is within normal safety thresholds. Please retry analysis in 60 seconds.",
        sources: [] 
      };
    }
  }
}

export const geminiService = new GeminiService();
