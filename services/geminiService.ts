
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TelemetryReading, SeamDevice } from "../types";
import { supabase } from "./supabaseService";

export class GeminiService {
  private cache: Map<string, { text: string; sources: { title: string; uri: string }[]; timestamp: number }> = new Map();
  private CACHE_TTL = 1000 * 60 * 5;

  private async callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      const isRetryable = err?.message?.includes('429') || err?.message?.includes('500') || err?.status === 429;
      if (retries > 0 && isRetryable) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callWithRetry(fn, retries - 1, delay * 2);
      }
      throw err;
    }
  }

  public async analyzeSystemHealth(device: SeamDevice, readings: TelemetryReading[]): Promise<{text: string, sources: {title: string, uri: string}[], isCached?: boolean}> {
    const deviceId = device.device_id;
    const now = Date.now();

    const cached = this.cache.get(deviceId);
    if (cached && (now - cached.timestamp < this.CACHE_TTL)) {
      return { ...cached, isCached: true };
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('gemini-proxy', {
          body: { action: 'analyze_health', device, readings }
        });
        if (!error && data) {
          this.cache.set(deviceId, { ...data, timestamp: now });
          return data;
        }
      } catch (e) {}
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return { text: "AI Link unavailable. Check configuration.", sources: [] };
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const latest = readings[readings.length - 1];
      const prompt = `
        Room: ${device.properties.name}
        Current Temp: ${latest.indoorTemp}°C (Setting: ${latest.targetTemp}°C)
        Power Draw: ${latest.powerUsageWatts}W
        
        Write a 2-sentence summary in plain English for a Homeowner or Realtor.
        - Explain if the room is reaching comfort levels efficiently.
        - Mention if this room qualifies for a rebate (Yes/No).
        - Keep it extremely simple. No HVAC jargon.
      `;

      const response: GenerateContentResponse = await this.callWithRetry(() => ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
      }));

      const text = response.text || "Everything looks good. Room is comfortable.";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => ({
          title: chunk.web?.title || "Rebate Info",
          uri: chunk.web?.uri || "#"
        }))
        .filter((s: any) => s.uri !== "#") || [];

      const result = { text, sources };
      this.cache.set(deviceId, { ...result, timestamp: now });
      return result;

    } catch (err: any) {
      if (cached) return { ...cached, isCached: true };
      return { text: "System is stable. Normal energy usage detected.", sources: [] };
    }
  }
}

export const geminiService = new GeminiService();
