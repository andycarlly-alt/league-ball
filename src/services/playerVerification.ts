// src/services/playerVerification.ts

import { getVerificationService } from './documentVerification';
import { faceRecognition } from './faceRecognition';
import { livenessDetection } from './livenessDetection';

export interface VerificationStep {
  step: 'DOCUMENT' | 'LIVENESS' | 'FACE_MATCH' | 'COMPLETE';
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
  message: string;
  data?: any;
}

export interface PlayerVerificationResult {
  success: boolean;
  verified: boolean;
  confidence: number;
  steps: VerificationStep[];
  playerData: {
    name?: string;
    dob?: string;
    documentNumber?: string;
    address?: string;
    expirationDate?: string;
  };
  faceId?: string;
  warnings: string[];
  errors: string[];
}

export class PlayerVerificationService {
  private verificationService = getVerificationService();

  /**
   * Complete player verification flow
   * Called during player registration
   */
  async verifyPlayer(
    playerId: string,
    documentFrontUri: string,
    documentBackUri: string,
    selfieUri: string
  ): Promise<PlayerVerificationResult> {
    const steps: VerificationStep[] = [
      { step: 'DOCUMENT', status: 'PENDING', message: 'Waiting to verify document' },
      { step: 'LIVENESS', status: 'PENDING', message: 'Waiting to check liveness' },
      { step: 'FACE_MATCH', status: 'PENDING', message: 'Waiting to match faces' },
      { step: 'COMPLETE', status: 'PENDING', message: 'Waiting to complete' },
    ];

    const warnings: string[] = [];
    const errors: string[] = [];
    let playerData: any = {};
    let faceId: string | undefined;

    try {
      // ===== STEP 1: VERIFY DOCUMENT AUTHENTICITY =====
      steps[0].status = 'IN_PROGRESS';
      steps[0].message = 'Analyzing document...';

      const docResult = await this.verificationService.verifyDocument(
        documentFrontUri,
        documentBackUri,
        playerId
      );

      if (!docResult.success || !docResult.authentic) {
        steps[0].status = 'FAILED';
        steps[0].message = 'Document verification failed';
        errors.push(...docResult.reasons);

        return {
          success: false,
          verified: false,
          confidence: docResult.confidence,
          steps,
          playerData: docResult.extractedData,
          warnings,
          errors,
        };
      }

      steps[0].status = 'SUCCESS';
      steps[0].message = 'Document verified successfully';
      steps[0].data = docResult;
      playerData = docResult.extractedData;

      // Check security features
      if (!docResult.securityChecks.hologramsPresent) {
        warnings.push('Hologram not clearly visible');
      }

      if (docResult.fraudScore > 30) {
        warnings.push(`Elevated fraud score: ${docResult.fraudScore}`);
      }

      // ===== STEP 2: CHECK LIVENESS =====
      steps[1].status = 'IN_PROGRESS';
      steps[1].message = 'Checking liveness...';

      const livenessResult = await livenessDetection.detectLiveness(selfieUri);

      if (!livenessResult.isLive) {
        steps[1].status = 'FAILED';
        steps[1].message = 'Liveness check failed';
        errors.push(...livenessResult.reasons);

        return {
          success: false,
          verified: false,
          confidence: livenessResult.confidence,
          steps,
          playerData,
          warnings,
          errors,
        };
      }

      steps[1].status = 'SUCCESS';
      steps[1].message = 'Liveness verified';
      steps[1].data = livenessResult;

      if (livenessResult.confidence < 85) {
        warnings.push('Liveness confidence below recommended threshold');
      }

      // ===== STEP 3: EXTRACT & MATCH FACE =====
      steps[2].status = 'IN_PROGRESS';
      steps[2].message = 'Extracting and matching face...';

      // Extract face from document and index it
      const faceResult = await faceRecognition.extractFaceEmbedding(
        documentFrontUri,
        playerId
      );

      faceId = faceResult.faceId;

      // Verify face quality
      if (faceResult.quality.brightness < 40 || faceResult.quality.brightness > 80) {
        warnings.push('Document photo has unusual brightness');
      }

      if (faceResult.quality.sharpness < 50) {
        warnings.push('Document photo quality is low');
      }

      // Match selfie against document face
      const matchResult = await faceRecognition.matchFace(selfieUri, 90);

      if (!matchResult.matched) {
        steps[2].status = 'FAILED';
        steps[2].message = 'Face does not match document';
        errors.push('Selfie does not match face on document');

        // Clean up - delete face from collection
        await faceRecognition.deleteFace(faceId);

        return {
          success: false,
          verified: false,
          confidence: matchResult.similarity,
          steps,
          playerData,
          warnings,
          errors,
        };
      }

      steps[2].status = 'SUCCESS';
      steps[2].message = `Face matched (${matchResult.similarity.toFixed(1)}% similarity)`;
      steps[2].data = matchResult;

      if (matchResult.similarity < 95) {
        warnings.push('Face match similarity below recommended threshold');
      }

      // ===== STEP 4: COMPLETE =====
      steps[3].status = 'SUCCESS';
      steps[3].message = 'Verification complete';

      const finalConfidence = Math.min(
        docResult.confidence,
        livenessResult.confidence,
        matchResult.similarity
      );

      return {
        success: true,
        verified: true,
        confidence: finalConfidence,
        steps,
        playerData,
        faceId,
        warnings,
        errors,
      };
    } catch (error) {
      console.error('Verification error:', error);

      // Mark current step as failed
      const currentStep = steps.find(s => s.status === 'IN_PROGRESS');
      if (currentStep) {
        currentStep.status = 'FAILED';
        currentStep.message = 'Error during verification';
      }

      errors.push(`Verification error: ${(error as Error).message}`);

      // Clean up if face was created
      if (faceId) {
        try {
          await faceRecognition.deleteFace(faceId);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      }

      return {
        success: false,
        verified: false,
        confidence: 0,
        steps,
        playerData,
        warnings,
        errors,
      };
    }
  }

  /**
   * Quick verification at game day check-in
   * Only checks face match against stored face
   */
  async quickVerifyAtCheckIn(
    livePhotoUri: string,
    threshold: number = 95
  ): Promise<{
    matched: boolean;
    playerId: string | null;
    similarity: number;
    confidence: number;
  }> {
    try {
      // First check liveness
      const livenessResult = await livenessDetection.detectLiveness(livePhotoUri);

      if (!livenessResult.isLive || livenessResult.confidence < 70) {
        return {
          matched: false,
          playerId: null,
          similarity: 0,
          confidence: livenessResult.confidence,
        };
      }

      // Match face against collection
      const matchResult = await faceRecognition.matchFace(livePhotoUri, threshold);

      if (!matchResult.matched) {
        return {
          matched: false,
          playerId: null,
          similarity: matchResult.similarity,
          confidence: matchResult.confidence,
        };
      }

      // Get player ID from face ID
      const playerId = await faceRecognition.getPlayerIdFromFaceId(matchResult.faceId);

      return {
        matched: true,
        playerId,
        similarity: matchResult.similarity,
        confidence: matchResult.confidence,
      };
    } catch (error) {
      console.error('Quick verification error:', error);
      return {
        matched: false,
        playerId: null,
        similarity: 0,
        confidence: 0,
      };
    }
  }
}

