// app/(tabs)/matches.tsx
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource } from "../../src/utils/logos";

type Mode = "RESULTS" | "FIXTURES" | "STANDINGS";

function fmtClock(sec: number) {
  const s = Math.max(0, Math.floor(sec || 0));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
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

function isFinal(m: any) {
  if (m?.status === "FINAL") return true;
  if (m?.status === "LIVE") return false;
  return false;
}

function isScheduled(m: any) {
  return m?.status === "SCHEDULED";
}

export default function MatchesTab() {
  const router = useRouter();
  const { activeLeagueId, tournaments, teams, matches, loggedEvents, createMatch } = useAppStore() as any;

  const [mode, setMode] = useState<Mode>("RESULTS");

  const leagueTournaments = useMemo(() => {
    return (tournaments ?? [])
      .filter((t: any) => t.leagueId === activeLeagueId)
      .slice()
      .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [tournaments, activeLeagueId]);

  const [activeTournamentId, setActiveTournamentId] = useState<string>(() =>
    leagueTournaments?.[0]?.id ? String(leagueTournaments[0].id) : "all"
  );

  React.useEffect(() => {
    if (activeTournamentId === "all") return;
    const ok = (leagueTournaments ?? []).some((t: any) => String(t.id) === String(activeTournamentId));
    if (!ok) setActiveTournamentId(leagueTournaments?.[0]?.id ? String(leagueTournaments[0].id) : "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueTournaments?.length]);

  const leagueTeams = useMemo(() => {
    return (teams ?? []).filter((t: any) => t.leagueId === activeLeagueId);
  }, [teams, activeLeagueId]);

  const leagueMatches = useMemo(() => {
    return (matches ?? [])
      .filter((m: any) => m.leagueId === activeLeagueId)
      .slice()
      .sort((a: any, b: any) => (b.kickoffAt ?? 0) - (a.kickoffAt ?? 0));
  }, [matches, activeLeagueId]);

  const filteredMatches = useMemo(() => {
    if (activeTournamentId === "all") return leagueMatches;
    return leagueMatches.filter((m: any) => String(m.tournamentId) === String(activeTournamentId));
  }, [leagueMatches, activeTournamentId]);

  const byTournament = useMemo(() => {
    const map: Record<string, any[]> = {};
    filteredMatches.forEach((m: any) => {
      const tid = String(m.tournamentId || "unknown");
      if (!map[tid]) map[tid] = [];
      map[tid].push(m);
    });
    return map;
  }, [filteredMatches]);

  const tournamentName = (tid: string) =>
    (leagueTournaments ?? []).find((t: any) => String(t.id) === String(tid))?.name ?? "Tournament";

  const teamById = (id: string) => (leagueTeams ?? []).find((t: any) => String(t.id) === String(id));

  const createQuickMatch = () => {
    if (typeof createMatch !== "function") {
      Alert.alert("Create Match not ready", "createMatch() is missing in AppStore (it should be there now).");
      return;
    }

    const tourn =
      activeTournamentId !== "all"
        ? (leagueTournaments ?? []).find((t: any) => String(t.id) === String(activeTournamentId))
        : (leagueTournaments ?? [])[0];

    if (!tourn) {
      Alert.alert("No tournament yet", "Create a tournament first.");
      return;
    }

    const teamsInTournament = (leagueTeams ?? []).filter((t: any) => String(t.tournamentId) === String(tourn.id));
    const pool = teamsInTournament.length >= 2 ? teamsInTournament : leagueTeams;

    if (!pool || pool.length < 2) {
      Alert.alert("Not enough teams", "Add at least 2 teams first.");
      return;
    }

    const home = pool[0];
    const away = pool[1];

    const id = createMatch({
      leagueId: activeLeagueId,
      tournamentId: tourn.id,
      homeTeamId: home.id,
      awayTeamId: away.id,
      kickoffAt: Date.now(),
      status: "SCHEDULED",
    });

    if (id) router.push(`/live/${id}`);
  };

  const standingsRows = useMemo(() => {
    const tid =
      activeTournamentId === "all" ? String(leagueTournaments?.[0]?.id ?? "") : String(activeTournamentId);

    if (!tid) return [];

    const tTeams = (leagueTeams ?? []).filter((tm: any) => String(tm.tournamentId) === String(tid));
    const tMatches = (leagueMatches ?? []).filter((m: any) => String(m.tournamentId) === String(tid) && isFinal(m));

    const base: Record<string, any> = {};
    tTeams.forEach((tm: any) => {
      base[String(tm.id)] = { teamId: String(tm.id), name: tm.name ?? "Team", logoKey: tm.logoKey, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, PTS: 0 };
    });

    tMatches.forEach((m: any) => {
      const homeId = String(m.homeTeamId);
      const awayId = String(m.awayTeamId);

      if (!base[homeId]) {
        const tm = teamById(homeId);
        base[homeId] = { teamId: homeId, name: tm?.name ?? "Team", logoKey: tm?.logoKey, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, PTS: 0 };
      }
      if (!base[awayId]) {
        const tm = teamById(awayId);
        base[awayId] = { teamId: awayId, name: tm?.name ?? "Team", logoKey: tm?.logoKey, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, PTS: 0 };
      }

      const sc = scoreForMatch(m.id, loggedEvents ?? [], homeId, awayId);
      const home = base[homeId];
      const away = base[awayId];

      home.P += 1;
      away.P += 1;

      home.GF += sc.home;
      home.GA += sc.away;

      away.GF += sc.away;
      away.GA += sc.home;

      if (sc.home > sc.away) {
        home.W += 1;
        home.PTS += 3;
        away.L += 1;
      } else if (sc.home < sc.away) {
        away.W += 1;
        away.PTS += 3;
        home.L += 1;
      } else {
        home.D += 1;
        away.D += 1;
        home.PTS += 1;
        away.PTS += 1;
      }
    });

    const rows = Object.values(base).map((r: any) => ({ ...r, GD: r.GF - r.GA }));

    rows.sort((a: any, b: any) => {
      if (b.PTS !== a.PTS) return b.PTS - a.PTS;
      if (b.GD !== a.GD) return b.GD - a.GD;
      if (b.GF !== a.GF) return b.GF - a.GF;
      return String(a.name).localeCompare(String(b.name));
    });

    return rows;
  }, [activeTournamentId, leagueTournaments, leagueTeams, leagueMatches, loggedEvents]);

  const SegButton = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
      <View
        style={{
          paddingVertical: 10,
          borderRadius: 12,
          alignItems: "center",
          backgroundColor: active ? "rgba(242,209,0,0.22)" : "rgba(255,255,255,0.06)",
          borderWidth: 1,
          borderColor: active ? "rgba(242,209,0,0.45)" : "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Matches</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 6 }}>Results, fixtures, and standings (auto).</Text>
        </View>

        <TouchableOpacity onPress={createQuickMatch} style={{ backgroundColor: "#F2D100", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 }}>
          <Text style={{ color: "#061A2B", fontWeight: "900" }}>+ Match</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
        <SegButton label="Results" active={mode === "RESULTS"} onPress={() => setMode("RESULTS")} />
        <SegButton label="Fixtures" active={mode === "FIXTURES"} onPress={() => setMode("FIXTURES")} />
        <SegButton label="Standings" active={mode === "STANDINGS"} onPress={() => setMode("STANDINGS")} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
        <View style={{ flexDirection: "row", gap: 10, paddingRight: 12 }}>
          <TouchableOpacity onPress={() => setActiveTournamentId("all")}>
            <View
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
                backgroundColor: activeTournamentId === "all" ? "rgba(34,198,210,0.22)" : "rgba(255,255,255,0.06)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>All</Text>
            </View>
          </TouchableOpacity>

          {(leagueTournaments ?? []).map((t: any) => {
            const active = String(activeTournamentId) === String(t.id);
            return (
              <TouchableOpacity key={t.id} onPress={() => setActiveTournamentId(String(t.id))}>
                <View
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 999,
                    backgroundColor: active ? "rgba(242,209,0,0.22)" : "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: active ? "rgba(242,209,0,0.45)" : "rgba(255,255,255,0.08)",
                  }}
                >
                  <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{t.name ?? "Tournament"}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <ScrollView style={{ marginTop: 14 }} contentContainerStyle={{ paddingBottom: 30, gap: 14 }}>
        {mode !== "STANDINGS" && !filteredMatches.length ? (
          <View style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>No matches yet</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 8 }}>Tap “+ Match” to create one quickly.</Text>
          </View>
        ) : null}

        {mode !== "STANDINGS"
          ? Object.keys(byTournament).map((tid) => {
              const listAll = byTournament[tid] ?? [];
              const list =
                mode === "RESULTS"
                  ? listAll.filter((m: any) => m.status === "FINAL" || m.status === "LIVE")
                  : listAll.filter((m: any) => isScheduled(m));

              if (!list.length) return null;

              return (
                <View key={tid} style={{ gap: 10 }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>{tournamentName(tid)}</Text>

                  {list.map((m: any) => {
                    const home = teamById(m.homeTeamId);
                    const away = teamById(m.awayTeamId);
                    const score = scoreForMatch(m.id, loggedEvents ?? [], m.homeTeamId, m.awayTeamId);

                    const liveLabel = m.status === "LIVE" ? "LIVE" : m.status === "FINAL" ? "FT" : "SCHEDULED";
                    const clock = m.status === "LIVE" ? fmtClock(0) : m.status === "FINAL" ? "FT" : "—";

                    return (
                      <TouchableOpacity key={m.id} onPress={() => router.push(`/live/${m.id}`)}>
                        <View style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
                          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <View style={{ backgroundColor: m.status === "LIVE" ? "rgba(255,59,48,0.22)" : "rgba(159,179,200,0.18)", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" }}>
                              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 12 }}>{liveLabel}</Text>
                            </View>
                            <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>{clock}</Text>
                          </View>

                          <View style={{ marginTop: 12, gap: 10 }}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                              <Image source={getLogoSource(home?.logoKey)} style={{ width: 34, height: 34, borderRadius: 12 }} />
                              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginLeft: 10, flex: 1 }}>{home?.name ?? "Home Team"}</Text>
                              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18 }}>{mode === "FIXTURES" ? "-" : score.home}</Text>
                            </View>

                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                              <Image source={getLogoSource(away?.logoKey)} style={{ width: 34, height: 34, borderRadius: 12 }} />
                              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginLeft: 10, flex: 1 }}>{away?.name ?? "Away Team"}</Text>
                              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18 }}>{mode === "FIXTURES" ? "-" : score.away}</Text>
                            </View>
                          </View>

                          <Text style={{ color: "#22C6D2", marginTop: 12, fontWeight: "900" }}>Tap to open Live →</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })
          : null}

        {mode === "STANDINGS" ? (
          <View style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>Standings</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 6 }}>Based on FINAL matches (PTS, GD, GF).</Text>

            {!standingsRows.length ? (
              <Text style={{ color: "#9FB3C8", marginTop: 12 }}>No standings yet. Finish a match (FT) and standings will populate.</Text>
            ) : (
              <View style={{ marginTop: 14 }}>
                <View style={{ flexDirection: "row", paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" }}>
                  <Text style={{ color: "#9FB3C8", width: 28, fontWeight: "900" }}>#</Text>
                  <Text style={{ color: "#9FB3C8", flex: 1, fontWeight: "900" }}>Team</Text>
                  <Text style={{ color: "#9FB3C8", width: 32, textAlign: "right", fontWeight: "900" }}>P</Text>
                  <Text style={{ color: "#9FB3C8", width: 40, textAlign: "right", fontWeight: "900" }}>PTS</Text>
                  <Text style={{ color: "#9FB3C8", width: 40, textAlign: "right", fontWeight: "900" }}>GD</Text>
                </View>

                {standingsRows.map((r: any, idx: number) => (
                  <View key={r.teamId} style={{ flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)", alignItems: "center" }}>
                    <Text style={{ color: "#EAF2FF", width: 28, fontWeight: "900" }}>{idx + 1}</Text>

                    <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                      <Image source={getLogoSource(r.logoKey)} style={{ width: 26, height: 26, borderRadius: 10, marginRight: 10 }} />
                      <Text style={{ color: "#EAF2FF", fontWeight: "900" }} numberOfLines={1}>
                        {r.name}
                      </Text>
                    </View>

                    <Text style={{ color: "#EAF2FF", width: 32, textAlign: "right", fontWeight: "900" }}>{r.P}</Text>
                    <Text style={{ color: "#F2D100", width: 40, textAlign: "right", fontWeight: "900" }}>{r.PTS}</Text>
                    <Text style={{ color: "#EAF2FF", width: 40, textAlign: "right", fontWeight: "900" }}>{r.GD}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
