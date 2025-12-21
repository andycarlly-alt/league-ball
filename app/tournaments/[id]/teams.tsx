import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppStore } from "../../../src/state/AppStore";

export default function TournamentTeamsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tournaments, getTeamsForTournament } = useAppStore();

  const t = tournaments.find((x) => x.id === id);
  const teams = useMemo(() => (t ? getTeamsForTournament(t.id) : []), [t?.id]);

  if (!t) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Teams</Text>
        <Text style={{ color: "#9FB3C8", marginTop: 8 }}>Tournament not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Teams</Text>
      <Text style={{ color: "#9FB3C8", marginTop: 6 }}>{t.name}</Text>

      <TouchableOpacity
        onPress={() => router.push(`/tournaments/${t.id}/join-team`)}
        style={{ marginTop: 14, backgroundColor: "#22C6D2", padding: 14, borderRadius: 14, alignItems: "center" }}
      >
        <Text style={{ color: "#061A2B", fontWeight: "900" }}>+ Register Team</Text>
      </TouchableOpacity>

      <ScrollView style={{ marginTop: 14 }} contentContainerStyle={{ gap: 12, paddingBottom: 30 }}>
        {teams.map((tm) => (
          <View key={tm.id} style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{tm.name}</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
              Rep: {tm.repName ?? ""}  Players: {tm.playerCount ?? 0}
            </Text>
          </View>
        ))}

        {!teams.length ? (
          <View style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 14 }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>No teams yet</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
              First step is registering teams. Next step will be player sign-up + age verification.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
