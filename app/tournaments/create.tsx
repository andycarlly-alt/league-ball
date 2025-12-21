import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "../../src/state/AppStore";

type AgeRule = "U30" | "30_34" | "O35";

export default function CreateTournamentScreen() {
  const router = useRouter();
  const { createTournament, activeLeagueId, leagues } = useAppStore();

  const leagueName = useMemo(() => leagues.find((l) => l.id === activeLeagueId)?.name ?? "League", [leagues, activeLeagueId]);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [ageRule, setAgeRule] = useState<AgeRule>("O35");
  const [status, setStatus] = useState<"Draft" | "Open" | "Closed">("Open");

  const ageRuleLabel = (r: AgeRule) => (r === "U30" ? "Under 30" : r === "30_34" ? "3034" : "35+");

  const submit = () => {
    const n = name.trim();
    if (!n) return Alert.alert("Missing", "Enter tournament name.");
    const tourney = createTournament({
      leagueId: activeLeagueId,
      name: n,
      location: location.trim(),
      ageRule,
      ageRuleLabel: ageRuleLabel(ageRule),
      status,
    });
    router.replace(`/tournaments/${tourney.id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Create Tournament</Text>
        <Text style={{ color: "#9FB3C8" }}>{leagueName}</Text>

        <View style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Tournament Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g., DMV Summer Classic"
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{ marginTop: 10, backgroundColor: "#0B2842", color: "#EAF2FF", borderRadius: 12, padding: 12 }}
          />

          <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 14 }}>Location</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="City / Venue (optional)"
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{ marginTop: 10, backgroundColor: "#0B2842", color: "#EAF2FF", borderRadius: 12, padding: 12 }}
          />

          <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 14 }}>Age Rule</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            {(["U30", "30_34", "O35"] as AgeRule[]).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setAgeRule(r)}
                style={{
                  backgroundColor: ageRule === r ? "#F2D100" : "#0B2842",
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontWeight: "900", color: "#061A2B" }}>{ageRuleLabel(r)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 14 }}>Status</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            {(["Open", "Draft", "Closed"] as const).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setStatus(s)}
                style={{
                  backgroundColor: status === s ? "#22C6D2" : "#0B2842",
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontWeight: "900", color: "#061A2B" }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={submit}
            style={{ marginTop: 16, backgroundColor: "#22C6D2", padding: 14, borderRadius: 14, alignItems: "center" }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>Create</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 10, padding: 10, alignItems: "center" }}>
            <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
