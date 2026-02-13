// app/matches/[matchId]/assign-jerseys.tsx - JERSEY NUMBER ASSIGNMENT

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Player, useAppStore } from "../../../src/state/AppStore";

export default function AssignJerseysScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();

  const { matches, teams, players, getPlayersForTeam } = useAppStore() as any;

  const match = matches.find((m: any) => m.id === matchId);
  const homeTeam = teams.find((t: any) => t.id === match?.homeTeamId);
  const awayTeam = teams.find((t: any) => t.id === match?.awayTeamId);

  const [selectedTeam, setSelectedTeam] = useState<"HOME" | "AWAY">("HOME");
  const [jerseyAssignments, setJerseyAssignments] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const currentTeam = selectedTeam === "HOME" ? homeTeam : awayTeam;
  const currentPlayers = currentTeam ? getPlayersForTeam(currentTeam.id) : [];

  // Filter players by search
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return currentPlayers;
    const q = searchQuery.toLowerCase();
    return currentPlayers.filter((p: Player) =>
      p.fullName.toLowerCase().includes(q)
    );
  }, [currentPlayers, searchQuery]);

  // Get used jersey numbers for current team
  const usedNumbers = useMemo(() => {
    return new Set(Object.values(jerseyAssignments));
  }, [jerseyAssignments]);

  const assignJersey = (playerId: string, number: string) => {
    if (!number.trim()) {
      // Remove assignment
      setJerseyAssignments((prev) => {
        const updated = { ...prev };
        delete updated[playerId];
        return updated;
      });
      return;
    }

    // Check if number already used
    const existingPlayerId = Object.keys(jerseyAssignments).find(
      (pid) => jerseyAssignments[pid] === number && pid !== playerId
    );

    if (existingPlayerId) {
      const existingPlayer = currentPlayers.find((p: Player) => p.id === existingPlayerId);
      Alert.alert(
        "Number Already Assigned",
        `Jersey #${number} is already assigned to ${existingPlayer?.fullName || "another player"}.\n\nDo you want to swap?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Swap",
            onPress: () => {
              setJerseyAssignments((prev) => ({
                ...prev,
                [existingPlayerId]: "",
                [playerId]: number,
              }));
            },
          },
        ]
      );
      return;
    }

    setJerseyAssignments((prev) => ({
      ...prev,
      [playerId]: number,
    }));
  };

  const quickAssign = () => {
    // Auto-assign numbers 1-99 to unassigned players
    let nextNumber = 1;
    const updated: Record<string, string> = { ...jerseyAssignments };

    currentPlayers.forEach((player: Player) => {
      if (!updated[player.id]) {
        // Find next available number
        while (Object.values(updated).includes(String(nextNumber))) {
          nextNumber++;
        }
        updated[player.id] = String(nextNumber);
        nextNumber++;
      }
    });

    setJerseyAssignments(updated);
    Alert.alert("✅ Auto-Assigned", "Jersey numbers assigned automatically");
  };

  const saveAssignments = () => {
    const assignedCount = Object.keys(jerseyAssignments).filter(
      (pid) => currentPlayers.find((p: Player) => p.id === pid)
    ).length;

    Alert.alert(
      "Save Jersey Assignments?",
      `${assignedCount} players will have jersey numbers for this match.\n\nNote: Numbers are per-match and can be changed for future games.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: () => {
            // In production: Save to match-specific jersey assignments
            Alert.alert(
              "✅ Saved!",
              "Jersey assignments saved for this match",
              [{ text: "OK", onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  };

  if (!match) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: "#EAF2FF", marginTop: 20 }}>Match not found</Text>
      </View>
    );
  }

  const teamAssignedCount = currentPlayers.filter((p: Player) => jerseyAssignments[p.id]).length;

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" }}>
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900", marginTop: 12 }}>
          Assign Jerseys
        </Text>
        <Text style={{ color: "#9FB3C8", fontSize: 14, marginTop: 4 }}>
          {homeTeam?.name} vs {awayTeam?.name}
        </Text>

        {/* Team Selector */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => setSelectedTeam("HOME")}
            style={{
              flex: 1,
              backgroundColor: selectedTeam === "HOME" ? "#22C6D2" : "#0A2238",
              padding: 12,
              borderRadius: 12,
              alignItems: "center",
              borderWidth: 2,
              borderColor: selectedTeam === "HOME" ? "#22C6D2" : "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{
              color: selectedTeam === "HOME" ? "#061A2B" : "#EAF2FF",
              fontWeight: "900",
              fontSize: 14,
            }}>
              {homeTeam?.name}
            </Text>
            <Text style={{
              color: selectedTeam === "HOME" ? "#061A2B" : "#9FB3C8",
              fontSize: 11,
              marginTop: 2,
            }}>
              {getPlayersForTeam(homeTeam?.id).filter((p: Player) => jerseyAssignments[p.id]).length} assigned
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTeam("AWAY")}
            style={{
              flex: 1,
              backgroundColor: selectedTeam === "AWAY" ? "#22C6D2" : "#0A2238",
              padding: 12,
              borderRadius: 12,
              alignItems: "center",
              borderWidth: 2,
              borderColor: selectedTeam === "AWAY" ? "#22C6D2" : "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{
              color: selectedTeam === "AWAY" ? "#061A2B" : "#EAF2FF",
              fontWeight: "900",
              fontSize: 14,
            }}>
              {awayTeam?.name}
            </Text>
            <Text style={{
              color: selectedTeam === "AWAY" ? "#061A2B" : "#9FB3C8",
              fontSize: 11,
              marginTop: 2,
            }}>
              {getPlayersForTeam(awayTeam?.id).filter((p: Player) => jerseyAssignments[p.id]).length} assigned
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats & Quick Actions */}
        <View style={{
          marginTop: 16,
          flexDirection: "row",
          gap: 10,
        }}>
          <View style={{
            flex: 1,
            backgroundColor: "#0A2238",
            padding: 12,
            borderRadius: 10,
          }}>
            <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Assigned</Text>
            <Text style={{ color: "#34C759", fontSize: 24, fontWeight: "900" }}>
              {teamAssignedCount}/{currentPlayers.length}
            </Text>
          </View>

          <TouchableOpacity
            onPress={quickAssign}
            style={{
              flex: 1,
              backgroundColor: "#F2D100",
              padding: 12,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 13 }}>
              ⚡ Auto-Assign
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search players..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={{
            marginTop: 16,
            backgroundColor: "#0A2238",
            color: "#EAF2FF",
            padding: 12,
            borderRadius: 10,
            fontSize: 15,
          }}
        />
      </View>

      {/* Player List */}
      <FlatList
        data={filteredPlayers}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{
            backgroundColor: "#0A2238",
            borderRadius: 12,
            padding: 14,
            marginBottom: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}>
            {/* Player Info */}
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 15 }}>
                {item.fullName}
              </Text>
              {item.position && (
                <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                  {item.position}
                </Text>
              )}
            </View>

            {/* Jersey Number Input */}
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}>
              <Text style={{ color: "#9FB3C8", fontSize: 13 }}>#</Text>
              <TextInput
                value={jerseyAssignments[item.id] || ""}
                onChangeText={(text) => assignJersey(item.id, text)}
                placeholder="00"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="number-pad"
                maxLength={2}
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  width: 60,
                  padding: 10,
                  borderRadius: 8,
                  fontSize: 18,
                  fontWeight: "900",
                  textAlign: "center",
                  borderWidth: 2,
                  borderColor: jerseyAssignments[item.id] ? "#34C759" : "rgba(255,255,255,0.1)",
                }}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>👥</Text>
            <Text style={{ color: "#9FB3C8", textAlign: "center" }}>
              {searchQuery ? "No players found" : "No players on this team"}
            </Text>
          </View>
        }
      />

      {/* Save Button (Fixed at bottom) */}
      <View style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: "#061A2B",
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
      }}>
        <TouchableOpacity
          onPress={saveAssignments}
          disabled={teamAssignedCount === 0}
          style={{
            backgroundColor: teamAssignedCount > 0 ? "#34C759" : "#0A2238",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{
            color: teamAssignedCount > 0 ? "#061A2B" : "#9FB3C8",
            fontWeight: "900",
            fontSize: 16,
          }}>
            ✓ Save Jersey Assignments ({teamAssignedCount})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}