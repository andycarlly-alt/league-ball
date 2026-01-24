// app/admin/index.tsx - ADMIN PORTAL (FIXED NAVIGATION)
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource } from "../../src/utils/logos";

type AdminTab = "DASHBOARD" | "FINANCE" | "CARDS" | "RULES" | "ACTIONS" | "ANALYTICS";

export default function AdminPortal() {
  const router = useRouter();
  const {
    currentUser,
    can,
    leagues,
    activeLeagueId,
    teams,
    players,
    matches,
    matchEvents,
    pendingPayments,
    tournaments,
    updateLeagueSettings,
    addPlayer,
    updateTeam,
  } = useAppStore() as any;

  const [activeTab, setActiveTab] = useState<AdminTab>("DASHBOARD");
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [selectedTeamForPlayer, setSelectedTeamForPlayer] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState("");

  // Check admin access - FIXED!
  const isAdmin = can("MANAGE_TOURNAMENTS") || currentUser?.role === "LEAGUE_ADMIN" || currentUser?.role === "TOURNAMENT_ADMIN";

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 20, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#FF3B30", fontSize: 24, fontWeight: "900", marginBottom: 16 }}>
          🔒 Access Denied
        </Text>
        <Text style={{ color: "#9FB3C8", textAlign: "center", marginBottom: 24 }}>
          You need admin permissions to access this portal
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          style={{ backgroundColor: "#22C6D2", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
        >
          <Text style={{ color: "#061A2B", fontWeight: "900" }}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeLeague = (leagues ?? []).find((l: any) => l.id === activeLeagueId);
  const leagueTeams = (teams ?? []).filter((t: any) => t.leagueId === activeLeagueId);
  const leaguePlayers = (players ?? []).filter((p: any) => {
    const team = leagueTeams.find((t: any) => t.id === p.teamId);
    return !!team;
  });
  const leagueMatches = (matches ?? []).filter((m: any) => m.leagueId === activeLeagueId);

  // Calculate metrics
  const totalRevenue = useMemo(() => {
    return (pendingPayments ?? [])
      .filter((p: any) => p.status === "PAID")
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  }, [pendingPayments]);

  const pendingRevenue = useMemo(() => {
    return (pendingPayments ?? [])
      .filter((p: any) => p.status === "PENDING")
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  }, [pendingPayments]);

  const yellowCards = useMemo(() => {
    return (matchEvents ?? []).filter((e: any) => e.type === "YELLOW").length;
  }, [matchEvents]);

  const redCards = useMemo(() => {
    return (matchEvents ?? []).filter((e: any) => e.type === "RED").length;
  }, [matchEvents]);

  const cardFines = useMemo(() => {
    return (pendingPayments ?? []).filter((p: any) => p.type === "CARD_FINE");
  }, [pendingPayments]);

  const upcomingMatches = useMemo(() => {
    return leagueMatches.filter((m: any) => m.status === "SCHEDULED").length;
  }, [leagueMatches]);

  const completedMatches = useMemo(() => {
    return leagueMatches.filter((m: any) => m.status === "FINAL").length;
  }, [leagueMatches]);

  // Tab button component
  const TabButton = ({ tab, label, icon }: { tab: AdminTab; label: string; icon: string }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      style={{
        flex: 1,
        backgroundColor: activeTab === tab ? "#F2D100" : "#0A2238",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: activeTab === tab ? "#F2D100" : "rgba(255,255,255,0.08)",
      }}
    >
      <Text style={{ fontSize: 20, marginBottom: 4 }}>{icon}</Text>
      <Text
        style={{
          color: activeTab === tab ? "#061A2B" : "#EAF2FF",
          fontWeight: "900",
          fontSize: 11,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Quick add player
  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      Alert.alert("Error", "Player name is required");
      return;
    }
    if (!selectedTeamForPlayer) {
      Alert.alert("Error", "Please select a team");
      return;
    }

    if (typeof addPlayer === "function") {
      addPlayer({
        fullName: newPlayerName,
        shirtNumber: newPlayerNumber || "00",
        teamId: selectedTeamForPlayer,
        position: "Player",
      });

      Alert.alert("Success", `${newPlayerName} added to team!`);
      setShowAddPlayerModal(false);
      setNewPlayerName("");
      setNewPlayerNumber("");
      setSelectedTeamForPlayer("");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#0A2238",
          padding: 16,
          borderBottomWidth: 2,
          borderBottomColor: "#F2D100",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900" }}>
              🎛️ Admin Portal
            </Text>
            <Text style={{ color: "#9FB3C8", marginTop: 4 }}>
              {currentUser?.role} • {activeLeague?.name || "League"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              padding: 12,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>✕ Close</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={{ padding: 12, backgroundColor: "#061A2B" }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TabButton tab="DASHBOARD" label="Dashboard" icon="📊" />
          <TabButton tab="FINANCE" label="Finance" icon="💰" />
          <TabButton tab="CARDS" label="Cards" icon="🟨" />
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <TabButton tab="RULES" label="Rules" icon="⚙️" />
          <TabButton tab="ACTIONS" label="Actions" icon="⚡" />
          <TabButton tab="ANALYTICS" label="Analytics" icon="📈" />
        </View>
      </View>

      {/* Tab Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* DASHBOARD TAB */}
        {activeTab === "DASHBOARD" && (
          <View style={{ gap: 16 }}>
            <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>📊 Dashboard Overview</Text>

            {/* Key Metrics */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#0A2238",
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(34,198,210,0.3)",
                }}
              >
                <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Revenue</Text>
                <Text style={{ color: "#22C6D2", fontSize: 28, fontWeight: "900", marginTop: 4 }}>
                  ${(totalRevenue / 100).toFixed(0)}
                </Text>
                <Text style={{ color: "#34C759", fontSize: 11, marginTop: 4 }}>
                  +${(pendingRevenue / 100).toFixed(0)} pending
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: "#0A2238",
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(242,209,0,0.3)",
                }}
              >
                <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Cards</Text>
                <Text style={{ color: "#F2D100", fontSize: 28, fontWeight: "900", marginTop: 4 }}>
                  {yellowCards + redCards}
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4 }}>
                  {yellowCards}🟨 {redCards}🟥
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#0A2238",
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Teams</Text>
                <Text style={{ color: "#EAF2FF", fontSize: 28, fontWeight: "900", marginTop: 4 }}>
                  {leagueTeams.length}
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4 }}>
                  {leaguePlayers.length} players
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: "#0A2238",
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Matches</Text>
                <Text style={{ color: "#EAF2FF", fontSize: 28, fontWeight: "900", marginTop: 4 }}>
                  {leagueMatches.length}
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4 }}>
                  {upcomingMatches} upcoming
                </Text>
              </View>
            </View>

            {/* Recent Activity */}
            <View
              style={{
                backgroundColor: "#0A2238",
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ color: "#EAF2FF", fontSize: 16, fontWeight: "900", marginBottom: 12 }}>
                Recent Activity
              </Text>
              <View style={{ gap: 8 }}>
                <View
                  style={{
                    backgroundColor: "#0B2842",
                    padding: 12,
                    borderRadius: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: "#34C759",
                  }}
                >
                  <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Match Completed</Text>
                  <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>
                    {completedMatches} matches finished
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#0B2842",
                    padding: 12,
                    borderRadius: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: "#F2D100",
                  }}
                >
                  <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                    {cardFines.filter((f: any) => f.status === "PENDING").length} Pending Fines
                  </Text>
                  <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>
                    ${(cardFines.filter((f: any) => f.status === "PENDING").reduce((sum: number, f: any) => sum + f.amount, 0) / 100).toFixed(2)} outstanding
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Stats */}
            <View
              style={{
                backgroundColor: "#0A2238",
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ color: "#EAF2FF", fontSize: 16, fontWeight: "900", marginBottom: 12 }}>
                League Stats
              </Text>
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#9FB3C8" }}>Active Tournaments</Text>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{(tournaments ?? []).length}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#9FB3C8" }}>Total Goals Scored</Text>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                    {(matchEvents ?? []).filter((e: any) => e.type === "GOAL").length}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#9FB3C8" }}>Avg Goals/Match</Text>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                    {completedMatches > 0
                      ? ((matchEvents ?? []).filter((e: any) => e.type === "GOAL").length / completedMatches).toFixed(1)
                      : "0.0"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* FINANCE TAB */}
        {activeTab === "FINANCE" && (
          <View style={{ gap: 16 }}>
            <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>💰 Financial Management</Text>

            {/* Revenue Overview */}
            <View
              style={{
                backgroundColor: "#0A2238",
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(34,198,210,0.3)",
              }}
            >
              <Text style={{ color: "#22C6D2", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
                Revenue Breakdown
              </Text>
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ color: "#9FB3C8" }}>Team Registrations</Text>
                  <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 18 }}>
                    ${((pendingPayments ?? [])
                      .filter((p: any) => p.type === "TEAM_REGISTRATION")
                      .reduce((sum: number, p: any) => sum + p.amount, 0) / 100).toFixed(2)}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ color: "#9FB3C8" }}>Card Fines</Text>
                  <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18 }}>
                    ${(cardFines.reduce((sum: number, f: any) => sum + f.amount, 0) / 100).toFixed(2)}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ color: "#9FB3C8" }}>Player Fees</Text>
                  <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 18 }}>
                    ${((pendingPayments ?? [])
                      .filter((p: any) => p.type === "PLAYER_FEE")
                      .reduce((sum: number, p: any) => sum + p.amount, 0) / 100).toFixed(2)}
                  </Text>
                </View>
                <View
                  style={{
                    marginTop: 8,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: "rgba(255,255,255,0.1)",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Total Collected</Text>
                  <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 20 }}>
                    ${(totalRevenue / 100).toFixed(2)}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#9FB3C8" }}>Pending</Text>
                  <Text style={{ color: "#FF3B30", fontWeight: "900", fontSize: 16 }}>
                    ${(pendingRevenue / 100).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Pending Payments */}
            <View
              style={{
                backgroundColor: "#0A2238",
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ color: "#EAF2FF", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
                Pending Payments ({(pendingPayments ?? []).filter((p: any) => p.status === "PENDING").length})
              </Text>
              <ScrollView style={{ maxHeight: 400 }}>
                {(pendingPayments ?? [])
                  .filter((p: any) => p.status === "PENDING")
                  .slice(0, 10)
                  .map((payment: any) => (
                    <View
                      key={payment.id}
                      style={{
                        backgroundColor: "#0B2842",
                        padding: 12,
                        borderRadius: 12,
                        marginBottom: 8,
                        borderLeftWidth: 4,
                        borderLeftColor: payment.type === "CARD_FINE" ? "#F2D100" : "#22C6D2",
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                        <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{payment.teamName}</Text>
                        <Text style={{ color: "#F2D100", fontWeight: "900" }}>
                          ${(payment.amount / 100).toFixed(2)}
                        </Text>
                      </View>
                      <Text style={{ color: "#9FB3C8", fontSize: 12 }}>
                        {payment.type.replace(/_/g, " ")} • Due:{" "}
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </Text>
                      {payment.playerName && (
                        <Text style={{ color: "#22C6D2", fontSize: 12, marginTop: 4 }}>
                          Player: {payment.playerName}
                        </Text>
                      )}
                    </View>
                  ))}
              </ScrollView>
            </View>

            {/* Export Options */}
            <TouchableOpacity
              style={{
                backgroundColor: "#34C759",
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>
                📄 Export Financial Report
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CARDS TAB */}
        {activeTab === "CARDS" && (
          <View style={{ gap: 16 }}>
            <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>🟨 Card Tracking</Text>

            {/* Card Summary */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#0A2238",
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: "#F2D100",
                }}
              >
                <Text style={{ fontSize: 32, textAlign: "center" }}>🟨</Text>
                <Text
                  style={{
                    color: "#F2D100",
                    fontSize: 32,
                    fontWeight: "900",
                    textAlign: "center",
                    marginTop: 8,
                  }}
                >
                  {yellowCards}
                </Text>
                <Text style={{ color: "#9FB3C8", textAlign: "center", marginTop: 4 }}>Yellow Cards</Text>
                <Text style={{ color: "#9FB3C8", textAlign: "center", fontSize: 12, marginTop: 4 }}>
                  ${((yellowCards * 2500) / 100).toFixed(2)} in fines
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: "#0A2238",
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: "#FF3B30",
                }}
              >
                <Text style={{ fontSize: 32, textAlign: "center" }}>🟥</Text>
                <Text
                  style={{
                    color: "#FF3B30",
                    fontSize: 32,
                    fontWeight: "900",
                    textAlign: "center",
                    marginTop: 8,
                  }}
                >
                  {redCards}
                </Text>
                <Text style={{ color: "#9FB3C8", textAlign: "center", marginTop: 4 }}>Red Cards</Text>
                <Text style={{ color: "#9FB3C8", textAlign: "center", fontSize: 12, marginTop: 4 }}>
                  ${((redCards * 7500) / 100).toFixed(2)} in fines
                </Text>
              </View>
            </View>

            {/* Card List */}
            <View
              style={{
                backgroundColor: "#0A2238",
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ color: "#EAF2FF", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
                Recent Cards
              </Text>
              <ScrollView style={{ maxHeight: 500 }}>
                {(matchEvents ?? [])
                  .filter((e: any) => e.type === "YELLOW" || e.type === "RED")
                  .slice()
                  .reverse()
                  .slice(0, 20)
                  .map((card: any) => {
                    const player = (players ?? []).find((p: any) => p.id === card.playerId);
                    const team = (teams ?? []).find((t: any) => t.id === card.teamId);
                    return (
                      <View
                        key={card.id}
                        style={{
                          backgroundColor: "#0B2842",
                          padding: 12,
                          borderRadius: 12,
                          marginBottom: 8,
                          borderLeftWidth: 4,
                          borderLeftColor: card.type === "YELLOW" ? "#F2D100" : "#FF3B30",
                        }}
                      >
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <View>
                            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                              {card.type === "YELLOW" ? "🟨" : "🟥"} {player?.fullName || "Unknown"}
                            </Text>
                            <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>
                              {team?.name || "Unknown Team"}
                            </Text>
                          </View>
                          <View style={{ alignItems: "flex-end" }}>
                            <Text
                              style={{
                                color: card.type === "YELLOW" ? "#F2D100" : "#FF3B30",
                                fontWeight: "900",
                              }}
                            >
                              ${card.type === "YELLOW" ? "25.00" : "75.00"}
                            </Text>
                            <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>
                              {card.minute}'
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
              </ScrollView>
            </View>
          </View>
        )}

        {/* RULES TAB */}
        {activeTab === "RULES" && (
          <View style={{ gap: 16 }}>
            <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>⚙️ League Rules & Settings</Text>
            <Text style={{ color: "#9FB3C8", textAlign: "center", paddingVertical: 40 }}>
              Settings panel coming in next update...
            </Text>
          </View>
        )}

        {/* ACTIONS TAB */}
        {activeTab === "ACTIONS" && (
          <View style={{ gap: 16 }}>
            <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>⚡ Quick Actions</Text>

            {/* Quick Add Player */}
            <TouchableOpacity
              onPress={() => setShowAddPlayerModal(true)}
              style={{
                backgroundColor: "#34C759",
                padding: 16,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 24 }}>👤</Text>
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>Quick Add Player</Text>
            </TouchableOpacity>

            <Text style={{ color: "#9FB3C8", textAlign: "center", paddingVertical: 20 }}>
              More quick actions coming in next update...
            </Text>
          </View>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "ANALYTICS" && (
          <View style={{ gap: 16 }}>
            <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>📈 Analytics & Reports</Text>
            <Text style={{ color: "#9FB3C8", textAlign: "center", paddingVertical: 40 }}>
              Analytics dashboard coming in next update...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Add Player Modal */}
      <Modal
        visible={showAddPlayerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddPlayerModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: "#0A2238",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              maxHeight: "80%",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
              <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>👤 Quick Add Player</Text>
              <TouchableOpacity onPress={() => setShowAddPlayerModal(false)}>
                <Text style={{ color: "#9FB3C8", fontSize: 32 }}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 20 }}>
              {/* Player Name */}
              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>Player Name *</Text>
                <TextInput
                  value={newPlayerName}
                  onChangeText={setNewPlayerName}
                  placeholder="John Smith"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={{
                    backgroundColor: "#0B2842",
                    color: "#EAF2FF",
                    padding: 14,
                    borderRadius: 12,
                    fontWeight: "900",
                    fontSize: 16,
                  }}
                />
              </View>

              {/* Shirt Number */}
              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>Shirt Number</Text>
                <TextInput
                  value={newPlayerNumber}
                  onChangeText={setNewPlayerNumber}
                  placeholder="10"
                  keyboardType="number-pad"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={{
                    backgroundColor: "#0B2842",
                    color: "#EAF2FF",
                    padding: 14,
                    borderRadius: 12,
                    fontWeight: "900",
                    fontSize: 16,
                  }}
                />
              </View>

              {/* Team Selection */}
              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>Select Team *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {leagueTeams.map((team: any) => (
                      <TouchableOpacity
                        key={team.id}
                        onPress={() => setSelectedTeamForPlayer(team.id)}
                        style={{
                          backgroundColor: selectedTeamForPlayer === team.id ? "#34C759" : "#0B2842",
                          padding: 14,
                          borderRadius: 12,
                          minWidth: 120,
                          alignItems: "center",
                          borderWidth: 2,
                          borderColor:
                            selectedTeamForPlayer === team.id ? "#34C759" : "rgba(255,255,255,0.1)",
                        }}
                      >
                        <Image
                          source={getLogoSource(team.logoKey)}
                          style={{ width: 40, height: 40, borderRadius: 12, marginBottom: 8 }}
                        />
                        <Text
                          style={{
                            color: selectedTeamForPlayer === team.id ? "#061A2B" : "#EAF2FF",
                            fontWeight: "900",
                            fontSize: 12,
                            textAlign: "center",
                          }}
                        >
                          {team.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </ScrollView>

            {/* Add Button */}
            <TouchableOpacity
              onPress={handleAddPlayer}
              disabled={!newPlayerName || !selectedTeamForPlayer}
              style={{
                backgroundColor:
                  newPlayerName && selectedTeamForPlayer ? "#34C759" : "rgba(255,255,255,0.1)",
                padding: 16,
                borderRadius: 14,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  color: newPlayerName && selectedTeamForPlayer ? "#061A2B" : "#9FB3C8",
                  fontWeight: "900",
                  fontSize: 18,
                }}
              >
                Add Player
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}