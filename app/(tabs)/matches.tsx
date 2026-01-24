// app/(tabs)/matches.tsx - ENHANCED MATCHES TAB
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
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

  // Separate matches by status
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

  // Enhanced create match with modal
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
                { text: "View Match", onPress: () => matchId && router.push(`/live/${matchId}`) },
                { text: "OK" },
              ]
            );
          },
        },
      ]
    );
  };

  // Quick match for testing
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

    // Select random teams
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
          { text: "View Match", onPress: () => router.push(`/live/${id}`) },
          { text: "OK" },
        ]
      );
    }
  };

  // Auto-calculated standings
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

    // Sort by: Points -> Goal Difference -> Goals For -> Name
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

  const availableTeams = useMemo(() => {
    if (activeTournamentId === "all") return leagueTeams;
    return (leagueTeams ?? []).filter((t: any) => String(t.tournamentId) === String(activeTournamentId));
  }, [leagueTeams, activeTournamentId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Matches</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
            {liveMatches.length > 0 && `🔴 ${liveMatches.length} Live • `}
            {fixtureMatches.length} Fixtures • {resultMatches.length} Results
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={createQuickMatch}
            style={{ backgroundColor: "rgba(34,198,210,0.2)", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: "#22C6D2" }}
          >
            <Text style={{ color: "#22C6D2", fontWeight: "900" }}>Quick</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            style={{ backgroundColor: "#F2D100", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>+ Match</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode Selector */}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
        <SegButton label="Fixtures" active={mode === "FIXTURES"} onPress={() => setMode("FIXTURES")} />
        <SegButton label="Results" active={mode === "RESULTS"} onPress={() => setMode("RESULTS")} />
        <SegButton label="Standings" active={mode === "STANDINGS"} onPress={() => setMode("STANDINGS")} />
      </View>

      {/* Tournament Filter */}
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
                borderColor: activeTournamentId === "all" ? "#22C6D2" : "rgba(255,255,255,0.08)",
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

      {/* Live Matches Banner */}
      {liveMatches.length > 0 && mode !== "STANDINGS" && (
        <View style={{ marginTop: 14, backgroundColor: "rgba(255,59,48,0.1)", borderRadius: 14, padding: 12, borderWidth: 2, borderColor: "#FF3B30" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF3B30" }} />
            <Text style={{ color: "#FF3B30", fontWeight: "900" }}>
              {liveMatches.length} {liveMatches.length === 1 ? "Match" : "Matches"} LIVE NOW
            </Text>
          </View>
        </View>
      )}

      {/* Match List */}
      <ScrollView style={{ marginTop: 14 }} contentContainerStyle={{ paddingBottom: 30, gap: 14 }}>
        {mode !== "STANDINGS" && !filteredMatches.length ? (
          <View style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center" }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>No matches yet</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 8, textAlign: "center" }}>
              Tap "+ Match" to schedule a match
            </Text>
          </View>
        ) : null}

        {mode !== "STANDINGS" && Object.keys(byTournament).length === 0 && filteredMatches.length > 0 ? (
          <View style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center" }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
              No {mode === "FIXTURES" ? "fixtures" : "results"}
            </Text>
            <Text style={{ color: "#9FB3C8", marginTop: 8, textAlign: "center" }}>
              {mode === "FIXTURES" ? "All matches have been completed" : "No completed matches yet"}
            </Text>
          </View>
        ) : null}

        {mode !== "STANDINGS"
          ? Object.keys(byTournament).map((tid) => {
              const list = byTournament[tid] ?? [];
              if (!list.length) return null;

              return (
                <View key={tid} style={{ gap: 10 }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>{tournamentName(tid)}</Text>

                  {list.map((m: any) => {
                    const home = teamById(m.homeTeamId);
                    const away = teamById(m.awayTeamId);
                    const score = scoreForMatch(m.id, loggedEvents ?? [], m.homeTeamId, m.awayTeamId);

                    const liveLabel = isLive(m) ? "LIVE" : isFinal(m) ? "FT" : "SCHEDULED";
                    const showScore = mode === "RESULTS" || isLive(m) || isFinal(m);

                    return (
                      <TouchableOpacity key={m.id} onPress={() => router.push(`/live/${m.id}`)}>
                        <View
                          style={{
                            backgroundColor: "#0A2238",
                            borderRadius: 16,
                            padding: 14,
                            borderWidth: isLive(m) ? 2 : 1,
                            borderColor: isLive(m) ? "#FF3B30" : "rgba(255,255,255,0.08)",
                          }}
                        >
                          {/* Match Header */}
                          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <View
                              style={{
                                backgroundColor: isLive(m) ? "rgba(255,59,48,0.22)" : isFinal(m) ? "rgba(159,179,200,0.18)" : "rgba(242,209,0,0.15)",
                                paddingVertical: 6,
                                paddingHorizontal: 10,
                                borderRadius: 999,
                                borderWidth: 1,
                                borderColor: "rgba(255,255,255,0.10)",
                              }}
                            >
                              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 12 }}>{liveLabel}</Text>
                            </View>
                            <Text style={{ color: "#9FB3C8", fontSize: 12 }}>
                              {m.date || "TBD"} • {m.time || "TBD"}
                            </Text>
                          </View>

                          {/* Teams */}
                          <View style={{ marginTop: 12, gap: 10 }}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                              <Image source={getLogoSource(home?.logoKey)} style={{ width: 34, height: 34, borderRadius: 12 }} />
                              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginLeft: 10, flex: 1 }}>
                                {home?.name ?? "Home Team"}
                              </Text>
                              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18 }}>
                                {showScore ? score.home : "-"}
                              </Text>
                            </View>

                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                              <Image source={getLogoSource(away?.logoKey)} style={{ width: 34, height: 34, borderRadius: 12 }} />
                              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginLeft: 10, flex: 1 }}>
                                {away?.name ?? "Away Team"}
                              </Text>
                              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18 }}>
                                {showScore ? score.away : "-"}
                              </Text>
                            </View>
                          </View>

                          {/* Match Info */}
                          <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" }}>
                            <Text style={{ color: "#9FB3C8", fontSize: 12 }}>
                              {m.field || "Field TBD"}
                            </Text>
                            <Text style={{ color: "#22C6D2", marginTop: 6, fontWeight: "900" }}>
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
          <View style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>Standings</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 6, fontSize: 12 }}>
              Auto-calculated from completed matches • Sorted by PTS → GD → GF
            </Text>

            {!standingsRows.length ? (
              <View style={{ marginTop: 20, alignItems: "center" }}>
                <Text style={{ color: "#9FB3C8", textAlign: "center" }}>
                  No standings yet.
                </Text>
                <Text style={{ color: "#9FB3C8", marginTop: 8, textAlign: "center" }}>
                  Complete a match (set to FINAL) and standings will populate automatically.
                </Text>
              </View>
            ) : (
              <View style={{ marginTop: 14 }}>
                {/* Table Header */}
                <View style={{ flexDirection: "row", paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" }}>
                  <Text style={{ color: "#9FB3C8", width: 32, fontWeight: "900", fontSize: 12 }}>#</Text>
                  <Text style={{ color: "#9FB3C8", flex: 1, fontWeight: "900", fontSize: 12 }}>Team</Text>
                  <Text style={{ color: "#9FB3C8", width: 32, textAlign: "center", fontWeight: "900", fontSize: 12 }}>P</Text>
                  <Text style={{ color: "#9FB3C8", width: 32, textAlign: "center", fontWeight: "900", fontSize: 12 }}>W</Text>
                  <Text style={{ color: "#9FB3C8", width: 32, textAlign: "center", fontWeight: "900", fontSize: 12 }}>D</Text>
                  <Text style={{ color: "#9FB3C8", width: 32, textAlign: "center", fontWeight: "900", fontSize: 12 }}>L</Text>
                  <Text style={{ color: "#9FB3C8", width: 40, textAlign: "center", fontWeight: "900", fontSize: 12 }}>GD</Text>
                  <Text style={{ color: "#9FB3C8", width: 44, textAlign: "center", fontWeight: "900", fontSize: 12 }}>PTS</Text>
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
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: "rgba(255,255,255,0.06)",
                        alignItems: "center",
                        backgroundColor: isTop3 ? `${medalColor}10` : "transparent",
                        marginHorizontal: -14,
                        paddingHorizontal: 14,
                      }}
                    >
                      {/* Rank */}
                      <View style={{
                        width: 32,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}>
                        <Text style={{ color: isTop3 ? medalColor : "#EAF2FF", fontWeight: "900", fontSize: 14 }}>
                          {idx + 1}
                        </Text>
                        {isTop3 && <Text style={{ fontSize: 10 }}>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</Text>}
                      </View>

                      {/* Team */}
                      <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                        <Image source={getLogoSource(r.logoKey)} style={{ width: 26, height: 26, borderRadius: 10, marginRight: 10 }} />
                        <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 13 }} numberOfLines={1}>
                          {r.name}
                        </Text>
                      </View>

                      {/* Stats */}
                      <Text style={{ color: "#EAF2FF", width: 32, textAlign: "center", fontWeight: "900", fontSize: 13 }}>{r.P}</Text>
                      <Text style={{ color: "#34C759", width: 32, textAlign: "center", fontWeight: "900", fontSize: 13 }}>{r.W}</Text>
                      <Text style={{ color: "#F2D100", width: 32, textAlign: "center", fontWeight: "900", fontSize: 13 }}>{r.D}</Text>
                      <Text style={{ color: "#FF3B30", width: 32, textAlign: "center", fontWeight: "900", fontSize: 13 }}>{r.L}</Text>
                      <Text style={{ color: "#22C6D2", width: 40, textAlign: "center", fontWeight: "900", fontSize: 13 }}>
                        {r.GD >= 0 ? "+" : ""}{r.GD}
                      </Text>
                      <Text style={{ color: "#F2D100", width: 44, textAlign: "center", fontWeight: "900", fontSize: 15 }}>{r.PTS}</Text>
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
          <View style={{ backgroundColor: "#0A2238", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "90%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ color: "#F2D100", fontSize: 20, fontWeight: "900" }}>Create Match</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={{ color: "#9FB3C8", fontSize: 28 }}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 20 }}>
              {/* Home Team */}
              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>Home Team</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {availableTeams.map((team: any) => (
                      <TouchableOpacity
                        key={team.id}
                        onPress={() => setSelectedHomeTeam(team.id)}
                        style={{
                          backgroundColor: selectedHomeTeam === team.id ? "#34C759" : "rgba(255,255,255,0.06)",
                          padding: 12,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: selectedHomeTeam === team.id ? "#34C759" : "rgba(255,255,255,0.08)",
                          minWidth: 120,
                          alignItems: "center",
                        }}
                      >
                        <Image source={getLogoSource(team.logoKey)} style={{ width: 40, height: 40, borderRadius: 12, marginBottom: 8 }} />
                        <Text style={{ color: selectedHomeTeam === team.id ? "#061A2B" : "#EAF2FF", fontWeight: "900", fontSize: 12, textAlign: "center" }}>
                          {team.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Away Team */}
              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>Away Team</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {availableTeams.map((team: any) => (
                      <TouchableOpacity
                        key={team.id}
                        onPress={() => setSelectedAwayTeam(team.id)}
                        disabled={team.id === selectedHomeTeam}
                        style={{
                          backgroundColor: selectedAwayTeam === team.id ? "#22C6D2" : "rgba(255,255,255,0.06)",
                          padding: 12,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: selectedAwayTeam === team.id ? "#22C6D2" : "rgba(255,255,255,0.08)",
                          minWidth: 120,
                          alignItems: "center",
                          opacity: team.id === selectedHomeTeam ? 0.3 : 1,
                        }}
                      >
                        <Image source={getLogoSource(team.logoKey)} style={{ width: 40, height: 40, borderRadius: 12, marginBottom: 8 }} />
                        <Text style={{ color: selectedAwayTeam === team.id ? "#061A2B" : "#EAF2FF", fontWeight: "900", fontSize: 12, textAlign: "center" }}>
                          {team.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Match Details */}
              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>Date</Text>
                <TextInput
                  value={matchDate}
                  onChangeText={setMatchDate}
                  placeholder="e.g., Nov 25, 2024"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#EAF2FF", padding: 12, borderRadius: 12, fontWeight: "900" }}
                />
              </View>

              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>Time</Text>
                <TextInput
                  value={matchTime}
                  onChangeText={setMatchTime}
                  placeholder="e.g., 3:00 PM"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#EAF2FF", padding: 12, borderRadius: 12, fontWeight: "900" }}
                />
              </View>

              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>Field</Text>
                <TextInput
                  value={matchField}
                  onChangeText={setMatchField}
                  placeholder="e.g., Field 3"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#EAF2FF", padding: 12, borderRadius: 12, fontWeight: "900" }}
                />
              </View>
            </ScrollView>

            {/* Create Button */}
            <TouchableOpacity
              onPress={handleCreateMatch}
              disabled={!selectedHomeTeam || !selectedAwayTeam}
              style={{
                backgroundColor: selectedHomeTeam && selectedAwayTeam ? "#F2D100" : "rgba(255,255,255,0.1)",
                padding: 16,
                borderRadius: 14,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text style={{ color: selectedHomeTeam && selectedAwayTeam ? "#061A2B" : "#9FB3C8", fontWeight: "900", fontSize: 16 }}>
                Create Match
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}