// app/matches/[matchId]/quick-check-in.tsx - LIGHTNING FAST CHECK-IN

import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";
import { Player, useAppStore } from "../../../src/state/AppStore";

type CheckInState = "READY" | "SCANNING" | "CONFIRMING" | "SUCCESS";

type QuickCheckInData = {
  player: Player;
  faceMatchScore: number;
  livenessScore: number;
  suggestedJersey?: string;
  photoUri: string;
};

export default function QuickCheckInScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();

  const {
    matches,
    teams,
    players,
    performFaceCheckIn,
    getPlayersForTeam,
    recordCheckIn,
    currentUser,
  } = useAppStore() as any;

  const match = matches.find((m: any) => m.id === matchId);
  const homeTeam = teams.find((t: any) => t.id === match?.homeTeamId);
  const awayTeam = teams.find((t: any) => t.id === match?.awayTeamId);

  const [state, setState] = useState<CheckInState>("READY");
  const [currentData, setCurrentData] = useState<QuickCheckInData | null>(null);
  const [jerseyInput, setJerseyInput] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<"HOME" | "AWAY">("HOME");
  const [checkInHistory, setCheckInHistory] = useState<Array<{ playerId: string; jersey: string; timestamp: number }>>([]);

  // Get all players for both teams
  const homePlayers = match ? getPlayersForTeam(match.homeTeamId) : [];
  const awayPlayers = match ? getPlayersForTeam(match.awayTeamId) : [];
  const allPlayers = [...homePlayers, ...awayPlayers];

  // Already checked in players
  const checkedInPlayerIds = useMemo(() => {
    return new Set(players.filter((p: Player) => p.lastCheckIn).map((p: Player) => p.id));
  }, [players]);

  // Used jersey numbers (from check-ins in this session)
  const usedJerseys = useMemo(() => {
    const jerseys = new Map<string, string>(); // jersey -> playerId
    checkInHistory.forEach(({ jersey, playerId }) => {
      jerseys.set(jersey, playerId);
    });
    return jerseys;
  }, [checkInHistory]);

  // Progress stats
  const stats = useMemo(() => {
    const total = allPlayers.length;
    const checkedIn = allPlayers.filter((p: Player) => checkedInPlayerIds.has(p.id)).length;
    const remaining = total - checkedIn;
    const homeCheckedIn = homePlayers.filter((p: Player) => checkedInPlayerIds.has(p.id)).length;
    const awayCheckedIn = awayPlayers.filter((p: Player) => checkedInPlayerIds.has(p.id)).length;
    
    return {
      total,
      checkedIn,
      remaining,
      homeTotal: homePlayers.length,
      homeCheckedIn,
      awayTotal: awayPlayers.length,
      awayCheckedIn,
      percentComplete: total > 0 ? Math.round((checkedIn / total) * 100) : 0,
    };
  }, [allPlayers, homePlayers, awayPlayers, checkedInPlayerIds]);

  // Auto-start camera when component mounts
  useEffect(() => {
    if (state === "READY") {
      // Small delay to let UI render first
      const timer = setTimeout(() => {
        startCheckIn();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const startCheckIn = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera Permission Required", "Please allow camera access to check in players");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
      cameraType: ImagePicker.CameraType.front, // Selfie mode
    });

    if (result.canceled || !result.assets[0]) {
      // User cancelled - stay ready for next attempt
      setState("READY");
      return;
    }

    // Process the photo
    await processPhoto(result.assets[0].uri);
  };

  const processPhoto = async (photoUri: string) => {
    setState("SCANNING");

    try {
      // Simulate face recognition across all players
      // In production: Use AWS Rekognition SearchFacesByImage
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock: Find best match (in production, this comes from Rekognition)
      // For demo: pick random unverified player from selected team
      const teamPlayers = selectedTeam === "HOME" ? homePlayers : awayPlayers;
      const uncheckedPlayers = teamPlayers.filter((p: Player) => !checkedInPlayerIds.has(p.id));

      if (uncheckedPlayers.length === 0) {
        Alert.alert(
          "All Players Checked In!",
          `All ${selectedTeam === "HOME" ? homeTeam?.name : awayTeam?.name} players are already checked in.\n\nSwitch teams or finish check-in.`,
          [
            {
              text: "Switch Team",
              onPress: () => {
                setSelectedTeam(selectedTeam === "HOME" ? "AWAY" : "HOME");
                setState("READY");
              },
            },
            { text: "Finish", onPress: () => router.back(), style: "cancel" },
          ]
        );
        return;
      }

      const matchedPlayer = uncheckedPlayers[Math.floor(Math.random() * uncheckedPlayers.length)];
      const mockFaceScore = 96 + Math.random() * 3; // 96-99%
      const mockLivenessScore = 85 + Math.random() * 10; // 85-95%

      // Check if player already has a jersey number saved
      const suggestedJersey = matchedPlayer.shirtNumber;

      setCurrentData({
        player: matchedPlayer,
        faceMatchScore: mockFaceScore,
        livenessScore: mockLivenessScore,
        suggestedJersey,
        photoUri,
      });

      // If jersey exists, pre-fill it
      if (suggestedJersey) {
        setJerseyInput(suggestedJersey);
      } else {
        setJerseyInput("");
      }

      setState("CONFIRMING");
      Vibration.vibrate(50); // Quick haptic feedback

    } catch (error) {
      Alert.alert("Error", "Face recognition failed. Please try again.");
      setState("READY");
    }
  };

  const confirmCheckIn = () => {
    if (!currentData) return;

    const jersey = jerseyInput.trim();

    if (!jersey) {
      Alert.alert("Jersey Required", "Please enter a jersey number");
      return;
    }

    // Check for jersey conflicts
    const existingPlayerId = usedJerseys.get(jersey);
    if (existingPlayerId && existingPlayerId !== currentData.player.id) {
      const conflictPlayer = allPlayers.find((p: Player) => p.id === existingPlayerId);
      Alert.alert(
        "⚠️ Jersey Already Used",
        `#${jersey} is already assigned to ${conflictPlayer?.fullName || "another player"}.\n\nUse this number anyway?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Use Anyway",
            style: "destructive",
            onPress: () => finalizeCheckIn(jersey),
          },
        ]
      );
      return;
    }

    finalizeCheckIn(jersey);
  };

  const finalizeCheckIn = (jersey: string) => {
    if (!currentData) return;

    // Record check-in
    recordCheckIn({
      playerId: currentData.player.id,
      matchId: match.id,
      livePhotoUrl: currentData.photoUri,
      faceMatchScore: currentData.faceMatchScore,
      livenessScore: currentData.livenessScore,
      refereeId: currentUser.id,
      deviceId: 'quick_checkin',
      jerseyNumber: jersey, // Save jersey number with check-in
    });

    // Add to local history
    setCheckInHistory(prev => [
      ...prev,
      {
        playerId: currentData.player.id,
        jersey,
        timestamp: Date.now(),
      },
    ]);

    // Success state
    setState("SUCCESS");
    Vibration.vibrate([0, 100, 50, 100]); // Success vibration pattern

    // Auto-advance to next player after brief success screen
    setTimeout(() => {
      setState("READY");
      setCurrentData(null);
      setJerseyInput("");
    }, 1500);
  };

  const undoLast = () => {
    if (checkInHistory.length === 0) return;

    const lastCheckIn = checkInHistory[checkInHistory.length - 1];
    
    Alert.alert(
      "Undo Last Check-In?",
      `Remove check-in for the last player?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Undo",
          style: "destructive",
          onPress: () => {
            // Remove from history
            setCheckInHistory(prev => prev.slice(0, -1));
            
            // In production: Call API to remove check-in
            Alert.alert("✓ Undone", "Last check-in removed");
          },
        },
      ]
    );
  };

  if (!match) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.errorText}>Match not found</Text>
      </View>
    );
  }

  // SUCCESS STATE - Show for 1.5 seconds then auto-advance
  if (state === "SUCCESS" && currentData) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>✅</Text>
        <Text style={styles.successTitle}>Checked In!</Text>
        <View style={styles.successPlayerCard}>
          <View style={styles.successJerseyBadge}>
            <Text style={styles.successJerseyNumber}>{jerseyInput}</Text>
          </View>
          <Text style={styles.successPlayerName}>{currentData.player.fullName}</Text>
          <Text style={styles.successTeamName}>
            {selectedTeam === "HOME" ? homeTeam?.name : awayTeam?.name}
          </Text>
        </View>
        <Text style={styles.successStats}>
          Face: {currentData.faceMatchScore.toFixed(1)}% • Liveness: {currentData.livenessScore.toFixed(1)}%
        </Text>
        <View style={styles.successProgress}>
          <Text style={styles.successProgressText}>
            {stats.checkedIn}/{stats.total} players checked in
          </Text>
        </View>
      </View>
    );
  }

  // CONFIRMING STATE - Jersey entry/confirmation
  if (state === "CONFIRMING" && currentData) {
    const hasJerseyNumber = !!currentData.suggestedJersey;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Player Identified */}
          <View style={styles.identifiedCard}>
            <Text style={styles.identifiedEmoji}>✅</Text>
            <Text style={styles.identifiedTitle}>Player Identified</Text>
            <Text style={styles.identifiedName}>{currentData.player.fullName}</Text>
            <Text style={styles.identifiedTeam}>
              {selectedTeam === "HOME" ? homeTeam?.name : awayTeam?.name}
            </Text>
            <View style={styles.identifiedScores}>
              <Text style={styles.identifiedScore}>
                Face: {currentData.faceMatchScore.toFixed(1)}%
              </Text>
              <Text style={styles.identifiedScore}>
                Liveness: {currentData.livenessScore.toFixed(1)}%
              </Text>
            </View>
          </View>

          {/* Jersey Number Input */}
          <View style={styles.jerseyCard}>
            <Text style={styles.jerseyTitle}>
              {hasJerseyNumber ? "Confirm Jersey Number" : "Enter Jersey Number"}
            </Text>

            {/* Jersey Display/Input */}
            <View style={styles.jerseyInputContainer}>
              <Text style={styles.jerseyHash}>#</Text>
              <View style={styles.jerseyNumberBox}>
                <Text style={styles.jerseyNumberText}>
                  {jerseyInput || "__"}
                </Text>
              </View>
            </View>

            {/* Quick Number Pad */}
            <View style={styles.numberPad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => {
                    if (jerseyInput.length < 2) {
                      setJerseyInput(jerseyInput + num);
                    }
                  }}
                  style={styles.numberButton}
                >
                  <Text style={styles.numberButtonText}>{num}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setJerseyInput(jerseyInput.slice(0, -1))}
                style={[styles.numberButton, styles.clearButton]}
              >
                <Text style={styles.numberButtonText}>←</Text>
              </TouchableOpacity>
            </View>

            {/* Conflict Warning */}
            {jerseyInput && usedJerseys.has(jerseyInput) && usedJerseys.get(jerseyInput) !== currentData.player.id && (
              <View style={styles.conflictWarning}>
                <Text style={styles.conflictText}>
                  ⚠️ #{jerseyInput} already used
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.footer}>
          <View style={styles.footerActions}>
            <TouchableOpacity
              onPress={() => {
                setState("READY");
                setCurrentData(null);
                setJerseyInput("");
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={confirmCheckIn}
              disabled={!jerseyInput.trim()}
              style={[
                styles.confirmButton,
                !jerseyInput.trim() && styles.confirmButtonDisabled,
              ]}
            >
              <Text style={styles.confirmButtonText}>
                ✓ Confirm Check-In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // READY/SCANNING STATE - Main screen
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quick Check-In</Text>
          <TouchableOpacity onPress={undoLast} disabled={checkInHistory.length === 0}>
            <Text style={[
              styles.undoText,
              checkInHistory.length === 0 && styles.undoTextDisabled,
            ]}>
              ↶ Undo
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.matchTitle}>
          {homeTeam?.name} vs {awayTeam?.name}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Check-In Progress</Text>
            <Text style={styles.progressPercent}>{stats.percentComplete}%</Text>
          </View>
          <View style={styles.progressBarOuter}>
            <View style={[
              styles.progressBarInner,
              { width: `${stats.percentComplete}%` },
            ]} />
          </View>
          <Text style={styles.progressText}>
            {stats.checkedIn}/{stats.total} players • {stats.remaining} remaining
          </Text>
        </View>

        {/* Team Stats */}
        <View style={styles.teamStatsRow}>
          <View style={styles.teamStatCard}>
            <Text style={styles.teamStatLabel}>{homeTeam?.name}</Text>
            <Text style={styles.teamStatValue}>
              {stats.homeCheckedIn}/{stats.homeTotal}
            </Text>
          </View>
          <View style={styles.teamStatCard}>
            <Text style={styles.teamStatLabel}>{awayTeam?.name}</Text>
            <Text style={styles.teamStatValue}>
              {stats.awayCheckedIn}/{stats.awayTotal}
            </Text>
          </View>
        </View>

        {/* Team Selector */}
        <View style={styles.teamSelector}>
          <Text style={styles.teamSelectorLabel}>Checking In:</Text>
          <View style={styles.teamSelectorButtons}>
            <TouchableOpacity
              onPress={() => setSelectedTeam("HOME")}
              style={[
                styles.teamButton,
                selectedTeam === "HOME" && styles.teamButtonActive,
              ]}
            >
              <Text style={[
                styles.teamButtonText,
                selectedTeam === "HOME" && styles.teamButtonTextActive,
              ]}>
                {homeTeam?.name}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTeam("AWAY")}
              style={[
                styles.teamButton,
                selectedTeam === "AWAY" && styles.teamButtonActive,
              ]}
            >
              <Text style={[
                styles.teamButtonText,
                selectedTeam === "AWAY" && styles.teamButtonTextActive,
              ]}>
                {awayTeam?.name}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Camera Ready State */}
        {state === "READY" && (
          <View style={styles.cameraReadyCard}>
            <Text style={styles.cameraEmoji}>📸</Text>
            <Text style={styles.cameraTitle}>Camera Ready</Text>
            <Text style={styles.cameraSubtitle}>
              Position player's face in frame
            </Text>
            <Text style={styles.cameraInstructions}>
              • Good lighting{"\n"}
              • Face camera directly{"\n"}
              • Remove sunglasses/hats
            </Text>
          </View>
        )}

        {/* Scanning State */}
        {state === "SCANNING" && (
          <View style={styles.scanningCard}>
            <ActivityIndicator size="large" color="#22C6D2" />
            <Text style={styles.scanningTitle}>Identifying Player...</Text>
            <Text style={styles.scanningSubtitle}>
              Matching face with verified IDs
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Main Action Button */}
      {state === "READY" && (
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={startCheckIn}
            style={styles.mainActionButton}
          >
            <Text style={styles.mainActionButtonText}>
              📷 Scan Next Player
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061A2B",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    color: "#22C6D2",
    fontSize: 16,
    fontWeight: "900",
  },
  headerTitle: {
    color: "#F2D100",
    fontSize: 20,
    fontWeight: "900",
  },
  undoText: {
    color: "#22C6D2",
    fontSize: 16,
    fontWeight: "900",
  },
  undoTextDisabled: {
    color: "#9FB3C8",
    opacity: 0.5,
  },
  matchTitle: {
    color: "#EAF2FF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 20,
    textAlign: "center",
  },
  progressCard: {
    backgroundColor: "#0A2238",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    color: "#F2D100",
    fontSize: 16,
    fontWeight: "900",
  },
  progressPercent: {
    color: "#22C6D2",
    fontSize: 24,
    fontWeight: "900",
  },
  progressBarOuter: {
    height: 12,
    backgroundColor: "#0B2842",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBarInner: {
    height: "100%",
    backgroundColor: "#34C759",
    borderRadius: 6,
  },
  progressText: {
    color: "#9FB3C8",
    fontSize: 13,
    textAlign: "center",
  },
  teamStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  teamStatCard: {
    flex: 1,
    backgroundColor: "#0A2238",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  teamStatLabel: {
    color: "#9FB3C8",
    fontSize: 12,
    marginBottom: 6,
  },
  teamStatValue: {
    color: "#22C6D2",
    fontSize: 24,
    fontWeight: "900",
  },
  teamSelector: {
    marginBottom: 24,
  },
  teamSelectorLabel: {
    color: "#EAF2FF",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 10,
  },
  teamSelectorButtons: {
    flexDirection: "row",
    gap: 12,
  },
  teamButton: {
    flex: 1,
    backgroundColor: "#0A2238",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  teamButtonActive: {
    backgroundColor: "#22C6D2",
    borderColor: "#22C6D2",
  },
  teamButtonText: {
    color: "#EAF2FF",
    fontSize: 14,
    fontWeight: "900",
  },
  teamButtonTextActive: {
    color: "#061A2B",
  },
  cameraReadyCard: {
    backgroundColor: "#0A2238",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(34,198,210,0.3)",
    borderStyle: "dashed",
  },
  cameraEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  cameraTitle: {
    color: "#22C6D2",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },
  cameraSubtitle: {
    color: "#EAF2FF",
    fontSize: 15,
    marginBottom: 16,
  },
  cameraInstructions: {
    color: "#9FB3C8",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  scanningCard: {
    backgroundColor: "#0A2238",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
  },
  scanningTitle: {
    color: "#22C6D2",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 20,
    marginBottom: 8,
  },
  scanningSubtitle: {
    color: "#9FB3C8",
    fontSize: 14,
    textAlign: "center",
  },
  identifiedCard: {
    backgroundColor: "rgba(52,199,89,0.1)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(52,199,89,0.3)",
  },
  identifiedEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  identifiedTitle: {
    color: "#34C759",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12,
  },
  identifiedName: {
    color: "#EAF2FF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 6,
  },
  identifiedTeam: {
    color: "#9FB3C8",
    fontSize: 15,
    marginBottom: 16,
  },
  identifiedScores: {
    flexDirection: "row",
    gap: 20,
  },
  identifiedScore: {
    color: "#34C759",
    fontSize: 13,
    fontWeight: "900",
  },
  jerseyCard: {
    backgroundColor: "#0A2238",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  jerseyTitle: {
    color: "#F2D100",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 20,
  },
  jerseyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  jerseyHash: {
    color: "#9FB3C8",
    fontSize: 48,
    fontWeight: "900",
    marginRight: 12,
  },
  jerseyNumberBox: {
    width: 120,
    height: 120,
    backgroundColor: "#0B2842",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#22C6D2",
  },
  jerseyNumberText: {
    color: "#22C6D2",
    fontSize: 64,
    fontWeight: "900",
  },
  numberPad: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    maxWidth: 280,
  },
  numberButton: {
    width: 80,
    height: 60,
    backgroundColor: "#0B2842",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  clearButton: {
    backgroundColor: "#D33B3B",
    borderColor: "#D33B3B",
  },
  numberButtonText: {
    color: "#EAF2FF",
    fontSize: 24,
    fontWeight: "900",
  },
  conflictWarning: {
    marginTop: 16,
    backgroundColor: "rgba(255,149,0,0.2)",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,149,0,0.3)",
  },
  conflictText: {
    color: "#FF9500",
    fontSize: 13,
    fontWeight: "900",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#061A2B",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  mainActionButton: {
    backgroundColor: "#34C759",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  mainActionButtonText: {
    color: "#061A2B",
    fontSize: 18,
    fontWeight: "900",
  },
  footerActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#0A2238",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cancelButtonText: {
    color: "#EAF2FF",
    fontSize: 16,
    fontWeight: "900",
  },
  confirmButton: {
    flex: 2,
    backgroundColor: "#34C759",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#0A2238",
    opacity: 0.5,
  },
  confirmButtonText: {
    color: "#061A2B",
    fontSize: 16,
    fontWeight: "900",
  },
  successContainer: {
    flex: 1,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  successEmoji: {
    fontSize: 100,
    marginBottom: 20,
  },
  successTitle: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 30,
  },
  successPlayerCard: {
    alignItems: "center",
    marginBottom: 20,
  },
  successJerseyBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successJerseyNumber: {
    color: "#34C759",
    fontSize: 48,
    fontWeight: "900",
  },
  successPlayerName: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 6,
  },
  successTeamName: {
    color: "#FFF",
    fontSize: 16,
    opacity: 0.9,
  },
  successStats: {
    color: "#FFF",
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 30,
  },
  successProgress: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  successProgressText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "900",
  },
  errorText: {
    color: "#9FB3C8",
    fontSize: 16,
    marginTop: 20,
  },
});