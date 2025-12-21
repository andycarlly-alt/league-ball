import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "../../src/state/AppStore";

export default function TeamsTab() {
  const router = useRouter();
  const { teams, tournaments, activeLeagueId } = useAppStore();

  const leagueTeams = useMemo(
    () => (teams ?? []).filter((t: any) => t.leagueId === activeLeagueId),
    [teams, activeLeagueId]
  );

  const tournamentName = (id: string) =>
    (tournaments ?? []).find((t: any) => t.id === id)?.name ?? "Tournament";

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>
        Teams
      </Text>
      <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
        Tap a team to view roster + age color banners (U30 red, 3034 yellow, 35+ green)
      </Text>

      <ScrollView
        style={{ marginTop: 14 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 30 }}
      >
        {leagueTeams.map((t: any) => (
          <TouchableOpacity key={t.id} onPress={() => router.push(`/teams/${t.id}`)}>
            <View
              style={{
                backgroundColor: "#0A2238",
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                {t.name}
              </Text>
              <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
                {tournamentName(t.tournamentId)}  Rep: {t.repName ?? ""}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {!leagueTeams.length ? (
          <Text style={{ color: "#9FB3C8" }}>No teams yet for this league.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
