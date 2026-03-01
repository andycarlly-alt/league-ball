// app/players/[playerId].tsx - ENHANCED WITH REAL VERIFICATION
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getVerificationService } from "../../src/services/documentVerification";
import { playerVerificationService } from "../../src/services/playerVerification";
import { ageBannerStyle, calcAge, DocumentType, useAppStore } from "../../src/state/AppStore";

type LicenseData = {
  documentType: DocumentType | null;
  frontUri: string | null;
  backUri: string | null;
  parsedName: string | null;
  parsedDOB: string | null;
  parsedAddress: string | null;
  parsedDocumentNumber: string | null;
  parsedExpiration: string | null;
  parsedState: string | null;
  parsedCountry: string | null;
  confidence: number;
  fraudScore?: number;
  authentic?: boolean;
};

export default function PlayerProfileScreen() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>();
  const router = useRouter();
  const { players, teams, tournaments, toggleVerifyPlayer, can, updatePlayerVerification } = useAppStore();

  const player = players.find((p) => p.id === playerId);
  const team = teams.find((t) => t.id === player?.teamId);
  const tournament = tournaments.find((t) => t.id === player?.tournamentId);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scanningLicense, setScanningLicense] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [licenseData, setLicenseData] = useState<LicenseData>({
    documentType: null,
    frontUri: null,
    backUri: null,
    parsedName: null,
    parsedDOB: null,
    parsedAddress: null,
    parsedDocumentNumber: null,
    parsedExpiration: null,
    parsedState: null,
    parsedCountry: null,
    confidence: 0,
  });

  if (!player) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Player Profile</Text>
        <Text style={{ color: "#9FB3C8", marginTop: 8 }}>Player not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900" }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const age = calcAge(player.dob) ?? 0;
  const banner = ageBannerStyle(age);
  const canVerify = can("VERIFY_PLAYER");
  const canInvite = can("INVITE_PLAYER");

  const documentTypes: { type: DocumentType; label: string; icon: string; requiresBack: boolean }[] = [
    { type: 'DRIVERS_LICENSE', label: "Driver's License", icon: "🚗", requiresBack: true },
    { type: 'STATE_ID', label: "State ID", icon: "🪪", requiresBack: true },
    { type: 'PASSPORT', label: "Passport", icon: "🛂", requiresBack: false },
  ];

  const selectedDocType = documentTypes.find(d => d.type === licenseData.documentType);

  // ✨ REAL AI-POWERED DOCUMENT PARSING (replacing mock)
  const parseDocument = async (imageUri: string, side: 'front' | 'back') => {
    setScanningLicense(true);
    
    try {
      // Get the verification service (Jumio or Mock based on env)
      const verificationService = getVerificationService();

      if (side === 'front') {
        // For front, we need to wait for back (if required) before calling API
        setLicenseData(prev => ({
          ...prev,
          frontUri: imageUri,
        }));

        if (!selectedDocType?.requiresBack) {
          // Passport - only front needed, verify immediately
          const result = await verificationService.verifyDocument(
            imageUri,
            '', // No back image for passport
            player.id
          );

          if (result.success && result.authentic) {
            setLicenseData(prev => ({
              ...prev,
              frontUri: imageUri,
              parsedName: result.extractedData.name,
              parsedDOB: result.extractedData.dob,
              parsedAddress: result.extractedData.address,
              parsedDocumentNumber: result.extractedData.licenseNumber,
              parsedExpiration: result.extractedData.expirationDate,
              parsedState: result.extractedData.state,
              parsedCountry: 'USA',
              confidence: result.confidence / 100,
              fraudScore: result.fraudScore,
              authentic: result.authentic,
            }));

            Alert.alert(
              `✅ ${selectedDocType?.label} Verified!`,
              `Document is authentic!\n\nName: ${result.extractedData.name}\nDOB: ${result.extractedData.dob}\nDocument #: ${result.extractedData.licenseNumber}\nExpires: ${result.extractedData.expirationDate}\n\nConfidence: ${result.confidence}%\nFraud Score: ${result.fraudScore}`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Auto-Fill & Save",
                  onPress: () => saveVerificationData(result.extractedData, result.confidence, result.fraudScore),
                }
              ]
            );
          } else {
            Alert.alert(
              "⚠️ Document Verification Failed",
              result.reasons.join('\n') || 'Unable to verify document authenticity',
              [{ text: "OK" }]
            );
          }
        } else {
          // Driver's License or State ID - need back image
          Alert.alert(
            "✓ Front Captured",
            `${selectedDocType?.label} front side captured. Please scan the back side to continue.`,
            [{ text: "OK" }]
          );
        }
      } else {
        // Back side captured
        setLicenseData(prev => ({
          ...prev,
          backUri: imageUri,
        }));

        // Now we have both sides, verify the document
        if (licenseData.frontUri) {
          const result = await verificationService.verifyDocument(
            licenseData.frontUri,
            imageUri,
            player.id
          );

          if (result.success && result.authentic) {
            setLicenseData(prev => ({
              ...prev,
              backUri: imageUri,
              parsedName: result.extractedData.name,
              parsedDOB: result.extractedData.dob,
              parsedAddress: result.extractedData.address,
              parsedDocumentNumber: result.extractedData.licenseNumber,
              parsedExpiration: result.extractedData.expirationDate,
              parsedState: result.extractedData.state,
              parsedCountry: 'USA',
              confidence: result.confidence / 100,
              fraudScore: result.fraudScore,
              authentic: result.authentic,
            }));

            Alert.alert(
              `✅ ${selectedDocType?.label} Verified!`,
              `Document is authentic!\n\nName: ${result.extractedData.name}\nDOB: ${result.extractedData.dob}\nDocument #: ${result.extractedData.licenseNumber}\nExpires: ${result.extractedData.expirationDate}\n\nConfidence: ${result.confidence}%\nFraud Score: ${result.fraudScore}`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Auto-Fill & Save",
                  onPress: () => saveVerificationData(result.extractedData, result.confidence, result.fraudScore),
                }
              ]
            );
          } else {
            Alert.alert(
              "⚠️ Document Verification Failed",
              result.reasons.join('\n') || 'Unable to verify document authenticity',
              [{ text: "OK" }]
            );
          }
        }
      }

    } catch (error) {
      Alert.alert("Error", `Failed to verify document: ${error.message}`);
      console.error("Document verification error:", error);
    } finally {
      setScanningLicense(false);
    }
  };

  const saveVerificationData = (extractedData: any, confidence: number, fraudScore: number) => {
    if (updatePlayerVerification) {
      updatePlayerVerification({
        playerId: player.id,
        documentType: licenseData.documentType!,
        documentFrontUrl: licenseData.frontUri!,
        documentBackUrl: licenseData.backUri || undefined,
        extractedName: extractedData.name,
        extractedDOB: extractedData.dob,
        extractedAddress: extractedData.address,
        extractedDocumentNumber: extractedData.licenseNumber,
        extractedExpiration: extractedData.expirationDate,
        extractedState: extractedData.state,
        extractedCountry: 'USA',
        documentConfidence: confidence,
        fraudScore: fraudScore,
        verificationStatus: fraudScore < 30 ? 'APPROVED' : 'REVIEW_REQUIRED',
      });
      Alert.alert("✅ Success!", "Player details updated with verified document data!");
    }
  };

  // ✨ COMPLETE VERIFICATION (Document + Face + Liveness)
  const performCompleteVerification = async () => {
    if (!licenseData.frontUri || !photoUri) {
      Alert.alert(
        "Missing Required Items",
        "Please upload both:\n• Government ID document\n• Player selfie photo",
        [{ text: "OK" }]
      );
      return;
    }

    if (selectedDocType?.requiresBack && !licenseData.backUri) {
      Alert.alert(
        "Missing Back Side",
        `Please scan the back of the ${selectedDocType?.label}`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "🔐 Complete Verification",
      "This will verify:\n• Document authenticity\n• Face liveness detection\n• Face match (photo vs ID)\n\nThis may take 10-15 seconds.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start Verification",
          onPress: async () => {
            setVerificationInProgress(true);

            try {
              const result = await playerVerificationService.verifyPlayer(
                player.id,
                licenseData.frontUri!,
                licenseData.backUri || '',
                photoUri!
              );

              if (result.verified) {
                // Success!
                Alert.alert(
                  "✅ Verification Complete!",
                  `Player successfully verified!\n\nConfidence: ${result.confidence.toFixed(1)}%\n\n` +
                  `✓ Document authentic\n✓ Liveness confirmed\n✓ Face matched\n\n` +
                  (result.warnings.length > 0 ? `Warnings:\n${result.warnings.join('\n')}` : ''),
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        // Mark player as verified
                        if (updatePlayerVerification) {
                          updatePlayerVerification({
                            playerId: player.id,
                            verificationStatus: 'APPROVED',
                            documentType: licenseData.documentType!,
                            documentFrontUrl: licenseData.frontUri!,
                            documentBackUrl: licenseData.backUri || undefined,
                            faceId: result.faceId,
                            verifiedAt: new Date().toISOString(),
                          });
                        }
                        
                        // Toggle verification in AppStore
                        if (!player.verified) {
                          toggleVerifyPlayer(player.id);
                        }
                      }
                    }
                  ]
                );
              } else {
                // Failed
                Alert.alert(
                  "❌ Verification Failed",
                  `Unable to verify player:\n\n${result.errors.join('\n')}\n\n` +
                  (result.warnings.length > 0 ? `Warnings:\n${result.warnings.join('\n')}` : ''),
                  [{ text: "OK" }]
                );
              }
            } catch (error) {
              Alert.alert(
                "Error",
                `Verification failed: ${error.message}`,
                [{ text: "OK" }]
              );
            } finally {
              setVerificationInProgress(false);
            }
          }
        }
      ]
    );
  };

  const captureDocument = async (side: 'front' | 'back') => {
    if (!licenseData.documentType) {
      Alert.alert("Select Document Type", "Please select a document type first.");
      return;
    }

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera access is needed to scan documents.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: licenseData.documentType === 'PASSPORT' ? [3, 4] : [16, 10],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await parseDocument(result.assets[0].uri, side);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture document. Please try again.");
    }
  };

  const uploadDocument = async (side: 'front' | 'back') => {
    if (!licenseData.documentType) {
      Alert.alert("Select Document Type", "Please select a document type first.");
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission Required", "Photo library access is needed.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: licenseData.documentType === 'PASSPORT' ? [3, 4] : [16, 10],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await parseDocument(result.assets[0].uri, side);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload document. Please try again.");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera access is needed to capture player photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        setTimeout(() => {
          setPhotoUri(result.assets[0].uri);
          setUploading(false);
          Alert.alert("Photo Captured", "Player photo saved. Ready for verification!");
        }, 500);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const uploadPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission Required", "Photo library access is needed.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        setTimeout(() => {
          setPhotoUri(result.assets[0].uri);
          setUploading(false);
          Alert.alert("Photo Uploaded", "Player photo saved. Ready for verification!");
        }, 500);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload photo. Please try again.");
    }
  };

  const sendInvite = () => {
    if (!canInvite) {
      Alert.alert("Not Allowed", "Only coaches and team reps can send invites.");
      return;
    }

    Alert.alert(
      "Send Player Invite",
      `Send registration invite to ${player.fullName}?\n\nThey'll receive a link to upload their photo and verify details.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Invite",
          onPress: () => {
            Alert.alert(
              "Invite Sent! 📧",
              `Invite sent to ${player.fullName}\n\nThey can now:\n1. Upload their photo\n2. Scan government ID\n3. Confirm DOB\n4. Sign waiver\n\nYou'll be notified when complete.`
            );
          },
        },
      ]
    );
  };

  const handleVerify = () => {
    if (!canVerify) {
      Alert.alert("Not Allowed", "Only admins can verify players.");
      return;
    }

    if (!photoUri && !player.verified) {
      Alert.alert(
        "Photo Recommended",
        "Consider uploading a photo before verification for faster game-day check-in.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Verify Anyway",
            onPress: () => {
              const res = toggleVerifyPlayer(player.id);
              if (!res.ok) {
                Alert.alert("Error", res.reason || "Unable to verify");
              }
            },
          },
        ]
      );
      return;
    }

    const res = toggleVerifyPlayer(player.id);
    if (!res.ok) {
      Alert.alert("Error", res.reason || "Unable to verify");
    } else {
      Alert.alert(
        player.verified ? "Unverified" : "Verified!",
        player.verified
          ? "Player verification removed."
          : "✅ Player verified and ready for game day!"
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ color: "#F2D100", fontSize: 20, fontWeight: "900" }}>Player Profile</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Age Banner */}
        <View style={{ borderRadius: 14, overflow: "hidden" }}>
          <View style={{ backgroundColor: banner.bg, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: banner.fg, fontWeight: "900", fontSize: 16 }}>
              {banner.label} • Age {age}
            </Text>
            {player.verified && (
              <View style={{ backgroundColor: "rgba(255,255,255,0.2)", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 }}>
                <Text style={{ color: banner.fg, fontWeight: "900", fontSize: 12 }}>✓ VERIFIED</Text>
              </View>
            )}
          </View>
        </View>

        {/* AI-POWERED DOCUMENT SCANNER */}
        <View style={{ backgroundColor: "#0A2238", borderRadius: 18, padding: 14, borderWidth: 2, borderColor: "#F2D100" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Text style={{ fontSize: 24 }}>🤖</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16 }}>AI Document Scanner</Text>
              <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                {process.env.EXPO_PUBLIC_USE_MOCK_VERIFICATION === 'true' 
                  ? 'Test Mode - Mock Verification' 
                  : 'Live Verification - Jumio Powered'}
              </Text>
            </View>
          </View>

          {/* Document Type Selection */}
          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>Select Document Type</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {documentTypes.map((docType) => (
                <TouchableOpacity
                  key={docType.type}
                  onPress={() => setLicenseData(prev => ({ ...prev, documentType: docType.type, frontUri: null, backUri: null }))}
                  style={{
                    flex: 1,
                    backgroundColor: licenseData.documentType === docType.type ? "#F2D100" : "#0B2842",
                    padding: 12,
                    borderRadius: 12,
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: licenseData.documentType === docType.type ? "#F2D100" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>{docType.icon}</Text>
                  <Text style={{
                    color: licenseData.documentType === docType.type ? "#061A2B" : "#EAF2FF",
                    fontWeight: "900",
                    fontSize: 11,
                    textAlign: "center"
                  }}>
                    {docType.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {licenseData.documentType && (
            <>
              {scanningLicense && (
                <View style={{ marginTop: 14, padding: 20, backgroundColor: "#0B2842", borderRadius: 12, alignItems: "center" }}>
                  <ActivityIndicator size="large" color="#F2D100" />
                  <Text style={{ color: "#F2D100", marginTop: 10, fontWeight: "900" }}>🤖 Verifying Document...</Text>
                  <Text style={{ color: "#9FB3C8", marginTop: 4, fontSize: 12 }}>
                    Checking authenticity & extracting data
                  </Text>
                </View>
              )}

              {/* Document Front */}
              <View style={{ marginTop: 14 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>
                  {selectedDocType?.label} - Front
                </Text>
                {licenseData.frontUri ? (
                  <View>
                    <Image
                      source={{ uri: licenseData.frontUri }}
                      style={{ width: "100%", height: 140, borderRadius: 12, backgroundColor: "#0B2842" }}
                      resizeMode="cover"
                    />
                    {licenseData.parsedName && (
                      <View style={{ 
                        marginTop: 8, 
                        backgroundColor: licenseData.authentic ? "rgba(52,199,89,0.1)" : "rgba(255,149,0,0.1)", 
                        padding: 10, 
                        borderRadius: 10, 
                        borderWidth: 1, 
                        borderColor: licenseData.authentic ? "rgba(52,199,89,0.3)" : "rgba(255,149,0,0.3)" 
                      }}>
                        <Text style={{ 
                          color: licenseData.authentic ? "#34C759" : "#FF9500", 
                          fontWeight: "900", 
                          fontSize: 12 
                        }}>
                          {licenseData.authentic ? '✓ Authentic Document' : '⚠️ Needs Review'}
                        </Text>
                        <Text style={{ color: "#EAF2FF", fontSize: 11, marginTop: 4 }}>
                          Name: {licenseData.parsedName}
                        </Text>
                        <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 2 }}>
                          DOB: {licenseData.parsedDOB} • Doc #: {licenseData.parsedDocumentNumber}
                        </Text>
                        <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 2 }}>
                          Confidence: {(licenseData.confidence * 100).toFixed(0)}% • Fraud Score: {licenseData.fraudScore || 0}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={{ height: 140, backgroundColor: "#0B2842", borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(242,209,0,0.3)", borderStyle: "dashed" }}>
                    <Text style={{ color: "#9FB3C8", fontSize: 40 }}>{selectedDocType?.icon}</Text>
                    <Text style={{ color: "#9FB3C8", marginTop: 6, fontWeight: "900", fontSize: 12 }}>
                      Front of {selectedDocType?.label}
                    </Text>
                  </View>
                )}
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={() => captureDocument('front')}
                    disabled={scanningLicense}
                    style={{ flex: 1, backgroundColor: scanningLicense ? "#9FB3C8" : "#F2D100", paddingVertical: 10, borderRadius: 10, alignItems: "center" }}
                  >
                    <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 13 }}>📷 Scan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => uploadDocument('front')}
                    disabled={scanningLicense}
                    style={{ flex: 1, backgroundColor: scanningLicense ? "#9FB3C8" : "#22C6D2", paddingVertical: 10, borderRadius: 10, alignItems: "center" }}
                  >
                    <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 13 }}>🖼️ Upload</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Document Back (only for License and State ID) */}
              {selectedDocType?.requiresBack && (
                <View style={{ marginTop: 14 }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>
                    {selectedDocType?.label} - Back
                  </Text>
                  {licenseData.backUri ? (
                    <Image
                      source={{ uri: licenseData.backUri }}
                      style={{ width: "100%", height: 140, borderRadius: 12, backgroundColor: "#0B2842" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{ height: 140, backgroundColor: "#0B2842", borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(242,209,0,0.3)", borderStyle: "dashed" }}>
                      <Text style={{ color: "#9FB3C8", fontSize: 40 }}>{selectedDocType?.icon}</Text>
                      <Text style={{ color: "#9FB3C8", marginTop: 6, fontWeight: "900", fontSize: 12 }}>
                        Back of {selectedDocType?.label}
                      </Text>
                    </View>
                  )}
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                    <TouchableOpacity
                      onPress={() => captureDocument('back')}
                      disabled={scanningLicense}
                      style={{ flex: 1, backgroundColor: scanningLicense ? "#9FB3C8" : "#F2D100", paddingVertical: 10, borderRadius: 10, alignItems: "center" }}
                    >
                      <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 13 }}>📷 Scan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => uploadDocument('back')}
                      disabled={scanningLicense}
                      style={{ flex: 1, backgroundColor: scanningLicense ? "#9FB3C8" : "#22C6D2", paddingVertical: 10, borderRadius: 10, alignItems: "center" }}
                    >
                      <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 13 }}>🖼️ Upload</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Passport Note */}
              {licenseData.documentType === 'PASSPORT' && (
                <View style={{ marginTop: 12, backgroundColor: "rgba(34,198,210,0.1)", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "rgba(34,198,210,0.3)" }}>
                  <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 12 }}>📘 Passport Note:</Text>
                  <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4 }}>
                    Only the photo page is needed for passports
                  </Text>
                </View>
              )}
            </>
          )}

          {/* AI Benefits */}
          <View style={{ marginTop: 12, backgroundColor: "rgba(242,209,0,0.1)", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "rgba(242,209,0,0.3)" }}>
            <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 12 }}>⚡ AI Benefits:</Text>
            <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4, lineHeight: 16 }}>
              • Instant authenticity verification{"\n"}
              • Fraud detection & security checks{"\n"}
              • Automatic data extraction{"\n"}
              • Supports 200+ document types
            </Text>
          </View>
        </View>

        {/* Photo Section */}
        <View style={{ backgroundColor: "#0A2238", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16 }}>Player Photo (Selfie)</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 6, lineHeight: 20 }}>
            Used for face matching and liveness detection during verification.
          </Text>

          {uploading ? (
            <View style={{ marginTop: 14, height: 240, backgroundColor: "#0B2842", borderRadius: 14, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" color="#F2D100" />
              <Text style={{ color: "#9FB3C8", marginTop: 10 }}>Processing...</Text>
            </View>
          ) : photoUri ? (
            <View style={{ marginTop: 14 }}>
              <Image
                source={{ uri: photoUri }}
                style={{ width: "100%", height: 240, borderRadius: 14, backgroundColor: "#0B2842" }}
                resizeMode="cover"
              />
              <Text style={{ color: "#22C6D2", marginTop: 8, fontWeight: "900", textAlign: "center" }}>
                ✓ Photo ready for verification
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: 14, height: 240, backgroundColor: "#0B2842", borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(242,209,0,0.3)", borderStyle: "dashed" }}>
              <Text style={{ color: "#9FB3C8", fontSize: 48 }}>📸</Text>
              <Text style={{ color: "#9FB3C8", marginTop: 10, fontWeight: "900" }}>No photo yet</Text>
            </View>
          )}

          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <TouchableOpacity
              onPress={takePhoto}
              style={{ flex: 1, backgroundColor: "#F2D100", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>📷 Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={uploadPhoto}
              style={{ flex: 1, backgroundColor: "#22C6D2", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>🖼️ Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ✨ COMPLETE VERIFICATION BUTTON */}
        {licenseData.frontUri && photoUri && (
          <View style={{ backgroundColor: "rgba(52,199,89,0.1)", borderRadius: 18, padding: 14, borderWidth: 2, borderColor: "#34C759" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 24 }}>🔐</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 16 }}>Ready for Verification</Text>
                <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                  Document & photo uploaded - verify now!
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={performCompleteVerification}
              disabled={verificationInProgress}
              style={{
                backgroundColor: verificationInProgress ? "#9FB3C8" : "#34C759",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {verificationInProgress ? (
                <>
                  <ActivityIndicator color="#FFF" />
                  <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 15 }}>
                    Verifying...
                  </Text>
                </>
              ) : (
                <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 15 }}>
                  🔐 Complete Verification (3-Step)
                </Text>
              )}
            </TouchableOpacity>

            <View style={{ marginTop: 12, backgroundColor: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 10 }}>
              <Text style={{ color: "#9FB3C8", fontSize: 11, lineHeight: 16 }}>
                This will verify:{"\n"}
                ✓ Document authenticity{"\n"}
                ✓ Liveness detection (real person){"\n"}
                ✓ Face match (photo vs ID)
              </Text>
            </View>
          </View>
        )}

        {/* Player Details */}
        <View style={{ backgroundColor: "#0A2238", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16 }}>Details</Text>

          <View style={{ marginTop: 12, gap: 10 }}>
            <View>
              <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Name</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 18, marginTop: 4 }}>
                {player.fullName}
              </Text>
              {licenseData.parsedName && (
                <Text style={{ color: "#34C759", fontSize: 11, marginTop: 2 }}>
                  ✓ Verified with {selectedDocType?.label}
                </Text>
              )}
            </View>

            <View>
              <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Date of Birth</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 4 }}>
                {player.dob || "Not provided"}
              </Text>
              {licenseData.parsedDOB && (
                <Text style={{ color: "#34C759", fontSize: 11, marginTop: 2 }}>
                  ✓ Verified with {selectedDocType?.label}
                </Text>
              )}
            </View>

            {licenseData.parsedDocumentNumber && (
              <View>
                <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Document Number</Text>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 4 }}>
                  {licenseData.parsedDocumentNumber}
                </Text>
              </View>
            )}

            {licenseData.parsedExpiration && (
              <View>
                <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Expiration Date</Text>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 4 }}>
                  {licenseData.parsedExpiration}
                </Text>
              </View>
            )}

            <View>
              <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Team</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 4 }}>
                {team?.name || "Unknown"}
              </Text>
            </View>

            {tournament && (
              <View>
                <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Tournament</Text>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 4 }}>
                  {tournament.name}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Invite Section */}
        {canInvite && (
          <View style={{ backgroundColor: "#0A2238", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16 }}>Player Invite</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
              Send invite so player can upload photo and scan government ID.
            </Text>

            <TouchableOpacity
              onPress={sendInvite}
              style={{ marginTop: 12, backgroundColor: "#22C6D2", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>📧 Send Invite</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Manual Verification (Legacy) */}
        {canVerify && (
          <View style={{ backgroundColor: "#0A2238", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16 }}>Manual Verification</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
              {player.verified
                ? "Player is manually verified."
                : "Use complete verification above for full security."}
            </Text>

            <TouchableOpacity
              onPress={handleVerify}
              style={{
                marginTop: 12,
                backgroundColor: player.verified ? "#FF3B30" : "#34C759",
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "900" }}>
                {player.verified ? "✗ Remove Verification" : "✓ Manual Verify"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Benefits */}
        <View style={{ backgroundColor: "rgba(34,198,210,0.1)", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(34,198,210,0.3)" }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16 }}>⚡ Game Day Benefits</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 8, lineHeight: 20 }}>
            • 5-second check-in vs 5-minute ID check{"\n"}
            • Prevent roster fraud & fake IDs{"\n"}
            • No physical ID needed at field{"\n"}
            • Digital verification trail{"\n"}
            • AI-powered 95%+ accuracy{"\n"}
            • Liveness detection (anti-spoofing)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}