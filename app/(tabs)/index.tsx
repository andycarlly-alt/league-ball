// app/(tabs)/index.tsx
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";

export default function HomeTab() {
  const router = useRouter();
  const { activeLeagueId, leagues, tournaments, matches } = useAppStore() as any;

  const activeLeague = useMemo(() => {
    return (leagues ?? []).find((l: any) => l.id === activeLeagueId);
  }, [leagues, activeLeagueId]);

  const latestTournament = useMemo(() => {
    const list = (tournaments ?? [])
      .filter((t: any) => t.leagueId === activeLeagueId)
      .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return list[0];
  }, [tournaments, activeLeagueId]);

  const liveNowCount = useMemo(() => {
    return (matches ?? []).filter(
      (m: any) => m.leagueId === activeLeagueId && m.status === "LIVE"
    ).length;
  }, [matches, activeLeagueId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>
            NVT
          </Text>
          <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
            {activeLeague?.name ?? "League"}{"  "}
            {activeLeague?.plan ? `${activeLeague.plan} Plan` : ""}
          </Text>
        </View>

        {/* ✅ NVT logo (replaces LB) */}
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.06)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.10)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../../assets/logos/brand/nvt.png")}
            style={{ width: 44, height: 44, borderRadius: 12 }}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Main CTA card */}
      <View
        style={{
          marginTop: 14,
          backgroundColor: "#0A2238",
          borderRadius: 18,
          padding: 14,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 18 }}>
          Run DMV / NEVT leagues all year.
        </Text>
        <Text style={{ color: "#9FB3C8", marginTop: 10, lineHeight: 20 }}>
          Teams + players register once. When Labor Day NVT comes, you instantly pull verified
          rosters, enforce age rules, and streamline check-in.
        </Text>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <TouchableOpacity
            onPress={() => router.push("/tournaments/create")}
            style={{
              backgroundColor: "#F2D100",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>Create Tournament</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/live")}
            style={{
              backgroundColor: "rgba(34,198,210,0.9)",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>Go Live</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/teams")}
            style={{
              backgroundColor: "rgba(52,199,89,0.85)",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>Teams</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live now */}
      <View
        style={{
          marginTop: 14,
          backgroundColor: "#0A2238",
          borderRadius: 16,
          padding: 14,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16 }}>Live Now</Text>
        <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
          {liveNowCount ? `${liveNowCount} match(es) live` : "No live matches right now"}
        </Text>
      </View>

      {/* Tournament snapshot */}
      <View
        style={{
          marginTop: 14,
          backgroundColor: "#0A2238",
          borderRadius: 16,
          padding: 14,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16 }}>
          Tournament Snapshot
        </Text>
        <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
          {latestTournament?.name ?? "—"}
        </Text>

        <TouchableOpacity
          onPress={() => (latestTournament?.id ? router.push(`/tournaments/${latestTournament.id}`) : router.push("/tournaments"))}
          style={{
            marginTop: 12,
            backgroundColor: "rgba(255,255,255,0.06)",
            borderRadius: 14,
            padding: 12,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.10)",
          }}
        >
          <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Open tournament</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
            Manage teams • schedule matches • verify ages
          </Text>
        </TouchableOpacity>
      </View>

      {/* Announcements + messages shortcut */}
      <ScrollView style={{ marginTop: 14 }} contentContainerStyle={{ gap: 12, paddingBottom: 30 }}>
        <View
          style={{
            backgroundColor: "#0A2238",
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16 }}>Announcements</Text>

          <View
            style={{
              marginTop: 12,
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: 12,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.10)",
            }}
          >
            <Text style={{ color: "#22C6D2", fontWeight: "900" }}>Roster Lock Reminder</Text>
            <Text style={{ color: "#EAF2FF", marginTop: 6 }}>
              Ensure all players are verified before roster lock.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/messages")}
            style={{
              marginTop: 14,
              backgroundColor: "#F2D100",
              borderRadius: 14,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>Open Messages</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
