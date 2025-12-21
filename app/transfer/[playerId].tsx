import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppStore, calcAge, ageBannerStyle } from "../../src/state/AppStore";

export default function TransferPicker() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>();
  const router = useRouter();
  const { players, teams, tournaments, transferPlayer } = useAppStore();

  const player = players.find((p) => p.id === playerId);
  const team = teams.find((t) => t.id === player?.teamId);
  const tournament = tournaments.find((t) => t.id === player?.tournamentId);

  const options = useMemo(() => {
    if (!player) return [];
    return teams.filter((t) => t.tournamentId === player.tournamentId && t.id !== player.teamId);
  }, [teams, player]);

  if (!player || !team || !tournament) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Transfer</Text>
        <Text style={{ color: "#9FB3C8", marginTop: 8 }}>Player not found.</Text>
      </View>
    );
  }

  const age = calcAge(player.dob) ?? 0;
  const b = ageBannerStyle(age);

  const pick = (toTeamId: string) => {
    const res = transferPlayer({ playerId: player.id, toTeamId, by: "Admin" });
    if (!res.ok) {
      Alert.alert("Transfer failed", res.reason ?? "Unknown error");
      return;
    }
    Alert.alert("Transferred", "Player moved successfully.");
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Transfer Player</Text>
      <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
        {tournament.name}  Roster: {tournament.rosterLocked ? "LOCKED" : "OPEN"}
      </Text>

      <View style={{ marginTop: 12, borderRadius: 14, overflow: "hidden" }}>
        <View style={{ backgroundColor: b.bg, padding: 12 }}>
          <Text style={{ color: b.fg, fontWeight: "900" }}>
            {player.fullName}  Age {age}  From: {team.name}
          </Text>
        </View>
      </View>

      <Text style={{ color: "#22C6D2", fontWeight: "900", marginTop: 14 }}>Select destination team</Text>

      <ScrollView style={{ marginTop: 12 }} contentContainerStyle={{ gap: 12, paddingBottom: 30 }}>
        {options.map((t) => (
          <TouchableOpacity key={t.id} onPress={() => pick(t.id)}>
            <View style={{ backgroundColor: "#0A2238", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>{t.name}</Text>
              <Text style={{ color: "#9FB3C8", marginTop: 6 }}>Rep: {t.repName}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {!options.length ? <Text style={{ color: "#9FB3C8" }}>No other teams available.</Text> : null}
      </ScrollView>
    </View>
  );
}
