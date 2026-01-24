// app/live/[id].tsx - ENHANCED WITH TIMER & PLAYER SELECTION
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource } from "../../src/utils/logos";

// Local betting types
type BetType = "WINNER" | "OVER_UNDER" | "BTTS";
type BetPick = "HOME" | "AWAY" | "DRAW" | "OVER" | "UNDER" | "YES" | "NO";

interface Bet {
  id: string;
  betType: BetType;
  pick: BetPick;
  wagerCents: number;
  odds: number;
  potentialWin: number;
}

function fmtClock(sec: number) {
  const s = Math.max(0, Math.floor(sec || 0));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

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
  } = useAppStore() as any;

  const match = useMemo(() => (matches ?? []).find((m: any) => String(m.id) === matchId), [matches, matchId]);
  const home = useMemo(() => (teams ?? []).find((t: any) => t.id === match?.homeTeamId), [teams, match]);
  const away = useMemo(() => (teams ?? []).find((t: any) => t.id === match?.awayTeamId), [teams, match]);

  // Get players for each team
  const homePlayers = useMemo(() => {
    return (players ?? []).filter((p: any) => p.teamId === match?.homeTeamId);
  }, [players, match?.homeTeamId]);

  const awayPlayers = useMemo(() => {
    return (players ?? []).filter((p: any) => p.teamId === match?.awayTeamId);
  }, [players, match?.awayTeamId]);

  const eventsForMatch = useMemo(() => {
    return (matchEvents ?? []).filter((e: any) => e.matchId === matchId);
  }, [matchEvents, matchId]);

  const score = useMemo(() => {
    return scoreFromEvents(matchId, matchEvents ?? [], match?.homeTeamId, match?.awayTeamId);
  }, [matchId, matchEvents, match]);

  const canManageMatch = can("MANAGE_MATCH");

  // Player selection modal state
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [eventType, setEventType] = useState<"GOAL" | "YELLOW" | "RED">("GOAL");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");

  // Betting pool state
  const [myBets, setMyBets] = useState<Bet[]>([]);
  const [allBets, setAllBets] = useState<Bet[]>([]);
  const [selectedBetType, setSelectedBetType] = useState<BetType>("WINNER");
  const [selectedPick, setSelectedPick] = useState<BetPick | null>(null);
  const [wagerAmount, setWagerAmount] = useState("5");
  const [bettingLocked, setBettingLocked] = useState(false);

  const calculateOdds = (betType: BetType, pick: BetPick): number => {
    const typeBets = allBets.filter((b) => b.betType === betType);
    if (typeBets.length === 0) return 2.0;
    const totalWagered = typeBets.reduce((sum, b) => sum + b.wagerCents, 0);
    const pickWagered = typeBets.filter((b) => b.pick === pick).reduce((sum, b) => sum + b.wagerCents, 0);
    if (pickWagered === 0) return 5.0;
    if (totalWagered === 0) return 2.0;
    const fairOdds = totalWagered / pickWagered;
    return Math.max(1.1, Math.min(10.0, fairOdds));
  };

  const totalPot = allBets.reduce((sum, b) => sum + b.wagerCents, 0);

  const placeBet = () => {
    if (!selectedPick) {
      Alert.alert("Select Outcome", "Please select what you want to bet on");
      return;
    }
    const cents = Math.floor(parseFloat(wagerAmount || "0") * 100);
    if (cents < 100) {
      Alert.alert("Minimum Bet", "Minimum bet is $1.00");
      return;
    }
    const odds = calculateOdds(selectedBetType, selectedPick);
    const potentialWin = Math.floor(cents * odds);
    Alert.alert(
      "Confirm Bet",
      `$${(cents / 100).toFixed(2)} on ${selectedPick}\nOdds: ${odds.toFixed(2)}x\nPotential Win: $${(potentialWin / 100).toFixed(2)}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Place Bet",
          onPress: () => {
            const newBet: Bet = {
              id: `bet_${Date.now()}`,
              betType: selectedBetType,
              pick: selectedPick,
              wagerCents: cents,
              odds,
              potentialWin,
            };
            setMyBets((prev) => [...prev, newBet]);
            setAllBets((prev) => [...prev, newBet]);
            setSelectedPick(null);
            setWagerAmount("5");
            Alert.alert("Bet Placed! 🎉", `Good luck!`);
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (match?.isLive && !bettingLocked) {
      setBettingLocked(true);
      Alert.alert("Betting Closed", "Match has started. No more bets accepted.");
    }
  }, [match?.isLive]);

  const [slot, setSlot] = useState(0);
  const slots = sponsorsAds ?? [];
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

  if (!match) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <Text style={{ color: "#EAF2FF" }}>Match not found.</Text>
      </View>
    );
  }

  const currentMinute = Math.floor((match.clockSec ?? 0) / 60);
  const currentSecond = (match.clockSec ?? 0) % 60;
  const timeLeft = Math.max(0, (match.durationSec ?? 0) - (match.clockSec ?? 0));
  const isFT = timeLeft <= 0 && match.isLive;
  const currentSlot = slots.length ? slots[slot] : null;

  // Open player selection modal
  const openPlayerSelection = (type: "GOAL" | "YELLOW" | "RED", teamId: string) => {
    setEventType(type);
    setSelectedTeamId(teamId);
    setSelectedPlayerId("");
    setShowPlayerModal(true);
  };

  // Confirm event with player
  const confirmEvent = () => {
    if (!selectedPlayerId) {
      Alert.alert("Select Player", "Please select a player from the roster");
      return;
    }

    const player = (players ?? []).find((p: any) => p.id === selectedPlayerId);
    const team = teams?.find((t: any) => t.id === selectedTeamId);

    // Log the event
    logEvent({
      matchId: match.id,
      type: eventType,
      teamId: selectedTeamId,
      playerId: selectedPlayerId,
      minute: currentMinute,
    });

    // Auto-create fine for cards
    if ((eventType === "YELLOW" || eventType === "RED") && typeof addPendingPayment === 'function') {
      const fineAmount = eventType === "YELLOW" ? 2500 : 7500;
      
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
      `${player?.fullName || "Player"} (${team?.name})\nMinute: ${currentMinute}'${eventType !== "GOAL" ? `\n\nFine: $${eventType === "YELLOW" ? "25.00" : "75.00"} (7 days)` : ""}`,
      [{ text: "OK" }]
    );
  };

  const onStartPause = () => {
    if (isFT) {
      Alert.alert("Full time", "Match has reached 90 minutes. Reset to continue or end match.");
      return;
    }
    setMatchLive(match.id, !match.isLive);
  };

  const onReset = () => {
    resetMatchClock(match.id);
  };

  const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const renderBetOption = (pick: BetPick, label: string) => {
    const odds = calculateOdds(selectedBetType, pick);
    const isSelected = selectedPick === pick;
    return (
      <TouchableOpacity
        key={pick}
        onPress={() => !bettingLocked && setSelectedPick(pick)}
        disabled={bettingLocked}
        style={{
          flex: 1,
          backgroundColor: isSelected ? "#F2D100" : "#0A2238",
          padding: 12,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: isSelected ? "#F2D100" : "rgba(255,255,255,0.1)",
          alignItems: "center",
          opacity: bettingLocked ? 0.5 : 1,
        }}
      >
        <Text style={{ color: isSelected ? "#061A2B" : "#EAF2FF", fontWeight: "900", fontSize: 13 }}>
          {label}
        </Text>
        <Text style={{ color: isSelected ? "#061A2B" : "#22C6D2", fontWeight: "900", marginTop: 4 }}>
          {odds.toFixed(2)}x
        </Text>
      </TouchableOpacity>
    );
  };

  // Get player name helper
  const getPlayerName = (playerId?: string | null) => {
    if (!playerId) return "Unknown Player";
    const player = (players ?? []).find((p: any) => p.id === playerId);
    return player?.fullName || "Unknown Player";
  };

  // Get team name helper
  const getTeamName = (teamId?: string) => {
    const team = (teams ?? []).find((t: any) => t.id === teamId);
    return team?.name || "Unknown Team";
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Match Header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
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

        {/* MATCH CLOCK - VISIBLE TO ALL */}
        <View style={{ 
          marginTop: 20, 
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
          {currentMinute >= 90 && match.isLive && (
            <View style={{ marginTop: 12, backgroundColor: "#FF3B30", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 14 }}>
                ⏱️ FULL TIME REACHED
              </Text>
            </View>
          )}
        </View>

        {/* Match Controls - ADMIN/REF ONLY */}
        {canManageMatch && (
          <View style={{ marginTop: 20 }}>
            <View style={{ backgroundColor: "rgba(242,209,0,0.1)", padding: 10, borderRadius: 12, borderWidth: 1, borderColor: "rgba(242,209,0,0.3)", marginBottom: 10 }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 12, textAlign: "center" }}>
                🔐 ADMIN CONTROLS ({currentUser.role})
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity onPress={onStartPause} style={{ flex: 1, backgroundColor: match.isLive ? "#FF3B30" : "#34C759", padding: 14, borderRadius: 12, alignItems: "center" }}>
                <Text style={{ color: match.isLive ? "#EAF2FF" : "#061A2B", fontWeight: "900", fontSize: 16 }}>
                  {match.isLive ? "⏸ Pause Clock" : "▶️ Start Clock"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onReset} style={{ backgroundColor: "#0A2238", padding: 14, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>🔄 Reset</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 14 }}>
              <Text style={{ color: "#F2D100", fontSize: 18, fontWeight: "900", marginBottom: 10 }}>Log Events</Text>
              
              {/* Goals */}
              <Text style={{ color: "#9FB3C8", fontSize: 14, fontWeight: "900", marginBottom: 8 }}>⚽ Goals</Text>
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
                <TouchableOpacity 
                  onPress={() => openPlayerSelection("GOAL", home?.id)} 
                  style={{ flex: 1, backgroundColor: "#34C759", padding: 14, borderRadius: 12, alignItems: "center" }}
                >
                  <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 15 }}>⚽ {home?.name || "Home"}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => openPlayerSelection("GOAL", away?.id)} 
                  style={{ flex: 1, backgroundColor: "#34C759", padding: 14, borderRadius: 12, alignItems: "center" }}
                >
                  <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 15 }}>⚽ {away?.name || "Away"}</Text>
                </TouchableOpacity>
              </View>

              {/* Yellow Cards */}
              <Text style={{ color: "#9FB3C8", fontSize: 14, fontWeight: "900", marginBottom: 8 }}>🟨 Yellow Cards</Text>
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
                <TouchableOpacity 
                  onPress={() => openPlayerSelection("YELLOW", home?.id)} 
                  style={{ flex: 1, backgroundColor: "#F2D100", padding: 14, borderRadius: 12, alignItems: "center" }}
                >
                  <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 15 }}>🟨 {home?.name || "Home"}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => openPlayerSelection("YELLOW", away?.id)} 
                  style={{ flex: 1, backgroundColor: "#F2D100", padding: 14, borderRadius: 12, alignItems: "center" }}
                >
                  <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 15 }}>🟨 {away?.name || "Away"}</Text>
                </TouchableOpacity>
              </View>

              {/* Red Cards */}
              <Text style={{ color: "#9FB3C8", fontSize: 14, fontWeight: "900", marginBottom: 8 }}>🟥 Red Cards</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity 
                  onPress={() => openPlayerSelection("RED", home?.id)} 
                  style={{ flex: 1, backgroundColor: "#FF3B30", padding: 14, borderRadius: 12, alignItems: "center" }}
                >
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 15 }}>🟥 {home?.name || "Home"}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => openPlayerSelection("RED", away?.id)} 
                  style={{ flex: 1, backgroundColor: "#FF3B30", padding: 14, borderRadius: 12, alignItems: "center" }}
                >
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 15 }}>🟥 {away?.name || "Away"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* BETTING POOL SECTION */}
        <View style={{ marginTop: 24, gap: 14 }}>
          <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>🎰 Match Pool</Text>
          <View style={{ backgroundColor: "#0A2238", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Total Pot</Text>
                <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 28, marginTop: 4 }}>{formatMoney(totalPot)}</Text>
              </View>
              <View>
                <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Total Bets</Text>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 28, marginTop: 4 }}>{allBets.length}</Text>
              </View>
            </View>
          </View>

          {bettingLocked ? (
            <View style={{ backgroundColor: "#0A2238", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
              <Text style={{ color: "#FF3B30", fontWeight: "900", fontSize: 16, textAlign: "center" }}>🔒 Betting Closed</Text>
              <Text style={{ color: "#9FB3C8", marginTop: 6, textAlign: "center" }}>Bets locked when match started</Text>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {(["WINNER", "OVER_UNDER", "BTTS"] as BetType[]).map((type) => (
                  <TouchableOpacity key={type} onPress={() => setSelectedBetType(type)} style={{ flex: 1, backgroundColor: selectedBetType === type ? "#22C6D2" : "#0A2238", paddingVertical: 10, borderRadius: 12, alignItems: "center" }}>
                    <Text style={{ color: selectedBetType === type ? "#061A2B" : "#EAF2FF", fontWeight: "900", fontSize: 12 }}>
                      {type === "WINNER" && "🏆 Winner"}{type === "OVER_UNDER" && "⚽ O/U"}{type === "BTTS" && "🎯 BTTS"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ backgroundColor: "#0A2238", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
                  {selectedBetType === "WINNER" && "Pick Winner"}{selectedBetType === "OVER_UNDER" && "Total Goals (2.5 line)"}{selectedBetType === "BTTS" && "Both Teams Score?"}
                </Text>
                {selectedBetType === "WINNER" && (
                  <View style={{ gap: 10 }}>
                    {renderBetOption("HOME", home?.name || "Home")}
                    {renderBetOption("DRAW", "Draw")}
                    {renderBetOption("AWAY", away?.name || "Away")}
                  </View>
                )}
                {selectedBetType === "OVER_UNDER" && (
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    {renderBetOption("OVER", "Over 2.5")}
                    {renderBetOption("UNDER", "Under 2.5")}
                  </View>
                )}
                {selectedBetType === "BTTS" && (
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    {renderBetOption("YES", "Yes")}
                    {renderBetOption("NO", "No")}
                  </View>
                )}
                <View style={{ marginTop: 16 }}>
                  <Text style={{ color: "#9FB3C8", marginBottom: 8 }}>Bet Amount ($)</Text>
                  <TextInput value={wagerAmount} onChangeText={setWagerAmount} keyboardType="decimal-pad" placeholder="5.00" placeholderTextColor="rgba(255,255,255,0.3)" editable={!bettingLocked} style={{ backgroundColor: "#0B2842", color: "#EAF2FF", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", fontWeight: "900", fontSize: 18 }} />
                </View>
                <TouchableOpacity onPress={placeBet} disabled={!selectedPick || bettingLocked} style={{ marginTop: 16, backgroundColor: selectedPick && !bettingLocked ? "#34C759" : "#0B2842", paddingVertical: 14, borderRadius: 12, alignItems: "center" }}>
                  <Text style={{ color: selectedPick && !bettingLocked ? "#061A2B" : "#9FB3C8", fontWeight: "900", fontSize: 16 }}>
                    {selectedPick ? `Place Bet on ${selectedPick}` : "Select an Option"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {myBets.length > 0 && (
            <View style={{ backgroundColor: "#0A2238", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>📝 My Bets ({myBets.length})</Text>
              {myBets.map((bet) => (
                <View key={bet.id} style={{ backgroundColor: "#0B2842", padding: 12, borderRadius: 12, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: "#22C6D2" }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                      {bet.betType === "WINNER" && "🏆 "}{bet.betType === "OVER_UNDER" && "⚽ "}{bet.betType === "BTTS" && "🎯 "}{bet.pick}
                    </Text>
                    <Text style={{ color: "#9FB3C8" }}>{bet.odds.toFixed(2)}x</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                    <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Wagered: {formatMoney(bet.wagerCents)}</Text>
                    <Text style={{ color: "#22C6D2", fontSize: 12, fontWeight: "900" }}>Win: {formatMoney(bet.potentialWin)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ backgroundColor: "rgba(34,198,210,0.1)", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(34,198,210,0.3)" }}>
            <Text style={{ color: "#22C6D2", fontSize: 12, lineHeight: 18 }}>
              💡 <Text style={{ fontWeight: "900" }}>How it works:</Text> Your bet goes into the match pool. Winners split the pot based on odds. Betting closes when match starts. Min $1, Max $100 per bet.
            </Text>
          </View>
        </View>

        {currentSlot && (
          <View style={{ marginTop: 20, backgroundColor: "#22C6D2", padding: 14, borderRadius: 14, alignItems: "center" }}>
            <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>{currentSlot.name}</Text>
            <Text style={{ color: "#061A2B", marginTop: 4 }}>{currentSlot.tagline}</Text>
          </View>
        )}

        {/* MATCH EVENTS WITH PLAYER NAMES */}
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
                        <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>
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

      {/* PLAYER SELECTION MODAL */}
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
                  ⚠️ Fine will be automatically issued: ${eventType === "YELLOW" ? "25.00" : "75.00"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}