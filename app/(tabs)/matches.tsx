import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource } from "../../src/utils/logos";

function fmtClock(sec: number) {
  const s = Math.max(0, Math.floor(sec || 0));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  const mmStr = String(mm).padStart(2, "0");
  const ssStr = String(ss).padStart(2, "0");
  return `${mmStr}:${ssStr}`;
}

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

export default function MatchesTab() {
  const router = useRouter();
  const { activeLeagueId, tournaments, teams, matches, matchEvents, createMatch } = useAppStore() as any;

  const leagueTournaments = useMemo(() => {
    return (tournaments ?? [])
      .filter((t: any) => t.leagueId === activeLeagueId)
      .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [tournaments, activeLeagueId]);

  const leagueTeams = useMemo(() => {
    return (teams ?? []).filter((t: any) => t.leagueId === activeLeagueId);
  }, [teams, activeLeagueId]);

  const leagueMatches = useMemo(() => {
    return (matches ?? [])
      .filter((m: any) => m.leagueId === activeLeagueId)
      .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [matches, activeLeagueId]);

  const byTournament = useMemo(() => {
    const map: Record<string, any[]> = {};
    leagueMatches.forEach((m: any) => {
      const tid = m.tournamentId || "unknown";
      if (!map[tid]) map[tid] = [];
      map[tid].push(m);
    });
    return map;
  }, [leagueMatches]);

  const tournamentName = (tid: string) =>
    (leagueTournaments ?? []).find((t: any) => t.id === tid)?.name ?? "Tournament";

  const teamById = (id: string) => (leagueTeams ?? []).find((t: any) => t.id === id);

  const createQuickMatch = () => {
    // Minimal "quick create" so it works now without a full form screen.
    // Picks the newest tournament in this league + first two teams in that tournament (or league).
    const tourn = (leagueTournaments ?? [])[0];

    const teamsInTournament = tourn?.id
      ? (leagueTeams ?? []).filter((t: any) => t.tournamentId === tourn.id)
      : [];

    const pool = teamsInTournament.length >= 2 ? teamsInTournament : leagueTeams;

    if (!tourn) {
      Alert.alert("No tournament yet", "Create a tournament first in the Tournaments tab.");
      return;
    }
    if (!pool || pool.length < 2) {
      Alert.alert("Not enough teams", "Add at least 2 teams before creating a match.");
      return;
    }

    const home = pool[0];
    const away = pool[1];

    const id = createMatch({
      leagueId: activeLeagueId,
      tournamentId: tourn.id,
      homeTeamId: home.id,
      awayTeamId: away.id,
      durationSec: 50 * 60,
      isLive: false,
      clockSec: 0,
    });

    if (id) {
      router.push(`/live/${id}`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Matches</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
            View live scores + tap a match to open Live screen.
          </Text>
        </View>

        <TouchableOpacity
          onPress={createQuickMatch}
          style={{
            backgroundColor: "#F2D100",
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#061A2B", fontWeight: "900" }}>+ Match</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ marginTop: 14 }} contentContainerStyle={{ paddingBottom: 30, gap: 14 }}>
        {/* If no matches */}
        {!leagueMatches.length ? (
          <View
            style={{
              backgroundColor: "#0A2238",
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>No matches yet</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 8 }}>
              Tap “+ Match” to create one quickly, then you can start it from the Live screen.
            </Text>
          </View>
        ) : null}

        {/* Groups by tournament */}
        {Object.keys(byTournament)
          .sort((a, b) => {
            // keep known tournaments first by createdAt
            const ta = (leagueTournaments ?? []).find((t: any) => t.id === a)?.createdAt ?? 0;
            const tb = (leagueTournaments ?? []).find((t: any) => t.id === b)?.createdAt ?? 0;
            return tb - ta;
          })
          .map((tid) => {
            const list = byTournament[tid] ?? [];
            if (!list.length) return null;

            return (
              <View key={tid} style={{ gap: 10 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                  {tournamentName(tid)}
                </Text>

                {list.map((m: any) => {
                  const home = teamById(m.homeTeamId);
                  const away = teamById(m.awayTeamId);

                  const score = scoreForMatch(m.id, matchEvents ?? [], m.homeTeamId, m.awayTeamId);

                  const liveLabel = m.isLive ? "LIVE" : m.clockSec >= m.durationSec ? "FT" : "Not started";
                  const clock = m.isLive ? fmtClock(m.clockSec ?? 0) : m.clockSec >= m.durationSec ? "FT" : "—";

                  return (
                    <TouchableOpacity key={m.id} onPress={() => router.push(`/live/${m.id}`)}>
                      <View
                        style={{
                          backgroundColor: "#0A2238",
                          borderRadius: 16,
                          padding: 14,
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.08)",
                        }}
                      >
                        {/* Top row: status */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <View
                            style={{
                              backgroundColor: m.isLive ? "rgba(255,59,48,0.22)" : "rgba(159,179,200,0.18)",
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 999,
                              borderWidth: 1,
                              borderColor: "rgba(255,255,255,0.10)",
                            }}
                          >
                            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 12 }}>
                              {liveLabel}
                            </Text>
                          </View>

                          <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>{clock}</Text>
                        </View>

                        {/* Teams row */}
                        <View style={{ marginTop: 12, gap: 10 }}>
                          <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Image
                              source={getLogoSource(home?.logoKey)}
                              style={{ width: 34, height: 34, borderRadius: 12 }}
                            />
                            <Text style={{ color: "#EAF2FF", fontWeight: "900", marginLeft: 10, flex: 1 }}>
                              {home?.name ?? "Home Team"}
                            </Text>
                            <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18 }}>
                              {score.home}
                            </Text>
                          </View>

                          <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Image
                              source={getLogoSource(away?.logoKey)}
                              style={{ width: 34, height: 34, borderRadius: 12 }}
                            />
                            <Text style={{ color: "#EAF2FF", fontWeight: "900", marginLeft: 10, flex: 1 }}>
                              {away?.name ?? "Away Team"}
                            </Text>
                            <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18 }}>
                              {score.away}
                            </Text>
                          </View>
                        </View>

                        <Text style={{ color: "#22C6D2", marginTop: 12, fontWeight: "900" }}>
                          Tap to open Live →
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
}
