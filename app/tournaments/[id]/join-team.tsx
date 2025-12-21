import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppStore } from "../../../src/state/AppStore";

export default function JoinTeamScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tournaments, registerTeamForTournament } = useAppStore();

  const t = tournaments.find((x) => x.id === id);

  const [teamName, setTeamName] = useState("");
  const [repName, setRepName] = useState("");
  const [repPhone, setRepPhone] = useState("");

  if (!t) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Join Team</Text>
        <Text style={{ color: "#9FB3C8", marginTop: 8 }}>Tournament not found.</Text>
      </View>
    );
  }

  const submit = () => {
    const tn = teamName.trim();
    if (!tn) return Alert.alert("Missing", "Enter team name.");
    const rn = repName.trim();
    if (!rn) return Alert.alert("Missing", "Enter rep/coach name.");

    registerTeamForTournament({
      tournamentId: t.id,
      teamName: tn,
      repName: rn,
      repPhone: repPhone.trim(),
    });

    router.replace(`/tournaments/${t.id}/teams`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Register Team</Text>
        <Text style={{ color: "#9FB3C8" }}>{t.name}  {t.ageRuleLabel ?? "Age rule TBD"}</Text>

        <View style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Team Name</Text>
          <TextInput
            value={teamName}
            onChangeText={setTeamName}
            placeholder="e.g., Baltimore Vets"
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{ marginTop: 10, backgroundColor: "#0B2842", color: "#EAF2FF", borderRadius: 12, padding: 12 }}
          />

          <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 14 }}>Team Rep / Coach</Text>
          <TextInput
            value={repName}
            onChangeText={setRepName}
            placeholder="Your name"
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{ marginTop: 10, backgroundColor: "#0B2842", color: "#EAF2FF", borderRadius: 12, padding: 12 }}
          />

          <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 14 }}>Phone (optional)</Text>
          <TextInput
            value={repPhone}
            onChangeText={setRepPhone}
            placeholder="(optional)"
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{ marginTop: 10, backgroundColor: "#0B2842", color: "#EAF2FF", borderRadius: 12, padding: 12 }}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            onPress={submit}
            style={{ marginTop: 16, backgroundColor: "#22C6D2", padding: 14, borderRadius: 14, alignItems: "center" }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>Submit Registration</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 10, padding: 10, alignItems: "center" }}>
            <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 14 }}>
          <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Next</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 8 }}>
            Next screen well add: Add Players / Invite Players + age verification rules (U30, 3034, 35+).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
