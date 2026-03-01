// src/services/livenessDetection.ts - MOCK VERSION FOR DEMO

interface LivenessResult {
  isLive: boolean;
  confidence: number;
  reasons: string[];
}

export class LivenessDetectionService {
  async detectLiveness(imageUri: string): Promise<LivenessResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful liveness check
    return {
      isLive: true,
      confidence: 94,
      reasons: ['All liveness checks passed'],
    };
  }
}

export const livenessDetection = new LivenessDetectionService();