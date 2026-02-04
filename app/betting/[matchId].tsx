// app/betting/[matchId].tsx - SIMPLE POOL BETTING - WALLET FIXED

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource } from "../../src/utils/logos";

export default function BettingScreen() {
  const router = useRouter();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const id = String(matchId);

  const {
    matches,
    teams,
    currentUser,
    bettingTickets,
    matchPools,
    placeBettingTicket,
    getMatchPool,
    canUserBet,
    walletBalance,
    addToWallet,
  } = useAppStore() as any;

  const match = useMemo(() => matches?.find((m: any) => m.id === id), [matches, id]);
  const home = useMemo(() => teams?.find((t: any) => t.id === match?.homeTeamId), [teams, match]);
  const away = useMemo(() => teams?.find((t: any) => t.id === match?.awayTeamId), [teams, match]);
  const pool = useMemo(() => getMatchPool(id), [id, matchPools]);

  const [winner, setWinner] = useState<"HOME" | "DRAW" | "AWAY" | null>(null);
  const [overUnder, setOverUnder] = useState<"OVER" | "UNDER" | null>(null);
  const [btts, setBtts] = useState<"YES" | "NO" | null>(null);
  const [wagerAmount, setWagerAmount] = useState("5");

  const myTickets = useMemo(() => {
    return (bettingTickets || []).filter(
      (t: any) => t.matchId === id && t.userId === currentUser?.id
    );
  }, [bettingTickets, id, currentUser]);

  const allTickets = useMemo(() => {
    return (bettingTickets || []).filter((t: any) => t.matchId === id);
  }, [bettingTickets, id]);

  const eligibility = useMemo(() => {
    if (!currentUser?.id) return { canBet: false, reason: "Not logged in" };
    return canUserBet(id, currentUser.id);
  }, [id, currentUser]);

  const isComplete = winner && overUnder && btts;
  const wagerCents = Math.floor(parseFloat(wagerAmount || "0") * 100);

  const placeBet = () => {
    if (!isComplete) {
      Alert.alert("Incomplete Ticket", "Please make all 4 picks before placing bet");
      return;
    }

    if (wagerCents < 100) {
      Alert.alert("Minimum Bet", "Minimum bet is $1.00");
      return;
    }

    if (wagerCents > 10000) {
      Alert.alert("Maximum Bet", "Maximum bet is $100.00");
      return;
    }

    if (wagerCents > (walletBalance || 0)) {
      Alert.alert("Insufficient Funds", "Add funds to your wallet first");
      return;
    }

    if (!eligibility.canBet) {
      Alert.alert("Cannot Bet", eligibility.reason || "You cannot bet on this match");
      return;
    }

    Alert.alert(
      "Confirm Bet",
      `Place $${(wagerCents / 100).toFixed(2)} bet?\n\n` +
        `Winner: ${winner}\n` +
        `O/U 2.5: ${overUnder}\n` +
        `BTTS: ${btts}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Place Bet",
          onPress: () => {
            const ticketId = placeBettingTicket({
              matchId: id,
              userId: currentUser.id,
              userName: currentUser.name || "User",
              wagerCents,
              winner: winner!,
              overUnder: overUnder!,
              btts: btts!,
            });

            if (ticketId) {
              // Deduct from wallet
              if (typeof addToWallet === 'function') {
                addToWallet(-wagerCents);
              }

              Alert.alert("Bet Placed! 🎰", "Good luck!", [
                { text: "View My Tickets" },
                { text: "OK" },
              ]);

              // Reset form
              setWinner(null);
              setOverUnder(null);
              setBtts(null);
              setWagerAmount("5");
            }
          },
        },
      ]
    );
  };

  const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const maxPayout = pool
    ? Math.min(pool.totalPotCents * 0.9, 50000)
    : 0;

  if (!match) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <Text style={{ color: "#EAF2FF" }}>Match not found</Text>
      </View>
    );
  }

  const isClosed = match.isLive || match.status === "FINAL" || (pool && pool.status === "LOCKED");

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#061A2B" }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Match Header */}
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
        <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back to Match</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <View style={{ alignItems: "center", flex: 1 }}>
          <Image source={getLogoSource(home?.logoKey)} style={{ width: 50, height: 50 }} />
          <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 8, textAlign: "center", fontSize: 14 }}>
            {home?.name}
          </Text>
        </View>
        <Text style={{ color: "#9FB3C8", fontSize: 18, fontWeight: "900" }}>VS</Text>
        <View style={{ alignItems: "center", flex: 1 }}>
          <Image source={getLogoSource(away?.logoKey)} style={{ width: 50, height: 50 }} />
          <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 8, textAlign: "center", fontSize: 14 }}>
            {away?.name}
          </Text>
        </View>
      </View>

      {/* Pool Stats */}
      <View style={{ backgroundColor: "#0A2238", padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 2, borderColor: "#22C6D2" }}>
        <Text style={{ color: "#22C6D2", fontSize: 20, fontWeight: "900", marginBottom: 12 }}>🎰 Match Pool</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Total Pot</Text>
            <Text style={{ color: "#F2D100", fontSize: 28, fontWeight: "900", marginTop: 4 }}>
              {formatMoney(pool?.totalPotCents || 0)}
            </Text>
          </View>
          <View>
            <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Total Tickets</Text>
            <Text style={{ color: "#EAF2FF", fontSize: 28, fontWeight: "900", marginTop: 4 }}>
              {pool?.ticketCount || 0}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" }}>
          <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Max Payout (90% or $500 cap)</Text>
          <Text style={{ color: "#34C759", fontSize: 18, fontWeight: "900", marginTop: 4 }}>
            {formatMoney(maxPayout)}
          </Text>
        </View>
      </View>

      {/* Eligibility Check */}
      {!eligibility.canBet && (
        <View style={{ backgroundColor: "#FF3B30", padding: 14, borderRadius: 12, marginBottom: 20 }}>
          <Text style={{ color: "#EAF2FF", fontWeight: "900", textAlign: "center" }}>
            🚫 {eligibility.reason}
          </Text>
        </View>
      )}

      {isClosed && (
        <View style={{ backgroundColor: "#0A2238", padding: 14, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}>
          <Text style={{ color: "#FF3B30", fontWeight: "900", textAlign: "center", fontSize: 16 }}>
            🔒 Betting Closed
          </Text>
          <Text style={{ color: "#9FB3C8", textAlign: "center", marginTop: 6 }}>
            {match.isLive ? "Match has started" : "Match has ended"}
          </Text>
        </View>
      )}

      {/* Betting Form */}
      {!isClosed && eligibility.canBet && (
        <View style={{ gap: 16 }}>
          <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>📝 Place Your Bet</Text>
          <Text style={{ color: "#9FB3C8" }}>Pick all 4 outcomes to complete your parlay ticket</Text>

          {/* 1. Winner */}
          <View style={{ backgroundColor: "#0A2238", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
              1️⃣ Match Winner
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["HOME", "DRAW", "AWAY"] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setWinner(option)}
                  style={{
                    flex: 1,
                    backgroundColor: winner === option ? "#34C759" : "#0B2842",
                    padding: 14,
                    borderRadius: 12,
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: winner === option ? "#34C759" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text style={{ color: winner === option ? "#061A2B" : "#EAF2FF", fontWeight: "900", fontSize: 13 }}>
                    {option === "HOME" ? home?.name || "Home" : option === "AWAY" ? away?.name || "Away" : "Draw"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 2. Over/Under */}
          <View style={{ backgroundColor: "#0A2238", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
              2️⃣ Total Goals (Over/Under 2.5)
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["OVER", "UNDER"] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setOverUnder(option)}
                  style={{
                    flex: 1,
                    backgroundColor: overUnder === option ? "#22C6D2" : "#0B2842",
                    padding: 14,
                    borderRadius: 12,
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: overUnder === option ? "#22C6D2" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text style={{ color: overUnder === option ? "#061A2B" : "#EAF2FF", fontWeight: "900", fontSize: 13 }}>
                    {option === "OVER" ? "Over 2.5" : "Under 2.5"}
                  </Text>
                  <Text style={{ color: overUnder === option ? "#061A2B" : "#9FB3C8", fontSize: 11, marginTop: 4 }}>
                    {option === "OVER" ? "3+ goals" : "0-2 goals"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 3. BTTS */}
          <View style={{ backgroundColor: "#0A2238", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
              3️⃣ Both Teams To Score?
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["YES", "NO"] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setBtts(option)}
                  style={{
                    flex: 1,
                    backgroundColor: btts === option ? "#F2D100" : "#0B2842",
                    padding: 14,
                    borderRadius: 12,
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: btts === option ? "#F2D100" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text style={{ color: btts === option ? "#061A2B" : "#EAF2FF", fontWeight: "900", fontSize: 13 }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 4. Wager Amount */}
          <View style={{ backgroundColor: "#0A2238", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
              4️⃣ Bet Amount
            </Text>
            <TextInput
              value={wagerAmount}
              onChangeText={setWagerAmount}
              keyboardType="decimal-pad"
              placeholder="5.00"
              placeholderTextColor="rgba(255,255,255,0.3)"
              style={{
                backgroundColor: "#0B2842",
                color: "#EAF2FF",
                padding: 14,
                borderRadius: 12,
                fontSize: 20,
                fontWeight: "900",
                textAlign: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
            <Text style={{ color: "#9FB3C8", textAlign: "center", marginTop: 8, fontSize: 12 }}>
              Min: $1.00 • Max: $100.00 • Wallet: {formatMoney(walletBalance || 0)}
            </Text>
          </View>

          {/* Place Bet Button */}
          <TouchableOpacity
            onPress={placeBet}
            disabled={!isComplete || wagerCents < 100}
            style={{
              backgroundColor: isComplete && wagerCents >= 100 ? "#34C759" : "#0B2842",
              padding: 18,
              borderRadius: 16,
              alignItems: "center",
              borderWidth: 2,
              borderColor: isComplete && wagerCents >= 100 ? "#34C759" : "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{ color: isComplete && wagerCents >= 100 ? "#061A2B" : "#9FB3C8", fontWeight: "900", fontSize: 18 }}>
              {isComplete ? `Place Bet - ${formatMoney(wagerCents)}` : "Complete All 4 Picks"}
            </Text>
          </TouchableOpacity>

          {/* Info */}
          <View style={{ backgroundColor: "rgba(34,198,210,0.1)", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(34,198,210,0.3)" }}>
            <Text style={{ color: "#22C6D2", fontSize: 12, lineHeight: 18 }}>
              💡 <Text style={{ fontWeight: "900" }}>How it works:</Text> Get all 4 picks correct to win! If multiple winners, pot is split. If no perfect tickets, closest wins. Pool pays 90% or $500 max (whichever is less). League keeps 10% + any excess over $500.
            </Text>
          </View>
        </View>
      )}

      {/* My Tickets */}
      {myTickets.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={{ color: "#F2D100", fontSize: 20, fontWeight: "900", marginBottom: 12 }}>
            🎫 My Tickets ({myTickets.length})
          </Text>
          {myTickets.map((ticket: any) => (
            <View
              key={ticket.id}
              style={{
                backgroundColor: "#0A2238",
                padding: 14,
                borderRadius: 14,
                marginBottom: 10,
                borderLeftWidth: 4,
                borderLeftColor:
                  ticket.status === "WON"
                    ? "#34C759"
                    : ticket.status === "CLOSEST"
                    ? "#F2D100"
                    : ticket.status === "LOST"
                    ? "#FF3B30"
                    : "#22C6D2",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 14 }}>
                  Ticket #{ticket.id.substr(-6)}
                </Text>
                <Text style={{ color: "#F2D100", fontWeight: "900" }}>
                  {formatMoney(ticket.wagerCents)}
                </Text>
              </View>
              <View style={{ gap: 6 }}>
                <Text style={{ color: "#9FB3C8", fontSize: 13 }}>
                  Winner: <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{ticket.winner}</Text>
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 13 }}>
                  O/U: <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{ticket.overUnder} 2.5</Text>
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 13 }}>
                  BTTS: <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{ticket.btts}</Text>
                </Text>
              </View>
              <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" }}>
                <Text style={{ color: ticket.status === "WON" ? "#34C759" : ticket.status === "CLOSEST" ? "#F2D100" : ticket.status === "LOST" ? "#FF3B30" : "#22C6D2", fontWeight: "900", fontSize: 14 }}>
                  {ticket.status === "PENDING" && "⏳ Pending"}
                  {ticket.status === "WON" && "🏆 WINNER!"}
                  {ticket.status === "CLOSEST" && "🥈 Closest Winner!"}
                  {ticket.status === "LOST" && "❌ Lost"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* All Tickets Leaderboard */}
      {allTickets.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={{ color: "#F2D100", fontSize: 20, fontWeight: "900", marginBottom: 12 }}>
            📊 All Tickets ({allTickets.length})
          </Text>
          {allTickets.map((ticket: any) => (
            <View
              key={ticket.id}
              style={{
                backgroundColor: "#0B2842",
                padding: 12,
                borderRadius: 12,
                marginBottom: 8,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 13 }}>
                  {ticket.userName}
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 13 }}>
                  {formatMoney(ticket.wagerCents)}
                </Text>
              </View>
              <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4 }}>
                {ticket.winner} • {ticket.overUnder} • BTTS {ticket.btts}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}