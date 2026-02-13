// app/teams/[teamId]/invite-player.tsx - MOBILE SIGN-UP INVITES

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../../src/state/AppStore";

export default function InvitePlayerScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const router = useRouter();
  
  const { teams, tournaments } = useAppStore() as any;

  const team = teams.find((t: any) => t.id === teamId);
  const tournament = tournaments.find((t: any) => t.id === team?.tournamentId);

  const [playerName, setPlayerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sendMethod, setSendMethod] = useState<"SMS" | "WHATSAPP" | "EMAIL">("SMS");

  const onSendInvite = () => {
    if (!playerName.trim()) {
      Alert.alert("Missing Info", "Please enter player name");
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert("Missing Info", "Please enter phone number or email");
      return;
    }

    // Generate unique invite link
    const inviteCode = `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const inviteLink = `nvtleague.app/join/${inviteCode}`;

    // In production: Send actual SMS/WhatsApp/Email
    // For demo: Show success message
    
    Alert.alert(
      "📱 Invite Sent!",
      `${playerName} will receive a ${sendMethod} with a sign-up link.\n\nThey can:\n• Upload ID photos (front & back)\n• Take a selfie\n• Verify their identity\n• Join ${team.name} automatically\n\nInvite Link: ${inviteLink}`,
      [
        {
          text: "Send Another",
          onPress: () => {
            setPlayerName("");
            setPhoneNumber("");
          },
        },
        {
          text: "Done",
          onPress: () => router.back(),
          style: "cancel",
        },
      ]
    );
  };

  if (!team) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: "#EAF2FF", marginTop: 20 }}>Team not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900", marginTop: 16 }}>
          Invite Player to Sign Up
        </Text>
        <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
          Team: {team.name}
        </Text>

        {/* How It Works */}
        <View style={{
          marginTop: 20,
          backgroundColor: "#0A2238",
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(34,198,210,0.3)",
        }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
            📱 How Mobile Sign-Up Works
          </Text>
          
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18 }}>1.</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 14 }}>
                  You send invite
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                  Player gets SMS/WhatsApp with unique link
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18 }}>2.</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 14 }}>
                  Player opens on phone
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                  Simple mobile-optimized form
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18 }}>3.</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 14 }}>
                  Upload ID photos
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                  Front and back of driver's license/ID
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18 }}>4.</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 14 }}>
                  Auto-extract & verify
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                  Name, DOB, address extracted from ID
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 18 }}>✓</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 14 }}>
                  Added to team automatically
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                  You'll get notification to approve
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={{ marginTop: 20, backgroundColor: "#0A2238", borderRadius: 14, padding: 16 }}>
          {/* Player Name */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8, fontSize: 15 }}>
              Player Name *
            </Text>
            <TextInput
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="e.g., John Smith"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={{
                backgroundColor: "#0B2842",
                color: "#EAF2FF",
                padding: 12,
                borderRadius: 10,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </View>

          {/* Phone/Email */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8, fontSize: 15 }}>
              Phone Number or Email *
            </Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+1 (555) 123-4567 or email@example.com"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="phone-pad"
              style={{
                backgroundColor: "#0B2842",
                color: "#EAF2FF",
                padding: 12,
                borderRadius: 10,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </View>

          {/* Send Method */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8, fontSize: 15 }}>
              Send Via
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setSendMethod("SMS")}
                style={{
                  flex: 1,
                  backgroundColor: sendMethod === "SMS" ? "#22C6D2" : "#0B2842",
                  padding: 12,
                  borderRadius: 10,
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: sendMethod === "SMS" ? "#22C6D2" : "rgba(255,255,255,0.1)",
                }}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>💬</Text>
                <Text style={{
                  color: sendMethod === "SMS" ? "#061A2B" : "#EAF2FF",
                  fontWeight: "900",
                  fontSize: 13,
                }}>
                  SMS
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSendMethod("WHATSAPP")}
                style={{
                  flex: 1,
                  backgroundColor: sendMethod === "WHATSAPP" ? "#25D366" : "#0B2842",
                  padding: 12,
                  borderRadius: 10,
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: sendMethod === "WHATSAPP" ? "#25D366" : "rgba(255,255,255,0.1)",
                }}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>📱</Text>
                <Text style={{
                  color: sendMethod === "WHATSAPP" ? "#061A2B" : "#EAF2FF",
                  fontWeight: "900",
                  fontSize: 13,
                }}>
                  WhatsApp
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSendMethod("EMAIL")}
                style={{
                  flex: 1,
                  backgroundColor: sendMethod === "EMAIL" ? "#F2D100" : "#0B2842",
                  padding: 12,
                  borderRadius: 10,
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: sendMethod === "EMAIL" ? "#F2D100" : "rgba(255,255,255,0.1)",
                }}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>✉️</Text>
                <Text style={{
                  color: sendMethod === "EMAIL" ? "#061A2B" : "#EAF2FF",
                  fontWeight: "900",
                  fontSize: 13,
                }}>
                  Email
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={onSendInvite}
            disabled={!playerName.trim() || !phoneNumber.trim()}
            style={{
              backgroundColor: (playerName.trim() && phoneNumber.trim()) ? "#34C759" : "#0B2842",
              padding: 14,
              borderRadius: 12,
              alignItems: "center",
              borderWidth: 2,
              borderColor: (playerName.trim() && phoneNumber.trim()) ? "#34C759" : "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{
              fontWeight: "900",
              color: (playerName.trim() && phoneNumber.trim()) ? "#061A2B" : "#9FB3C8",
              fontSize: 16,
            }}>
              📱 Send Invite
            </Text>
          </TouchableOpacity>
        </View>

        {/* Benefits */}
        <View style={{
          marginTop: 16,
          backgroundColor: "rgba(52,199,89,0.1)",
          borderRadius: 12,
          padding: 14,
          borderWidth: 1,
          borderColor: "rgba(52,199,89,0.3)",
        }}>
          <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 13, marginBottom: 6 }}>
            ✨ Why use mobile sign-up?
          </Text>
          <Text style={{ color: "#EAF2FF", fontSize: 12, lineHeight: 18 }}>
            • Players complete their own registration{"\n"}
            • ID photos automatically verified{"\n"}
            • No manual data entry for you{"\n"}
            • Faster onboarding for everyone{"\n"}
            • Players verify identity on their own device
          </Text>
        </View>

        {/* Tournament Rules Note */}
        {tournament?.underageRules?.enabled && (
          <View style={{
            marginTop: 16,
            backgroundColor: "rgba(242,209,0,0.1)",
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(242,209,0,0.3)",
          }}>
            <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 13, marginBottom: 6 }}>
              ⚠️ Tournament Age Rules Apply
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: 12, lineHeight: 18 }}>
              Age will be automatically checked from ID. {tournament.underageRules.maxUnderagedOnRoster === 0
                ? `Players under ${tournament.underageRules.ageThreshold} will be rejected.`
                : `Max ${tournament.underageRules.maxUnderagedOnRoster} players under ${tournament.underageRules.ageThreshold} allowed.`}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}