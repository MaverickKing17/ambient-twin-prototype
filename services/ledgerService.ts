import { EfficiencyCertificate, SystemStrainPrediction } from '../types';

/**
 * Simulates generating a 'Certificate of Efficiency' on a private energy ledger.
 * In a real Web 3.0 app, this would interact with a smart contract via Wagmi/Ethers.js.
 */
export const generateEfficiencyCertificate = async (
  deviceId: string,
  prediction: SystemStrainPrediction
): Promise<EfficiencyCertificate> => {
  
  // Simulate network latency for blockchain interaction
  await new Promise(resolve => setTimeout(resolve, 1500));

  const timestamp = Date.now();
  const efficiencyScore = Math.round(prediction.efficiencyIndex * 100);
  
  // Mock hashing logic to look like a ledger transaction
  const rawData = `${deviceId}:${timestamp}:${efficiencyScore}`;
  const blockHash = await mockSha256(rawData);
  const signature = await mockSign(blockHash);

  return {
    id: `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    blockHash: `0x${blockHash}`,
    deviceId,
    timestamp,
    efficiencyScore,
    savingsProjected: 12000, // Enbridge rebate context
    signature: `0x${signature}`,
    status: 'MINTED'
  };
};

// Helper for fake crypto
async function mockSha256(message: string): Promise<string> {
  // Simple hashing simulation for demo purposes
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function mockSign(hash: string): Promise<string> {
  // Simulate an ECDSA signature
  return hash.split('').reverse().join('') + 'deadbeef'; 
}
