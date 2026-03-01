// app/admin/index.tsx - ENHANCED ADMIN PORTAL WITH BEREAVEMENT
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource } from "../../src/utils/logos";

type AdminTab = "DASHBOARD" | "FINANCE" | "CARDS" | "CHECK_INS" | "REPORTS" | "ACTIONS" | "ANALYTICS";

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
    bereavementEnrollments,
    bereavementEvents,
    updateLeagueSettings,
    addPlayer,
    updateTeam,
  } = useAppStore() as any;

  const [activeTab, setActiveTab] = useState<AdminTab>("DASHBOARD");
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [selectedTeamForPlayer, setSelectedTeamForPlayer] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState("");
  
  // Player search state
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  
  // Match form state
  const [selectedMatchForForm, setSelectedMatchForForm] = useState<any>(null);

  // Check admin access
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

  // ✅ BEREAVEMENT STATS
  const bereavementStats = useMemo(() => {
    const enrollments = bereavementEnrollments || [];
    const events = bereavementEvents || [];
    return {
      totalEnrollments: enrollments.length,
      pendingEnrollments: enrollments.filter((e: any) => e.status === "PENDING").length,
      activeEvents: events.filter((e: any) => e.status === "ACTIVE").length,
    };
  }, [bereavementEnrollments, bereavementEvents]);

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

  // Calculate check-in stats
  const totalCheckIns = useMemo(() => {
    return (players ?? []).reduce((sum: number, p: any) => sum + (p.checkInHistory?.length || 0), 0);
  }, [players]);

  const todaysCheckIns = useMemo(() => {
    const today = new Date().toDateString();
    return (players ?? []).reduce((sum: number, p: any) => {
      const todayCheckIns = (p.checkInHistory || []).filter((c: any) => 
        new Date(c.timestamp).toDateString() === today
      ).length;
      return sum + todayCheckIns;
    }, 0);
  }, [players]);

  // Player search functionality
  const searchResults = useMemo(() => {
    if (!playerSearchQuery.trim()) return [];
    
    const query = playerSearchQuery.toLowerCase();
    return leaguePlayers.filter((player: any) => {
      const team = leagueTeams.find((t: any) => t.id === player.teamId);
      return (
        player.fullName?.toLowerCase().includes(query) ||
        player.shirtNumber?.toString().includes(query) ||
        team?.name?.toLowerCase().includes(query) ||
        player.position?.toLowerCase().includes(query)
      );
    }).slice(0, 20);
  }, [playerSearchQuery, leaguePlayers, leagueTeams]);

  // Generate match form
  const generateMatchForm = (match: any) => {
    const homeTeam = teams.find((t: any) => t.name === match.homeTeam);
    const awayTeam = teams.find((t: any) => t.name === match.awayTeam);
    const homePlayersOnMatch = (players ?? []).filter((p: any) => p.teamId === homeTeam?.id);
    const awayPlayersOnMatch = (players ?? []).filter((p: any) => p.teamId === awayTeam?.id);
    const matchEventsForMatch = (matchEvents ?? []).filter((e: any) => e.matchId === match.id);

    const formData = {
      match: {
        id: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        kickoff: match.kickoffAt ? new Date(match.kickoffAt).toLocaleString() : 'TBD',
        venue: match.venue || 'TBD',
        status: match.status,
        homeScore: match.homeScore || 0,
        awayScore: match.awayScore || 0,
      },
      homeRoster: homePlayersOnMatch.map((p: any) => ({
        name: p.fullName,
        number: p.shirtNumber,
        position: p.position,
        verified: p.documentVerified,
        checkedIn: (p.checkInHistory || []).some((c: any) => c.matchId === match.id && c.approved),
      })),
      awayRoster: awayPlayersOnMatch.map((p: any) => ({
        name: p.fullName,
        number: p.shirtNumber,
        position: p.position,
        verified: p.documentVerified,
        checkedIn: (p.checkInHistory || []).some((c: any) => c.matchId === match.id && c.approved),
      })),
      events: matchEventsForMatch.map((e: any) => {
        const player = players.find((p: any) => p.id === e.playerId);
        return {
          minute: e.minute,
          type: e.type,
          player: player?.fullName || 'Unknown',
          team: e.teamId === homeTeam?.id ? 'Home' : 'Away',
        };
      }),
      stats: {
        totalGoals: matchEventsForMatch.filter((e: any) => e.type === 'GOAL').length,
        yellowCards: matchEventsForMatch.filter((e: any) => e.type === 'YELLOW').length,
        redCards: matchEventsForMatch.filter((e: any) => e.type === 'RED').length,
        homeCheckIns: homePlayersOnMatch.filter((p: any) => 
          (p.checkInHistory || []).some((c: any) => c.matchId === match.id && c.approved)
        ).length,
        awayCheckIns: awayPlayersOnMatch.filter((p: any) => 
          (p.checkInHistory || []).some((c: any) => c.matchId === match.id && c.approved)
        ).length,
      }
    };

    return formData;
  };

  const exportMatchForm = (match: any) => {
    const formData = generateMatchForm(match);
    
    const formText = `
═══════════════════════════════════════
          OFFICIAL MATCH FORM
          ${activeLeague?.name || 'NVT VETERANS LEAGUE'}
═══════════════════════════════════════

Match ID: ${formData.match.id}
Date/Time: ${formData.match.kickoff}
Venue: ${formData.match.venue}
Status: ${formData.match.status}

TEAMS:
${formData.match.homeTeam} vs ${formData.match.awayTeam}

${formData.match.status === 'FINAL' ? `FINAL SCORE:
${formData.match.homeTeam}: ${formData.match.homeScore}
${formData.match.awayTeam}: ${formData.match.awayScore}` : 'Match not yet completed'}

═══════════════════════════════════════
HOME TEAM ROSTER: ${formData.match.homeTeam}
═══════════════════════════════════════
${'#'.padEnd(4)}${'Name'.padEnd(26)}${'Pos'.padEnd(13)}${'✓'.padEnd(5)}Check-In
${formData.homeRoster.map((p: any) => 
  `${('#' + p.number).padEnd(4)}${p.name.padEnd(26)}${p.position.padEnd(13)}${(p.verified ? '✓' : '✗').padEnd(5)}${p.checkedIn ? '✓' : '✗'}`
).join('\n')}

Total Players: ${formData.homeRoster.length}
Checked In: ${formData.stats.homeCheckIns}

═══════════════════════════════════════
AWAY TEAM ROSTER: ${formData.match.awayTeam}
═══════════════════════════════════════
${'#'.padEnd(4)}${'Name'.padEnd(26)}${'Pos'.padEnd(13)}${'✓'.padEnd(5)}Check-In
${formData.awayRoster.map((p: any) => 
  `${('#' + p.number).padEnd(4)}${p.name.padEnd(26)}${p.position.padEnd(13)}${(p.verified ? '✓' : '✗').padEnd(5)}${p.checkedIn ? '✓' : '✗'}`
).join('\n')}

Total Players: ${formData.awayRoster.length}
Checked In: ${formData.stats.awayCheckIns}

═══════════════════════════════════════
MATCH EVENTS
═══════════════════════════════════════
${formData.events.length > 0 ? formData.events.map((e: any) => 
  `${(e.minute + "'").padEnd(5)} ${e.type.padEnd(10)} ${e.player.padEnd(25)} (${e.team})`
).join('\n') : 'No events recorded'}

═══════════════════════════════════════
Generated: ${new Date().toLocaleString()}
NVT Veterans League Management System
    `.trim();

    Alert.alert(
      '📋 Match Form Generated',
      'Form ready for export.',
      [
        { text: 'Cancel' },
        {
          text: 'View Details',
          onPress: () => {
            console.log(formText);
            setSelectedMatchForForm(formData);
          }
        },
        {
          text: 'Copy Text',
          onPress: () => {
            console.log('Match Form Text:\n', formText);
            Alert.alert('✅ Copied', 'Form text logged to console');
          }
        }
      ]
    );
  };

  const exportAllMatchForms = () => {
    const allForms = leagueMatches.map((match: any) => generateMatchForm(match));
    
    Alert.alert(
      '📦 Export All Match Forms',
      `Ready to export ${allForms.length} match forms.`,
      [
        { text: 'Cancel' },
        {
          text: 'Show Summary',
          onPress: () => {
            Alert.alert(
              '✅ Forms Ready', 
              `${allForms.length} forms prepared:\n\n` +
              `Completed: ${allForms.filter(f => f.match.status === 'FINAL').length}\n` +
              `Upcoming: ${allForms.filter(f => f.match.status === 'SCHEDULED').length}\n` +
              `Live: ${allForms.filter(f => f.match.status === 'LIVE').length}`
            );
          }
        }
      ]
    );
  };

  const exportPlayerSearch = () => {
    const csvData = [
      ['Name', 'Number', 'Team', 'Position', 'Verified', 'Total Check-Ins', 'Goals'].join(','),
      ...searchResults.map((p: any) => {
        const team = leagueTeams.find((t: any) => t.id === p.teamId);
        const goals = (matchEvents ?? []).filter((e: any) => e.playerId === p.id && e.type === 'GOAL').length;
        return [
          p.fullName,
          p.shirtNumber,
          team?.name || 'Unknown',
          p.position,
          p.documentVerified ? 'Yes' : 'No',
          p.checkInHistory?.length || 0,
          goals
        ].join(',');
      })
    ].join('\n');

    Alert.alert(
      '📄 Export Player Data',
      `Generated CSV with ${searchResults.length} players.`,
      [
        { text: 'OK' },
        {
          text: 'Copy Data',
          onPress: () => {
            console.log('Player CSV Data:\n', csvData);
            Alert.alert('✅ Data Copied', 'CSV data logged to console');
          }
        }
      ]
    );
  };

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
          <TabButton tab="CHECK_INS" label="Check-Ins" icon="📸" />
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <TabButton tab="REPORTS" label="Reports" icon="📋" />
          <TabButton tab="ACTIONS" label="Actions" icon="⚡" />
          <TabButton tab="ANALYTICS" label="Analytics" icon="📈" />
        </View>
      </View>

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

            {/* ✅✅✅ BEREAVEMENT STAT CARD ✅✅✅ */}
            <View
              style={{
                backgroundColor: "#0A2238",
                padding: 16,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: "rgba(255,59,48,0.3)",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ color: "#FF3B30", fontSize: 18, fontWeight: "900" }}>
                  🏥 Bereavement Fund
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/admin/bereavement')}
                  style={{
                    backgroundColor: "#FF3B30",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 12 }}>
                    Manage →
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#9FB3C8", fontSize: 11 }}>Total Enrolled</Text>
                  <Text style={{ color: "#EAF2FF", fontSize: 24, fontWeight: "900", marginTop: 4 }}>
                    {bereavementStats.totalEnrollments}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#9FB3C8", fontSize: 11 }}>Pending Approval</Text>
                  <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900", marginTop: 4 }}>
                    {bereavementStats.pendingEnrollments}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#9FB3C8", fontSize: 11 }}>Active Events</Text>
                  <Text style={{ color: "#FF3B30", fontSize: 24, fontWeight: "900", marginTop: 4 }}>
                    {bereavementStats.activeEvents}
                  </Text>
                </View>
              </View>
            </View>
            {/* ✅✅✅ END BEREAVEMENT CARD ✅✅✅ */}
          </View>
        )}

        {/* ACTIONS TAB */}
        {activeTab === "ACTIONS" && (
          <View style={{ gap: 16 }}>
            <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>⚡ Quick Actions</Text>

            {/* ✅✅✅ BEREAVEMENT BUTTON ✅✅✅ */}
            <TouchableOpacity
              onPress={() => router.push('/admin/bereavement')}
              style={{
                backgroundColor: "#FF3B30",
                padding: 16,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 24 }}>🏥</Text>
              <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 16 }}>
                Manage Bereavement Fund
              </Text>
            </TouchableOpacity>

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

            <TouchableOpacity
              onPress={() => router.push('/admin/check-ins')}
              style={{
                backgroundColor: "#22C6D2",
                padding: 16,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 24 }}>📸</Text>
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>Check-In Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* REPORTS TAB - WITH MATCH FORMS & PLAYER SEARCH */}
        {activeTab === "REPORTS" && (
          <View style={{ gap: 16 }}>
            <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>📋 Reports & Search</Text>

            {/* Player Search Section */}
            <View
              style={{
                backgroundColor: "#0A2238",
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ color: "#22C6D2", fontSize: 18, fontWeight: "900" }}>
                  🔍 Player Search
                </Text>
                {searchResults.length > 0 && (
                  <TouchableOpacity
                    onPress={exportPlayerSearch}
                    style={{
                      backgroundColor: "#34C759",
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 11 }}>
                      📤 Export ({searchResults.length})
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <TextInput
                value={playerSearchQuery}
                onChangeText={setPlayerSearchQuery}
                placeholder="Search by name, number, team, or position..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 14,
                  borderRadius: 12,
                  fontWeight: "900",
                  fontSize: 16,
                  marginBottom: 16,
                }}
              />

              {playerSearchQuery && searchResults.length > 0 && (
                <View>
                  <Text style={{ color: "#9FB3C8", marginBottom: 12 }}>
                    Found {searchResults.length} player{searchResults.length !== 1 ? 's' : ''}
                  </Text>
                  
                  <ScrollView style={{ maxHeight: 400 }}>
                    {searchResults.map((player: any) => {
                      const team = leagueTeams.find((t: any) => t.id === player.teamId);
                      const playerCheckIns = player.checkInHistory?.length || 0;
                      const playerGoals = (matchEvents ?? []).filter((e: any) => 
                        e.playerId === player.id && e.type === 'GOAL'
                      ).length;

                      return (
                        <TouchableOpacity
                          key={player.id}
                          onPress={() => setSelectedPlayer(selectedPlayer?.id === player.id ? null : player)}
                          style={{
                            backgroundColor: selectedPlayer?.id === player.id ? "#0B2842" : "#061A2B",
                            padding: 14,
                            borderRadius: 12,
                            marginBottom: 10,
                            borderWidth: 2,
                            borderColor: selectedPlayer?.id === player.id ? "#22C6D2" : "rgba(255,255,255,0.1)",
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                            {team && (
                              <Image
                                source={getLogoSource(team.logoKey)}
                                style={{ width: 40, height: 40, borderRadius: 20 }}
                              />
                            )}
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                                #{player.shirtNumber} {player.fullName}
                              </Text>
                              <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                                {team?.name} • {player.position}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {!playerSearchQuery && (
                <View style={{ alignItems: "center", paddingVertical: 30 }}>
                  <Text style={{ fontSize: 48 }}>🔍</Text>
                  <Text style={{ color: "#9FB3C8", marginTop: 12, textAlign: "center" }}>
                    Search for players by name, number, team, or position
                  </Text>
                </View>
              )}
            </View>

            {/* Match Forms Section */}
            <View
              style={{
                backgroundColor: "#0A2238",
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Text style={{ color: "#F2D100", fontSize: 18, fontWeight: "900" }}>
                  📋 Match Forms
                </Text>
                <TouchableOpacity
                  onPress={exportAllMatchForms}
                  style={{
                    backgroundColor: "#34C759",
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 13 }}>
                    📦 Export All ({leagueMatches.length})
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 300 }}>
                {leagueMatches.length === 0 ? (
                  <View style={{ alignItems: "center", paddingVertical: 40 }}>
                    <Text style={{ fontSize: 48 }}>📋</Text>
                    <Text style={{ color: "#9FB3C8", marginTop: 12 }}>
                      No matches found
                    </Text>
                  </View>
                ) : (
                  leagueMatches.map((match: any) => (
                    <View
                      key={match.id}
                      style={{
                        backgroundColor: "#0B2842",
                        padding: 14,
                        borderRadius: 12,
                        marginBottom: 10,
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                            {match.homeTeam} vs {match.awayTeam}
                          </Text>
                          <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>
                            {match.kickoffAt ? new Date(match.kickoffAt).toLocaleDateString() : 'TBD'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => exportMatchForm(match)}
                          style={{
                            backgroundColor: "#22C6D2",
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            borderRadius: 8,
                          }}
                        >
                          <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 12 }}>
                            📄 Generate
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        )}

        {/* CHECK-INS TAB */}
        {activeTab === "CHECK_INS" && (
          <View style={{ gap: 16 }}>
            <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>📸 Check-In Management</Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#0A2238",
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: "rgba(34,198,210,0.3)",
                }}
              >
                <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Total Check-Ins</Text>
                <Text style={{ color: "#22C6D2", fontSize: 32, fontWeight: "900", marginTop: 4 }}>
                  {totalCheckIns}
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: "#0A2238",
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: "rgba(52,199,89,0.3)",
                }}
              >
                <Text style={{ color: "#34C759", fontSize: 12, fontWeight: "900" }}>Today</Text>
                <Text style={{ color: "#34C759", fontSize: 32, fontWeight: "900", marginTop: 4 }}>
                  {todaysCheckIns}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/admin/check-ins')}
              style={{
                backgroundColor: "#F2D100",
                padding: 18,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 18 }}>
                📸 Open Check-In Dashboard
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === "FINANCE" && (
          <View style={{ gap: 16 }}>
            <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>💰 Financial Management</Text>
            <Text style={{ color: "#9FB3C8", textAlign: "center", paddingVertical: 40 }}>
              Finance panel coming soon...
            </Text>
          </View>
        )}

        {activeTab === "CARDS" && (
          <View style={{ gap: 16 }}>
            <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>🟨 Card Tracking</Text>
            <Text style={{ color: "#9FB3C8", textAlign: "center", paddingVertical: 40 }}>
              Cards panel coming soon...
            </Text>
          </View>
        )}

        {activeTab === "ANALYTICS" && (
          <View style={{ gap: 16 }}>
            <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>📈 Analytics & Reports</Text>
            <Text style={{ color: "#9FB3C8", textAlign: "center", paddingVertical: 40 }}>
              Analytics dashboard coming soon...
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
                          borderColor: selectedTeamForPlayer === team.id ? "#34C759" : "rgba(255,255,255,0.1)",
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

            <TouchableOpacity
              onPress={handleAddPlayer}
              disabled={!newPlayerName || !selectedTeamForPlayer}
              style={{
                backgroundColor: newPlayerName && selectedTeamForPlayer ? "#34C759" : "rgba(255,255,255,0.1)",
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