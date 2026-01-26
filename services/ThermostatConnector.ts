
// This file is deprecated in favor of seamService.ts and xanoService.ts
// We keep it as a lightweight stub if any legacy imports exist during migration.
import { ProviderType, TelemetryReading, HvacMode } from '../types';

export class ThermostatConnector {
  public isConnected(provider: ProviderType): boolean { return false; }
  public disconnect(provider: ProviderType): void {}
}

export const thermostatConnector = new ThermostatConnector();
