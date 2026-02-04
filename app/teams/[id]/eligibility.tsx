// app/teams/[id]/eligibility.tsx - TEAM ELIGIBILITY & FINES STATUS

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../../src/state/AppStore";

export default function TeamEligibilityScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = String(id ?? "");

  const {
    teams,
    getTeamEligibility,
    getTeamUnpaidFines,
    payCardFine,
    overrideTeamEligibility,
    removeTeamEligibilityOverride,
    walletBalance,
    can,
  } = useAppStore() as any;

  const team = useMemo(
    () => teams.find((t: any) => t.id === teamId),
    [teams, teamId]
  );

  const eligibility = useMemo(
    () => getTeamEligibility(teamId),
    [teamId]
  );

  const unpaidFines = useMemo(
    () => getTeamUnpaidFines(teamId),
    [teamId]
  );

  const canManage = can("MANAGE_TOURNAMENTS");

  const handlePayFine = (fineId: string, amount: number) => {
    Alert.alert(
      "Pay Card Fine",
      `Pay $${(amount / 100).toFixed(2)} from your wallet?\n\nCurrent Balance: $${(walletBalance / 100).toFixed(2)}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay Now",
          onPress: () => {
            const result = payCardFine(fineId);
            if (result.ok) {
              Alert.alert("✓ Paid!", result.message);
            } else {
              Alert.alert("Payment Failed", result.message);
            }
          },
        },
      ]
    );
  };

  const handlePayAllFines = () => {
    const totalAmount = unpaidFines.reduce((sum: number, f: any) => sum + f.amount, 0);
    
    Alert.alert(
      "Pay All Fines",
      `Pay all ${unpaidFines.length} fine${unpaidFines.length > 1 ? 's' : ''} ($${(totalAmount / 100).toFixed(2)})?\n\nCurrent Balance: $${(walletBalance / 100).toFixed(2)}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay All",
          onPress: () => {
            let successCount = 0;
            let failCount = 0;

            unpaidFines.forEach((fine: any) => {
              const result = payCardFine(fine.id);
              if (result.ok) successCount++;
              else failCount++;
            });

            if (failCount === 0) {
              Alert.alert("✓ All Paid!", `Successfully paid ${successCount} fine${successCount > 1 ? 's' : ''}`);
            } else {
              Alert.alert("Partial Payment", `Paid ${successCount}, failed ${failCount}. Check wallet balance.`);
            }
          },
        },
      ]
    );
  };

  const handleAdminOverride = () => {
    Alert.prompt(
      "Override Eligibility",
      "Enter reason for allowing team to play:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Override",
          onPress: (reason) => {
            const result = overrideTeamEligibility(teamId, reason || "Admin override");
            Alert.alert(result.ok ? "✓ Override Applied" : "Failed", result.message);
          },
        },
      ],
      "plain-text"
    );
  };

  const handleRemoveOverride = () => {
    Alert.alert(
      "Remove Override",
      "Team will be blocked again if fines are unpaid. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeTeamEligibilityOverride(teamId);
            Alert.alert("Override Removed", "Team eligibility reset to normal rules");
          },
        },
      ]
    );
  };

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

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ padding: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
            <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>

          <Text style={{ color: "#F2D100", fontSize: 28, fontWeight: "900" }}>
            Team Eligibility
          </Text>
          <Text style={{ color: "#9FB3C8", marginTop: 8, fontSize: 16 }}>
            {team.name}
          </Text>
        </View>

        {/* Eligibility Status Card */}
        <View style={{
          marginHorizontal: 16,
          marginBottom: 20,
          backgroundColor: eligibility.isEligible 
            ? "rgba(52,199,89,0.1)" 
            : "rgba(255,59,48,0.1)",
          borderRadius: 16,
          padding: 20,
          borderWidth: 2,
          borderColor: eligibility.isEligible ? "#34C759" : "#FF3B30",
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ 
              color: eligibility.isEligible ? "#34C759" : "#FF3B30", 
              fontSize: 24, 
              fontWeight: "900" 
            }}>
              {eligibility.isEligible ? "✓ ELIGIBLE" : "⚠️ BLOCKED"}
            </Text>
            <Text style={{ fontSize: 48 }}>
              {eligibility.isEligible ? "✅" : "🚫"}
            </Text>
          </View>

          {!eligibility.isEligible && (
            <Text style={{ color: "#FF3B30", fontSize: 16, marginTop: 8 }}>
              {eligibility.blockedReason}
            </Text>
          )}

          {eligibility.adminOverride && (
            <View style={{
              marginTop: 16,
              backgroundColor: "rgba(242,209,0,0.2)",
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: "#F2D100",
            }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", marginBottom: 4 }}>
                🔓 Admin Override Active
              </Text>
              <Text style={{ color: "#EAF2FF", fontSize: 13 }}>
                By: {eligibility.overrideBy}
              </Text>
              <Text style={{ color: "#EAF2FF", fontSize: 13 }}>
                Reason: {eligibility.overrideReason}
              </Text>
              {canManage && (
                <TouchableOpacity
                  onPress={handleRemoveOverride}
                  style={{
                    marginTop: 12,
                    backgroundColor: "#FF3B30",
                    borderRadius: 10,
                    paddingVertical: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>
                    Remove Override
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Unpaid Fines */}
        {unpaidFines.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: "#F2D100", fontSize: 20, fontWeight: "900" }}>
                Outstanding Fines ({unpaidFines.length})
              </Text>
              {unpaidFines.length > 1 && (
                <TouchableOpacity
                  onPress={handlePayAllFines}
                  style={{
                    backgroundColor: "#34C759",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 13 }}>
                    Pay All
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ gap: 12 }}>
              {unpaidFines.map((fine: any) => {
                const isOverdue = Date.now() > fine.dueDate;
                
                return (
                  <View
                    key={fine.id}
                    style={{
                      backgroundColor: "#0A2238",
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 2,
                      borderColor: isOverdue ? "#FF3B30" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <View style={{
                          backgroundColor: fine.cardType === "YELLOW" ? "#F2D100" : "#FF3B30",
                          width: 32,
                          height: 40,
                          borderRadius: 4,
                        }} />
                        <View>
                          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                            {fine.cardType} Card Fine
                          </Text>
                          <Text style={{ color: "#9FB3C8", fontSize: 13 }}>
                            {fine.playerName}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 20 }}>
                        ${(fine.amount / 100).toFixed(2)}
                      </Text>
                    </View>

                    <View style={{
                      backgroundColor: isOverdue ? "rgba(255,59,48,0.1)" : "rgba(34,198,210,0.1)",
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 12,
                    }}>
                      <Text style={{ color: isOverdue ? "#FF3B30" : "#22C6D2", fontSize: 13 }}>
                        {isOverdue ? "⚠️ OVERDUE" : "Due"}: {new Date(fine.dueDate).toLocaleDateString()}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handlePayFine(fine.id, fine.amount)}
                      style={{
                        backgroundColor: "#34C759",
                        borderRadius: 10,
                        paddingVertical: 12,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#061A2B", fontWeight: "900" }}>
                        Pay ${(fine.amount / 100).toFixed(2)} from Wallet
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Total */}
            <View style={{
              marginTop: 16,
              backgroundColor: "#0A2238",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                Total Outstanding
              </Text>
              <Text style={{ color: "#FF3B30", fontWeight: "900", fontSize: 24 }}>
                ${(eligibility.outstandingFines / 100).toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* No Fines */}
        {unpaidFines.length === 0 && (
          <View style={{
            marginHorizontal: 16,
            backgroundColor: "rgba(52,199,89,0.1)",
            borderRadius: 16,
            padding: 24,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "rgba(52,199,89,0.3)",
          }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>✓</Text>
            <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 18, textAlign: "center" }}>
              No Outstanding Fines
            </Text>
            <Text style={{ color: "#EAF2FF", marginTop: 8, textAlign: "center" }}>
              Team is in good standing
            </Text>
          </View>
        )}

        {/* Admin Actions */}
        {canManage && !eligibility.adminOverride && !eligibility.isEligible && (
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <View style={{
              backgroundColor: "rgba(242,209,0,0.1)",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "rgba(242,209,0,0.3)",
            }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", marginBottom: 8 }}>
                🔑 Admin Actions
              </Text>
              <Text style={{ color: "#EAF2FF", marginBottom: 16, lineHeight: 20 }}>
                As a league admin, you can temporarily override the block to allow this team to play.
              </Text>
              <TouchableOpacity
                onPress={handleAdminOverride}
                style={{
                  backgroundColor: "#F2D100",
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>
                  Override & Allow Team to Play
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Info Card */}
        <View style={{
          marginHorizontal: 16,
          marginTop: 20,
          backgroundColor: "rgba(34,198,210,0.1)",
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(34,198,210,0.3)",
        }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", marginBottom: 8 }}>
            💡 Card Fine Policy
          </Text>
          <View style={{ gap: 6 }}>
            <Text style={{ color: "#EAF2FF", lineHeight: 20 }}>
              • Yellow Card: $25 fine
            </Text>
            <Text style={{ color: "#EAF2FF", lineHeight: 20 }}>
              • Red Card: $50 fine
            </Text>
            <Text style={{ color: "#EAF2FF", lineHeight: 20 }}>
              • Payment due within 7 days
            </Text>
            <Text style={{ color: "#EAF2FF", lineHeight: 20 }}>
              • Teams blocked from matches if unpaid
            </Text>
          </View>
        </View>

        {/* Wallet Balance */}
        <View style={{
          marginHorizontal: 16,
          marginTop: 16,
          backgroundColor: "#0A2238",
          borderRadius: 12,
          padding: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
            Current Wallet Balance
          </Text>
          <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 20 }}>
            ${(walletBalance / 100).toFixed(2)}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}