import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAppStore } from "../../../src/state/AppStore";

export default function TournamentAdmin() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tournaments, teams, players, transferLogs, toggleRosterLock } = useAppStore();

  const tournament = useMemo(() => tournaments.find((t) => t.id === id), [tournaments, id]);
  const tTeams = useMemo(() => teams.filter((t) => t.tournamentId === id), [teams, id]);
  const tPlayers = useMemo(() => players.filter((p) => p.tournamentId === id), [players, id]);
  const logs = useMemo(() => transferLogs.filter((l) => l.tournamentId === id), [transferLogs, id]);

  const verifiedCount = tPlayers.filter((p) => p.verified).length;

  const teamName = (teamId: string) => tTeams.find((t) => t.id === teamId)?.name ?? "Team";
  const playerName = (playerId: string) => tPlayers.find((p) => p.id === playerId)?.fullName ?? "Player";

  if (!tournament) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Tournament Admin</Text>
        <Text style={{ color: "#9FB3C8", marginTop: 8 }}>Not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Admin: {tournament.name}</Text>
      <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
        Teams: {tTeams.length}  Players: {tPlayers.length}  Verified: {verifiedCount}
      </Text>

      <TouchableOpacity
        onPress={() => toggleRosterLock(tournament.id)}
        style={{ marginTop: 12, backgroundColor: tournament.rosterLocked ? "#34C759" : "#FF3B30", padding: 12, borderRadius: 12, alignItems: "center" }}
      >
        <Text style={{ fontWeight: "900", color: "#061A2B" }}>
          {tournament.rosterLocked ? "Unlock Roster (Enable adds/transfers)" : "Lock Roster (Freeze rosters)"}
        </Text>
      </TouchableOpacity>

      <ScrollView style={{ marginTop: 14 }} contentContainerStyle={{ gap: 12, paddingBottom: 30 }}>
        <View style={{ backgroundColor: "#0B2842", borderRadius: 14, padding: 14 }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900" }}>Transfer Log</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 6 }}>Audit trail for roster integrity (important for NVT)</Text>
        </View>

        {logs.map((l) => (
          <View key={l.id} style={{ backgroundColor: "#0A2238", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{playerName(l.playerId)}</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
              {teamName(l.fromTeamId)}  {teamName(l.toTeamId)}
            </Text>
            <Text style={{ color: "#22C6D2", marginTop: 6, fontWeight: "800" }}>
              By {l.by}  {new Date(l.createdAt).toLocaleString()}
            </Text>
          </View>
        ))}

        {!logs.length ? <Text style={{ color: "#9FB3C8" }}>No transfers yet.</Text> : null}
      </ScrollView>
    </View>
  );
}
