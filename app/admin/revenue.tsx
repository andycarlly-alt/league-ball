// app/admin/revenue.tsx - COMPREHENSIVE REVENUE DASHBOARD

import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { normalize, spacing } from "../../src/utils/responsive";

type TimeFilter = "7D" | "30D" | "90D" | "1Y" | "ALL";

export default function RevenueDashboardScreen() {
  const router = useRouter();
  const {
    pendingPayments,
    tournaments,
    teams,
    players,
    matches,
    businesses,
    can,
  } = useAppStore() as any;

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30D");

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

  // Calculate revenue streams
  const revenueData = useMemo(() => {
    const allPayments = pendingPayments ?? [];
    
    // Tournament Registration Fees
    const tournamentFees = allPayments.filter((p: any) => p.type === "TOURNAMENT_REGISTRATION");
    const tournamentRevenue = tournamentFees.reduce((sum: number, p: any) => 
      p.status === "PAID" ? sum + p.amount : sum, 0
    );
    const tournamentPending = tournamentFees.reduce((sum: number, p: any) => 
      p.status === "PENDING" ? sum + p.amount : sum, 0
    );

    // Card Fines
    const cardFines = allPayments.filter((p: any) => p.type === "CARD_FINE");
    const finesRevenue = cardFines.reduce((sum: number, p: any) => 
      p.status === "PAID" ? sum + p.amount : sum, 0
    );
    const finesPending = cardFines.reduce((sum: number, p: any) => 
      p.status === "PENDING" ? sum + p.amount : sum, 0
    );

    // Bereavement Fund (assume $10/player enrolled)
    const bereavementEnrolled = (players ?? []).filter((p: any) => p.bereavementEnrolled).length;
    const bereavementRevenue = bereavementEnrolled * 1000; // $10 per player

    // Sponsor Revenue (estimated based on tiers)
    const sponsorRevenue = 125000; // $1,250 placeholder

    // Referee Fees (collected from teams per match)
    const totalMatches = (matches ?? []).length;
    const refereeRevenue = totalMatches * 5000; // $50 per match

    // Business Listings
    const businessRevenue = ((businesses ?? []).length) * 2500; // $25 per business

    const totalRevenue = tournamentRevenue + finesRevenue + bereavementRevenue + sponsorRevenue + refereeRevenue + businessRevenue;
    const totalPending = tournamentPending + finesPending;

    return {
      total: totalRevenue,
      pending: totalPending,
      streams: [
        {
          name: "Tournament Fees",
          collected: tournamentRevenue,
          pending: tournamentPending,
          count: tournamentFees.length,
          icon: "🏆",
          color: "#F2D100",
        },
        {
          name: "Card Fines",
          collected: finesRevenue,
          pending: finesPending,
          count: cardFines.length,
          icon: "🟨",
          color: "#FF3B30",
        },
        {
          name: "Bereavement Fund",
          collected: bereavementRevenue,
          pending: 0,
          count: bereavementEnrolled,
          icon: "🏥",
          color: "#34C759",
        },
        {
          name: "Sponsor Revenue",
          collected: sponsorRevenue,
          pending: 0,
          count: 4,
          icon: "💼",
          color: "#22C6D2",
        },
        {
          name: "Referee Fees",
          collected: refereeRevenue,
          pending: 0,
          count: totalMatches,
          icon: "👔",
          color: "#AF52DE",
        },
        {
          name: "Business Listings",
          collected: businessRevenue,
          pending: 0,
          count: (businesses ?? []).length,
          icon: "🏪",
          color: "#FF9500",
        },
      ].sort((a, b) => b.collected - a.collected),
    };
  }, [pendingPayments, players, matches, businesses]);

  const recentTransactions = useMemo(() => {
    return (pendingPayments ?? [])
      .filter((p: any) => p.status === "PAID")
      .sort((a: any, b: any) => (b.paidAt ?? 0) - (a.paidAt ?? 0))
      .slice(0, 10);
  }, [pendingPayments]);

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#0A2238",
        paddingTop: spacing.xl + 40,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: normalize(20),
        borderBottomRightRadius: normalize(20),
      }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}
        >
          <View style={{ backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
            <Text style={{ color: "#22C6D2", fontSize: 16, fontWeight: "900" }}>← Back</Text>
          </View>
        </TouchableOpacity>

        <Text style={{ color: "#F2D100", fontSize: normalize(24), fontWeight: "900", textAlign: "center" }}>
          💰 Revenue Dashboard
        </Text>
        <Text style={{ color: "#9FB3C8", textAlign: "center", fontSize: normalize(13), marginTop: 4 }}>
          Complete financial overview
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.huge,
          gap: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Revenue Cards */}
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          {/* Total Collected */}
          <View style={{
            flex: 1,
            backgroundColor: "#0A2238",
            borderRadius: normalize(16),
            padding: spacing.md,
            borderWidth: 2,
            borderColor: "#34C759",
          }}>
            <Text style={{ color: "#9FB3C8", fontSize: normalize(12), marginBottom: 6 }}>
              TOTAL COLLECTED
            </Text>
            <Text style={{ color: "#34C759", fontSize: normalize(28), fontWeight: "900" }}>
              ${(revenueData.total / 100).toFixed(2)}
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: normalize(11), marginTop: 4 }}>
              {revenueData.streams.length} revenue streams
            </Text>
          </View>

          {/* Pending */}
          <View style={{
            flex: 1,
            backgroundColor: "#0A2238",
            borderRadius: normalize(16),
            padding: spacing.md,
            borderWidth: 2,
            borderColor: "#FF3B30",
          }}>
            <Text style={{ color: "#9FB3C8", fontSize: normalize(12), marginBottom: 6 }}>
              PENDING
            </Text>
            <Text style={{ color: "#FF3B30", fontSize: normalize(28), fontWeight: "900" }}>
              ${(revenueData.pending / 100).toFixed(2)}
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: normalize(11), marginTop: 4 }}>
              Outstanding payments
            </Text>
          </View>
        </View>

        {/* Projected Annual */}
        <View style={{
          backgroundColor: "rgba(242,209,0,0.1)",
          borderRadius: normalize(16),
          padding: spacing.md,
          borderWidth: 2,
          borderColor: "#F2D100",
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ color: "#F2D100", fontSize: normalize(12), fontWeight: "900", marginBottom: 4 }}>
                PROJECTED ANNUAL REVENUE
              </Text>
              <Text style={{ color: "#F2D100", fontSize: normalize(32), fontWeight: "900" }}>
                ${((revenueData.total + revenueData.pending) * 12 / 100).toFixed(0)}
              </Text>
            </View>
            <Text style={{ fontSize: normalize(48) }}>📈</Text>
          </View>
        </View>

        {/* Time Filter */}
        <View>
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(16), marginBottom: spacing.sm }}>
            Time Period
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.xs }}
          >
            {(["7D", "30D", "90D", "1Y", "ALL"] as TimeFilter[]).map((filter) => {
              const isActive = timeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setTimeFilter(filter)}
                  style={{
                    backgroundColor: isActive ? "#22C6D2" : "#0A2238",
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: normalize(10),
                    borderWidth: 1,
                    borderColor: isActive ? "#22C6D2" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text style={{
                    color: isActive ? "#061A2B" : "#9FB3C8",
                    fontWeight: "900",
                    fontSize: normalize(13),
                  }}>
                    {filter === "7D" ? "7 Days" : 
                     filter === "30D" ? "30 Days" :
                     filter === "90D" ? "90 Days" :
                     filter === "1Y" ? "1 Year" : "All Time"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Revenue by Stream */}
        <View>
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(18), marginBottom: spacing.sm }}>
            Revenue by Stream
          </Text>
          
          {revenueData.streams.map((stream, index) => {
            const total = stream.collected + stream.pending;
            const percentage = revenueData.total > 0 ? (stream.collected / revenueData.total) * 100 : 0;

            return (
              <View
                key={stream.name}
                style={{
                  backgroundColor: "#0A2238",
                  borderRadius: normalize(14),
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.sm }}>
                  <Text style={{ fontSize: normalize(24), marginRight: spacing.sm }}>
                    {stream.icon}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#EAF2FF", fontSize: normalize(15), fontWeight: "900" }}>
                      {stream.name}
                    </Text>
                    <Text style={{ color: "#9FB3C8", fontSize: normalize(12), marginTop: 2 }}>
                      {stream.count} {stream.name === "Bereavement Fund" ? "enrolled" : "transactions"}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ color: stream.color, fontSize: normalize(18), fontWeight: "900" }}>
                      ${(stream.collected / 100).toFixed(2)}
                    </Text>
                    <Text style={{ color: "#9FB3C8", fontSize: normalize(11), marginTop: 2 }}>
                      {percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={{
                  height: 6,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}>
                  <View style={{
                    width: `${percentage}%`,
                    height: "100%",
                    backgroundColor: stream.color,
                  }} />
                </View>

                {/* Pending Amount */}
                {stream.pending > 0 && (
                  <Text style={{ color: "#FF3B30", fontSize: normalize(11), marginTop: 6 }}>
                    ${(stream.pending / 100).toFixed(2)} pending
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Recent Transactions */}
        <View>
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(18), marginBottom: spacing.sm }}>
            Recent Transactions
          </Text>

          {recentTransactions.length > 0 ? (
            <View style={{ gap: spacing.xs }}>
              {recentTransactions.map((txn: any) => (
                <View
                  key={txn.id}
                  style={{
                    backgroundColor: "#0A2238",
                    borderRadius: normalize(12),
                    padding: spacing.md,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#EAF2FF", fontSize: normalize(14), fontWeight: "900" }}>
                        {txn.type === "TOURNAMENT_REGISTRATION" ? "🏆 Tournament Fee" : 
                         txn.type === "CARD_FINE" ? "🟨 Card Fine" : 
                         txn.type}
                      </Text>
                      <Text style={{ color: "#9FB3C8", fontSize: normalize(12), marginTop: 2 }}>
                        {txn.teamName || txn.playerName || "N/A"}
                      </Text>
                      <Text style={{ color: "#22C6D2", fontSize: normalize(11), marginTop: 4 }}>
                        {txn.paidAt ? new Date(txn.paidAt).toLocaleDateString() : "Recently"}
                      </Text>
                    </View>
                    <Text style={{ color: "#34C759", fontSize: normalize(16), fontWeight: "900" }}>
                      +${(txn.amount / 100).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={{
              backgroundColor: "#0A2238",
              borderRadius: normalize(12),
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              alignItems: "center",
            }}>
              <Text style={{ fontSize: normalize(32), marginBottom: spacing.sm }}>💸</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(15) }}>
                No Recent Transactions
              </Text>
              <Text style={{ color: "#9FB3C8", marginTop: 6, textAlign: "center", fontSize: normalize(13) }}>
                Completed payments will appear here
              </Text>
            </View>
          )}
        </View>

        {/* Key Insights */}
        <View style={{
          backgroundColor: "rgba(34,198,210,0.1)",
          borderRadius: normalize(16),
          padding: spacing.md,
          borderWidth: 1,
          borderColor: "rgba(34,198,210,0.3)",
        }}>
          <Text style={{ color: "#22C6D2", fontSize: normalize(16), fontWeight: "900", marginBottom: spacing.sm }}>
            💡 Key Insights
          </Text>
          <View style={{ gap: 6 }}>
            <Text style={{ color: "#EAF2FF", fontSize: normalize(13), lineHeight: 20 }}>
              • Top revenue stream: {revenueData.streams[0]?.name} (${(revenueData.streams[0]?.collected / 100).toFixed(2)})
            </Text>
            <Text style={{ color: "#EAF2FF", fontSize: normalize(13), lineHeight: 20 }}>
              • {tournaments?.length || 0} active tournaments generating fees
            </Text>
            <Text style={{ color: "#EAF2FF", fontSize: normalize(13), lineHeight: 20 }}>
              • {teams?.length || 0} registered teams across all leagues
            </Text>
            <Text style={{ color: "#EAF2FF", fontSize: normalize(13), lineHeight: 20 }}>
              • {(players ?? []).filter((p: any) => p.bereavementEnrolled).length} players enrolled in bereavement fund
            </Text>
          </View>
        </View>

        {/* Export & Actions */}
        <View style={{ gap: spacing.sm }}>
          <TouchableOpacity
            onPress={() => {
              // In production: Generate CSV/PDF report
              alert("Export functionality coming soon!");
            }}
            style={{
              backgroundColor: "#F2D100",
              borderRadius: normalize(12),
              padding: spacing.md,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#061A2B", fontSize: normalize(15), fontWeight: "900" }}>
              📊 Export Revenue Report
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/billing")}
            style={{
              backgroundColor: "#0A2238",
              borderRadius: normalize(12),
              padding: spacing.md,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{ color: "#EAF2FF", fontSize: normalize(15), fontWeight: "900" }}>
              💰 View Billing & Payments
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}