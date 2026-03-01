// app/(tabs)/index.tsx - OPTIMIZED VERSION

import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import HomeSlideshowCarousel from "../../components/HomeSlideshowCarousel";
import { useAppStore } from "../../src/state/AppStore";
import { normalize, spacing } from "../../src/utils/responsive";

// ✅ Calculate scores from goal events
function scoreForMatch(matchId: string, events: any[], homeTeamId: string, awayTeamId: string) {
  const list = (events ?? []).filter((e: any) => e.matchId === matchId && e.type === "GOAL");
  let home = 0;
  let away = 0;
  list.forEach((e: any) => {
    if (e.teamId === homeTeamId) home += 1;
    if (e.teamId === awayTeamId) away += 1;
  });
  return { home, away };
}

export default function HomeTab() {
  const router = useRouter();
  
  // 🔥 Make sure matchEvents is included
  const { 
    currentUser, 
    activeLeagueId, 
    leagues, 
    tournaments, 
    matches, 
    teams, 
    players, 
    can, 
    matchEvents // ✅ This is correct!
  } = useAppStore() as any;
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const activeLeague = useMemo(() => {
    return (leagues ?? []).find((l: any) => l.id === activeLeagueId);
  }, [leagues, activeLeagueId]);

  // 🔥 OPTIMIZED: Calculate live matches with scores in one pass
  const liveMatchesWithScores = useMemo(() => {
    return (matches ?? [])
      .filter((m: any) => m.leagueId === activeLeagueId && (m.status === "LIVE" || m.isLive))
      .slice(0, 3)
      .map((match: any) => ({
        ...match,
        score: scoreForMatch(match.id, matchEvents || [], match.homeTeamId, match.awayTeamId),
        minute: match.clockSec ? Math.floor(match.clockSec / 60) : 0,
      }));
  }, [matches, activeLeagueId, matchEvents]); // ✅ matchEvents as dependency

  const upcomingMatches = useMemo(() => {
    return (matches ?? [])
      .filter((m: any) => m.leagueId === activeLeagueId && m.status === "SCHEDULED")
      .sort((a: any, b: any) => {
        const dateA = new Date(a.kickoffAt || 0).getTime();
        const dateB = new Date(b.kickoffAt || 0).getTime();
        return dateA - dateB;
      });
  }, [matches, activeLeagueId]);

  const leagueTeams = useMemo(() => {
    return (teams ?? []).filter((t: any) => t.leagueId === activeLeagueId);
  }, [teams, activeLeagueId]);

  const leaguePlayers = useMemo(() => {
    return (players ?? []).filter((p: any) => {
      const team = leagueTeams.find((t: any) => t.id === p.teamId);
      return !!team;
    });
  }, [players, leagueTeams]);

  // Active tournament info
  const activeTournament = useMemo(() => {
    return tournaments?.[0]; // Get first tournament for demo
  }, [tournaments]);

  const announcements = [
    {
      id: 'ann_1',
      title: 'NVT VETERANS LEAGUE',
      message: 'Spring Season 2026 is now underway! Check standings and upcoming matches.',
      urgent: false,
      actionText: 'View Schedule',
    },
  ];

  const featuredSponsors = [
    {
      id: 'sponsor_1',
      company: 'ATEM Foundation',
      tagline: 'Supporting Our Veterans',
      offer: 'Proud Sponsor of NVT Veterans League',
      color: '#34C759',
      tier: 'PLATINUM',
      featured: true,
    },
    {
      id: 'sponsor_2',
      company: 'AFOSMA Foundation',
      tagline: 'Building Stronger Communities',
      offer: 'Official Community Partner',
      color: '#22C6D2',
      tier: 'PLATINUM',
      featured: true,
    },
    {
      id: 'sponsor_3',
      company: 'JB Atlantic',
      tagline: 'Excellence in Service',
      offer: '15% Discount for League Members',
      color: '#F2D100',
      tier: 'GOLD',
      featured: true,
    },
    {
      id: 'sponsor_4',
      company: 'BSF Bereavement',
      tagline: 'Compassionate Support Services',
      offer: 'Free Consultation for Veterans',
      color: '#9B59B6',
      tier: 'GOLD',
      featured: true,
    },
  ];

  const additionalSponsors = [
    { id: "vendor_1", company: "Veterans Auto Repair", tagline: "10% off for league members", color: "#34C759" },
    { id: "vendor_2", company: "Cornerstone Cafe", tagline: "Team meal discounts available", color: "#FF3B30" },
    { id: "vendor_3", company: "Fitness First Gym", tagline: "Free month trial for players", color: "#22C6D2" },
  ];

  const handleSlidePress = (slide: any) => {
    switch (slide.type) {
      case 'leaderboard':
        router.push('/(tabs)/teams');
        break;
      case 'scorers':
        router.push('/(tabs)/teams');
        break;
      case 'announcement':
        console.log('Announcement pressed:', slide.data);
        break;
      case 'sponsor':
        console.log('Sponsor pressed:', slide.data);
        break;
      case 'match':
        router.push(`/matches/${slide.data.id}`);
        break;
    }
  };

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: "#061A2B", 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <ActivityIndicator size="large" color="#F2D100" />
        <Text style={{ 
          color: "#9FB3C8", 
          marginTop: spacing.lg, 
          fontSize: normalize(14) 
        }}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: "#061A2B" }} 
      contentContainerStyle={{ paddingBottom: spacing.huge }}
      showsVerticalScrollIndicator={false}
    >
      {/* ✅ HEADER WITH NVT LOGO */}
      <View style={{ 
        backgroundColor: "#0A2238",
        paddingTop: spacing.xl + 40,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
          {/* NVT Logo */}
          <View style={{
            width: normalize(55),
            height: normalize(55),
            borderRadius: normalize(28),
            backgroundColor: "#F2D100",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#F2D100",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <Text style={{ fontSize: normalize(28), fontWeight: "900" }}>⚽</Text>
          </View>

          {/* Title */}
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#F2D100", fontSize: normalize(26), fontWeight: "900" }}>
              NVT League
            </Text>
            <Text style={{ color: "#9FB3C8", marginTop: 2, fontSize: normalize(12) }}>
              {activeLeague?.name ?? "Veterans Football League"}
            </Text>
          </View>
        </View>
      </View>

      {/* ✅ COMPACT ACTION BUTTONS */}
      {(can("VIEW_ADMIN") || can("MANAGE_MATCH")) && (
        <View style={{ 
          paddingHorizontal: spacing.lg,
          marginBottom: spacing.lg,
          flexDirection: "row", 
          gap: spacing.sm 
        }}>
          {can("VIEW_ADMIN") && (
            <TouchableOpacity 
              onPress={() => router.push('/admin')} 
              style={{ 
                flex: 1,
                backgroundColor: "#F2D100",
                paddingVertical: normalize(10),
                borderRadius: normalize(10),
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: spacing.xs,
              }}
            >
              <Text style={{ fontSize: normalize(16) }}>🎯</Text>
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: normalize(12) }}>
                Admin
              </Text>
            </TouchableOpacity>
          )}

          {can("MANAGE_MATCH") && (
            <TouchableOpacity 
              onPress={() => router.push('/referee/select-match')} 
              style={{ 
                flex: 1,
                backgroundColor: "#34C759",
                paddingVertical: normalize(10),
                borderRadius: normalize(10),
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: spacing.xs,
              }}
            >
              <Text style={{ fontSize: normalize(16) }}>📸</Text>
              <Text style={{ color: "#FFF", fontWeight: "900", fontSize: normalize(12) }}>
                Check-In
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ✅ CENTERED SLIDESHOW */}
      <View style={{ marginBottom: spacing.lg }}>
        <HomeSlideshowCarousel
          teams={leagueTeams}
          players={leaguePlayers}
          announcements={announcements}
          sponsors={featuredSponsors}
          upcomingMatch={upcomingMatches[0]}
          onSlidePress={handleSlidePress}
        />
      </View>

      {/* 🔥 LIVE MATCHES - OPTIMIZED WITH PRE-CALCULATED SCORES */}
      {liveMatchesWithScores.length > 0 && (
        <View style={{ marginBottom: spacing.lg, paddingHorizontal: spacing.lg }}>
          <View style={{ 
            flexDirection: "row", 
            alignItems: "center", 
            gap: spacing.sm, 
            marginBottom: spacing.sm 
          }}>
            <View style={{ 
              width: normalize(8), 
              height: normalize(8), 
              borderRadius: normalize(4), 
              backgroundColor: "#FF3B30" 
            }} />
            <Text style={{ color: "#FF3B30", fontSize: normalize(16), fontWeight: "900" }}>
              LIVE NOW
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: normalize(13) }}>
              ({liveMatchesWithScores.length})
            </Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.md }}
          >
            {liveMatchesWithScores.map((match: any) => {
              const homeTeam = teams?.find((t: any) => t.id === match.homeTeamId);
              const awayTeam = teams?.find((t: any) => t.id === match.awayTeamId);
              
              return (
                <TouchableOpacity 
                  key={match.id} 
                  onPress={() => router.push(`/live/${match.id}`)}
                  activeOpacity={0.7}
                  style={{ 
                    backgroundColor: "#0A2238", 
                    borderRadius: normalize(12), 
                    padding: spacing.md, 
                    borderWidth: 2, 
                    borderColor: "#FF3B30",
                    width: normalize(200),
                    shadowColor: "#FF3B30",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  {/* Live Indicator */}
                  <View style={{ alignItems: "center", marginBottom: spacing.sm }}>
                    <Text style={{ color: "#9FB3C8", fontSize: normalize(10), fontWeight: "900" }}>
                      {match.minute > 0 ? `${match.minute}'` : "LIVE"}
                    </Text>
                    <View style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 2,
                    }}>
                      <View style={{
                        width: normalize(6),
                        height: normalize(6),
                        borderRadius: normalize(3),
                        backgroundColor: "#FF3B30",
                      }} />
                      <Text style={{ color: "#FF3B30", fontSize: normalize(9), fontWeight: "900" }}>
                        LIVE
                      </Text>
                    </View>
                  </View>
                  
                  {/* Home Team */}
                  <View style={{ 
                    flexDirection: "row", 
                    alignItems: "center", 
                    justifyContent: "space-between", 
                    marginBottom: spacing.xs 
                  }}>
                    <Text style={{ 
                      color: "#EAF2FF", 
                      fontWeight: "900", 
                      fontSize: normalize(12), 
                      flex: 1 
                    }} numberOfLines={1}>
                      {homeTeam?.name || match.homeTeam || "Home"}
                    </Text>
                    <Text style={{ 
                      color: "#F2D100", 
                      fontSize: normalize(20), 
                      fontWeight: "900", 
                      marginHorizontal: spacing.xs 
                    }}>
                      {match.score.home}
                    </Text>
                  </View>
                  
                  {/* Away Team */}
                  <View style={{ 
                    flexDirection: "row", 
                    alignItems: "center", 
                    justifyContent: "space-between" 
                  }}>
                    <Text style={{ 
                      color: "#EAF2FF", 
                      fontWeight: "900", 
                      fontSize: normalize(12), 
                      flex: 1 
                    }} numberOfLines={1}>
                      {awayTeam?.name || match.awayTeam || "Away"}
                    </Text>
                    <Text style={{ 
                      color: "#F2D100", 
                      fontSize: normalize(20), 
                      fontWeight: "900", 
                      marginHorizontal: spacing.xs 
                    }}>
                      {match.score.away}
                    </Text>
                  </View>
                  
                  {/* Field Info */}
                  <View style={{ 
                    marginTop: spacing.sm, 
                    paddingTop: spacing.sm, 
                    borderTopWidth: 1, 
                    borderTopColor: "rgba(255,255,255,0.08)" 
                  }}>
                    <Text style={{ 
                      color: "#9FB3C8", 
                      fontSize: normalize(9), 
                      textAlign: "center" 
                    }} numberOfLines={1}>
                      {match.field || match.venue || "Field TBD"}
                    </Text>
                  </View>

                  {/* Tap to View Indicator */}
                  <View style={{ 
                    marginTop: spacing.xs,
                    backgroundColor: "rgba(255,59,48,0.15)",
                    paddingVertical: 4,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: "rgba(255,59,48,0.3)",
                  }}>
                    <Text style={{ 
                      color: "#FF3B30", 
                      fontSize: normalize(8), 
                      textAlign: "center",
                      fontWeight: "900",
                    }}>
                      TAP TO VIEW LIVE →
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Sponsors Section */}
      <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
        <Text style={{ 
          color: "#9FB3C8", 
          fontSize: normalize(12), 
          fontWeight: "900", 
          marginBottom: spacing.md, 
          textAlign: "center" 
        }}>
          OUR SPONSORS
        </Text>
        {additionalSponsors.map((vendor: any) => (
          <View 
            key={vendor.id} 
            style={{ 
              backgroundColor: "#0A2238", 
              borderRadius: normalize(16), 
              padding: spacing.lg, 
              marginBottom: spacing.md, 
              borderWidth: 1, 
              borderColor: "rgba(255,255,255,0.08)" 
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <View 
                style={{ 
                  width: normalize(50), 
                  height: normalize(50), 
                  borderRadius: normalize(12), 
                  backgroundColor: vendor.color, 
                  alignItems: "center", 
                  justifyContent: "center" 
                }}
              >
                <Text style={{ fontSize: normalize(24) }}>🏪</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(15) }}>
                  {vendor.company}
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: normalize(11), marginTop: spacing.xs }}>
                  {vendor.tagline}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* ✅ TOURNAMENT INFO SECTION */}
      {activeTournament && (
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
          <Text style={{ 
            color: "#F2D100", 
            fontSize: normalize(14), 
            fontWeight: "900", 
            marginBottom: spacing.md,
          }}>
            🏆 CURRENT TOURNAMENT
          </Text>
          
          <View style={{
            backgroundColor: "#0A2238",
            borderRadius: normalize(16),
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: "rgba(242,209,0,0.2)",
          }}>
            {/* Tournament Name */}
            <Text style={{ 
              color: "#EAF2FF", 
              fontSize: normalize(18), 
              fontWeight: "900",
              marginBottom: spacing.sm,
            }}>
              {activeTournament.name}
            </Text>

            {/* Tournament Details Grid */}
            <View style={{ gap: spacing.sm }}>
              {/* Location */}
              {activeTournament.location && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <Text style={{ fontSize: normalize(14) }}>📍</Text>
                  <Text style={{ color: "#9FB3C8", fontSize: normalize(12), flex: 1 }}>
                    {activeTournament.location}
                  </Text>
                </View>
              )}

              {/* Dates */}
              {activeTournament.startDate && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <Text style={{ fontSize: normalize(14) }}>📅</Text>
                  <Text style={{ color: "#9FB3C8", fontSize: normalize(12), flex: 1 }}>
                    {activeTournament.startDate} {activeTournament.endDate ? `- ${activeTournament.endDate}` : ''}
                  </Text>
                </View>
              )}

              {/* Age Group */}
              {activeTournament.ageRuleLabel && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <Text style={{ fontSize: normalize(14) }}>👥</Text>
                  <Text style={{ color: "#9FB3C8", fontSize: normalize(12), flex: 1 }}>
                    Age Group: {activeTournament.ageRuleLabel}
                  </Text>
                </View>
              )}

              {/* Teams */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Text style={{ fontSize: normalize(14) }}>⚽</Text>
                <Text style={{ color: "#9FB3C8", fontSize: normalize(12), flex: 1 }}>
                  {leagueTeams.length} Teams Registered
                </Text>
              </View>

              {/* Status */}
              <View style={{ 
                marginTop: spacing.sm,
                paddingTop: spacing.sm,
                borderTopWidth: 1,
                borderTopColor: "rgba(255,255,255,0.08)",
              }}>
                <View style={{ 
                  backgroundColor: "rgba(52,199,89,0.15)",
                  paddingVertical: spacing.xs,
                  paddingHorizontal: spacing.md,
                  borderRadius: normalize(8),
                  alignSelf: "flex-start",
                }}>
                  <Text style={{ color: "#34C759", fontSize: normalize(11), fontWeight: "900" }}>
                    ● {activeTournament.status || 'ACTIVE'}
                  </Text>
                </View>
              </View>
            </View>

            {/* View Tournament Button */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/tournaments')}
              style={{
                marginTop: spacing.md,
                backgroundColor: "#F2D100",
                paddingVertical: spacing.sm,
                borderRadius: normalize(10),
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: normalize(12) }}>
                View Full Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={{ alignItems: "center", paddingVertical: spacing.xl, paddingHorizontal: spacing.lg }}>
        <Text style={{ color: "#9FB3C8", fontSize: normalize(11) }}>
          NVT Veterans League • Est. 2020
        </Text>
      </View>
    </ScrollView>
  );
}