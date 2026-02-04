// app/tournaments/[id].tsx - ENHANCED TOURNAMENT DETAIL PAGE (FIXED)

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";

export default function TournamentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tournamentId = String(id ?? "");

  const {
    tournaments,
    getTeamsForTournament,
    players,
    currentUser,
    can,
  } = useAppStore() as any;

  const tournament = useMemo(
    () => tournaments.find((t: any) => t.id === tournamentId),
    [tournaments, tournamentId]
  );

  const teams = useMemo(
    () => getTeamsForTournament(tournamentId),
    [tournamentId, tournaments]
  );

  const allPlayers = useMemo(
    () => (players ?? []).filter((p: any) => p.tournamentId === tournamentId),
    [players, tournamentId]
  );

  const verifiedPlayers = useMemo(
    () => allPlayers.filter((p: any) => p.verified),
    [allPlayers]
  );

  const userTeam = useMemo(
    () => teams.find((t: any) => t.id === currentUser.teamId),
    [teams, currentUser.teamId]
  );

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

  const registrationFee = tournament.registrationFee || 15000;
  const isRegistrationOpen = tournament.status === "OPEN" || tournament.status === "Open";
  const maxTeams = tournament.maxTeams || 24;
  const spotsLeft = maxTeams - teams.length;
  const registrationDeadline = tournament.registrationDeadline || tournament.startDate;

  const getStatusColor = () => {
    switch (tournament.status) {
      case "OPEN":
      case "Open":
        return "#34C759";
      case "LIVE":
        return "#22C6D2";
      case "COMPLETE":
        return "#9FB3C8";
      default:
        return "#F2D100";
    }
  };

  const handleRegisterTeam = () => {
    if (!isRegistrationOpen) {
      Alert.alert("Registration Closed", "This tournament is no longer accepting registrations");
      return;
    }

    if (spotsLeft <= 0) {
      Alert.alert("Tournament Full", "This tournament has reached maximum capacity");
      return;
    }

    // Navigate to registration choice screen
    router.push(`/tournaments/${tournamentId}/register`);
  };

  const handleBrowseTeams = () => {
    router.push(`/tournaments/${tournamentId}/teams/browse`);
  };

  const handleViewMyTeam = () => {
    if (userTeam) {
      router.push(`/teams/${userTeam.id}/dashboard`);
    }
  };

  const canManage = can("MANAGE_TOURNAMENTS");

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Image/Banner */}
        <View style={{ 
          backgroundColor: "#0A2238", 
          paddingTop: 60, 
          paddingBottom: 40, 
          paddingHorizontal: 16,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}
          >
            <View style={{ backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
              <Text style={{ color: "#22C6D2", fontSize: 16, fontWeight: "900" }}>← Back</Text>
            </View>
          </TouchableOpacity>

          <View style={{ alignItems: "center" }}>
            <View style={{
              backgroundColor: getStatusColor(),
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              marginBottom: 16,
            }}>
              <Text style={{ color: tournament.status === "COMPLETE" ? "#061A2B" : "#061A2B", fontWeight: "900", fontSize: 14 }}>
                {tournament.status || "DRAFT"}
              </Text>
            </View>

            <Text style={{ color: "#F2D100", fontSize: 28, fontWeight: "900", textAlign: "center", marginBottom: 8 }}>
              {tournament.name}
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <View style={{ backgroundColor: "rgba(242,209,0,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                <Text style={{ color: "#F2D100", fontSize: 13, fontWeight: "900" }}>
                  📍 {tournament.location || "Location TBD"}
                </Text>
              </View>
              <View style={{ backgroundColor: "rgba(34,198,210,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                <Text style={{ color: "#22C6D2", fontSize: 13, fontWeight: "900" }}>
                  {tournament.ageRuleLabel || "35+"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ padding: 16 }}>
          {/* Quick Stats */}
          <View style={{ 
            backgroundColor: "#0A2238", 
            borderRadius: 16, 
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}>
            <Text style={{ color: "#9FB3C8", fontSize: 12, fontWeight: "900", marginBottom: 12 }}>
              TOURNAMENT STATS
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#F2D100", fontSize: 32, fontWeight: "900" }}>{teams.length}</Text>
                <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>Teams</Text>
              </View>
              <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.1)" }} />
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#22C6D2", fontSize: 32, fontWeight: "900" }}>{allPlayers.length}</Text>
                <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>Players</Text>
              </View>
              <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.1)" }} />
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#34C759", fontSize: 32, fontWeight: "900" }}>{verifiedPlayers.length}</Text>
                <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>Verified</Text>
              </View>
            </View>
          </View>

          {/* Registration Status */}
          {isRegistrationOpen && (
            <View style={{
              backgroundColor: "rgba(52,199,89,0.1)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              borderWidth: 2,
              borderColor: "#34C759",
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ color: "#34C759", fontSize: 18, fontWeight: "900" }}>
                    ✅ Registration Open
                  </Text>
                  <Text style={{ color: "#EAF2FF", marginTop: 6 }}>
                    {spotsLeft} of {maxTeams} spots remaining
                  </Text>
                  {registrationDeadline && (
                    <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>
                      Deadline: {registrationDeadline}
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: "#34C759", fontSize: 28, fontWeight: "900" }}>{spotsLeft}</Text>
                  <Text style={{ color: "#9FB3C8", fontSize: 11 }}>spots</Text>
                </View>
              </View>
            </View>
          )}

          {/* Registration Fee */}
          <View style={{
            backgroundColor: "#0A2238",
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}>
            <Text style={{ color: "#9FB3C8", fontSize: 12, fontWeight: "900", marginBottom: 8 }}>
              REGISTRATION FEE
            </Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
              <Text style={{ color: "#F2D100", fontSize: 36, fontWeight: "900" }}>
                ${(registrationFee / 100).toFixed(0)}
              </Text>
              <Text style={{ color: "#9FB3C8", fontSize: 16 }}>per team</Text>
            </View>
            <Text style={{ color: "#9FB3C8", marginTop: 8, lineHeight: 20 }}>
              Includes tournament entry, verified roster, match scheduling, and access to all tournament features
            </Text>
          </View>

          {/* Tournament Details */}
          <View style={{
            backgroundColor: "#0A2238",
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}>
            <Text style={{ color: "#9FB3C8", fontSize: 12, fontWeight: "900", marginBottom: 12 }}>
              TOURNAMENT DETAILS
            </Text>
            <View style={{ gap: 12 }}>
              {tournament.startDate && (
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Text style={{ color: "#22C6D2", fontSize: 16 }}>📅</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Dates</Text>
                    <Text style={{ color: "#9FB3C8", marginTop: 4 }}>
                      {tournament.startDate} {tournament.endDate ? `- ${tournament.endDate}` : ""}
                    </Text>
                  </View>
                </View>
              )}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Text style={{ color: "#22C6D2", fontSize: 16 }}>👥</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Age Requirement</Text>
                  <Text style={{ color: "#9FB3C8", marginTop: 4 }}>
                    {tournament.ageRuleLabel || "35+"} - All players must meet age requirements
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Text style={{ color: "#22C6D2", fontSize: 16 }}>✅</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Verification Required</Text>
                  <Text style={{ color: "#9FB3C8", marginTop: 4 }}>
                    All players must complete document verification before playing
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* User's Team Status */}
          {userTeam && (
            <TouchableOpacity
              onPress={handleViewMyTeam}
              style={{
                backgroundColor: "#22C6D2",
                borderRadius: 16,
                padding: 16,
                marginBottom: 20,
                borderWidth: 2,
                borderColor: "#22C6D2",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#061A2B", fontSize: 12, fontWeight: "900", marginBottom: 6 }}>
                    YOUR TEAM
                  </Text>
                  <Text style={{ color: "#061A2B", fontSize: 18, fontWeight: "900" }}>
                    {userTeam.name}
                  </Text>
                  <Text style={{ color: "#061A2B", marginTop: 4 }}>
                    Tap to manage roster and settings
                  </Text>
                </View>
                <Text style={{ color: "#061A2B", fontSize: 24 }}>→</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Main CTAs */}
          {!userTeam && isRegistrationOpen && (
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={handleRegisterTeam}
                style={{
                  backgroundColor: "#34C759",
                  borderRadius: 16,
                  padding: 18,
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "#34C759",
                }}
              >
                <Text style={{ color: "#061A2B", fontSize: 18, fontWeight: "900" }}>
                  ⚽ Register Your Team
                </Text>
                <Text style={{ color: "#061A2B", marginTop: 4, fontSize: 13 }}>
                  Create new team or join existing
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBrowseTeams}
                style={{
                  backgroundColor: "#0A2238",
                  borderRadius: 16,
                  padding: 18,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Text style={{ color: "#EAF2FF", fontSize: 18, fontWeight: "900" }}>
                  👥 Browse Teams
                </Text>
                <Text style={{ color: "#9FB3C8", marginTop: 4, fontSize: 13 }}>
                  Find a team to join as a player
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Teams List */}
          {teams.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ color: "#F2D100", fontSize: 20, fontWeight: "900" }}>
                  Registered Teams ({teams.length})
                </Text>
                <TouchableOpacity onPress={() => router.push(`/tournaments/${tournamentId}/teams`)}>
                  <Text style={{ color: "#22C6D2", fontWeight: "900" }}>View All →</Text>
                </TouchableOpacity>
              </View>

              {teams.slice(0, 5).map((team: any) => (
                <TouchableOpacity
                  key={team.id}
                  onPress={() => router.push(`/teams/${team.id}`)}
                  style={{
                    backgroundColor: "#0A2238",
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                      {team.name}
                    </Text>
                    <Text style={{ color: "#9FB3C8", marginTop: 4, fontSize: 13 }}>
                      {team.playerCount || 0} players • {team.repName || "No rep"}
                    </Text>
                  </View>
                  <Text style={{ color: "#22C6D2", fontSize: 18 }}>→</Text>
                </TouchableOpacity>
              ))}

              {teams.length > 5 && (
                <TouchableOpacity
                  onPress={() => router.push(`/tournaments/${tournamentId}/teams`)}
                  style={{
                    backgroundColor: "#0A2238",
                    borderRadius: 12,
                    padding: 14,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text style={{ color: "#22C6D2", fontWeight: "900" }}>
                    View All {teams.length} Teams →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Admin Controls */}
          {canManage && (
            <View style={{ marginTop: 24 }}>
              <View style={{ backgroundColor: "rgba(242,209,0,0.1)", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(242,209,0,0.3)", marginBottom: 12 }}>
                <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 12, textAlign: "center" }}>
                  🔐 ORGANIZER CONTROLS
                </Text>
              </View>

              <View style={{ gap: 10 }}>
                <TouchableOpacity
                  onPress={() => router.push(`/tournaments/${tournamentId}/admin`)}
                  style={{
                    backgroundColor: "#F2D100",
                    borderRadius: 12,
                    padding: 14,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#061A2B", fontWeight: "900" }}>
                    📊 Tournament Dashboard
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push(`/tournaments/${tournamentId}/settings`)}
                  style={{
                    backgroundColor: "#0A2238",
                    borderRadius: 12,
                    padding: 14,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                    ⚙️ Tournament Settings
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}