// app/tournaments/[id]/settings.tsx - NEW FILE

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../../src/state/AppStore";
import { normalize, spacing } from "../../../src/utils/responsive";

export default function TournamentSettingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tournamentId = String(id ?? "");

  const {
    tournaments,
    updateTournament,
    can,
  } = useAppStore() as any;

  const tournament = useMemo(
    () => tournaments.find((t: any) => t.id === tournamentId),
    [tournaments, tournamentId]
  );

  const [name, setName] = useState(tournament?.name || "");
  const [location, setLocation] = useState(tournament?.location || "");
  const [startDate, setStartDate] = useState(tournament?.startDate || "");
  const [endDate, setEndDate] = useState(tournament?.endDate || "");
  const [status, setStatus] = useState(tournament?.status || "DRAFT");
  const [registrationFee, setRegistrationFee] = useState(
    tournament?.registrationFee ? String(tournament.registrationFee / 100) : "150"
  );
  const [maxTeams, setMaxTeams] = useState(String(tournament?.maxTeams || 24));

  const canManage = can("MANAGE_TOURNAMENTS");

  if (!canManage) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: "#EAF2FF", marginTop: 20 }}>Access denied</Text>
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: "#EAF2FF", marginTop: 20 }}>Tournament not found</Text>
      </View>
    );
  }

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Tournament name is required");
      return;
    }

    const updates = {
      name: name.trim(),
      location: location.trim(),
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      status,
      registrationFee: Math.round(parseFloat(registrationFee) * 100),
      maxTeams: parseInt(maxTeams),
    };

    updateTournament(tournamentId, updates);

    Alert.alert(
      "✅ Settings Saved",
      "Tournament settings have been updated successfully.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.huge }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: spacing.lg }}>
          <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ color: "#F2D100", fontSize: normalize(28), fontWeight: "900", marginBottom: spacing.xs }}>
          Tournament Settings
        </Text>
        <Text style={{ color: "#9FB3C8", fontSize: normalize(14), marginBottom: spacing.xl }}>
          {tournament.name}
        </Text>

        {/* Form */}
        <View style={{ gap: spacing.lg }}>
          {/* Name */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(16), marginBottom: spacing.xs }}>
              Tournament Name *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Spring Championship 2026"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={{
                backgroundColor: "#0A2238",
                color: "#EAF2FF",
                borderRadius: normalize(12),
                padding: spacing.md,
                fontSize: normalize(16),
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </View>

          {/* Location */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(16), marginBottom: spacing.xs }}>
              Location
            </Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="e.g., Springfield Sports Complex"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={{
                backgroundColor: "#0A2238",
                color: "#EAF2FF",
                borderRadius: normalize(12),
                padding: spacing.md,
                fontSize: normalize(16),
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </View>

          {/* Dates */}
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(16), marginBottom: spacing.xs }}>
                Start Date
              </Text>
              <TextInput
                value={startDate}
                onChangeText={setStartDate}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={{
                  backgroundColor: "#0A2238",
                  color: "#EAF2FF",
                  borderRadius: normalize(12),
                  padding: spacing.md,
                  fontSize: normalize(16),
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(16), marginBottom: spacing.xs }}>
                End Date
              </Text>
              <TextInput
                value={endDate}
                onChangeText={setEndDate}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={{
                  backgroundColor: "#0A2238",
                  color: "#EAF2FF",
                  borderRadius: normalize(12),
                  padding: spacing.md,
                  fontSize: normalize(16),
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              />
            </View>
          </View>

          {/* Status */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(16), marginBottom: spacing.xs }}>
              Tournament Status
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.xs, flexWrap: "wrap" }}>
              {["DRAFT", "OPEN", "LIVE", "COMPLETE"].map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStatus(s)}
                  style={{
                    backgroundColor: status === s ? "#22C6D2" : "#0A2238",
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderRadius: normalize(10),
                    borderWidth: 1,
                    borderColor: status === s ? "#22C6D2" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text style={{
                    color: status === s ? "#061A2B" : "#EAF2FF",
                    fontWeight: "900",
                    fontSize: normalize(14),
                  }}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Registration Fee */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(16), marginBottom: spacing.xs }}>
              Registration Fee (USD)
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
              <Text style={{ color: "#F2D100", fontSize: normalize(24), fontWeight: "900" }}>$</Text>
              <TextInput
                value={registrationFee}
                onChangeText={setRegistrationFee}
                placeholder="150"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="decimal-pad"
                style={{
                  flex: 1,
                  backgroundColor: "#0A2238",
                  color: "#EAF2FF",
                  borderRadius: normalize(12),
                  padding: spacing.md,
                  fontSize: normalize(16),
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              />
            </View>
          </View>

          {/* Max Teams */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(16), marginBottom: spacing.xs }}>
              Maximum Teams
            </Text>
            <TextInput
              value={maxTeams}
              onChangeText={setMaxTeams}
              placeholder="24"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="number-pad"
              style={{
                backgroundColor: "#0A2238",
                color: "#EAF2FF",
                borderRadius: normalize(12),
                padding: spacing.md,
                fontSize: normalize(16),
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            style={{
              backgroundColor: "#34C759",
              borderRadius: normalize(16),
              padding: spacing.lg,
              alignItems: "center",
              marginTop: spacing.md,
            }}
          >
            <Text style={{ color: "#061A2B", fontSize: normalize(18), fontWeight: "900" }}>
              Save Changes
            </Text>
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: spacing.md,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}