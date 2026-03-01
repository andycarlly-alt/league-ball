// src/services/faceRecognition.ts - MOCK VERSION FOR DEMO

interface FaceEmbeddingResult {
  faceId: string;
  success: boolean;
  quality: {
    brightness: number;
    sharpness: number;
  };
}

interface FaceMatchResult {
  matched: boolean;
  similarity: number;
  faceId: string;
  confidence: number;
}

export class FaceRecognitionService {
  async extractFaceEmbedding(
    imageUri: string,
    playerId: string
  ): Promise<FaceEmbeddingResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      faceId: `face_${playerId}_${Date.now()}`,
      success: true,
      quality: {
        brightness: 72,
        sharpness: 85,
      },
    };
  }

  async matchFace(livePhotoUri: string, threshold: number = 90): Promise<FaceMatchResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      matched: true,
      similarity: 96.5,
      faceId: `face_verified_${Date.now()}`,
      confidence: 95,
    };
  }

  async deleteFace(faceId: string): Promise<void> {
    console.log('Mock: Deleted face:', faceId);
  }

  async getPlayerIdFromFaceId(faceId: string): Promise<string | null> {
    // Extract player ID from face ID format: face_PLAYERID_timestamp
    const parts = faceId.split('_');
    return parts.length > 1 ? parts[1] : null;
  }
}

export const faceRecognition = new FaceRecognitionService();