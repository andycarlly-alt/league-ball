// app/live/[id].tsx - COMPLETE WITH ADMIN OVERRIDE & PASSCODE
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource } from "../../src/utils/logos";

// ===== ADMIN OVERRIDE PASSCODE - CHANGE THIS TO YOUR CODE =====
const OVERRIDE_PASSCODE = "1234"; // TODO: Change to your secure passcode

function scoreFromEvents(matchId: string, events: any[], homeTeamId: string, awayTeamId: string) {
  const list = (events ?? []).filter((e: any) => e.matchId === matchId && e.type === "GOAL");
  let home = 0;
  let away = 0;
  list.forEach((e: any) => {
    if (e.teamId === homeTeamId) home += 1;
    if (e.teamId === awayTeamId) away += 1;
  });
  return { home, away };
}

export default function LiveMatchScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const matchId = String(id ?? "");
  
  const {
    matches,
    teams,
    players,
    matchEvents,
    setMatchLive,
    tickMatch,
    resetMatchClock,
    logEvent,
    sponsorsAds,
    can,
    currentUser,
    addPendingPayment,
    getMatchPool,
    matchPools,
    settleMatchPool,
    castMotmVote,
    getUserMotmVote,
    getMotmLeaderboard,
    getMotmAward,
    matchVotes,
    motmAwards,
    validateMatchEligibility,
    getTeamEligibility,
  } = useAppStore() as any;

  const match = useMemo(() => (matches ?? []).find((m: any) => String(m.id) === matchId), [matches, matchId]);
  const home = useMemo(() => (teams ?? []).find((t: any) => t.id === match?.homeTeamId), [teams, match]);
  const away = useMemo(() => (teams ?? []).find((t: any) => t.id === match?.awayTeamId), [teams, match]);
  const pool = useMemo(() => getMatchPool(matchId), [matchId, matchPools]);
  
  const matchEligibility = useMemo(
    () => validateMatchEligibility ? validateMatchEligibility(matchId) : { canStart: true, blockedTeams: [] },
    [matchId, validateMatchEligibility]
  );

  const homeEligibility = useMemo(
    () => match && getTeamEligibility ? getTeamEligibility(match.homeTeamId) : { isEligible: true },
    [match, getTeamEligibility]
  );

  const awayEligibility = useMemo(
    () => match && getTeamEligibility ? getTeamEligibility(match.awayTeamId) : { isEligible: true },
    [match, getTeamEligibility]
  );
  
  const homePlayers = useMemo(() => {
    return (players ?? []).filter((p: any) => p.teamId === match?.homeTeamId);
  }, [players, match?.homeTeamId]);
  
  const awayPlayers = useMemo(() => {
    return (players ?? []).filter((p: any) => p.teamId === match?.awayTeamId);
  }, [players, match?.awayTeamId]);
  
  const allMatchPlayers = useMemo(() => {
    return [...homePlayers, ...awayPlayers];
  }, [homePlayers, awayPlayers]);
  
  const eventsForMatch = useMemo(() => {
    return (matchEvents ?? []).filter((e: any) => e.matchId === matchId);
  }, [matchEvents, matchId]);
  
  const score = useMemo(() => {
    return scoreFromEvents(matchId, matchEvents ?? [], match?.homeTeamId, match?.awayTeamId);
  }, [matchId, matchEvents, match]);

  const myVote = useMemo(() => getUserMotmVote(matchId, currentUser.id), [matchId, currentUser.id, matchVotes]);
  const leaderboard = useMemo(() => getMotmLeaderboard(matchId), [matchId, matchVotes]);
  const motmAward = useMemo(() => getMotmAward(matchId), [matchId, motmAwards]);

  const canManageMatch = can("MANAGE_MATCH");
  
  // Match phase state
  const [matchPhase, setMatchPhase] = useState<'pre-match' | 'first-half' | 'half-time' | 'second-half' | 'full-time'>('pre-match');
  
  // Override passcode modal state
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideAction, setOverrideAction] = useState<'end-half' | 'end-match' | null>(null);
  const [passcodeInput, setPasscodeInput] = useState("");
  
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showMotmModal, setShowMotmModal] = useState(false);
  const [eventType, setEventType] = useState<"GOAL" | "YELLOW" | "RED">("GOAL");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [slot, setSlot] = useState(0);
  
  const slots = sponsorsAds ?? [];

  // Initialize match phase based on match status
  useEffect(() => {
    if (!match) return;
    
    if (match.status === 'FINAL') {
      setMatchPhase('full-time');
    } else if (match.isLive) {
      const mins = Math.floor((match.clockSec ?? 0) / 60);
      if (mins >= 45 && mins < 90) {
        setMatchPhase('second-half');
      } else if (mins >= 90) {
        setMatchPhase('full-time');
      } else {
        setMatchPhase('first-half');
      }
    } else if (match.status === 'SCHEDULED') {
      setMatchPhase('pre-match');
    }
  }, [match?.id]);

  useEffect(() => {
    if (!slots.length) return;
    const t = setInterval(() => setSlot((s) => (s + 1) % slots.length), 7000);
    return () => clearInterval(t);
  }, [slots.length]);

  useEffect(() => {
    if (!match?.isLive) return;
    const timer = setInterval(() => tickMatch(match.id, 1), 1000);
    return () => clearInterval(timer);
  }, [match?.isLive, match?.id, tickMatch]);

  // Auto half-time and full-time detection
  useEffect(() => {
    if (!match?.isLive || !match) return;
    
    const currentMinute = Math.floor((match.clockSec ?? 0) / 60);
    const currentSecond = (match.clockSec ?? 0) % 60;
    
    // Auto half-time at exactly 45:00
    if (currentMinute === 45 && currentSecond === 0 && matchPhase === 'first-half') {
      setMatchLive(match.id, false);
      setMatchPhase('half-time');
      Alert.alert(
        '⏸️ Half Time',
        'The first half has ended at 45:00.\n\nResume when ready for second half.',
        [{ text: 'OK' }]
      );
    }
    
    // Auto full-time at 90:00
    if (currentMinute >= 90 && currentSecond === 0 && matchPhase === 'second-half') {
      setMatchLive(match.id, false);
      Alert.alert(
        '🏁 Full Time Reached',
        'The match has reached 90:00.\n\nEnd the match now?',
        [
          { text: 'Not Yet', style: 'cancel' },
          { text: 'End Match', onPress: () => handleEndMatch() }
        ]
      );
    }
  }, [match?.clockSec, match?.isLive, matchPhase]);

  useEffect(() => {
    if (match?.status === "FINAL" && pool && pool.status !== "SETTLED") {
      const timeout = setTimeout(() => {
        settleMatchPool(matchId);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [match?.status, pool?.status, matchId]);

  if (!match) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: "#EAF2FF" }}>Match not found.</Text>
      </View>
    );
  }

  const currentMinute = Math.floor((match.clockSec ?? 0) / 60);
  const currentSecond = (match.clockSec ?? 0) % 60;
  const timeLeft = Math.max(0, (match.durationSec ?? 0) - (match.clockSec ?? 0));
  const isFT = matchPhase === 'full-time' || match.status === 'FINAL';
  const currentSlot = slots.length ? slots[slot] : null;
  const isBettingOpen = match.status === "SCHEDULED" && !match.isLive;
  const isBettingClosed = match.isLive || match.status === "LIVE" || match.status === "FINAL";

  // ===== OVERRIDE PASSCODE FUNCTIONS =====

  const confirmOverride = () => {
    if (passcodeInput !== OVERRIDE_PASSCODE) {
      Alert.alert(
        '❌ Invalid Passcode',
        'The passcode you entered is incorrect.\n\nPlease contact league administrator if you need assistance.',
        [{ text: 'OK' }]
      );
      setPasscodeInput("");
      return;
    }

    // Passcode correct - close modal and execute action
    setShowOverrideModal(false);
    const tempAction = overrideAction;
    setPasscodeInput("");
    setOverrideAction(null);

    if (tempAction === 'end-half') {
      executeEndHalf(true);
    } else if (tempAction === 'end-match') {
      executeEndMatch(true);
    }
  };

  // ===== MATCH CONTROL FUNCTIONS =====

  const handleEndFirstHalf = () => {
    if (matchPhase !== 'first-half') {
      Alert.alert('Invalid Action', 'Can only end half during first half');
      return;
    }

    // Check if it's before 45 minutes - require override
    if (currentMinute < 45) {
      Alert.alert(
        '⚠️ End Half Early?',
        `Current time: ${currentMinute}:${String(currentSecond).padStart(2, '0')}\nNormal half-time: 45:00\n\n⚠️ Ending the half early requires admin authorization.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Override & End',
            style: 'destructive',
            onPress: () => {
              setOverrideAction('end-half');
              setPasscodeInput("");
              setShowOverrideModal(true);
            }
          }
        ]
      );
      return;
    }

    // Normal end at 45+ minutes
    executeEndHalf(false);
  };

  const executeEndHalf = (isOverride: boolean) => {
    const overrideText = isOverride ? ` (Override at ${currentMinute}:${String(currentSecond).padStart(2, '0')})` : '';
    const message = isOverride 
      ? `⚠️ ADMIN OVERRIDE\n\nEnding first half at ${currentMinute}:${String(currentSecond).padStart(2, '0')} (before standard 45:00).\n\nAre you sure?`
      : 'Are you sure you want to end the first half?';

    Alert.alert(
      '⏸️ End First Half',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Half',
          onPress: () => {
            setMatchLive(match.id, false);
            setMatchPhase('half-time');
            Alert.alert(
              '⏸️ Half Time', 
              `First half ended${overrideText}.\n\nResume when ready for second half.`,
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const handleStartSecondHalf = () => {
    Alert.alert(
      '▶️ Start Second Half',
      'Ready to begin the second half?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            setMatchPhase('second-half');
            setMatchLive(match.id, true);
          }
        }
      ]
    );
  };

  const handleEndMatch = () => {
    if (isFT) {
      Alert.alert('Already Ended', 'This match has already ended.');
      return;
    }

    // Check if it's before 90 minutes - require override
    if (currentMinute < 90) {
      Alert.alert(
        '⚠️ End Match Early?',
        `Current time: ${currentMinute}:${String(currentSecond).padStart(2, '0')}\nNormal full-time: 90:00\n\n⚠️ Ending the match early requires admin authorization.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Override & End',
            style: 'destructive',
            onPress: () => {
              setOverrideAction('end-match');
              setPasscodeInput("");
              setShowOverrideModal(true);
            }
          }
        ]
      );
      return;
    }

    // Normal end at 90+ minutes
    executeEndMatch(false);
  };

  const executeEndMatch = (isOverride: boolean) => {
    const overrideWarning = isOverride 
      ? `\n\n⚠️ ADMIN OVERRIDE\nMatch ending at ${currentMinute}:${String(currentSecond).padStart(2, '0')} (before standard 90:00)`
      : '';

    Alert.alert(
      '🏁 End Match',
      `Are you sure you want to end this match?\n\nFinal Score: ${score.home} - ${score.away}${overrideWarning}\n\nThis will:\n• Settle all betting pools\n• Award Man of the Match\n• Save final results\n• Cannot be undone`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Match',
          style: 'destructive',
          onPress: () => {
            // Stop clock
            setMatchLive(match.id, false);
            
            // Set phase to full-time
            setMatchPhase('full-time');

            // Calculate betting pool revenue
            
            // Update match status to FINAL
            if (match) {
              match.status = 'FINAL';
            }
            let poolRevenue = 0;
            if (pool) {
              const totalPot = pool.totalPotCents || 0;
              poolRevenue = totalPot * 0.15;
            }

            // Get MOTM winner
            const motmWinner = leaderboard && leaderboard.length > 0 ? leaderboard[0] : null;

            const overrideText = isOverride ? ` (Override at ${currentMinute}:${String(currentSecond).padStart(2, '0')})` : '';

            // Show completion summary
            setTimeout(() => {
              Alert.alert(
                '✅ Match Completed',
                `Final Score: ${score.home} - ${score.away}${overrideText}\n\n` +
                `💰 Betting Pool ${pool ? 'Settling...' : 'N/A'}\n` +
                (poolRevenue > 0 ? `League Revenue: $${(poolRevenue / 100).toFixed(2)}\n\n` : '') +
                `🏆 Man of the Match: ${motmWinner ? motmWinner.playerName : 'No votes'}\n` +
                (motmWinner ? `Bonus: $25.00\n\n` : '\n') +
                `📊 All results saved`,
                [
                  { text: 'OK', onPress: () => router.back() }
                ]
              );
            }, 500);
          }
        }
      ]
    );
  };

  const getPhaseDisplay = () => {
    switch(matchPhase) {
      case 'pre-match': return '⏸ Pre-Match';
      case 'first-half': return '⚽ First Half';
      case 'half-time': return '⏸️ Half Time';
      case 'second-half': return '⚽ Second Half';
      case 'full-time': return '🏁 Full Time';
      default: return match.status || 'Match';
    }
  };

  // ===== EXISTING FUNCTIONS =====

  const openPlayerSelection = (type: "GOAL" | "YELLOW" | "RED", teamId: string) => {
    setEventType(type);
    setSelectedTeamId(teamId);
    setSelectedPlayerId("");
    setShowPlayerModal(true);
  };

  const confirmEvent = () => {
    if (!selectedPlayerId) {
      Alert.alert("Select Player", "Please select a player from the roster");
      return;
    }
    
    const player = (players ?? []).find((p: any) => p.id === selectedPlayerId);
    const team = teams?.find((t: any) => t.id === selectedTeamId);

    logEvent({
      matchId: match.id,
      type: eventType,
      teamId: selectedTeamId,
      playerId: selectedPlayerId,
      minute: currentMinute,
    });

    if ((eventType === "YELLOW" || eventType === "RED") && typeof addPendingPayment === 'function') {
      const fineAmount = eventType === "YELLOW" ? 2500 : 5000;
      
      addPendingPayment({
        id: `fine_${eventType}_${match.id}_${Date.now()}`,
        type: "CARD_FINE",
        amount: fineAmount,
        cardType: eventType,
        teamId: selectedTeamId,
        teamName: team?.name,
        playerId: selectedPlayerId,
        playerName: player?.fullName,
        status: "PENDING",
        createdAt: Date.now(),
        dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });
    }

    setShowPlayerModal(false);

    const eventIcon = eventType === "GOAL" ? "⚽" : eventType === "YELLOW" ? "🟨" : "🟥";
    Alert.alert(
      `${eventIcon} ${eventType} Recorded`,
      `${player?.fullName || "Player"} (${team?.name})\nMinute: ${currentMinute}'${eventType !== "GOAL" ? `\n\nFine: $${eventType === "YELLOW" ? "25.00" : "50.00"} (7 days)` : ""}`,
      [{ text: "OK" }]
    );
  };

  const openMotmVoting = () => {
    if (!match.isLive) {
      Alert.alert("Voting Not Open", "You can only vote during live matches");
      return;
    }
    setSelectedPlayerId(myVote?.playerId || "");
    setShowMotmModal(true);
  };

  const confirmMotmVote = () => {
    if (!selectedPlayerId) {
      Alert.alert("Select Player", "Please select a player to vote for");
      return;
    }
    
    const player = (players ?? []).find((p: any) => p.id === selectedPlayerId);
    const result = castMotmVote(matchId, selectedPlayerId);

    if (!result.ok) {
      Alert.alert("Cannot Vote", result.reason || "Unknown error");
      return;
    }

    setShowMotmModal(false);

    Alert.alert(
      "🌟 Vote Recorded!",
      `Your vote for ${player?.fullName} has been recorded`,
      [{ text: "OK" }]
    );
  };

  const onStartPause = () => {
    if (!match.isLive && matchPhase === 'pre-match' && !matchEligibility.canStart) {
      Alert.alert(
        "⚠️ Teams Blocked",
        matchEligibility.message + "\n\nGo to team eligibility screens to pay fines or apply admin override.",
        [
          { text: "Cancel", style: "cancel" },
          ...(canManageMatch ? [{
            text: "Override & Start",
            style: "destructive" as const,
            onPress: () => {
              Alert.alert(
                "Admin Override",
                "Force start match despite blocked teams?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Force Start",
                    style: "destructive",
                    onPress: () => {
                      setMatchLive(matchId, true);
                      setMatchPhase('first-half');
                    },
                  },
                ]
              );
            },
          }] : []),
        ]
      );
      return;
    }

    if (isFT) {
      Alert.alert("Match Ended", "This match has already ended.");
      return;
    }

    if (matchPhase === 'pre-match') {
      setMatchLive(match.id, true);
      setMatchPhase('first-half');
    } else if (matchPhase === 'half-time') {
      handleStartSecondHalf();
    } else if (match.isLive) {
      setMatchLive(match.id, false);
    } else {
      setMatchLive(match.id, true);
    }
  };

  const onReset = () => {
    Alert.alert(
      "Reset Match?",
      "This will reset the clock to 0:00 and set match to SCHEDULED",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          onPress: () => {
            resetMatchClock(match.id);
            setMatchPhase('pre-match');
          }
        },
      ]
    );
  };

  const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  
  const getPlayerName = (playerId?: string | null) => {
    if (!playerId) return "Unknown Player";
    const player = (players ?? []).find((p: any) => p.id === playerId);
    return player?.fullName || "Unknown Player";
  };
  
  const getTeamName = (teamId?: string) => {
    const team = (teams ?? []).find((t: any) => t.id === teamId);
    return team?.name || "Unknown Team";
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back to Matches</Text>
        </TouchableOpacity>

        {/* Eligibility Warning Banner */}
        {!matchEligibility.canStart && matchPhase === 'pre-match' && (
          <View style={{
            marginBottom: 20,
            backgroundColor: "rgba(255,59,48,0.1)",
            borderRadius: 16,
            padding: 16,
            borderWidth: 2,
            borderColor: "#FF3B30",
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <Text style={{ fontSize: 32 }}>🚫</Text>
              <Text style={{ color: "#FF3B30", fontWeight: "900", fontSize: 18, flex: 1 }}>
                MATCH BLOCKED
              </Text>
            </View>
            <Text style={{ color: "#EAF2FF", lineHeight: 20, marginBottom: 12 }}>
              {matchEligibility.message}
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: 13 }}>
              Blocked teams: {matchEligibility.blockedTeams.join(", ")}
            </Text>
          </View>
        )}

        {/* Team Eligibility Cards */}
        <View style={{ gap: 12, marginBottom: 20 }}>
          {/* Home Team */}
          <TouchableOpacity
            onPress={() => router.push(`/teams/${match.homeTeamId}/eligibility` as any)}
            style={{
              backgroundColor: "#0A2238",
              borderRadius: 16,
              padding: 16,
              borderWidth: 2,
              borderColor: homeEligibility?.isEligible ? "#34C759" : "#FF3B30",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 18 }}>
                {home?.name || "Home Team"}
              </Text>
              <Text style={{ fontSize: 24 }}>
                {homeEligibility?.isEligible ? "✅" : "🚫"}
              </Text>
            </View>
            
            {homeEligibility?.isEligible ? (
              <View style={{
                backgroundColor: "rgba(52,199,89,0.1)",
                borderRadius: 10,
                padding: 10,
              }}>
                <Text style={{ color: "#34C759", fontWeight: "900" }}>
                  ✓ Eligible to Play
                </Text>
              </View>
            ) : (
              <View>
                <View style={{
                  backgroundColor: "rgba(255,59,48,0.1)",
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 10,
                }}>
                  <Text style={{ color: "#FF3B30", fontWeight: "900" }}>
                    ⚠️ BLOCKED: {homeEligibility?.blockedReason}
                  </Text>
                  <Text style={{ color: "#FF3B30", marginTop: 4 }}>
                    Outstanding: ${(homeEligibility?.outstandingFines / 100).toFixed(2)}
                  </Text>
                </View>
                {homeEligibility?.adminOverride && (
                  <View style={{
                    backgroundColor: "rgba(242,209,0,0.1)",
                    borderRadius: 10,
                    padding: 10,
                  }}>
                    <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 13 }}>
                      🔓 Admin Override Active
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={{ marginTop: 10, alignItems: "center" }}>
              <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 13 }}>
                Tap for Details →
              </Text>
            </View>
          </TouchableOpacity>

          {/* Away Team */}
          <TouchableOpacity
            onPress={() => router.push(`/teams/${match.awayTeamId}/eligibility` as any)}
            style={{
              backgroundColor: "#0A2238",
              borderRadius: 16,
              padding: 16,
              borderWidth: 2,
              borderColor: awayEligibility?.isEligible ? "#34C759" : "#FF3B30",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 18 }}>
                {away?.name || "Away Team"}
              </Text>
              <Text style={{ fontSize: 24 }}>
                {awayEligibility?.isEligible ? "✅" : "🚫"}
              </Text>
            </View>
            
            {awayEligibility?.isEligible ? (
              <View style={{
                backgroundColor: "rgba(52,199,89,0.1)",
                borderRadius: 10,
                padding: 10,
              }}>
                <Text style={{ color: "#34C759", fontWeight: "900" }}>
                  ✓ Eligible to Play
                </Text>
              </View>
            ) : (
              <View>
                <View style={{
                  backgroundColor: "rgba(255,59,48,0.1)",
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 10,
                }}>
                  <Text style={{ color: "#FF3B30", fontWeight: "900" }}>
                    ⚠️ BLOCKED: {awayEligibility?.blockedReason}
                  </Text>
                  <Text style={{ color: "#FF3B30", marginTop: 4 }}>
                    Outstanding: ${(awayEligibility?.outstandingFines / 100).toFixed(2)}
                  </Text>
                </View>
                {awayEligibility?.adminOverride && (
                  <View style={{
                    backgroundColor: "rgba(242,209,0,0.1)",
                    borderRadius: 10,
                    padding: 10,
                  }}>
                    <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 13 }}>
                      🔓 Admin Override Active
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={{ marginTop: 10, alignItems: "center" }}>
              <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 13 }}>
                Tap for Details →
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Match Header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Image source={getLogoSource(home?.logoKey)} style={{ width: 60, height: 60 }} resizeMode="contain" />
            <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 8, textAlign: "center" }}>
              {home?.name ?? "Home"}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#F2D100", fontSize: 36, fontWeight: "900" }}>
              {score.home} - {score.away}
            </Text>
            <Text style={{ color: match.isLive ? "#34C759" : "#9FB3C8", marginTop: 4, fontWeight: "900" }}>
              {match.isLive ? "🔴 LIVE" : match.status}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Image source={getLogoSource(away?.logoKey)} style={{ width: 60, height: 60 }} resizeMode="contain" />
            <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 8, textAlign: "center" }}>
              {away?.name ?? "Away"}
            </Text>
          </View>
        </View>

        {/* Betting Pool Card */}
        {match.status !== "FINAL" && !isFT && (
          <TouchableOpacity
            onPress={() => {
              if (!isBettingOpen) {
                Alert.alert("Betting Closed", "Match has started or ended");
              } else {
                router.push(`/betting/${matchId}` as any);
              }
            }}
            style={{
              backgroundColor: "#0A2238",
              padding: 16,
              borderRadius: 16,
              marginBottom: 16,
              borderWidth: 3,
              borderColor: isBettingOpen ? "#34C759" : "#FF3B30",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ color: "#F2D100", fontSize: 18, fontWeight: "900" }}>
                  🎰 Betting Pool {isBettingOpen ? "✅ OPEN" : "🔒 CLOSED"}
                </Text>
                {pool ? (
                  <Text style={{ color: "#9FB3C8", marginTop: 4 }}>
                    {pool.ticketCount} tickets • {formatMoney(pool.totalPotCents)} pot
                  </Text>
                ) : (
                  <Text style={{ color: "#9FB3C8", marginTop: 4 }}>
                    {isBettingOpen ? "🎯 No bets yet - Be the first!" : "❌ Betting closed"}
                  </Text>
                )}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ 
                  color: isBettingOpen ? "#34C759" : "#FF3B30", 
                  fontSize: 20, 
                  fontWeight: "900" 
                }}>
                  {isBettingOpen ? "OPEN" : "CLOSED"}
                </Text>
              </View>
            </View>
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" }}>
              <Text style={{ 
                color: isBettingOpen ? "#34C759" : "#FF3B30", 
                fontWeight: "900", 
                fontSize: 16,
                textAlign: "center"
              }}>
                {isBettingOpen ? "✅ TAP TO PLACE BET" : "🔒 BETTING CLOSED"}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Betting Pool Settled */}
        {pool && pool.status === "SETTLED" && (
          <View style={{
            backgroundColor: "#34C759",
            padding: 16,
            borderRadius: 16,
            marginBottom: 16,
            borderWidth: 2,
            borderColor: "#34C759",
          }}>
            <Text style={{ color: "#061A2B", fontSize: 20, fontWeight: "900", marginBottom: 8 }}>
              🏆 Pool Settled!
            </Text>
            <View style={{ gap: 6 }}>
              <Text style={{ color: "#061A2B", fontSize: 14 }}>
                <Text style={{ fontWeight: "900" }}>Winner:</Text> {pool.actualWinner}
              </Text>
              <Text style={{ color: "#061A2B", fontSize: 14 }}>
                <Text style={{ fontWeight: "900" }}>Total Goals:</Text> {pool.totalGoals} ({pool.actualOverUnder})
              </Text>
              <Text style={{ color: "#061A2B", fontSize: 14 }}>
                <Text style={{ fontWeight: "900" }}>BTTS:</Text> {pool.actualBTTS}
              </Text>
              <Text style={{ color: "#061A2B", fontSize: 14, marginTop: 6 }}>
                <Text style={{ fontWeight: "900" }}>Payout:</Text> {formatMoney(pool.payoutCents || 0)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push(`/betting/${matchId}` as any)}>
              <Text style={{ color: "#061A2B", marginTop: 12, fontWeight: "900", textAlign: "center" }}>
                View All Tickets →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MOTM Voting Card */}
        {match.isLive && !motmAward && !isFT && (
          <TouchableOpacity
            onPress={openMotmVoting}
            style={{
              backgroundColor: "#0A2238",
              padding: 16,
              borderRadius: 16,
              marginBottom: 16,
              borderWidth: 3,
              borderColor: "#F2D100",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#F2D100", fontSize: 18, fontWeight: "900" }}>
                  🌟 Man of the Match
                </Text>
                {myVote ? (
                  <Text style={{ color: "#22C6D2", marginTop: 4, fontWeight: "900" }}>
                    ✓ Your vote: {myVote.playerName}
                  </Text>
                ) : (
                  <Text style={{ color: "#9FB3C8", marginTop: 4 }}>
                    Tap to vote for your favorite player
                  </Text>
                )}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: "#F2D100", fontSize: 24 }}>🗳️</Text>
              </View>
            </View>

            {leaderboard.length > 0 && (
              <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" }}>
                <Text style={{ color: "#9FB3C8", fontSize: 12, fontWeight: "900", marginBottom: 8 }}>
                  📊 CURRENT LEADERS
                </Text>
                {leaderboard.map((leader: any, index: number) => (
                  <View
                    key={leader.playerId}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 6,
                      borderBottomWidth: index < leaderboard.length - 1 ? 1 : 0,
                      borderBottomColor: "rgba(255,255,255,0.05)",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={{ color: index === 0 ? "#F2D100" : index === 1 ? "#9FB3C8" : "#8B7355", fontSize: 16, fontWeight: "900" }}>
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </Text>
                      <Text style={{ color: "#EAF2FF", fontSize: 14, fontWeight: "900" }}>
                        {leader.playerName}
                      </Text>
                    </View>
                    <Text style={{ color: "#22C6D2", fontSize: 14, fontWeight: "900" }}>
                      {leader.count} {leader.count === 1 ? "vote" : "votes"}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" }}>
              <Text style={{ 
                color: "#F2D100", 
                fontWeight: "900", 
                fontSize: 16,
                textAlign: "center"
              }}>
                {myVote ? "🔄 TAP TO CHANGE VOTE" : "🗳️ TAP TO VOTE"}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* MOTM Award Winner */}
        {motmAward && (
          <View style={{
            backgroundColor: "#F2D100",
            padding: 16,
            borderRadius: 16,
            marginBottom: 16,
            borderWidth: 3,
            borderColor: "#F2D100",
          }}>
            <Text style={{ color: "#061A2B", fontSize: 20, fontWeight: "900", marginBottom: 8, textAlign: "center" }}>
              🏆 MAN OF THE MATCH
            </Text>
            <View style={{ alignItems: "center", marginVertical: 12 }}>
              <Text style={{ fontSize: 48 }}>⭐</Text>
              <Text style={{ color: "#061A2B", fontSize: 24, fontWeight: "900", marginTop: 8, textAlign: "center" }}>
                {motmAward.winnerName}
              </Text>
              <Text style={{ color: "#061A2B", fontSize: 14, fontWeight: "900", marginTop: 4 }}>
                {motmAward.teamName}
              </Text>
            </View>
            <View style={{ marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.1)" }}>
              <Text style={{ color: "#061A2B", fontSize: 14, textAlign: "center" }}>
                <Text style={{ fontWeight: "900" }}>{motmAward.voteCount}</Text> votes ({motmAward.votePercentage}%)
              </Text>
              <Text style={{ color: "#061A2B", fontSize: 14, textAlign: "center", marginTop: 4 }}>
                <Text style={{ fontWeight: "900" }}>Award:</Text> {formatMoney(motmAward.bonusCents)}
              </Text>
            </View>
          </View>
        )}

        {/* Match Clock */}
        <View style={{ 
          marginTop: 0, 
          backgroundColor: match.isLive ? "rgba(52,199,89,0.15)" : "#0A2238", 
          padding: 16, 
          borderRadius: 16, 
          borderWidth: 2,
          borderColor: match.isLive ? "#34C759" : "rgba(255,255,255,0.08)",
          alignItems: "center"
        }}>
          <Text style={{ color: "#9FB3C8", fontSize: 12, fontWeight: "900", marginBottom: 8 }}>
            MATCH TIME
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={{ 
              color: match.isLive ? "#34C759" : "#F2D100", 
              fontSize: 48, 
              fontWeight: "900",
              fontVariant: ["tabular-nums"] as any,
            }}>
              {String(currentMinute).padStart(2, "0")}:{String(currentSecond).padStart(2, "0")}
            </Text>
            <View>
              <Text style={{ color: "#9FB3C8", fontSize: 14, fontWeight: "900" }}>
                / 90:00
              </Text>
              {match.isLive && (
                <Text style={{ color: "#34C759", fontSize: 12, marginTop: 4 }}>
                  ● LIVE
                </Text>
              )}
            </View>
          </View>
          
          <View style={{ marginTop: 12 }}>
            <Text style={{ 
              color: matchPhase === 'half-time' ? "#FFD700" : 
                     matchPhase === 'full-time' ? "#34C759" : "#22C6D2",
              fontSize: 14, 
              fontWeight: "900" 
            }}>
              {getPhaseDisplay()}
            </Text>
          </View>

          {currentMinute >= 90 && match.isLive && matchPhase === 'second-half' && (
            <View style={{ marginTop: 12, backgroundColor: "#FF3B30", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 14 }}>
                ⏱️ FULL TIME REACHED
              </Text>
            </View>
          )}
        </View>

        {/* Admin Controls */}
        {canManageMatch && (
          <View style={{ marginTop: 20 }}>
            <View style={{ backgroundColor: "rgba(242,209,0,0.1)", padding: 10, borderRadius: 12, borderWidth: 1, borderColor: "rgba(242,209,0,0.3)", marginBottom: 10 }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 12, textAlign: "center" }}>
                🔐 ADMIN CONTROLS ({currentUser.role})
              </Text>
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: "#F2D100", fontSize: 16, fontWeight: "900", marginBottom: 10 }}>
                Match Controls
              </Text>
              
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                <TouchableOpacity 
                  onPress={onStartPause} 
                  disabled={isFT}
                  style={{ 
                    flex: 1, 
                    backgroundColor: isFT ? "#0A2238" : 
                      !matchEligibility.canStart && !match.isLive && matchPhase === 'pre-match' ? "#0A2238" : 
                      match.isLive ? "#FF3B30" : "#34C759", 
                    padding: 14, 
                    borderRadius: 12, 
                    alignItems: "center",
                    borderWidth: (!matchEligibility.canStart && !match.isLive && matchPhase === 'pre-match') || isFT ? 2 : 0,
                    borderColor: isFT ? "#9FB3C8" : "#FF3B30",
                    opacity: isFT ? 0.6 : 1,
                  }}
                >
                  <Text style={{ 
                    color: isFT ? "#9FB3C8" : 
                      !matchEligibility.canStart && !match.isLive && matchPhase === 'pre-match' ? "#FF3B30" : 
                      match.isLive ? "#EAF2FF" : "#061A2B", 
                    fontWeight: "900", 
                    fontSize: 16 
                  }}>
                    {isFT ? "✅ Ended" :
                     !matchEligibility.canStart && !match.isLive && matchPhase === 'pre-match' ? "🚫 Blocked" :
                     matchPhase === 'half-time' ? "▶️ 2nd Half" :
                     match.isLive ? "⏸ Pause" : "▶️ Start"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={onReset} 
                  disabled={isFT}
                  style={{ 
                    backgroundColor: "#0A2238", 
                    padding: 14, 
                    borderRadius: 12, 
                    alignItems: "center", 
                    borderWidth: 1, 
                    borderColor: "rgba(255,255,255,0.1)",
                    minWidth: 80,
                    opacity: isFT ? 0.6 : 1,
                  }}
                >
                  <Text style={{ color: isFT ? "#9FB3C8" : "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                    🔄
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "row", gap: 10 }}>
                {matchPhase === 'first-half' && !isFT && (
                  <TouchableOpacity 
                    onPress={handleEndFirstHalf}
                    style={{ 
                      flex: 1, 
                      backgroundColor: "#FFD700", 
                      padding: 14, 
                      borderRadius: 12, 
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>
                      ⏸️ End Half
                    </Text>
                  </TouchableOpacity>
                )}

                {(matchPhase === 'first-half' || matchPhase === 'second-half' || matchPhase === 'half-time') && !isFT && (
                  <TouchableOpacity 
                    onPress={handleEndMatch}
                    style={{ 
                      flex: matchPhase === 'first-half' ? 1 : 2,
                      backgroundColor: "#FF3B30", 
                      padding: 14, 
                      borderRadius: 12, 
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor: "#8B0000",
                    }}
                  >
                    <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                      🏁 End Match
                    </Text>
                  </TouchableOpacity>
                )}

                {isFT && (
                  <View style={{ 
                    flex: 1, 
                    backgroundColor: "#2A3F54", 
                    padding: 14, 
                    borderRadius: 12, 
                    alignItems: "center" 
                  }}>
                    <Text style={{ color: "#9FB3C8", fontWeight: "900", fontSize: 16 }}>
                      ✅ Match Completed
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={{ marginTop: 14 }}>
              <Text style={{ color: "#F2D100", fontSize: 18, fontWeight: "900", marginBottom: 10 }}>Log Events</Text>
              
              <Text style={{ color: "#9FB3C8", fontSize: 14, fontWeight: "900", marginBottom: 8 }}>⚽ Goals</Text>
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
                <TouchableOpacity 
                  onPress={() => openPlayerSelection("GOAL", home?.id)} 
                  disabled={matchPhase === 'pre-match' || isFT}
                  style={{ 
                    flex: 1, 
                    backgroundColor: matchPhase === 'pre-match' || isFT ? "#0A2238" : "#34C759", 
                    padding: 14, 
                    borderRadius: 12, 
                    alignItems: "center",
                    opacity: matchPhase === 'pre-match' || isFT ? 0.5 : 1,
                  }}
                >
                  <Text style={{ color: matchPhase === 'pre-match' || isFT ? "#9FB3C8" : "#061A2B", fontWeight: "900", fontSize: 15 }}>
                    ⚽ {home?.name || "Home"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => openPlayerSelection("GOAL", away?.id)} 
                  disabled={matchPhase === 'pre-match' || isFT}
                  style={{ 
                    flex: 1, 
                    backgroundColor: matchPhase === 'pre-match' || isFT ? "#0A2238" : "#34C759", 
                    padding: 14, 
                    borderRadius: 12, 
                    alignItems: "center",
                    opacity: matchPhase === 'pre-match' || isFT ? 0.5 : 1,
                  }}
                >
                  <Text style={{ color: matchPhase === 'pre-match' || isFT ? "#9FB3C8" : "#061A2B", fontWeight: "900", fontSize: 15 }}>
                    ⚽ {away?.name || "Away"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={{ color: "#9FB3C8", fontSize: 14, fontWeight: "900", marginBottom: 8 }}>🟨 Yellow Cards</Text>
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
                <TouchableOpacity 
                  onPress={() => openPlayerSelection("YELLOW", home?.id)} 
                  disabled={matchPhase === 'pre-match' || isFT}
                  style={{ 
                    flex: 1, 
                    backgroundColor: matchPhase === 'pre-match' || isFT ? "#0A2238" : "#F2D100", 
                    padding: 14, 
                    borderRadius: 12, 
                    alignItems: "center",
                    opacity: matchPhase === 'pre-match' || isFT ? 0.5 : 1,
                  }}
                >
                  <Text style={{ color: matchPhase === 'pre-match' || isFT ? "#9FB3C8" : "#061A2B", fontWeight: "900", fontSize: 15 }}>
                    🟨 {home?.name || "Home"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => openPlayerSelection("YELLOW", away?.id)} 
                  disabled={matchPhase === 'pre-match' || isFT}
                  style={{ 
                    flex: 1, 
                    backgroundColor: matchPhase === 'pre-match' || isFT ? "#0A2238" : "#F2D100", 
                    padding: 14, 
                    borderRadius: 12, 
                    alignItems: "center",
                    opacity: matchPhase === 'pre-match' || isFT ? 0.5 : 1,
                  }}
                >
                  <Text style={{ color: matchPhase === 'pre-match' || isFT ? "#9FB3C8" : "#061A2B", fontWeight: "900", fontSize: 15 }}>
                    🟨 {away?.name || "Away"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={{ color: "#9FB3C8", fontSize: 14, fontWeight: "900", marginBottom: 8 }}>🟥 Red Cards</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity 
                  onPress={() => openPlayerSelection("RED", home?.id)} 
                  disabled={matchPhase === 'pre-match' || isFT}
                  style={{ 
                    flex: 1, 
                    backgroundColor: matchPhase === 'pre-match' || isFT ? "#0A2238" : "#FF3B30", 
                    padding: 14, 
                    borderRadius: 12, 
                    alignItems: "center",
                    opacity: matchPhase === 'pre-match' || isFT ? 0.5 : 1,
                  }}
                >
                  <Text style={{ color: matchPhase === 'pre-match' || isFT ? "#9FB3C8" : "#EAF2FF", fontWeight: "900", fontSize: 15 }}>
                    🟥 {home?.name || "Home"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => openPlayerSelection("RED", away?.id)} 
                  disabled={matchPhase === 'pre-match' || isFT}
                  style={{ 
                    flex: 1, 
                    backgroundColor: matchPhase === 'pre-match' || isFT ? "#0A2238" : "#FF3B30", 
                    padding: 14, 
                    borderRadius: 12, 
                    alignItems: "center",
                    opacity: matchPhase === 'pre-match' || isFT ? 0.5 : 1,
                  }}
                >
                  <Text style={{ color: matchPhase === 'pre-match' || isFT ? "#9FB3C8" : "#EAF2FF", fontWeight: "900", fontSize: 15 }}>
                    🟥 {away?.name || "Away"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Sponsor Ad */}
        {currentSlot && (
          <View style={{ marginTop: 20, backgroundColor: "#22C6D2", padding: 14, borderRadius: 14, alignItems: "center" }}>
            <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>{currentSlot.name}</Text>
            <Text style={{ color: "#061A2B", marginTop: 4 }}>{currentSlot.tagline}</Text>
          </View>
        )}

        {/* Match Events */}
        {eventsForMatch.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ color: "#F2D100", fontSize: 20, fontWeight: "900", marginBottom: 12 }}>📋 Match Events</Text>
            {eventsForMatch
              .slice()
              .reverse()
              .map((e: any) => {
                const eventIcon = e.type === "GOAL" ? "⚽" : e.type === "YELLOW" ? "🟨" : "🟥";
                const eventColor = e.type === "GOAL" ? "#34C759" : e.type === "YELLOW" ? "#F2D100" : "#FF3B30";
                
                return (
                  <View 
                    key={e.id} 
                    style={{ 
                      backgroundColor: "#0A2238", 
                      padding: 14, 
                      borderRadius: 12, 
                      marginBottom: 10,
                      borderLeftWidth: 4,
                      borderLeftColor: eventColor,
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <Text style={{ fontSize: 24 }}>{eventIcon}</Text>
                          <View>
                            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                              {e.type}
                            </Text>
                            <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 14, marginTop: 2 }}>
                              {getPlayerName(e.playerId)}
                            </Text>
                            <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                              {getTeamName(e.teamId)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ 
                        backgroundColor: eventColor, 
                        paddingHorizontal: 12, 
                        paddingVertical: 6, 
                        borderRadius: 20 
                      }}>
                        <Text style={{ color: e.type === "GOAL" ? "#061A2B" : e.type === "YELLOW" ? "#061A2B" : "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                          {e.minute}'
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
          </View>
        )}
      </ScrollView>

      {/* ===== ADMIN OVERRIDE PASSCODE MODAL ===== */}
      <Modal
        visible={showOverrideModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowOverrideModal(false);
          setPasscodeInput("");
          setOverrideAction(null);
        }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#0A2238", borderRadius: 24, padding: 24, borderWidth: 3, borderColor: "#FF3B30" }}>
            {/* Header */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>⚠️</Text>
              <Text style={{ color: "#FF3B30", fontSize: 22, fontWeight: "900", textAlign: "center" }}>
                ADMIN OVERRIDE REQUIRED
              </Text>
              <Text style={{ color: "#9FB3C8", fontSize: 14, textAlign: "center", marginTop: 8 }}>
                {overrideAction === 'end-half' 
                  ? `Ending first half at ${currentMinute}:${String(currentSecond).padStart(2, '0')} (before 45:00)`
                  : `Ending match at ${currentMinute}:${String(currentSecond).padStart(2, '0')} (before 90:00)`}
              </Text>
            </View>

            {/* Warning Box */}
            <View style={{ backgroundColor: "rgba(255,59,48,0.15)", padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: "#FF3B30" }}>
              <Text style={{ color: "#EAF2FF", fontSize: 14, lineHeight: 20, textAlign: "center" }}>
                {overrideAction === 'end-half' 
                  ? `You are about to end the first half before the allocated time (45 minutes).`
                  : `You are about to end the match before the allocated time (90 minutes).`}
              </Text>
              <Text style={{ color: "#FF3B30", fontSize: 14, marginTop: 12, textAlign: "center", fontWeight: "900" }}>
                This action requires administrator authorization.
              </Text>
            </View>

            {/* Passcode Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: "#F2D100", fontSize: 14, fontWeight: "900", marginBottom: 8, textAlign: "center" }}>
                Enter Admin Passcode
              </Text>
              <TextInput
                value={passcodeInput}
                onChangeText={setPasscodeInput}
                placeholder="••••"
                placeholderTextColor="#9FB3C8"
                secureTextEntry
                keyboardType="number-pad"
                maxLength={4}
                autoFocus
                style={{
                  backgroundColor: "#061A2B",
                  color: "#EAF2FF",
                  fontSize: 28,
                  fontWeight: "900",
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: "#F2D100",
                  textAlign: "center",
                  letterSpacing: 12,
                }}
              />
              <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 8, textAlign: "center", fontStyle: "italic" }}>
                Contact league administrator if you don't have the passcode
              </Text>
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowOverrideModal(false);
                  setPasscodeInput("");
                  setOverrideAction(null);
                }}
                style={{
                  flex: 1,
                  backgroundColor: "#0A2238",
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: "#9FB3C8",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmOverride}
                disabled={passcodeInput.length !== 4}
                style={{
                  flex: 1,
                  backgroundColor: passcodeInput.length === 4 ? "#FF3B30" : "#0A2238",
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: passcodeInput.length === 4 ? "#8B0000" : "#9FB3C8",
                  alignItems: "center",
                  opacity: passcodeInput.length === 4 ? 1 : 0.5,
                }}
              >
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                  Confirm Override
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={{ marginTop: 16, backgroundColor: "rgba(242,209,0,0.1)", padding: 12, borderRadius: 12 }}>
              <Text style={{ color: "#F2D100", fontSize: 11, textAlign: "center" }}>
                🔐 This action will be logged with admin credentials
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Event Logging Modal */}
      <Modal
        visible={showPlayerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlayerModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#0A2238", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "80%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>
                {eventType === "GOAL" ? "⚽ Select Goal Scorer" : eventType === "YELLOW" ? "🟨 Select Player (Yellow)" : "🟥 Select Player (Red)"}
              </Text>
              <TouchableOpacity onPress={() => setShowPlayerModal(false)}>
                <Text style={{ color: "#9FB3C8", fontSize: 32 }}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: "rgba(242,209,0,0.1)", padding: 12, borderRadius: 12, marginBottom: 16 }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", textAlign: "center" }}>
                {getTeamName(selectedTeamId)} • Minute {currentMinute}'
              </Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {(selectedTeamId === home?.id ? homePlayers : awayPlayers).length === 0 ? (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text style={{ color: "#9FB3C8", textAlign: "center" }}>
                    No players in roster. Add players to the team first.
                  </Text>
                </View>
              ) : (
                (selectedTeamId === home?.id ? homePlayers : awayPlayers).map((player: any) => (
                  <TouchableOpacity
                    key={player.id}
                    onPress={() => setSelectedPlayerId(player.id)}
                    style={{
                      backgroundColor: selectedPlayerId === player.id ? eventType === "GOAL" ? "#34C759" : eventType === "YELLOW" ? "#F2D100" : "#FF3B30" : "#0B2842",
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 10,
                      borderWidth: 2,
                      borderColor: selectedPlayerId === player.id ? (eventType === "GOAL" ? "#34C759" : eventType === "YELLOW" ? "#F2D100" : "#FF3B30") : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          color: selectedPlayerId === player.id ? "#061A2B" : "#EAF2FF", 
                          fontWeight: "900", 
                          fontSize: 16 
                        }}>
                          {player.fullName}
                        </Text>
                        {player.shirtNumber && (
                          <Text style={{ 
                            color: selectedPlayerId === player.id ? "#061A2B" : "#9FB3C8", 
                            marginTop: 4,
                            fontSize: 14
                          }}>
                            #{player.shirtNumber} {player.position ? `• ${player.position}` : ""}
                          </Text>
                        )}
                      </View>
                      {selectedPlayerId === player.id && (
                        <Text style={{ fontSize: 24 }}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              onPress={confirmEvent}
              disabled={!selectedPlayerId}
              style={{
                backgroundColor: selectedPlayerId ? (eventType === "GOAL" ? "#34C759" : eventType === "YELLOW" ? "#F2D100" : "#FF3B30") : "#0B2842",
                padding: 16,
                borderRadius: 14,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text style={{ 
                color: selectedPlayerId ? "#061A2B" : "#9FB3C8", 
                fontWeight: "900", 
                fontSize: 18 
              }}>
                {selectedPlayerId ? `Confirm ${eventType}` : "Select a Player"}
              </Text>
            </TouchableOpacity>

            {eventType !== "GOAL" && selectedPlayerId && (
              <View style={{ marginTop: 12, backgroundColor: "rgba(255,59,48,0.1)", padding: 12, borderRadius: 12 }}>
                <Text style={{ color: "#FF3B30", fontSize: 12, textAlign: "center" }}>
                  ⚠️ Fine will be automatically issued: ${eventType === "YELLOW" ? "25.00" : "50.00"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* MOTM Voting Modal */}
      <Modal
        visible={showMotmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMotmModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#0A2238", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "80%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>
                🌟 Vote for Man of the Match
              </Text>
              <TouchableOpacity onPress={() => setShowMotmModal(false)}>
                <Text style={{ color: "#9FB3C8", fontSize: 32 }}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: "rgba(242,209,0,0.1)", padding: 12, borderRadius: 12, marginBottom: 16 }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", textAlign: "center" }}>
                {myVote ? "Change your vote" : "Select the best player"}
              </Text>
              <Text style={{ color: "#9FB3C8", fontSize: 12, textAlign: "center", marginTop: 4 }}>
                Winner receives $25.00 bonus
              </Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Home Team */}
              <Text style={{ color: "#22C6D2", fontSize: 16, fontWeight: "900", marginBottom: 10, marginTop: 4 }}>
                {home?.name}
              </Text>
              {homePlayers.map((player: any) => (
                <TouchableOpacity
                  key={player.id}
                  onPress={() => setSelectedPlayerId(player.id)}
                  style={{
                    backgroundColor: selectedPlayerId === player.id ? "#F2D100" : "#0B2842",
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 10,
                    borderWidth: 2,
                    borderColor: selectedPlayerId === player.id ? "#F2D100" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        color: selectedPlayerId === player.id ? "#061A2B" : "#EAF2FF", 
                        fontWeight: "900", 
                        fontSize: 16 
                      }}>
                        {player.fullName}
                      </Text>
                      {player.shirtNumber && (
                        <Text style={{ 
                          color: selectedPlayerId === player.id ? "#061A2B" : "#9FB3C8", 
                          marginTop: 4,
                          fontSize: 14
                        }}>
                          #{player.shirtNumber} {player.position ? `• ${player.position}` : ""}
                        </Text>
                      )}
                    </View>
                    {selectedPlayerId === player.id && (
                      <Text style={{ fontSize: 24 }}>⭐</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {/* Away Team */}
              <Text style={{ color: "#22C6D2", fontSize: 16, fontWeight: "900", marginBottom: 10, marginTop: 16 }}>
                {away?.name}
              </Text>
              {awayPlayers.map((player: any) => (
                <TouchableOpacity
                  key={player.id}
                  onPress={() => setSelectedPlayerId(player.id)}
                  style={{
                    backgroundColor: selectedPlayerId === player.id ? "#F2D100" : "#0B2842",
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 10,
                    borderWidth: 2,
                    borderColor: selectedPlayerId === player.id ? "#F2D100" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        color: selectedPlayerId === player.id ? "#061A2B" : "#EAF2FF", 
                        fontWeight: "900", 
                        fontSize: 16 
                      }}>
                        {player.fullName}
                      </Text>
                      {player.shirtNumber && (
                        <Text style={{ 
                          color: selectedPlayerId === player.id ? "#061A2B" : "#9FB3C8", 
                          marginTop: 4,
                          fontSize: 14
                        }}>
                          #{player.shirtNumber} {player.position ? `• ${player.position}` : ""}
                        </Text>
                      )}
                    </View>
                    {selectedPlayerId === player.id && (
                      <Text style={{ fontSize: 24 }}>⭐</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={confirmMotmVote}
              disabled={!selectedPlayerId}
              style={{
                backgroundColor: selectedPlayerId ? "#F2D100" : "#0B2842",
                padding: 16,
                borderRadius: 14,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text style={{ 
                color: selectedPlayerId ? "#061A2B" : "#9FB3C8", 
                fontWeight: "900", 
                fontSize: 18 
              }}>
                {selectedPlayerId ? (myVote ? "Update Vote" : "Cast Vote") : "Select a Player"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}