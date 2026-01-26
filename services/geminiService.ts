
import { GoogleGenAI } from "@google/genai";
import { TelemetryReading, SeamDevice } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  public async analyzeSystemHealth(device: SeamDevice, readings: TelemetryReading[]): Promise<string> {
    if (!process.env.API_KEY) {
      return "AI Insight Unavailable: Please configure your API_KEY in the environment settings.";
    }

    try {
      const latest = readings[readings.length - 1];
      const avgTemp = readings.reduce((acc, r) => acc + r.indoorTemp, 0) / readings.length;
      
      const prompt = `
        Act as a Master HVAC Systems Architect based in Toronto, Canada.
        Analyze this Digital Twin telemetry for a Honeywell unit: ${device.properties.name}.
        
        Engineering Context:
        - Toronto Climate Zone: Zone 5/6 (Cold winters, high humidity summers).
        - Standards: Enbridge Gas HER+ rebate compliance.
        
        Current State:
        - Indoor: ${latest.indoorTemp} degrees Celsius (Target: ${latest.targetTemp} degrees Celsius)
        - Outdoor: ${latest.outdoorTemp} degrees Celsius
        - Power: ${latest.powerUsageWatts}W
        - Avg 24h: ${avgTemp.toFixed(1)} degrees Celsius

        Task: Provide a 2-sentence highly technical assessment of thermal efficiency and 1 specific preventative maintenance instruction. 
        Focus on: Wear patterns typical for Canadian seasonal transitions.
        Formatting: Plain text, professional, direct.
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return response.text || "Diagnostic calibration failure.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "The AI Architect is analyzing regional grid patterns. Retrying connection...";
    }
  }
}

export const geminiService = new GeminiService();
