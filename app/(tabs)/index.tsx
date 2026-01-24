import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource } from "../../src/utils/logos";
import { normalize, spacing } from "../../src/utils/responsive";

export default function HomeTab() {
  const router = useRouter();
  const { currentUser, activeLeagueId, leagues, tournaments, matches, teams, players } = useAppStore() as any;

  const activeLeague = useMemo(() => {
    return (leagues ?? []).find((l: any) => l.id === activeLeagueId);
  }, [leagues, activeLeagueId]);

  const latestTournament = useMemo(() => {
    const list = (tournaments ?? [])
      .filter((t: any) => t.leagueId === activeLeagueId)
      .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return list[0];
  }, [tournaments, activeLeagueId]);

  const liveMatches = useMemo(() => {
    return (matches ?? [])
      .filter((m: any) => m.leagueId === activeLeagueId && m.status === "LIVE")
      .slice(0, 3);
  }, [matches, activeLeagueId]);

  const topTeams = useMemo(() => {
    return (teams ?? [])
      .filter((t: any) => t.leagueId === activeLeagueId)
      .sort((a: any, b: any) => {
        const aPoints = (a.wins || 0) * 3 + (a.draws || 0);
        const bPoints = (b.wins || 0) * 3 + (b.draws || 0);
        return bPoints - aPoints;
      })
      .slice(0, 5);
  }, [teams, activeLeagueId]);

  const topScorers = useMemo(() => {
    return (players ?? [])
      .filter((p: any) => (p.goals || 0) > 0)
      .sort((a: any, b: any) => (b.goals || 0) - (a.goals || 0))
      .slice(0, 5);
  }, [players]);

  const vendorAds = [
    { id: "vendor_1", company: "SoccerPro Sports", tagline: "Official Equipment Partner", offer: "20% off all cleats this week!", color: "#34C759" },
    { id: "vendor_2", company: "Hydration Station", tagline: "Stay Hydrated, Play Better", offer: "Free water bottles for teams", color: "#22C6D2" },
    { id: "vendor_3", company: "Sports Physio Clinic", tagline: "Recovery & Performance", offer: "First session 50% off", color: "#F2D100" },
  ];

  const getTeamPoints = (team: any) => (team.wins || 0) * 3 + (team.draws || 0);

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: "#061A2B" }} 
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.huge }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xl }}>
        <View style={{ flex: 1, paddingRight: spacing.md }}>
          <Text style={{ color: "#F2D100", fontSize: normalize(28), fontWeight: "900" }}>NVT League</Text>
          <Text style={{ color: "#9FB3C8", marginTop: spacing.xs, fontSize: normalize(14) }}>
            {activeLeague?.name ?? "Veterans Football League"}
          </Text>
        </View>
        <View style={{ width: normalize(52), height: normalize(52), borderRadius: normalize(16), backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", alignItems: "center", justifyContent: "center" }}>
          <Image source={require("../../assets/logos/brand/nvt.png")} style={{ width: normalize(44), height: normalize(44), borderRadius: normalize(12) }} resizeMode="contain" />
        </View>
      </View>

      {(currentUser?.role === "LEAGUE_ADMIN" || currentUser?.role === "TOURNAMENT_ADMIN") && (
        <TouchableOpacity onPress={() => router.push('/admin')} style={{ backgroundColor: "#F2D100", padding: spacing.lg, borderRadius: normalize(16), marginBottom: spacing.xl, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.md, borderWidth: 2, borderColor: "#F2D100", elevation: 8 }}>
          <Text style={{ fontSize: normalize(28) }}>🎯</Text>
          <View>
            <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: normalize(18) }}>Admin Portal</Text>
            <Text style={{ color: "#061A2B", fontSize: normalize(12), marginTop: spacing.xs, opacity: 0.7 }}>Manage league, finances & more</Text>
          </View>
        </TouchableOpacity>
      )}

      {liveMatches.length > 0 && (
        <View style={{ marginBottom: spacing.xl }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md }}>
            <View style={{ width: normalize(8), height: normalize(8), borderRadius: normalize(4), backgroundColor: "#FF3B30" }} />
            <Text style={{ color: "#FF3B30", fontSize: normalize(18), fontWeight: "900" }}>LIVE NOW</Text>
            <Text style={{ color: "#9FB3C8", fontSize: normalize(14) }}>({liveMatches.length})</Text>
          </View>
          {liveMatches.map((match: any) => (
            <TouchableOpacity key={match.id} onPress={() => router.push(`/live/${match.id}`)} style={{ backgroundColor: "#0A2238", borderRadius: normalize(16), padding: spacing.lg, marginBottom: spacing.md, borderWidth: 2, borderColor: "#FF3B30" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(16), textAlign: "center" }}>{match.homeTeam || "Home"}</Text>
                  <Text style={{ color: "#F2D100", fontSize: normalize(32), fontWeight: "900", marginTop: spacing.sm }}>{match.homeScore || 0}</Text>
                </View>
                <View style={{ alignItems: "center", paddingHorizontal: spacing.lg }}>
                  <Text style={{ color: "#9FB3C8", fontSize: normalize(12), fontWeight: "900" }}>{match.minute ? `${match.minute}'` : "LIVE"}</Text>
                  <Text style={{ color: "#FF3B30", fontSize: normalize(10), marginTop: spacing.xs }}>● LIVE</Text>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(16), textAlign: "center" }}>{match.awayTeam || "Away"}</Text>
                  <Text style={{ color: "#F2D100", fontSize: normalize(32), fontWeight: "900", marginTop: spacing.sm }}>{match.awayScore || 0}</Text>
                </View>
              </View>
              <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" }}>
                <Text style={{ color: "#9FB3C8", fontSize: normalize(12), textAlign: "center" }}>{match.field || "Field TBD"} • Tap to watch live</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ marginBottom: spacing.xl }}>
        <Text style={{ color: "#F2D100", fontSize: normalize(20), fontWeight: "900", marginBottom: spacing.md }}>🏆 Leaderboards</Text>
        <View style={{ backgroundColor: "#0A2238", borderRadius: normalize(16), padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <Text style={{ color: "#EAF2FF", fontSize: normalize(16), fontWeight: "900", marginBottom: spacing.md }}>Top Teams</Text>
          {topTeams.length > 0 ? topTeams.map((team: any, index: number) => (
            <View key={team.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: normalize(10), borderBottomWidth: index < topTeams.length - 1 ? 1 : 0, borderBottomColor: "rgba(255,255,255,0.05)" }}>
              <View style={{ width: normalize(28), height: normalize(28), borderRadius: normalize(14), backgroundColor: index === 0 ? "#F2D100" : index === 1 ? "#9FB3C8" : index === 2 ? "#CD7F32" : "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginRight: spacing.md }}>
                <Text style={{ color: index < 3 ? "#061A2B" : "#9FB3C8", fontWeight: "900", fontSize: normalize(12) }}>{index + 1}</Text>
              </View>
              <Image source={getLogoSource(team.logoKey || "placeholder")} style={{ width: normalize(32), height: normalize(32), borderRadius: normalize(8), marginRight: spacing.md }} resizeMode="cover" />
              <Text style={{ color: "#EAF2FF", fontWeight: "900", flex: 1, fontSize: normalize(14) }}>{team.name}</Text>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <Text style={{ color: "#34C759", fontWeight: "900", fontSize: normalize(12) }}>{getTeamPoints(team)} pts</Text>
                <Text style={{ color: "#9FB3C8", fontSize: normalize(12) }}>{team.wins || 0}W-{team.draws || 0}D-{team.losses || 0}L</Text>
              </View>
            </View>
          )) : <Text style={{ color: "#9FB3C8", textAlign: "center", paddingVertical: spacing.xl }}>No teams yet</Text>}
          <TouchableOpacity onPress={() => router.push('/(tabs)/teams')} style={{ marginTop: spacing.md, backgroundColor: "rgba(242,209,0,0.1)", padding: normalize(10), borderRadius: normalize(12), alignItems: "center" }}>
            <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: normalize(14) }}>View All Teams →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: "#0A2238", borderRadius: normalize(16), padding: spacing.lg, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <Text style={{ color: "#EAF2FF", fontSize: normalize(16), fontWeight: "900", marginBottom: spacing.md }}>Top Scorers</Text>
          {topScorers.length > 0 ? topScorers.map((player: any, index: number) => (
            <View key={player.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: normalize(10), borderBottomWidth: index < topScorers.length - 1 ? 1 : 0, borderBottomColor: "rgba(255,255,255,0.05)" }}>
              <View style={{ width: normalize(28), height: normalize(28), borderRadius: normalize(14), backgroundColor: index === 0 ? "#F2D100" : index === 1 ? "#9FB3C8" : index === 2 ? "#CD7F32" : "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginRight: spacing.md }}>
                <Text style={{ color: index < 3 ? "#061A2B" : "#9FB3C8", fontWeight: "900", fontSize: normalize(12) }}>{index + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(14) }}>{player.fullName || player.name}</Text>
                <Text style={{ color: "#9FB3C8", fontSize: normalize(11), marginTop: spacing.xs }}>{teams?.find((t: any) => t.id === player.teamId)?.name || "Unknown Team"}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                <Text style={{ fontSize: normalize(16) }}>⚽</Text>
                <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: normalize(16) }}>{player.goals || 0}</Text>
              </View>
            </View>
          )) : <Text style={{ color: "#9FB3C8", textAlign: "center", paddingVertical: spacing.xl }}>No scorers yet</Text>}
        </View>
      </View>

      {latestTournament && (
        <View style={{ backgroundColor: "#0A2238", borderRadius: normalize(16), padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <Text style={{ color: "#F2D100", fontSize: normalize(16), fontWeight: "900", marginBottom: spacing.sm }}>Current Tournament</Text>
          <Text style={{ color: "#EAF2FF", fontSize: normalize(18), fontWeight: "900" }}>{latestTournament.name}</Text>
          <Text style={{ color: "#9FB3C8", marginTop: spacing.xs }}>{latestTournament.ageBand ? `Age ${latestTournament.ageBand}` : "Open Age"}</Text>
          <TouchableOpacity onPress={() => router.push(`/tournaments/${latestTournament.id}`)} style={{ marginTop: spacing.md, backgroundColor: "#F2D100", padding: spacing.md, borderRadius: normalize(12), alignItems: "center" }}>
            <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: normalize(14) }}>View Tournament →</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ marginBottom: spacing.xl }}>
        <Text style={{ color: "#9FB3C8", fontSize: normalize(12), fontWeight: "900", marginBottom: spacing.md, textAlign: "center" }}>SPONSORED BY</Text>
        {vendorAds.map((vendor: any) => (
          <View key={vendor.id} style={{ backgroundColor: "#0A2238", borderRadius: normalize(16), padding: spacing.lg, marginBottom: spacing.md, borderWidth: 2, borderColor: vendor.color }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <View style={{ width: normalize(50), height: normalize(50), borderRadius: normalize(12), backgroundColor: vendor.color, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: normalize(24) }}>🏪</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(15) }}>{vendor.company}</Text>
                <Text style={{ color: "#9FB3C8", fontSize: normalize(11), marginTop: spacing.xs }}>{vendor.tagline}</Text>
              </View>
            </View>
            <View style={{ marginTop: spacing.md, backgroundColor: `${vendor.color}20`, padding: normalize(10), borderRadius: normalize(10), borderWidth: 1, borderColor: vendor.color }}>
              <Text style={{ color: vendor.color, fontWeight: "900", fontSize: normalize(13), textAlign: "center" }}>🎁 {vendor.offer}</Text>
            </View>
            <Text style={{ color: "#9FB3C8", fontSize: normalize(10), marginTop: spacing.sm, textAlign: "center" }}>Tap to learn more</Text>
          </View>
        ))}
      </View>

      <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
        <Text style={{ color: "#9FB3C8", fontSize: normalize(11) }}>NVT Veterans League • Est. 2020</Text>
      </View>
    </ScrollView>
  );
}