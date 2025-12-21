import React, { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type Role = "LEAGUE_ADMIN" | "TOURNAMENT_ADMIN" | "TEAM_REP" | "REFEREE" | "FAN";

export type CurrentUser = {
  id: string;
  name: string;
  role: Role;
  teamId?: string; // required for TEAM_REP role
};

export type League = {
  id: string;
  name: string;
  region?: string;
  plan: "Free" | "Pro";
  active: boolean;
};

export type Tournament = {
  id: string;
  leagueId: string;
  name: string;
  organizer: string;
  city: string;
  ageBand: "Open" | "O30" | "O35" | "O40" | "U21";
  status: "Open" | "Locked" | "Live" | "Completed";
  rosterLocked: boolean;
};

export type Team = {
  id: string;
  leagueId: string;
  tournamentId: string;
  name: string;
  repName: string;
};

export type Player = {
  id: string;
  leagueId: string;
  tournamentId: string;
  teamId: string;
  fullName: string;
  dob: string; // YYYY-MM-DD
  verified: boolean;
  verificationNote?: string;
  createdAt: string;
};

export type TransferLog = {
  id: string;
  leagueId: string;
  tournamentId: string;
  playerId: string;
  fromTeamId: string;
  toTeamId: string;
  by: string;
  createdAt: string;
};

export type MatchEvent =
  | { id: string; type: "GOAL"; minute: number; teamId: string; playerName: string }
  | { id: string; type: "YELLOW"; minute: number; teamId: string; playerName: string }
  | { id: string; type: "RED"; minute: number; teamId: string; playerName: string };

export type Match = {
  id: string;
  leagueId: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  status: "Upcoming" | "Live" | "FT";
  clockSeconds: number;
  durationSeconds: number;
  events: MatchEvent[];
};

export type Announcement = {
  id: string;
  leagueId: string;
  tournamentId: string;
  title: string;
  body: string;
};

export type TeamMessage = {
  id: string;
  leagueId: string;
  teamId: string;
  sender: string;
  body: string;
  createdAt: string;
};

export type Ad = {
  id: string;
  leagueId?: string;
  tournamentId?: string;
  title: string;
  subtitle?: string;
};

const uid = () => Math.random().toString(36).slice(2, 10);

// --- AGE HELPERS ---
export function calcAge(dobYYYYMMDD: string, asOf: Date = new Date()) {
  const [y, m, d] = dobYYYYMMDD.split("-").map((x) => Number(x));
  if (!y || !m || !d) return null;
  const dob = new Date(y, m - 1, d);
  if (Number.isNaN(dob.getTime())) return null;

  let age = asOf.getFullYear() - dob.getFullYear();
  const hasHadBirthday =
    asOf.getMonth() > dob.getMonth() || (asOf.getMonth() === dob.getMonth() && asOf.getDate() >= dob.getDate());
  if (!hasHadBirthday) age -= 1;
  return age;
}

export function ageBannerStyle(age: number) {
  if (age < 30) return { bg: "#FF3B30", fg: "#061A2B", label: "U30" };
  if (age <= 34) return { bg: "#F2D100", fg: "#061A2B", label: "30-34" };
  return { bg: "#34C759", fg: "#061A2B", label: "35+" };
}

export function isEligible(age: number, band: Tournament["ageBand"]) {
  if (band === "Open") return true;
  if (band === "O30") return age >= 30;
  if (band === "O35") return age >= 35;
  if (band === "O40") return age >= 40;
  if (band === "U21") return age <= 21;
  return true;
}

// --- PERMISSIONS (MVP) ---
type Permission =
  | "CREATE_TOURNAMENT"
  | "ADD_TEAM"
  | "ADD_PLAYER"
  | "VERIFY_PLAYER"
  | "TRANSFER_PLAYER"
  | "ROSTER_LOCK"
  | "VIEW_ADMIN";

function can(user: CurrentUser, league: League | undefined, perm: Permission, ctx?: { teamId?: string }) {
  const isPro = league?.plan === "Pro";

  const isAdmin = user.role === "LEAGUE_ADMIN" || user.role === "TOURNAMENT_ADMIN";
  const isTeamRep = user.role === "TEAM_REP";
  const isRef = user.role === "REFEREE";

  switch (perm) {
    case "CREATE_TOURNAMENT":
    case "ADD_TEAM":
      return isAdmin;

    case "ADD_PLAYER":
      if (isAdmin) return true;
      if (isTeamRep) return !!ctx?.teamId && ctx.teamId === user.teamId;
      return false;

    case "VERIFY_PLAYER":
      // only admins (refs could be allowed later if you want)
      return isAdmin;

    case "TRANSFER_PLAYER":
      // Pro feature + admin only (keeps rosters clean)
      return isPro && isAdmin;

    case "ROSTER_LOCK":
      // Pro feature + admin only
      return isPro && isAdmin;

    case "VIEW_ADMIN":
      return isAdmin || isRef;

    default:
      return false;
  }
}

const seed = {
  leagues: [
    { id: "l1", name: "DMV League", region: "DMV", plan: "Pro", active: true },
    { id: "l2", name: "NEVT", region: "NJ/NE", plan: "Free", active: true },
    { id: "l3", name: "NVT USA", region: "National", plan: "Pro", active: true },
  ] as League[],
  tournaments: [
    { id: "t1", leagueId: "l1", name: "DMV League Winter Cup", organizer: "DMV League", city: "Baltimore, MD", ageBand: "O35", status: "Open", rosterLocked: false },
    { id: "t2", leagueId: "l2", name: "NEVT Invitational (Free)", organizer: "NEVT", city: "Newark, NJ", ageBand: "O30", status: "Open", rosterLocked: false },
  ] as Tournament[],
  teams: [
    { id: "team1", leagueId: "l1", tournamentId: "t1", name: "Baltimore Veterans", repName: "Andy" },
    { id: "team2", leagueId: "l1", tournamentId: "t1", name: "Spartan Vets", repName: "Coach" },
  ] as Team[],
  players: [
    { id: "p1", leagueId: "l1", tournamentId: "t1", teamId: "team1", fullName: "Sample Player A", dob: "1990-06-10", verified: true, verificationNote: "ID checked", createdAt: new Date().toISOString() },
    { id: "p2", leagueId: "l1", tournamentId: "t1", teamId: "team1", fullName: "Sample Player B", dob: "1998-02-03", verified: false, createdAt: new Date().toISOString() },
  ] as Player[],
  transferLogs: [] as TransferLog[],
  matches: [
    {
      id: "m1",
      leagueId: "l1",
      tournamentId: "t1",
      homeTeamId: "team1",
      awayTeamId: "team2",
      status: "Live",
      clockSeconds: 12 * 60,
      durationSeconds: 50 * 60,
      events: [
        { id: "e1", type: "GOAL", minute: 9, teamId: "team1", playerName: "Big Boy" },
        { id: "e2", type: "YELLOW", minute: 11, teamId: "team2", playerName: "Player 7" },
      ],
    },
  ] as Match[],
  announcements: [
    { id: "a1", leagueId: "l1", tournamentId: "t1", title: "Roster Lock Reminder", body: "Ensure all players are verified before roster lock." },
  ] as Announcement[],
  messages: [
    { id: "msg1", leagueId: "l1", teamId: "team1", sender: "Team Rep", body: "Arrive 45 mins early. Bring indoor shoes.", createdAt: new Date().toISOString() },
  ] as TeamMessage[],
  ads: [
    { id: "ad1", leagueId: "l1", tournamentId: "t1", title: "Sponsor: ShopLushh", subtitle: "Event carpets  Rentals available" },
    { id: "ad2", leagueId: "l1", tournamentId: "t1", title: "Vendor: Jersey Printing", subtitle: "Same-day names & numbers" },
    { id: "ad3", leagueId: "l3", title: "NVT USA", subtitle: "Labor Day Tournament  Verified Rosters" },
  ] as Ad[],
};

type Store = {
  currentUser: CurrentUser;
  setRole: (role: Role) => void;
  setTeamForRep: (teamId?: string) => void;

  leagues: League[];
  activeLeagueId: string;
  setActiveLeague: (leagueId: string) => void;
  activeLeague: League | undefined;

  tournaments: Tournament[];
  teams: Team[];
  players: Player[];
  transferLogs: TransferLog[];

  matches: Match[];
  announcements: Announcement[];
  messages: TeamMessage[];
  ads: Ad[];

  can: (perm: Permission, ctx?: { teamId?: string }) => boolean;

  createTournament: (input: { leagueId: string; name: string; organizer: string; city: string; ageBand?: Tournament["ageBand"] }) => { ok: boolean; reason?: string };
  addTeam: (input: { leagueId: string; tournamentId: string; name: string; repName: string }) => { ok: boolean; reason?: string };

  addPlayer: (input: { leagueId: string; tournamentId: string; teamId: string; fullName: string; dob: string }) => { ok: boolean; reason?: string };

  toggleVerifyPlayer: (playerId: string) => { ok: boolean; reason?: string };
  toggleRosterLock: (tournamentId: string) => { ok: boolean; reason?: string };
  transferPlayer: (input: { playerId: string; toTeamId: string; by?: string }) => { ok: boolean; reason?: string };

  tickMatch: (matchId: string) => void;
  addEvent: (input: { matchId: string; type: MatchEvent["type"]; teamId: string; playerName: string; minute: number }) => void;

  sendTeamMessage: (input: { leagueId: string; teamId: string; sender: string; body: string }) => void;
};

const Ctx = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  // Demo user (well switch roles from Profile tab)
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: "u1",
    name: "Andy",
    role: "LEAGUE_ADMIN",
  });

  const [leagues] = useState<League[]>(seed.leagues);
  const [activeLeagueId, setActiveLeagueId] = useState<string>(seed.leagues[0]?.id ?? "l1");

  const [tournaments, setTournaments] = useState<Tournament[]>(seed.tournaments);
  const [teams, setTeams] = useState<Team[]>(seed.teams);
  const [players, setPlayers] = useState<Player[]>(seed.players);
  const [transferLogs, setTransferLogs] = useState<TransferLog[]>(seed.transferLogs);

  const [matches, setMatches] = useState<Match[]>(seed.matches);
  const [announcements] = useState<Announcement[]>(seed.announcements);
  const [messages, setMessages] = useState<TeamMessage[]>(seed.messages);
  const [ads] = useState<Ad[]>(seed.ads);

  const activeLeague = useMemo(() => leagues.find((l) => l.id === activeLeagueId), [leagues, activeLeagueId]);
  const setActiveLeague: Store["setActiveLeague"] = (leagueId) => setActiveLeagueId(leagueId);

  const setRole: Store["setRole"] = (role) => {
    setCurrentUser((u) => ({
      ...u,
      role,
      teamId: role === "TEAM_REP" ? u.teamId : undefined,
    }));
  };

  const setTeamForRep: Store["setTeamForRep"] = (teamId) => {
    setCurrentUser((u) => ({ ...u, teamId }));
  };

  const canWrap: Store["can"] = (perm, ctx) => can(currentUser, activeLeague, perm, ctx);

  const createTournament: Store["createTournament"] = ({ leagueId, name, organizer, city, ageBand }) => {
    if (!canWrap("CREATE_TOURNAMENT")) return { ok: false, reason: "Not allowed" };

    const league = leagues.find((l) => l.id === leagueId);
    const isPro = league?.plan === "Pro";

    // Free plan: limit to 1 tournament (MVP gating)
    const existing = tournaments.filter((t) => t.leagueId === leagueId).length;
    if (!isPro && existing >= 1) return { ok: false, reason: "Free plan: tournament limit reached. Upgrade to Pro." };

    const t: Tournament = {
      id: uid(),
      leagueId,
      name: name.trim() || "New Tournament",
      organizer: organizer.trim() || "Organizer",
      city: city.trim() || "City",
      ageBand: ageBand ?? "O35",
      status: "Open",
      rosterLocked: false,
    };
    setTournaments((prev) => [t, ...prev]);
    return { ok: true };
  };

  const addTeam: Store["addTeam"] = ({ leagueId, tournamentId, name, repName }) => {
    if (!canWrap("ADD_TEAM")) return { ok: false, reason: "Not allowed" };
    const team: Team = { id: uid(), leagueId, tournamentId, name: name.trim() || "New Team", repName: repName.trim() || "Rep" };
    setTeams((prev) => [team, ...prev]);
    return { ok: true };
  };

  const addPlayer: Store["addPlayer"] = ({ leagueId, tournamentId, teamId, fullName, dob }) => {
    if (!canWrap("ADD_PLAYER", { teamId })) return { ok: false, reason: "Not allowed (role/team permission)." };

    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return { ok: false, reason: "Tournament not found" };
    if (tournament.rosterLocked) return { ok: false, reason: "Roster is locked for this tournament." };

    const age = calcAge(dob);
    if (age === null) return { ok: false, reason: "Invalid DOB. Use YYYY-MM-DD." };
    if (!isEligible(age, tournament.ageBand)) return { ok: false, reason: `Not eligible for ${tournament.ageBand}. Player age: ${age}.` };

    const p: Player = {
      id: uid(),
      leagueId,
      tournamentId,
      teamId,
      fullName: fullName.trim() || "Player",
      dob,
      verified: false,
      createdAt: new Date().toISOString(),
    };
    setPlayers((prev) => [p, ...prev]);
    return { ok: true };
  };

  const toggleVerifyPlayer: Store["toggleVerifyPlayer"] = (playerId) => {
    if (!canWrap("VERIFY_PLAYER")) return { ok: false, reason: "Admins only" };
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? { ...p, verified: !p.verified, verificationNote: !p.verified ? `Verified by ${currentUser.name}` : undefined }
          : p
      )
    );
    return { ok: true };
  };

  const toggleRosterLock: Store["toggleRosterLock"] = (tournamentId) => {
    if (!canWrap("ROSTER_LOCK")) return { ok: false, reason: "Pro + Admin required" };
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === tournamentId
          ? { ...t, rosterLocked: !t.rosterLocked, status: !t.rosterLocked ? "Locked" : "Open" }
          : t
      )
    );
    return { ok: true };
  };

  const transferPlayer: Store["transferPlayer"] = ({ playerId, toTeamId, by }) => {
    if (!canWrap("TRANSFER_PLAYER")) return { ok: false, reason: "Pro + Admin required" };

    const player = players.find((p) => p.id === playerId);
    if (!player) return { ok: false, reason: "Player not found" };

    const tournament = tournaments.find((t) => t.id === player.tournamentId);
    if (!tournament) return { ok: false, reason: "Tournament not found" };
    if (tournament.rosterLocked) return { ok: false, reason: "Roster is locked. Transfers are disabled." };

    const toTeam = teams.find((t) => t.id === toTeamId);
    if (!toTeam) return { ok: false, reason: "Destination team not found" };
    if (toTeam.tournamentId !== player.tournamentId) return { ok: false, reason: "Must transfer within same tournament." };
    if (toTeam.id === player.teamId) return { ok: false, reason: "Player is already on that team." };

    const fromTeamId = player.teamId;

    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, teamId: toTeamId } : p)));

    const log: TransferLog = {
      id: uid(),
      leagueId: player.leagueId,
      tournamentId: player.tournamentId,
      playerId,
      fromTeamId,
      toTeamId,
      by: (by ?? currentUser.name ?? "Admin").trim() || "Admin",
      createdAt: new Date().toISOString(),
    };
    setTransferLogs((prev) => [log, ...prev]);

    return { ok: true };
  };

  const tickMatch: Store["tickMatch"] = (matchId) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        if (m.status !== "Live") return m;
        return { ...m, clockSeconds: Math.min(m.durationSeconds, m.clockSeconds + 1) };
      })
    );
  };

  const addEvent: Store["addEvent"] = ({ matchId, type, teamId, playerName, minute }) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        const e: MatchEvent = { id: uid(), type, teamId, playerName: playerName.trim() || "Player", minute };
        return { ...m, events: [e, ...m.events] };
      })
    );
  };

  const sendTeamMessage: Store["sendTeamMessage"] = ({ leagueId, teamId, sender, body }) => {
    const msg: TeamMessage = { id: uid(), leagueId, teamId, sender: sender.trim() || "Sender", body: body.trim(), createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, msg]);
  };

  const value = useMemo(
    () => ({
      currentUser,
      setRole,
      setTeamForRep,
      leagues,
      activeLeagueId,
      setActiveLeague,
      activeLeague,
      tournaments,
      teams,
      players,
      transferLogs,
      matches,
      announcements,
      messages,
      ads,
      can: canWrap,
      createTournament,
      addTeam,
      addPlayer,
      toggleVerifyPlayer,
      toggleRosterLock,
      transferPlayer,
      tickMatch,
      addEvent,
      sendTeamMessage,
    }),
    [currentUser, leagues, activeLeagueId, activeLeague, tournaments, teams, players, transferLogs, matches, announcements, messages, ads]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppStore must be used inside AppStoreProvider");
  return v;
}
