// app/(tabs)/messages.tsx
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource } from "../../src/utils/logos";

export default function MessagesTab() {
  const router = useRouter();
  const store: any = useAppStore();

  const announcements = store?.announcements ?? [];
  const teams = store?.teams ?? [];
  const activeLeagueId = store?.activeLeagueId ?? "league_default";

  const leagueTeams = useMemo(() => {
    return (teams ?? [])
      .filter((t: any) => (t?.leagueId ?? "league_default") === activeLeagueId)
      .sort((a: any, b: any) =>
        String(a?.name ?? "").localeCompare(String(b?.name ?? ""))
      );
  }, [teams, activeLeagueId]);

  const leagueAnnouncements = useMemo(() => {
    return (announcements ?? [])
      .filter((a: any) => (a?.leagueId ?? activeLeagueId) === activeLeagueId)
      .sort((a: any, b: any) => (b?.createdAt ?? 0) - (a?.createdAt ?? 0));
  }, [announcements, activeLeagueId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>
        Messages
      </Text>
      <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
        Admin announcements + team chats
      </Text>

      <ScrollView
        style={{ marginTop: 14 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 30 }}
      >
        {/* Announcements */}
        <Text style={{ color: "#22C6D2", fontWeight: "900" }}>
          Announcements
        </Text>

        {!leagueAnnouncements.length ? (
          <View
            style={{
              backgroundColor: "#0A2238",
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
              No announcements yet
            </Text>
            <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
              This is where admins will post updates for all teams.
            </Text>
          </View>
        ) : (
          leagueAnnouncements.map((a: any) => (
            <View
              key={a.id}
              style={{
                backgroundColor: "#0A2238",
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                {a.title ?? "Announcement"}
              </Text>
              {!!a.body ? (
                <Text style={{ color: "#9FB3C8", marginTop: 6 }}>{a.body}</Text>
              ) : null}
            </View>
          ))
        )}

        {/* Team Chats */}
        <Text style={{ color: "#22C6D2", fontWeight: "900", marginTop: 10 }}>
          Team Chats
        </Text>

        {!leagueTeams.length ? (
          <View
            style={{
              backgroundColor: "#0A2238",
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
              No teams yet
            </Text>
            <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
              Add teams in the Teams tab to enable team chats here.
            </Text>
          </View>
        ) : (
          leagueTeams.map((t: any) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => router.push(`/messages/team/${t.id}`)}
            >
              <View
                style={{
                  backgroundColor: "#0A2238",
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Image
                  source={getLogoSource(t.logoKey)}
                  style={{ width: 40, height: 40, borderRadius: 14 }}
                />

                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                    {t.name}
                  </Text>
                  <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
                    Tap to open chat
                  </Text>
                </View>

                <Text style={{ color: "#22C6D2", fontWeight: "900" }}>
                  Open →
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
