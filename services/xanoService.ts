
/**
 * DEPRECATED: This service has been replaced by supabaseService.ts
 * Kept as a placeholder to prevent import errors during migration.
 */
export class XanoService {
  public async generatePrediction(deviceId: any, readings: any): Promise<any> {
    console.warn("XanoService is deprecated. Use SupabaseService instead.");
    return null;
  }
}

export const xanoService = new XanoService();
