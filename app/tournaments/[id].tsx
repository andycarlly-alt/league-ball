import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppStore } from "../../src/state/AppStore";

export default function TournamentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tournaments, getTeamsForTournament, can } = useAppStore();

  const t = tournaments.find((x) => x.id === id);

  const teams = useMemo(() => (t ? getTeamsForTournament(t.id) : []), [t?.id]);

  if (!t) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Tournament</Text>
        <Text style={{ color: "#9FB3C8", marginTop: 8 }}>Not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>{t.name}</Text>
        <Text style={{ color: "#9FB3C8" }}>{t.location ?? "Location TBD"}  {t.ageRuleLabel ?? "Age rule TBD"}  {t.status}</Text>

        <View style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Teams Signed Up</Text>
          <Text style={{ color: "#22C6D2", fontWeight: "900", marginTop: 6 }}>{teams.length}</Text>

          <TouchableOpacity
            onPress={() => router.push(`/tournaments/${t.id}/teams`)}
            style={{ marginTop: 12, backgroundColor: "#0B2842", padding: 12, borderRadius: 12, alignItems: "center" }}
          >
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>View Teams</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push(`/tournaments/${t.id}/join-team`)}
            style={{ marginTop: 10, backgroundColor: "#22C6D2", padding: 12, borderRadius: 12, alignItems: "center" }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>Join as Team Rep / Coach</Text>
          </TouchableOpacity>

          {can("VIEW_ADMIN") ? (
            <Text style={{ color: "#9FB3C8", marginTop: 12 }}>
              Admin tools next: approvals, scheduling, brackets, and payments.
            </Text>
          ) : (
            <Text style={{ color: "#9FB3C8", marginTop: 12 }}>
              Team Reps can register their team and later add players to meet age rules.
            </Text>
          )}
        </View>

        <View style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Why this matters for NVT</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 8 }}>
            When DMV/NEVT teams use this app, their roster + verification history is already captured.
            For Labor Day NVT, they can reuse the same verified players and move them into the NVT tournament fast.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
