// app/tournaments/[id]/admin.tsx - FIXED VERSION

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../../src/state/AppStore";
import { normalize, spacing } from "../../../src/utils/responsive";

export default function TournamentAdminScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tournamentId = String(id ?? "");

  const {
    tournaments,
    teams,
    players,
    transferLogs,
    toggleRosterLock,
    matches,
    pendingPayments,
    can,
  } = useAppStore() as any;

  const tournament = useMemo(
    () => tournaments.find((t: any) => t.id === tournamentId),
    [tournaments, tournamentId]
  );

  const tTeams = useMemo(
    () => (teams ?? []).filter((t: any) => t.tournamentId === tournamentId),
    [teams, tournamentId]
  );

  const tPlayers = useMemo(
    () => (players ?? []).filter((p: any) => p.tournamentId === tournamentId),
    [players, tournamentId]
  );

  const logs = useMemo(
    () => (transferLogs ?? []).filter((l: any) => l.tournamentId === tournamentId),
    [transferLogs, tournamentId]
  );

  const tMatches = useMemo(
    () => (matches ?? []).filter((m: any) => m.tournamentId === tournamentId),
    [matches, tournamentId]
  );

  const tPayments = useMemo(
    () => (pendingPayments ?? []).filter((p: any) => p.tournamentId === tournamentId),
    [pendingPayments, tournamentId]
  );

  const verifiedCount = tPlayers.filter((p: any) => p.verified).length;
  const pendingCount = tPlayers.filter((p: any) => !p.verified).length;
  const paidTeams = tTeams.filter((t: any) => !tPayments.find((p: any) => p.teamId === t.id && p.status === "PENDING")).length;
  const pendingPaymentsCount = tPayments.filter((p: any) => p.status === "PENDING").length; // ✅ RENAMED

  const teamName = (teamId: string) => tTeams.find((t: any) => t.id === teamId)?.name ?? "Team";
  const playerName = (playerId: string) => tPlayers.find((p: any) => p.id === playerId)?.fullName ?? "Player";

  const canManage = can("MANAGE_TOURNAMENTS");

  if (!canManage) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: "#EAF2FF", marginTop: 20 }}>Access denied</Text>
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: "#EAF2FF", marginTop: 20 }}>Tournament not found</Text>
      </View>
    );
  }

  const handleToggleRosterLock = () => {
    const action = tournament.rosterLocked ? "unlock" : "lock";
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Rosters?`,
      tournament.rosterLocked
        ? "This will allow teams to add players and make transfers again."
        : "This will prevent teams from adding new players or making transfers. Use this after registration closes.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: () => {
            toggleRosterLock(tournamentId);
            Alert.alert(
              "✅ Updated",
              `Rosters are now ${action}ed.`
            );
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#0A2238",
        paddingTop: spacing.xl + 40,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: normalize(20),
        borderBottomRightRadius: normalize(20),
      }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}
        >
          <View style={{ backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
            <Text style={{ color: "#22C6D2", fontSize: 16, fontWeight: "900" }}>← Back</Text>
          </View>
        </TouchableOpacity>

        <Text style={{ color: "#F2D100", fontSize: normalize(24), fontWeight: "900", textAlign: "center" }}>
          Tournament Dashboard
        </Text>
        <Text style={{ color: "#9FB3C8", textAlign: "center", fontSize: normalize(13), marginTop: 4 }}>
          {tournament.name}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.huge,
          gap: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats Grid */}
        <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
          {/* Teams */}
          <View style={{
            flex: 1,
            minWidth: "48%",
            backgroundColor: "#0A2238",
            borderRadius: normalize(16),
            padding: spacing.md,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}>
            <Text style={{ color: "#F2D100", fontSize: normalize(32), fontWeight: "900" }}>
              {tTeams.length}
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: normalize(12), marginTop: 4 }}>
              Teams Registered
            </Text>
          </View>

          {/* Players */}
          <View style={{
            flex: 1,
            minWidth: "48%",
            backgroundColor: "#0A2238",
            borderRadius: normalize(16),
            padding: spacing.md,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}>
            <Text style={{ color: "#22C6D2", fontSize: normalize(32), fontWeight: "900" }}>
              {tPlayers.length}
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: normalize(12), marginTop: 4 }}>
              Total Players
            </Text>
          </View>

          {/* Verified */}
          <View style={{
            flex: 1,
            minWidth: "48%",
            backgroundColor: "#0A2238",
            borderRadius: normalize(16),
            padding: spacing.md,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}>
            <Text style={{ color: "#34C759", fontSize: normalize(32), fontWeight: "900" }}>
              {verifiedCount}
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: normalize(12), marginTop: 4 }}>
              Verified Players
            </Text>
          </View>

          {/* Pending */}
          <View style={{
            flex: 1,
            minWidth: "48%",
            backgroundColor: "#0A2238",
            borderRadius: normalize(16),
            padding: spacing.md,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}>
            <Text style={{ color: "#FF3B30", fontSize: normalize(32), fontWeight: "900" }}>
              {pendingCount}
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: normalize(12), marginTop: 4 }}>
              Pending Verification
            </Text>
          </View>
        </View>

        {/* Roster Lock Control */}
        <TouchableOpacity
          onPress={handleToggleRosterLock}
          style={{
            backgroundColor: tournament.rosterLocked ? "#FF3B30" : "#34C759",
            borderRadius: normalize(16),
            padding: spacing.lg,
            borderWidth: 2,
            borderColor: tournament.rosterLocked ? "#8B0000" : "#2A8A3D",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#FFF", fontSize: normalize(18), fontWeight: "900", marginBottom: 6 }}>
                {tournament.rosterLocked ? "🔒 Rosters Locked" : "🔓 Rosters Open"}
              </Text>
              <Text style={{ color: "#FFF", fontSize: normalize(13) }}>
                {tournament.rosterLocked
                  ? "Teams cannot add players or transfer. Tap to unlock."
                  : "Teams can add players and transfer. Tap to lock."}
              </Text>
            </View>
            <Text style={{ color: "#FFF", fontSize: normalize(24) }}>
              {tournament.rosterLocked ? "→" : "→"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Payments Status */}
        {pendingPaymentsCount > 0 && (
          <View style={{
            backgroundColor: "rgba(255,59,48,0.1)",
            borderRadius: normalize(16),
            padding: spacing.md,
            borderWidth: 2,
            borderColor: "#FF3B30",
          }}>
            <Text style={{ color: "#FF3B30", fontSize: normalize(16), fontWeight: "900", marginBottom: 6 }}>
              ⚠️ Pending Payments
            </Text>
            <Text style={{ color: "#EAF2FF", fontSize: normalize(14) }}>
              {pendingPaymentsCount} team{pendingPaymentsCount !== 1 ? "s" : ""} have outstanding registration fees
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: normalize(12), marginTop: 6 }}>
              {paidTeams}/{tTeams.length} teams fully paid
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View>
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(18), marginBottom: spacing.sm }}>
            Quick Actions
          </Text>
          <View style={{ gap: spacing.sm }}>
            <TouchableOpacity
              onPress={() => router.push(`/tournaments/${tournamentId}/settings`)}
              style={{
                backgroundColor: "#0A2238",
                borderRadius: normalize(12),
                padding: spacing.md,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Text style={{ fontSize: normalize(20) }}>⚙️</Text>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(15) }}>
                  Tournament Settings
                </Text>
              </View>
              <Text style={{ color: "#22C6D2", fontSize: normalize(16) }}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/tournaments/${tournamentId}/teams`)}
              style={{
                backgroundColor: "#0A2238",
                borderRadius: normalize(12),
                padding: spacing.md,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Text style={{ fontSize: normalize(20) }}>👥</Text>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(15) }}>
                  View All Teams ({tTeams.length})
                </Text>
              </View>
              <Text style={{ color: "#22C6D2", fontSize: normalize(16) }}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/tournaments/${tournamentId}`)}
              style={{
                backgroundColor: "#0A2238",
                borderRadius: normalize(12),
                padding: spacing.md,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Text style={{ fontSize: normalize(20) }}>📊</Text>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(15) }}>
                  Public Tournament Page
                </Text>
              </View>
              <Text style={{ color: "#22C6D2", fontSize: normalize(16) }}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transfer Log */}
        <View>
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(18), marginBottom: spacing.sm }}>
            Transfer Log ({logs.length})
          </Text>
          <View style={{
            backgroundColor: "rgba(34,198,210,0.1)",
            borderRadius: normalize(12),
            padding: spacing.md,
            borderWidth: 1,
            borderColor: "rgba(34,198,210,0.3)",
            marginBottom: spacing.sm,
          }}>
            <Text style={{ color: "#22C6D2", fontWeight: "900", marginBottom: 6 }}>
              📋 Audit Trail
            </Text>
            <Text style={{ color: "#EAF2FF", fontSize: normalize(13), lineHeight: 18 }}>
              Complete record of all player transfers for roster integrity. Essential for NVT compliance.
            </Text>
          </View>

          {logs.length > 0 ? (
            <View style={{ gap: spacing.sm }}>
              {logs.slice(0, 10).map((l: any) => (
                <View
                  key={l.id}
                  style={{
                    backgroundColor: "#0A2238",
                    borderRadius: normalize(12),
                    padding: spacing.md,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(15) }}>
                    {playerName(l.playerId)}
                  </Text>
                  <View style={{ flexDirection: "row", gap: spacing.xs, marginTop: 6, flexWrap: "wrap" }}>
                    <Text style={{ color: "#FF3B30", fontSize: normalize(13) }}>
                      From: {teamName(l.fromTeamId)}
                    </Text>
                    <Text style={{ color: "#9FB3C8", fontSize: normalize(13) }}>→</Text>
                    <Text style={{ color: "#34C759", fontSize: normalize(13) }}>
                      To: {teamName(l.toTeamId)}
                    </Text>
                  </View>
                  <Text style={{ color: "#22C6D2", marginTop: 6, fontSize: normalize(12) }}>
                    By {l.by} • {new Date(l.createdAt).toLocaleString()}
                  </Text>
                </View>
              ))}
              {logs.length > 10 && (
                <Text style={{ color: "#9FB3C8", textAlign: "center", fontSize: normalize(12) }}>
                  Showing 10 of {logs.length} transfers
                </Text>
              )}
            </View>
          ) : (
            <View style={{
              backgroundColor: "#0A2238",
              borderRadius: normalize(12),
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              alignItems: "center",
            }}>
              <Text style={{ fontSize: normalize(32), marginBottom: spacing.sm }}>📝</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(15) }}>
                No Transfers Yet
              </Text>
              <Text style={{ color: "#9FB3C8", marginTop: 6, textAlign: "center", fontSize: normalize(13) }}>
                All player movements will be logged here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}