// app/live/[id].tsx - WITH BETTING POOL
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource } from "../../src/utils/logos";

// Local betting types (no AppStore changes needed!)
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const matchId = String(id ?? "");

  const {
    matches,
    teams,
    matchEvents,
    setMatchLive,
    tickMatch,
    resetMatchClock,
    logMatchEvent,
    sponsorsAds,
  } = useAppStore() as any;

  const match = useMemo(() => (matches ?? []).find((m: any) => String(m.id) === matchId), [matches, matchId]);
  const home = useMemo(() => (teams ?? []).find((t: any) => t.id === match?.homeTeamId), [teams, match]);
  const away = useMemo(() => (teams ?? []).find((t: any) => t.id === match?.awayTeamId), [teams, match]);

  const eventsForMatch = useMemo(() => {
    return (matchEvents ?? []).filter((e: any) => e.matchId === matchId);
  }, [matchEvents, matchId]);

  const score = useMemo(() => {
    return scoreFromEvents(matchId, matchEvents ?? [], match?.homeTeamId, match?.awayTeamId);
  }, [matchId, matchEvents, match]);

  // === BETTING POOL STATE (Local to this screen) ===
  const [myBets, setMyBets] = useState<Bet[]>([]);
  const [allBets, setAllBets] = useState<Bet[]>([]); // Simulate all users' bets
  const [selectedBetType, setSelectedBetType] = useState<BetType>("WINNER");
  const [selectedPick, setSelectedPick] = useState<BetPick | null>(null);
  const [wagerAmount, setWagerAmount] = useState("5");
  const [bettingLocked, setBettingLocked] = useState(false);

  // Calculate odds based on pool distribution
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

  // Lock betting when match starts
  useEffect(() => {
    if (match?.isLive && !bettingLocked) {
      setBettingLocked(true);
      Alert.alert("Betting Closed", "Match has started. No more bets accepted.");
    }
  }, [match?.isLive]);

  // sponsor/ad rotator
  const [slot, setSlot] = useState(0);
  const slots = sponsorsAds ?? [];
  useEffect(() => {
    if (!slots.length) return;
    const t = setInterval(() => setSlot((s) => (s + 1) % slots.length), 7000);
    return () => clearInterval(t);
  }, [slots.length]);

  // timer tick
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

  const timeLeft = Math.max(0, (match.durationSec ?? 0) - (match.clockSec ?? 0));
  const isFT = timeLeft <= 0 && !match.isLive;
  const currentSlot = slots.length ? slots[slot] : null;

  const quickEvent = (type: "GOAL" | "YELLOW" | "RED", teamId?: string) => {
    if (!teamId) return;
    logMatchEvent({ matchId: match.id, type, teamId });
  };

  const onStartPause = () => {
    if (isFT) {
      Alert.alert("Full time", "Reset the match clock to start again.");
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

        {/* Match Controls */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
          <TouchableOpacity
            onPress={onStartPause}
            style={{ flex: 1, backgroundColor: match.isLive ? "#FF3B30" : "#34C759", padding: 12, borderRadius: 12, alignItems: "center" }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>
              {match.isLive ? "⏸ Pause" : "▶️ Start"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onReset}
            style={{ backgroundColor: "#0A2238", padding: 12, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
          >
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>🔄 Reset</Text>
          </TouchableOpacity>
        </View>

        {/* === BETTING POOL SECTION === */}
        <View style={{ marginTop: 24, gap: 14 }}>
          <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>🎰 Match Pool</Text>

          {/* Pool Stats */}
          <View style={{ backgroundColor: "#0A2238", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Total Pot</Text>
                <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 28, marginTop: 4 }}>
                  {formatMoney(totalPot)}
                </Text>
              </View>
              <View>
                <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Total Bets</Text>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 28, marginTop: 4 }}>
                  {allBets.length}
                </Text>
              </View>
            </View>
          </View>

          {bettingLocked ? (
            <View style={{ backgroundColor: "#0A2238", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
              <Text style={{ color: "#FF3B30", fontWeight: "900", fontSize: 16, textAlign: "center" }}>
                🔒 Betting Closed
              </Text>
              <Text style={{ color: "#9FB3C8", marginTop: 6, textAlign: "center" }}>
                Bets locked when match started
              </Text>
            </View>
          ) : (
            <>
              {/* Bet Type Selector */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                {(["WINNER", "OVER_UNDER", "BTTS"] as BetType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setSelectedBetType(type)}
                    style={{
                      flex: 1,
                      backgroundColor: selectedBetType === type ? "#22C6D2" : "#0A2238",
                      paddingVertical: 10,
                      borderRadius: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: selectedBetType === type ? "#061A2B" : "#EAF2FF", fontWeight: "900", fontSize: 12 }}>
                      {type === "WINNER" && "🏆 Winner"}
                      {type === "OVER_UNDER" && "⚽ O/U"}
                      {type === "BTTS" && "🎯 BTTS"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Bet Options */}
              <View style={{ backgroundColor: "#0A2238", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
                  {selectedBetType === "WINNER" && "Pick Winner"}
                  {selectedBetType === "OVER_UNDER" && "Total Goals (2.5 line)"}
                  {selectedBetType === "BTTS" && "Both Teams Score?"}
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

                {/* Wager Amount */}
                <View style={{ marginTop: 16 }}>
                  <Text style={{ color: "#9FB3C8", marginBottom: 8 }}>Bet Amount ($)</Text>
                  <TextInput
                    value={wagerAmount}
                    onChangeText={setWagerAmount}
                    keyboardType="decimal-pad"
                    placeholder="5.00"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    editable={!bettingLocked}
                    style={{
                      backgroundColor: "#0B2842",
                      color: "#EAF2FF",
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.1)",
                      fontWeight: "900",
                      fontSize: 18,
                    }}
                  />
                </View>

                {/* Place Bet Button */}
                <TouchableOpacity
                  onPress={placeBet}
                  disabled={!selectedPick || bettingLocked}
                  style={{
                    marginTop: 16,
                    backgroundColor: selectedPick && !bettingLocked ? "#34C759" : "#0B2842",
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: selectedPick && !bettingLocked ? "#061A2B" : "#9FB3C8", fontWeight: "900", fontSize: 16 }}>
                    {selectedPick ? `Place Bet on ${selectedPick}` : "Select an Option"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* My Bets */}
          {myBets.length > 0 && (
            <View style={{ backgroundColor: "#0A2238", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
                📝 My Bets ({myBets.length})
              </Text>

              {myBets.map((bet) => (
                <View
                  key={bet.id}
                  style={{
                    backgroundColor: "#0B2842",
                    padding: 12,
                    borderRadius: 12,
                    marginBottom: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: "#22C6D2",
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                      {bet.betType === "WINNER" && "🏆 "}
                      {bet.betType === "OVER_UNDER" && "⚽ "}
                      {bet.betType === "BTTS" && "🎯 "}
                      {bet.pick}
                    </Text>
                    <Text style={{ color: "#9FB3C8" }}>{bet.odds.toFixed(2)}x</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                    <Text style={{ color: "#9FB3C8", fontSize: 12 }}>
                      Wagered: {formatMoney(bet.wagerCents)}
                    </Text>
                    <Text style={{ color: "#22C6D2", fontSize: 12, fontWeight: "900" }}>
                      Win: {formatMoney(bet.potentialWin)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Info */}
          <View style={{ backgroundColor: "rgba(34,198,210,0.1)", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(34,198,210,0.3)" }}>
            <Text style={{ color: "#22C6D2", fontSize: 12, lineHeight: 18 }}>
              💡 <Text style={{ fontWeight: "900" }}>How it works:</Text> Your bet goes into the match pool. Winners split the pot based on odds. Betting closes when match starts. Min $1, Max $100 per bet.
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ marginTop: 20, gap: 10 }}>
          <Text style={{ color: "#F2D100", fontSize: 18, fontWeight: "900" }}>Quick Actions</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={() => quickEvent("GOAL", home?.id)}
              style={{ flex: 1, backgroundColor: "#34C759", padding: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>⚽ Home Goal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => quickEvent("GOAL", away?.id)}
              style={{ flex: 1, backgroundColor: "#34C759", padding: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>⚽ Away Goal</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sponsor */}
        {currentSlot && (
          <View style={{ marginTop: 20, backgroundColor: "#22C6D2", padding: 14, borderRadius: 14, alignItems: "center" }}>
            <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>{currentSlot.name}</Text>
            <Text style={{ color: "#061A2B", marginTop: 4 }}>{currentSlot.tagline}</Text>
          </View>
        )}

        {/* Events */}
        {eventsForMatch.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ color: "#F2D100", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>Match Events</Text>
            {eventsForMatch.map((e: any) => (
              <View key={e.id} style={{ backgroundColor: "#0A2238", padding: 12, borderRadius: 12, marginBottom: 8 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                  {e.type} - {e.minute}'
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}