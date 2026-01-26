// src/services/faceRecognition.ts

import AWS from 'aws-sdk';
import * as FileSystem from 'expo-file-system';

interface FaceEmbeddingResult {
  faceId: string;
  boundingBox: {
    width: number;
    height: number;
    left: number;
    top: number;
  };
  confidence: number;
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
  private rekognition: AWS.Rekognition;
  private collectionId: string = 'nvt-verified-players';

  constructor() {
    // Initialize AWS SDK
    AWS.config.update({
      accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY,
      region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
    });

    this.rekognition = new AWS.Rekognition();
    
    // Create collection if it doesn't exist
    this.ensureCollectionExists();
  }

  private async ensureCollectionExists() {
    try {
      await this.rekognition.describeCollection({ CollectionId: this.collectionId }).promise();
    } catch (error) {
      if (error.code === 'ResourceNotFoundException') {
        await this.rekognition.createCollection({ CollectionId: this.collectionId }).promise();
        console.log('✅ Created face collection:', this.collectionId);
      }
    }
  }

  /**
   * Extract face embedding from license photo during registration
   */
  async extractFaceEmbedding(imageUri: string, playerId: string): Promise<FaceEmbeddingResult> {
    try {
      const imageBytes = await this.loadImageBytes(imageUri);

      // Index face in collection
      const result = await this.rekognition
        .indexFaces({
          CollectionId: this.collectionId,
          Image: { Bytes: imageBytes },
          ExternalImageId: playerId, // Link to player ID
          DetectionAttributes: ['ALL'],
          MaxFaces: 1,
          QualityFilter: 'AUTO',
        })
        .promise();

      if (!result.FaceRecords || result.FaceRecords.length === 0) {
        throw new Error('No face detected in image');
      }

      const faceRecord = result.FaceRecords[0];
      const face = faceRecord.Face;
      const faceDetail = faceRecord.FaceDetail;

      return {
        faceId: face.FaceId,
        boundingBox: face.BoundingBox,
        confidence: face.Confidence,
        quality: {
          brightness: faceDetail.Quality.Brightness,
          sharpness: faceDetail.Quality.Sharpness,
        },
      };
    } catch (error) {
      console.error('Face extraction failed:', error);
      throw new Error(`Failed to extract face: ${error.message}`);
    }
  }

  /**
   * Match live photo against stored face at game day
   */
  async matchFace(livePhotoUri: string, threshold: number = 95): Promise<FaceMatchResult> {
    try {
      const imageBytes = await this.loadImageBytes(livePhotoUri);

      // Search for matching face
      const result = await this.rekognition
        .searchFacesByImage({
          CollectionId: this.collectionId,
          Image: { Bytes: imageBytes },
          FaceMatchThreshold: threshold,
          MaxFaces: 1,
        })
        .promise();

      if (result.FaceMatches && result.FaceMatches.length > 0) {
        const match = result.FaceMatches[0];
        return {
          matched: true,
          similarity: match.Similarity,
          faceId: match.Face.FaceId,
          confidence: match.Face.Confidence,
        };
      }

      return {
        matched: false,
        similarity: 0,
        faceId: '',
        confidence: 0,
      };
    } catch (error) {
      console.error('Face matching failed:', error);
      throw new Error(`Failed to match face: ${error.message}`);
    }
  }

  /**
   * Get player ID from face ID
   */
  async getPlayerIdFromFaceId(faceId: string): Promise<string | null> {
    try {
      const result = await this.rekognition
        .listFaces({
          CollectionId: this.collectionId,
          MaxResults: 1000,
        })
        .promise();

      const face = result.Faces?.find(f => f.FaceId === faceId);
      return face?.ExternalImageId || null;
    } catch (error) {
      console.error('Failed to get player ID:', error);
      return null;
    }
  }

  /**
   * Delete face from collection (if player leaves)
   */
  async deleteFace(faceId: string): Promise<void> {
    try {
      await this.rekognition
        .deleteFaces({
          CollectionId: this.collectionId,
          FaceIds: [faceId],
        })
        .promise();
    } catch (error) {
      console.error('Failed to delete face:', error);
    }
  }

  private async loadImageBytes(uri: string): Promise<Buffer> {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return Buffer.from(base64, 'base64');
  }
}

// Singleton instance
export const faceRecognition = new FaceRecognitionService();