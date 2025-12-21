import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";

export default function MessagesTab() {
  const router = useRouter();
  const { announcements, teams, activeLeagueId } = useAppStore();

  const leagueAnnouncements = (announcements ?? []).filter(
    (a: any) => a.leagueId === activeLeagueId
  );

  const leagueTeams = (teams ?? []).filter((t: any) => t.leagueId === activeLeagueId);

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
        <Text style={{ color: "#22C6D2", fontWeight: "900" }}>Announcements</Text>

        {leagueAnnouncements.map((a: any) => (
          <View
            key={a.id}
            style={{
              backgroundColor: "#0A2238",
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Text style={{ color: "#F2D100", fontWeight: "900" }}>{a.title}</Text>
            <Text style={{ color: "#EAF2FF", opacity: 0.9, marginTop: 6 }}>
              {a.body}
            </Text>
          </View>
        ))}

        {!leagueAnnouncements.length ? (
          <Text style={{ color: "#9FB3C8" }}>No announcements yet.</Text>
        ) : null}

        <Text style={{ color: "#22C6D2", fontWeight: "900", marginTop: 10 }}>
          Team Chats
        </Text>

        {leagueTeams.map((t: any) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => router.push(`/messages/team/${t.id}`)}
          >
            <View
              style={{
                backgroundColor: "#0A2238",
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{t.name}</Text>
              <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
                Tap to open chat
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
