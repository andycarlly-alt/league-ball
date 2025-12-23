// app/(tabs)/tournaments.tsx
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";

export default function TournamentsTab() {
  const router = useRouter();
  const { tournaments, teams, activeLeagueId } = useAppStore() as any;

  const list = useMemo(() => {
    return (tournaments ?? [])
      .filter((t: any) => t.leagueId === activeLeagueId)
      .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [tournaments, activeLeagueId]);

  const teamsCount = (tournamentId: string) =>
    (teams ?? []).filter((tm: any) => tm.tournamentId === tournamentId).length;

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>
            Tournaments
          </Text>
          <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
            Create, manage, and pull verified rosters into NVT.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/tournaments/create")}
          style={{
            backgroundColor: "#F2D100",
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#061A2B", fontWeight: "900" }}>+ Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ marginTop: 14 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 30 }}
      >
        {list.map((t: any) => {
          const count = teamsCount(t.id);
          const status = t.status ?? "DRAFT"; // DRAFT | OPEN | LIVE | COMPLETE

          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => router.push(`/tournaments/${t.id}`)}
            >
              <View
                style={{
                  backgroundColor: "#0A2238",
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                    {t.name}
                  </Text>

                  <View
                    style={{
                      backgroundColor:
                        status === "OPEN"
                          ? "rgba(52,199,89,0.18)"
                          : status === "LIVE"
                          ? "rgba(34,198,210,0.18)"
                          : status === "COMPLETE"
                          ? "rgba(159,179,200,0.18)"
                          : "rgba(242,209,0,0.18)",
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 12 }}>
                      {status}
                    </Text>
                  </View>
                </View>

                <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
                  Teams: {count} • Age rules + verification ready
                </Text>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  <TouchableOpacity
                    onPress={() => router.push(`/tournaments/${t.id}/teams`)}
                    style={{
                      backgroundColor: "rgba(34,198,210,0.18)",
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Teams</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push(`/tournaments/${t.id}/join-team`)}
                    style={{
                      backgroundColor: "rgba(242,209,0,0.18)",
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Join</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push(`/tournaments/${t.id}`)}
                    style={{
                      backgroundColor: "rgba(52,199,89,0.18)",
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Open</Text>
                  </TouchableOpacity>
                </View>

                <Text style={{ color: "#22C6D2", marginTop: 12, fontWeight: "900" }}>
                  Tap card to manage →
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {!list.length ? (
          <View style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 14 }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>No tournaments yet</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 8 }}>
              Create one for DMV / NEVT now. Teams will sign up and you’ll reuse all that data for NVT.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/tournaments/create")}
              style={{
                marginTop: 12,
                backgroundColor: "#F2D100",
                paddingVertical: 12,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>Create Tournament</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
