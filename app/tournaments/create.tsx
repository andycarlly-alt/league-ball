// app/tournaments/create.tsx - COMPLETE WITH UNDERAGE RULES

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";

export default function CreateTournamentScreen() {
  const router = useRouter();
  const { template: templateId } = useLocalSearchParams<{ template?: string }>();
  
  const {
    createTournament,
    activeLeagueId,
    getTournamentTemplate,
    tournamentTemplates,
    can,
  } = useAppStore() as any;

  const selectedTemplate = useMemo(
    () => templateId ? getTournamentTemplate(templateId) : null,
    [templateId, tournamentTemplates]
  );

  // Basic fields
  const [name, setName] = useState("");
  const [location, setLocation] = useState(selectedTemplate?.defaultLocation || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [registrationFee, setRegistrationFee] = useState(
    selectedTemplate ? String((selectedTemplate.registrationFee || 15000) / 100) : "150"
  );
  const [ageRuleLabel, setAgeRuleLabel] = useState(selectedTemplate?.ageRuleLabel || "35+");
  const [minRosterSize, setMinRosterSize] = useState(String(selectedTemplate?.minRosterSize || 11));
  const [maxRosterSize, setMaxRosterSize] = useState(String(selectedTemplate?.maxRosterSize || 18));
  const [maxTeams, setMaxTeams] = useState(String(selectedTemplate?.maxTeams || 24));
  const [matchDuration, setMatchDuration] = useState(String(selectedTemplate?.matchDuration || 90));

  // ✅ NEW: Underage rules state
  const [underageEnabled, setUnderageEnabled] = useState(false);
  const [ageThreshold, setAgeThreshold] = useState("35");
  const [maxOnRoster, setMaxOnRoster] = useState("0");
  const [maxOnField, setMaxOnField] = useState("");
  const [lockStage, setLockStage] = useState<"GROUP_STAGE" | "KNOCKOUT" | "SEMI_FINALS" | "NEVER">("NEVER");

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

  const validateAndCreate = () => {
    if (!name.trim()) {
      Alert.alert("Missing Information", "Please enter a tournament name");
      return;
    }

    const fee = parseFloat(registrationFee);
    if (isNaN(fee) || fee < 0) {
      Alert.alert("Invalid Fee", "Please enter a valid registration fee");
      return;
    }

    const minRoster = parseInt(minRosterSize);
    const maxRoster = parseInt(maxRosterSize);
    if (isNaN(minRoster) || isNaN(maxRoster) || minRoster < 1 || maxRoster < minRoster) {
      Alert.alert("Invalid Roster Size", "Please enter valid min/max roster sizes");
      return;
    }

    const teams = parseInt(maxTeams);
    if (isNaN(teams) || teams < 2) {
      Alert.alert("Invalid Max Teams", "Please enter a valid number of teams (minimum 2)");
      return;
    }

    const duration = parseInt(matchDuration);
    if (isNaN(duration) || duration < 1) {
      Alert.alert("Invalid Match Duration", "Please enter a valid match duration");
      return;
    }

    // ✅ NEW: Validate underage rules if enabled
    if (underageEnabled) {
      const threshold = parseInt(ageThreshold);
      const maxRoster = parseInt(maxOnRoster);
      const maxField = maxOnField ? parseInt(maxOnField) : undefined;

      if (isNaN(threshold) || threshold < 18 || threshold > 60) {
        Alert.alert("Invalid Age Threshold", "Age threshold must be between 18 and 60");
        return;
      }

      if (isNaN(maxRoster) || maxRoster < 0) {
        Alert.alert("Invalid Roster Limit", "Please enter a valid max underaged players on roster (0 or more)");
        return;
      }

      if (maxField !== undefined && (isNaN(maxField) || maxField < 0 || maxField > maxRoster)) {
        Alert.alert("Invalid Field Limit", "Max on field must be between 0 and max on roster");
        return;
      }
    }

    // Create tournament with underage rules
    const newTournament = {
      name: name.trim(),
      location: location.trim(),
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      registrationFee: Math.round(fee * 100),
      ageRuleLabel: ageRuleLabel.trim(),
      minRosterSize: minRoster,
      maxRosterSize: maxRoster,
      maxTeams: teams,
      durationSec: duration * 60,
      leagueId: activeLeagueId,
      status: "DRAFT",
      // ✅ NEW: Include underage rules
      underageRules: underageEnabled ? {
        enabled: true,
        ageThreshold: parseInt(ageThreshold),
        maxUnderagedOnRoster: parseInt(maxOnRoster),
        maxUnderagedOnField: maxOnField ? parseInt(maxOnField) : undefined,
        rosterLockStage: lockStage,
      } : undefined,
    };

    const result = createTournament(newTournament);
    const tournamentId = result.id;

    Alert.alert(
      "Tournament Created! 🎉",
      `${newTournament.name} has been created.${underageEnabled ? '\n\nUnderage rules are active and will be enforced automatically.' : ''}\n\nYou can now open registration and manage teams.`,
      [
        {
          text: "View Tournament",
          onPress: () => router.push(`/tournaments/${tournamentId}`),
        },
      ]
    );
  };

  // ✅ Quick template handlers
  const applyNVTStrict = () => {
    setUnderageEnabled(true);
    setAgeThreshold("35");
    setMaxOnRoster("0");
    setMaxOnField("");
    setLockStage("NEVER");
    setAgeRuleLabel("35+");
  };

  const applyNorthEast = () => {
    setUnderageEnabled(true);
    setAgeThreshold("35");
    setMaxOnRoster("3");
    setMaxOnField("");
    setLockStage("NEVER");
    setAgeRuleLabel("35+");
  };

  const applyDMV = () => {
    setUnderageEnabled(true);
    setAgeThreshold("35");
    setMaxOnRoster("5");
    setMaxOnField("3");
    setLockStage("GROUP_STAGE");
    setAgeRuleLabel("35+");
  };

  const applyNoRules = () => {
    setUnderageEnabled(false);
    setAgeThreshold("35");
    setMaxOnRoster("0");
    setMaxOnField("");
    setLockStage("NEVER");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>
          {tournamentTemplates && tournamentTemplates.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push('/league/tournament-templates')}
              style={{
                backgroundColor: "#0A2238",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 13 }}>📋 Templates</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={{ color: "#F2D100", fontSize: 28, fontWeight: "900", marginBottom: 8 }}>
          Create Tournament
        </Text>
        <Text style={{ color: "#9FB3C8", fontSize: 16, marginBottom: 24 }}>
          Set up a new tournament for your league
        </Text>

        {/* Template Info */}
        {selectedTemplate && (
          <View style={{
            backgroundColor: "rgba(52,199,89,0.1)",
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: "rgba(52,199,89,0.3)",
          }}>
            <Text style={{ color: "#34C759", fontWeight: "900", marginBottom: 6 }}>
              ✓ Using Template: {selectedTemplate.name}
            </Text>
            <Text style={{ color: "#EAF2FF", fontSize: 13 }}>
              Default values have been pre-filled. You can modify any field before creating.
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginTop: 10 }}
            >
              <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 13 }}>
                Choose Different Template →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!selectedTemplate && tournamentTemplates && tournamentTemplates.length > 0 && (
          <View style={{
            backgroundColor: "rgba(34,198,210,0.1)",
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: "rgba(34,198,210,0.3)",
          }}>
            <Text style={{ color: "#22C6D2", fontWeight: "900", marginBottom: 6 }}>
              💡 Save time with a template
            </Text>
            <Text style={{ color: "#EAF2FF", fontSize: 13, marginBottom: 10 }}>
              Use a pre-configured template to quickly set up your tournament
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/league/tournament-templates')}
              style={{
                backgroundColor: "#22C6D2",
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 14,
                alignSelf: "flex-start",
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 13 }}>
                Browse Templates
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Form */}
        <View style={{ gap: 20 }}>
          {/* Tournament Name */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
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
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </View>

          {/* Location */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
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
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </View>

          {/* Dates */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
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
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
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
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              />
            </View>
          </View>

          {/* Registration Fee */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
              Registration Fee (USD) *
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900" }}>$</Text>
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
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              />
            </View>
          </View>

          {/* Age Rule */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
              Age Rule Label *
            </Text>
            <TextInput
              value={ageRuleLabel}
              onChangeText={setAgeRuleLabel}
              placeholder="e.g., 35+, 40+, 50+"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={{
                backgroundColor: "#0A2238",
                color: "#EAF2FF",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </View>

          {/* Roster Size */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
              Roster Size *
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#9FB3C8", fontSize: 13, marginBottom: 8 }}>Minimum</Text>
                <TextInput
                  value={minRosterSize}
                  onChangeText={setMinRosterSize}
                  placeholder="11"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="number-pad"
                  style={{
                    backgroundColor: "#0A2238",
                    color: "#EAF2FF",
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#9FB3C8", fontSize: 13, marginBottom: 8 }}>Maximum</Text>
                <TextInput
                  value={maxRosterSize}
                  onChangeText={setMaxRosterSize}
                  placeholder="18"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="number-pad"
                  style={{
                    backgroundColor: "#0A2238",
                    color: "#EAF2FF",
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                />
              </View>
            </View>
          </View>

          {/* Max Teams */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
              Maximum Teams *
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
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </View>

          {/* Match Duration */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
              Match Duration (minutes) *
            </Text>
            <TextInput
              value={matchDuration}
              onChangeText={setMatchDuration}
              placeholder="90"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="number-pad"
              style={{
                backgroundColor: "#0A2238",
                color: "#EAF2FF",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </View>

          {/* ✅ NEW: Underage Player Rules Section */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 20, marginBottom: 12 }}>
              Underage Player Rules
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: 14, marginBottom: 16, lineHeight: 20 }}>
              Set age restrictions for your tournament. Choose a quick template or customize your own rules.
            </Text>
            
            {/* Quick Templates */}
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 10 }}>
              Quick Setup:
            </Text>
            
            <View style={{ gap: 10, marginBottom: 20 }}>
              {/* NVT Strict */}
              <TouchableOpacity
                onPress={applyNVTStrict}
                style={{
                  backgroundColor: underageEnabled && maxOnRoster === "0" ? "rgba(211,59,59,0.2)" : "rgba(211,59,59,0.1)",
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: 2,
                  borderColor: underageEnabled && maxOnRoster === "0" ? "#D33B3B" : "rgba(211,59,59,0.3)",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>🔥</Text>
                  <Text style={{ color: "#FF3B30", fontWeight: "900", fontSize: 15 }}>
                    STRICT 35+ ONLY (like NVT)
                  </Text>
                </View>
                <Text style={{ color: "#EAF2FF", fontSize: 13, lineHeight: 18 }}>
                  • Zero underaged players allowed{"\n"}
                  • All players must be 35+{"\n"}
                  • Strictest enforcement
                </Text>
                {underageEnabled && maxOnRoster === "0" && (
                  <View style={{ marginTop: 8, backgroundColor: "rgba(255,255,255,0.1)", padding: 6, borderRadius: 6 }}>
                    <Text style={{ color: "#34C759", fontSize: 11, fontWeight: "900" }}>✓ SELECTED</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {/* North East */}
              <TouchableOpacity
                onPress={applyNorthEast}
                style={{
                  backgroundColor: underageEnabled && maxOnRoster === "3" && !maxOnField ? "rgba(242,209,0,0.2)" : "#0A2238",
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: 2,
                  borderColor: underageEnabled && maxOnRoster === "3" && !maxOnField ? "#F2D100" : "rgba(242,209,0,0.3)",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>⚠️</Text>
                  <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 15 }}>
                    North East Rules
                  </Text>
                </View>
                <Text style={{ color: "#EAF2FF", fontSize: 13, lineHeight: 18 }}>
                  • Max 3 under-35 on roster{"\n"}
                  • Unlimited on field at once{"\n"}
                  • Moderate enforcement
                </Text>
                {underageEnabled && maxOnRoster === "3" && !maxOnField && (
                  <View style={{ marginTop: 8, backgroundColor: "rgba(255,255,255,0.1)", padding: 6, borderRadius: 6 }}>
                    <Text style={{ color: "#34C759", fontSize: 11, fontWeight: "900" }}>✓ SELECTED</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {/* DMV */}
              <TouchableOpacity
                onPress={applyDMV}
                style={{
                  backgroundColor: underageEnabled && maxOnRoster === "5" && maxOnField === "3" ? "rgba(34,198,210,0.2)" : "#0A2238",
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: 2,
                  borderColor: underageEnabled && maxOnRoster === "5" && maxOnField === "3" ? "#22C6D2" : "rgba(34,198,210,0.3)",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>🏆</Text>
                  <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 15 }}>
                    DMV League Rules
                  </Text>
                </View>
                <Text style={{ color: "#EAF2FF", fontSize: 13, lineHeight: 18 }}>
                  • Max 5 under-35 on roster{"\n"}
                  • Max 3 on field at once{"\n"}
                  • Roster locks after group stage
                </Text>
                {underageEnabled && maxOnRoster === "5" && maxOnField === "3" && (
                  <View style={{ marginTop: 8, backgroundColor: "rgba(255,255,255,0.1)", padding: 6, borderRadius: 6 }}>
                    <Text style={{ color: "#34C759", fontSize: 11, fontWeight: "900" }}>✓ SELECTED</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {/* No Rules */}
              <TouchableOpacity
                onPress={applyNoRules}
                style={{
                  backgroundColor: !underageEnabled ? "rgba(159,179,200,0.2)" : "#0A2238",
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: 2,
                  borderColor: !underageEnabled ? "#9FB3C8" : "rgba(159,179,200,0.3)",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>⭕</Text>
                  <Text style={{ color: "#9FB3C8", fontWeight: "900", fontSize: 15 }}>
                    No Underage Rules
                  </Text>
                </View>
                <Text style={{ color: "#EAF2FF", fontSize: 13, lineHeight: 18 }}>
                  • All ages allowed{"\n"}
                  • No restrictions{"\n"}
                  • Open tournament
                </Text>
                {!underageEnabled && (
                  <View style={{ marginTop: 8, backgroundColor: "rgba(255,255,255,0.1)", padding: 6, borderRadius: 6 }}>
                    <Text style={{ color: "#34C759", fontSize: 11, fontWeight: "900" }}>✓ SELECTED</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Custom Configuration */}
            {underageEnabled && (
              <View style={{
                backgroundColor: "#0A2238",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: "rgba(242,209,0,0.3)",
              }}>
                <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16, marginBottom: 14 }}>
                  Custom Configuration
                </Text>

                {/* Age Threshold */}
                <View style={{ marginBottom: 14 }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 14, marginBottom: 8 }}>
                    Age Threshold
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <TextInput
                      value={ageThreshold}
                      onChangeText={setAgeThreshold}
                      placeholder="35"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      keyboardType="number-pad"
                      style={{
                        flex: 1,
                        backgroundColor: "#0B2842",
                        color: "#EAF2FF",
                        borderRadius: 10,
                        padding: 12,
                        fontSize: 16,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.1)",
                      }}
                    />
                    <Text style={{ color: "#9FB3C8", fontSize: 14 }}>years old</Text>
                  </View>
                  <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 6 }}>
                    Players under this age are considered "underaged"
                  </Text>
                </View>

                {/* Max on Roster */}
                <View style={{ marginBottom: 14 }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 14, marginBottom: 8 }}>
                    Max Underaged on Roster
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <TextInput
                      value={maxOnRoster}
                      onChangeText={setMaxOnRoster}
                      placeholder="0"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      keyboardType="number-pad"
                      style={{
                        flex: 1,
                        backgroundColor: "#0B2842",
                        color: "#EAF2FF",
                        borderRadius: 10,
                        padding: 12,
                        fontSize: 16,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.1)",
                      }}
                    />
                    <Text style={{ color: "#9FB3C8", fontSize: 14 }}>players</Text>
                  </View>
                  <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 6 }}>
                    0 = strict (no underaged allowed), 3-5 = typical
                  </Text>
                </View>

                {/* Max on Field */}
                <View style={{ marginBottom: 14 }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 14, marginBottom: 8 }}>
                    Max Underaged on Field (Optional)
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <TextInput
                      value={maxOnField}
                      onChangeText={setMaxOnField}
                      placeholder="Leave empty for no limit"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      keyboardType="number-pad"
                      style={{
                        flex: 1,
                        backgroundColor: "#0B2842",
                        color: "#EAF2FF",
                        borderRadius: 10,
                        padding: 12,
                        fontSize: 16,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.1)",
                      }}
                    />
                    <Text style={{ color: "#9FB3C8", fontSize: 14 }}>players</Text>
                  </View>
                  <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 6 }}>
                    Additional restriction for simultaneous field presence
                  </Text>
                </View>

                {/* Roster Lock Stage */}
                <View>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 14, marginBottom: 8 }}>
                    Roster Lock Stage
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                    {(["NEVER", "GROUP_STAGE", "KNOCKOUT", "SEMI_FINALS"] as const).map((stage) => (
                      <TouchableOpacity
                        key={stage}
                        onPress={() => setLockStage(stage)}
                        style={{
                          backgroundColor: lockStage === stage ? "#F2D100" : "#0B2842",
                          paddingVertical: 10,
                          paddingHorizontal: 14,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: lockStage === stage ? "#F2D100" : "rgba(255,255,255,0.1)",
                        }}
                      >
                        <Text style={{
                          color: lockStage === stage ? "#061A2B" : "#EAF2FF",
                          fontWeight: "900",
                          fontSize: 13,
                        }}>
                          {stage === "NEVER" ? "Never" : stage.replace(/_/g, " ")}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 6 }}>
                    When should rosters become locked from changes?
                  </Text>
                </View>
              </View>
            )}

            {/* Selected Rules Display */}
            {underageEnabled && (
              <View style={{
                marginTop: 12,
                backgroundColor: "rgba(52,199,89,0.1)",
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(52,199,89,0.3)",
              }}>
                <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 14, marginBottom: 8 }}>
                  ✓ Underage Rules Active
                </Text>
                <Text style={{ color: "#EAF2FF", fontSize: 13, lineHeight: 20 }}>
                  • Age Threshold: Under {ageThreshold}{"\n"}
                  • Max on Roster: {maxOnRoster === "0" ? "NONE (Strict)" : maxOnRoster}{"\n"}
                  {maxOnField && `• Max on Field: ${maxOnField}${"\n"}`}
                  • Roster Lock: {lockStage === "NEVER" ? "Never" : `After ${lockStage.replace(/_/g, " ")}`}
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 8, fontStyle: "italic" }}>
                  Rules will be enforced automatically during player registration
                </Text>
              </View>
            )}
          </View>

          {/* Create Button */}
          <TouchableOpacity
            onPress={validateAndCreate}
            style={{
              backgroundColor: name.trim() ? "#34C759" : "#0A2238",
              borderRadius: 16,
              padding: 18,
              alignItems: "center",
              marginTop: 10,
              borderWidth: 2,
              borderColor: name.trim() ? "#34C759" : "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{
              color: name.trim() ? "#061A2B" : "#9FB3C8",
              fontSize: 18,
              fontWeight: "900",
            }}>
              Create Tournament
            </Text>
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: 16,
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