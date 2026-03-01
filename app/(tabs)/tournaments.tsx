// app/(tabs)/tournaments.tsx - ENHANCED VERSION

import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { normalize, spacing } from "../../src/utils/responsive";

type FilterStatus = "ALL" | "OPEN" | "LIVE" | "COMPLETE" | "DRAFT";

export default function TournamentsTab() {
  const router = useRouter();
  const { tournaments, teams, players, activeLeagueId, can } = useAppStore() as any;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");

  const leagueTournaments = useMemo(() => {
    return (tournaments ?? [])
      .filter((t: any) => t.leagueId === activeLeagueId)
      .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [tournaments, activeLeagueId]);

  const filteredTournaments = useMemo(() => {
    let filtered = leagueTournaments;

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((t: any) => 
        (t.status ?? "DRAFT").toUpperCase() === statusFilter
      );
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((t: any) => 
        t.name?.toLowerCase().includes(query) ||
        t.location?.toLowerCase().includes(query) ||
        t.ageRuleLabel?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [leagueTournaments, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: leagueTournaments.length,
      open: leagueTournaments.filter((t: any) => (t.status ?? "DRAFT").toUpperCase() === "OPEN").length,
      live: leagueTournaments.filter((t: any) => (t.status ?? "DRAFT").toUpperCase() === "LIVE").length,
      complete: leagueTournaments.filter((t: any) => (t.status ?? "DRAFT").toUpperCase() === "COMPLETE").length,
    };
  }, [leagueTournaments]);

  const teamsCount = (tournamentId: string) =>
    (teams ?? []).filter((tm: any) => tm.tournamentId === tournamentId).length;

  const playersCount = (tournamentId: string) =>
    (players ?? []).filter((p: any) => p.tournamentId === tournamentId).length;

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "OPEN": return "#34C759";
      case "LIVE": return "#22C6D2";
      case "COMPLETE": return "#9FB3C8";
      default: return "#F2D100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "OPEN": return "✅";
      case "LIVE": return "🔴";
      case "COMPLETE": return "🏁";
      default: return "📝";
    }
  };

  const canManage = can("MANAGE_TOURNAMENTS");

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#0A2238",
        paddingTop: spacing.xl + 40,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.05)",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#F2D100", fontSize: normalize(24), fontWeight: "900" }}>
              Tournaments
            </Text>
            <Text style={{ color: "#9FB3C8", marginTop: 4, fontSize: normalize(13) }}>
              {stats.total} tournaments • {stats.open} open • {stats.live} live
            </Text>
          </View>

          {canManage && (
            <TouchableOpacity
              onPress={() => router.push("/tournaments/create")}
              style={{
                backgroundColor: "#F2D100",
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                borderRadius: normalize(12),
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text style={{ fontSize: normalize(18) }}>+</Text>
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: normalize(14) }}>
                Create
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View style={{
          backgroundColor: "#061A2B",
          borderRadius: normalize(12),
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.md,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
          marginBottom: spacing.md,
        }}>
          <Text style={{ fontSize: normalize(16), marginRight: spacing.sm }}>🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tournaments..."
            placeholderTextColor="#9FB3C8"
            style={{
              flex: 1,
              color: "#EAF2FF",
              paddingVertical: spacing.sm,
              fontSize: normalize(15),
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={{ color: "#9FB3C8", fontSize: normalize(18) }}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.xs }}
        >
          {(["ALL", "OPEN", "LIVE", "COMPLETE", "DRAFT"] as FilterStatus[]).map((status) => {
            const isActive = statusFilter === status;
            const count = status === "ALL" ? stats.total : 
                         status === "OPEN" ? stats.open :
                         status === "LIVE" ? stats.live :
                         status === "COMPLETE" ? stats.complete :
                         leagueTournaments.filter((t: any) => (t.status ?? "DRAFT").toUpperCase() === status).length;

            return (
              <TouchableOpacity
                key={status}
                onPress={() => setStatusFilter(status)}
                style={{
                  backgroundColor: isActive ? getStatusColor(status === "ALL" ? "LIVE" : status) : "rgba(255,255,255,0.05)",
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: normalize(10),
                  borderWidth: 1,
                  borderColor: isActive ? getStatusColor(status === "ALL" ? "LIVE" : status) : "rgba(255,255,255,0.1)",
                }}
              >
                <Text style={{
                  color: isActive ? "#061A2B" : "#9FB3C8",
                  fontWeight: "900",
                  fontSize: normalize(13),
                }}>
                  {status} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          padding: spacing.lg, 
          paddingBottom: spacing.huge,
          gap: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        {filteredTournaments.length > 0 ? (
          filteredTournaments.map((t: any) => {
            const count = teamsCount(t.id);
            const playerCount = playersCount(t.id);
            const status = (t.status ?? "DRAFT").toUpperCase();
            const statusColor = getStatusColor(status);
            const statusIcon = getStatusIcon(status);
            const spotsLeft = (t.maxTeams || 24) - count;

            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => router.push(`/tournaments/${t.id}`)}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    backgroundColor: "#0A2238",
                    borderRadius: normalize(16),
                    padding: spacing.md,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  {/* Header */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.sm }}>
                    <View style={{ flex: 1, marginRight: spacing.sm }}>
                      <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(18) }}>
                        {t.name}
                      </Text>
                      {t.location && (
                        <Text style={{ color: "#9FB3C8", marginTop: 4, fontSize: normalize(13) }}>
                          📍 {t.location}
                        </Text>
                      )}
                    </View>

                    <View style={{
                      backgroundColor: `${statusColor}20`,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 6,
                      borderRadius: normalize(8),
                      borderWidth: 1,
                      borderColor: `${statusColor}40`,
                    }}>
                      <Text style={{ color: statusColor, fontWeight: "900", fontSize: normalize(12) }}>
                        {statusIcon} {status}
                      </Text>
                    </View>
                  </View>

                  {/* Stats Row */}
                  <View style={{ flexDirection: "row", gap: spacing.md, marginBottom: spacing.sm }}>
                    <View style={{
                      flex: 1,
                      backgroundColor: "rgba(242,209,0,0.1)",
                      padding: spacing.sm,
                      borderRadius: normalize(10),
                    }}>
                      <Text style={{ color: "#F2D100", fontSize: normalize(20), fontWeight: "900" }}>
                        {count}
                      </Text>
                      <Text style={{ color: "#9FB3C8", fontSize: normalize(11), marginTop: 2 }}>
                        Teams
                      </Text>
                    </View>

                    <View style={{
                      flex: 1,
                      backgroundColor: "rgba(34,198,210,0.1)",
                      padding: spacing.sm,
                      borderRadius: normalize(10),
                    }}>
                      <Text style={{ color: "#22C6D2", fontSize: normalize(20), fontWeight: "900" }}>
                        {playerCount}
                      </Text>
                      <Text style={{ color: "#9FB3C8", fontSize: normalize(11), marginTop: 2 }}>
                        Players
                      </Text>
                    </View>

                    {status === "OPEN" && (
                      <View style={{
                        flex: 1,
                        backgroundColor: "rgba(52,199,89,0.1)",
                        padding: spacing.sm,
                        borderRadius: normalize(10),
                      }}>
                        <Text style={{ color: "#34C759", fontSize: normalize(20), fontWeight: "900" }}>
                          {spotsLeft}
                        </Text>
                        <Text style={{ color: "#9FB3C8", fontSize: normalize(11), marginTop: 2 }}>
                          Spots Left
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Meta Info */}
                  <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap", marginBottom: spacing.sm }}>
                    {t.ageRuleLabel && (
                      <View style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}>
                        <Text style={{ color: "#9FB3C8", fontSize: normalize(11), fontWeight: "900" }}>
                          {t.ageRuleLabel}
                        </Text>
                      </View>
                    )}
                    {t.startDate && (
                      <View style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}>
                        <Text style={{ color: "#9FB3C8", fontSize: normalize(11), fontWeight: "900" }}>
                          📅 {t.startDate}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: "row", gap: spacing.sm }}>
                    <TouchableOpacity
                      onPress={() => router.push(`/tournaments/${t.id}/teams`)}
                      style={{
                        flex: 1,
                        backgroundColor: "rgba(34,198,210,0.15)",
                        paddingVertical: spacing.sm,
                        borderRadius: normalize(10),
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: normalize(13) }}>
                        Teams
                      </Text>
                    </TouchableOpacity>

                    {status === "OPEN" && (
                      <TouchableOpacity
                        onPress={() => router.push(`/tournaments/${t.id}/register`)}
                        style={{
                          flex: 1,
                          backgroundColor: "rgba(52,199,89,0.15)",
                          paddingVertical: spacing.sm,
                          borderRadius: normalize(10),
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#34C759", fontWeight: "900", fontSize: normalize(13) }}>
                          Register
                        </Text>
                      </TouchableOpacity>
                    )}

                    {canManage && (
                      <TouchableOpacity
                        onPress={() => router.push(`/tournaments/${t.id}/admin`)}
                        style={{
                          flex: 1,
                          backgroundColor: "rgba(242,209,0,0.15)",
                          paddingVertical: spacing.sm,
                          borderRadius: normalize(10),
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: normalize(13) }}>
                          Manage
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={{
            backgroundColor: "#0A2238",
            borderRadius: normalize(16),
            padding: spacing.xl * 2,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}>
            <Text style={{ fontSize: normalize(48), marginBottom: spacing.md }}>
              {searchQuery || statusFilter !== "ALL" ? "🔍" : "🏆"}
            </Text>
            <Text style={{ color: "#EAF2FF", fontSize: normalize(18), fontWeight: "900", marginBottom: spacing.xs }}>
              {searchQuery || statusFilter !== "ALL" ? "No Tournaments Found" : "No Tournaments Yet"}
            </Text>
            <Text style={{ color: "#9FB3C8", textAlign: "center", fontSize: normalize(14), paddingHorizontal: spacing.lg }}>
              {searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your filters or search query"
                : "Create your first tournament for DMV, NEVT, or NVT"}
            </Text>
            {canManage && !searchQuery && statusFilter === "ALL" && (
              <TouchableOpacity
                onPress={() => router.push("/tournaments/create")}
                style={{
                  marginTop: spacing.lg,
                  backgroundColor: "#F2D100",
                  paddingHorizontal: spacing.xl,
                  paddingVertical: spacing.md,
                  borderRadius: normalize(12),
                }}
              >
                <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: normalize(16) }}>
                  Create Tournament
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}