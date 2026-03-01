// app/admin/settings.tsx - LEAGUE SETTINGS & RULES
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";

export default function AdminSettings() {
  const router = useRouter();
  const { activeLeagueId, leagues, updateLeagueSettings } = useAppStore() as any;

  const activeLeague = (leagues ?? []).find((l: any) => l.id === activeLeagueId);

  // League settings state
  const [leagueName, setLeagueName] = useState(activeLeague?.name || "");
  const [minAge, setMinAge] = useState(activeLeague?.minAge?.toString() || "18");
  const [maxAge, setMaxAge] = useState(activeLeague?.maxAge?.toString() || "");
  const [matchDuration, setMatchDuration] = useState(activeLeague?.matchDuration?.toString() || "90");
  const [halfTimeDuration, setHalfTimeDuration] = useState(activeLeague?.halfTimeDuration?.toString() || "15");
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState(activeLeague?.maxPlayersPerTeam?.toString() || "20");
  const [minPlayersPerTeam, setMinPlayersPerTeam] = useState(activeLeague?.minPlayersPerTeam?.toString() || "11");

  // Rule toggles
  const [allowGuestPlayers, setAllowGuestPlayers] = useState(activeLeague?.allowGuestPlayers ?? true);
  const [allowTransfers, setAllowTransfers] = useState(activeLeague?.allowTransfers ?? true);
  const [requirePlayerInsurance, setRequirePlayerInsurance] = useState(activeLeague?.requirePlayerInsurance ?? false);
  const [enableBettingPool, setEnableBettingPool] = useState(activeLeague?.enableBettingPool ?? true);
  const [autoSuspendOnRedCard, setAutoSuspendOnRedCard] = useState(activeLeague?.autoSuspendOnRedCard ?? true);

  // Fine amounts
  const [yellowCardFine, setYellowCardFine] = useState(activeLeague?.yellowCardFine?.toString() || "25");
  const [redCardFine, setRedCardFine] = useState(activeLeague?.redCardFine?.toString() || "75");
  const [lateFeeFine, setLateFeeFine] = useState(activeLeague?.lateFeeFine?.toString() || "50");

  const saveSettings = () => {
    const settings = {
      name: leagueName,
      minAge: parseInt(minAge) || 18,
      maxAge: maxAge ? parseInt(maxAge) : null,
      matchDuration: parseInt(matchDuration) || 90,
      halfTimeDuration: parseInt(halfTimeDuration) || 15,
      maxPlayersPerTeam: parseInt(maxPlayersPerTeam) || 20,
      minPlayersPerTeam: parseInt(minPlayersPerTeam) || 11,
      allowGuestPlayers,
      allowTransfers,
      requirePlayerInsurance,
      enableBettingPool,
      autoSuspendOnRedCard,
      yellowCardFine: parseFloat(yellowCardFine) * 100 || 2500,
      redCardFine: parseFloat(redCardFine) * 100 || 7500,
      lateFeeFine: parseFloat(lateFeeFine) * 100 || 5000,
    };

    if (typeof updateLeagueSettings === "function") {
      updateLeagueSettings(activeLeagueId, settings);
      Alert.alert("✅ Settings Saved", "League settings updated successfully");
    } else {
      Alert.alert("Settings Updated", "League rules configured");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Text style={{ color: "#22C6D2", fontSize: 24 }}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900" }}>League Settings</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 4 }}>Configure rules and regulations</Text>
          </View>
        </View>

        {/* Basic Info */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: "#EAF2FF", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
            📋 Basic Information
          </Text>

          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: "#9FB3C8", marginBottom: 6, fontSize: 13 }}>League Name</Text>
            <TextInput
              value={leagueName}
              onChangeText={setLeagueName}
              placeholder="Enter league name"
              placeholderTextColor="rgba(255,255,255,0.3)"
              style={{
                backgroundColor: "#0A2238",
                color: "#EAF2FF",
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                fontWeight: "900",
              }}
            />
          </View>
        </View>

        {/* Age Rules */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: "#EAF2FF", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
            👤 Age Requirements
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#9FB3C8", marginBottom: 6, fontSize: 13 }}>Minimum Age</Text>
              <TextInput
                value={minAge}
                onChangeText={setMinAge}
                keyboardType="number-pad"
                placeholder="18"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0A2238",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  fontWeight: "900",
                }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: "#9FB3C8", marginBottom: 6, fontSize: 13 }}>Maximum Age (Optional)</Text>
              <TextInput
                value={maxAge}
                onChangeText={setMaxAge}
                keyboardType="number-pad"
                placeholder="No limit"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0A2238",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  fontWeight: "900",
                }}
              />
            </View>
          </View>
        </View>

        {/* Match Duration */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: "#EAF2FF", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
            ⏱️ Match Duration
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#9FB3C8", marginBottom: 6, fontSize: 13 }}>Game Length (minutes)</Text>
              <TextInput
                value={matchDuration}
                onChangeText={setMatchDuration}
                keyboardType="number-pad"
                placeholder="90"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0A2238",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  fontWeight: "900",
                }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: "#9FB3C8", marginBottom: 6, fontSize: 13 }}>Half Time (minutes)</Text>
              <TextInput
                value={halfTimeDuration}
                onChangeText={setHalfTimeDuration}
                keyboardType="number-pad"
                placeholder="15"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0A2238",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  fontWeight: "900",
                }}
              />
            </View>
          </View>
        </View>

        {/* Team Size */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: "#EAF2FF", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
            👥 Roster Limits
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#9FB3C8", marginBottom: 6, fontSize: 13 }}>Min Players</Text>
              <TextInput
                value={minPlayersPerTeam}
                onChangeText={setMinPlayersPerTeam}
                keyboardType="number-pad"
                placeholder="11"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0A2238",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  fontWeight: "900",
                }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: "#9FB3C8", marginBottom: 6, fontSize: 13 }}>Max Players</Text>
              <TextInput
                value={maxPlayersPerTeam}
                onChangeText={setMaxPlayersPerTeam}
                keyboardType="number-pad"
                placeholder="20"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0A2238",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  fontWeight: "900",
                }}
              />
            </View>
          </View>
        </View>

        {/* Fines */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: "#EAF2FF", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
            💰 Fine Amounts
          </Text>

          <View style={{ gap: 10 }}>
            <View>
              <Text style={{ color: "#9FB3C8", marginBottom: 6, fontSize: 13 }}>Yellow Card Fine ($)</Text>
              <TextInput
                value={yellowCardFine}
                onChangeText={setYellowCardFine}
                keyboardType="decimal-pad"
                placeholder="25.00"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0A2238",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  fontWeight: "900",
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#9FB3C8", marginBottom: 6, fontSize: 13 }}>Red Card Fine ($)</Text>
              <TextInput
                value={redCardFine}
                onChangeText={setRedCardFine}
                keyboardType="decimal-pad"
                placeholder="75.00"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0A2238",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  fontWeight: "900",
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#9FB3C8", marginBottom: 6, fontSize: 13 }}>Late Payment Fee ($)</Text>
              <TextInput
                value={lateFeeFine}
                onChangeText={setLateFeeFine}
                keyboardType="decimal-pad"
                placeholder="50.00"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0A2238",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  fontWeight: "900",
                }}
              />
            </View>
          </View>
        </View>

        {/* League Rules */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: "#EAF2FF", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
            ⚖️ League Rules
          </Text>

          <View style={{ backgroundColor: "#0A2238", borderRadius: 12, padding: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            {[
              { label: "Allow Guest Players", value: allowGuestPlayers, setter: setAllowGuestPlayers },
              { label: "Allow Player Transfers", value: allowTransfers, setter: setAllowTransfers },
              { label: "Require Player Insurance", value: requirePlayerInsurance, setter: setRequirePlayerInsurance },
              { label: "Enable Betting Pool", value: enableBettingPool, setter: setEnableBettingPool },
              { label: "Auto-Suspend on Red Card", value: autoSuspendOnRedCard, setter: setAutoSuspendOnRedCard },
            ].map((rule, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 12,
                  borderBottomWidth: index < 4 ? 1 : 0,
                  borderBottomColor: "rgba(255,255,255,0.05)",
                }}
              >
                <Text style={{ color: "#EAF2FF", fontSize: 14, flex: 1 }}>{rule.label}</Text>
                <Switch
                  value={rule.value}
                  onValueChange={rule.setter}
                  trackColor={{ false: "#767577", true: "#34C759" }}
                  thumbColor={rule.value ? "#f4f3f4" : "#f4f3f4"}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={saveSettings}
          style={{
            backgroundColor: "#F2D100",
            padding: 16,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>💾 Save Settings</Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={{ marginTop: 20, backgroundColor: "rgba(34,198,210,0.1)", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(34,198,210,0.3)" }}>
          <Text style={{ color: "#22C6D2", fontSize: 12, lineHeight: 18 }}>
            💡 <Text style={{ fontWeight: "900" }}>Note:</Text> Changes will apply to all future matches and tournaments. Existing matches retain their original settings.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}