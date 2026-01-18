// app/admin/revenue.tsx - Admin Revenue Dashboard
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";

export default function RevenueDashboard() {
  const router = useRouter();
  const store: any = useAppStore();
  const { currentUser, teams, tournaments, players } = store;

  // Check if user is admin - FIXED: Use role check instead of can()
  const isAdmin = currentUser?.role === "LEAGUE_ADMIN";

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#FF3B30", fontSize: 18, fontWeight: "900" }}>
          ⛔ Admin Access Required
        </Text>
        <Text style={{ color: "#9FB3C8", marginTop: 8, textAlign: "center" }}>
          Only league administrators can view revenue data
        </Text>
        <Text style={{ color: "#9FB3C8", marginTop: 4, textAlign: "center" }}>
          Current role: {currentUser?.role || "Not set"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            backgroundColor: "#22C6D2",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#061A2B", fontWeight: "900" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Mock revenue data (in production, this would come from backend)
  const revenueData = useMemo(() => {
    return {
      // This month
      thisMonth: {
        total: 12450, // $124.50 in cents
        tournamentRegistration: 4500, // $45
        cardFines: 1250, // $12.50
        bettingFees: 3200, // $32 (10% of pool)
        subscriptions: 1999, // $19.99
        vendorAds: 1500, // $15
        digitalIDs: 1, // $0.01 (1 cent for demo)
      },
      // Last month
      lastMonth: {
        total: 18900,
        tournamentRegistration: 9000,
        cardFines: 2500,
        bettingFees: 4800,
        subscriptions: 1999,
        vendorAds: 600,
        digitalIDs: 1,
      },
      // All time
      allTime: {
        total: 156750, // $1,567.50
      },
      // Metrics
      metrics: {
        totalTeams: teams?.length || 12,
        activeSubscribers: 2,
        totalBetsPlaced: 127,
        avgBetSize: 1250, // $12.50
        totalPoolVolume: 158750, // $1,587.50
        platformFeeRate: 10, // 10%
        cardFinesIssued: 23,
        avgCardFine: 2500, // $25
      },
      // Top paying teams
      topTeams: [
        { name: "Baltimore Veteran FC", amount: 25000 },
        { name: "Spartan FC", amount: 18000 },
        { name: "Elite FC", amount: 15500 },
        { name: "Lanham United", amount: 12000 },
        { name: "Balisao FC", amount: 9500 },
      ],
    };
  }, [teams]);

  const formatMoney = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const percentChange = calculatePercentChange(
    revenueData.thisMonth.total,
    revenueData.lastMonth.total
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#061A2B" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
    >
      {/* Header */}
      <View>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 12 }}
        >
          <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900" }}>
          📊 Revenue Dashboard
        </Text>
        <Text style={{ color: "#9FB3C8", marginTop: 4 }}>
          Complete analytics across all revenue streams
        </Text>
      </View>

      {/* Total Revenue - All Time */}
      <View
        style={{
          backgroundColor: "#0A2238",
          borderRadius: 14,
          padding: 20,
          borderWidth: 2,
          borderColor: "#F2D100",
        }}
      >
        <Text style={{ color: "#9FB3C8", fontSize: 14 }}>Total Revenue (All Time)</Text>
        <Text style={{ color: "#F2D100", fontSize: 36, fontWeight: "900", marginTop: 4 }}>
          {formatMoney(revenueData.allTime.total)}
        </Text>
        <Text style={{ color: "#22C6D2", fontSize: 12, marginTop: 4, fontWeight: "900" }}>
          Across 7 revenue streams
        </Text>
      </View>

      {/* This Month vs Last Month */}
      <View
        style={{
          backgroundColor: "#0A2238",
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#EAF2FF", fontSize: 16, fontWeight: "900" }}>
          Monthly Comparison
        </Text>

        <View style={{ flexDirection: "row", marginTop: 16, gap: 12 }}>
          {/* This Month */}
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#9FB3C8", fontSize: 12 }}>This Month</Text>
            <Text style={{ color: "#EAF2FF", fontSize: 20, fontWeight: "900", marginTop: 4 }}>
              {formatMoney(revenueData.thisMonth.total)}
            </Text>
          </View>

          {/* Last Month */}
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Last Month</Text>
            <Text style={{ color: "#EAF2FF", fontSize: 20, fontWeight: "900", marginTop: 4 }}>
              {formatMoney(revenueData.lastMonth.total)}
            </Text>
          </View>
        </View>

        {/* Change Indicator */}
        <View
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Text
            style={{
              color: percentChange >= 0 ? "#34C759" : "#FF3B30",
              fontWeight: "900",
              fontSize: 14,
            }}
          >
            {percentChange >= 0 ? "↑" : "↓"} {Math.abs(percentChange).toFixed(1)}% vs last month
          </Text>
        </View>
      </View>

      {/* Revenue Breakdown by Stream */}
      <View
        style={{
          backgroundColor: "#0A2238",
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#EAF2FF", fontSize: 16, fontWeight: "900", marginBottom: 16 }}>
          Revenue by Stream (This Month)
        </Text>

        {[
          { label: "Tournament Registration", amount: revenueData.thisMonth.tournamentRegistration, color: "#F2D100" },
          { label: "Betting Pool Fees", amount: revenueData.thisMonth.bettingFees, color: "#22C6D2" },
          { label: "Subscriptions", amount: revenueData.thisMonth.subscriptions, color: "#34C759" },
          { label: "Vendor Ads", amount: revenueData.thisMonth.vendorAds, color: "#FF9500" },
          { label: "Card Fines", amount: revenueData.thisMonth.cardFines, color: "#FF3B30" },
          { label: "Digital IDs", amount: revenueData.thisMonth.digitalIDs, color: "#9FB3C8" },
        ].map((stream, idx) => {
          const percentage = (stream.amount / revenueData.thisMonth.total) * 100;
          return (
            <View key={idx} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{stream.label}</Text>
                <Text style={{ color: stream.color, fontWeight: "900" }}>
                  {formatMoney(stream.amount)} ({percentage.toFixed(0)}%)
                </Text>
              </View>
              {/* Progress Bar */}
              <View
                style={{
                  height: 8,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${percentage}%`,
                    backgroundColor: stream.color,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Top Paying Teams */}
      <View
        style={{
          backgroundColor: "#0A2238",
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#EAF2FF", fontSize: 16, fontWeight: "900", marginBottom: 12 }}>
          🏆 Top Paying Teams
        </Text>

        {revenueData.topTeams.map((team, idx) => (
          <View
            key={idx}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              borderBottomWidth: idx < revenueData.topTeams.length - 1 ? 1 : 0,
              borderBottomColor: "rgba(255,255,255,0.05)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: idx === 0 ? "#F2D100" : idx === 1 ? "#9FB3C8" : "#CD7F32",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 14 }}>
                  {idx + 1}
                </Text>
              </View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{team.name}</Text>
            </View>
            <Text style={{ color: "#34C759", fontWeight: "900" }}>
              {formatMoney(team.amount)}
            </Text>
          </View>
        ))}
      </View>

      {/* Key Metrics */}
      <View
        style={{
          backgroundColor: "#0A2238",
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#EAF2FF", fontSize: 16, fontWeight: "900", marginBottom: 16 }}>
          📈 Key Metrics
        </Text>

        <View style={{ gap: 12 }}>
          {[
            { label: "Total Teams", value: revenueData.metrics.totalTeams },
            { label: "Active Subscribers", value: revenueData.metrics.activeSubscribers },
            { label: "Total Bets Placed", value: revenueData.metrics.totalBetsPlaced },
            { label: "Avg Bet Size", value: formatMoney(revenueData.metrics.avgBetSize) },
            { label: "Total Pool Volume", value: formatMoney(revenueData.metrics.totalPoolVolume) },
            { label: "Platform Fee Rate", value: `${revenueData.metrics.platformFeeRate}%` },
            { label: "Card Fines Issued", value: revenueData.metrics.cardFinesIssued },
            { label: "Avg Card Fine", value: formatMoney(revenueData.metrics.avgCardFine) },
          ].map((metric, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: "#9FB3C8" }}>{metric.label}</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{metric.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Growth Opportunities */}
      <View
        style={{
          backgroundColor: "#0A2238",
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#F2D100", fontSize: 16, fontWeight: "900", marginBottom: 12 }}>
          💡 Growth Opportunities
        </Text>

        <Text style={{ color: "#9FB3C8", lineHeight: 20 }}>
          • Increase Pro subscriptions through promotional campaign{"\n"}
          • Onboard 3-5 new sponsors for Q1{"\n"}
          • Promote digital ID cards to reduce paper costs{"\n"}
          • Expand betting options to attract more wagers{"\n"}
          • Implement late payment fees on card fines
        </Text>
      </View>

      {/* Export Reports Button */}
      <TouchableOpacity
        style={{
          backgroundColor: "#22C6D2",
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>
          📥 Export Revenue Report
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}