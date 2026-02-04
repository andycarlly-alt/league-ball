// app/teams/[id]/dashboard.tsx - TEAM DASHBOARD (FIXED)

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../../src/state/AppStore";

export default function TeamDashboardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = String(id ?? "");

  const {
    teams,
    tournaments,
    players,
    pendingPayments,
    currentUser,
  } = useAppStore() as any;

  const team = useMemo(
    () => teams.find((t: any) => t.id === teamId),
    [teams, teamId]
  );

  const tournament = useMemo(
    () => team ? tournaments.find((t: any) => t.id === team.tournamentId) : null,
    [team, tournaments]
  );

  const teamPlayers = useMemo(
    () => (players ?? []).filter((p: any) => p.teamId === teamId),
    [players, teamId]
  );

  const verifiedPlayers = useMemo(
    () => teamPlayers.filter((p: any) => p.verified),
    [teamPlayers]
  );

  const teamPayments = useMemo(
    () => (pendingPayments ?? []).filter((p: any) => p.teamId === teamId),
    [pendingPayments, teamId]
  );

  const registrationPayment = useMemo(
    () => teamPayments.find((p: any) => p.type === "TOURNAMENT_REGISTRATION"),
    [teamPayments]
  );

  const isTeamRep = currentUser.teamId === teamId;
  const registrationPaid = registrationPayment?.status === "PAID";
  const minRosterSize = tournament?.minRosterSize || 11;
  const maxRosterSize = tournament?.maxRosterSize || 18;
  const rosterProgress = teamPlayers.length;
  const verificationProgress = verifiedPlayers.length;

  if (!team) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: "#EAF2FF", marginTop: 20 }}>Team not found</Text>
      </View>
    );
  }

  const getRegistrationStatus = () => {
    if (!registrationPayment) return { text: "Not Registered", color: "#9FB3C8", bg: "rgba(159,179,200,0.1)" };
    if (registrationPayment.status === "PAID") return { text: "Registered ✓", color: "#34C759", bg: "rgba(52,199,89,0.1)" };
    if (registrationPayment.status === "PENDING") return { text: "Payment Pending", color: "#F2D100", bg: "rgba(242,209,0,0.1)" };
    return { text: "Overdue", color: "#FF3B30", bg: "rgba(255,59,48,0.1)" };
  };

  const status = getRegistrationStatus();

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ 
          backgroundColor: "#0A2238", 
          paddingTop: 60, 
          paddingBottom: 32, 
          paddingHorizontal: 16,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}
          >
            <View style={{ backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
              <Text style={{ color: "#22C6D2", fontSize: 16, fontWeight: "900" }}>← Back</Text>
            </View>
          </TouchableOpacity>

          <Text style={{ color: "#F2D100", fontSize: 28, fontWeight: "900", textAlign: "center", marginBottom: 8 }}>
            {team.name}
          </Text>
          
          {tournament && (
            <Text style={{ color: "#9FB3C8", textAlign: "center", fontSize: 14 }}>
              {tournament.name}
            </Text>
          )}

          {isTeamRep && (
            <View style={{
              marginTop: 16,
              backgroundColor: "rgba(34,198,210,0.2)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              alignSelf: "center",
            }}>
              <Text style={{ color: "#22C6D2", fontSize: 13, fontWeight: "900" }}>
                👤 Team Representative
              </Text>
            </View>
          )}
        </View>

        <View style={{ padding: 16 }}>
          {/* Registration Status Card */}
          <View style={{
            backgroundColor: status.bg,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 2,
            borderColor: status.color,
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: status.color, fontSize: 20, fontWeight: "900" }}>
                {status.text}
              </Text>
              {registrationPaid && (
                <Text style={{ fontSize: 32 }}>✓</Text>
              )}
            </View>

            {registrationPayment && registrationPayment.status === "PENDING" && (
              <View>
                <Text style={{ color: "#EAF2FF", marginBottom: 12 }}>
                  Complete payment to finalize tournament registration
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/billing')}
                  style={{
                    backgroundColor: "#F2D100",
                    borderRadius: 12,
                    padding: 14,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#061A2B", fontWeight: "900" }}>
                    Pay ${(registrationPayment.amount / 100).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {registrationPaid && (
              <Text style={{ color: "#EAF2FF" }}>
                Registration complete! You can now add players to your roster.
              </Text>
            )}
          </View>

          {/* Progress Cards */}
          <View style={{ gap: 12, marginBottom: 20 }}>
            {/* Roster Progress */}
            <View style={{
              backgroundColor: "#0A2238",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                  Roster Progress
                </Text>
                <Text style={{ color: rosterProgress >= minRosterSize ? "#34C759" : "#F2D100", fontSize: 24, fontWeight: "900" }}>
                  {rosterProgress}/{maxRosterSize}
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={{ backgroundColor: "#0B2842", height: 8, borderRadius: 4, overflow: "hidden" }}>
                <View style={{
                  backgroundColor: rosterProgress >= minRosterSize ? "#34C759" : "#F2D100",
                  height: "100%",
                  width: `${Math.min((rosterProgress / maxRosterSize) * 100, 100)}%`,
                }} />
              </View>

              <Text style={{ color: "#9FB3C8", marginTop: 8, fontSize: 13 }}>
                {rosterProgress < minRosterSize
                  ? `Need ${minRosterSize - rosterProgress} more ${minRosterSize - rosterProgress === 1 ? "player" : "players"} (min ${minRosterSize})`
                  : `${maxRosterSize - rosterProgress} ${maxRosterSize - rosterProgress === 1 ? "spot" : "spots"} remaining`
                }
              </Text>
            </View>

            {/* Verification Progress */}
            <View style={{
              backgroundColor: "#0A2238",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                  Players Verified
                </Text>
                <Text style={{ color: verificationProgress === rosterProgress && rosterProgress > 0 ? "#34C759" : "#22C6D2", fontSize: 24, fontWeight: "900" }}>
                  {verificationProgress}/{rosterProgress}
                </Text>
              </View>

              {rosterProgress > 0 && (
                <>
                  {/* Progress Bar */}
                  <View style={{ backgroundColor: "#0B2842", height: 8, borderRadius: 4, overflow: "hidden" }}>
                    <View style={{
                      backgroundColor: verificationProgress === rosterProgress ? "#34C759" : "#22C6D2",
                      height: "100%",
                      width: `${Math.min((verificationProgress / rosterProgress) * 100, 100)}%`,
                    }} />
                  </View>

                  <Text style={{ color: "#9FB3C8", marginTop: 8, fontSize: 13 }}>
                    {verificationProgress === rosterProgress
                      ? "All players verified! ✓"
                      : `${rosterProgress - verificationProgress} ${rosterProgress - verificationProgress === 1 ? "player" : "players"} need verification`
                    }
                  </Text>
                </>
              )}

              {rosterProgress === 0 && (
                <Text style={{ color: "#9FB3C8", fontSize: 13 }}>
                  Add players to begin verification process
                </Text>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          {isTeamRep && (
            <View style={{ gap: 10 }}>
              <Text style={{ color: "#F2D100", fontSize: 18, fontWeight: "900", marginBottom: 6 }}>
                Quick Actions
              </Text>

              <TouchableOpacity
                onPress={() => router.push(`/teams/${teamId}`)}
                style={{
                  backgroundColor: "#34C759",
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>
                    Manage Roster
                  </Text>
                  <Text style={{ color: "#061A2B", marginTop: 4, fontSize: 13 }}>
                    Add players, verify documents
                  </Text>
                </View>
                <Text style={{ color: "#061A2B", fontSize: 20 }}>→</Text>
              </TouchableOpacity>

              {registrationPayment && registrationPayment.status === "PENDING" && (
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/billing')}
                  style={{
                    backgroundColor: "#F2D100",
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>
                      Complete Payment
                    </Text>
                    <Text style={{ color: "#061A2B", marginTop: 4, fontSize: 13 }}>
                      ${(registrationPayment.amount / 100).toFixed(2)} registration fee
                    </Text>
                  </View>
                  <Text style={{ color: "#061A2B", fontSize: 20 }}>→</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => Alert.alert("Coming Soon", "Team settings and customization coming soon!")}
                style={{
                  backgroundColor: "#0A2238",
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <View>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                    Team Settings
                  </Text>
                  <Text style={{ color: "#9FB3C8", marginTop: 4, fontSize: 13 }}>
                    Update team info, logo, contacts
                  </Text>
                </View>
                <Text style={{ color: "#22C6D2", fontSize: 20 }}>→</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Next Steps Checklist */}
          <View style={{
            backgroundColor: "rgba(34,198,210,0.1)",
            borderRadius: 16,
            padding: 16,
            marginTop: 20,
            borderWidth: 1,
            borderColor: "rgba(34,198,210,0.3)",
          }}>
            <Text style={{ color: "#22C6D2", fontWeight: "900", marginBottom: 12, fontSize: 16 }}>
              📋 Tournament Readiness Checklist
            </Text>
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ color: registrationPaid ? "#34C759" : "#9FB3C8", fontSize: 20 }}>
                  {registrationPaid ? "✓" : "○"}
                </Text>
                <Text style={{ color: "#EAF2FF", flex: 1 }}>
                  Pay registration fee
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ color: rosterProgress >= minRosterSize ? "#34C759" : "#9FB3C8", fontSize: 20 }}>
                  {rosterProgress >= minRosterSize ? "✓" : "○"}
                </Text>
                <Text style={{ color: "#EAF2FF", flex: 1 }}>
                  Add minimum {minRosterSize} players
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ color: verificationProgress === rosterProgress && rosterProgress > 0 ? "#34C759" : "#9FB3C8", fontSize: 20 }}>
                  {verificationProgress === rosterProgress && rosterProgress > 0 ? "✓" : "○"}
                </Text>
                <Text style={{ color: "#EAF2FF", flex: 1 }}>
                  Verify all players
                </Text>
              </View>
            </View>

            {registrationPaid && rosterProgress >= minRosterSize && verificationProgress === rosterProgress && (
              <View style={{
                marginTop: 16,
                backgroundColor: "#34C759",
                borderRadius: 12,
                padding: 12,
                alignItems: "center",
              }}>
                <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>
                  🎉 Ready to Play!
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}