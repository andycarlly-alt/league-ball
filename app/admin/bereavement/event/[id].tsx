// app/admin/bereavement/event/[id].tsx - BEREAVEMENT EVENT DETAIL & TRACKING

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../../../src/state/AppStore";
import { getLogoSource } from "../../../../src/utils/logos";

type TabType = "PAYMENTS" | "DETAILS" | "NOTIFICATIONS";

export default function BereavementEventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = String(id ?? "");

  const {
    currentUser,
    can,
    teams,
    bereavementEvents,
    bereavementPayments,
    bereavementEnrollments,
    sendBereavementReminder,
    closeBereavementEvent,
  } = useAppStore() as any;

  const [selectedTab, setSelectedTab] = useState<TabType>("PAYMENTS");

  // Check admin access
  const isAdmin = can("MANAGE_TOURNAMENTS") || currentUser?.role === "LEAGUE_ADMIN" || currentUser?.role === "TOURNAMENT_ADMIN";

  // Get event
  const event = useMemo(() => {
    return (bereavementEvents || []).find((e: any) => e.id === eventId);
  }, [bereavementEvents, eventId]);

  // Get payments for this event
  const eventPayments = useMemo(() => {
    return (bereavementPayments || []).filter((p: any) => p.eventId === eventId);
  }, [bereavementPayments, eventId]);

  // Calculate payment stats
  const paymentStats = useMemo(() => {
    const paid = eventPayments.filter((p: any) => p.status === "PAID");
    const pending = eventPayments.filter((p: any) => p.status === "PENDING");
    const overdue = eventPayments.filter((p: any) => {
      if (p.status !== "PENDING") return false;
      return event && new Date() > new Date(event.deadline);
    });

    return {
      total: eventPayments.length,
      paid: paid.length,
      pending: pending.length,
      overdue: overdue.length,
      amountCollected: paid.reduce((sum: number, p: any) => sum + p.amount, 0),
      amountPending: pending.reduce((sum: number, p: any) => sum + p.amount, 0),
      percentagePaid: eventPayments.length > 0 
        ? Math.round((paid.length / eventPayments.length) * 100) 
        : 0,
    };
  }, [eventPayments, event]);

  // Get teams with payment status
  const teamPaymentStatus = useMemo(() => {
    return eventPayments.map((payment: any) => {
      const team = teams.find((t: any) => t.id === payment.teamId);
      return {
        ...payment,
        teamName: team?.name || "Unknown Team",
        teamLogo: team?.logoKey || "placeholder",
      };
    }).sort((a: any, b: any) => {
      // Sort: Overdue first, then Pending, then Paid
      if (a.status === "PENDING" && b.status === "PAID") return -1;
      if (a.status === "PAID" && b.status === "PENDING") return 1;
      return a.teamName.localeCompare(b.teamName);
    });
  }, [eventPayments, teams]);

  // Check if event is overdue
  const isOverdue = useMemo(() => {
    if (!event) return false;
    return new Date() > new Date(event.deadline);
  }, [event]);

  // Days until/past deadline
  const daysToDeadline = useMemo(() => {
    if (!event) return 0;
    const now = new Date();
    const deadline = new Date(event.deadline);
    const diff = deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [event]);

  const handleSendReminder = (teamId?: string) => {
    const teamsToRemind = teamId 
      ? teamPaymentStatus.filter((p: any) => p.teamId === teamId && p.status === "PENDING")
      : teamPaymentStatus.filter((p: any) => p.status === "PENDING");

    if (teamsToRemind.length === 0) {
      Alert.alert("No Pending Payments", "All teams have already paid");
      return;
    }

    Alert.alert(
      "Send Payment Reminder",
      teamId 
        ? `Send reminder to ${teamsToRemind[0].teamName}?`
        : `Send reminders to ${teamsToRemind.length} team${teamsToRemind.length > 1 ? 's' : ''} with pending payments?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            if (typeof sendBereavementReminder === "function") {
              const result = sendBereavementReminder(eventId, teamId);
              Alert.alert(
                "✅ Reminders Sent",
                result.message || `${teamsToRemind.length} reminder${teamsToRemind.length > 1 ? 's' : ''} sent via SMS and email`
              );
            } else {
              Alert.alert(
                "✅ Reminders Sent (Demo)",
                `Sent ${teamsToRemind.length} reminder${teamsToRemind.length > 1 ? 's' : ''}:\n\n` +
                teamsToRemind.map((t: any) => `• ${t.teamName}`).join('\n')
              );
            }
          },
        },
      ]
    );
  };

  const handleCloseEvent = () => {
    if (paymentStats.pending > 0) {
      Alert.alert(
        "Pending Payments Remain",
        `There are still ${paymentStats.pending} pending payment${paymentStats.pending > 1 ? 's' : ''}.\n\n` +
        `Total Collected: $${(paymentStats.amountCollected / 100).toFixed(2)}\n` +
        `Still Outstanding: $${(paymentStats.amountPending / 100).toFixed(2)}\n\n` +
        `Close event anyway?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Close Event",
            style: "destructive",
            onPress: confirmCloseEvent,
          },
        ]
      );
    } else {
      Alert.alert(
        "Close Event - All Payments Received",
        `All ${paymentStats.total} payments have been received.\n\n` +
        `Total Collected: $${(paymentStats.amountCollected / 100).toFixed(2)}\n\n` +
        `Close this event and mark as complete?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Close Event",
            onPress: confirmCloseEvent,
          },
        ]
      );
    }
  };

  const confirmCloseEvent = () => {
    if (typeof closeBereavementEvent === "function") {
      const result = closeBereavementEvent(eventId);
      Alert.alert(
        "✅ Event Closed",
        result.message || "Event has been closed and marked as complete",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } else {
      Alert.alert(
        "✅ Event Closed (Demo)",
        `Event closed:\n\n` +
        `Final Collection: $${(paymentStats.amountCollected / 100).toFixed(2)}\n` +
        `Payments Received: ${paymentStats.paid}/${paymentStats.total}`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  };

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#FF3B30", fontSize: 18, fontWeight: "900" }}>Access Denied</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20, backgroundColor: "#22C6D2", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: "#061A2B", fontWeight: "900" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#FF3B30", fontSize: 18, fontWeight: "900" }}>Event Not Found</Text>
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

        <Text style={{ color: "#F2D100", fontSize: 20, fontWeight: "900", textAlign: "center" }}>
          {event.deceasedName}
        </Text>
        <Text style={{ color: "#9FB3C8", textAlign: "center", fontSize: 12, marginTop: 4 }}>
          Bereavement Event
        </Text>

        {/* Status Badge */}
        <View style={{ alignItems: "center", marginTop: 12 }}>
          <View style={{
            backgroundColor: event.status === "ACTIVE" 
              ? "rgba(255,59,48,0.2)" 
              : event.status === "CLOSED" 
              ? "rgba(52,199,89,0.2)"
              : "rgba(159,179,200,0.2)",
            paddingVertical: 6,
            paddingHorizontal: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: event.status === "ACTIVE" 
              ? "#FF3B30" 
              : event.status === "CLOSED" 
              ? "#34C759"
              : "#9FB3C8",
          }}>
            <Text style={{
              color: event.status === "ACTIVE" 
                ? "#FF3B30" 
                : event.status === "CLOSED" 
                ? "#34C759"
                : "#9FB3C8",
              fontWeight: "900",
              fontSize: 12,
            }}>
              {event.status === "ACTIVE" ? "🔴 ACTIVE" : event.status === "CLOSED" ? "✅ CLOSED" : event.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={{ padding: 16 }}>
        {/* Progress Bar */}
        <View style={{
          backgroundColor: "#0A2238",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
              Collection Progress
            </Text>
            <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 20 }}>
              {paymentStats.percentagePaid}%
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={{
            height: 12,
            backgroundColor: "#0B2842",
            borderRadius: 6,
            overflow: "hidden",
            marginBottom: 12,
          }}>
            <View style={{
              height: "100%",
              width: `${paymentStats.percentagePaid}%`,
              backgroundColor: "#34C759",
            }} />
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: "#9FB3C8", fontSize: 13 }}>
              {paymentStats.paid}/{paymentStats.total} teams paid
            </Text>
            <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 16 }}>
              ${(paymentStats.amountCollected / 100).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View style={{
            flex: 1,
            backgroundColor: "#0A2238",
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(52,199,89,0.3)",
          }}>
            <Text style={{ color: "#9FB3C8", fontSize: 11 }}>Collected</Text>
            <Text style={{ color: "#34C759", fontSize: 24, fontWeight: "900", marginTop: 4 }}>
              ${(paymentStats.amountCollected / 100).toFixed(0)}
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 2 }}>
              {paymentStats.paid} paid
            </Text>
          </View>

          <View style={{
            flex: 1,
            backgroundColor: "#0A2238",
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(242,209,0,0.3)",
          }}>
            <Text style={{ color: "#9FB3C8", fontSize: 11 }}>Pending</Text>
            <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900", marginTop: 4 }}>
              ${(paymentStats.amountPending / 100).toFixed(0)}
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 2 }}>
              {paymentStats.pending} teams
            </Text>
          </View>

          {paymentStats.overdue > 0 && (
            <View style={{
              flex: 1,
              backgroundColor: "#0A2238",
              borderRadius: 12,
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(255,59,48,0.3)",
            }}>
              <Text style={{ color: "#9FB3C8", fontSize: 11 }}>Overdue</Text>
              <Text style={{ color: "#FF3B30", fontSize: 24, fontWeight: "900", marginTop: 4 }}>
                {paymentStats.overdue}
              </Text>
              <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 2 }}>
                teams
              </Text>
            </View>
          )}
        </View>

        {/* Deadline Alert */}
        {isOverdue ? (
          <View style={{
            backgroundColor: "rgba(255,59,48,0.15)",
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            borderWidth: 2,
            borderColor: "#FF3B30",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}>
            <Text style={{ fontSize: 28 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#FF3B30", fontWeight: "900", fontSize: 14 }}>
                Deadline Passed
              </Text>
              <Text style={{ color: "#EAF2FF", fontSize: 12, marginTop: 2 }}>
                {Math.abs(daysToDeadline)} day{Math.abs(daysToDeadline) !== 1 ? 's' : ''} overdue • {paymentStats.pending} payment{paymentStats.pending !== 1 ? 's' : ''} pending
              </Text>
            </View>
          </View>
        ) : (
          <View style={{
            backgroundColor: "rgba(242,209,0,0.15)",
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "rgba(242,209,0,0.3)",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}>
            <Text style={{ fontSize: 24 }}>⏰</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 14 }}>
                Deadline: {new Date(event.deadline).toLocaleDateString()}
              </Text>
              <Text style={{ color: "#EAF2FF", fontSize: 12, marginTop: 2 }}>
                {daysToDeadline} day{daysToDeadline !== 1 ? 's' : ''} remaining
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {event.status === "ACTIVE" && (
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => handleSendReminder()}
              disabled={paymentStats.pending === 0}
              style={{
                flex: 1,
                backgroundColor: paymentStats.pending > 0 ? "#22C6D2" : "#0B2842",
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
                opacity: paymentStats.pending > 0 ? 1 : 0.5,
              }}
            >
              <Text style={{
                color: paymentStats.pending > 0 ? "#061A2B" : "#9FB3C8",
                fontWeight: "900",
                fontSize: 14,
              }}>
                📢 Send Reminders ({paymentStats.pending})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCloseEvent}
              style={{
                flex: 1,
                backgroundColor: paymentStats.pending === 0 ? "#34C759" : "#FF3B30",
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 14 }}>
                {paymentStats.pending === 0 ? "✓ Close Event" : "Close Event"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tabs */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
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

          <TouchableOpacity
            onPress={() => setSelectedTab("DETAILS")}
            style={{
              flex: 1,
              backgroundColor: selectedTab === "DETAILS" ? "#22C6D2" : "#0A2238",
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{
              color: selectedTab === "DETAILS" ? "#061A2B" : "#9FB3C8",
              fontWeight: "900",
              fontSize: 13,
            }}>
              Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTab("NOTIFICATIONS")}
            style={{
              flex: 1,
              backgroundColor: selectedTab === "NOTIFICATIONS" ? "#22C6D2" : "#0A2238",
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{
              color: selectedTab === "NOTIFICATIONS" ? "#061A2B" : "#9FB3C8",
              fontWeight: "900",
              fontSize: 13,
            }}>
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 40 }}>
        {/* PAYMENTS TAB */}
        {selectedTab === "PAYMENTS" && (
          <View>
            {teamPaymentStatus.map((payment: any) => {
              const isPaid = payment.status === "PAID";
              const isOverduePayment = payment.status === "PENDING" && isOverdue;

              return (
                <View
                  key={payment.id}
                  style={{
                    backgroundColor: "#0A2238",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 2,
                    borderColor: isPaid 
                      ? "rgba(52,199,89,0.3)" 
                      : isOverduePayment 
                      ? "#FF3B30"
                      : "rgba(242,209,0,0.3)",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <Image
                      source={getLogoSource(payment.teamLogo)}
                      style={{ width: 40, height: 40, borderRadius: 20 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                        {payment.teamName}
                      </Text>
                      <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                        {payment.enrolledCount || 0} enrolled member{payment.enrolledCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{
                        color: isPaid ? "#34C759" : "#F2D100",
                        fontWeight: "900",
                        fontSize: 18,
                      }}>
                        ${(payment.amount / 100).toFixed(2)}
                      </Text>
                      <View style={{
                        backgroundColor: isPaid 
                          ? "rgba(52,199,89,0.2)" 
                          : isOverduePayment
                          ? "rgba(255,59,48,0.2)"
                          : "rgba(242,209,0,0.2)",
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                        marginTop: 4,
                      }}>
                        <Text style={{
                          color: isPaid ? "#34C759" : isOverduePayment ? "#FF3B30" : "#F2D100",
                          fontSize: 10,
                          fontWeight: "900",
                        }}>
                          {isPaid ? "✓ PAID" : isOverduePayment ? "OVERDUE" : "PENDING"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {isPaid && payment.paidAt && (
                    <View style={{
                      backgroundColor: "#0B2842",
                      borderRadius: 8,
                      padding: 10,
                    }}>
                      <Text style={{ color: "#9FB3C8", fontSize: 12 }}>
                        Paid: {new Date(payment.paidAt).toLocaleDateString()} at {new Date(payment.paidAt).toLocaleTimeString()}
                      </Text>
                      {payment.paidBy && (
                        <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                          By: {payment.paidBy}
                        </Text>
                      )}
                    </View>
                  )}

                  {!isPaid && (
                    <TouchableOpacity
                      onPress={() => handleSendReminder(payment.teamId)}
                      style={{
                        backgroundColor: "#22C6D2",
                        paddingVertical: 10,
                        borderRadius: 10,
                        alignItems: "center",
                        marginTop: 8,
                      }}
                    >
                      <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 13 }}>
                        📧 Send Reminder
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* DETAILS TAB */}
        {selectedTab === "DETAILS" && (
          <View>
            <View style={{
              backgroundColor: "#0A2238",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16, marginBottom: 16 }}>
                Event Information
              </Text>

              <View style={{ gap: 12 }}>
                <View>
                  <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Deceased Name</Text>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginTop: 4 }}>
                    {event.deceasedName}
                  </Text>
                </View>

                {event.relationship && (
                  <View>
                    <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Relationship</Text>
                    <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginTop: 4 }}>
                      {event.relationship}
                    </Text>
                  </View>
                )}

                <View>
                  <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Collection Amount</Text>
                  <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16, marginTop: 4 }}>
                    ${(event.amountPerMember / 100).toFixed(2)} per member
                  </Text>
                </View>

                <View>
                  <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Payment Deadline</Text>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginTop: 4 }}>
                    {new Date(event.deadline).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>

                <View>
                  <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Created</Text>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginTop: 4 }}>
                    {new Date(event.createdAt).toLocaleDateString()} at {new Date(event.createdAt).toLocaleTimeString()}
                  </Text>
                </View>

                {event.message && (
                  <View>
                    <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Message to Teams</Text>
                    <View style={{
                      backgroundColor: "#0B2842",
                      borderRadius: 8,
                      padding: 12,
                      marginTop: 4,
                    }}>
                      <Text style={{ color: "#EAF2FF", fontSize: 14, lineHeight: 20 }}>
                        {event.message}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Beneficiary Info (if available) */}
            {event.beneficiaryName && (
              <View style={{
                backgroundColor: "#0A2238",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: "rgba(34,198,210,0.3)",
              }}>
                <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16, marginBottom: 16 }}>
                  Beneficiary Information
                </Text>

                <View style={{ gap: 12 }}>
                  <View>
                    <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Name</Text>
                    <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginTop: 4 }}>
                      {event.beneficiaryName}
                    </Text>
                  </View>

                  {event.beneficiaryRelationship && (
                    <View>
                      <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Relationship</Text>
                      <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginTop: 4 }}>
                        {event.beneficiaryRelationship}
                      </Text>
                    </View>
                  )}

                  {event.beneficiaryContact && (
                    <View>
                      <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Contact</Text>
                      <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginTop: 4 }}>
                        {event.beneficiaryContact}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* NOTIFICATIONS TAB */}
        {selectedTab === "NOTIFICATIONS" && (
          <View>
            <View style={{
              backgroundColor: "#0A2238",
              borderRadius: 12,
              padding: 16,
            }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16, marginBottom: 16 }}>
                Notification History
              </Text>

              {/* Mock notification history */}
              <View style={{ gap: 12 }}>
                <View style={{
                  backgroundColor: "#0B2842",
                  borderRadius: 10,
                  padding: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: "#22C6D2",
                }}>
                  <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 13 }}>
                    Event Created
                  </Text>
                  <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>
                    {new Date(event.createdAt).toLocaleDateString()} • Sent to {eventPayments.length} teams
                  </Text>
                </View>

                {/* Add actual notification history here when available */}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
