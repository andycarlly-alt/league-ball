import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "../../src/state/AppStore";

export default function TournamentsTab() {
  const router = useRouter();
  const { tournaments, leagues, activeLeagueId } = useAppStore() as any;

  const leagueName = useMemo(() => {
    return (leagues ?? []).find((l: any) => l.id === activeLeagueId)?.name ?? "League";
  }, [leagues, activeLeagueId]);

  const list = useMemo(() => {
    return (tournaments ?? [])
      .filter((t: any) => t.leagueId === activeLeagueId)
      .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [tournaments, activeLeagueId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>
        Tournaments
      </Text>
      <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
        {leagueName}  Create DMV/NEVT tournaments now, reuse rosters for NVT Labor Day.
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/tournaments/create")}
        style={{
          marginTop: 14,
          backgroundColor: "#22C6D2",
          padding: 14,
          borderRadius: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#061A2B", fontWeight: "900" }}>
          + Create Tournament
        </Text>
      </TouchableOpacity>

      <ScrollView
        style={{ marginTop: 14 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 30 }}
      >
        {list.map((t: any) => (
          <TouchableOpacity key={t.id} onPress={() => router.push(`/tournaments/${t.id}`)}>
            <View
              style={{
                backgroundColor: "#0A2238",
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                {t.name}
              </Text>

              <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
                {t.location ?? "Location TBD"}  {t.ageRuleLabel ?? t.ageBand ?? "Age rule TBD"} {" "}
                {t.status ?? "Draft"}
              </Text>

              <Text style={{ color: "#F2D100", marginTop: 8, fontWeight: "900" }}>
                Tap to manage / join
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {!list.length ? (
          <View style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 14 }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>No tournaments yet</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
              Create one now for DMV League or NEVT so teams sign up and you capture player data early.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
