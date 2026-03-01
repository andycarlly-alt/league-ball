// app/(tabs)/live.tsx - PRODUCTION VERSION

import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource } from "../../src/utils/logos";
import { normalize, spacing } from "../../src/utils/responsive";

function scoreForMatch(matchId: string, events: any[], homeTeamId: string, awayTeamId: string) {
  const ev = (events ?? []).filter((e: any) => e.matchId === matchId);

  const homeGoals = ev.filter((e: any) => e.type === "GOAL" && e.teamId === homeTeamId).length;
  const awayGoals = ev.filter((e: any) => e.type === "GOAL" && e.teamId === awayTeamId).length;

  const homeY = ev.filter((e: any) => e.type === "YELLOW" && e.teamId === homeTeamId).length;
  const awayY = ev.filter((e: any) => e.type === "YELLOW" && e.teamId === awayTeamId).length;

  const homeR = ev.filter((e: any) => e.type === "RED" && e.teamId === homeTeamId).length;
  const awayR = ev.filter((e: any) => e.type === "RED" && e.teamId === awayTeamId).length;

  return { homeGoals, awayGoals, homeY, awayY, homeR, awayR };
}

export default function LiveTab() {
  const router = useRouter();
  const { matches, teams, matchEvents } = useAppStore();

  const liveMatches = useMemo(() => {
    const live = (matches ?? []).filter((m: any) => m.status === "LIVE" || m.isLive);
    return live.length ? live : (matches ?? []).slice(0, 8);
  }, [matches]);

  const teamById = useMemo(() => {
    const map: Record<string, any> = {};
    (teams ?? []).forEach((t: any) => (map[t.id] = t));
    return map;
  }, [teams]);

  const actualLiveMatches = useMemo(() => {
    return (matches ?? []).filter((m: any) => m.status === "LIVE" || m.isLive);
  }, [matches]);

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#0A2238",
        paddingTop: spacing.xl + 40,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.05)",
      }}>
        <Text style={{ color: "#F2D100", fontSize: normalize(24), fontWeight: "900" }}>
          Live Matches
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs }}>
          {actualLiveMatches.length > 0 && (
            <>
              <View style={{
                width: normalize(8),
                height: normalize(8),
                borderRadius: normalize(4),
                backgroundColor: "#34C759",
              }} />
              <Text style={{ color: "#34C759", fontSize: normalize(13), fontWeight: "900" }}>
                {actualLiveMatches.length} LIVE NOW
              </Text>
            </>
          )}
          {actualLiveMatches.length === 0 && (
            <Text style={{ color: "#9FB3C8", fontSize: normalize(13) }}>
              Real-time scores and match updates
            </Text>
          )}
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ 
          padding: spacing.lg, 
          paddingBottom: spacing.huge,
          gap: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        {liveMatches.length === 0 ? (
          <View style={{ 
            alignItems: "center", 
            justifyContent: "center", 
            paddingVertical: spacing.huge * 2,
          }}>
            <Text style={{ fontSize: normalize(48), marginBottom: spacing.lg }}>⚽</Text>
            <Text style={{ 
              color: "#EAF2FF", 
              fontSize: normalize(18), 
              fontWeight: "900",
              marginBottom: spacing.xs,
            }}>
              No Matches Scheduled
            </Text>
            <Text style={{ 
              color: "#9FB3C8", 
              fontSize: normalize(14),
              textAlign: "center",
              paddingHorizontal: spacing.xl,
            }}>
              Live matches will appear here when they start
            </Text>
          </View>
        ) : (
          liveMatches.map((m: any) => {
            const home = teamById[m.homeTeamId] ?? { name: m.homeTeamName ?? "Home", logoKey: "placeholder" };
            const away = teamById[m.awayTeamId] ?? { name: m.awayTeamName ?? "Away", logoKey: "placeholder" };
            const s = scoreForMatch(String(m.id), matchEvents ?? [], String(m.homeTeamId), String(m.awayTeamId));
            const isLive = m.status === "LIVE" || m.isLive;

            return (
              <TouchableOpacity 
                key={m.id} 
                onPress={() => router.push(`/live/${m.id}`)}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    backgroundColor: "#0A2238",
                    borderRadius: normalize(16),
                    padding: spacing.md,
                    borderWidth: 2,
                    borderColor: isLive ? "#34C759" : "rgba(255,255,255,0.08)",
                    shadowColor: isLive ? "#34C759" : "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isLive ? 0.3 : 0.1,
                    shadowRadius: 8,
                    elevation: isLive ? 8 : 2,
                  }}
                >
                  {/* LIVE Badge */}
                  {isLive && (
                    <View style={{ 
                      position: "absolute", 
                      top: spacing.sm, 
                      right: spacing.sm,
                      backgroundColor: "#34C759",
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 4,
                      borderRadius: normalize(6),
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}>
                      <View style={{
                        width: normalize(6),
                        height: normalize(6),
                        borderRadius: normalize(3),
                        backgroundColor: "#061A2B",
                      }} />
                      <Text style={{ color: "#061A2B", fontSize: normalize(10), fontWeight: "900" }}>
                        LIVE
                      </Text>
                    </View>
                  )}

                  {/* Match Content */}
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {/* Home Team */}
                    <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                      <Image
                        source={getLogoSource(home.logoKey)}
                        style={{ 
                          width: normalize(44), 
                          height: normalize(44), 
                          borderRadius: normalize(12),
                          marginRight: spacing.sm,
                        }}
                        resizeMode="cover"
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          color: "#EAF2FF", 
                          fontWeight: "900",
                          fontSize: normalize(14),
                        }} numberOfLines={1}>
                          {home.name}
                        </Text>
                        {(s.homeY > 0 || s.homeR > 0) && (
                          <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
                            {s.homeY > 0 && (
                              <View style={{ 
                                backgroundColor: "rgba(242,209,0,0.2)",
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 4,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 2,
                              }}>
                                <Text style={{ fontSize: normalize(10) }}>🟨</Text>
                                <Text style={{ color: "#F2D100", fontSize: normalize(10), fontWeight: "900" }}>
                                  {s.homeY}
                                </Text>
                              </View>
                            )}
                            {s.homeR > 0 && (
                              <View style={{ 
                                backgroundColor: "rgba(255,59,48,0.2)",
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 4,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 2,
                              }}>
                                <Text style={{ fontSize: normalize(10) }}>🟥</Text>
                                <Text style={{ color: "#FF3B30", fontSize: normalize(10), fontWeight: "900" }}>
                                  {s.homeR}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Score */}
                    <View style={{ 
                      alignItems: "center", 
                      justifyContent: "center", 
                      paddingHorizontal: spacing.md,
                      minWidth: normalize(80),
                    }}>
                      <Text style={{ 
                        color: "#F2D100", 
                        fontSize: normalize(24), 
                        fontWeight: "900",
                        letterSpacing: 2,
                      }}>
                        {s.homeGoals} - {s.awayGoals}
                      </Text>
                      <Text style={{ 
                        color: isLive ? "#34C759" : "#22C6D2", 
                        fontSize: normalize(11), 
                        fontWeight: "900",
                        marginTop: 2,
                      }}>
                        {isLive ? "LIVE" : (m.status ?? "MATCH")}
                      </Text>
                    </View>

                    {/* Away Team */}
                    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                      <View style={{ flex: 1, alignItems: "flex-end", marginRight: spacing.sm }}>
                        <Text style={{ 
                          color: "#EAF2FF", 
                          fontWeight: "900",
                          fontSize: normalize(14),
                          textAlign: "right",
                        }} numberOfLines={1}>
                          {away.name}
                        </Text>
                        {(s.awayY > 0 || s.awayR > 0) && (
                          <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
                            {s.awayY > 0 && (
                              <View style={{ 
                                backgroundColor: "rgba(242,209,0,0.2)",
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 4,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 2,
                              }}>
                                <Text style={{ fontSize: normalize(10) }}>🟨</Text>
                                <Text style={{ color: "#F2D100", fontSize: normalize(10), fontWeight: "900" }}>
                                  {s.awayY}
                                </Text>
                              </View>
                            )}
                            {s.awayR > 0 && (
                              <View style={{ 
                                backgroundColor: "rgba(255,59,48,0.2)",
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 4,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 2,
                              }}>
                                <Text style={{ fontSize: normalize(10) }}>🟥</Text>
                                <Text style={{ color: "#FF3B30", fontSize: normalize(10), fontWeight: "900" }}>
                                  {s.awayR}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                      <Image
                        source={getLogoSource(away.logoKey)}
                        style={{ 
                          width: normalize(44), 
                          height: normalize(44), 
                          borderRadius: normalize(12),
                        }}
                        resizeMode="cover"
                      />
                    </View>
                  </View>

                  {/* Match Info Footer */}
                  <View style={{ 
                    marginTop: spacing.sm, 
                    paddingTop: spacing.sm, 
                    borderTopWidth: 1, 
                    borderTopColor: "rgba(255,255,255,0.05)",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <Text style={{ color: "#9FB3C8", fontSize: normalize(11) }}>
                      {m.venue || m.field || "Venue TBD"}
                    </Text>
                    <View style={{
                      backgroundColor: isLive ? "rgba(52,199,89,0.15)" : "rgba(34,198,210,0.15)",
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}>
                      <Text style={{ 
                        color: isLive ? "#34C759" : "#22C6D2", 
                        fontSize: normalize(10), 
                        fontWeight: "900",
                      }}>
                        TAP TO VIEW →
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}