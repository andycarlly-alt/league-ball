// app/tournaments/[id]/teams/browse.tsx - TEAM DISCOVERY FOR PLAYERS (FIXED)

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../../../src/state/AppStore";
import { getLogoSource } from "../../../../src/utils/logos";

export default function BrowseTeamsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tournamentId = String(id ?? "");

  const {
    tournaments,
    getTeamsForTournament,
    players,
  } = useAppStore() as any;

  const tournament = useMemo(
    () => tournaments.find((t: any) => t.id === tournamentId),
    [tournaments, tournamentId]
  );

  const teams = useMemo(
    () => getTeamsForTournament(tournamentId),
    [tournamentId, tournaments]
  );

  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;
    const query = searchQuery.toLowerCase();
    return teams.filter((team: any) =>
      team.name.toLowerCase().includes(query) ||
      (team.repName && team.repName.toLowerCase().includes(query))
    );
  }, [teams, searchQuery]);

  const getTeamPlayerCount = (teamId: string) => {
    return (players ?? []).filter((p: any) => p.teamId === teamId).length;
  };

  const handleRequestToJoin = (team: any) => {
    Alert.alert(
      `Join ${team.name}?`,
      `Send a request to join this team?\n\nTeam Representative: ${team.repName || "Not specified"}\n\nThe team rep will review your request and add you to the roster if approved.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Request",
          onPress: () => {
            // In a real app, this would send a notification to the team rep
            Alert.alert(
              "Request Sent! 📬",
              `Your join request has been sent to ${team.name}.\n\nThe team representative will review your request and contact you if approved.\n\nYou can also contact them directly to follow up.`,
              [{ text: "OK" }]
            );
          },
        },
      ]
    );
  };

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

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ padding: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
            <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>

          <Text style={{ color: "#F2D100", fontSize: 28, fontWeight: "900" }}>
            Browse Teams
          </Text>
          <Text style={{ color: "#9FB3C8", marginTop: 8, fontSize: 16 }}>
            {tournament.name}
          </Text>
          <Text style={{ color: "#9FB3C8", marginTop: 4 }}>
            {teams.length} {teams.length === 1 ? "team" : "teams"} registered
          </Text>
        </View>

        {/* Search */}
        {teams.length > 3 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search teams..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={{
                backgroundColor: "#0A2238",
                color: "#EAF2FF",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </View>
        )}

        {/* Info Banner */}
        <View style={{
          marginHorizontal: 16,
          marginBottom: 20,
          backgroundColor: "rgba(34,198,210,0.1)",
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(34,198,210,0.3)",
        }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", marginBottom: 8 }}>
            💡 How to Join a Team
          </Text>
          <Text style={{ color: "#EAF2FF", lineHeight: 20 }}>
            Tap any team to send a join request. The team representative will review your request and contact you if approved.
          </Text>
        </View>

        {/* Teams List */}
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {filteredTeams.length > 0 ? (
            filteredTeams.map((team: any) => {
              const playerCount = getTeamPlayerCount(team.id);
              
              return (
                <TouchableOpacity
                  key={team.id}
                  onPress={() => handleRequestToJoin(team)}
                  style={{
                    backgroundColor: "#0A2238",
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    {/* Team Logo */}
                    <Image
                      source={getLogoSource(team.logoKey || 'placeholder')}
                      style={{ width: 60, height: 60, borderRadius: 12 }}
                      resizeMode="cover"
                    />

                    {/* Team Info */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 18 }}>
                        {team.name}
                      </Text>
                      
                      <View style={{ marginTop: 8, gap: 4 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={{ color: "#22C6D2" }}>👤</Text>
                          <Text style={{ color: "#9FB3C8", fontSize: 14 }}>
                            Rep: {team.repName || "Not specified"}
                          </Text>
                        </View>
                        
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={{ color: "#22C6D2" }}>👥</Text>
                          <Text style={{ color: "#9FB3C8", fontSize: 14 }}>
                            {playerCount} {playerCount === 1 ? "player" : "players"}
                          </Text>
                        </View>
                      </View>

                      {/* Join Button */}
                      <View style={{
                        marginTop: 12,
                        backgroundColor: "#22C6D2",
                        borderRadius: 10,
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        alignItems: "center",
                      }}>
                        <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 15 }}>
                          Request to Join
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            /* Empty State */
            <View style={{
              backgroundColor: "#0A2238",
              borderRadius: 16,
              padding: 32,
              alignItems: "center",
              marginTop: 40,
            }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>
                {searchQuery.trim() ? "🔍" : "⚽"}
              </Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 18, textAlign: "center" }}>
                {searchQuery.trim() ? "No Teams Found" : "No Teams Yet"}
              </Text>
              <Text style={{ color: "#9FB3C8", marginTop: 8, textAlign: "center", lineHeight: 20 }}>
                {searchQuery.trim()
                  ? `No teams match "${searchQuery}". Try a different search.`
                  : "Be the first to create a team for this tournament!"}
              </Text>
              {!searchQuery.trim() && (
                <TouchableOpacity
                  onPress={() => router.push(`/tournaments/${tournamentId}/create-team`)}
                  style={{
                    marginTop: 20,
                    backgroundColor: "#34C759",
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: "#061A2B", fontWeight: "900" }}>
                    Create New Team
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Alternative Option */}
        {teams.length > 0 && (
          <View style={{ padding: 16, marginTop: 20 }}>
            <View style={{
              backgroundColor: "#0A2238",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>
                Don't see the right team?
              </Text>
              <Text style={{ color: "#9FB3C8", marginBottom: 16, lineHeight: 20 }}>
                You can create your own team and invite players to join.
              </Text>
              <TouchableOpacity
                onPress={() => router.push(`/tournaments/${tournamentId}/create-team`)}
                style={{
                  backgroundColor: "#34C759",
                  borderRadius: 12,
                  padding: 14,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#061A2B", fontWeight: "900" }}>
                  Create Your Own Team
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}