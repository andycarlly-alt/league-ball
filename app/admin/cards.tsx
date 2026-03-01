// app/admin/cards.tsx - CARD & DISCIPLINE TRACKING
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";

type CardFilter = "ALL" | "YELLOW" | "RED";

export default function AdminCards() {
  const router = useRouter();
  const { matchEvents, players, teams, matches } = useAppStore() as any;

  const [filter, setFilter] = useState<CardFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Get all card events
  const cardEvents = useMemo(() => {
    let events = (matchEvents ?? []).filter((e: any) => e.type === "YELLOW" || e.type === "RED");

    // Filter by type
    if (filter !== "ALL") {
      events = events.filter((e: any) => e.type === filter);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      events = events.filter((e: any) => {
        const player = (players ?? []).find((p: any) => p.id === e.playerId);
        const team = (teams ?? []).find((t: any) => t.id === e.teamId);
        return (
          player?.fullName?.toLowerCase().includes(query) ||
          team?.name?.toLowerCase().includes(query)
        );
      });
    }

    // Sort by date (newest first)
    return events.sort((a: any, b: any) => (b.minute || 0) - (a.minute || 0));
  }, [matchEvents, filter, searchQuery, players, teams]);

  // Card statistics
  const stats = useMemo(() => {
    const events = matchEvents ?? [];
    const yellowCards = events.filter((e: any) => e.type === "YELLOW");
    const redCards = events.filter((e: any) => e.type === "RED");

    // Top offenders
    const playerCards: Record<string, { yellow: number; red: number; total: number }> = {};
    events.forEach((e: any) => {
      if (e.type !== "YELLOW" && e.type !== "RED") return;
      if (!e.playerId) return;

      if (!playerCards[e.playerId]) {
        playerCards[e.playerId] = { yellow: 0, red: 0, total: 0 };
      }

      if (e.type === "YELLOW") {
        playerCards[e.playerId].yellow += 1;
      } else {
        playerCards[e.playerId].red += 1;
      }
      playerCards[e.playerId].total += 1;
    });

    const topOffenders = Object.entries(playerCards)
      .map(([playerId, cards]) => ({
        playerId,
        ...cards,
        player: (players ?? []).find((p: any) => p.id === playerId),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      yellow: yellowCards.length,
      red: redCards.length,
      total: yellowCards.length + redCards.length,
      fines: yellowCards.length * 25 + redCards.length * 75,
      topOffenders,
    };
  }, [matchEvents, players]);

  const getPlayerName = (playerId: string) => {
    const player = (players ?? []).find((p: any) => p.id === playerId);
    return player?.fullName || "Unknown Player";
  };

  const getTeamName = (teamId: string) => {
    const team = (teams ?? []).find((t: any) => t.id === teamId);
    return team?.name || "Unknown Team";
  };

  const getMatchInfo = (matchId: string) => {
    const match = (matches ?? []).find((m: any) => m.id === matchId);
    if (!match) return "Unknown Match";

    const home = (teams ?? []).find((t: any) => t.id === match.homeTeamId);
    const away = (teams ?? []).find((t: any) => t.id === match.awayTeamId);

    return `${home?.name || "Home"} vs ${away?.name || "Away"}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Text style={{ color: "#22C6D2", fontSize: 24 }}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900" }}>Cards & Discipline</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 4 }}>Track all yellow and red cards</Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1, backgroundColor: "#0A2238", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
              <Text style={{ color: "#9FB3C8", fontSize: 11 }}>Yellow Cards</Text>
              <Text style={{ color: "#F2D100", fontSize: 28, fontWeight: "900", marginTop: 4 }}>
                {stats.yellow}
              </Text>
              <Text style={{ color: "#9FB3C8", fontSize: 10, marginTop: 2 }}>
                ${(stats.yellow * 25).toFixed(2)} fines
              </Text>
            </View>

            <View style={{ flex: 1, backgroundColor: "#0A2238", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
              <Text style={{ color: "#9FB3C8", fontSize: 11 }}>Red Cards</Text>
              <Text style={{ color: "#FF3B30", fontSize: 28, fontWeight: "900", marginTop: 4 }}>
                {stats.red}
              </Text>
              <Text style={{ color: "#9FB3C8", fontSize: 10, marginTop: 2 }}>
                ${(stats.red * 75).toFixed(2)} fines
              </Text>
            </View>

            <View style={{ flex: 1, backgroundColor: "#0A2238", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
              <Text style={{ color: "#9FB3C8", fontSize: 11 }}>Total Fines</Text>
              <Text style={{ color: "#34C759", fontSize: 28, fontWeight: "900", marginTop: 4 }}>
                ${stats.fines.toFixed(2)}
              </Text>
              <Text style={{ color: "#9FB3C8", fontSize: 10, marginTop: 2 }}>
                {stats.total} cards
              </Text>
            </View>
          </View>
        </View>

        {/* Top Offenders */}
        {stats.topOffenders.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#EAF2FF", fontSize: 16, fontWeight: "900", marginBottom: 12 }}>
              ⚠️ Top Offenders
            </Text>
            <View style={{ backgroundColor: "#0A2238", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
              {stats.topOffenders.map((offender: any, index: number) => (
                <View
                  key={offender.playerId}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 10,
                    borderBottomWidth: index < stats.topOffenders.length - 1 ? 1 : 0,
                    borderBottomColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 14 }}>
                      {offender.player?.fullName || "Unknown"}
                    </Text>
                    <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                      {(teams ?? []).find((t: any) => t.id === offender.player?.teamId)?.name || "No Team"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                    {offender.yellow > 0 && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Text style={{ fontSize: 16 }}>🟨</Text>
                        <Text style={{ color: "#F2D100", fontWeight: "900" }}>{offender.yellow}</Text>
                      </View>
                    )}
                    {offender.red > 0 && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Text style={{ fontSize: 16 }}>🟥</Text>
                        <Text style={{ color: "#FF3B30", fontWeight: "900" }}>{offender.red}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Search & Filter */}
        <View style={{ marginBottom: 20 }}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by player or team..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={{
              backgroundColor: "#0A2238",
              color: "#EAF2FF",
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              marginBottom: 12,
            }}
          />

          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["ALL", "YELLOW", "RED"] as CardFilter[]).map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={{
                  flex: 1,
                  backgroundColor: filter === f ? "#22C6D2" : "#0A2238",
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: filter === f ? "#22C6D2" : "rgba(255,255,255,0.08)",
                }}
              >
                <Text style={{ color: filter === f ? "#061A2B" : "#EAF2FF", fontWeight: "900", fontSize: 13 }}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Card Events List */}
        <View>
          <Text style={{ color: "#EAF2FF", fontSize: 16, fontWeight: "900", marginBottom: 12 }}>
            Card History ({cardEvents.length})
          </Text>

          {cardEvents.length === 0 ? (
            <View style={{ backgroundColor: "#0A2238", padding: 20, borderRadius: 12, alignItems: "center" }}>
              <Text style={{ color: "#9FB3C8" }}>No cards found</Text>
            </View>
          ) : (
            cardEvents.map((event: any) => {
              const cardColor = event.type === "YELLOW" ? "#F2D100" : "#FF3B30";
              const cardIcon = event.type === "YELLOW" ? "🟨" : "🟥";
              const fineAmount = event.type === "YELLOW" ? "$25.00" : "$75.00";

              return (
                <View
                  key={event.id}
                  style={{
                    backgroundColor: "#0A2238",
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 10,
                    borderLeftWidth: 4,
                    borderLeftColor: cardColor,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <Text style={{ fontSize: 20 }}>{cardIcon}</Text>
                        <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                          {event.type} CARD
                        </Text>
                      </View>

                      <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 14, marginTop: 4 }}>
                        {getPlayerName(event.playerId)}
                      </Text>

                      <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                        {getTeamName(event.teamId)}
                      </Text>

                      <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>
                        {getMatchInfo(event.matchId)}
                      </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <View
                        style={{
                          backgroundColor: `${cardColor}20`,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 999,
                          marginBottom: 6,
                        }}
                      >
                        <Text style={{ color: cardColor, fontWeight: "900", fontSize: 14 }}>
                          {event.minute}'
                        </Text>
                      </View>
                      <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 14 }}>
                        {fineAmount}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}