import { ProviderType, TelemetryReading, HvacMode } from '../types';

interface AuthConfig {
  clientId: string;
  authUrl: string;
  scope: string;
  redirectUri: string;
}

interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  timestamp: number;
}

export class ThermostatConnector {
  private static STORAGE_KEY = 'hvac_digital_twin_auth';

  private configs: Record<ProviderType, AuthConfig> = {
    [ProviderType.ECOBEE]: {
      clientId: 'ecobee-twin-app-v1',
      authUrl: 'https://api.ecobee.com/authorize',
      scope: 'smartRead',
      redirectUri: 'http://localhost:3000/callback/ecobee'
    },
    [ProviderType.NEST]: {
      clientId: 'nest-device-access-project-id',
      authUrl: 'https://nestservices.google.com/partnerconnections',
      scope: 'https://www.googleapis.com/auth/sdm.service',
      redirectUri: 'http://localhost:3000/callback/nest'
    },
    [ProviderType.HONEYWELL]: {
      clientId: 'honeywell-connect',
      authUrl: 'https://api.honeywell.com/oauth2/authorize',
      scope: 'Thermostat-Read',
      redirectUri: 'http://localhost:3000/callback/honeywell'
    }
  };

  /**
   * Generates the OAuth URL.
   * In a real app, this initiates the redirect. 
   */
  public async initiateAuth(provider: ProviderType): Promise<string> {
    const config = this.configs[provider];
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope,
      state: state
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return `${config.authUrl}?${params.toString()}`;
  }

  /**
   * Handling the callback code exchange.
   */
  public async handleCallback(provider: ProviderType, code: string): Promise<AuthToken> {
    // Simulate token exchange API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockToken: AuthToken = {
      accessToken: `access_${provider}_${code.substring(0, 5)}_${Date.now()}`,
      refreshToken: `refresh_${provider}_${Date.now()}`,
      expiresIn: 3600,
      timestamp: Date.now()
    };

    this.saveToken(provider, mockToken);
    return mockToken;
  }

  public isConnected(provider: ProviderType): boolean {
    const token = this.getToken(provider);
    return !!token && (Date.now() - token.timestamp < token.expiresIn * 1000);
  }

  public disconnect(provider: ProviderType): void {
    const tokens = this.getAllTokens();
    delete tokens[provider];
    localStorage.setItem(ThermostatConnector.STORAGE_KEY, JSON.stringify(tokens));
  }

  /**
   * Fetches telemetry formatted for the System Strain ML Model.
   */
  public async fetchSystemStrainData(provider: ProviderType): Promise<{ readings: TelemetryReading[], metadata: any }> {
    if (!this.isConnected(provider)) {
      throw new Error(`Auth Error: Not connected to ${provider}`);
    }

    // Simulate fetching data from the provider's API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create unique data profiles based on provider to visualize difference in UI
    const now = Date.now();
    const isNest = provider === ProviderType.NEST;
    const isHoneywell = provider === ProviderType.HONEYWELL;
    
    // Nest profile: Higher efficiency, smoother curves
    // Honeywell profile: Very stable (low variance), solid power usage
    // Ecobee profile: More frequent updates, slightly more noise simulated
    
    let baseTemp = 20.5;
    let variance = 1.5;
    let firmware = 'Eco-4.2.0';
    let basePower = 2200;

    if (isNest) {
        baseTemp = 21.5;
        variance = 0.5;
        firmware = 'NestOS-5.4';
        basePower = 1800;
    } else if (isHoneywell) {
        baseTemp = 21.0;
        variance = 0.2; // Very stable temp control
        firmware = 'Lyric-T6-Pro';
        basePower = 2000;
    }

    const readings: TelemetryReading[] = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(now - (23 - i) * 3600000).toISOString(),
      indoorTemp: baseTemp + Math.sin(i / 3) * variance,
      outdoorTemp: 10 + Math.cos(i / 8) * 5,
      humidity: 45 + Math.random() * 5,
      targetTemp: 22,
      fanStatus: i % 3 === 0,
      compressorStatus: i % 3 === 0,
      hvacMode: HvacMode.AUTO,
      powerUsageWatts: (i % 3 === 0) ? basePower : 150
    }));

    return {
      readings,
      metadata: {
        firmwareVersion: firmware,
        lastServiceDate: '2024-01-10',
        sqFootage: 2400
      }
    };
  }

  private saveToken(provider: ProviderType, token: AuthToken) {
    const tokens = this.getAllTokens();
    tokens[provider] = token;
    localStorage.setItem(ThermostatConnector.STORAGE_KEY, JSON.stringify(tokens));
  }

  private getToken(provider: ProviderType): AuthToken | null {
    const tokens = this.getAllTokens();
    return tokens[provider] || null;
  }

  private getAllTokens(): Record<string, AuthToken> {
    try {
      return JSON.parse(localStorage.getItem(ThermostatConnector.STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }
}

export const thermostatConnector = new ThermostatConnector();