// app/referee/field-validation.tsx - REFEREE FIELD VALIDATION SCREEN

import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";

export default function FieldValidationScreen() {
  const router = useRouter();
  const {
    matches,
    teams,
    tournaments,
    players,
    validateFieldLineup,
    getPlayersForTeam,
  } = useAppStore() as any;

  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [homeLineup, setHomeLineup] = useState<Set<string>>(new Set());
  const [awayLineup, setAwayLineup] = useState<Set<string>>(new Set());

  // Get live/scheduled matches
  const availableMatches = useMemo(() => {
    return matches.filter((m: any) => m.status === "LIVE" || m.status === "SCHEDULED");
  }, [matches]);

  const selectedMatch = useMemo(() => {
    return matches.find((m: any) => m.id === selectedMatchId);
  }, [matches, selectedMatchId]);

  const tournament = useMemo(() => {
    if (!selectedMatch) return null;
    return tournaments.find((t: any) => t.id === selectedMatch.tournamentId);
  }, [selectedMatch, tournaments]);

  const homeTeam = useMemo(() => {
    if (!selectedMatch) return null;
    return teams.find((t: any) => t.id === selectedMatch.homeTeamId);
  }, [selectedMatch, teams]);

  const awayTeam = useMemo(() => {
    if (!selectedMatch) return null;
    return teams.find((t: any) => t.id === selectedMatch.awayTeamId);
  }, [selectedMatch, teams]);

  const homePlayers = useMemo(() => {
    if (!homeTeam) return [];
    return getPlayersForTeam(homeTeam.id);
  }, [homeTeam, getPlayersForTeam]);

  const awayPlayers = useMemo(() => {
    if (!awayTeam) return [];
    return getPlayersForTeam(awayTeam.id);
  }, [awayTeam, getPlayersForTeam]);

  const togglePlayer = (playerId: string, team: "HOME" | "AWAY") => {
    if (team === "HOME") {
      setHomeLineup((prev) => {
        const updated = new Set(prev);
        if (updated.has(playerId)) {
          updated.delete(playerId);
        } else {
          updated.add(playerId);
        }
        return updated;
      });
    } else {
      setAwayLineup((prev) => {
        const updated = new Set(prev);
        if (updated.has(playerId)) {
          updated.delete(playerId);
        } else {
          updated.add(playerId);
        }
        return updated;
      });
    }
  };

  const validateLineups = () => {
    if (!selectedMatch) {
      Alert.alert("Error", "Please select a match");
      return;
    }

    // Validate home team
    const homeValidation = validateFieldLineup(
      selectedMatch.id,
      selectedMatch.homeTeamId,
      Array.from(homeLineup)
    );

    // Validate away team
    const awayValidation = validateFieldLineup(
      selectedMatch.id,
      selectedMatch.awayTeamId,
      Array.from(awayLineup)
    );

    if (!homeValidation.isValid && !awayValidation.isValid) {
      Alert.alert(
        "❌ Both Teams Invalid",
        `Home Team: ${homeValidation.reason}\n\nAway Team: ${awayValidation.reason}`
      );
    } else if (!homeValidation.isValid) {
      Alert.alert("❌ Home Team Invalid", homeValidation.reason);
    } else if (!awayValidation.isValid) {
      Alert.alert("❌ Away Team Invalid", awayValidation.reason);
    } else {
      Alert.alert(
        "✅ Lineups Valid!",
        `Both teams meet tournament requirements.\n\nHome: ${homeLineup.size} players selected\nAway: ${awayLineup.size} players selected\n\nMatch can proceed.`
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900", marginTop: 16 }}>
          Field Lineup Validation
        </Text>
        <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
          Verify starting lineups meet tournament rules
        </Text>

        {/* Match Selection */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
            Select Match
          </Text>
          {availableMatches.length === 0 ? (
            <View style={{
              backgroundColor: "#0A2238",
              padding: 20,
              borderRadius: 12,
              alignItems: "center",
            }}>
              <Text style={{ color: "#9FB3C8" }}>No live or scheduled matches</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {availableMatches.map((match: any) => {
                const home = teams.find((t: any) => t.id === match.homeTeamId);
                const away = teams.find((t: any) => t.id === match.awayTeamId);
                const isSelected = selectedMatchId === match.id;

                return (
                  <TouchableOpacity
                    key={match.id}
                    onPress={() => {
                      setSelectedMatchId(match.id);
                      setHomeLineup(new Set());
                      setAwayLineup(new Set());
                    }}
                    style={{
                      backgroundColor: isSelected ? "#22C6D2" : "#0A2238",
                      padding: 14,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: isSelected ? "#22C6D2" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Text style={{
                      color: isSelected ? "#061A2B" : "#EAF2FF",
                      fontWeight: "900",
                      fontSize: 15,
                    }}>
                      {home?.name} vs {away?.name}
                    </Text>
                    <Text style={{
                      color: isSelected ? "#061A2B" : "#9FB3C8",
                      fontSize: 12,
                      marginTop: 4,
                    }}>
                      {match.status} • {match.date} {match.time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Tournament Rules Display */}
        {selectedMatch && tournament?.underageRules?.enabled && (
          <View style={{
            marginTop: 20,
            backgroundColor: "rgba(242,209,0,0.1)",
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(242,209,0,0.3)",
          }}>
            <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 14, marginBottom: 8 }}>
              ⚠️ Tournament Rules
            </Text>
            <Text style={{ color: "#EAF2FF", fontSize: 13 }}>
              • Max {tournament.underageRules.maxUnderagedOnRoster} players under {tournament.underageRules.ageThreshold} on roster
            </Text>
            {tournament.underageRules.maxUnderagedOnField && (
              <Text style={{ color: "#EAF2FF", fontSize: 13 }}>
                • Max {tournament.underageRules.maxUnderagedOnField} on field at once
              </Text>
            )}
          </View>
        )}

        {/* Home Team Lineup */}
        {selectedMatch && (
          <View style={{ marginTop: 20 }}>
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                {homeTeam?.name} (Home)
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setHomeLineup(new Set(homePlayers.map((p: any) => p.id)))}
                  style={{
                    backgroundColor: "#34C759",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 11 }}>
                    Select All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setHomeLineup(new Set())}
                  style={{
                    backgroundColor: "#0A2238",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#9FB3C8", fontWeight: "900", fontSize: 11 }}>
                    Clear
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={{ color: "#9FB3C8", fontSize: 12, marginBottom: 10 }}>
              Selected: {homeLineup.size} players
            </Text>

            <View style={{ gap: 8 }}>
              {homePlayers.map((player: any) => {
                const isSelected = homeLineup.has(player.id);
                const age = player.dob ? require("../../src/state/AppStore").calcAge(player.dob) : 0;
                const isUnderaged = tournament?.underageRules?.enabled && age < tournament.underageRules.ageThreshold;

                return (
                  <TouchableOpacity
                    key={player.id}
                    onPress={() => togglePlayer(player.id, "HOME")}
                    style={{
                      backgroundColor: isSelected ? "rgba(34,198,210,0.2)" : "#0A2238",
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: isSelected
                        ? "#22C6D2"
                        : isUnderaged
                        ? "rgba(242,209,0,0.3)"
                        : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View>
                        <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 14 }}>
                          {player.fullName}
                        </Text>
                        <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 2 }}>
                          Age {age} • {player.position || "No position"}
                        </Text>
                      </View>
                      {isUnderaged && (
                        <View style={{
                          backgroundColor: "rgba(242,209,0,0.3)",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                        }}>
                          <Text style={{ color: "#F2D100", fontSize: 10, fontWeight: "900" }}>
                            UNDER {tournament.underageRules.ageThreshold}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Away Team Lineup */}
        {selectedMatch && (
          <View style={{ marginTop: 20 }}>
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                {awayTeam?.name} (Away)
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setAwayLineup(new Set(awayPlayers.map((p: any) => p.id)))}
                  style={{
                    backgroundColor: "#34C759",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 11 }}>
                    Select All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAwayLineup(new Set())}
                  style={{
                    backgroundColor: "#0A2238",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#9FB3C8", fontWeight: "900", fontSize: 11 }}>
                    Clear
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={{ color: "#9FB3C8", fontSize: 12, marginBottom: 10 }}>
              Selected: {awayLineup.size} players
            </Text>

            <View style={{ gap: 8 }}>
              {awayPlayers.map((player: any) => {
                const isSelected = awayLineup.has(player.id);
                const age = player.dob ? require("../../src/state/AppStore").calcAge(player.dob) : 0;
                const isUnderaged = tournament?.underageRules?.enabled && age < tournament.underageRules.ageThreshold;

                return (
                  <TouchableOpacity
                    key={player.id}
                    onPress={() => togglePlayer(player.id, "AWAY")}
                    style={{
                      backgroundColor: isSelected ? "rgba(34,198,210,0.2)" : "#0A2238",
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: isSelected
                        ? "#22C6D2"
                        : isUnderaged
                        ? "rgba(242,209,0,0.3)"
                        : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View>
                        <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 14 }}>
                          {player.fullName}
                        </Text>
                        <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 2 }}>
                          Age {age} • {player.position || "No position"}
                        </Text>
                      </View>
                      {isUnderaged && (
                        <View style={{
                          backgroundColor: "rgba(242,209,0,0.3)",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                        }}>
                          <Text style={{ color: "#F2D100", fontSize: 10, fontWeight: "900" }}>
                            UNDER {tournament.underageRules.ageThreshold}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Validate Button */}
        {selectedMatch && (
          <TouchableOpacity
            onPress={validateLineups}
            disabled={homeLineup.size === 0 && awayLineup.size === 0}
            style={{
              marginTop: 24,
              backgroundColor: (homeLineup.size > 0 || awayLineup.size > 0) ? "#34C759" : "#0A2238",
              padding: 18,
              borderRadius: 14,
              alignItems: "center",
              borderWidth: 2,
              borderColor: (homeLineup.size > 0 || awayLineup.size > 0) ? "#34C759" : "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{
              color: (homeLineup.size > 0 || awayLineup.size > 0) ? "#061A2B" : "#9FB3C8",
              fontWeight: "900",
              fontSize: 16,
            }}>
              🔍 Validate Lineups
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}