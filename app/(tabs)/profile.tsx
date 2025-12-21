import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";

const roles = ["LEAGUE_ADMIN", "TOURNAMENT_ADMIN", "TEAM_REP", "REFEREE", "FAN"];

export default function ProfileTab() {
  const store: any = useAppStore();

  const {
    currentUser,
    setRole,
    leagues,
    activeLeagueId,
    setActiveLeague,
    teams,
    setTeamForRep,
  } = store;

  const activeLeague = (leagues ?? []).find((l: any) => l.id === activeLeagueId);
  const leagueTeams = (teams ?? []).filter((t: any) => t.leagueId === activeLeagueId);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#061A2B" }}
      contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 30 }}
    >
      <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>
        Profile
      </Text>

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
          {currentUser?.name ?? "User"}
        </Text>

        <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
          Role:{" "}
          <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
            {currentUser?.role ?? ""}
          </Text>
        </Text>

        <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
          League:{" "}
          <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
            {activeLeague?.name ?? activeLeagueId ?? ""}
          </Text>
        </Text>

        <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
          Plan:{" "}
          <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
            {activeLeague?.plan ?? "Free"}
          </Text>
        </Text>

        <Text style={{ color: "#9FB3C8", marginTop: 10 }}>
          Demo controls for now (well lock this down later with auth + subscriptions).
        </Text>
      </View>

      <View style={{ backgroundColor: "#0B2842", borderRadius: 14, padding: 14 }}>
        <Text style={{ color: "#F2D100", fontWeight: "900" }}>Switch League</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
          {(leagues ?? []).map((l: any) => {
            const active = l.id === activeLeagueId;
            return (
              <TouchableOpacity
                key={l.id}
                onPress={() => setActiveLeague(l.id)}
                style={{
                  backgroundColor: active ? "#F2D100" : "#0A2238",
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <Text style={{ fontWeight: "900", color: active ? "#061A2B" : "#EAF2FF" }}>
                  {l.name} ({l.plan})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={{ backgroundColor: "#0B2842", borderRadius: 14, padding: 14 }}>
        <Text style={{ color: "#F2D100", fontWeight: "900" }}>Switch Role</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
          {roles.map((r) => {
            const active = r === currentUser?.role;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r)}
                style={{
                  backgroundColor: active ? "#22C6D2" : "#0A2238",
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <Text style={{ fontWeight: "900", color: active ? "#061A2B" : "#EAF2FF" }}>
                  {r}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {currentUser?.role === "TEAM_REP" && typeof setTeamForRep === "function" ? (
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: "#9FB3C8" }}>Team Rep: select your team</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
              {leagueTeams.map((t: any) => {
                const active = t.id === currentUser?.teamId;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setTeamForRep(t.id)}
                    style={{
                      backgroundColor: active ? "#34C759" : "#0A2238",
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <Text style={{ fontWeight: "900", color: "#061A2B" }}>{t.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}
      </View>

      <View
        style={{
          backgroundColor: "#0A2238",
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Next build</Text>
        <Text style={{ color: "#9FB3C8", marginTop: 8 }}>
           Login + role-based permissions{"\n"}
           League subscriptions (Stripe){"\n"}
           Tournament signup workflow for DMV/NEVT/NVT{"\n"}
           Roster lock + age verification rules
        </Text>
      </View>
    </ScrollView>
  );
}
