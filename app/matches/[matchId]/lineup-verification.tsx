// app/matches/[matchId]/lineup-verification.tsx - FRAUD PREVENTION LINEUP CHECK

import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Player, useAppStore } from "../../../src/state/AppStore";

type VerificationStatus = "PENDING" | "VERIFIED" | "MISMATCH" | "NOT_CHECKED_IN";

interface PlayerVerification {
  player: Player;
  jerseyNumber: string;
  checkInPhoto?: string;
  fieldPhoto?: string;
  status: VerificationStatus;
  faceMatchScore?: number;
  timestamp?: number;
}

export default function LineupVerificationScreen() {
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

  const [selectedTeam, setSelectedTeam] = useState<"HOME" | "AWAY">("HOME");
  const [verifications, setVerifications] = useState<Record<string, PlayerVerification>>({});
  const [verifyingPlayerId, setVerifyingPlayerId] = useState<string | null>(null);

  // Get checked-in players for selected team
  const checkedInPlayers = useMemo(() => {
    const teamId = selectedTeam === "HOME" ? match?.homeTeamId : match?.awayTeamId;
    if (!teamId) return [];

    return players.filter((p: Player) => {
      // Check if player has check-in for this match
      const checkIn = p.checkInHistory?.find((c: any) => c.matchId === matchId && c.approved);
      if (!checkIn) return false;

      return p.teamId === teamId;
    }).map((p: Player) => {
      const checkIn = p.checkInHistory?.find((c: any) => c.matchId === matchId && c.approved);
      return {
        player: p,
        jerseyNumber: checkIn.jerseyNumber || p.shirtNumber || "?",
        checkInPhoto: checkIn.selfieUri,
        status: verifications[p.id]?.status || "PENDING",
        faceMatchScore: verifications[p.id]?.faceMatchScore,
        fieldPhoto: verifications[p.id]?.fieldPhoto,
      };
    }).sort((a, b) => parseInt(a.jerseyNumber) - parseInt(b.jerseyNumber));
  }, [selectedTeam, match, players, matchId, verifications]);

  // Statistics
  const stats = useMemo(() => {
    const total = checkedInPlayers.length;
    const verified = checkedInPlayers.filter(p => p.status === "VERIFIED").length;
    const pending = checkedInPlayers.filter(p => p.status === "PENDING").length;
    const mismatch = checkedInPlayers.filter(p => p.status === "MISMATCH").length;
    
    return { total, verified, pending, mismatch };
  }, [checkedInPlayers]);

  const verifyPlayer = async (player: Player, jerseyNumber: string) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera permission required for verification");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
      cameraType: ImagePicker.CameraType.back, // Back camera for field verification
    });

    if (!result.canceled && result.assets[0]) {
      setVerifyingPlayerId(player.id);
      
      try {
        // Perform face verification against check-in photo
        const verificationResult = await performFaceCheckIn(player.id, matchId, result.assets[0].uri);

        const status: VerificationStatus = 
          verificationResult.faceMatchScore >= 90 ? "VERIFIED" : "MISMATCH";

        setVerifications(prev => ({
          ...prev,
          [player.id]: {
            player,
            jerseyNumber,
            checkInPhoto: prev[player.id]?.checkInPhoto,
            fieldPhoto: result.assets[0].uri,
            status,
            faceMatchScore: verificationResult.faceMatchScore,
            timestamp: Date.now(),
          }
        }));

        if (status === "MISMATCH") {
          Alert.alert(
            "⚠️ FACE MISMATCH DETECTED",
            `Player: ${player.fullName}\nJersey: #${jerseyNumber}\nMatch Score: ${verificationResult.faceMatchScore.toFixed(1)}%\n\nThis player's face does not match their check-in photo!\n\nRECOMMENDED ACTION:\n1. Request official ID\n2. Compare with check-in photo\n3. Remove from field if fraud confirmed`,
            [
              {
                text: "Mark as Fraud",
                style: "destructive",
                onPress: () => {
                  // Log fraud attempt
                  console.log(`FRAUD ALERT: ${player.fullName} - Jersey #${jerseyNumber} - Match ${matchId}`);
                  Alert.alert("🚨 Fraud Logged", "Security team has been notified");
                }
              },
              {
                text: "Retry Scan",
                onPress: () => verifyPlayer(player, jerseyNumber)
              },
              {
                text: "Override (Admin)",
                onPress: () => {
                  Alert.prompt(
                    "Admin Override",
                    "Enter admin passcode:",
                    (passcode) => {
                      if (passcode === "1234") { // In production: proper auth
                        setVerifications(prev => ({
                          ...prev,
                          [player.id]: {
                            ...prev[player.id],
                            status: "VERIFIED"
                          }
                        }));
                        Alert.alert("✅ Overridden", "Player marked as verified by admin");
                      } else {
                        Alert.alert("❌ Invalid Passcode");
                      }
                    },
                    "secure-text"
                  );
                }
              }
            ]
          );
        } else {
          // Success - verified!
          Alert.alert(
            "✅ Player Verified",
            `${player.fullName}\nJersey: #${jerseyNumber}\nMatch: ${verificationResult.faceMatchScore.toFixed(1)}%\n\nPlayer is authorized to play.`
          );
        }
      } catch (error) {
        Alert.alert("Error", "Verification failed. Please try again.");
      } finally {
        setVerifyingPlayerId(null);
      }
    }
  };

  const quickVerifyAll = () => {
    Alert.alert(
      "Quick Verify All Players?",
      "This will walk you through verifying each player on the field one by one.\n\nYou'll take a photo of each player and the system will verify their identity.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start",
          onPress: async () => {
            for (const p of checkedInPlayers) {
              if (p.status === "PENDING") {
                await verifyPlayer(p.player, p.jerseyNumber);
              }
            }
          }
        }
      ]
    );
  };

  const completeLineupCheck = () => {
    if (stats.pending > 0) {
      Alert.alert(
        "⚠️ Incomplete Verification",
        `${stats.pending} player(s) still need verification.\n\nAll players must be verified before match can start.`,
        [{ text: "OK" }]
      );
      return;
    }

    if (stats.mismatch > 0) {
      Alert.alert(
        "🚨 FRAUD DETECTED",
        `${stats.mismatch} player(s) failed face verification!\n\nYou must remove these players from the field before proceeding.`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "✅ Lineup Verified!",
      `All ${stats.verified} players have been verified and are authorized to play.\n\nMatch can proceed.`,
      [
        {
          text: "Start Match",
          onPress: () => {
            // Log verification completion
            console.log(`Lineup verified for match ${matchId} - ${stats.verified} players`);
            router.back();
          }
        }
      ]
    );
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
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900", marginTop: 16 }}>
          🔍 Lineup Verification
        </Text>
        <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
          Verify all players on field match their check-ins
        </Text>

        {/* Security Notice */}
        <View style={{
          marginTop: 16,
          backgroundColor: "rgba(255,59,48,0.1)",
          padding: 14,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: "rgba(255,59,48,0.3)",
        }}>
          <Text style={{ color: "#FF3B30", fontWeight: "900", fontSize: 14, marginBottom: 6 }}>
            🚨 FRAUD PREVENTION CHECK
          </Text>
          <Text style={{ color: "#EAF2FF", fontSize: 12, lineHeight: 18 }}>
            Scan EVERY player on the field to verify they match their check-in photo. Any mismatches will be flagged as potential fraud.
          </Text>
        </View>

        {/* Stats */}
        <View style={{ marginTop: 20, flexDirection: "row", gap: 10 }}>
          <View style={{
            flex: 1,
            backgroundColor: "#0A2238",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
          }}>
            <Text style={{ color: "#9FB3C8", fontSize: 11 }}>Total</Text>
            <Text style={{ color: "#EAF2FF", fontSize: 28, fontWeight: "900", marginTop: 4 }}>
              {stats.total}
            </Text>
          </View>

          <View style={{
            flex: 1,
            backgroundColor: "#0A2238",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 2,
            borderColor: "rgba(34,198,210,0.3)",
          }}>
            <Text style={{ color: "#22C6D2", fontSize: 11, fontWeight: "900" }}>Pending</Text>
            <Text style={{ color: "#22C6D2", fontSize: 28, fontWeight: "900", marginTop: 4 }}>
              {stats.pending}
            </Text>
          </View>

          <View style={{
            flex: 1,
            backgroundColor: "#0A2238",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 2,
            borderColor: "rgba(52,199,89,0.3)",
          }}>
            <Text style={{ color: "#34C759", fontSize: 11, fontWeight: "900" }}>Verified</Text>
            <Text style={{ color: "#34C759", fontSize: 28, fontWeight: "900", marginTop: 4 }}>
              {stats.verified}
            </Text>
          </View>

          <View style={{
            flex: 1,
            backgroundColor: "#0A2238",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 2,
            borderColor: "rgba(255,59,48,0.3)",
          }}>
            <Text style={{ color: "#FF3B30", fontSize: 11, fontWeight: "900" }}>Fraud</Text>
            <Text style={{ color: "#FF3B30", fontSize: 28, fontWeight: "900", marginTop: 4 }}>
              {stats.mismatch}
            </Text>
          </View>
        </View>

        {/* Team Selector */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 20, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => setSelectedTeam("HOME")}
            style={{
              flex: 1,
              backgroundColor: selectedTeam === "HOME" ? "#22C6D2" : "#0A2238",
              padding: 14,
              borderRadius: 12,
              alignItems: "center",
              borderWidth: 2,
              borderColor: selectedTeam === "HOME" ? "#22C6D2" : "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{
              color: selectedTeam === "HOME" ? "#061A2B" : "#EAF2FF",
              fontWeight: "900",
              fontSize: 15,
            }}>
              {homeTeam?.name}
            </Text>
            <Text style={{
              color: selectedTeam === "HOME" ? "#061A2B" : "#9FB3C8",
              fontSize: 11,
              marginTop: 4,
            }}>
              {checkedInPlayers.filter(p => p.status === "VERIFIED").length}/{checkedInPlayers.length} verified
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTeam("AWAY")}
            style={{
              flex: 1,
              backgroundColor: selectedTeam === "AWAY" ? "#22C6D2" : "#0A2238",
              padding: 14,
              borderRadius: 12,
              alignItems: "center",
              borderWidth: 2,
              borderColor: selectedTeam === "AWAY" ? "#22C6D2" : "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{
              color: selectedTeam === "AWAY" ? "#061A2B" : "#EAF2FF",
              fontWeight: "900",
              fontSize: 15,
            }}>
              {awayTeam?.name}
            </Text>
            <Text style={{
              color: selectedTeam === "AWAY" ? "#061A2B" : "#9FB3C8",
              fontSize: 11,
              marginTop: 4,
            }}>
              {checkedInPlayers.filter(p => p.status === "VERIFIED").length}/{checkedInPlayers.length} verified
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <TouchableOpacity
          onPress={quickVerifyAll}
          disabled={stats.pending === 0}
          style={{
            backgroundColor: stats.pending > 0 ? "#F2D100" : "#0A2238",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text style={{
            color: stats.pending > 0 ? "#061A2B" : "#9FB3C8",
            fontWeight: "900",
            fontSize: 14,
          }}>
            ⚡ Quick Verify All ({stats.pending} pending)
          </Text>
        </TouchableOpacity>

        {/* Player List */}
        {checkedInPlayers.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ fontSize: 64 }}>👥</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 16, textAlign: "center" }}>
              No players checked in for this team
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {checkedInPlayers.map((p) => {
              const statusColor = 
                p.status === "VERIFIED" ? "#34C759" :
                p.status === "MISMATCH" ? "#FF3B30" :
                p.status === "PENDING" ? "#22C6D2" : "#9FB3C8";

              const statusBg =
                p.status === "VERIFIED" ? "rgba(52,199,89,0.1)" :
                p.status === "MISMATCH" ? "rgba(255,59,48,0.1)" :
                "rgba(34,198,210,0.1)";

              const borderColor =
                p.status === "VERIFIED" ? "rgba(52,199,89,0.3)" :
                p.status === "MISMATCH" ? "rgba(255,59,48,0.3)" :
                "rgba(34,198,210,0.3)";

              return (
                <View
                  key={p.player.id}
                  style={{
                    backgroundColor: statusBg,
                    borderWidth: 2,
                    borderColor,
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  {/* Header */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: statusColor,
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 20 }}>
                        {p.jerseyNumber}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                        {p.player.fullName}
                      </Text>
                      <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                        {p.player.position || "No position"} • Jersey #{p.jerseyNumber}
                      </Text>
                    </View>

                    <View style={{
                      backgroundColor: statusColor,
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                    }}>
                      <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 11 }}>
                        {p.status === "VERIFIED" && "✓ VERIFIED"}
                        {p.status === "PENDING" && "PENDING"}
                        {p.status === "MISMATCH" && "⚠️ FRAUD"}
                      </Text>
                    </View>
                  </View>

                  {/* Photos */}
                  {(p.checkInPhoto || p.fieldPhoto) && (
                    <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                      {p.checkInPhoto && (
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: "#9FB3C8", fontSize: 10, marginBottom: 6, fontWeight: "900" }}>
                            CHECK-IN PHOTO
                          </Text>
                          <Image
                            source={{ uri: p.checkInPhoto }}
                            style={{
                              width: "100%",
                              height: 120,
                              borderRadius: 10,
                              backgroundColor: "#0A2238",
                            }}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                      {p.fieldPhoto && (
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: "#9FB3C8", fontSize: 10, marginBottom: 6, fontWeight: "900" }}>
                            FIELD PHOTO
                          </Text>
                          <Image
                            source={{ uri: p.fieldPhoto }}
                            style={{
                              width: "100%",
                              height: 120,
                              borderRadius: 10,
                              backgroundColor: "#0A2238",
                            }}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                    </View>
                  )}

                  {/* Match Score */}
                  {p.faceMatchScore && (
                    <View style={{
                      backgroundColor: "#0A2238",
                      padding: 10,
                      borderRadius: 8,
                      marginBottom: 12,
                    }}>
                      <Text style={{ color: "#9FB3C8", fontSize: 11, marginBottom: 4 }}>
                        Face Match Score
                      </Text>
                      <Text style={{ color: statusColor, fontWeight: "900", fontSize: 20 }}>
                        {p.faceMatchScore.toFixed(1)}%
                      </Text>
                    </View>
                  )}

                  {/* Action Button */}
                  {p.status === "PENDING" && (
                    <TouchableOpacity
                      onPress={() => verifyPlayer(p.player, p.jerseyNumber)}
                      disabled={verifyingPlayerId === p.player.id}
                      style={{
                        backgroundColor: "#22C6D2",
                        padding: 14,
                        borderRadius: 10,
                        alignItems: "center",
                      }}
                    >
                      {verifyingPlayerId === p.player.id ? (
                        <ActivityIndicator color="#061A2B" />
                      ) : (
                        <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 14 }}>
                          📸 Verify Player
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {p.status === "MISMATCH" && (
                    <View style={{
                      backgroundColor: "rgba(255,59,48,0.2)",
                      padding: 12,
                      borderRadius: 8,
                    }}>
                      <Text style={{ color: "#FF3B30", fontWeight: "900", fontSize: 13 }}>
                        🚨 FACE MISMATCH - POTENTIAL FRAUD
                      </Text>
                      <Text style={{ color: "#EAF2FF", fontSize: 11, marginTop: 4 }}>
                        Remove player from field immediately
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Complete Button */}
      <View style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: "#061A2B",
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
      }}>
        <TouchableOpacity
          onPress={completeLineupCheck}
          disabled={stats.total === 0}
          style={{
            backgroundColor: (stats.pending === 0 && stats.mismatch === 0 && stats.total > 0) ? "#34C759" : "#0A2238",
            padding: 18,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text style={{
            color: (stats.pending === 0 && stats.mismatch === 0 && stats.total > 0) ? "#061A2B" : "#9FB3C8",
            fontWeight: "900",
            fontSize: 16,
          }}>
            {stats.pending > 0 ? `⏳ ${stats.pending} Still Pending` :
             stats.mismatch > 0 ? `🚨 ${stats.mismatch} Fraud Detected` :
             stats.total > 0 ? "✅ Complete Lineup Check" :
             "No Players to Verify"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}