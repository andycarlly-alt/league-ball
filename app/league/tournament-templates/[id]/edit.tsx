// app/league/tournament-templates/[id]/edit.tsx - EDIT TOURNAMENT TEMPLATE

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../../../src/state/AppStore";

export default function EditTemplateScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const templateId = String(id ?? "");
  
  const {
    getTournamentTemplate,
    updateTournamentTemplate,
    archiveTournamentTemplate,
    restoreTournamentTemplate,
    can,
  } = useAppStore() as any;

  const template = useMemo(
    () => getTournamentTemplate(templateId),
    [templateId]
  );

  const [templateName, setTemplateName] = useState(template?.name || "");
  const [description, setDescription] = useState(template?.description || "");
  const [registrationFee, setRegistrationFee] = useState(
    template ? String((template.registrationFee || 15000) / 100) : "150"
  );
  const [ageRuleLabel, setAgeRuleLabel] = useState(template?.ageRuleLabel || "35+");
  const [minRosterSize, setMinRosterSize] = useState(String(template?.minRosterSize || 11));
  const [maxRosterSize, setMaxRosterSize] = useState(String(template?.maxRosterSize || 18));
  const [maxTeams, setMaxTeams] = useState(String(template?.maxTeams || 24));
  const [matchDuration, setMatchDuration] = useState(String(template?.matchDuration || 90));
  const [defaultLocation, setDefaultLocation] = useState(template?.defaultLocation || "");

  const canManage = can("MANAGE_TOURNAMENTS");

  if (!canManage || !template) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: "#EAF2FF", marginTop: 20 }}>
          {!canManage ? "Access denied" : "Template not found"}
        </Text>
      </View>
    );
  }

  const validateAndUpdate = () => {
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

    updateTournamentTemplate(templateId, {
      name: templateName.trim(),
      description: description.trim(),
      registrationFee: Math.round(fee * 100),
      ageRuleLabel: ageRuleLabel.trim(),
      minRosterSize: minRoster,
      maxRosterSize: maxRoster,
      maxTeams: teams,
      matchDuration: duration,
      defaultLocation: defaultLocation.trim(),
    });

    Alert.alert(
      "Template Updated! ✓",
      `${templateName.trim()} has been updated successfully.`,
      [
        {
          text: "Done",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleArchive = () => {
    const action = template.status === "ACTIVE" ? "archive" : "restore";
    Alert.alert(
      `${action === "archive" ? "Archive" : "Restore"} Template?`,
      `${action === "archive" ? "This will hide the template from the active list" : "This will restore the template to the active list"}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action === "archive" ? "Archive" : "Restore",
          onPress: () => {
            if (action === "archive") {
              archiveTournamentTemplate(templateId);
            } else {
              restoreTournamentTemplate(templateId);
            }
            router.back();
          },
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
            Edit Template
          </Text>
          <Text style={{ color: "#9FB3C8", marginTop: 8, fontSize: 16 }}>
            Update template settings
          </Text>
        </View>

        {template.status === "ARCHIVED" && (
          <View style={{
            backgroundColor: "rgba(255,59,48,0.1)",
            borderRadius: 12,
            padding: 12,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: "rgba(255,59,48,0.3)",
          }}>
            <Text style={{ color: "#FF3B30", fontWeight: "900" }}>
              ⚠️ This template is archived
            </Text>
          </View>
        )}

        {/* Form - Same as create but pre-filled */}
        <View style={{ gap: 20 }}>
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
          </View>

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
          </View>

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

          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
              Maximum Teams *
            </Text>
            <TextInput
              value={maxTeams}
              onChangeText={setMaxTeams}
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

          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
              Match Duration (minutes) *
            </Text>
            <TextInput
              value={matchDuration}
              onChangeText={setMatchDuration}
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
          </View>

          {/* Update Button */}
          <TouchableOpacity
            onPress={validateAndUpdate}
            style={{
              backgroundColor: "#34C759",
              borderRadius: 16,
              padding: 18,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#061A2B", fontSize: 18, fontWeight: "900" }}>
              Save Changes
            </Text>
          </TouchableOpacity>

          {/* Archive/Restore Button */}
          <TouchableOpacity
            onPress={handleArchive}
            style={{
              backgroundColor: "#0A2238",
              borderRadius: 16,
              padding: 18,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{ color: template.status === "ACTIVE" ? "#9FB3C8" : "#34C759", fontSize: 16, fontWeight: "900" }}>
              {template.status === "ACTIVE" ? "Archive Template" : "Restore Template"}
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