// src/state/AppStore.tsx
import React, { createContext, ReactNode, useContext, useMemo, useState } from "react";

export type Role = "LEAGUE_ADMIN" | "TOURNAMENT_ADMIN" | "TEAM_REP" | "REFEREE" | "FAN";

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
  seasonLabel?: string;
};

export type Team = {
  id: string;
  leagueId: string;
  tournamentId?: string | null;
  name: string;
  repName?: string;
  logoKey?: LogoKey;
};

export type Player = {
  id: string;
  teamId: string;
  fullName: string;
  shirtNumber?: string;
  position?: string;
  dob?: string; // ISO string
  createdAt?: number;
};

export type MatchStatus = "SCHEDULED" | "LIVE" | "FINAL";

export type Match = {
  id: string;
  leagueId: string;
  tournamentId?: string | null;
  homeTeamId: string;
  awayTeamId: string;
  kickoffAt?: number; // epoch ms
  status: MatchStatus;
};

export type LoggedEventType = "GOAL" | "YELLOW" | "RED";

export type LoggedEvent = {
  id: string;
  matchId: string;
  type: LoggedEventType;
  teamId: string;
  playerId?: string | null;
  minute?: number | null;
  createdAt: number;
};

export type Message = {
  id: string;
  type: "TEAM";
  teamId: string;
  body: string;
  senderName: string;
  createdAt: number;
};

export type SubscriptionStatus = "FREE" | "PRO";

export type User = {
  id: string;
  name: string;
  role: Role;
  subscription: SubscriptionStatus;
  teamId?: string | null; // for TEAM_REP / players later
};

export type PaymentType =
  | "TOURNAMENT_REGISTRATION"
  | "SUBSCRIPTION"
  | "CARD_FEE"
  | "FINE_PAYMENT"
  | "SPONSOR"
  | "VENDOR_AD";

export type Payment = {
  id: string;
  type: PaymentType;
  amount: number;
  currency: "USD";
  createdAt: number;
  status: "PENDING" | "PAID" | "FAILED";
  meta?: Record<string, any>;
};

type CreateTournamentInput = {
  name: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  registrationFee?: number;
};

type CreateTeamInput = {
  name: string;
  repName?: string;
  logoKey?: LogoKey;
  tournamentId?: string | null;
};

type SendTeamMessageInput = {
  teamId: string;
  body: string;
  senderName?: string;
};

type AddPlayerInput = {
  teamId: string;
  fullName: string;
  shirtNumber?: string;
  position?: string;
  dob?: string;
};

type InvitePlayerInput = {
  teamId: string;
  emailOrPhone: string;
};

type AppStore = {
  // session / auth-ish
  currentUser: User;
  setRole: (role: Role) => void;
  setSubscription: (s: SubscriptionStatus) => void;
  can: (permission:
    | "MANAGE_TEAMS"
    | "MANAGE_TOURNAMENTS"
    | "MANAGE_MATCH"
    | "VIEW_TEAM_ROSTER"
    | "INVITE_PLAYER"
    | "REMOVE_PLAYER"
    | "PAYMENTS"
  ) => boolean;

  // data
  leagues: League[];
  activeLeagueId: string;
  setActiveLeagueId: (id: string) => void;

  tournaments: any[]; // keep loose for now to match screens
  teams: Team[];
  players: Player[];
  matches: Match[];
  loggedEvents: LoggedEvent[];
  messages: Message[];
  payments: Payment[];

  // selectors / helpers
  getTeamsForTournament: (tournamentId: string) => Team[];
  getPlayersForTeam: (teamId: string) => Player[];
  getEventsForMatch: (matchId: string) => LoggedEvent[];

  // mutations
  createTournament: (input: CreateTournamentInput) => string;
  createTeam: (input: CreateTeamInput) => string;
  addPlayer: (input: AddPlayerInput) => string;
  removePlayer: (playerId: string) => void;
  invitePlayer: (input: InvitePlayerInput) => void;

  sendTeamMessage: (input: SendTeamMessageInput) => void;

  logEvent: (input: {
    matchId: string;
    type: LoggedEventType;
    teamId: string;
    playerId?: string | null;
    minute?: number | null;
  }) => void;

  // payments (mock)
  createPaymentIntent: (input: {
    type: PaymentType;
    amount: number;
    meta?: Record<string, any>;
  }) => string;
  markPaymentPaid: (paymentId: string) => void;
};

const AppStoreContext = createContext<AppStore | null>(null);

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

// --- age helpers (used by roster banner feature) ---
export function calcAge(dobIso?: string) {
  if (!dobIso) return 0;
  const dob = new Date(dobIso);
  if (isNaN(dob.getTime())) return 0;

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return Math.max(0, age);
}

export function ageBannerStyle(age: number) {
  // under 30 => red, 30-34 => yellow, 35+ => green
  if (age > 0 && age < 30) return { backgroundColor: "#D33B3B" };
  if (age >= 30 && age <= 34) return { backgroundColor: "#F2D100" };
  return { backgroundColor: "#1FBF75" };
}

// Seed: NVT league + your teams
function buildSeed() {
  const leagueId = "league_nvt_2026";
  const tourId = "tour_nvt_demo";

  const leagues: League[] = [
    { id: leagueId, name: "NVT League", seasonLabel: "Demo Season" },
  ];

  const tournaments = [
    {
      id: tourId,
      leagueId,
      name: "NVT Demo Tournament",
      location: "DMV",
      registrationFee: 150,
      createdAt: Date.now(),
    },
  ];

  const teams: Team[] = [
    { id: "team_spartan", leagueId, tournamentId: tourId, name: "Spartan Veterans FC", logoKey: "spartan", repName: "Team Rep" },
    { id: "team_lanham", leagueId, tournamentId: tourId, name: "Lanham Veteran FC", logoKey: "lanham", repName: "Team Rep" },
    { id: "team_elite", leagueId, tournamentId: tourId, name: "Elite Veterans FC", logoKey: "elite", repName: "Team Rep" },
    { id: "team_balisao", leagueId, tournamentId: tourId, name: "Balisao Veterans Club", logoKey: "balisao", repName: "Team Rep" },
    { id: "team_nova", leagueId, tournamentId: tourId, name: "Nova Vets", logoKey: "nova", repName: "Team Rep" },
    { id: "team_dp", leagueId, tournamentId: tourId, name: "Delaware Progressives", logoKey: "delaware-progressives", repName: "Team Rep" },
    { id: "team_vfc", leagueId, tournamentId: tourId, name: "Veterans Football Club", logoKey: "vfc", repName: "Team Rep" },
    { id: "team_social", leagueId, tournamentId: tourId, name: "Social Boyz", logoKey: "social-boyz", repName: "Team Rep" },
    { id: "team_bvfc", leagueId, tournamentId: tourId, name: "Baltimore Veteran FC", logoKey: "bvfc", repName: "Andy (Manager)" },
    { id: "team_zoo", leagueId, tournamentId: tourId, name: "Zoo Zoo", logoKey: "zoo-zoo", repName: "Team Rep" },
    { id: "team_nevt", leagueId, tournamentId: tourId, name: "New England Veterans FC", logoKey: "nevt", repName: "Team Rep" },
    { id: "team_delv", leagueId, tournamentId: tourId, name: "Delaware Veterans Club", logoKey: "delaware-vets", repName: "Team Rep" },
    { id: "team_njnd", leagueId, tournamentId: tourId, name: "NJ Ndamba Veterans FC", logoKey: "nj-ndamba", repName: "Team Rep" },
    { id: "team_landover", leagueId, tournamentId: tourId, name: "Landover FC", logoKey: "landover", repName: "Team Rep" },
  ];

  const matches: Match[] = [
    {
      id: "match_1",
      leagueId,
      tournamentId: tourId,
      homeTeamId: "team_bvfc",
      awayTeamId: "team_spartan",
      kickoffAt: Date.now() + 60 * 60 * 1000,
      status: "SCHEDULED",
    },
    {
      id: "match_2",
      leagueId,
      tournamentId: tourId,
      homeTeamId: "team_lanham",
      awayTeamId: "team_elite",
      kickoffAt: Date.now() + 2 * 60 * 60 * 1000,
      status: "SCHEDULED",
    },
  ];

  return { leagues, tournaments, teams, matches, leagueId, tourId };
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const seed = useMemo(() => buildSeed(), []);

  const [leagues] = useState<League[]>(seed.leagues);
  const [activeLeagueId, setActiveLeagueId] = useState<string>(seed.leagueId);

  const [tournaments, setTournaments] = useState<any[]>(seed.tournaments);
  const [teams, setTeams] = useState<Team[]>(seed.teams);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>(seed.matches);
  const [loggedEvents, setLoggedEvents] = useState<LoggedEvent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [currentUser, setCurrentUser] = useState<User>({
    id: "user_demo",
    name: "Demo User",
    role: "LEAGUE_ADMIN",
    subscription: "FREE",
    teamId: "team_bvfc",
  });

  const setRole = (role: Role) => {
    setCurrentUser((u) => ({ ...u, role }));
  };

  const setSubscription = (s: SubscriptionStatus) => {
    setCurrentUser((u) => ({ ...u, subscription: s }));
  };

  const can: AppStore["can"] = (permission) => {
    const role = currentUser.role;

    // Subscription gates (demo): PRO required for “PAYMENTS” and “MANAGE_TOURNAMENTS”
    if ((permission === "PAYMENTS" || permission === "MANAGE_TOURNAMENTS") && currentUser.subscription !== "PRO") {
      // still allow admins during demo if you want; keep strict for realism:
      if (role !== "LEAGUE_ADMIN") return false;
    }

    switch (permission) {
      case "MANAGE_TEAMS":
        return role === "LEAGUE_ADMIN" || role === "TOURNAMENT_ADMIN" || role === "TEAM_REP";
      case "MANAGE_TOURNAMENTS":
        return role === "LEAGUE_ADMIN" || role === "TOURNAMENT_ADMIN";
      case "MANAGE_MATCH":
        return role === "LEAGUE_ADMIN" || role === "TOURNAMENT_ADMIN" || role === "REFEREE";
      case "VIEW_TEAM_ROSTER":
        return true; // everybody can view, later restrict
      case "INVITE_PLAYER":
      case "REMOVE_PLAYER":
        return role === "LEAGUE_ADMIN" || role === "TOURNAMENT_ADMIN" || role === "TEAM_REP";
      case "PAYMENTS":
        return true;
      default:
        return false;
    }
  };

  const getTeamsForTournament = (tournamentId: string) => {
    const tId = String(tournamentId ?? "");
    return (teams ?? []).filter((t) => String(t.tournamentId ?? "") === tId);
  };

  const getPlayersForTeam = (teamId: string) => {
    const id = String(teamId ?? "");
    return (players ?? []).filter((p) => String(p.teamId) === id);
  };

  const getEventsForMatch = (matchId: string) => {
    const id = String(matchId ?? "");
    return (loggedEvents ?? []).filter((e) => String(e.matchId) === id);
  };

  const createTournament = (input: CreateTournamentInput) => {
    const name = String(input?.name ?? "").trim();
    const id = uid("tour");
    if (!name) return id; // don’t crash, just create with placeholder
    setTournaments((prev) => [
      ...(prev ?? []),
      {
        id,
        leagueId: activeLeagueId,
        name,
        location: input.location ?? "",
        startDate: input.startDate ?? "",
        endDate: input.endDate ?? "",
        registrationFee: Number(input.registrationFee ?? 0),
        createdAt: Date.now(),
      },
    ]);
    return id;
  };

  const createTeam = (input: CreateTeamInput) => {
    const name = String(input?.name ?? "").trim();
    const id = uid("team");
    if (!name) return id;

    setTeams((prev) => [
      ...(prev ?? []),
      {
        id,
        leagueId: activeLeagueId,
        tournamentId: input.tournamentId ?? null,
        name,
        repName: input.repName ?? "",
        logoKey: input.logoKey ?? "placeholder",
      },
    ]);
    return id;
  };

  const addPlayer = (input: AddPlayerInput) => {
    const fullName = String(input?.fullName ?? "").trim();
    const id = uid("player");
    if (!fullName) return id;

    setPlayers((prev) => [
      ...(prev ?? []),
      {
        id,
        teamId: String(input.teamId),
        fullName,
        shirtNumber: input.shirtNumber ?? "",
        position: input.position ?? "",
        dob: input.dob ?? "",
        createdAt: Date.now(),
      },
    ]);

    return id;
  };

  const removePlayer = (playerId: string) => {
    const id = String(playerId ?? "");
    setPlayers((prev) => (prev ?? []).filter((p) => String(p.id) !== id));
  };

  const invitePlayer = (input: InvitePlayerInput) => {
    // Demo-only placeholder (later: email/SMS invite)
    // keep it non-crashing and visible via messages thread
    const contact = String(input.emailOrPhone ?? "").trim();
    if (!contact) return;
    const teamId = String(input.teamId ?? "");
    setMessages((prev) => [
      ...(prev ?? []),
      {
        id: uid("msg"),
        type: "TEAM",
        teamId,
        senderName: currentUser.name,
        body: `Invite sent to ${contact} (demo).`,
        createdAt: Date.now(),
      },
    ]);
  };

  const sendTeamMessage = (input: SendTeamMessageInput) => {
    const teamId = String(input?.teamId ?? "");
    const body = String(input?.body ?? "").trim();
    if (!teamId || !body) return;

    setMessages((prev) => [
      ...(prev ?? []),
      {
        id: uid("msg"),
        type: "TEAM",
        teamId,
        body,
        senderName: String(input.senderName ?? currentUser.name ?? "User"),
        createdAt: Date.now(),
      },
    ]);
  };

  const logEvent: AppStore["logEvent"] = ({ matchId, type, teamId, playerId, minute }) => {
    const mId = String(matchId ?? "");
    const tId = String(teamId ?? "");
    if (!mId || !tId) return;

    setLoggedEvents((prev) => [
      ...(prev ?? []),
      {
        id: uid("evt"),
        matchId: mId,
        type,
        teamId: tId,
        playerId: playerId ? String(playerId) : null,
        minute: typeof minute === "number" ? minute : null,
        createdAt: Date.now(),
      },
    ]);

    // If match is scheduled, push it to LIVE when first event is logged (nice for demo)
    setMatches((prev) =>
      (prev ?? []).map((m) => (m.id === mId && m.status === "SCHEDULED" ? { ...m, status: "LIVE" } : m))
    );
  };

  const createPaymentIntent: AppStore["createPaymentIntent"] = ({ type, amount, meta }) => {
    const id = uid("pay");
    const safeAmount = Number(amount ?? 0);

    setPayments((prev) => [
      ...(prev ?? []),
      {
        id,
        type,
        amount: safeAmount,
        currency: "USD",
        status: "PENDING",
        createdAt: Date.now(),
        meta: meta ?? {},
      },
    ]);

    // Demo behavior: instantly mark as PAID (later integrate Stripe)
    setTimeout(() => {
      setPayments((prev) => (prev ?? []).map((p) => (p.id === id ? { ...p, status: "PAID" } : p)));
    }, 600);

    return id;
  };

  const markPaymentPaid = (paymentId: string) => {
    const id = String(paymentId ?? "");
    setPayments((prev) => (prev ?? []).map((p) => (p.id === id ? { ...p, status: "PAID" } : p)));
  };

  const value: AppStore = {
    currentUser,
    setRole,
    setSubscription,
    can,

    leagues,
    activeLeagueId,
    setActiveLeagueId,

    tournaments,
    teams,
    players,
    matches,
    loggedEvents,
    messages,
    payments,

    getTeamsForTournament,
    getPlayersForTeam,
    getEventsForMatch,

    createTournament,
    createTeam,
    addPlayer,
    removePlayer,
    invitePlayer,

    sendTeamMessage,
    logEvent,

    createPaymentIntent,
    markPaymentPaid,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
