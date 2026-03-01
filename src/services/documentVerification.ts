// src/services/documentVerification.ts

import axios from 'axios';

interface DocumentVerificationResult {
  success: boolean;
  authentic: boolean;
  confidence: number;
  fraudScore: number;
  reasons: string[];
  transactionId: string;
  extractedData: {
    name: string;
    dob: string;
    address: string;
    licenseNumber: string;
    expirationDate: string;
    state: string;
  };
  securityChecks: {
    hologramsPresent: boolean;
    photoManipulated: boolean;
    documentAltered: boolean;
    securityFeaturesValid: boolean;
  };
}

// JUMIO INTEGRATION (Recommended)
export class JumioVerificationService {
  private apiToken: string;
  private apiSecret: string;
  private baseUrl: string = 'https://netverify.com/api/v4';

  constructor() {
    this.apiToken = process.env.EXPO_PUBLIC_JUMIO_API_TOKEN || '';
    this.apiSecret = process.env.EXPO_PUBLIC_JUMIO_API_SECRET || '';
  }

  async verifyDocument(
    frontImageUri: string,
    backImageUri: string,
    userReference: string
  ): Promise<DocumentVerificationResult> {
    try {
      // Step 1: Initialize verification session
      const session = await this.initializeSession(userReference);

      // Step 2: Upload document images
      await this.uploadDocumentImages(session.token, frontImageUri, backImageUri);

      // Step 3: Wait for processing (usually 5-10 seconds)
      const result = await this.pollForResults(session.transactionReference);

      // Step 4: Parse and return results
      return this.parseJumioResult(result);
    } catch (error) {
      console.error('Jumio verification failed:', error);
      throw new Error(`Document verification failed: ${error.message}`);
    }
  }

  private async initializeSession(userReference: string) {
    const response = await axios.post(
      `${this.baseUrl}/initiate`,
      {
        userReference,
        customerInternalReference: `nvt_${userReference}`,
        workflowId: process.env.EXPO_PUBLIC_JUMIO_WORKFLOW_ID,
      },
      {
        auth: {
          username: this.apiToken,
          password: this.apiSecret,
        },
      }
    );

    return response.data;
  }

  private async uploadDocumentImages(token: string, frontUri: string, backUri: string) {
    const frontImage = await this.loadImageAsBase64(frontUri);
    const backImage = await this.loadImageAsBase64(backUri);

    await axios.put(
      `${this.baseUrl}/acquisitions`,
      {
        data: {
          type: 'ID',
          subType: 'DRIVERS_LICENSE',
          front: frontImage,
          back: backImage,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  private async pollForResults(transactionReference: string, maxAttempts = 20): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await axios.get(`${this.baseUrl}/retrievals/${transactionReference}`, {
        auth: {
          username: this.apiToken,
          password: this.apiSecret,
        },
      });

      if (response.data.status === 'DONE') {
        return response.data;
      }

      // Wait 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Verification timeout - results not available');
  }

  private parseJumioResult(result: any): DocumentVerificationResult {
    const verification = result.verification;
    const document = result.document;

    return {
      success: verification.status === 'APPROVED_VERIFIED',
      authentic: document.status === 'AUTHENTIC',
      confidence: verification.confidence || 0,
      fraudScore: this.calculateFraudScore(verification),
      reasons: this.extractReasons(verification),
      transactionId: result.transactionReference,
      extractedData: {
        name: `${document.firstName} ${document.lastName}`,
        dob: document.dob,
        address: `${document.address?.line1 || ''} ${document.address?.city || ''} ${document.address?.state || ''}`,
        licenseNumber: document.number,
        expirationDate: document.expiryDate,
        state: document.issuingCountryCode,
      },
      securityChecks: {
        hologramsPresent: document.securityFeatures?.includes('HOLOGRAM'),
        photoManipulated: verification.rejectReason?.includes('PHOTO_MANIPULATED'),
        documentAltered: verification.rejectReason?.includes('DOCUMENT_ALTERED'),
        securityFeaturesValid: document.status === 'AUTHENTIC',
      },
    };
  }

  private calculateFraudScore(verification: any): number {
    if (verification.status === 'APPROVED_VERIFIED') return 0;
    if (verification.status === 'DENIED_FRAUD') return 100;
    if (verification.status === 'DENIED_UNSUPPORTED_DOCUMENT') return 50;
    return 30;
  }

  private extractReasons(verification: any): string[] {
    const reasons: string[] = [];
    if (verification.rejectReason) {
      const codes = verification.rejectReason.split(',');
      codes.forEach((code: string) => {
        switch (code.trim()) {
          case 'PHOTO_MANIPULATED':
            reasons.push('Photo appears to be digitally altered');
            break;
          case 'DOCUMENT_ALTERED':
            reasons.push('Document has been tampered with');
            break;
          case 'HOLOGRAM_MISSING':
            reasons.push('Security hologram not detected');
            break;
          case 'POOR_QUALITY':
            reasons.push('Image quality too low for verification');
            break;
          default:
            reasons.push(code);
        }
      });
    }
    return reasons;
  }

  private async loadImageAsBase64(uri: string): Promise<string> {
    // Load image and convert to base64
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// SIMPLE MOCK SERVICE FOR TESTING (Replace with Jumio in production)
export class MockVerificationService {
  async verifyDocument(
    frontImageUri: string,
    backImageUri: string,
    userReference: string
  ): Promise<DocumentVerificationResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Return mock success result
    return {
      success: true,
      authentic: true,
      confidence: 95,
      fraudScore: 5,
      reasons: [],
      transactionId: `mock_${Date.now()}`,
      extractedData: {
        name: 'JOHN MICHAEL DOE',
        dob: '1990-03-15',
        address: '123 Main Street, Baltimore, MD 21201',
        licenseNumber: 'D123-456-789-012',
        expirationDate: '2028-03-15',
        state: 'MD',
      },
      securityChecks: {
        hologramsPresent: true,
        photoManipulated: false,
        documentAltered: false,
        securityFeaturesValid: true,
      },
    };
  }
}

// Factory to get the right service
export function getVerificationService(): JumioVerificationService | MockVerificationService {
  const useMock = process.env.EXPO_PUBLIC_USE_MOCK_VERIFICATION === 'true';
  
  if (useMock) {
    console.log('⚠️ Using MOCK verification service');
    return new MockVerificationService();
  }
  
  return new JumioVerificationService();
}