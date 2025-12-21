import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppStore, calcAge, ageBannerStyle } from "../../../src/state/AppStore";

export default function AddPlayerScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const router = useRouter();
  const { teams, tournaments, addPlayer } = useAppStore();

  const team = teams.find((t) => t.id === teamId);
  const tournament = tournaments.find((t) => t.id === team?.tournamentId);

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD

  const previewAge = useMemo(() => (dob ? calcAge(dob) : null), [dob]);

  const onSubmit = () => {
    if (!team || !tournament) {
      Alert.alert("Error", "Team/tournament not found.");
      return;
    }

    const res = addPlayer({
      leagueId: team.leagueId,
      tournamentId: team.tournamentId,
      teamId: team.id,
      fullName,
      dob,
    });

    if (!res.ok) {
      Alert.alert("Cannot Add Player", res.reason ?? "Unknown error");
      return;
    }

    router.replace(`/teams/${team.id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Add Player</Text>
      <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
        Team: {team?.name ?? ""}  Band: {tournament?.ageBand ?? ""}
      </Text>

      {/* Age Preview Banner */}
      {typeof previewAge === "number" ? (
        <View style={{ marginTop: 12, borderRadius: 14, overflow: "hidden" }}>
          {(() => {
            const b = ageBannerStyle(previewAge);
            return (
              <View style={{ backgroundColor: b.bg, padding: 12 }}>
                <Text style={{ color: b.fg, fontWeight: "900" }}>
                  Preview: {b.label}  Age {previewAge}
                </Text>
              </View>
            );
          })()}
        </View>
      ) : null}

      <View style={{ marginTop: 14, backgroundColor: "#0A2238", borderRadius: 14, padding: 14 }}>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full name"
          placeholderTextColor="#9FB3C8"
          style={{ color: "#EAF2FF", paddingVertical: 10 }}
        />
        <TextInput
          value={dob}
          onChangeText={setDob}
          placeholder="DOB (YYYY-MM-DD)"
          placeholderTextColor="#9FB3C8"
          style={{ color: "#EAF2FF", paddingVertical: 10 }}
        />

        <TouchableOpacity onPress={onSubmit} style={{ marginTop: 10, backgroundColor: "#F2D100", padding: 12, borderRadius: 12, alignItems: "center" }}>
          <Text style={{ fontWeight: "900", color: "#061A2B" }}>Save Player</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
