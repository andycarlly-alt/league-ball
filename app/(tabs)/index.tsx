import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "../../src/state/AppStore";

export default function HomeTab() {
  const router = useRouter();
  const { leagues, activeLeagueId, tournaments, matches, announcements } = useAppStore() as any;

  const league = useMemo(
    () => (leagues ?? []).find((l: any) => l.id === activeLeagueId),
    [leagues, activeLeagueId]
  );

  const activeTournaments = useMemo(
    () => (tournaments ?? []).filter((t: any) => t.leagueId === activeLeagueId),
    [tournaments, activeLeagueId]
  );

  const latestTournament = activeTournaments?.[0];

  const liveMatches = useMemo(() => {
    // simple heuristic: matches with status LIVE
    return (matches ?? []).filter((m: any) => m.status === "LIVE");
  }, [matches]);

  const latestAnnouncement = useMemo(() => {
    const list = (announcements ?? []).filter((a: any) => a.leagueId === activeLeagueId);
    return list.sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0))[0];
  }, [announcements, activeLeagueId]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#061A2B" }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View>
          <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>NVT</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 4 }}>
            {league?.name ?? "League"}  {league?.plan ?? "Free"} Plan
          </Text>
        </View>

        {/* Optional: if you later add the NVT logo asset */}
        {/* <Image source={require("../../assets/nvt-logo.png")} style={{ width: 44, height: 44 }} /> */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: "#0A2238",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.10)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#22C6D2", fontWeight: "900" }}>LB</Text>
        </View>
      </View>

      {/* Big CTA Card */}
      <View
        style={{
          backgroundColor: "#0A2238",
          borderRadius: 18,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.10)",
        }}
      >
        <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
          Run DMV / NEVT leagues all year.
        </Text>
        <Text style={{ color: "#9FB3C8", marginTop: 8, lineHeight: 18 }}>
          Teams + players register once. When Labor Day NVT comes, you instantly pull verified rosters,
          enforce age rules, and streamline check-in.
        </Text>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <TouchableOpacity
            onPress={() => router.push("/tournaments/create")}
            style={{
              backgroundColor: "#F2D100",
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>Create Tournament</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/live")}
            style={{
              backgroundColor: "#22C6D2",
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>Go Live</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/teams")}
            style={{
              backgroundColor: "#34C759",
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>Teams</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Now */}
      <View style={{ backgroundColor: "#0B2842", borderRadius: 18, padding: 16 }}>
        <Text style={{ color: "#F2D100", fontWeight: "900" }}>Live Now</Text>
        <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
          {liveMatches.length ? `${liveMatches.length} match(es) live` : "No live matches right now"}
        </Text>

        {!!liveMatches.length ? (
          <View style={{ marginTop: 10, gap: 10 }}>
            {liveMatches.slice(0, 3).map((m: any) => (
              <TouchableOpacity key={m.id} onPress={() => router.push(`/live/${m.id}`)}>
                <View
                  style={{
                    backgroundColor: "#0A2238",
                    borderRadius: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                    {m.homeTeamName ?? "Home"} vs {m.awayTeamName ?? "Away"}
                  </Text>
                  <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
                    Tap to view live score + timeline + ads
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>

      {/* Tournament Snapshot */}
      <View style={{ backgroundColor: "#0B2842", borderRadius: 18, padding: 16 }}>
        <Text style={{ color: "#F2D100", fontWeight: "900" }}>Tournament Snapshot</Text>
        <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
          {latestTournament ? latestTournament.name : "No tournaments yet"}
        </Text>

        {latestTournament ? (
          <TouchableOpacity
            onPress={() => router.push(`/tournaments/${latestTournament.id}`)}
            style={{
              marginTop: 10,
              backgroundColor: "#0A2238",
              borderRadius: 14,
              padding: 12,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Open tournament</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
              Manage teams  schedule matches  verify ages
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Announcements */}
      <View style={{ backgroundColor: "#0B2842", borderRadius: 18, padding: 16 }}>
        <Text style={{ color: "#F2D100", fontWeight: "900" }}>Announcements</Text>

        {latestAnnouncement ? (
          <View style={{ marginTop: 10, backgroundColor: "#0A2238", borderRadius: 14, padding: 12 }}>
            <Text style={{ color: "#22C6D2", fontWeight: "900" }}>
              {latestAnnouncement.title ?? "Update"}
            </Text>
            <Text style={{ color: "#EAF2FF", marginTop: 6 }}>
              {latestAnnouncement.body ?? ""}
            </Text>
          </View>
        ) : (
          <Text style={{ color: "#9FB3C8", marginTop: 10 }}>
            No announcements yet. Admins can post updates for the league and teams.
          </Text>
        )}

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/messages")}
          style={{
            marginTop: 12,
            backgroundColor: "#F2D100",
            paddingVertical: 12,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#061A2B", fontWeight: "900" }}>Open Messages</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 10 }} />
    </ScrollView>
  );
}
