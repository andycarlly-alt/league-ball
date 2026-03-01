// app/(tabs)/matches.tsx - FIXED NAVIGATION
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource } from "../../src/utils/logos";
import { isWeb, normalize, spacing } from "../../src/utils/responsive";

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
  return m?.status === "FINAL";
}

function isScheduled(m: any) {
  return m?.status === "SCHEDULED";
}

function isLive(m: any) {
  return m?.status === "LIVE";
}

export default function MatchesTab() {
  const router = useRouter();
  const { activeLeagueId, tournaments, teams, matches, loggedEvents, createMatch } = useAppStore() as any;

  const [mode, setMode] = useState<Mode>("FIXTURES");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHomeTeam, setSelectedHomeTeam] = useState<string>("");
  const [selectedAwayTeam, setSelectedAwayTeam] = useState<string>("");
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("");
  const [matchField, setMatchField] = useState("");

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
  }, [leagueTournaments?.length, activeTournamentId]);

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

  const liveMatches = useMemo(() => {
    return filteredMatches.filter((m: any) => isLive(m));
  }, [filteredMatches]);

  const fixtureMatches = useMemo(() => {
    return filteredMatches.filter((m: any) => isScheduled(m));
  }, [filteredMatches]);

  const resultMatches = useMemo(() => {
    return filteredMatches.filter((m: any) => isFinal(m));
  }, [filteredMatches]);

  const byTournament = useMemo(() => {
    const map: Record<string, any[]> = {};
    const list = mode === "RESULTS" ? resultMatches : mode === "FIXTURES" ? fixtureMatches : filteredMatches;
    
    list.forEach((m: any) => {
      const tid = String(m.tournamentId || "unknown");
      if (!map[tid]) map[tid] = [];
      map[tid].push(m);
    });
    return map;
  }, [filteredMatches, resultMatches, fixtureMatches, mode]);

  const tournamentName = (tid: string) =>
    (leagueTournaments ?? []).find((t: any) => String(t.id) === String(tid))?.name ?? "Tournament";

  const teamById = (id: string) => (leagueTeams ?? []).find((t: any) => String(t.id) === String(id));

  const handleCreateMatch = () => {
    if (!selectedHomeTeam || !selectedAwayTeam) {
      Alert.alert("Select Teams", "Please select both home and away teams");
      return;
    }

    if (selectedHomeTeam === selectedAwayTeam) {
      Alert.alert("Invalid Selection", "Home and away teams must be different");
      return;
    }

    if (typeof createMatch !== "function") {
      Alert.alert("Error", "createMatch function not available");
      return;
    }

    const tourn =
      activeTournamentId !== "all"
        ? (leagueTournaments ?? []).find((t: any) => String(t.id) === String(activeTournamentId))
        : (leagueTournaments ?? [])[0];

    if (!tourn) {
      Alert.alert("No Tournament", "Create a tournament first");
      return;
    }

    const homeTeam = teamById(selectedHomeTeam);
    const awayTeam = teamById(selectedAwayTeam);

    Alert.alert(
      "Create Match",
      `${homeTeam?.name || "Home"} vs ${awayTeam?.name || "Away"}\n\nDate: ${matchDate || "TBD"}\nTime: ${matchTime || "TBD"}\nField: ${matchField || "TBD"}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: () => {
            const matchId = createMatch({
              leagueId: activeLeagueId,
              tournamentId: tourn.id,
              homeTeamId: selectedHomeTeam,
              awayTeamId: selectedAwayTeam,
              kickoffAt: Date.now(),
              status: "SCHEDULED",
              field: matchField || "Field TBD",
              date: matchDate || new Date().toLocaleDateString(),
              time: matchTime || "TBD",
            });

            setShowCreateModal(false);
            setSelectedHomeTeam("");
            setSelectedAwayTeam("");
            setMatchDate("");
            setMatchTime("");
            setMatchField("");

            Alert.alert(
              "Match Created! ✅",
              "Match has been scheduled",
              [
                { text: "View Match", onPress: () => matchId && router.push(`/matches/${matchId}`) },
                { text: "OK" },
              ]
            );
          },
        },
      ]
    );
  };

  const createQuickMatch = () => {
    const tourn =
      activeTournamentId !== "all"
        ? (leagueTournaments ?? []).find((t: any) => String(t.id) === String(activeTournamentId))
        : (leagueTournaments ?? [])[0];

    if (!tourn) {
      Alert.alert("No tournament", "Create a tournament first");
      return;
    }

    const teamsInTournament = (leagueTeams ?? []).filter((t: any) => String(t.tournamentId) === String(tourn.id));
    const pool = teamsInTournament.length >= 2 ? teamsInTournament : leagueTeams;

    if (!pool || pool.length < 2) {
      Alert.alert("Not enough teams", "Add at least 2 teams first");
      return;
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const home = shuffled[0];
    const away = shuffled[1];

    if (typeof createMatch !== "function") {
      Alert.alert("Error", "createMatch function not available");
      return;
    }

    const id = createMatch({
      leagueId: activeLeagueId,
      tournamentId: tourn.id,
      homeTeamId: home.id,
      awayTeamId: away.id,
      kickoffAt: Date.now(),
      status: "SCHEDULED",
      field: `Field ${Math.floor(Math.random() * 5) + 1}`,
      date: new Date().toLocaleDateString(),
      time: `${Math.floor(Math.random() * 12) + 1}:00 PM`,
    });

    if (id) {
      Alert.alert(
        "Quick Match Created!",
        `${home.name} vs ${away.name}`,
        [
          { text: "View Match", onPress: () => router.push(`/matches/${id}`) },
          { text: "OK" },
        ]
      );
    }
  };

  const standingsRows = useMemo(() => {
    const tid =
      activeTournamentId === "all" ? String(leagueTournaments?.[0]?.id ?? "") : String(activeTournamentId);

    if (!tid) return [];

    const tTeams = (leagueTeams ?? []).filter((tm: any) => String(tm.tournamentId) === String(tid));
    const tMatches = (leagueMatches ?? []).filter((m: any) => String(m.tournamentId) === String(tid) && isFinal(m));

    const base: Record<string, any> = {};
    tTeams.forEach((tm: any) => {
      base[String(tm.id)] = {
        teamId: String(tm.id),
        name: tm.name ?? "Team",
        logoKey: tm.logoKey,
        P: 0,
        W: 0,
        D: 0,
        L: 0,
        GF: 0,
        GA: 0,
        GD: 0,
        PTS: 0,
      };
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
  }, [activeTournamentId, leagueTournaments, leagueTeams, leagueMatches, loggedEvents, teamById]);

  const SegButton = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
      <View
        style={{
          paddingVertical: normalize(10),
          borderRadius: normalize(12),
          alignItems: "center",
          backgroundColor: active ? "rgba(242,209,0,0.22)" : "rgba(255,255,255,0.06)",
          borderWidth: 1,
          borderColor: active ? "rgba(242,209,0,0.45)" : "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(14) }}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  const availableTeams = useMemo(() => {
    if (activeTournamentId === "all") return leagueTeams;
    return (leagueTeams ?? []).filter((t: any) => String(t.tournamentId) === String(activeTournamentId));
  }, [leagueTeams, activeTournamentId]);

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: "#061A2B", 
      padding: spacing.lg,
      ...(isWeb() && { maxWidth: 1200, marginHorizontal: 'auto' as any, width: '100%' }),
    }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: spacing.md }}>
          <Text style={{ color: "#F2D100", fontSize: normalize(22), fontWeight: "900" }}>Matches</Text>
          <Text style={{ color: "#9FB3C8", marginTop: spacing.sm, fontSize: normalize(14) }}>
            {liveMatches.length > 0 && `🔴 ${liveMatches.length} Live • `}
            {fixtureMatches.length} Fixtures • {resultMatches.length} Results
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <TouchableOpacity
            onPress={createQuickMatch}
            style={{ 
              backgroundColor: "rgba(34,198,210,0.2)", 
              paddingVertical: normalize(10), 
              paddingHorizontal: spacing.md, 
              borderRadius: normalize(12), 
              borderWidth: 1, 
              borderColor: "#22C6D2",
              ...(isWeb() && { cursor: "pointer" }),
            }}
          >
            <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: normalize(14) }}>Quick</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            style={{ 
              backgroundColor: "#F2D100", 
              paddingVertical: normalize(10), 
              paddingHorizontal: spacing.md, 
              borderRadius: normalize(12),
              ...(isWeb() && { cursor: "pointer" }),
            }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: normalize(14) }}>+ Match</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode Selector */}
      <View style={{ flexDirection: "row", gap: normalize(10), marginTop: spacing.md }}>
        <SegButton label="Fixtures" active={mode === "FIXTURES"} onPress={() => setMode("FIXTURES")} />
        <SegButton label="Results" active={mode === "RESULTS"} onPress={() => setMode("RESULTS")} />
        <SegButton label="Standings" active={mode === "STANDINGS"} onPress={() => setMode("STANDINGS")} />
      </View>

      {/* Tournament Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }}>
        <View style={{ flexDirection: "row", gap: normalize(10), paddingRight: spacing.md }}>
          <TouchableOpacity onPress={() => setActiveTournamentId("all")}>
            <View
              style={{
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                borderRadius: 999,
                backgroundColor: activeTournamentId === "all" ? "rgba(34,198,210,0.22)" : "rgba(255,255,255,0.06)",
                borderWidth: 1,
                borderColor: activeTournamentId === "all" ? "#22C6D2" : "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(14) }}>All</Text>
            </View>
          </TouchableOpacity>

          {(leagueTournaments ?? []).map((t: any) => {
            const active = String(activeTournamentId) === String(t.id);
            return (
              <TouchableOpacity key={t.id} onPress={() => setActiveTournamentId(String(t.id))}>
                <View
                  style={{
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderRadius: 999,
                    backgroundColor: active ? "rgba(242,209,0,0.22)" : "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: active ? "rgba(242,209,0,0.45)" : "rgba(255,255,255,0.08)",
                  }}
                >
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(14) }}>{t.name ?? "Tournament"}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Live Matches Banner */}
      {liveMatches.length > 0 && mode !== "STANDINGS" && (
        <View style={{ marginTop: spacing.md, backgroundColor: "rgba(255,59,48,0.1)", borderRadius: normalize(14), padding: spacing.md, borderWidth: 2, borderColor: "#FF3B30" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <View style={{ width: normalize(8), height: normalize(8), borderRadius: normalize(4), backgroundColor: "#FF3B30" }} />
            <Text style={{ color: "#FF3B30", fontWeight: "900", fontSize: normalize(14) }}>
              {liveMatches.length} {liveMatches.length === 1 ? "Match" : "Matches"} LIVE NOW
            </Text>
          </View>
        </View>
      )}

      {/* Match List */}
      <ScrollView style={{ marginTop: spacing.md }} contentContainerStyle={{ paddingBottom: spacing.huge, gap: spacing.md }}>
        {mode !== "STANDINGS" && !filteredMatches.length ? (
          <View style={{ backgroundColor: "#0A2238", borderRadius: normalize(16), padding: spacing.xl, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center" }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(16) }}>No matches yet</Text>
            <Text style={{ color: "#9FB3C8", marginTop: spacing.sm, textAlign: "center", fontSize: normalize(14) }}>
              Tap "+ Match" to schedule a match
            </Text>
          </View>
        ) : null}

        {mode !== "STANDINGS" && Object.keys(byTournament).length === 0 && filteredMatches.length > 0 ? (
          <View style={{ backgroundColor: "#0A2238", borderRadius: normalize(16), padding: spacing.xl, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center" }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(16) }}>
              No {mode === "FIXTURES" ? "fixtures" : "results"}
            </Text>
            <Text style={{ color: "#9FB3C8", marginTop: spacing.sm, textAlign: "center", fontSize: normalize(14) }}>
              {mode === "FIXTURES" ? "All matches have been completed" : "No completed matches yet"}
            </Text>
          </View>
        ) : null}

        {mode !== "STANDINGS"
          ? Object.keys(byTournament).map((tid) => {
              const list = byTournament[tid] ?? [];
              if (!list.length) return null;

              return (
                <View key={tid} style={{ gap: normalize(10) }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(16) }}>{tournamentName(tid)}</Text>

                  {list.map((m: any) => {
                    const home = teamById(m.homeTeamId);
                    const away = teamById(m.awayTeamId);
                    const score = scoreForMatch(m.id, loggedEvents ?? [], m.homeTeamId, m.awayTeamId);

                    const liveLabel = isLive(m) ? "LIVE" : isFinal(m) ? "FT" : "SCHEDULED";
                    const showScore = mode === "RESULTS" || isLive(m) || isFinal(m);

                    return (
                      <TouchableOpacity 
                        key={m.id} 
                        onPress={() => router.push(`/matches/${m.id}`)}
                        style={{
                          ...(isWeb() && { cursor: "pointer" }),
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "#0A2238",
                            borderRadius: normalize(16),
                            padding: spacing.md,
                            borderWidth: isLive(m) ? 2 : 1,
                            borderColor: isLive(m) ? "#FF3B30" : "rgba(255,255,255,0.08)",
                          }}
                        >
                          {/* Match Header */}
                          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <View
                              style={{
                                backgroundColor: isLive(m) ? "rgba(255,59,48,0.22)" : isFinal(m) ? "rgba(159,179,200,0.18)" : "rgba(242,209,0,0.15)",
                                paddingVertical: spacing.sm,
                                paddingHorizontal: normalize(10),
                                borderRadius: 999,
                                borderWidth: 1,
                                borderColor: "rgba(255,255,255,0.10)",
                              }}
                            >
                              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(12) }}>{liveLabel}</Text>
                            </View>
                            <Text style={{ color: "#9FB3C8", fontSize: normalize(12) }}>
                              {m.date || "TBD"} • {m.time || "TBD"}
                            </Text>
                          </View>

                          {/* Teams */}
                          <View style={{ marginTop: spacing.md, gap: normalize(10) }}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                              <Image source={getLogoSource(home?.logoKey)} style={{ width: normalize(34), height: normalize(34), borderRadius: normalize(12) }} />
                              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginLeft: normalize(10), flex: 1, fontSize: normalize(14) }}>
                                {home?.name ?? "Home Team"}
                              </Text>
                              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: normalize(18) }}>
                                {showScore ? score.home : "-"}
                              </Text>
                            </View>

                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                              <Image source={getLogoSource(away?.logoKey)} style={{ width: normalize(34), height: normalize(34), borderRadius: normalize(12) }} />
                              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginLeft: normalize(10), flex: 1, fontSize: normalize(14) }}>
                                {away?.name ?? "Away Team"}
                              </Text>
                              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: normalize(18) }}>
                                {showScore ? score.away : "-"}
                              </Text>
                            </View>
                          </View>

                          {/* Match Info */}
                          <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" }}>
                            <Text style={{ color: "#9FB3C8", fontSize: normalize(12) }}>
                              {m.field || "Field TBD"}
                            </Text>
                            <Text style={{ color: "#22C6D2", marginTop: spacing.sm, fontWeight: "900", fontSize: normalize(14) }}>
                              Tap to {isLive(m) ? "watch live" : isScheduled(m) ? "manage match" : "view details"} →
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })
          : null}

        {/* Standings */}
        {mode === "STANDINGS" ? (
          <View style={{ backgroundColor: "#0A2238", borderRadius: normalize(16), padding: spacing.md, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(16) }}>Standings</Text>
            <Text style={{ color: "#9FB3C8", marginTop: spacing.sm, fontSize: normalize(12) }}>
              Auto-calculated from completed matches • Sorted by PTS → GD → GF
            </Text>

            {!standingsRows.length ? (
              <View style={{ marginTop: spacing.xl, alignItems: "center" }}>
                <Text style={{ color: "#9FB3C8", textAlign: "center", fontSize: normalize(14) }}>
                  No standings yet.
                </Text>
                <Text style={{ color: "#9FB3C8", marginTop: spacing.sm, textAlign: "center", fontSize: normalize(12) }}>
                  Complete a match (set to FINAL) and standings will populate automatically.
                </Text>
              </View>
            ) : (
              <View style={{ marginTop: spacing.md }}>
                {/* Table Header */}
                <View style={{ flexDirection: "row", paddingBottom: normalize(10), borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" }}>
                  <Text style={{ color: "#9FB3C8", width: normalize(32), fontWeight: "900", fontSize: normalize(12) }}>#</Text>
                  <Text style={{ color: "#9FB3C8", flex: 1, fontWeight: "900", fontSize: normalize(12) }}>Team</Text>
                  <Text style={{ color: "#9FB3C8", width: normalize(32), textAlign: "center", fontWeight: "900", fontSize: normalize(12) }}>P</Text>
                  <Text style={{ color: "#9FB3C8", width: normalize(32), textAlign: "center", fontWeight: "900", fontSize: normalize(12) }}>W</Text>
                  <Text style={{ color: "#9FB3C8", width: normalize(32), textAlign: "center", fontWeight: "900", fontSize: normalize(12) }}>D</Text>
                  <Text style={{ color: "#9FB3C8", width: normalize(32), textAlign: "center", fontWeight: "900", fontSize: normalize(12) }}>L</Text>
                  <Text style={{ color: "#9FB3C8", width: normalize(40), textAlign: "center", fontWeight: "900", fontSize: normalize(12) }}>GD</Text>
                  <Text style={{ color: "#9FB3C8", width: normalize(44), textAlign: "center", fontWeight: "900", fontSize: normalize(12) }}>PTS</Text>
                </View>

                {/* Table Rows */}
                {standingsRows.map((r: any, idx: number) => {
                  const isTop3 = idx < 3;
                  const medalColor = idx === 0 ? "#F2D100" : idx === 1 ? "#9FB3C8" : "#CD7F32";

                  return (
                    <TouchableOpacity
                      key={r.teamId}
                      onPress={() => router.push(`/teams/${r.teamId}`)}
                      style={{
                        flexDirection: "row",
                        paddingVertical: spacing.md,
                        borderBottomWidth: 1,
                        borderBottomColor: "rgba(255,255,255,0.06)",
                        alignItems: "center",
                        backgroundColor: isTop3 ? `${medalColor}10` : "transparent",
                        marginHorizontal: -spacing.md,
                        paddingHorizontal: spacing.md,
                        ...(isWeb() && { cursor: "pointer" }),
                      }}
                    >
                      {/* Rank */}
                      <View style={{
                        width: normalize(32),
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing.xs,
                      }}>
                        <Text style={{ color: isTop3 ? medalColor : "#EAF2FF", fontWeight: "900", fontSize: normalize(14) }}>
                          {idx + 1}
                        </Text>
                        {isTop3 && <Text style={{ fontSize: normalize(10) }}>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</Text>}
                      </View>

                      {/* Team */}
                      <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                        <Image source={getLogoSource(r.logoKey)} style={{ width: normalize(26), height: normalize(26), borderRadius: normalize(10), marginRight: normalize(10) }} />
                        <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(13) }} numberOfLines={1}>
                          {r.name}
                        </Text>
                      </View>

                      {/* Stats */}
                      <Text style={{ color: "#EAF2FF", width: normalize(32), textAlign: "center", fontWeight: "900", fontSize: normalize(13) }}>{r.P}</Text>
                      <Text style={{ color: "#34C759", width: normalize(32), textAlign: "center", fontWeight: "900", fontSize: normalize(13) }}>{r.W}</Text>
                      <Text style={{ color: "#F2D100", width: normalize(32), textAlign: "center", fontWeight: "900", fontSize: normalize(13) }}>{r.D}</Text>
                      <Text style={{ color: "#FF3B30", width: normalize(32), textAlign: "center", fontWeight: "900", fontSize: normalize(13) }}>{r.L}</Text>
                      <Text style={{ color: "#22C6D2", width: normalize(40), textAlign: "center", fontWeight: "900", fontSize: normalize(13) }}>
                        {r.GD >= 0 ? "+" : ""}{r.GD}
                      </Text>
                      <Text style={{ color: "#F2D100", width: normalize(44), textAlign: "center", fontWeight: "900", fontSize: normalize(15) }}>{r.PTS}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>

      {/* Create Match Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#0A2238", borderTopLeftRadius: normalize(24), borderTopRightRadius: normalize(24), padding: spacing.xl, maxHeight: "90%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xl }}>
              <Text style={{ color: "#F2D100", fontSize: normalize(20), fontWeight: "900" }}>Create Match</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={{ color: "#9FB3C8", fontSize: normalize(28) }}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xl }}>
              {/* Home Team */}
              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: spacing.sm, fontSize: normalize(14) }}>Home Team</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: spacing.sm }}>
                    {availableTeams.map((team: any) => (
                      <TouchableOpacity
                        key={team.id}
                        onPress={() => setSelectedHomeTeam(team.id)}
                        style={{
                          backgroundColor: selectedHomeTeam === team.id ? "#34C759" : "rgba(255,255,255,0.06)",
                          padding: spacing.md,
                          borderRadius: normalize(12),
                          borderWidth: 1,
                          borderColor: selectedHomeTeam === team.id ? "#34C759" : "rgba(255,255,255,0.08)",
                          minWidth: normalize(120),
                          alignItems: "center",
                        }}
                      >
                        <Image source={getLogoSource(team.logoKey)} style={{ width: normalize(40), height: normalize(40), borderRadius: normalize(12), marginBottom: spacing.sm }} />
                        <Text style={{ color: selectedHomeTeam === team.id ? "#061A2B" : "#EAF2FF", fontWeight: "900", fontSize: normalize(12), textAlign: "center" }}>
                          {team.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Away Team */}
              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: spacing.sm, fontSize: normalize(14) }}>Away Team</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: spacing.sm }}>
                    {availableTeams.map((team: any) => (
                      <TouchableOpacity
                        key={team.id}
                        onPress={() => setSelectedAwayTeam(team.id)}
                        disabled={team.id === selectedHomeTeam}
                        style={{
                          backgroundColor: selectedAwayTeam === team.id ? "#22C6D2" : "rgba(255,255,255,0.06)",
                          padding: spacing.md,
                          borderRadius: normalize(12),
                          borderWidth: 1,
                          borderColor: selectedAwayTeam === team.id ? "#22C6D2" : "rgba(255,255,255,0.08)",
                          minWidth: normalize(120),
                          alignItems: "center",
                          opacity: team.id === selectedHomeTeam ? 0.3 : 1,
                        }}
                      >
                        <Image source={getLogoSource(team.logoKey)} style={{ width: normalize(40), height: normalize(40), borderRadius: normalize(12), marginBottom: spacing.sm }} />
                        <Text style={{ color: selectedAwayTeam === team.id ? "#061A2B" : "#EAF2FF", fontWeight: "900", fontSize: normalize(12), textAlign: "center" }}>
                          {team.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Match Details */}
              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: spacing.sm, fontSize: normalize(14) }}>Date</Text>
                <TextInput
                  value={matchDate}
                  onChangeText={setMatchDate}
                  placeholder="e.g., Nov 25, 2024"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#EAF2FF", padding: spacing.md, borderRadius: normalize(12), fontWeight: "900", fontSize: normalize(14) }}
                />
              </View>

              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: spacing.sm, fontSize: normalize(14) }}>Time</Text>
                <TextInput
                  value={matchTime}
                  onChangeText={setMatchTime}
                  placeholder="e.g., 3:00 PM"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#EAF2FF", padding: spacing.md, borderRadius: normalize(12), fontWeight: "900", fontSize: normalize(14) }}
                />
              </View>

              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: spacing.sm, fontSize: normalize(14) }}>Field</Text>
                <TextInput
                  value={matchField}
                  onChangeText={setMatchField}
                  placeholder="e.g., Field 3"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#EAF2FF", padding: spacing.md, borderRadius: normalize(12), fontWeight: "900", fontSize: normalize(14) }}
                />
              </View>
            </ScrollView>

            {/* Create Button */}
            <TouchableOpacity
              onPress={handleCreateMatch}
              disabled={!selectedHomeTeam || !selectedAwayTeam}
              style={{
                backgroundColor: selectedHomeTeam && selectedAwayTeam ? "#F2D100" : "rgba(255,255,255,0.1)",
                padding: spacing.lg,
                borderRadius: normalize(14),
                alignItems: "center",
                marginTop: normalize(10),
                ...(isWeb() && selectedHomeTeam && selectedAwayTeam && { cursor: "pointer" }),
              }}
            >
              <Text style={{ color: selectedHomeTeam && selectedAwayTeam ? "#061A2B" : "#9FB3C8", fontWeight: "900", fontSize: normalize(16) }}>
                Create Match
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}