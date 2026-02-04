// app/tournaments/[id]/register.tsx - REGISTRATION CHOICE SCREEN (FIXED)

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../../src/state/AppStore";

export default function RegisterScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tournamentId = String(id ?? "");

  const { tournaments, getTeamsForTournament } = useAppStore() as any;

  const tournament = useMemo(
    () => tournaments.find((t: any) => t.id === tournamentId),
    [tournaments, tournamentId]
  );

  const teams = useMemo(
    () => getTeamsForTournament(tournamentId),
    [tournamentId, tournaments]
  );

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

  const registrationFee = tournament.registrationFee || 15000;

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back to Tournament</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ color: "#F2D100", fontSize: 28, fontWeight: "900" }}>
            Register for Tournament
          </Text>
          <Text style={{ color: "#9FB3C8", marginTop: 8, fontSize: 16 }}>
            {tournament.name}
          </Text>
          <View style={{
            backgroundColor: "rgba(242,209,0,0.1)",
            borderRadius: 12,
            padding: 12,
            marginTop: 16,
            borderWidth: 1,
            borderColor: "rgba(242,209,0,0.3)",
          }}>
            <Text style={{ color: "#F2D100", fontWeight: "900", textAlign: "center" }}>
              Registration Fee: ${(registrationFee / 100).toFixed(2)} per team
            </Text>
          </View>
        </View>

        {/* Choice: Create New Team */}
        <TouchableOpacity
          onPress={() => router.push(`/tournaments/${tournamentId}/create-team`)}
          style={{
            backgroundColor: "#34C759",
            borderRadius: 20,
            padding: 24,
            marginBottom: 16,
            borderWidth: 3,
            borderColor: "#34C759",
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 48, marginBottom: 8 }}>⚽</Text>
            <Text style={{ color: "#061A2B", fontSize: 24, fontWeight: "900" }}>
              Create New Team
            </Text>
          </View>

          <View style={{ backgroundColor: "rgba(0,0,0,0.1)", borderRadius: 12, padding: 16 }}>
            <Text style={{ color: "#061A2B", fontWeight: "900", marginBottom: 8 }}>
              Perfect if you're:
            </Text>
            <View style={{ gap: 6 }}>
              <Text style={{ color: "#061A2B", lineHeight: 22 }}>
                ✓ Starting a brand new team
              </Text>
              <Text style={{ color: "#061A2B", lineHeight: 22 }}>
                ✓ Team captain or organizer
              </Text>
              <Text style={{ color: "#061A2B", lineHeight: 22 }}>
                ✓ Have players ready to join
              </Text>
            </View>
          </View>

          <View style={{
            marginTop: 16,
            backgroundColor: "rgba(0,0,0,0.1)",
            borderRadius: 12,
            padding: 12,
          }}>
            <Text style={{ color: "#061A2B", fontWeight: "900", textAlign: "center" }}>
              You'll be assigned as Team Representative
            </Text>
          </View>

          <View style={{ alignItems: "center", marginTop: 16 }}>
            <Text style={{ color: "#061A2B", fontSize: 18, fontWeight: "900" }}>
              TAP TO CREATE →
            </Text>
          </View>
        </TouchableOpacity>

        {/* Choice: Join Existing Team */}
        <TouchableOpacity
          onPress={() => router.push(`/tournaments/${tournamentId}/teams/browse`)}
          style={{
            backgroundColor: "#22C6D2",
            borderRadius: 20,
            padding: 24,
            marginBottom: 16,
            borderWidth: 3,
            borderColor: "#22C6D2",
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 48, marginBottom: 8 }}>👥</Text>
            <Text style={{ color: "#061A2B", fontSize: 24, fontWeight: "900" }}>
              Join Existing Team
            </Text>
          </View>

          <View style={{ backgroundColor: "rgba(0,0,0,0.1)", borderRadius: 12, padding: 16 }}>
            <Text style={{ color: "#061A2B", fontWeight: "900", marginBottom: 8 }}>
              Perfect if you're:
            </Text>
            <View style={{ gap: 6 }}>
              <Text style={{ color: "#061A2B", lineHeight: 22 }}>
                ✓ Looking to play for an existing team
              </Text>
              <Text style={{ color: "#061A2B", lineHeight: 22 }}>
                ✓ A player seeking a roster spot
              </Text>
              <Text style={{ color: "#061A2B", lineHeight: 22 }}>
                ✓ Want to browse available teams
              </Text>
            </View>
          </View>

          <View style={{
            marginTop: 16,
            backgroundColor: "rgba(0,0,0,0.1)",
            borderRadius: 12,
            padding: 12,
          }}>
            <Text style={{ color: "#061A2B", fontWeight: "900", textAlign: "center" }}>
              Browse {teams.length} registered {teams.length === 1 ? "team" : "teams"}
            </Text>
          </View>

          <View style={{ alignItems: "center", marginTop: 16 }}>
            <Text style={{ color: "#061A2B", fontSize: 18, fontWeight: "900" }}>
              TAP TO BROWSE →
            </Text>
          </View>
        </TouchableOpacity>

        {/* Info Card */}
        <View style={{
          backgroundColor: "#0A2238",
          borderRadius: 16,
          padding: 16,
          marginTop: 8,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", marginBottom: 8 }}>
            💡 Not sure which option?
          </Text>
          <Text style={{ color: "#9FB3C8", lineHeight: 20 }}>
            <Text style={{ fontWeight: "900" }}>Create New Team</Text> if you want to be in charge of team registration and roster management.{"\n\n"}
            <Text style={{ fontWeight: "900" }}>Join Existing Team</Text> if you just want to play and let someone else handle the admin work.
          </Text>
        </View>

        {/* Additional Info */}
        <View style={{
          backgroundColor: "rgba(242,209,0,0.05)",
          borderRadius: 16,
          padding: 16,
          marginTop: 16,
          borderWidth: 1,
          borderColor: "rgba(242,209,0,0.2)",
        }}>
          <Text style={{ color: "#F2D100", fontWeight: "900", marginBottom: 8 }}>
            📋 What happens after registration:
          </Text>
          <View style={{ gap: 8 }}>
            <Text style={{ color: "#EAF2FF", lineHeight: 20 }}>
              1. Complete payment (${(registrationFee / 100).toFixed(2)})
            </Text>
            <Text style={{ color: "#EAF2FF", lineHeight: 20 }}>
              2. Add players to your roster
            </Text>
            <Text style={{ color: "#EAF2FF", lineHeight: 20 }}>
              3. Players complete document verification
            </Text>
            <Text style={{ color: "#EAF2FF", lineHeight: 20 }}>
              4. Ready to play in the tournament!
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}