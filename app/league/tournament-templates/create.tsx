// app/league/tournament-templates/create.tsx - CREATE TOURNAMENT TEMPLATE

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../../src/state/AppStore";

export default function CreateTemplateScreen() {
  const router = useRouter();
  const { clone } = useLocalSearchParams<{ clone?: string }>();
  
  const {
    tournamentTemplates,
    createTournamentTemplate,
    can,
  } = useAppStore() as any;

  const cloneTemplate = useMemo(
    () => clone ? (tournamentTemplates || []).find((t: any) => t.id === clone) : null,
    [clone, tournamentTemplates]
  );

  const [templateName, setTemplateName] = useState(cloneTemplate ? `${cloneTemplate.name} (Copy)` : "");
  const [description, setDescription] = useState(cloneTemplate?.description || "");
  const [registrationFee, setRegistrationFee] = useState(
    cloneTemplate ? String((cloneTemplate.registrationFee || 15000) / 100) : "150"
  );
  const [ageRuleLabel, setAgeRuleLabel] = useState(cloneTemplate?.ageRuleLabel || "35+");
  const [minRosterSize, setMinRosterSize] = useState(String(cloneTemplate?.minRosterSize || 11));
  const [maxRosterSize, setMaxRosterSize] = useState(String(cloneTemplate?.maxRosterSize || 18));
  const [maxTeams, setMaxTeams] = useState(String(cloneTemplate?.maxTeams || 24));
  const [matchDuration, setMatchDuration] = useState(String(cloneTemplate?.matchDuration || 90));
  const [defaultLocation, setDefaultLocation] = useState(cloneTemplate?.defaultLocation || "");

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
    // Validation
    if (!templateName.trim()) {
      Alert.alert("Missing Information", "Please enter a template name");
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

    // Create template
    const newTemplate = {
      name: templateName.trim(),
      description: description.trim(),
      registrationFee: Math.round(fee * 100), // Convert to cents
      ageRuleLabel: ageRuleLabel.trim(),
      minRosterSize: minRoster,
      maxRosterSize: maxRoster,
      maxTeams: teams,
      matchDuration: duration,
      defaultLocation: defaultLocation.trim(),
      status: "ACTIVE",
    };

    createTournamentTemplate(newTemplate);

    Alert.alert(
      "Template Created! 🎉",
      `${newTemplate.name} is ready to use.\n\nYou can now quickly create tournaments using this template.`,
      [
        {
          text: "Create Tournament",
          onPress: () => router.push('/tournaments/create'),
        },
        {
          text: "View Templates",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back to Templates</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: "#F2D100", fontSize: 28, fontWeight: "900" }}>
            {clone ? "Clone Template" : "Create Template"}
          </Text>
          <Text style={{ color: "#9FB3C8", marginTop: 8, fontSize: 16 }}>
            Set default values for quick tournament creation
          </Text>
        </View>

        {clone && (
          <View style={{
            backgroundColor: "rgba(34,198,210,0.1)",
            borderRadius: 12,
            padding: 12,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: "rgba(34,198,210,0.3)",
          }}>
            <Text style={{ color: "#22C6D2", fontWeight: "900" }}>
              💡 Cloning from: {cloneTemplate?.name}
            </Text>
          </View>
        )}

        {/* Form */}
        <View style={{ gap: 20 }}>
          {/* Template Name */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
              Template Name *
            </Text>
            <TextInput
              value={templateName}
              onChangeText={setTemplateName}
              placeholder="e.g., Standard 35+ Tournament"
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
            <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 6 }}>
              Give your template a descriptive name
            </Text>
          </View>

          {/* Description */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
              Description (Optional)
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g., Default settings for over-35 weekend tournaments"
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: "#0A2238",
                color: "#EAF2FF",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                minHeight: 80,
                textAlignVertical: "top",
              }}
            />
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
            <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 6 }}>
              Default fee per team
            </Text>
          </View>

          {/* Age Rule */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
              Age Rule *
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
            <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 6 }}>
              Minimum age requirement for players
            </Text>
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
            <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 6 }}>
              Number of players per team
            </Text>
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
            <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 6 }}>
              Tournament capacity
            </Text>
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
            <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 6 }}>
              Default match length
            </Text>
          </View>

          {/* Default Location */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
              Default Location (Optional)
            </Text>
            <TextInput
              value={defaultLocation}
              onChangeText={setDefaultLocation}
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
            <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 6 }}>
              Pre-fill location for tournaments
            </Text>
          </View>

          {/* Summary Card */}
          <View style={{
            backgroundColor: "rgba(34,198,210,0.1)",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: "rgba(34,198,210,0.3)",
          }}>
            <Text style={{ color: "#22C6D2", fontWeight: "900", marginBottom: 12 }}>
              📋 Template Summary
            </Text>
            <View style={{ gap: 6 }}>
              <Text style={{ color: "#EAF2FF" }}>
                • ${registrationFee || "150"} registration fee
              </Text>
              <Text style={{ color: "#EAF2FF" }}>
                • {ageRuleLabel || "35+"} age requirement
              </Text>
              <Text style={{ color: "#EAF2FF" }}>
                • {minRosterSize || "11"}-{maxRosterSize || "18"} player roster
              </Text>
              <Text style={{ color: "#EAF2FF" }}>
                • Up to {maxTeams || "24"} teams
              </Text>
              <Text style={{ color: "#EAF2FF" }}>
                • {matchDuration || "90"} minute matches
              </Text>
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            onPress={validateAndCreate}
            style={{
              backgroundColor: templateName.trim() ? "#34C759" : "#0A2238",
              borderRadius: 16,
              padding: 18,
              alignItems: "center",
              borderWidth: 2,
              borderColor: templateName.trim() ? "#34C759" : "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{
              color: templateName.trim() ? "#061A2B" : "#9FB3C8",
              fontSize: 18,
              fontWeight: "900",
            }}>
              Create Template
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