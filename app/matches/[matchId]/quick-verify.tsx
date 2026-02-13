// app/matches/[matchId]/quick-verify.tsx - DURING-MATCH SPOT CHECK

import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../../src/state/AppStore";

export default function QuickVerifyScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();

  const { matches, players, performFaceCheckIn } = useAppStore() as any;

  const match = matches.find((m: any) => m.id === matchId);

  const [jerseyNumber, setJerseyNumber] = useState("");
  const [playerFound, setPlayerFound] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const findPlayerByJersey = () => {
    if (!jerseyNumber.trim()) {
      Alert.alert("Enter Jersey Number", "Please enter the player's jersey number");
      return;
    }

    // Find player by jersey number in this match
    const player = players.find((p: any) => {
      const checkIn = p.checkInHistory?.find((c: any) => 
        c.matchId === matchId && 
        c.approved && 
        c.jerseyNumber === jerseyNumber.trim()
      );
      return !!checkIn;
    });

    if (!player) {
      Alert.alert(
        "⚠️ Player Not Found",
        `No player checked in with jersey #${jerseyNumber} for this match.\n\nPossible reasons:\n• Wrong jersey number\n• Player not checked in\n• Fraud attempt`,
        [{ text: "OK" }]
      );
      return;
    }

    setPlayerFound(player);
  };

  const quickVerify = async () => {
    if (!playerFound) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera permission required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
      cameraType: ImagePicker.CameraType.back,
    });

    if (!result.canceled && result.assets[0]) {
      setVerifying(true);

      try {
        const verification = await performFaceCheckIn(
          playerFound.id,
          matchId,
          result.assets[0].uri
        );

        setVerificationResult({
          ...verification,
          fieldPhoto: result.assets[0].uri,
        });

        if (verification.faceMatchScore >= 90) {
          Alert.alert(
            "✅ Player Verified",
            `${playerFound.fullName}\nJersey: #${jerseyNumber}\n\nFace Match: ${verification.faceMatchScore.toFixed(1)}%\nLiveness: ${verification.livenessScore.toFixed(1)}%\n\nPlayer is authorized.`,
            [
              {
                text: "Done",
                onPress: () => {
                  // Reset for next check
                  setJerseyNumber("");
                  setPlayerFound(null);
                  setVerificationResult(null);
                }
              }
            ]
          );
        } else {
          Alert.alert(
            "🚨 FRAUD ALERT",
            `${playerFound.fullName}\nJersey: #${jerseyNumber}\n\nFace Match: ${verification.faceMatchScore.toFixed(1)}%\n\nThis player's face DOES NOT MATCH their check-in!\n\nIMMEDIATE ACTION REQUIRED:\n1. Stop play\n2. Remove player from field\n3. Request official ID\n4. Contact security`,
            [
              {
                text: "Issue Red Card",
                style: "destructive",
                onPress: () => {
                  console.log(`FRAUD: ${playerFound.fullName} - Jersey #${jerseyNumber}`);
                  Alert.alert("🔴 Red Card Issued", "Player removed from match. Security notified.");
                  router.back();
                }
              },
              {
                text: "Retry Scan",
                onPress: () => setVerificationResult(null)
              }
            ]
          );
        }
      } catch (error) {
        Alert.alert("Error", "Verification failed");
      } finally {
        setVerifying(false);
      }
    }
  };

  const reset = () => {
    setJerseyNumber("");
    setPlayerFound(null);
    setVerificationResult(null);
  };

  if (!match) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: "#EAF2FF", marginTop: 20 }}>Match not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900", marginTop: 16 }}>
          ⚡ Quick Spot Check
        </Text>
        <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
          Verify any player during the match
        </Text>

        {/* Info */}
        <View style={{
          marginTop: 20,
          backgroundColor: "rgba(34,198,210,0.1)",
          padding: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "rgba(34,198,210,0.3)",
        }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 13, marginBottom: 6 }}>
            💡 When to Use
          </Text>
          <Text style={{ color: "#EAF2FF", fontSize: 12, lineHeight: 18 }}>
            • Suspicious player behavior{"\n"}
            • Opposition complaints{"\n"}
            • Random spot checks{"\n"}
            • Substitution verification{"\n"}
            • Referee's discretion
          </Text>
        </View>

        {/* Step 1: Enter Jersey Number */}
        {!playerFound && (
          <View style={{ marginTop: 24 }}>
            <Text style={{ color: "#EAF2FF", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
              Step 1: Enter Jersey Number
            </Text>

            <View style={{
              backgroundColor: "#0A2238",
              padding: 24,
              borderRadius: 14,
              alignItems: "center",
              marginBottom: 20,
            }}>
              <Text style={{ color: "#9FB3C8", fontSize: 14, marginBottom: 12 }}>
                Jersey Number
              </Text>
              <TextInput
                value={jerseyNumber}
                onChangeText={setJerseyNumber}
                placeholder="00"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="number-pad"
                maxLength={2}
                autoFocus
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  width: 120,
                  padding: 20,
                  borderRadius: 16,
                  fontSize: 48,
                  fontWeight: "900",
                  textAlign: "center",
                  borderWidth: 3,
                  borderColor: jerseyNumber ? "#22C6D2" : "rgba(255,255,255,0.2)",
                }}
              />
            </View>

            <TouchableOpacity
              onPress={findPlayerByJersey}
              disabled={!jerseyNumber.trim()}
              style={{
                backgroundColor: jerseyNumber.trim() ? "#22C6D2" : "#0A2238",
                padding: 18,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text style={{
                color: jerseyNumber.trim() ? "#061A2B" : "#9FB3C8",
                fontWeight: "900",
                fontSize: 16,
              }}>
                🔍 Find Player
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Player Found - Verify */}
        {playerFound && !verificationResult && (
          <View style={{ marginTop: 24 }}>
            <View style={{
              backgroundColor: "rgba(34,198,210,0.1)",
              padding: 16,
              borderRadius: 12,
              marginBottom: 20,
              borderWidth: 2,
              borderColor: "rgba(34,198,210,0.3)",
            }}>
              <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
                Player Found
              </Text>
              
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#22C6D2",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 20 }}>
                    {jerseyNumber}
                  </Text>
                </View>

                <View>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                    {playerFound.fullName}
                  </Text>
                  <Text style={{ color: "#9FB3C8", fontSize: 13, marginTop: 2 }}>
                    {playerFound.position || "No position"}
                  </Text>
                </View>
              </View>

              {/* Check-in photo if available */}
              {playerFound.checkInHistory?.[0]?.selfieUri && (
                <View style={{ marginTop: 14 }}>
                  <Text style={{ color: "#9FB3C8", fontSize: 11, marginBottom: 6, fontWeight: "900" }}>
                    CHECK-IN PHOTO
                  </Text>
                  <Image
                    source={{ uri: playerFound.checkInHistory[0].selfieUri }}
                    style={{
                      width: "100%",
                      height: 200,
                      borderRadius: 12,
                      backgroundColor: "#0A2238",
                    }}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>

            <Text style={{ color: "#EAF2FF", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
              Step 2: Scan Player on Field
            </Text>

            <TouchableOpacity
              onPress={quickVerify}
              disabled={verifying}
              style={{
                backgroundColor: "#F2D100",
                padding: 20,
                borderRadius: 14,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              {verifying ? (
                <ActivityIndicator color="#061A2B" />
              ) : (
                <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>
                  📸 Scan Player Now
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={reset}
              style={{
                backgroundColor: "#0A2238",
                padding: 14,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Results */}
        {verificationResult && (
          <View style={{ marginTop: 24 }}>
            <View style={{
              backgroundColor: verificationResult.faceMatchScore >= 90 
                ? "rgba(52,199,89,0.1)" 
                : "rgba(255,59,48,0.1)",
              padding: 16,
              borderRadius: 14,
              borderWidth: 2,
              borderColor: verificationResult.faceMatchScore >= 90
                ? "rgba(52,199,89,0.3)"
                : "rgba(255,59,48,0.3)",
              marginBottom: 20,
            }}>
              <Text style={{
                color: verificationResult.faceMatchScore >= 90 ? "#34C759" : "#FF3B30",
                fontWeight: "900",
                fontSize: 18,
                marginBottom: 12,
              }}>
                {verificationResult.faceMatchScore >= 90 ? "✅ VERIFIED" : "🚨 FRAUD ALERT"}
              </Text>

              <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
                <View style={{ flex: 1, backgroundColor: "#0A2238", padding: 12, borderRadius: 8 }}>
                  <Text style={{ color: "#9FB3C8", fontSize: 11, marginBottom: 4 }}>
                    Face Match
                  </Text>
                  <Text style={{
                    color: verificationResult.faceMatchScore >= 90 ? "#34C759" : "#FF3B30",
                    fontWeight: "900",
                    fontSize: 24,
                  }}>
                    {verificationResult.faceMatchScore.toFixed(1)}%
                  </Text>
                </View>

                <View style={{ flex: 1, backgroundColor: "#0A2238", padding: 12, borderRadius: 8 }}>
                  <Text style={{ color: "#9FB3C8", fontSize: 11, marginBottom: 4 }}>
                    Liveness
                  </Text>
                  <Text style={{
                    color: verificationResult.livenessScore >= 70 ? "#34C759" : "#FF3B30",
                    fontWeight: "900",
                    fontSize: 24,
                  }}>
                    {verificationResult.livenessScore.toFixed(1)}%
                  </Text>
                </View>
              </View>

              {/* Photo comparison */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                {playerFound.checkInHistory?.[0]?.selfieUri && (
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#9FB3C8", fontSize: 10, marginBottom: 6, fontWeight: "900" }}>
                      CHECK-IN
                    </Text>
                    <Image
                      source={{ uri: playerFound.checkInHistory[0].selfieUri }}
                      style={{
                        width: "100%",
                        height: 150,
                        borderRadius: 10,
                        backgroundColor: "#0A2238",
                      }}
                      resizeMode="cover"
                    />
                  </View>
                )}
                {verificationResult.fieldPhoto && (
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#9FB3C8", fontSize: 10, marginBottom: 6, fontWeight: "900" }}>
                      ON FIELD
                    </Text>
                    <Image
                      source={{ uri: verificationResult.fieldPhoto }}
                      style={{
                        width: "100%",
                        height: 150,
                        borderRadius: 10,
                        backgroundColor: "#0A2238",
                      }}
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={reset}
              style={{
                backgroundColor: "#22C6D2",
                padding: 18,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>
                ✓ Check Another Player
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}