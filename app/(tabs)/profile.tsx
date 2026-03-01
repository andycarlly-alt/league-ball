// app/(tabs)/profile.tsx - COMPLETE UPDATED VERSION

import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { normalize, spacing } from "../../src/utils/responsive";

const ROLES = ["LEAGUE_ADMIN", "TOURNAMENT_ADMIN", "TEAM_REP", "REFEREE", "FAN"];

export default function ProfileTab() {
  const router = useRouter();
  const store: any = useAppStore();

  const {
    currentUser,
    setRole,
    leagues,
    activeLeagueId,
    setActiveLeague,
    teams,
    setTeamForRep,
    walletBalance,
    can,
  } = store;

  const activeLeague = (leagues ?? []).find((l: any) => l.id === activeLeagueId);
  const leagueTeams = (teams ?? []).filter((t: any) => t.leagueId === activeLeagueId);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          Alert.alert("Logged Out", "You have been logged out successfully");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {(currentUser?.name ?? "User").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{currentUser?.name ?? "User"}</Text>
            <Text style={styles.userRole}>{currentUser?.role ?? "FAN"}</Text>
            {activeLeague && (
              <Text style={styles.userLeague}>
                {activeLeague.name} • {activeLeague.plan}
              </Text>
            )}
          </View>
        </View>

        {/* 💰 WALLET BUTTON */}
        <TouchableOpacity onPress={() => router.push("/billing")} style={styles.walletButton}>
          <Text style={styles.walletIcon}>💰</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.walletLabel}>Wallet Balance</Text>
            <Text style={styles.walletBalance}>
              ${((walletBalance ?? 0) / 100).toFixed(2)}
            </Text>
          </View>
          <Text style={styles.walletArrow}>›</Text>
        </TouchableOpacity>

        {/* 🔐 ADMIN TOOLS - Only for LEAGUE_ADMIN */}
        {currentUser?.role === "LEAGUE_ADMIN" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔐 Admin Tools</Text>

            <TouchableOpacity
              onPress={() => router.push("/admin")}
              style={styles.adminButton}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.adminButtonTitle}>🎯 Admin Dashboard</Text>
                <Text style={styles.adminButtonText}>
                  Manage league, teams, matches & settings
                </Text>
              </View>
              <Text style={styles.adminButtonArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/admin/revenue")}
              style={styles.revenueButton}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.revenueButtonTitle}>📊 Revenue Dashboard</Text>
                <Text style={styles.revenueButtonText}>
                  View all revenue streams and analytics
                </Text>
                <Text style={styles.revenueAmount}>
                  $1,567.50 total revenue • 7 streams
                </Text>
              </View>
              <Text style={styles.revenueButtonArrow}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          {can("MANAGE_MATCH") && (
            <MenuButton
              icon="📸"
              label="Referee Check-In"
              onPress={() => router.push("/referee/select-match")}
            />
          )}

          <MenuButton
            icon="🏪"
            label="My Businesses"
            onPress={() => router.push("/community/my-businesses")}
          />

          <MenuButton
            icon="💬"
            label="Social Notifications"
            onPress={() => router.push("/social/notifications")}
          />

          <MenuButton
            icon="📊"
            label="My Stats"
            onPress={() => Alert.alert("Coming Soon", "Player stats coming soon!")}
          />
        </View>

        {/* Demo Controls */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>🧪 Demo Controls</Text>
          <Text style={styles.demoSubtitle}>
            (These will be removed in production with real auth)
          </Text>

          {/* Switch League */}
          <View style={styles.demoCard}>
            <Text style={styles.demoCardTitle}>Switch League</Text>
            <View style={styles.chipContainer}>
              {(leagues ?? []).map((l: any) => {
                const active = l.id === activeLeagueId;
                return (
                  <TouchableOpacity
                    key={l.id}
                    onPress={() => setActiveLeague(l.id)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {l.name} ({l.plan})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Switch Role */}
          <View style={styles.demoCard}>
            <Text style={styles.demoCardTitle}>Switch Role</Text>
            <View style={styles.chipContainer}>
              {ROLES.map((r) => {
                const active = r === currentUser?.role;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    style={[styles.chip, active && styles.chipActiveRole]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Team Selection for Team Rep */}
            {currentUser?.role === "TEAM_REP" && typeof setTeamForRep === "function" && (
              <View style={styles.teamSelection}>
                <Text style={styles.teamSelectionLabel}>Select Your Team:</Text>
                <View style={styles.chipContainer}>
                  {leagueTeams.map((t: any) => {
                    const active = t.id === currentUser?.teamId;
                    return (
                      <TouchableOpacity
                        key={t.id}
                        onPress={() => setTeamForRep(t.id)}
                        style={[styles.chip, active && styles.chipActiveTeam]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {t.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <MenuButton icon="🔔" label="Notifications" onPress={() => {}} />
          <MenuButton icon="🔒" label="Privacy & Security" onPress={() => {}} />
          <MenuButton icon="❓" label="Help & Support" onPress={() => {}} />
          <MenuButton
            icon="ℹ️"
            label="About NVT League"
            onPress={() => {
              Alert.alert(
                "NVT Veterans League",
                "Version 1.0.0\n\nPremier veterans football league management platform.",
                [{ text: "OK" }]
              );
            }}
          />
        </View>

        {/* Roadmap */}
        <View style={styles.roadmapCard}>
          <Text style={styles.roadmapTitle}>🚀 Coming Soon</Text>
          <Text style={styles.roadmapText}>
            • Real authentication & user accounts{"\n"}
            • League subscriptions via Stripe{"\n"}
            • Tournament signup workflow{"\n"}
            • Roster lock & age verification{"\n"}
            • Advanced player statistics{"\n"}
            • Video highlights & media library
          </Text>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>NVT Veterans League</Text>
          <Text style={styles.appInfoText}>Version 1.0.0 • Build 2026.02</Text>
          <Text style={styles.appInfoText}>Made with ⚽ for Veterans</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Menu Button Component
function MenuButton({ icon, label, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuButton}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061A2B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 40,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#1A3A52",
  },
  title: {
    color: "#F2D100",
    fontSize: normalize(28),
    fontWeight: "900",
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: normalize(14),
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },

  // User Card
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A2238",
    padding: spacing.lg,
    borderRadius: normalize(16),
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: spacing.md,
  },
  userAvatar: {
    width: normalize(64),
    height: normalize(64),
    borderRadius: normalize(32),
    backgroundColor: "#F2D100",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    color: "#061A2B",
    fontSize: normalize(28),
    fontWeight: "900",
  },
  userName: {
    color: "#EAF2FF",
    fontSize: normalize(20),
    fontWeight: "900",
    marginBottom: 2,
  },
  userRole: {
    color: "#22C6D2",
    fontSize: normalize(14),
    fontWeight: "700",
    marginBottom: 2,
  },
  userLeague: {
    color: "#9FB3C8",
    fontSize: normalize(12),
  },

  // Wallet Button
  walletButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A2238",
    padding: spacing.md,
    borderRadius: normalize(12),
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: "#22C6D2",
    shadowColor: "#22C6D2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  walletIcon: {
    fontSize: normalize(32),
    marginRight: spacing.sm,
  },
  walletLabel: {
    color: "#EAF2FF",
    fontSize: normalize(14),
    fontWeight: "700",
    marginBottom: 2,
  },
  walletBalance: {
    color: "#22C6D2",
    fontSize: normalize(24),
    fontWeight: "900",
  },
  walletArrow: {
    color: "#9FB3C8",
    fontSize: normalize(28),
  },

  // Admin Tools
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: "#F2D100",
    fontSize: normalize(16),
    fontWeight: "900",
    marginBottom: spacing.sm,
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A2238",
    padding: spacing.md,
    borderRadius: normalize(12),
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(242,209,0,0.3)",
  },
  adminButtonTitle: {
    color: "#F2D100",
    fontSize: normalize(15),
    fontWeight: "900",
    marginBottom: 4,
  },
  adminButtonText: {
    color: "#EAF2FF",
    fontSize: normalize(13),
  },
  adminButtonArrow: {
    color: "#F2D100",
    fontSize: normalize(24),
  },
  revenueButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(242,209,0,0.1)",
    padding: spacing.md,
    borderRadius: normalize(12),
    borderWidth: 2,
    borderColor: "#F2D100",
  },
  revenueButtonTitle: {
    color: "#F2D100",
    fontSize: normalize(15),
    fontWeight: "900",
    marginBottom: 4,
  },
  revenueButtonText: {
    color: "#EAF2FF",
    fontSize: normalize(13),
    marginBottom: 6,
  },
  revenueAmount: {
    color: "#22C6D2",
    fontSize: normalize(12),
    fontWeight: "900",
  },
  revenueButtonArrow: {
    color: "#F2D100",
    fontSize: normalize(24),
  },

  // Menu Buttons
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A2238",
    padding: spacing.md,
    borderRadius: normalize(12),
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  menuIcon: {
    fontSize: normalize(24),
    marginRight: spacing.sm,
    width: normalize(32),
  },
  menuLabel: {
    flex: 1,
    color: "#EAF2FF",
    fontSize: normalize(15),
    fontWeight: "700",
  },
  menuArrow: {
    color: "#9FB3C8",
    fontSize: normalize(24),
  },

  // Demo Section
  demoSection: {
    marginBottom: spacing.lg,
  },
  demoTitle: {
    color: "#FF3B30",
    fontSize: normalize(16),
    fontWeight: "900",
    marginBottom: 4,
  },
  demoSubtitle: {
    color: "#9FB3C8",
    fontSize: normalize(12),
    marginBottom: spacing.md,
  },
  demoCard: {
    backgroundColor: "#0B2842",
    borderRadius: normalize(14),
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,59,48,0.2)",
  },
  demoCardTitle: {
    color: "#F2D100",
    fontSize: normalize(14),
    fontWeight: "900",
    marginBottom: spacing.sm,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: "#0A2238",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  chipActive: {
    backgroundColor: "#F2D100",
    borderColor: "#F2D100",
  },
  chipActiveRole: {
    backgroundColor: "#22C6D2",
    borderColor: "#22C6D2",
  },
  chipActiveTeam: {
    backgroundColor: "#34C759",
    borderColor: "#34C759",
  },
  chipText: {
    color: "#EAF2FF",
    fontSize: normalize(12),
    fontWeight: "900",
  },
  chipTextActive: {
    color: "#061A2B",
  },
  teamSelection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  teamSelectionLabel: {
    color: "#9FB3C8",
    fontSize: normalize(13),
    marginBottom: spacing.sm,
  },

  // Roadmap
  roadmapCard: {
    backgroundColor: "#0A2238",
    borderRadius: normalize(14),
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  roadmapTitle: {
    color: "#F2D100",
    fontSize: normalize(15),
    fontWeight: "900",
    marginBottom: spacing.sm,
  },
  roadmapText: {
    color: "#9FB3C8",
    fontSize: normalize(13),
    lineHeight: normalize(20),
  },

  // App Info
  appInfo: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  appInfoText: {
    color: "#9FB3C8",
    fontSize: normalize(12),
    marginBottom: 4,
  },
});
