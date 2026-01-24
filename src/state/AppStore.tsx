// src/state/AppStore.tsx - UPDATED WITH createMatch FUNCTION
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
  plan?: "Free" | "Pro";
};

export type Team = {
  id: string;
  leagueId: string;
  tournamentId?: string | null;
  name: string;
  repName?: string;
  logoKey?: LogoKey;
  playerCount?: number;
};

export type Player = {
  id: string;
  teamId: string;
  tournamentId?: string | null;
  fullName: string;
  shirtNumber?: string;
  position?: string;
  dob?: string;
  verified?: boolean;
  verificationNote?: string;
  createdAt?: number;
};

export type MatchStatus = "SCHEDULED" | "LIVE" | "FINAL";

// UPDATED: Enhanced Match type
export type Match = {
  id: string;
  leagueId: string;
  tournamentId?: string | null;
  homeTeamId: string;
  awayTeamId: string;
  kickoffAt?: number;
  status: MatchStatus;
  field?: string;
  date?: string;
  time?: string;
  homeScore?: number;
  awayScore?: number;
  clockSec?: number;
  durationSec?: number;
  isLive?: boolean;
  createdAt?: number;
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
  teamId?: string | null;
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

export type PendingPayment = {
  id: string;
  type: PaymentType | "CARD_FINE" | "BETTING_DEPOSIT" | "DIGITAL_ID";
  amount: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  createdAt: number;
  dueDate?: number;
  teamId?: string;
  teamName?: string;
  playerId?: string;
  playerName?: string;
  tournamentId?: string;
  tournamentName?: string;
  cardType?: "YELLOW" | "RED";
  vendorPackage?: string;
  companyName?: string;
  userId?: string;
};

export type Bet = {
  id: string;
  userId: string;
  userName?: string;
  matchId: string;
  amount: number;
  pick: string;
  odds?: number;
  placedAt: number;
};

export type BettingPool = {
  matchId: string;
  totalAmount: number;
  bets: Bet[];
};

export type TransferLog = {
  id: string;
  tournamentId: string;
  playerId: string;
  fromTeamId: string;
  toTeamId: string;
  by: string;
  createdAt: number;
};

export type Announcement = {
  id: string;
  leagueId: string;
  title: string;
  body?: string;
  createdAt: number;
};

export type SponsorAd = {
  id: string;
  kind: "SPONSOR" | "AD";
  name: string;
  tagline: string;
};

type CreateTournamentInput = {
  leagueId?: string;
  name: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  registrationFee?: number;
  ageRule?: string;
  ageRuleLabel?: string;
  status?: string;
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
  leagueId?: string;
  tournamentId?: string | null;
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
    | "ADD_PLAYER"
    | "VERIFY_PLAYER"
    | "TRANSFER_PLAYER"
    | "VIEW_ADMIN",
    context?: { teamId?: string }
  ) => boolean;

  leagues: League[];
  activeLeagueId: string;
  activeLeague?: League | null;
  setActiveLeagueId: (id: string) => void;
  setActiveLeague: (id: string) => void;

  tournaments: any[];
  teams: Team[];
  players: Player[];
  matches: Match[];
  loggedEvents: LoggedEvent[];
  matchEvents: LoggedEvent[];
  messages: Message[];
  payments: Payment[];
  announcements: Announcement[];
  transferLogs: TransferLog[];
  sponsorsAds: SponsorAd[];

  pendingPayments: PendingPayment[];
  addPendingPayment: (payment: PendingPayment) => void;
  markPaymentPaid: (paymentId: string) => void;
  getPendingPayments: () => PendingPayment[];

  walletBalance: number;
  addToWallet: (amountCents: number) => void;
  deductFromWallet: (amountCents: number) => void;

  bettingPools: BettingPool[];
  addBetToPool: (bet: Bet) => void;
  getPoolForMatch: (matchId: string) => BettingPool | undefined;

  getTeamsForTournament: (tournamentId: string) => Team[];
  getPlayersForTeam: (teamId: string) => Player[];
  getEventsForMatch: (matchId: string) => LoggedEvent[];

  createTournament: (input: CreateTournamentInput) => { id: string };
  createTeam: (input: CreateTeamInput) => string;
  // NEW: createMatch function
  createMatch: (matchData: {
    leagueId: string;
    tournamentId: string;
    homeTeamId: string;
    awayTeamId: string;
    kickoffAt: number;
    status: MatchStatus;
    field?: string;
    date?: string;
    time?: string;
  }) => string;
  addPlayer: (input: AddPlayerInput) => { ok: boolean; reason?: string; id?: string };
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

  createPaymentIntent: (input: {
    type: PaymentType;
    amount: number;
    meta?: Record<string, any>;
  }) => string;
  
  startCheckout: (plan: string) => Promise<{ ok: boolean; reason?: string }>;
  restorePurchases: () => Promise<{ ok: boolean; reason?: string }>;

  setTeamForRep: (teamId: string) => void;

  toggleVerifyPlayer: (playerId: string) => { ok: boolean; reason?: string };

  toggleRosterLock: (tournamentId: string) => void;
  registerTeamForTournament: (input: {
    tournamentId: string;
    teamName: string;
    repName: string;
    repPhone: string;
  }) => void;

  transferPlayer: (input: {
    playerId: string;
    toTeamId: string;
    by: string;
  }) => { ok: boolean; reason?: string };

  setMatchLive: (matchId: string, isLive: boolean) => void;
  tickMatch: (matchId: string, seconds: number) => void;
  resetMatchClock: (matchId: string) => void;
  logMatchEvent: (input: {
    matchId: string;
    type: LoggedEventType;
    teamId: string;
  }) => void;
  placeBet: (input: {
    matchId: string;
    pick: string;
    wagerCents: number;
    odds: number;
  }) => void;
};

const AppStoreContext = createContext<AppStore | null>(null);

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

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
  if (age > 0 && age < 30) return { bg: "#D33B3B", fg: "#FFFFFF", label: "Under 30" };
  if (age >= 30 && age <= 34) return { bg: "#F2D100", fg: "#061A2B", label: "30-34" };
  return { bg: "#1FBF75", fg: "#061A2B", label: "35+" };
}

function buildSeed() {
  const leagueId = "league_nvt_2026";
  const tourId = "tour_nvt_demo";

  const leagues: League[] = [
    { id: leagueId, name: "NVT League", seasonLabel: "Demo Season", plan: "Free" },
  ];

  const tournaments = [
    {
      id: tourId,
      leagueId,
      name: "NVT Demo Tournament",
      location: "DMV",
      registrationFee: 15000,
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

  // UPDATED: Enhanced matches with all fields
  const matches: Match[] = [
    {
      id: "match_1",
      leagueId,
      tournamentId: tourId,
      homeTeamId: "team_bvfc",
      awayTeamId: "team_spartan",
      kickoffAt: Date.now() + 60 * 60 * 1000,
      status: "SCHEDULED",
      field: "Field 1",
      date: new Date(Date.now() + 60 * 60 * 1000).toLocaleDateString(),
      time: "3:00 PM",
      clockSec: 0,
      durationSec: 90 * 60,
      isLive: false,
      homeScore: 0,
      awayScore: 0,
      createdAt: Date.now(),
    },
    {
      id: "match_2",
      leagueId,
      tournamentId: tourId,
      homeTeamId: "team_lanham",
      awayTeamId: "team_elite",
      kickoffAt: Date.now() + 2 * 60 * 60 * 1000,
      status: "SCHEDULED",
      field: "Field 2",
      date: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleDateString(),
      time: "5:00 PM",
      clockSec: 0,
      durationSec: 90 * 60,
      isLive: false,
      homeScore: 0,
      awayScore: 0,
      createdAt: Date.now(),
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [transferLogs, setTransferLogs] = useState<TransferLog[]>([]);

  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [walletBalance, setWalletBalance] = useState(2500);
  const [bettingPools, setBettingPools] = useState<BettingPool[]>([]);

  const sponsorsAds: SponsorAd[] = [
    { id: "sp1", kind: "SPONSOR", name: "Jersey Printing Co", tagline: "Same-day names & numbers" },
    { id: "sp2", kind: "AD", name: "Local Sports Bar", tagline: "Watch all NVT matches here!" },
    { id: "sp3", kind: "SPONSOR", name: "Athletic Gear Shop", tagline: "20% off for NVT players" },
  ];

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

  const activeLeague = useMemo(() => {
    return leagues.find((l) => l.id === activeLeagueId) || null;
  }, [leagues, activeLeagueId]);

  const setActiveLeague = (id: string) => {
    setActiveLeagueId(id);
  };

  const setTeamForRep = (teamId: string) => {
    setCurrentUser((u) => ({ ...u, teamId }));
  };

  const can: AppStore["can"] = (permission, context?) => {
    const role = currentUser.role;
    const isPro = activeLeague?.plan === "Pro";

    if ((permission === "PAYMENTS" || permission === "MANAGE_TOURNAMENTS") && currentUser.subscription !== "PRO") {
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
        return true;
      case "INVITE_PLAYER":
      case "REMOVE_PLAYER":
        return role === "LEAGUE_ADMIN" || role === "TOURNAMENT_ADMIN" || role === "TEAM_REP";
      case "ADD_PLAYER":
        if (role === "LEAGUE_ADMIN" || role === "TOURNAMENT_ADMIN") return true;
        if (role === "TEAM_REP" && context?.teamId) {
          return currentUser.teamId === context.teamId;
        }
        return false;
      case "VERIFY_PLAYER":
        return role === "LEAGUE_ADMIN" || role === "TOURNAMENT_ADMIN";
      case "TRANSFER_PLAYER":
        return isPro && (role === "LEAGUE_ADMIN" || role === "TOURNAMENT_ADMIN");
      case "VIEW_ADMIN":
        return role === "LEAGUE_ADMIN" || role === "TOURNAMENT_ADMIN";
      case "PAYMENTS":
        return true;
      default:
        return false;
    }
  };

  const addPendingPayment = (payment: PendingPayment) => {
    setPendingPayments((prev) => [...prev, payment]);
  };

  const markPaymentPaid = (paymentId: string) => {
    setPendingPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: "PAID" as const } : p))
    );
    setPayments((prev) => (prev ?? []).map((p) => (p.id === paymentId ? { ...p, status: "PAID" } : p)));
  };

  const getPendingPayments = () => {
    return pendingPayments.filter((p) => p.status === "PENDING");
  };

  const addToWallet = (amountCents: number) => {
    setWalletBalance((prev) => prev + amountCents);
  };

  const deductFromWallet = (amountCents: number) => {
    setWalletBalance((prev) => Math.max(0, prev - amountCents));
  };

  const addBetToPool = (bet: Bet) => {
    const poolId = bet.matchId;
    setBettingPools((prev) => {
      const pool = prev.find((p) => p.matchId === poolId);
      if (pool) {
        return prev.map((p) =>
          p.matchId === poolId
            ? { ...p, totalAmount: p.totalAmount + bet.amount, bets: [...p.bets, bet] }
            : p
        );
      } else {
        return [...prev, { matchId: poolId, totalAmount: bet.amount, bets: [bet] }];
      }
    });
  };

  const getPoolForMatch = (matchId: string) => {
    return bettingPools.find((p) => p.matchId === matchId);
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
    if (!name) return { id };
    
    const ageRule = input.ageRule ?? "O35";
    const ageRuleLabel = input.ageRuleLabel ?? "35+";
    
    setTournaments((prev) => [
      ...(prev ?? []),
      {
        id,
        leagueId: input.leagueId ?? activeLeagueId,
        name,
        location: input.location ?? "",
        startDate: input.startDate ?? "",
        endDate: input.endDate ?? "",
        registrationFee: Number(input.registrationFee ?? 0),
        ageRule,
        ageRuleLabel,
        ageBand: ageRuleLabel,
        status: input.status ?? "Open",
        rosterLocked: false,
        createdAt: Date.now(),
      },
    ]);
    return { id };
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

  // NEW: createMatch function implementation
  const createMatch = (matchData: {
    leagueId: string;
    tournamentId: string;
    homeTeamId: string;
    awayTeamId: string;
    kickoffAt: number;
    status: MatchStatus;
    field?: string;
    date?: string;
    time?: string;
  }): string => {
    const matchId = uid("match");
    
    const newMatch: Match = {
      id: matchId,
      leagueId: matchData.leagueId,
      tournamentId: matchData.tournamentId,
      homeTeamId: matchData.homeTeamId,
      awayTeamId: matchData.awayTeamId,
      kickoffAt: matchData.kickoffAt,
      status: matchData.status,
      field: matchData.field || "Field TBD",
      date: matchData.date || new Date().toLocaleDateString(),
      time: matchData.time || "TBD",
      homeScore: 0,
      awayScore: 0,
      clockSec: 0,
      durationSec: 90 * 60,
      isLive: false,
      createdAt: Date.now(),
    };

    setMatches((prev) => [...(prev ?? []), newMatch]);
    
    return matchId;
  };

  const addPlayer = (input: AddPlayerInput) => {
    const fullName = String(input?.fullName ?? "").trim();
    const id = uid("player");
    
    if (!fullName) {
      return { ok: false, reason: "Player name is required", id };
    }

    const tournamentId = input.tournamentId ?? null;
    const tournament = tournamentId ? tournaments.find((t: any) => t.id === tournamentId) : null;
    
    if (tournament?.rosterLocked) {
      return { ok: false, reason: "Roster is locked. Cannot add players.", id };
    }
    
    if (tournament && input.dob) {
      const age = calcAge(input.dob);
      const ageRule = tournament.ageRule ?? "O35";
      
      if (ageRule === "U30" && age >= 30) {
        return { ok: false, reason: `Player is ${age} years old. This tournament requires Under 30.`, id };
      }
      if (ageRule === "30_34" && (age < 30 || age > 34)) {
        return { ok: false, reason: `Player is ${age} years old. This tournament requires 30-34 age bracket.`, id };
      }
      if (ageRule === "O35" && age < 35) {
        return { ok: false, reason: `Player is ${age} years old. This tournament requires 35 and over.`, id };
      }
    }

    setPlayers((prev) => [
      ...(prev ?? []),
      {
        id,
        teamId: String(input.teamId),
        tournamentId,
        fullName,
        shirtNumber: input.shirtNumber ?? "",
        position: input.position ?? "",
        dob: input.dob ?? "",
        verified: false,
        createdAt: Date.now(),
      },
    ]);

    return { ok: true, id };
  };

  const removePlayer = (playerId: string) => {
    const id = String(playerId ?? "");
    setPlayers((prev) => (prev ?? []).filter((p) => String(p.id) !== id));
  };

  const invitePlayer = (input: InvitePlayerInput) => {
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

    setMatches((prev) =>
      (prev ?? []).map((m) => (m.id === mId && m.status === "SCHEDULED" ? { ...m, status: "LIVE" as MatchStatus } : m))
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

    setTimeout(() => {
      setPayments((prev) => (prev ?? []).map((p) => (p.id === id ? { ...p, status: "PAID" } : p)));
    }, 600);

    return id;
  };

  const startCheckout = async (plan: string): Promise<{ ok: boolean; reason?: string }> => {
    if (plan === "Pro") {
      setActiveLeagueId((prev) => {
        const updatedLeague = leagues.find((l) => l.id === prev);
        if (updatedLeague) {
          updatedLeague.plan = "Pro";
        }
        return prev;
      });
      return { ok: true };
    }
    return { ok: false, reason: "Invalid plan" };
  };

  const restorePurchases = async (): Promise<{ ok: boolean; reason?: string }> => {
    if (activeLeague?.plan === "Pro") {
      return { ok: true };
    }
    return { ok: false, reason: "No active subscription found" };
  };

  const toggleVerifyPlayer = (playerId: string): { ok: boolean; reason?: string } => {
    const id = String(playerId ?? "");
    const player = players.find((p) => p.id === id);
    
    if (!player) {
      return { ok: false, reason: "Player not found" };
    }

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              verified: !p.verified,
              verificationNote: !p.verified ? "Verified by admin" : undefined,
            }
          : p
      )
    );

    return { ok: true };
  };

  const toggleRosterLock = (tournamentId: string) => {
    const id = String(tournamentId ?? "");
    setTournaments((prev) =>
      prev.map((t: any) => (t.id === id ? { ...t, rosterLocked: !t.rosterLocked } : t))
    );
  };

  const registerTeamForTournament = (input: {
    tournamentId: string;
    teamName: string;
    repName: string;
    repPhone: string;
  }) => {
    const tournament = tournaments.find((t: any) => t.id === input.tournamentId);
    if (!tournament) return;

    const teamId = createTeam({
      name: input.teamName,
      repName: input.repName,
      tournamentId: input.tournamentId,
    });

    if (currentUser.role === "TEAM_REP") {
      setCurrentUser((u) => ({ ...u, teamId }));
    }
  };

  const transferPlayer = (input: {
    playerId: string;
    toTeamId: string;
    by: string;
  }): { ok: boolean; reason?: string } => {
    const player = players.find((p) => p.id === input.playerId);
    const toTeam = teams.find((t) => t.id === input.toTeamId);

    if (!player) {
      return { ok: false, reason: "Player not found" };
    }
    if (!toTeam) {
      return { ok: false, reason: "Destination team not found" };
    }

    const fromTeam = teams.find((t) => t.id === player.teamId);
    if (fromTeam?.tournamentId !== toTeam.tournamentId) {
      return { ok: false, reason: "Can only transfer within the same tournament" };
    }

    const tournament = tournaments.find((t: any) => t.id === player.tournamentId);
    if (tournament?.rosterLocked) {
      return { ok: false, reason: "Roster is locked. Cannot transfer players." };
    }

    const fromTeamId = player.teamId;
    setPlayers((prev) =>
      prev.map((p) => (p.id === input.playerId ? { ...p, teamId: input.toTeamId } : p))
    );

    setTransferLogs((prev) => [
      ...prev,
      {
        id: uid("transfer"),
        tournamentId: String(player.tournamentId ?? ""),
        playerId: input.playerId,
        fromTeamId,
        toTeamId: input.toTeamId,
        by: input.by,
        createdAt: Date.now(),
      },
    ]);

    return { ok: true };
  };

  const setMatchLive = (matchId: string, isLive: boolean) => {
    setMatches((prev) =>
      prev.map((m: any) => (m.id === matchId ? { ...m, isLive, status: isLive ? "LIVE" as MatchStatus : m.status } : m))
    );
  };

  const tickMatch = (matchId: string, seconds: number) => {
    setMatches((prev) =>
      prev.map((m: any) => {
        if (m.id === matchId) {
          const clockSec = (m.clockSec ?? 0) + seconds;
          return { ...m, clockSec };
        }
        return m;
      })
    );
  };

  const resetMatchClock = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m: any) =>
        m.id === matchId ? { ...m, clockSec: 0, isLive: false, status: "SCHEDULED" as MatchStatus } : m
      )
    );
  };

  const logMatchEvent = (input: { matchId: string; type: LoggedEventType; teamId: string }) => {
    const match = matches.find((m: any) => m.id === input.matchId);
    const clockSec = match?.clockSec ?? 0;
    const minute = Math.min(90, Math.floor(clockSec / 60));

    logEvent({
      matchId: input.matchId,
      type: input.type,
      teamId: input.teamId,
      minute,
    });
  };

  const placeBet = (input: { matchId: string; pick: string; wagerCents: number; odds: number }) => {
    console.log("Bet placed:", input);
  };

  const value: AppStore = {
    currentUser,
    setRole,
    setSubscription,
    can,

    leagues,
    activeLeagueId,
    activeLeague,
    setActiveLeagueId,
    setActiveLeague,

    tournaments,
    teams,
    players,
    matches,
    loggedEvents,
    matchEvents: loggedEvents,
    messages,
    payments,
    announcements,
    transferLogs,
    sponsorsAds,

    pendingPayments,
    addPendingPayment,
    markPaymentPaid,
    getPendingPayments,
    walletBalance,
    addToWallet,
    deductFromWallet,
    bettingPools,
    addBetToPool,
    getPoolForMatch,

    getTeamsForTournament,
    getPlayersForTeam,
    getEventsForMatch,

    createTournament,
    createTeam,
    createMatch, // NEW: Export createMatch
    addPlayer,
    removePlayer,
    invitePlayer,

    sendTeamMessage,
    logEvent,

    createPaymentIntent,
    startCheckout,
    restorePurchases,

    setTeamForRep,
    toggleVerifyPlayer,
    toggleRosterLock,
    registerTeamForTournament,
    transferPlayer,

    setMatchLive,
    tickMatch,
    resetMatchClock,
    logMatchEvent,
    placeBet,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}