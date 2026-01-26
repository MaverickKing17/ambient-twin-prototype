import { EfficiencyCertificate, SystemStrainPrediction } from '../types';

/**
 * Functional Logic: Simulates a Web 3.0 minting process.
 */
export const generateEfficiencyHash = async (data: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Generates the full certificate with calculated SEER2/HSPF2 metrics.
 */
export const generateEfficiencyCertificate = async (
  deviceId: string,
  prediction: SystemStrainPrediction
): Promise<EfficiencyCertificate> => {
  
  // Simulate network latency for blockchain interaction (e.g. Polygon or Ethereum L2)
  await new Promise(resolve => setTimeout(resolve, 1500));

  const timestamp = Date.now();
  const efficiencyScore = Math.round(prediction.efficiency_index * 100);
  
  // Derive Metrics from ML data
  // Base SEER2 for a modern unit is ~16. We scale it based on efficiency index.
  const seer2 = parseFloat((16 + (prediction.efficiency_index * 6)).toFixed(1)); 
  // Base HSPF2 is ~8.5.
  const hspf2 = parseFloat((7.5 + (prediction.efficiency_index * 3)).toFixed(1));

  let grade: EfficiencyCertificate['grade'] = 'C';
  if (efficiencyScore >= 95) grade = 'A+';
  else if (efficiencyScore >= 90) grade = 'A';
  else if (efficiencyScore >= 80) grade = 'B';

  // Construct the asset payload for hashing
  const assetPayload = JSON.stringify({
    deviceId,
    timestamp,
    metrics: { seer2, hspf2 },
    grade,
    firmware: 'verified'
  });

  const assetHash = await generateEfficiencyHash(assetPayload);
  const signature = await mockSign(assetHash);

  return {
    id: `NFT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    assetHash: `0x${assetHash}`,
    deviceId,
    timestamp,
    efficiencyScore,
    grade,
    metrics: {
      seer2,
      hspf2
    },
    savingsProjected: 12000,
    signature: `0x${signature}`,
    status: 'MINTED',
    isPublished: false
  };
};

export const publishCertificate = async (certificate: EfficiencyCertificate): Promise<EfficiencyCertificate> => {
  // Simulate API call to generate public permalink
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    ...certificate,
    isPublished: true,
    publicUrl: `https://twin.ambient.ai/cert/${certificate.id}`
  };
};

async function mockSign(hash: string): Promise<string> {
  // Simulate an ECDSA signature
  return hash.substring(0, 64) + '...signed'; 
}