// app/tournaments/[id]/create-team.tsx - CREATE NEW TEAM FLOW (FIXED)

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../../src/state/AppStore";

export default function CreateTeamScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tournamentId = String(id ?? "");

  const {
    tournaments,
    createTeam,
    setTeamForRep,
    addPendingPayment,
    currentUser,
  } = useAppStore() as any;

  const tournament = useMemo(
    () => tournaments.find((t: any) => t.id === tournamentId),
    [tournaments, tournamentId]
  );

  const [teamName, setTeamName] = useState("");
  const [repName, setRepName] = useState(currentUser?.name || "");
  const [repEmail, setRepEmail] = useState("");
  const [repPhone, setRepPhone] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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

  const validateAndSubmit = () => {
    // Validation
    if (!teamName.trim()) {
      Alert.alert("Missing Information", "Please enter a team name");
      return;
    }

    if (teamName.trim().length < 3) {
      Alert.alert("Team Name Too Short", "Team name must be at least 3 characters");
      return;
    }

    if (!repName.trim()) {
      Alert.alert("Missing Information", "Please enter your name as team representative");
      return;
    }

    if (!repEmail.trim() && !repPhone.trim()) {
      Alert.alert("Contact Required", "Please provide either email or phone number");
      return;
    }

    if (!agreedToTerms) {
      Alert.alert("Terms Required", "Please agree to the terms and conditions");
      return;
    }

    // Confirmation
    Alert.alert(
      "Confirm Team Registration",
      `Team: ${teamName.trim()}\nRep: ${repName.trim()}\nTournament: ${tournament.name}\n\nRegistration Fee: $${(registrationFee / 100).toFixed(2)}\n\nYou will be assigned as team representative and redirected to complete payment.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create Team",
          style: "default",
          onPress: handleCreateTeam,
        },
      ]
    );
  };

  const handleCreateTeam = () => {
    // 1. Create the team
    const newTeamId = createTeam({
      name: teamName.trim(),
      repName: repName.trim(),
      logoKey: "placeholder",
      tournamentId: tournament.id,
    });

    // 2. Assign current user as team rep
    setTeamForRep(newTeamId);

    // 3. Create pending payment
    if (typeof addPendingPayment === 'function') {
      addPendingPayment({
        id: `reg_${tournament.id}_${newTeamId}_${Date.now()}`,
        type: "TOURNAMENT_REGISTRATION",
        amount: registrationFee,
        teamId: newTeamId,
        teamName: teamName.trim(),
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        status: "PENDING",
        createdAt: Date.now(),
        dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    // 4. Show success and redirect
    Alert.alert(
      "Team Created! 🎉",
      `${teamName.trim()} has been successfully created!\n\nYou are now the team representative.\n\nNext step: Complete payment to finalize registration.`,
      [
        {
          text: "Go to Payment",
          onPress: () => {
            router.push('/(tabs)/billing');
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: "#F2D100", fontSize: 28, fontWeight: "900" }}>
            Create Your Team
          </Text>
          <Text style={{ color: "#9FB3C8", marginTop: 8, fontSize: 16 }}>
            {tournament.name}
          </Text>
        </View>

        {/* Registration Fee Notice */}
        <View style={{
          backgroundColor: "rgba(242,209,0,0.1)",
          borderRadius: 16,
          padding: 16,
          marginBottom: 24,
          borderWidth: 2,
          borderColor: "rgba(242,209,0,0.3)",
        }}>
          <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18, textAlign: "center" }}>
            💰 Registration Fee: ${(registrationFee / 100).toFixed(2)}
          </Text>
          <Text style={{ color: "#EAF2FF", marginTop: 8, textAlign: "center" }}>
            Payment required to complete registration
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: 20 }}>
          {/* Team Name */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
              Team Name *
            </Text>
            <TextInput
              value={teamName}
              onChangeText={setTeamName}
              placeholder="e.g., Baltimore Veterans FC"
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
              Choose a memorable name for your team
            </Text>
          </View>

          {/* Team Rep Name */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
              Your Name (Team Representative) *
            </Text>
            <TextInput
              value={repName}
              onChangeText={setRepName}
              placeholder="Your full name"
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
              You'll be the main point of contact
            </Text>
          </View>

          {/* Contact Info */}
          <View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
              Email Address
            </Text>
            <TextInput
              value={repEmail}
              onChangeText={setRepEmail}
              placeholder="team@example.com"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="email-address"
              autoCapitalize="none"
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
              Phone Number
            </Text>
            <TextInput
              value={repPhone}
              onChangeText={setRepPhone}
              placeholder="(555) 123-4567"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="phone-pad"
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
              Provide at least one contact method (email or phone)
            </Text>
          </View>

          {/* Terms Checkbox */}
          <TouchableOpacity
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              backgroundColor: "#0A2238",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: agreedToTerms ? "#34C759" : "rgba(255,255,255,0.1)",
            }}
          >
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              backgroundColor: agreedToTerms ? "#34C759" : "#0B2842",
              borderWidth: 2,
              borderColor: agreedToTerms ? "#34C759" : "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {agreedToTerms && <Text style={{ color: "#061A2B", fontWeight: "900" }}>✓</Text>}
            </View>
            <Text style={{ color: "#EAF2FF", flex: 1, lineHeight: 20 }}>
              I agree to the tournament rules, age requirements, and verification process
            </Text>
          </TouchableOpacity>

          {/* Info Card */}
          <View style={{
            backgroundColor: "rgba(34,198,210,0.1)",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: "rgba(34,198,210,0.3)",
          }}>
            <Text style={{ color: "#22C6D2", fontWeight: "900", marginBottom: 8 }}>
              📋 What happens next:
            </Text>
            <View style={{ gap: 6 }}>
              <Text style={{ color: "#EAF2FF", lineHeight: 20 }}>
                1. Pay ${(registrationFee / 100).toFixed(2)} registration fee
              </Text>
              <Text style={{ color: "#EAF2FF", lineHeight: 20 }}>
                2. Add players to your team roster
              </Text>
              <Text style={{ color: "#EAF2FF", lineHeight: 20 }}>
                3. Players complete document verification
              </Text>
              <Text style={{ color: "#EAF2FF", lineHeight: 20 }}>
                4. Ready to play in {tournament.name}!
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={validateAndSubmit}
            style={{
              backgroundColor: teamName.trim() && repName.trim() && agreedToTerms ? "#34C759" : "#0A2238",
              borderRadius: 16,
              padding: 18,
              alignItems: "center",
              borderWidth: 2,
              borderColor: teamName.trim() && repName.trim() && agreedToTerms ? "#34C759" : "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{
              color: teamName.trim() && repName.trim() && agreedToTerms ? "#061A2B" : "#9FB3C8",
              fontSize: 18,
              fontWeight: "900",
            }}>
              Create Team & Continue to Payment
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