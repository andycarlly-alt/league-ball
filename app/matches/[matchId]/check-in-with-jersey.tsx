// app/matches/[matchId]/check-in-with-jersey.tsx - CHECK-IN + JERSEY ASSIGNMENT

import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Player, useAppStore } from "../../../src/state/AppStore";

type CheckInStep = "SCAN" | "VERIFYING" | "APPROVED" | "JERSEY" | "COMPLETE";

export default function CheckInWithJerseyScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();

  const {
    matches,
    teams,
    players,
    performFaceCheckIn,
    getPlayersForTeam,
  } = useAppStore() as any;

  const match = matches.find((m: any) => m.id === matchId);
  const homeTeam = teams.find((t: any) => t.id === match?.homeTeamId);
  const awayTeam = teams.find((t: any) => t.id === match?.awayTeamId);

  const [step, setStep] = useState<CheckInStep>("SCAN");
  const [selectedTeam, setSelectedTeam] = useState<"HOME" | "AWAY" | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [checkInResult, setCheckInResult] = useState<any>(null);

  // Get players for selected team
  const teamPlayers = useMemo(() => {
    if (!selectedTeam || !match) return [];
    const teamId = selectedTeam === "HOME" ? match.homeTeamId : match.awayTeamId;
    return getPlayersForTeam(teamId);
  }, [selectedTeam, match, getPlayersForTeam]);

  // Get already assigned jersey numbers for this match
  const usedJerseys = useMemo(() => {
    if (!selectedTeam || !match) return new Set<string>();
    
    const teamId = selectedTeam === "HOME" ? match.homeTeamId : match.awayTeamId;
    const teamPlayers = getPlayersForTeam(teamId);
    
    // In production, fetch from match-specific jersey assignments
    // For now, return empty set
    return new Set<string>();
  }, [selectedTeam, match, getPlayersForTeam]);

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera permission is required for check-in");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled && result.assets[0]) {
      setSelfieUri(result.assets[0].uri);
      performFaceRecognition(result.assets[0].uri);
    }
  };

  const performFaceRecognition = async (uri: string) => {
    if (!selectedPlayer) {
      Alert.alert("Error", "Please select a player first");
      return;
    }

    setStep("VERIFYING");

    try {
      const result = await performFaceCheckIn(selectedPlayer.id, matchId, uri);

      setCheckInResult(result);

      if (result.approved) {
        // Success! Move to jersey assignment
        setStep("JERSEY");
        
        // Pre-fill jersey number if player has one saved
        if (selectedPlayer.shirtNumber) {
          setJerseyNumber(selectedPlayer.shirtNumber);
        }
      } else {
        // Failed - show results and allow retry
        Alert.alert(
          "❌ Check-In Failed",
          `Face Match: ${result.faceMatchScore.toFixed(1)}%\nLiveness: ${result.livenessScore.toFixed(1)}%\n\nPlease try again or contact an official.`,
          [
            {
              text: "Try Again",
              onPress: () => {
                setSelfieUri(null);
                setStep("SCAN");
              },
            },
            {
              text: "Contact Official",
              style: "cancel",
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Face recognition failed. Please try again.");
      setStep("SCAN");
      setSelfieUri(null);
    }
  };

  const assignJersey = () => {
    if (!jerseyNumber.trim()) {
      Alert.alert("Missing Jersey Number", "Please enter your jersey number");
      return;
    }

    const number = jerseyNumber.trim();

    // Validate number
    if (!/^\d{1,2}$/.test(number)) {
      Alert.alert("Invalid Number", "Jersey number must be 1-99");
      return;
    }

    // Check if number already used
    if (usedJerseys.has(number)) {
      Alert.alert(
        "⚠️ Number Already Taken",
        `Jersey #${number} is already assigned to another player on your team.\n\nPlease choose a different number.`,
        [{ text: "OK" }]
      );
      return;
    }

    // Save jersey assignment for this match
    // In production: Save to match-specific jersey assignments
    console.log(`Assigning jersey #${number} to ${selectedPlayer?.fullName} for match ${matchId}`);

    setStep("COMPLETE");

    // Show success and auto-close after delay
    setTimeout(() => {
      Alert.alert(
        "✅ Check-In Complete!",
        `${selectedPlayer?.fullName}\n\nJersey: #${number}\nFace Match: ${checkInResult.faceMatchScore.toFixed(1)}%\nLiveness: ${checkInResult.livenessScore.toFixed(1)}%\n\nYou're ready to play!`,
        [
          {
            text: "Done",
            onPress: () => router.back(),
          },
        ]
      );
    }, 500);
  };

  const resetCheckIn = () => {
    setStep("SCAN");
    setSelectedTeam(null);
    setSelectedPlayer(null);
    setSelfieUri(null);
    setJerseyNumber("");
    setCheckInResult(null);
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
          Match Check-In
        </Text>
        <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
          {homeTeam?.name} vs {awayTeam?.name}
        </Text>

        {/* Progress Steps */}
        <View style={{ marginTop: 20, marginBottom: 30 }}>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            {[
              { step: "SCAN", label: "1. Scan" },
              { step: "VERIFYING", label: "2. Verify" },
              { step: "JERSEY", label: "3. Jersey" },
              { step: "COMPLETE", label: "4. Done" },
            ].map((s, i) => {
              const isActive = 
                (step === "SCAN" && i === 0) ||
                (step === "VERIFYING" && i === 1) ||
                (step === "APPROVED" && i === 1) ||
                (step === "JERSEY" && i === 2) ||
                (step === "COMPLETE" && i === 3);
              
              const isComplete =
                (step === "VERIFYING" && i === 0) ||
                (step === "APPROVED" && i <= 1) ||
                (step === "JERSEY" && i <= 1) ||
                (step === "COMPLETE" && i <= 2);

              return (
                <View key={s.step} style={{ flex: 1 }}>
                  <View style={{
                    height: 4,
                    backgroundColor: isComplete || isActive ? "#34C759" : "rgba(255,255,255,0.2)",
                    borderRadius: 2,
                    marginBottom: 6,
                  }} />
                  <Text style={{
                    color: isActive ? "#34C759" : "#9FB3C8",
                    fontSize: 11,
                    fontWeight: "900",
                  }}>
                    {s.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* STEP 1: SELECT TEAM & PLAYER */}
        {step === "SCAN" && !selectedPlayer && (
          <View>
            <Text style={{ color: "#EAF2FF", fontSize: 18, fontWeight: "900", marginBottom: 16 }}>
              Select Your Team
            </Text>
            
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
              <TouchableOpacity
                onPress={() => setSelectedTeam("HOME")}
                style={{
                  flex: 1,
                  backgroundColor: selectedTeam === "HOME" ? "#22C6D2" : "#0A2238",
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: selectedTeam === "HOME" ? "#22C6D2" : "rgba(255,255,255,0.1)",
                }}
              >
                <Text style={{
                  color: selectedTeam === "HOME" ? "#061A2B" : "#EAF2FF",
                  fontWeight: "900",
                  fontSize: 16,
                }}>
                  {homeTeam?.name}
                </Text>
                <Text style={{
                  color: selectedTeam === "HOME" ? "#061A2B" : "#9FB3C8",
                  fontSize: 12,
                  marginTop: 4,
                }}>
                  HOME
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedTeam("AWAY")}
                style={{
                  flex: 1,
                  backgroundColor: selectedTeam === "AWAY" ? "#22C6D2" : "#0A2238",
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: selectedTeam === "AWAY" ? "#22C6D2" : "rgba(255,255,255,0.1)",
                }}
              >
                <Text style={{
                  color: selectedTeam === "AWAY" ? "#061A2B" : "#EAF2FF",
                  fontWeight: "900",
                  fontSize: 16,
                }}>
                  {awayTeam?.name}
                </Text>
                <Text style={{
                  color: selectedTeam === "AWAY" ? "#061A2B" : "#9FB3C8",
                  fontSize: 12,
                  marginTop: 4,
                }}>
                  AWAY
                </Text>
              </TouchableOpacity>
            </View>

            {selectedTeam && (
              <>
                <Text style={{ color: "#EAF2FF", fontSize: 18, fontWeight: "900", marginBottom: 16 }}>
                  Find Your Name
                </Text>

                <View style={{ gap: 10 }}>
                  {teamPlayers.map((player: Player) => (
                    <TouchableOpacity
                      key={player.id}
                      onPress={() => setSelectedPlayer(player)}
                      style={{
                        backgroundColor: "#0A2238",
                        padding: 14,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                        {player.fullName}
                      </Text>
                      {player.position && (
                        <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>
                          {player.position}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* STEP 2: FACE SCAN */}
        {step === "SCAN" && selectedPlayer && !selfieUri && (
          <View>
            <View style={{
              backgroundColor: "#0A2238",
              padding: 16,
              borderRadius: 12,
              marginBottom: 24,
            }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
                Selected Player
              </Text>
              <Text style={{ color: "#9FB3C8", fontSize: 14 }}>
                {selectedPlayer.fullName}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedPlayer(null);
                  setSelfieUri(null);
                }}
                style={{ marginTop: 10 }}
              >
                <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 13 }}>
                  Change Player
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{
              backgroundColor: "#0A2238",
              padding: 40,
              borderRadius: 12,
              alignItems: "center",
              borderWidth: 2,
              borderColor: "rgba(34,198,210,0.3)",
              borderStyle: "dashed",
              marginBottom: 24,
            }}>
              <Text style={{ fontSize: 64, marginBottom: 16 }}>📸</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 18, marginBottom: 8 }}>
                Ready for Face Scan
              </Text>
              <Text style={{ color: "#9FB3C8", fontSize: 14, textAlign: "center", lineHeight: 20 }}>
                Position your face in good lighting{"\n"}
                Look directly at the camera{"\n"}
                Remove sunglasses and hats
              </Text>
            </View>

            <TouchableOpacity
              onPress={takeSelfie}
              style={{
                backgroundColor: "#34C759",
                padding: 18,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>
                📷 Start Face Scan
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: VERIFYING */}
        {step === "VERIFYING" && (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <ActivityIndicator size="large" color="#22C6D2" />
            <Text style={{ color: "#EAF2FF", fontSize: 18, fontWeight: "900", marginTop: 24 }}>
              Verifying Identity...
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: 14, marginTop: 8, textAlign: "center" }}>
              Analyzing face match and liveness{"\n"}
              This takes a few seconds
            </Text>
          </View>
        )}

        {/* STEP 4: JERSEY ASSIGNMENT */}
        {step === "JERSEY" && (
          <View>
            <View style={{
              backgroundColor: "rgba(52,199,89,0.1)",
              padding: 16,
              borderRadius: 12,
              marginBottom: 24,
              borderWidth: 2,
              borderColor: "rgba(52,199,89,0.3)",
            }}>
              <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
                ✅ Identity Verified!
              </Text>
              <Text style={{ color: "#EAF2FF", fontSize: 14 }}>
                Face Match: {checkInResult?.faceMatchScore.toFixed(1)}%{"\n"}
                Liveness: {checkInResult?.livenessScore.toFixed(1)}%
              </Text>
            </View>

            <Text style={{ color: "#EAF2FF", fontSize: 20, fontWeight: "900", marginBottom: 12 }}>
              Enter Your Jersey Number
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: 14, marginBottom: 20 }}>
              Pick up your jersey and enter the number you'll wear today
            </Text>

            <View style={{
              backgroundColor: "#0A2238",
              padding: 24,
              borderRadius: 14,
              alignItems: "center",
              marginBottom: 24,
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
                  borderColor: jerseyNumber ? "#34C759" : "rgba(255,255,255,0.2)",
                }}
              />
            </View>

            {usedJerseys.size > 0 && (
              <View style={{
                backgroundColor: "rgba(255,149,0,0.1)",
                padding: 12,
                borderRadius: 10,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: "rgba(255,149,0,0.3)",
              }}>
                <Text style={{ color: "#FF9500", fontSize: 12, fontWeight: "900" }}>
                  Already taken: {Array.from(usedJerseys).join(", ")}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={assignJersey}
              disabled={!jerseyNumber.trim()}
              style={{
                backgroundColor: jerseyNumber.trim() ? "#34C759" : "#0A2238",
                padding: 18,
                borderRadius: 14,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{
                color: jerseyNumber.trim() ? "#061A2B" : "#9FB3C8",
                fontWeight: "900",
                fontSize: 16,
              }}>
                ✓ Complete Check-In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Cancel Check-In?",
                  "This will discard your face scan and you'll need to start over.",
                  [
                    { text: "Keep Going", style: "cancel" },
                    { text: "Cancel", style: "destructive", onPress: resetCheckIn },
                  ]
                );
              }}
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

        {/* STEP 5: COMPLETE */}
        {step === "COMPLETE" && (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 80, marginBottom: 24 }}>✅</Text>
            <Text style={{ color: "#34C759", fontSize: 24, fontWeight: "900", marginBottom: 12 }}>
              All Set!
            </Text>
            <Text style={{ color: "#EAF2FF", fontSize: 16, textAlign: "center", marginBottom: 8 }}>
              {selectedPlayer?.fullName}
            </Text>
            <View style={{
              backgroundColor: "#34C759",
              width: 80,
              height: 80,
              borderRadius: 40,
              alignItems: "center",
              justifyContent: "center",
              marginVertical: 20,
            }}>
              <Text style={{ color: "#FFF", fontSize: 36, fontWeight: "900" }}>
                {jerseyNumber}
              </Text>
            </View>
            <Text style={{ color: "#9FB3C8", fontSize: 14, textAlign: "center" }}>
              You're checked in and ready to play!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}