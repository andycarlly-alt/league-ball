import React, { createContext, ReactNode, useContext, useMemo, useState } from "react";

/** ===== Types ===== */
export type Role =
  | "LEAGUE_ADMIN"
  | "TOURNAMENT_ADMIN"
  | "TEAM_REP"
  | "REFEREE"
  | "FAN";

export type Plan = "Free" | "Pro";

export type LogoKey =
  | "nvt"
  | "spartan"
  | "lanham"
  | "elite"
  | "balisao"
  | "nova"
  | "delaware-progressives"
  | "vfc"
  | "social-boyz"
  | "bvfc"
  | "zoo-zoo"
  | "nevt"
  | "delaware-vets"
  | "nj-ndamba"
  | "landover"
  | "placeholder";

export type League = {
  id: string;
  name: string;
  plan: Plan;
};

export type Tournament = {
  id: string;
  leagueId: string;
  name: string;
  location?: string;
  fee?: number;
};

export type Team = {
  id: string;
  leagueId: string;
  tournamentId?: string;
  name: string;
  repName?: string;
  logoKey?: LogoKey;
};

export type Player = {
  id: string;
  teamId: string;
  fullName: string;
  dob?: string; // YYYY-MM-DD
  shirtNumber?: string;
  position?: string;
  verified?: boolean;
};

export type MatchStatus = "SCHEDULED" | "LIVE" | "FINAL";

export type Match = {
  id: string;
  leagueId: string;
  tournamentId?: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoffAt?: number; // epoch ms
  status: MatchStatus;
  clockSec?: number;
};

export type LiveEventType = "GOAL" | "YELLOW" | "RED";

export type LoggedEvent = {
  id: string;
  matchId: string;
  type: LiveEventType;
  teamId: string;
  playerId?: string;
  atSec: number;
  createdAt: number;
};

export type Message = {
  id: string;
  type: "TEAM";
  teamId: string;
  senderName: string;
  body: string;
  createdAt: number;
};

export type PaymentType =
  | "BUY_CARD"
  | "PAY_FINE"
  | "TOURNAMENT_REGISTRATION"
  | "SUBSCRIPTION"
  | "SPONSOR_AD_VENDOR";

export type Payment = {
  id: string;
  type: PaymentType;
  amount: number;
  currency: "USD";
  status: "PENDING" | "PAID" | "FAILED";
  createdAt: number;

  // metadata
  leagueId?: string;
  tournamentId?: string;
  teamId?: string;
  playerId?: string;
  note?: string;
};

/** ===== Helpers ===== */
function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function calcAge(dob?: string): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

/** Age banner (U30 red, 30-34 yellow, 35+ green) */
export function ageBannerStyle(age: number | null) {
  if (age === null) {
    return { bg: "rgba(255,255,255,0.10)", text: "#EAF2FF", label: "AGE ?" };
  }
  if (age < 30) return { bg: "#D7263D", text: "#FFFFFF", label: "U30" };
  if (age <= 34) return { bg: "#F2D100", text: "#061A2B", label: "30–34" };
  return { bg: "#2ECC71", text: "#061A2B", label: "35+" };
}

/** Permissions helper */
type Action =
  | "VIEW_TEAM_ROSTER"
  | "EDIT_TEAM_ROSTER"
  | "INVITE_PLAYER"
  | "REMOVE_PLAYER"
  | "CREATE_TEAM"
  | "CREATE_TOURNAMENT"
  | "LOG_LIVE_EVENT"
  | "MANAGE_PAYMENTS";

function canByRole(role: Role, action: Action) {
  if (role === "LEAGUE_ADMIN") return true;

  if (role === "TOURNAMENT_ADMIN") {
    return (
      action === "VIEW_TEAM_ROSTER" ||
      action === "CREATE_TOURNAMENT" ||
      action === "MANAGE_PAYMENTS"
    );
  }

  if (role === "TEAM_REP") {
    return (
      action === "VIEW_TEAM_ROSTER" ||
      action === "EDIT_TEAM_ROSTER" ||
      action === "INVITE_PLAYER" ||
      action === "REMOVE_PLAYER"
    );
  }

  if (role === "REFEREE") {
    return action === "VIEW_TEAM_ROSTER" || action === "LOG_LIVE_EVENT";
  }

  // FAN
  return action === "VIEW_TEAM_ROSTER";
}

/** ===== Store shape ===== */
export type AppStore = {
  // user / role / league
  currentUser: { id: string; name: string; role: Role; teamId?: string };
  setRole: (role: Role) => void;

  leagues: League[];
  activeLeagueId: string;
  setActiveLeague: (leagueId: string) => void;

  // core data
  tournaments: Tournament[];
  teams: Team[];
  players: Player[];
  matches: Match[];
  loggedEvents: LoggedEvent[];
  messages: Message[];

  // permissions
  can: (action: Action, ctx?: { teamId?: string }) => boolean;
  setTeamForRep: (teamId?: string) => void;

  // teams / roster
  createTeam: (payload: {
    leagueId: string;
    name: string;
    repName?: string;
    tournamentId?: string;
    logoKey?: LogoKey;
  }) => string;

  addPlayer: (payload: {
    teamId: string;
    fullName: string;
    dob?: string;
    shirtNumber?: string;
    position?: string;
  }) => string;

  removePlayer: (playerId: string) => void;

  invitePlayer: (payload: { teamId: string; fullName: string; note?: string }) => void;

  // live logging
  logEvent: (payload: {
    matchId: string;
    type: LiveEventType;
    teamId: string;
    playerId?: string;
    atSec: number;
  }) => void;

  setMatchStatus: (matchId: string, status: MatchStatus) => void;
  tickMatchClock: (matchId: string, nextSec: number) => void;

  // chat
  sendTeamMessage: (payload: { teamId: string; body: string; senderName?: string }) => void;

  // payments (demo stubs)
  payments: Payment[];
  createPayment: (p: Omit<Payment, "id" | "createdAt" | "status" | "currency"> & { status?: Payment["status"] }) => string;
  markPaymentPaid: (paymentId: string) => void;

  // convenience demo actions
  payFine: (payload: { leagueId: string; teamId?: string; playerId?: string; amount: number; note?: string }) => string;
  buyCard: (payload: { leagueId: string; playerId: string; amount: number; note?: string }) => string;
  registerTournament: (payload: { tournamentId: string; teamId: string; amount: number; note?: string }) => string;
  subscribeLeague: (payload: { leagueId: string; amount: number; note?: string }) => string;
  sponsorPayment: (payload: { leagueId: string; amount: number; note?: string }) => string;
};

const AppStoreContext = createContext<AppStore | null>(null);

export function useAppStore(): AppStore {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}

/** ===== Provider ===== */
export function AppStoreProvider({ children }: { children: ReactNode }) {
  // demo leagues
  const [leagues] = useState<League[]>([
    { id: "league_nvt", name: "NVT League", plan: "Pro" },
    { id: "league_demo", name: "Demo League", plan: "Free" },
  ]);

  const [activeLeagueId, setActiveLeagueId] = useState<string>("league_nvt");

  const [currentUser, setCurrentUser] = useState<AppStore["currentUser"]>({
    id: "user_1",
    name: "Demo User",
    role: "LEAGUE_ADMIN",
    teamId: undefined, // used when TEAM_REP
  });

  // tournaments
  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: "t_nvt_2026",
      leagueId: "league_nvt",
      name: "NVT Winter Classic",
      location: "Maryland",
      fee: 250,
    },
  ]);

  // teams (seed with your list + logo keys)
  const [teams, setTeams] = useState<Team[]>([
    {
      id: "team_spartan",
      leagueId: "league_nvt",
      tournamentId: "t_nvt_2026",
      name: "Spartan Veterans FC",
      repName: "Coach",
      logoKey: "spartan",
    },
    {
      id: "team_lanham",
      leagueId: "league_nvt",
      tournamentId: "t_nvt_2026",
      name: "Lanham Veteran FC",
      repName: "Coach",
      logoKey: "lanham",
    },
    {
      id: "team_elite",
      leagueId: "league_nvt",
      tournamentId: "t_nvt_2026",
      name: "Elite Veterans FC",
      repName: "Coach",
      logoKey: "elite",
    },
    {
      id: "team_balisao",
      leagueId: "league_nvt",
      tournamentId: "t_nvt_2026",
      name: "Balisao Veterans Club",
      repName: "Coach",
      logoKey: "balisao",
    },
    {
      id: "team_nova",
      leagueId: "league_nvt",
      tournamentId: "t_nvt_2026",
      name: "Nova Vets",
      repName: "Coach",
      logoKey: "nova",
    },
    {
      id: "team_de_prog",
      leagueId: "league_nvt",
      tournamentId: "t_nvt_2026",
      name: "Delaware Progressives",
      repName: "Coach",
      logoKey: "delaware-progressives",
    },
    {
      id: "team_vfc",
      leagueId: "league_nvt",
      tournamentId: "t_nvt_2026",
      name: "Veterans Football Club",
      repName: "Coach",
      logoKey: "vfc",
    },
    {
      id: "team_social",
      leagueId: "league_nvt",
      tournamentId: "t_nvt_2026",
      name: "Social Boyz",
      repName: "Coach",
      logoKey: "social-boyz",
    },
    {
      id: "team_bvfc",
      leagueId: "league_nvt",
      tournamentId: "t_nvt_2026",
      name: "Baltimore Veteran FC",
      repName: "Andy",
      logoKey: "bvfc",
    },
    {
      id: "team_zoo",
      leagueId: "league_nvt",
      tournamentId: "t_nvt_2026",
      name: "Zoo Zoo",
      repName: "Coach",
      logoKey: "zoo-zoo",
    },
    {
      id: "team_nevt",
      leagueId: "league_nvt",
      tournamentId: "t_nvt_2026",
      name: "New England Veterans FC",
      repName: "Coach",
      logoKey: "nevt",
    },
    {
      id: "team_de_vets",
      leagueId: "league_nvt",
      tournamentId: "t_nvt_2026",
      name: "Delaware Veterans Club",
      repName: "Coach",
      logoKey: "delaware-vets",
    },
    {
      id: "team_nj_ndamba",
      leagueId: "league_nvt",
      tournamentId: "t_nvt_2026",
      name: "NJ Ndamba Veterans FC",
      repName: "Coach",
      logoKey: "nj-ndamba",
    },
    {
      id: "team_landover",
      leagueId: "league_nvt",
      tournamentId: "t_nvt_2026",
      name: "Landover FC",
      repName: "Coach",
      logoKey: "landover",
    },

    // Example team in demo/free league
    {
      id: "team_demo_1",
      leagueId: "league_demo",
      name: "Demo FC",
      repName: "Rep",
      logoKey: "placeholder",
    },
  ]);

  const [players, setPlayers] = useState<Player[]>([
    // seed a few demo players on BVFC so age banners show
    { id: "p1", teamId: "team_bvfc", fullName: "Player One", dob: "1990-01-01", shirtNumber: "9", position: "ST", verified: true },
    { id: "p2", teamId: "team_bvfc", fullName: "Player Two", dob: "1998-05-10", shirtNumber: "7", position: "RW", verified: false },
    { id: "p3", teamId: "team_bvfc", fullName: "Player Three", dob: "1986-03-22", shirtNumber: "4", position: "CB", verified: true },
  ]);

  const [matches, setMatches] = useState<Match[]>([
    {
      id: "m1",
      leagueId: "league_nvt",
      tournamentId: "t_nvt_2026",
      homeTeamId: "team_bvfc",
      awayTeamId: "team_spartan",
      status: "SCHEDULED",
      kickoffAt: Date.now() + 1000 * 60 * 60 * 24,
      clockSec: 0,
    },
    {
      id: "m2",
      leagueId: "league_nvt",
      tournamentId: "t_nvt_2026",
      homeTeamId: "team_lanham",
      awayTeamId: "team_elite",
      status: "LIVE",
      kickoffAt: Date.now() - 1000 * 60 * 10,
      clockSec: 10 * 60,
    },
  ]);

  const [loggedEvents, setLoggedEvents] = useState<LoggedEvent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  /** ===== Actions ===== */
  const setRole = (role: Role) => {
    setCurrentUser((u) => ({ ...u, role }));
  };

  const setActiveLeague = (leagueId: string) => {
    setActiveLeagueId(leagueId);
  };

  const setTeamForRep = (teamId?: string) => {
    setCurrentUser((u) => ({ ...u, teamId }));
  };

  const can = (action: Action, ctx?: { teamId?: string }) => {
    const allowed = canByRole(currentUser.role, action);
    if (!allowed) return false;

    // If TEAM_REP is trying to edit a roster, lock it to their team
    if (currentUser.role === "TEAM_REP") {
      const t = ctx?.teamId;
      if (
        action === "EDIT_TEAM_ROSTER" ||
        action === "INVITE_PLAYER" ||
        action === "REMOVE_PLAYER"
      ) {
        if (!t) return false;
        return currentUser.teamId === t;
      }
    }

    return true;
  };

  const createTeam: AppStore["createTeam"] = (payload) => {
    if (!can("CREATE_TEAM")) return "";
    const id = uid("team");
    const next: Team = {
      id,
      leagueId: payload.leagueId,
      name: payload.name,
      repName: payload.repName,
      tournamentId: payload.tournamentId,
      logoKey: payload.logoKey ?? "placeholder",
    };
    setTeams((prev) => [next, ...prev]);
    return id;
  };

  const addPlayer: AppStore["addPlayer"] = (payload) => {
    if (!can("EDIT_TEAM_ROSTER", { teamId: payload.teamId })) return "";
    const id = uid("player");
    const next: Player = {
      id,
      teamId: payload.teamId,
      fullName: payload.fullName,
      dob: payload.dob,
      shirtNumber: payload.shirtNumber,
      position: payload.position,
      verified: false,
    };
    setPlayers((p) => [next, ...p]);
    return id;
  };

  const removePlayer: AppStore["removePlayer"] = (playerId) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    if (!can("REMOVE_PLAYER", { teamId: player.teamId })) return;
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
  };

  const invitePlayer: AppStore["invitePlayer"] = ({ teamId, fullName, note }) => {
    if (!can("INVITE_PLAYER", { teamId })) return;
    // demo: post as a team message so stakeholders can see “invite activity”
    setMessages((prev) => [
      ...prev,
      {
        id: uid("msg"),
        type: "TEAM",
        teamId,
        senderName: currentUser.name,
        body: `INVITE SENT: ${fullName}${note ? ` (${note})` : ""}`,
        createdAt: Date.now(),
      },
    ]);
  };

  const logEvent: AppStore["logEvent"] = ({ matchId, type, teamId, playerId, atSec }) => {
    if (!can("LOG_LIVE_EVENT")) return;
    const e: LoggedEvent = {
      id: uid("evt"),
      matchId,
      type,
      teamId,
      playerId,
      atSec,
      createdAt: Date.now(),
    };
    setLoggedEvents((prev) => [e, ...prev]);
  };

  const setMatchStatus: AppStore["setMatchStatus"] = (matchId, status) => {
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status } : m)));
  };

  const tickMatchClock: AppStore["tickMatchClock"] = (matchId, nextSec) => {
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, clockSec: nextSec } : m)));
  };

  const sendTeamMessage: AppStore["sendTeamMessage"] = ({ teamId, body, senderName }) => {
    const text = String(body ?? "").trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: uid("msg"),
        type: "TEAM",
        teamId,
        senderName: senderName ?? currentUser.name,
        body: text,
        createdAt: Date.now(),
      },
    ]);
  };

  /** Payments (demo stubs) */
  const createPayment: AppStore["createPayment"] = (p) => {
    const id = uid("pay");
    const next: Payment = {
      id,
      type: p.type,
      amount: p.amount,
      currency: "USD",
      status: p.status ?? "PENDING",
      createdAt: Date.now(),
      leagueId: p.leagueId,
      tournamentId: p.tournamentId,
      teamId: p.teamId,
      playerId: p.playerId,
      note: p.note,
    };
    setPayments((prev) => [next, ...prev]);
    return id;
  };

  const markPaymentPaid: AppStore["markPaymentPaid"] = (paymentId) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: "PAID" } : p))
    );
  };

  const payFine: AppStore["payFine"] = ({ leagueId, teamId, playerId, amount, note }) => {
    return createPayment({
      type: "PAY_FINE",
      leagueId,
      teamId,
      playerId,
      amount,
      note,
      status: "PAID",
    });
  };

  const buyCard: AppStore["buyCard"] = ({ leagueId, playerId, amount, note }) => {
    return createPayment({
      type: "BUY_CARD",
      leagueId,
      playerId,
      amount,
      note,
      status: "PAID",
    });
  };

  const registerTournament: AppStore["registerTournament"] = ({ tournamentId, teamId, amount, note }) => {
    const t = tournaments.find((x) => x.id === tournamentId);
    return createPayment({
      type: "TOURNAMENT_REGISTRATION",
      leagueId: t?.leagueId,
      tournamentId,
      teamId,
      amount,
      note,
      status: "PAID",
    });
  };

  const subscribeLeague: AppStore["subscribeLeague"] = ({ leagueId, amount, note }) => {
    return createPayment({
      type: "SUBSCRIPTION",
      leagueId,
      amount,
      note,
      status: "PAID",
    });
  };

  const sponsorPayment: AppStore["sponsorPayment"] = ({ leagueId, amount, note }) => {
    return createPayment({
      type: "SPONSOR_AD_VENDOR",
      leagueId,
      amount,
      note,
      status: "PAID",
    });
  };

  const store: AppStore = useMemo(
    () => ({
      currentUser,
      setRole,
      leagues,
      activeLeagueId,
      setActiveLeague,

      tournaments,
      teams,
      players,
      matches,
      loggedEvents,
      messages,

      can,
      setTeamForRep,

      createTeam,
      addPlayer,
      removePlayer,
      invitePlayer,

      logEvent,
      setMatchStatus,
      tickMatchClock,

      sendTeamMessage,

      payments,
      createPayment,
      markPaymentPaid,
      payFine,
      buyCard,
      registerTournament,
      subscribeLeague,
      sponsorPayment,
    }),
    [
      currentUser,
      leagues,
      activeLeagueId,
      tournaments,
      teams,
      players,
      matches,
      loggedEvents,
      messages,
      payments,
    ]
  );

  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}
