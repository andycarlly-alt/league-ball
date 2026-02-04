// app/league/tournament-templates.tsx - TOURNAMENT TEMPLATES MANAGEMENT

import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";

export default function TournamentTemplatesScreen() {
  const router = useRouter();
  const {
    tournamentTemplates,
    deleteTournamentTemplate,
    can,
  } = useAppStore() as any;

  const [searchQuery, setSearchQuery] = useState("");

  const canManage = can("MANAGE_TOURNAMENTS");

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return tournamentTemplates || [];
    const query = searchQuery.toLowerCase();
    return (tournamentTemplates || []).filter((t: any) =>
      t.name.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query))
    );
  }, [tournamentTemplates, searchQuery]);

  const activeTemplates = filteredTemplates.filter((t: any) => t.status === "ACTIVE");
  const archivedTemplates = filteredTemplates.filter((t: any) => t.status === "ARCHIVED");

  const handleDelete = (template: any) => {
    Alert.alert(
      "Delete Template?",
      `Are you sure you want to delete "${template.name}"?\n\nThis action cannot be undone, but tournaments created from this template will not be affected.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteTournamentTemplate(template.id);
            Alert.alert("Deleted", `${template.name} has been deleted`);
          },
        },
      ]
    );
  };

  const handleClone = (template: any) => {
    router.push(`/league/tournament-templates/create?clone=${template.id}`);
  };

  const handleUseTemplate = (template: any) => {
    router.push(`/tournaments/create?template=${template.id}`);
  };

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

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/league/tournament-templates/create')}
              style={{
                backgroundColor: "#34C759",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>+ New Template</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: "#F2D100", fontSize: 28, fontWeight: "900" }}>
            Tournament Templates
          </Text>
          <Text style={{ color: "#9FB3C8", marginTop: 8, fontSize: 16 }}>
            Create reusable tournament configurations
          </Text>
        </View>

        {/* Info Banner */}
        <View style={{
          marginHorizontal: 16,
          marginBottom: 20,
          backgroundColor: "rgba(34,198,210,0.1)",
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(34,198,210,0.3)",
        }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", marginBottom: 8 }}>
            💡 What are Templates?
          </Text>
          <Text style={{ color: "#EAF2FF", lineHeight: 20 }}>
            Templates save time by pre-configuring tournament settings. Create a template once, then quickly launch new tournaments with the same rules, fees, and requirements.
          </Text>
        </View>

        {/* Search */}
        {(tournamentTemplates || []).length > 3 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search templates..."
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
        )}

        {/* Active Templates */}
        {activeTemplates.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <Text style={{ color: "#F2D100", fontSize: 20, fontWeight: "900", marginBottom: 12 }}>
              Active Templates ({activeTemplates.length})
            </Text>
            <View style={{ gap: 12 }}>
              {activeTemplates.map((template: any) => (
                <View
                  key={template.id}
                  style={{
                    backgroundColor: "#0A2238",
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  {/* Template Header */}
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 18 }}>
                      {template.name}
                    </Text>
                    {template.description && (
                      <Text style={{ color: "#9FB3C8", marginTop: 4, lineHeight: 20 }}>
                        {template.description}
                      </Text>
                    )}
                  </View>

                  {/* Template Details */}
                  <View style={{
                    backgroundColor: "#0B2842",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 12,
                  }}>
                    <View style={{ gap: 8 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: "#9FB3C8", fontSize: 13 }}>Registration Fee</Text>
                        <Text style={{ color: "#F2D100", fontWeight: "900" }}>
                          ${((template.registrationFee || 15000) / 100).toFixed(2)}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: "#9FB3C8", fontSize: 13 }}>Age Rule</Text>
                        <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                          {template.ageRuleLabel || "35+"}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: "#9FB3C8", fontSize: 13 }}>Roster Size</Text>
                        <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                          {template.minRosterSize || 11}-{template.maxRosterSize || 18} players
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: "#9FB3C8", fontSize: 13 }}>Max Teams</Text>
                        <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                          {template.maxTeams || 24}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => handleUseTemplate(template)}
                      style={{
                        flex: 1,
                        backgroundColor: "#34C759",
                        borderRadius: 10,
                        paddingVertical: 12,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#061A2B", fontWeight: "900" }}>
                        Use Template
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => router.push(`/league/tournament-templates/${template.id}/edit`)}
                      style={{
                        backgroundColor: "#0B2842",
                        borderRadius: 10,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleClone(template)}
                      style={{
                        backgroundColor: "#0B2842",
                        borderRadius: 10,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Clone</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDelete(template)}
                      style={{
                        backgroundColor: "#0B2842",
                        borderRadius: 10,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderWidth: 1,
                        borderColor: "rgba(255,59,48,0.3)",
                      }}
                    >
                      <Text style={{ color: "#FF3B30", fontWeight: "900" }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Archived Templates */}
        {archivedTemplates.length > 0 && (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ color: "#9FB3C8", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
              Archived Templates ({archivedTemplates.length})
            </Text>
            <View style={{ gap: 12 }}>
              {archivedTemplates.map((template: any) => (
                <View
                  key={template.id}
                  style={{
                    backgroundColor: "#0A2238",
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.05)",
                    opacity: 0.6,
                  }}
                >
                  <Text style={{ color: "#9FB3C8", fontWeight: "900", fontSize: 16 }}>
                    {template.name}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                    <TouchableOpacity
                      onPress={() => router.push(`/league/tournament-templates/${template.id}/edit`)}
                      style={{
                        flex: 1,
                        backgroundColor: "#0B2842",
                        borderRadius: 10,
                        paddingVertical: 10,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Restore</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(template)}
                      style={{
                        backgroundColor: "#0B2842",
                        borderRadius: 10,
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                      }}
                    >
                      <Text style={{ color: "#FF3B30", fontWeight: "900" }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {activeTemplates.length === 0 && archivedTemplates.length === 0 && (
          <View style={{
            marginHorizontal: 16,
            backgroundColor: "#0A2238",
            borderRadius: 16,
            padding: 32,
            alignItems: "center",
            marginTop: 40,
          }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 18, textAlign: "center" }}>
              {searchQuery.trim() ? "No Templates Found" : "No Templates Yet"}
            </Text>
            <Text style={{ color: "#9FB3C8", marginTop: 8, textAlign: "center", lineHeight: 20 }}>
              {searchQuery.trim()
                ? `No templates match "${searchQuery}"`
                : "Create your first tournament template to save time on future tournaments"}
            </Text>
            {!searchQuery.trim() && (
              <TouchableOpacity
                onPress={() => router.push('/league/tournament-templates/create')}
                style={{
                  marginTop: 20,
                  backgroundColor: "#34C759",
                  paddingHorizontal: 24,
                  paddingVertical: 14,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#061A2B", fontWeight: "900" }}>
                  Create First Template
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Quick Stats */}
        {(tournamentTemplates || []).length > 0 && (
          <View style={{
            marginHorizontal: 16,
            marginTop: 24,
            backgroundColor: "rgba(242,209,0,0.05)",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "rgba(242,209,0,0.2)",
          }}>
            <Text style={{ color: "#F2D100", fontWeight: "900", marginBottom: 8 }}>
              📊 Template Stats
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 8 }}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#EAF2FF", fontSize: 24, fontWeight: "900" }}>
                  {activeTemplates.length}
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>Active</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#EAF2FF", fontSize: 24, fontWeight: "900" }}>
                  {archivedTemplates.length}
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>Archived</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#EAF2FF", fontSize: 24, fontWeight: "900" }}>
                  {(tournamentTemplates || []).length}
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>Total</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}