import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ageBannerStyle, calcAge, useAppStore } from "../../src/state/AppStore";

export default function TeamRosterScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const router = useRouter();
  const { teams, players, tournaments, toggleVerifyPlayer, can, activeLeague, currentUser } = useAppStore();

  const team = teams.find((t) => t.id === teamId);
  const tournament = tournaments.find((t) => t.id === team?.tournamentId);

  const [transferMode, setTransferMode] = useState(false);

  const roster = useMemo(
    () => players.filter((p) => p.teamId === teamId).sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [players, teamId]
  );

  const canAddPlayer = can("ADD_PLAYER", { teamId });
  const canVerify = can("VERIFY_PLAYER");
  const canTransfer = can("TRANSFER_PLAYER");
  const isPro = activeLeague?.plan === "Pro";

  const deny = (msg: string) => Alert.alert("Not allowed", msg);

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>{team?.name ?? "Team"}</Text>
      <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
        User: {currentUser.role}  League Plan: {activeLeague?.plan ?? ""}
      </Text>
      <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
        Tournament: {tournament?.name ?? ""}  Band: {tournament?.ageBand ?? ""}  Roster: {tournament?.rosterLocked ? "LOCKED" : "OPEN"}
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
        <TouchableOpacity
          onPress={() => (canAddPlayer ? router.push(`/teams/${teamId}/add-player`) : deny("Only Admins or this Team Rep can add players."))}
          style={{
            flex: 1,
            backgroundColor: "#F2D100",
            padding: 12,
            borderRadius: 12,
            alignItems: "center",
            opacity: canAddPlayer ? 1 : 0.5,
          }}
        >
          <Text style={{ fontWeight: "900", color: "#061A2B" }}>Add Player</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => (canTransfer ? setTransferMode((v) => !v) : deny("Transfers are Pro + Admin only."))}
          style={{
            backgroundColor: transferMode ? "#22C6D2" : "#0A2238",
            padding: 12,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            opacity: canTransfer ? 1 : 0.5,
          }}
        >
          <Text style={{ fontWeight: "900", color: transferMode ? "#061A2B" : "#EAF2FF" }}>
            {transferMode ? "Transfer: ON" : "Transfer"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instruction banner */}
      <View
        style={{
          marginTop: 12,
          backgroundColor: "rgba(34,198,210,0.15)",
          padding: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "rgba(34,198,210,0.3)",
        }}
      >
        <Text style={{ color: "#22C6D2", fontWeight: "900" }}>
          💡 Tap any player to view profile, upload photo, and manage verification
        </Text>
      </View>

      <ScrollView style={{ marginTop: 14 }} contentContainerStyle={{ gap: 12, paddingBottom: 30 }}>
        {roster.map((p) => {
          const age = calcAge(p.dob) ?? 0;
          const banner = ageBannerStyle(age);

          return (
            <TouchableOpacity
              key={p.id}
              onPress={() => router.push(`/players/${p.id}`)}
              activeOpacity={0.7}
            >
              <View
                style={{
                  backgroundColor: "#0A2238",
                  borderRadius: 14,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <View
                  style={{
                    backgroundColor: banner.bg,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: banner.fg, fontWeight: "900" }}>
                    {banner.label}  Age {age}
                  </Text>
                  <Text style={{ color: banner.fg, fontWeight: "900" }}>
                    {p.verified ? "✓ VERIFIED" : "UNVERIFIED"}
                  </Text>
                </View>

                <View style={{ padding: 14 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                      {p.fullName}
                    </Text>
                    <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 14 }}>
                      View Profile →
                    </Text>
                  </View>
                  
                  <Text style={{ color: "#9FB3C8", marginTop: 6 }}>DOB: {p.dob}</Text>
                  {p.verificationNote ? (
                    <Text style={{ color: "#22C6D2", marginTop: 6, fontWeight: "700" }}>
                      {p.verificationNote}
                    </Text>
                  ) : null}

                  <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        if (!canVerify) return deny("Only Admins can verify players.");
                        const res = toggleVerifyPlayer(p.id);
                        if (!res.ok) Alert.alert("Error", res.reason ?? "Unable to verify");
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: p.verified ? "#FF3B30" : "#34C759",
                        padding: 10,
                        borderRadius: 12,
                        alignItems: "center",
                        opacity: canVerify ? 1 : 0.5,
                      }}
                      disabled={!canVerify}
                    >
                      <Text style={{ fontWeight: "900", color: "#061A2B" }}>
                        {p.verified ? "Unverify" : "Verify"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        if (!transferMode) return;
                        if (!canTransfer) return deny("Transfers are Pro + Admin only.");
                        router.push(`/transfer/${p.id}`);
                      }}
                      style={{
                        backgroundColor: "#F2D100",
                        padding: 10,
                        borderRadius: 12,
                        alignItems: "center",
                        opacity: transferMode && canTransfer ? 1 : 0.4,
                      }}
                      disabled={!(transferMode && canTransfer)}
                    >
                      <Text style={{ fontWeight: "900", color: "#061A2B" }}>Transfer</Text>
                    </TouchableOpacity>
                  </View>

                  {!isPro ? (
                    <Text style={{ color: "#9FB3C8", marginTop: 10, fontSize: 12 }}>
                      Free plan: roster lock/transfers disabled until Pro
                    </Text>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {!roster.length ? (
          <View
            style={{
              backgroundColor: "#0A2238",
              borderRadius: 14,
              padding: 20,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
              No players yet
            </Text>
            <Text style={{ color: "#9FB3C8", marginTop: 8, textAlign: "center" }}>
              Tap "Add Player" to get started
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}