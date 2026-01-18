// src/utils/standings.ts
export type MatchStatus = "NOT_STARTED" | "LIVE" | "FINAL";

export type MatchLike = {
  id: string;
  tournamentId?: string;
  leagueId?: string;

  homeTeamId: string;
  awayTeamId: string;

  homeScore?: number;
  awayScore?: number;

  status?: MatchStatus;
  kickoffAt?: number; // optional timestamp
  createdAt?: number; // optional timestamp
};

export type TeamLike = {
  id: string;
  name?: string;
  logoKey?: any;
};

export type StandingRow = {
  teamId: string;
  teamName: string;

  P: number; // played
  W: number;
  D: number;
  L: number;

  GF: number;
  GA: number;
  GD: number;

  PTS: number;
};

export function computeStandings(params: {
  teams: TeamLike[];
  matches: MatchLike[];
  tournamentId?: string;
}): StandingRow[] {
  const { teams, matches, tournamentId } = params;

  const teamMap = new Map<string, TeamLike>();
  (teams ?? []).forEach((t) => teamMap.set(t.id, t));

  // initialize rows for all teams (so even 0 games teams show)
  const rows = new Map<string, StandingRow>();
  for (const t of teams ?? []) {
    rows.set(t.id, {
      teamId: t.id,
      teamName: String(t.name ?? "Unnamed"),
      P: 0,
      W: 0,
      D: 0,
      L: 0,
      GF: 0,
      GA: 0,
      GD: 0,
      PTS: 0,
    });
  }

  const finals = (matches ?? []).filter((m) => {
    const inTournament = tournamentId ? m.tournamentId === tournamentId : true;
    return inTournament && (m.status ?? "NOT_STARTED") === "FINAL";
  });

  const addTeamIfMissing = (teamId: string) => {
    if (!rows.has(teamId)) {
      const t = teamMap.get(teamId);
      rows.set(teamId, {
        teamId,
        teamName: String(t?.name ?? "Unknown"),
        P: 0,
        W: 0,
        D: 0,
        L: 0,
        GF: 0,
        GA: 0,
        GD: 0,
        PTS: 0,
      });
    }
  };

  for (const m of finals) {
    const hs = Number(m.homeScore ?? 0);
    const as = Number(m.awayScore ?? 0);

    addTeamIfMissing(m.homeTeamId);
    addTeamIfMissing(m.awayTeamId);

    const home = rows.get(m.homeTeamId)!;
    const away = rows.get(m.awayTeamId)!;

    home.P += 1;
    away.P += 1;

    home.GF += hs;
    home.GA += as;

    away.GF += as;
    away.GA += hs;

    if (hs > as) {
      home.W += 1;
      home.PTS += 3;
      away.L += 1;
    } else if (hs < as) {
      away.W += 1;
      away.PTS += 3;
      home.L += 1;
    } else {
      home.D += 1;
      away.D += 1;
      home.PTS += 1;
      away.PTS += 1;
    }
  }

  // finalize GD
  const out = Array.from(rows.values()).map((r) => ({
    ...r,
    GD: r.GF - r.GA,
  }));

  // sort: PTS desc, GD desc, GF desc, name asc
  out.sort((a, b) => {
    if (b.PTS !== a.PTS) return b.PTS - a.PTS;
    if (b.GD !== a.GD) return b.GD - a.GD;
    if (b.GF !== a.GF) return b.GF - a.GF;
    return a.teamName.localeCompare(b.teamName);
  });

  return out;
}

export function sortFixtures(matches: MatchLike[]): MatchLike[] {
  return (matches ?? [])
    .slice()
    .sort((a, b) => {
      const ta = Number(a.kickoffAt ?? a.createdAt ?? 0);
      const tb = Number(b.kickoffAt ?? b.createdAt ?? 0);
      // upcoming first (smaller timestamp)
      if (ta !== tb) return ta - tb;
      return String(a.id).localeCompare(String(b.id));
    });
}
