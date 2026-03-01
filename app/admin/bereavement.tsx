// app/admin/bereavement.tsx - LEAGUE-WIDE BEREAVEMENT ADMIN

import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";

export default function AdminBereavementScreen() {
  const router = useRouter();
  const { 
    currentUser,
    can,
    teams,
    bereavementEnrollments,
    bereavementEvents,
    bereavementPayments,
  } = useAppStore() as any;

  const [selectedTab, setSelectedTab] = useState<"ENROLLMENTS" | "EVENTS" | "PAYMENTS">("ENROLLMENTS");

  // ✅✅✅ FIXED PERMISSION CHECK ✅✅✅
  const isAdmin = can("MANAGE_TOURNAMENTS") || currentUser?.role === "LEAGUE_ADMIN" || currentUser?.role === "TOURNAMENT_ADMIN";

  // Get all enrollments grouped by status
  const enrollmentsByStatus = useMemo(() => {
    const all = bereavementEnrollments || [];
    return {
      pending: all.filter((e: any) => e.status === "PENDING"),
      active: all.filter((e: any) => e.status === "ACTIVE"),
      inactive: all.filter((e: any) => e.status === "INACTIVE"),
      rejected: all.filter((e: any) => e.status === "REJECTED"),
    };
  }, [bereavementEnrollments]);

  // Get all active events
  const activeEvents = useMemo(() => {
    return (bereavementEvents || []).filter((e: any) => e.status === "ACTIVE");
  }, [bereavementEvents]);

  // Get payment statistics
  const paymentStats = useMemo(() => {
    const all = bereavementPayments || [];
    const paid = all.filter((p: any) => p.status === "PAID");
    const pending = all.filter((p: any) => p.status === "PENDING");
    
    return {
      total: all.length,
      paid: paid.length,
      pending: pending.length,
      amountCollected: paid.reduce((sum: number, p: any) => sum + p.amount, 0),
      amountPending: pending.reduce((sum: number, p: any) => sum + p.amount, 0),
    };
  }, [bereavementPayments]);

  const getTeamName = (teamId: string) => {
    return teams.find((t: any) => t.id === teamId)?.name || "Unknown Team";
  };

  const handleApproveEnrollment = (enrollmentId: string) => {
    Alert.alert(
      "Approve Enrollment",
      "Are you sure you want to approve this enrollment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: () => {
            // TODO: Implement approval logic
            Alert.alert("✓ Approved", "Enrollment has been approved and is now active");
          },
        },
      ]
    );
  };

  const handleRejectEnrollment = (enrollmentId: string) => {
    Alert.prompt(
      "Reject Enrollment",
      "Enter reason for rejection:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: (reason) => {
            // TODO: Implement rejection logic
            Alert.alert("Rejected", `Enrollment rejected: ${reason || "No reason provided"}`);
          },
        },
      ],
      "plain-text"
    );
  };

  const handleCreateEvent = () => {
    router.push("/admin/bereavement/create-event");
  };

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#FF3B30", fontSize: 18, fontWeight: "900" }}>Access Denied</Text>
        <Text style={{ color: "#9FB3C8", marginTop: 8, textAlign: "center" }}>
          Only league administrators can access bereavement management
        </Text>
        <Text style={{ color: "#9FB3C8", marginTop: 8, fontSize: 12 }}>
          Your role: {currentUser?.role || "Unknown"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20, backgroundColor: "#22C6D2", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: "#061A2B", fontWeight: "900" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#0A2238",
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}
        >
          <View style={{ backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
            <Text style={{ color: "#22C6D2", fontSize: 16, fontWeight: "900" }}>← Back</Text>
          </View>
        </TouchableOpacity>

        <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900", textAlign: "center" }}>
          🏥 Bereavement Admin
        </Text>
        <Text style={{ color: "#9FB3C8", textAlign: "center", fontSize: 12, marginTop: 4 }}>
          League-wide bereavement fund management
        </Text>
      </View>

      {/* ADD THIS DEBUG BUTTON - TEMPORARY */}
<TouchableOpacity
  onPress={() => router.push('/admin/bereavement/debug')}
  style={{
    margin: 16,
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  }}
>
  <Text style={{ color: "#FFF", fontWeight: "900" }}>
    🔍 DEBUG: Check What's Stored
  </Text>
</TouchableOpacity>

      {/* Stats Overview */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          {/* Total Enrollments */}
          <View style={{
            flex: 1,
            backgroundColor: "#0A2238",
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(34,198,210,0.3)",
          }}>
            <Text style={{ color: "#22C6D2", fontSize: 28, fontWeight: "900" }}>
              {(bereavementEnrollments || []).length}
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4 }}>
              Total Enrolled
            </Text>
          </View>

          {/* Pending Approvals */}
          <View style={{
            flex: 1,
            backgroundColor: "#0A2238",
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(242,209,0,0.3)",
          }}>
            <Text style={{ color: "#F2D100", fontSize: 28, fontWeight: "900" }}>
              {enrollmentsByStatus.pending.length}
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4 }}>
              Pending Approval
            </Text>
          </View>

          {/* Active Events */}
          <View style={{
            flex: 1,
            backgroundColor: "#0A2238",
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(255,59,48,0.3)",
          }}>
            <Text style={{ color: "#FF3B30", fontSize: 28, fontWeight: "900" }}>
              {activeEvents.length}
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4 }}>
              Active Events
            </Text>
          </View>
        </View>

        {/* Payments Summary */}
        <View style={{
          backgroundColor: "#0A2238",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: "rgba(52,199,89,0.3)",
        }}>
          <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
            💰 Payment Summary
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: "#9FB3C8" }}>Collected:</Text>
            <Text style={{ color: "#34C759", fontWeight: "900" }}>
              ${(paymentStats.amountCollected / 100).toFixed(2)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: "#9FB3C8" }}>Pending:</Text>
            <Text style={{ color: "#F2D100", fontWeight: "900" }}>
              ${(paymentStats.amountPending / 100).toFixed(2)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: "#9FB3C8" }}>Total Payments:</Text>
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
              {paymentStats.paid}/{paymentStats.total} paid
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setSelectedTab("ENROLLMENTS")}
            style={{
              flex: 1,
              backgroundColor: selectedTab === "ENROLLMENTS" ? "#22C6D2" : "#0A2238",
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{
              color: selectedTab === "ENROLLMENTS" ? "#061A2B" : "#9FB3C8",
              fontWeight: "900",
              fontSize: 13,
            }}>
              Enrollments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTab("EVENTS")}
            style={{
              flex: 1,
              backgroundColor: selectedTab === "EVENTS" ? "#22C6D2" : "#0A2238",
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{
              color: selectedTab === "EVENTS" ? "#061A2B" : "#9FB3C8",
              fontWeight: "900",
              fontSize: 13,
            }}>
              Events
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTab("PAYMENTS")}
            style={{
              flex: 1,
              backgroundColor: selectedTab === "PAYMENTS" ? "#22C6D2" : "#0A2238",
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{
              color: selectedTab === "PAYMENTS" ? "#061A2B" : "#9FB3C8",
              fontWeight: "900",
              fontSize: 13,
            }}>
              Payments
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 40 }}>
        {/* ENROLLMENTS TAB */}
        {selectedTab === "ENROLLMENTS" && (
          <View>
            {/* Pending Enrollments */}
            {enrollmentsByStatus.pending.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
                  ⚠️ Pending Approval ({enrollmentsByStatus.pending.length})
                </Text>
                {enrollmentsByStatus.pending.map((enrollment: any) => (
                  <View
                    key={enrollment.id}
                    style={{
                      backgroundColor: "#0A2238",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 2,
                      borderColor: "#F2D100",
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                          {enrollment.firstName} {enrollment.lastName}
                        </Text>
                        <Text style={{ color: "#9FB3C8", fontSize: 13, marginTop: 4 }}>
                          {getTeamName(enrollment.teamId)}
                        </Text>
                        <Text style={{ color: "#9FB3C8", fontSize: 13, marginTop: 2 }}>
                          Type: {enrollment.memberType === "PLAYER" ? "Player" : "Family Member"}
                        </Text>
                      </View>
                      <View style={{
                        backgroundColor: "rgba(242,209,0,0.2)",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                        alignSelf: "flex-start",
                      }}>
                        <Text style={{ color: "#F2D100", fontSize: 11, fontWeight: "900" }}>
                          PENDING
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => handleApproveEnrollment(enrollment.id)}
                        style={{
                          flex: 1,
                          backgroundColor: "#34C759",
                          paddingVertical: 10,
                          borderRadius: 10,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 13 }}>
                          ✓ Approve
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleRejectEnrollment(enrollment.id)}
                        style={{
                          flex: 1,
                          backgroundColor: "#FF3B30",
                          paddingVertical: 10,
                          borderRadius: 10,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 13 }}>
                          ✕ Reject
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => router.push(`/admin/bereavement/enrollment/${enrollment.id}`)}
                        style={{
                          backgroundColor: "#0B2842",
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRadius: 10,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 13 }}>
                          View
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Active Enrollments */}
            {enrollmentsByStatus.active.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
                  ✓ Active Enrollments ({enrollmentsByStatus.active.length})
                </Text>
                {enrollmentsByStatus.active.map((enrollment: any) => (
                  <View
                    key={enrollment.id}
                    style={{
                      backgroundColor: "#0A2238",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: "rgba(52,199,89,0.3)",
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                          {enrollment.firstName} {enrollment.lastName}
                        </Text>
                        <Text style={{ color: "#9FB3C8", fontSize: 13, marginTop: 4 }}>
                          {getTeamName(enrollment.teamId)}
                        </Text>
                        <Text style={{ color: "#9FB3C8", fontSize: 13, marginTop: 2 }}>
                          Approved: {new Date(enrollment.approvedAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => router.push(`/admin/bereavement/enrollment/${enrollment.id}`)}
                        style={{
                          backgroundColor: "#0B2842",
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 10,
                          alignSelf: "flex-start",
                        }}
                      >
                        <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 13 }}>
                          View
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* No Enrollments */}
            {(bereavementEnrollments || []).length === 0 && (
              <View style={{
                backgroundColor: "#0A2238",
                borderRadius: 12,
                padding: 24,
                alignItems: "center",
              }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                  No Enrollments Yet
                </Text>
                <Text style={{ color: "#9FB3C8", marginTop: 8, textAlign: "center" }}>
                  Team reps can enroll members through their team dashboard
                </Text>
              </View>
            )}
          </View>
        )}

        {/* EVENTS TAB */}
        {selectedTab === "EVENTS" && (
          <View>
            {/* Create Event Button */}
            <TouchableOpacity
              onPress={handleCreateEvent}
              style={{
                backgroundColor: "#34C759",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>
                + Create Bereavement Event
              </Text>
            </TouchableOpacity>

            {/* Active Events */}
            {activeEvents.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: "#FF3B30", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
                  🔴 Active Events ({activeEvents.length})
                </Text>
                {activeEvents.map((event: any) => (
                  <View
                    key={event.id}
                    style={{
                      backgroundColor: "#0A2238",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 2,
                      borderColor: "#FF3B30",
                    }}
                  >
                    <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
                      {event.deceasedName}
                    </Text>
                    <View style={{ gap: 6 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: "#9FB3C8" }}>Collection per member:</Text>
                        <Text style={{ color: "#F2D100", fontWeight: "900" }}>
                          ${(event.amountPerMember / 100).toFixed(2)}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: "#9FB3C8" }}>Deadline:</Text>
                        <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                          {new Date(event.deadline).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: "#9FB3C8" }}>Created:</Text>
                        <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                          {new Date(event.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => router.push(`/admin/bereavement/event/${event.id}`)}
                      style={{
                        marginTop: 12,
                        backgroundColor: "#22C6D2",
                        paddingVertical: 10,
                        borderRadius: 10,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#061A2B", fontWeight: "900" }}>
                        View Event Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* No Events */}
            {activeEvents.length === 0 && (
              <View style={{
                backgroundColor: "#0A2238",
                borderRadius: 12,
                padding: 24,
                alignItems: "center",
              }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>❤️</Text>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                  No Active Events
                </Text>
                <Text style={{ color: "#9FB3C8", marginTop: 8, textAlign: "center" }}>
                  Create a bereavement event when needed
                </Text>
              </View>
            )}
          </View>
        )}

        {/* PAYMENTS TAB */}
        {selectedTab === "PAYMENTS" && (
          <View>
            {(bereavementPayments || []).map((payment: any) => (
              <View
                key={payment.id}
                style={{
                  backgroundColor: "#0A2238",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: payment.status === "PAID" 
                    ? "rgba(52,199,89,0.3)" 
                    : "rgba(242,209,0,0.3)",
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                      {getTeamName(payment.teamId)}
                    </Text>
                    <Text style={{ color: "#9FB3C8", fontSize: 13, marginTop: 4 }}>
                      Event: {payment.eventName || "Unknown"}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ 
                      color: payment.status === "PAID" ? "#34C759" : "#F2D100", 
                      fontWeight: "900", 
                      fontSize: 18 
                    }}>
                      ${(payment.amount / 100).toFixed(2)}
                    </Text>
                    <View style={{
                      backgroundColor: payment.status === "PAID" 
                        ? "rgba(52,199,89,0.2)" 
                        : "rgba(242,209,0,0.2)",
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 6,
                      marginTop: 4,
                    }}>
                      <Text style={{ 
                        color: payment.status === "PAID" ? "#34C759" : "#F2D100", 
                        fontSize: 11, 
                        fontWeight: "900" 
                      }}>
                        {payment.status}
                      </Text>
                    </View>
                  </View>
                </View>

                {payment.status === "PAID" && payment.paidAt && (
                  <Text style={{ color: "#9FB3C8", fontSize: 12 }}>
                    Paid: {new Date(payment.paidAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}

            {/* No Payments */}
            {(bereavementPayments || []).length === 0 && (
              <View style={{
                backgroundColor: "#0A2238",
                borderRadius: 12,
                padding: 24,
                alignItems: "center",
              }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>💳</Text>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                  No Payments Yet
                </Text>
                <Text style={{ color: "#9FB3C8", marginTop: 8, textAlign: "center" }}>
                  Payments will appear here when events are created
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}