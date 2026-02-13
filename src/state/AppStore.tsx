// src/state/AppStore.tsx
// ✅ COMPLETE APPSTORE WITH FIXED UNDERAGE RULES ENFORCEMENT

import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

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
  wins?: number;
  draws?: number;
  losses?: number;
};

export type DocumentType = 'DRIVERS_LICENSE' | 'STATE_ID' | 'PASSPORT';

export type FieldLocation = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  parkingInfo?: string;
  fieldNumber?: string;
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
  userId?: string;
  documentType?: DocumentType | null;
  documentVerified?: boolean;
  documentVerificationDate?: string | null;
  documentVerificationService?: 'jumio' | 'onfido' | 'manual' | null;
  documentVerificationId?: string | null;
  documentConfidence?: number;
  faceEmbedding?: string | null;
  facePhotoUrl?: string | null;
  faceQuality?: {
    brightness: number;
    sharpness: number;
  } | null;
  documentFrontUrl?: string | null;
  documentBackUrl?: string | null;
  extractedName?: string | null;
  extractedDOB?: string | null;
  extractedAddress?: string | null;
  extractedDocumentNumber?: string | null;
  extractedExpiration?: string | null;
  extractedState?: string | null;
  extractedCountry?: string | null;
  verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVIEW_REQUIRED';
  verificationNotes?: string | null;
  lastCheckIn?: string | null;
  totalCheckIns?: number;
  checkInHistory?: CheckInRecord[];
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  motmWins?: number;
  motmNominations?: number;
};

export type CheckInRecord = {
  id: string;
  matchId: string;
  playerId: string;
  timestamp: string;
  faceMatchScore: number;
  livenessScore: number;
  approved: boolean;
  checkInDuration: number;
  refereeId: string;
  deviceId: string;
  photoUrl: string;
  notes: string | null;
};

export type MatchStatus = "SCHEDULED" | "LIVE" | "FINAL";

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
  homeTeam?: string;
  awayTeam?: string;
  minute?: number;
  fieldLocation?: FieldLocation | null;
  verificationWindowOpen?: boolean;
  verificationStartTime?: number;
  notificationsSent?: {
    thirtyMinAlert?: boolean;
    fifteenMinAlert?: boolean;
    gameStarting?: boolean;
  };
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
  | "VENDOR_AD"
  | "TEAM_REGISTRATION"
  | "PLAYER_FEE";

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

export interface BettingTicket {
  id: string;
  matchId: string;
  userId: string;
  userName: string;
  wagerCents: number;
  winner: "HOME" | "DRAW" | "AWAY";
  overUnder: "OVER" | "UNDER";
  btts: "YES" | "NO";
  placedAt: number;
  status: "PENDING" | "WON" | "LOST" | "CLOSEST";
}

export interface MatchPool {
  matchId: string;
  totalPotCents: number;
  ticketCount: number;
  status: "OPEN" | "LOCKED" | "SETTLED";
  actualWinner?: "HOME" | "DRAW" | "AWAY";
  actualOverUnder?: "OVER" | "UNDER";
  actualBTTS?: "YES" | "NO";
  totalGoals?: number;
  settledAt?: number;
  payoutCents?: number;
}

export interface MatchVote {
  id: string;
  matchId: string;
  userId: string;
  userName: string;
  playerId: string;
  playerName: string;
  teamId: string;
  votedAt: number;
}

export interface MotmAward {
  matchId: string;
  winnerId: string;
  winnerName: string;
  teamId: string;
  teamName: string;
  voteCount: number;
  totalVotes: number;
  votePercentage: number;
  awardedAt: number;
  bonusCents: number;
}

export interface TournamentTemplate {
  id: string;
  name: string;
  description?: string;
  registrationFee: number;
  ageRuleLabel: string;
  minRosterSize: number;
  maxRosterSize: number;
  maxTeams: number;
  matchDuration: number;
  defaultLocation?: string;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: number;
  createdBy: string;
}

export interface TeamEligibility {
  teamId: string;
  isEligible: boolean;
  blockedReason?: string;
  outstandingFines: number;
  outstandingFineCount: number;
  adminOverride: boolean;
  overrideBy?: string;
  overrideAt?: number;
  overrideReason?: string;
}

export interface CardFine {
  id: string;
  teamId: string;
  playerId: string;
  playerName: string;
  cardType: "YELLOW" | "RED";
  matchId: string;
  amount: number;
  status: "PENDING" | "PAID" | "WAIVED";
  issuedAt: number;
  dueDate: number;
  paidAt?: number;
}

export type UnderageValidation = {
  isValid: boolean;
  currentUnderaged: number;
  maxAllowed: number;
  reason?: string;
  underagedPlayers?: Player[];
};

export type Tournament = {
  id: string;
  leagueId: string;
  name: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  registrationFee?: number;
  ageRule?: string;
  ageRuleLabel?: string;
  ageBand?: string;
  minRosterSize?: number;
  maxRosterSize?: number;
  maxTeams?: number;
  status?: string;
  rosterLocked?: boolean;
  durationSec?: number;
  createdAt?: number;
  
  underageRules?: {
    enabled: boolean;
    ageThreshold: number;
    maxUnderagedOnRoster: number;
    maxUnderagedOnField?: number;
    rosterLockStage?: "GROUP_STAGE" | "KNOCKOUT" | "SEMI_FINALS" | "NEVER";
  };
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
  minRosterSize?: number;
  maxRosterSize?: number;
  maxTeams?: number;
  durationSec?: number;
  underageRules?: {
    enabled: boolean;
    ageThreshold: number;
    maxUnderagedOnRoster: number;
    maxUnderagedOnField?: number;
    rosterLockStage?: "GROUP_STAGE" | "KNOCKOUT" | "SEMI_FINALS" | "NEVER";
  };
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
  userId?: string;
};

type InvitePlayerInput = {
  teamId: string;
  emailOrPhone: string;
};

type UpdatePlayerVerificationInput = {
  playerId: string;
  documentType: DocumentType;
  documentFrontUrl: string;
  documentBackUrl?: string;
  extractedName: string;
  extractedDOB: string;
  extractedAddress?: string;
  extractedDocumentNumber?: string;
  extractedExpiration?: string;
  extractedState?: string;
  extractedCountry?: string;
  documentConfidence: number;
  faceEmbedding?: string;
  facePhotoUrl?: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVIEW_REQUIRED';
};

type GameDayCheckInInput = {
  playerId: string;
  matchId: string;
  livePhotoUrl: string;
  faceMatchScore: number;
  livenessScore: number;
  refereeId: string;
  deviceId: string;
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
    | "VIEW_ADMIN"
    | "REFEREE_MATCH",
    context?: { teamId?: string }
  ) => boolean;
  leagues: League[];
  activeLeagueId: string;
  activeLeague?: League | null;
  setActiveLeagueId: (id: string) => void;
  setActiveLeague: (id: string) => void;
  tournaments: Tournament[];
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
  bettingTickets: BettingTicket[];
  matchPools: MatchPool[];
  placeBettingTicket: (ticket: Omit<BettingTicket, "id" | "placedAt" | "status">) => string | null;
  getMatchPool: (matchId: string) => MatchPool | null;
  settleMatchPool: (matchId: string) => void;
  canUserBet: (matchId: string, userId: string) => { canBet: boolean; reason?: string };
  matchVotes: MatchVote[];
  motmAwards: MotmAward[];
  castMotmVote: (matchId: string, playerId: string) => { ok: boolean; reason?: string };
  getUserMotmVote: (matchId: string, userId: string) => MatchVote | null;
  getMotmLeaderboard: (matchId: string) => Array<{ playerId: string; playerName: string; teamId: string; count: number }>;
  determineMotm: (matchId: string) => void;
  getMotmAward: (matchId: string) => MotmAward | null;
  tournamentTemplates: TournamentTemplate[];
  createTournamentTemplate: (templateData: Omit<TournamentTemplate, "id" | "createdAt" | "createdBy">) => string;
  updateTournamentTemplate: (templateId: string, updates: Partial<TournamentTemplate>) => void;
  deleteTournamentTemplate: (templateId: string) => void;
  getTournamentTemplate: (templateId: string) => TournamentTemplate | undefined;
  archiveTournamentTemplate: (templateId: string) => void;
  restoreTournamentTemplate: (templateId: string) => void;
  teamEligibility: Record<string, TeamEligibility>;
  cardFines: CardFine[];
  getTeamEligibility: (teamId: string) => TeamEligibility;
  overrideTeamEligibility: (teamId: string, reason: string) => { ok: boolean; message: string };
  removeTeamEligibilityOverride: (teamId: string) => { ok: boolean };
  createCardFine: (input: {
    teamId: string;
    playerId: string;
    playerName: string;
    cardType: "YELLOW" | "RED";
    matchId: string;
  }) => string;
  payCardFine: (fineId: string) => { ok: boolean; message: string };
  getTeamFines: (teamId: string) => CardFine[];
  getTeamUnpaidFines: (teamId: string) => CardFine[];
  canTeamPlayMatch: (teamId: string) => { canPlay: boolean; reason?: string };
  validateMatchEligibility: (matchId: string) => {
    canStart: boolean;
    blockedTeams: string[];
    message?: string;
  };
  
  isPlayerUnderaged: (playerId: string, tournamentId: string) => boolean;
  getTeamUnderagedPlayers: (teamId: string, tournamentId: string) => Player[];
  canAddUnderagedPlayer: (teamId: string, tournamentId: string) => UnderageValidation;
  validateFieldLineup: (matchId: string, teamId: string, playersOnField: string[]) => { 
    isValid: boolean; 
    reason?: string;
    underagedCount?: number;
    maxAllowed?: number;
  };
  canModifyRoster: (tournamentId: string) => { canModify: boolean; reason?: string };
  
  getTeamsForTournament: (tournamentId: string) => Team[];
  getPlayersForTeam: (teamId: string) => Player[];
  getEventsForMatch: (matchId: string) => LoggedEvent[];
  createTournament: (input: CreateTournamentInput) => { id: string };
  createTeam: (input: CreateTeamInput) => string;
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
    fieldLocation?: FieldLocation;
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
  updateMatchStatus: (matchId: string, status: MatchStatus) => void;
  tickMatch: (matchId: string, seconds: number) => void;
  resetMatchClock: (matchId: string) => void;
  logMatchEvent: (input: {
    matchId: string;
    type: LoggedEventType;
    teamId: string;
    playerId?: string;
  }) => void;
  placeBet: (input: {
    matchId: string;
    pick: string;
    wagerCents: number;
    odds: number;
  }) => void;
  updatePlayerVerification: (input: UpdatePlayerVerificationInput) => { ok: boolean; reason?: string };
  getVerifiedPlayer: (playerId: string) => Player | null;
  recordCheckIn: (input: GameDayCheckInInput) => { ok: boolean; reason?: string };
  getPlayerCheckIns: (playerId: string) => CheckInRecord[];
  markNotificationSent: (matchId: string, type: 'thirtyMinAlert' | 'fifteenMinAlert' | 'gameStarting') => void;
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
  
  const tournaments: Tournament[] = [
    {
      id: tourId,
      leagueId,
      name: "NVT Demo Tournament",
      location: "DMV",
      registrationFee: 15000,
      ageRule: "O35",
      ageRuleLabel: "35+",
      ageBand: "35+",
      minRosterSize: 11,
      maxRosterSize: 18,
      maxTeams: 24,
      status: "Open",
      rosterLocked: false,
      durationSec: 90 * 60,
      createdAt: Date.now(),
      underageRules: {
        enabled: true,
        ageThreshold: 35,
        maxUnderagedOnRoster: 0,
        rosterLockStage: "NEVER",
      },
    },
    {
      id: "tour_northeast_2026",
      leagueId,
      name: "North East Veterans Tournament",
      location: "North East Region",
      registrationFee: 15000,
      ageRule: "O35",
      ageRuleLabel: "35+",
      ageBand: "35+",
      minRosterSize: 11,
      maxRosterSize: 18,
      maxTeams: 24,
      status: "Open",
      rosterLocked: false,
      durationSec: 90 * 60,
      createdAt: Date.now(),
      underageRules: {
        enabled: true,
        ageThreshold: 35,
        maxUnderagedOnRoster: 3,
        rosterLockStage: "NEVER",
      },
    },
    {
      id: "tour_dmv_2026",
      leagueId,
      name: "DMV League",
      location: "DMV Region",
      registrationFee: 20000,
      ageRule: "O35",
      ageRuleLabel: "35+",
      ageBand: "35+",
      minRosterSize: 11,
      maxRosterSize: 18,
      maxTeams: 24,
      status: "Open",
      rosterLocked: false,
      durationSec: 90 * 60,
      createdAt: Date.now(),
      underageRules: {
        enabled: true,
        ageThreshold: 35,
        maxUnderagedOnRoster: 5,
        maxUnderagedOnField: 3,
        rosterLockStage: "GROUP_STAGE",
      },
    },
  ];
  
  const teams: Team[] = [
    { id: "team_spartan", leagueId, tournamentId: tourId, name: "Spartan Veterans FC", logoKey: "spartan", repName: "Team Rep", wins: 5, draws: 2, losses: 1 },
    { id: "team_lanham", leagueId, tournamentId: tourId, name: "Lanham Veteran FC", logoKey: "lanham", repName: "Team Rep", wins: 4, draws: 3, losses: 1 },
    { id: "team_elite", leagueId, tournamentId: tourId, name: "Elite Veterans FC", logoKey: "elite", repName: "Team Rep", wins: 4, draws: 2, losses: 2 },
    { id: "team_balisao", leagueId, tournamentId: tourId, name: "Balisao Veterans Club", logoKey: "balisao", repName: "Team Rep", wins: 3, draws: 3, losses: 2 },
    { id: "team_nova", leagueId, tournamentId: tourId, name: "Nova Vets", logoKey: "nova", repName: "Team Rep", wins: 3, draws: 2, losses: 3 },
    { id: "team_dp", leagueId, tournamentId: tourId, name: "Delaware Progressives", logoKey: "delaware-progressives", repName: "Team Rep", wins: 2, draws: 4, losses: 2 },
    { id: "team_vfc", leagueId, tournamentId: tourId, name: "Veterans Football Club", logoKey: "vfc", repName: "Team Rep", wins: 2, draws: 3, losses: 3 },
    { id: "team_social", leagueId, tournamentId: tourId, name: "Social Boyz", logoKey: "social-boyz", repName: "Team Rep", wins: 2, draws: 2, losses: 4 },
    { id: "team_bvfc", leagueId, tournamentId: tourId, name: "Baltimore Veteran FC", logoKey: "bvfc", repName: "Andy (Manager)", wins: 1, draws: 5, losses: 2 },
    { id: "team_zoo", leagueId, tournamentId: tourId, name: "Zoo Zoo", logoKey: "zoo-zoo", repName: "Team Rep", wins: 1, draws: 3, losses: 4 },
    { id: "team_nevt", leagueId, tournamentId: tourId, name: "New England Veterans FC", logoKey: "nevt", repName: "Team Rep", wins: 1, draws: 2, losses: 5 },
    { id: "team_delv", leagueId, tournamentId: tourId, name: "Delaware Veterans Club", logoKey: "delaware-vets", repName: "Team Rep", wins: 0, draws: 5, losses: 3 },
    { id: "team_njnd", leagueId, tournamentId: tourId, name: "NJ Ndamba Veterans FC", logoKey: "nj-ndamba", repName: "Team Rep", wins: 0, draws: 3, losses: 5 },
    { id: "team_landover", leagueId, tournamentId: tourId, name: "Landover FC", logoKey: "landover", repName: "Team Rep", wins: 0, draws: 2, losses: 6 },
  ];
  
  const matches: Match[] = [
    {
      id: "match_1",
      leagueId,
      tournamentId: tourId,
      homeTeamId: "team_bvfc",
      awayTeamId: "team_spartan",
      kickoffAt: Date.now() + 30 * 60 * 1000,
      status: "SCHEDULED",
      field: "Veterans Memorial Field 1",
      date: new Date(Date.now() + 30 * 60 * 1000).toLocaleDateString(),
      time: new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      clockSec: 0,
      durationSec: 90 * 60,
      isLive: false,
      homeScore: 0,
      awayScore: 0,
      homeTeam: "Baltimore Veteran FC",
      awayTeam: "Spartan Veterans FC",
      createdAt: Date.now(),
      fieldLocation: {
        name: 'Veterans Memorial Field 1',
        address: '123 Veterans Parkway, Baltimore, MD 21201',
        latitude: 39.2904,
        longitude: -76.6122,
        parkingInfo: 'Free parking in Lot A',
        fieldNumber: 'Field 1',
      },
      notificationsSent: {
        thirtyMinAlert: false,
        fifteenMinAlert: false,
        gameStarting: false,
      },
    },
    {
      id: "match_2",
      leagueId,
      tournamentId: tourId,
      homeTeamId: "team_dp",
      awayTeamId: "team_elite",
      kickoffAt: Date.now() + 90 * 60 * 1000,
      status: "SCHEDULED",
      field: "Veterans Memorial Field 2",
      date: new Date(Date.now() + 90 * 60 * 1000).toLocaleDateString(),
      time: new Date(Date.now() + 90 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      clockSec: 0,
      durationSec: 90 * 60,
      isLive: false,
      homeScore: 0,
      awayScore: 0,
      homeTeam: "Delaware Progressives",
      awayTeam: "Elite Veterans FC",
      createdAt: Date.now(),
      fieldLocation: {
        name: 'Veterans Memorial Field 2',
        address: '123 Veterans Parkway, Baltimore, MD 21201',
        latitude: 39.2908,
        longitude: -76.6118,
        parkingInfo: 'Free parking in Lot A',
        fieldNumber: 'Field 2',
      },
      notificationsSent: {
        thirtyMinAlert: false,
        fifteenMinAlert: false,
        gameStarting: false,
      },
    },
  ];
  
  const players: Player[] = [
    {
      id: 'player_bvfc_1',
      teamId: 'team_bvfc',
      tournamentId: tourId,
      fullName: 'Andy Kum',
      shirtNumber: '10',
      position: 'Captain/Midfielder',
      dob: '1985-03-15',
      documentType: 'DRIVERS_LICENSE',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 8,
      assists: 6,
      createdAt: Date.now(),
      userId: 'user_andy',
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_bvfc_2',
      teamId: 'team_bvfc',
      tournamentId: tourId,
      fullName: 'David Martinez',
      shirtNumber: '7',
      position: 'Midfielder',
      dob: '1987-07-22',
      documentType: 'STATE_ID',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 5,
      assists: 4,
      createdAt: Date.now(),
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_bvfc_3',
      teamId: 'team_bvfc',
      tournamentId: tourId,
      fullName: 'James Wilson',
      shirtNumber: '3',
      position: 'Defender',
      dob: '1986-11-08',
      documentType: 'PASSPORT',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 1,
      assists: 2,
      createdAt: Date.now(),
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_bvfc_4',
      teamId: 'team_bvfc',
      tournamentId: tourId,
      fullName: 'Robert Brown',
      shirtNumber: '1',
      position: 'Goalkeeper',
      dob: '1984-05-30',
      documentType: 'DRIVERS_LICENSE',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 0,
      assists: 0,
      createdAt: Date.now(),
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_bvfc_5',
      teamId: 'team_bvfc',
      tournamentId: tourId,
      fullName: 'Michael Garcia',
      shirtNumber: '15',
      position: 'Midfielder',
      dob: '1988-09-12',
      documentType: 'STATE_ID',
      documentVerified: false,
      verificationStatus: 'PENDING',
      verified: false,
      goals: 2,
      assists: 3,
      createdAt: Date.now(),
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_spartan_1',
      teamId: 'team_spartan',
      tournamentId: tourId,
      fullName: 'Mukong Adeso',
      shirtNumber: '9',
      position: 'Forward',
      dob: '1986-02-18',
      documentType: 'DRIVERS_LICENSE',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 12,
      assists: 5,
      createdAt: Date.now(),
      userId: 'user_mukong',
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_spartan_2',
      teamId: 'team_spartan',
      tournamentId: tourId,
      fullName: 'Thomas Anderson',
      shirtNumber: '8',
      position: 'Midfielder',
      dob: '1985-06-25',
      documentType: 'PASSPORT',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 7,
      assists: 8,
      createdAt: Date.now(),
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_spartan_3',
      teamId: 'team_spartan',
      tournamentId: tourId,
      fullName: 'Daniel Lee',
      shirtNumber: '4',
      position: 'Defender',
      dob: '1987-12-03',
      documentType: 'DRIVERS_LICENSE',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 2,
      assists: 1,
      createdAt: Date.now(),
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_spartan_4',
      teamId: 'team_spartan',
      tournamentId: tourId,
      fullName: 'Christopher Taylor',
      shirtNumber: '1',
      position: 'Goalkeeper',
      dob: '1984-08-14',
      documentType: 'STATE_ID',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 0,
      assists: 0,
      createdAt: Date.now(),
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_spartan_5',
      teamId: 'team_spartan',
      tournamentId: tourId,
      fullName: 'Anthony White',
      shirtNumber: '11',
      position: 'Forward',
      dob: '1989-04-20',
      documentType: 'DRIVERS_LICENSE',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 6,
      assists: 4,
      createdAt: Date.now(),
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_elite_1',
      teamId: 'team_elite',
      tournamentId: tourId,
      fullName: 'Henry Atem',
      shirtNumber: '10',
      position: 'Captain/Forward',
      dob: '1986-09-10',
      documentType: 'DRIVERS_LICENSE',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 10,
      assists: 7,
      createdAt: Date.now(),
      userId: 'user_henry',
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_elite_2',
      teamId: 'team_elite',
      tournamentId: tourId,
      fullName: 'Kevin Johnson',
      shirtNumber: '8',
      position: 'Midfielder',
      dob: '1987-04-15',
      documentType: 'STATE_ID',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 6,
      assists: 5,
      createdAt: Date.now(),
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_elite_3',
      teamId: 'team_elite',
      tournamentId: tourId,
      fullName: 'Marcus Thompson',
      shirtNumber: '5',
      position: 'Defender',
      dob: '1985-11-20',
      documentType: 'PASSPORT',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 1,
      assists: 2,
      createdAt: Date.now(),
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_elite_4',
      teamId: 'team_elite',
      tournamentId: tourId,
      fullName: 'Brian Mitchell',
      shirtNumber: '1',
      position: 'Goalkeeper',
      dob: '1984-06-30',
      documentType: 'DRIVERS_LICENSE',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 0,
      assists: 0,
      createdAt: Date.now(),
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_dp_1',
      teamId: 'team_dp',
      tournamentId: tourId,
      fullName: 'Valentine Esaka',
      shirtNumber: '7',
      position: 'Forward',
      dob: '1987-01-25',
      documentType: 'DRIVERS_LICENSE',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 9,
      assists: 6,
      createdAt: Date.now(),
      userId: 'user_valentine',
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_dp_2',
      teamId: 'team_dp',
      tournamentId: tourId,
      fullName: 'Carlos Santos',
      shirtNumber: '6',
      position: 'Midfielder',
      dob: '1986-08-12',
      documentType: 'STATE_ID',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 4,
      assists: 5,
      createdAt: Date.now(),
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_dp_3',
      teamId: 'team_dp',
      tournamentId: tourId,
      fullName: 'Patrick O\'Connor',
      shirtNumber: '2',
      position: 'Defender',
      dob: '1985-03-18',
      documentType: 'PASSPORT',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 0,
      assists: 1,
      createdAt: Date.now(),
      motmWins: 0,
      motmNominations: 0,
    },
    {
      id: 'player_dp_4',
      teamId: 'team_dp',
      tournamentId: tourId,
      fullName: 'Steven Walsh',
      shirtNumber: '1',
      position: 'Goalkeeper',
      dob: '1984-12-05',
      documentType: 'DRIVERS_LICENSE',
      documentVerified: true,
      verificationStatus: 'APPROVED',
      verified: true,
      goals: 0,
      assists: 0,
      createdAt: Date.now(),
      motmWins: 0,
      motmNominations: 0,
    },
  ];
  
  return { leagues, tournaments, teams, matches, players, leagueId, tourId };
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const seed = useMemo(() => buildSeed(), []);
  const [leagues] = useState<League[]>(seed.leagues);
  const [activeLeagueId, setActiveLeagueId] = useState<string>(seed.leagueId);
  const [tournaments, setTournaments] = useState<Tournament[]>(seed.tournaments);
  const [teams, setTeams] = useState<Team[]>(seed.teams);
  const [players, setPlayers] = useState<Player[]>(seed.players);
  const [matches, setMatches] = useState<Match[]>(seed.matches);
  const [loggedEvents, setLoggedEvents] = useState<LoggedEvent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [transferLogs, setTransferLogs] = useState<TransferLog[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [walletBalance, setWalletBalance] = useState(2500);
  const [bettingPools, setBettingPools] = useState<BettingPool[]>([]);
  const [bettingTickets, setBettingTickets] = useState<BettingTicket[]>([]);
  const [matchPools, setMatchPools] = useState<MatchPool[]>([]);
  const [matchVotes, setMatchVotes] = useState<MatchVote[]>([]);
  const [motmAwards, setMotmAwards] = useState<MotmAward[]>([]);
  
  const [tournamentTemplates, setTournamentTemplates] = useState<TournamentTemplate[]>([
    {
      id: "template_1",
      name: "Standard 35+ Tournament",
      description: "Default settings for over-35 weekend tournaments",
      registrationFee: 15000,
      ageRuleLabel: "35+",
      minRosterSize: 11,
      maxRosterSize: 18,
      maxTeams: 24,
      matchDuration: 90,
      defaultLocation: "Springfield Sports Complex",
      status: "ACTIVE",
      createdAt: Date.now(),
      createdBy: "admin",
    },
    {
      id: "template_2",
      name: "Premium 40+ League",
      description: "Higher tier tournament with larger rosters",
      registrationFee: 20000,
      ageRuleLabel: "40+",
      minRosterSize: 13,
      maxRosterSize: 22,
      maxTeams: 16,
      matchDuration: 90,
      defaultLocation: "Metro Sports Arena",
      status: "ACTIVE",
      createdAt: Date.now(),
      createdBy: "admin",
    },
  ]);

  const [teamEligibility, setTeamEligibility] = useState<Record<string, TeamEligibility>>({});
  const [cardFines, setCardFines] = useState<CardFine[]>([]);
  
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
    teamId: null,
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
      case "REFEREE_MATCH":
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

  const isPlayerUnderaged = (playerId: string, tournamentId: string): boolean => {
    const player = players.find(p => p.id === playerId);
    const tournament = tournaments.find(t => t.id === tournamentId);
    
    if (!player || !tournament?.underageRules?.enabled) return false;
    
    const age = calcAge(player.dob);
    return age < tournament.underageRules.ageThreshold;
  };

  const getTeamUnderagedPlayers = (teamId: string, tournamentId: string): Player[] => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament?.underageRules?.enabled) return [];
    
    return players.filter(p => 
      p.teamId === teamId && 
      p.tournamentId === tournamentId &&
      isPlayerUnderaged(p.id, tournamentId)
    );
  };

  const canAddUnderagedPlayer = (teamId: string, tournamentId: string): UnderageValidation => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    
    if (!tournament?.underageRules?.enabled) {
      return { isValid: true, currentUnderaged: 0, maxAllowed: 999 };
    }
    
    const underagedPlayers = getTeamUnderagedPlayers(teamId, tournamentId);
    const currentCount = underagedPlayers.length;
    const maxAllowed = tournament.underageRules.maxUnderagedOnRoster;
    
    if (currentCount >= maxAllowed) {
      return {
        isValid: false,
        currentUnderaged: currentCount,
        maxAllowed,
        reason: maxAllowed === 0 
          ? `This is a strict ${tournament.underageRules.ageThreshold}+ tournament. NO underaged players allowed.`
          : `Team already has ${currentCount} under-aged players. Max allowed: ${maxAllowed}`,
        underagedPlayers,
      };
    }
    
    return {
      isValid: true,
      currentUnderaged: currentCount,
      maxAllowed,
      underagedPlayers,
    };
  };

  const validateFieldLineup = (
    matchId: string,
    teamId: string,
    playersOnField: string[]
  ): { isValid: boolean; reason?: string; underagedCount?: number; maxAllowed?: number } => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return { isValid: false, reason: "Match not found" };
    
    const tournament = tournaments.find(t => t.id === match.tournamentId);
    if (!tournament?.underageRules?.enabled || !tournament.underageRules.maxUnderagedOnField) {
      return { isValid: true };
    }
    
    const underagedOnField = playersOnField.filter(playerId => 
      isPlayerUnderaged(playerId, match.tournamentId || "")
    );
    
    const maxAllowed = tournament.underageRules.maxUnderagedOnField;
    
    if (underagedOnField.length > maxAllowed) {
      return {
        isValid: false,
        reason: `Cannot have ${underagedOnField.length} under-aged players on field. Max allowed: ${maxAllowed}`,
        underagedCount: underagedOnField.length,
        maxAllowed,
      };
    }
    
    return { 
      isValid: true, 
      underagedCount: underagedOnField.length, 
      maxAllowed 
    };
  };

  const canModifyRoster = (tournamentId: string): { canModify: boolean; reason?: string } => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    
    if (!tournament) {
      return { canModify: false, reason: "Tournament not found" };
    }
    
    if (tournament.rosterLocked) {
      return { canModify: false, reason: "Roster is locked" };
    }
    
    if (tournament.underageRules?.rosterLockStage === "GROUP_STAGE") {
      if (tournament.status === "KNOCKOUT" || tournament.status === "COMPLETE") {
        return { 
          canModify: false, 
          reason: "Roster locked - tournament has progressed beyond group stage" 
        };
      }
    }
    
    return { canModify: true };
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

  const placeBettingTicket: AppStore["placeBettingTicket"] = (ticketData) => {
    const ticket: BettingTicket = {
      ...ticketData,
      id: uid("ticket"),
      placedAt: Date.now(),
      status: "PENDING",
    };
    setBettingTickets((prev) => [...prev, ticket]);

    setMatchPools((prev) => {
      const existingPool = prev.find(p => p.matchId === ticket.matchId);
      
      if (existingPool) {
        return prev.map(p =>
          p.matchId === ticket.matchId
            ? {
                ...p,
                totalPotCents: p.totalPotCents + ticket.wagerCents,
                ticketCount: p.ticketCount + 1,
              }
            : p
        );
      } else {
        return [
          ...prev,
          {
            matchId: ticket.matchId,
            totalPotCents: ticket.wagerCents,
            ticketCount: 1,
            status: "OPEN" as const,
          },
        ];
      }
    });

    return ticket.id;
  };

  const getMatchPool: AppStore["getMatchPool"] = (matchId) => {
    return matchPools.find(p => p.matchId === matchId) || null;
  };

  const canUserBet: AppStore["canUserBet"] = (matchId, userId) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) {
      return { canBet: false, reason: "Match not found" };
    }

    if (match.isLive || match.status === "FINAL") {
      return { canBet: false, reason: "Betting closed - match started" };
    }

    const userPlayer = players.find(p => p.userId === userId);
    if (userPlayer && (userPlayer.teamId === match.homeTeamId || userPlayer.teamId === match.awayTeamId)) {
      return { canBet: false, reason: "Players cannot bet on their own matches" };
    }

    if (currentUser.role === "REFEREE" || currentUser.role === "TOURNAMENT_ADMIN") {
      return { canBet: false, reason: "Match officials cannot bet on matches" };
    }

    return { canBet: true };
  };

  const settleMatchPool: AppStore["settleMatchPool"] = (matchId) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || match.status !== "FINAL") return;
    
    const pool = matchPools.find(p => p.matchId === matchId);
    if (!pool || pool.status === "SETTLED") return;

    const events = loggedEvents.filter(e => e.matchId === matchId && e.type === "GOAL");
    const homeGoals = events.filter(e => e.teamId === match.homeTeamId).length;
    const awayGoals = events.filter(e => e.teamId === match.awayTeamId).length;
    const totalGoals = homeGoals + awayGoals;

    const actualWinner: "HOME" | "DRAW" | "AWAY" = 
      homeGoals > awayGoals ? "HOME" : 
      homeGoals < awayGoals ? "AWAY" : "DRAW";

    const actualOverUnder: "OVER" | "UNDER" = totalGoals > 2.5 ? "OVER" : "UNDER";
    const actualBTTS: "YES" | "NO" = (homeGoals > 0 && awayGoals > 0) ? "YES" : "NO";

    const matchTickets = bettingTickets.filter(t => t.matchId === matchId);

    const perfectWinners = matchTickets.filter(t => 
      t.winner === actualWinner &&
      t.overUnder === actualOverUnder &&
      t.btts === actualBTTS
    );

    let payoutCents = 0;

    if (perfectWinners.length > 0) {
      const potAfterRake = Math.min(pool.totalPotCents * 0.9, 50000);
      const payoutPerWinner = Math.floor(potAfterRake / perfectWinners.length);
      payoutCents = potAfterRake;
      
      setBettingTickets((prev) =>
        prev.map((ticket) => {
          if (perfectWinners.find(w => w.id === ticket.id)) {
            addToWallet(payoutPerWinner);
            return { ...ticket, status: "WON" as const };
          } else if (ticket.matchId === matchId) {
            return { ...ticket, status: "LOST" as const };
          }
          return ticket;
        })
      );
    } else {
      const scored = matchTickets.map(ticket => {
        let score = 0;
        if (ticket.winner === actualWinner) score += 1;
        if (ticket.overUnder === actualOverUnder) score += 1;
        if (ticket.btts === actualBTTS) score += 1;
        return { ticket, score };
      });
      
      const maxScore = Math.max(...scored.map(s => s.score));
      const closestWinners = scored.filter(s => s.score === maxScore).map(s => s.ticket);
      
      if (closestWinners.length > 0) {
        const potAfterRake = Math.min(pool.totalPotCents * 0.9, 50000);
        const payoutPerWinner = Math.floor(potAfterRake / closestWinners.length);
        payoutCents = potAfterRake;
        
        setBettingTickets((prev) =>
          prev.map((ticket) => {
            if (closestWinners.find(w => w.id === ticket.id)) {
              addToWallet(payoutPerWinner);
              return { ...ticket, status: "CLOSEST" as const };
            } else if (ticket.matchId === matchId) {
              return { ...ticket, status: "LOST" as const };
            }
            return ticket;
          })
        );
      }
    }

    setMatchPools((prev) =>
      prev.map(p => {
        if (p.matchId === matchId) {
          return {
            ...p,
            status: "SETTLED" as const,
            actualWinner,
            actualOverUnder,
            actualBTTS,
            totalGoals,
            settledAt: Date.now(),
            payoutCents,
          };
        }
        return p;
      })
    );
  };

  const castMotmVote = (matchId: string, playerId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || !match.isLive) {
      return { ok: false, reason: "Can only vote during live matches" };
    }
    
    const player = players.find(p => p.id === playerId);
    if (!player) {
      return { ok: false, reason: "Player not found" };
    }

    const existingVote = matchVotes.find(
      v => v.matchId === matchId && v.userId === currentUser.id
    );

    if (existingVote) {
      setMatchVotes(prev =>
        prev.map(v =>
          v.id === existingVote.id
            ? {
                ...v,
                playerId,
                playerName: player.fullName,
                teamId: player.teamId,
                votedAt: Date.now(),
              }
            : v
        )
      );
    } else {
      const newVote: MatchVote = {
        id: uid("vote"),
        matchId,
        userId: currentUser.id,
        userName: currentUser.name,
        playerId,
        playerName: player.fullName,
        teamId: player.teamId,
        votedAt: Date.now(),
      };
      setMatchVotes(prev => [...prev, newVote]);
    }

    return { ok: true };
  };

  const getUserMotmVote = (matchId: string, userId: string): MatchVote | null => {
    return matchVotes.find(v => v.matchId === matchId && v.userId === userId) || null;
  };

  const getMotmLeaderboard = (matchId: string) => {
    const votes = matchVotes.filter(v => v.matchId === matchId);
    if (votes.length === 0) return [];

    const voteCounts = votes.reduce((acc, vote) => {
      if (!acc[vote.playerId]) {
        acc[vote.playerId] = {
          playerId: vote.playerId,
          playerName: vote.playerName,
          teamId: vote.teamId,
          count: 0,
        };
      }
      acc[vote.playerId].count += 1;
      return acc;
    }, {} as Record<string, { playerId: string; playerName: string; teamId: string; count: number }>);

    const leaderboard = Object.values(voteCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return leaderboard;
  };

  const determineMotm = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || match.status !== "FINAL") return;
    if (motmAwards.find(a => a.matchId === matchId)) return;

    const votes = matchVotes.filter(v => v.matchId === matchId);

    if (votes.length === 0) {
      return;
    }

    const voteCounts = votes.reduce((acc, vote) => {
      if (!acc[vote.playerId]) {
        acc[vote.playerId] = {
          playerId: vote.playerId,
          playerName: vote.playerName,
          teamId: vote.teamId,
          count: 0,
        };
      }
      acc[vote.playerId].count += 1;
      return acc;
    }, {} as Record<string, { playerId: string; playerName: string; teamId: string; count: number }>);

    const candidates = Object.values(voteCounts);
    const winner = candidates.reduce((max, curr) => 
      curr.count > max.count ? curr : max
    );

    const team = teams.find(t => t.id === winner.teamId);
    const bonusCents = 2500;

    const award: MotmAward = {
      matchId,
      winnerId: winner.playerId,
      winnerName: winner.playerName,
      teamId: winner.teamId,
      teamName: team?.name || "Unknown Team",
      voteCount: winner.count,
      totalVotes: votes.length,
      votePercentage: Math.round((winner.count / votes.length) * 100),
      awardedAt: Date.now(),
      bonusCents,
    };

    setMotmAwards(prev => [...prev, award]);

    setPlayers(prev =>
      prev.map(p =>
        p.id === winner.playerId
          ? {
              ...p,
              motmWins: (p.motmWins || 0) + 1,
              motmNominations: (p.motmNominations || 0) + 1,
            }
          : p
      )
    );

    console.log(`🏆 MOTM: ${winner.playerName} won $25 with ${winner.count} votes!`);
  };

  const getMotmAward = (matchId: string): MotmAward | null => {
    return motmAwards.find(a => a.matchId === matchId) || null;
  };

  const createTournamentTemplate = (templateData: Omit<TournamentTemplate, "id" | "createdAt" | "createdBy">) => {
    const newTemplate: TournamentTemplate = {
      ...templateData,
      id: uid("template"),
      createdAt: Date.now(),
      createdBy: currentUser.id,
    };
    
    setTournamentTemplates((prev) => [...prev, newTemplate]);
    return newTemplate.id;
  };

  const updateTournamentTemplate = (templateId: string, updates: Partial<TournamentTemplate>) => {
    setTournamentTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId
          ? { ...template, ...updates }
          : template
      )
    );
  };

  const deleteTournamentTemplate = (templateId: string) => {
    setTournamentTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  const getTournamentTemplate = (templateId: string): TournamentTemplate | undefined => {
    return tournamentTemplates.find((t) => t.id === templateId);
  };

  const archiveTournamentTemplate = (templateId: string) => {
    updateTournamentTemplate(templateId, { status: "ARCHIVED" });
  };

  const restoreTournamentTemplate = (templateId: string) => {
    updateTournamentTemplate(templateId, { status: "ACTIVE" });
  };

  const getTeamEligibility = (teamId: string): TeamEligibility => {
    const existing = teamEligibility[teamId];
    if (existing?.adminOverride) {
      return existing;
    }

    const teamFines = cardFines.filter(
      f => f.teamId === teamId && f.status === "PENDING"
    );

    const outstandingAmount = teamFines.reduce((sum, f) => sum + f.amount, 0);
    const isEligible = teamFines.length === 0 || (existing?.adminOverride ?? false);

    return {
      teamId,
      isEligible,
      blockedReason: !isEligible ? `${teamFines.length} unpaid card fine${teamFines.length > 1 ? 's' : ''}` : undefined,
      outstandingFines: outstandingAmount,
      outstandingFineCount: teamFines.length,
      adminOverride: existing?.adminOverride ?? false,
      overrideBy: existing?.overrideBy,
      overrideAt: existing?.overrideAt,
      overrideReason: existing?.overrideReason,
    };
  };

  const overrideTeamEligibility = (teamId: string, reason: string): { ok: boolean; message: string } => {
    if (!can("MANAGE_TOURNAMENTS")) {
      return { ok: false, message: "Only league admins can override eligibility" };
    }

    const eligibility = getTeamEligibility(teamId);
    
    if (eligibility.isEligible && !eligibility.adminOverride) {
      return { ok: false, message: "Team is already eligible" };
    }

    setTeamEligibility(prev => ({
      ...prev,
      [teamId]: {
        ...eligibility,
        isEligible: true,
        adminOverride: true,
        overrideBy: currentUser.name,
        overrideAt: Date.now(),
        overrideReason: reason,
      },
    }));

    return { 
      ok: true, 
      message: `Team cleared to play. Override expires after next match or when fines are paid.` 
    };
  };

  const removeTeamEligibilityOverride = (teamId: string): { ok: boolean } => {
    if (!can("MANAGE_TOURNAMENTS")) {
      return { ok: false };
    }

    setTeamEligibility(prev => {
      const updated = { ...prev };
      delete updated[teamId];
      return updated;
    });

    return { ok: true };
  };

  const createCardFine = (input: {
    teamId: string;
    playerId: string;
    playerName: string;
    cardType: "YELLOW" | "RED";
    matchId: string;
  }): string => {
    const amount = input.cardType === "YELLOW" ? 2500 : 5000;
    const dueDate = Date.now() + 7 * 24 * 60 * 60 * 1000;

    const fine: CardFine = {
      id: uid("fine"),
      teamId: input.teamId,
      playerId: input.playerId,
      playerName: input.playerName,
      cardType: input.cardType,
      matchId: input.matchId,
      amount,
      status: "PENDING",
      issuedAt: Date.now(),
      dueDate,
    };

    setCardFines(prev => [...prev, fine]);

    addPendingPayment({
      id: fine.id,
      type: "CARD_FINE",
      amount,
      status: "PENDING",
      createdAt: Date.now(),
      dueDate,
      teamId: input.teamId,
      cardType: input.cardType,
      playerName: input.playerName,
    });

    if (teamEligibility[input.teamId]?.adminOverride) {
      removeTeamEligibilityOverride(input.teamId);
    }

    return fine.id;
  };

  const payCardFine = (fineId: string): { ok: boolean; message: string } => {
    const fine = cardFines.find(f => f.id === fineId);
    if (!fine) {
      return { ok: false, message: "Fine not found" };
    }

    if (fine.status === "PAID") {
      return { ok: false, message: "Fine already paid" };
    }

    if (walletBalance < fine.amount) {
      return { 
        ok: false, 
        message: `Insufficient funds. Need $${(fine.amount / 100).toFixed(2)}` 
      };
    }

    deductFromWallet(fine.amount);

    setCardFines(prev =>
      prev.map(f =>
        f.id === fineId
          ? { ...f, status: "PAID" as const, paidAt: Date.now() }
          : f
      )
    );

    markPaymentPaid(fineId);

    const teamFines = cardFines.filter(
      f => f.teamId === fine.teamId && f.status === "PENDING" && f.id !== fineId
    );
    if (teamFines.length === 0 && teamEligibility[fine.teamId]?.adminOverride) {
      removeTeamEligibilityOverride(fine.teamId);
    }

    return { ok: true, message: "Fine paid successfully" };
  };

  const getTeamFines = (teamId: string): CardFine[] => {
    return cardFines.filter(f => f.teamId === teamId);
  };

  const getTeamUnpaidFines = (teamId: string): CardFine[] => {
    return cardFines.filter(f => f.teamId === teamId && f.status === "PENDING");
  };

  const canTeamPlayMatch = (teamId: string): { canPlay: boolean; reason?: string } => {
    const eligibility = getTeamEligibility(teamId);
    
    if (eligibility.isEligible) {
      return { canPlay: true };
    }

    return {
      canPlay: false,
      reason: eligibility.blockedReason,
    };
  };

  const validateMatchEligibility = (matchId: string): {
    canStart: boolean;
    blockedTeams: string[];
    message?: string;
  } => {
    const match = matches.find(m => m.id === matchId);
    if (!match) {
      return { canStart: false, blockedTeams: [], message: "Match not found" };
    }

    const homeEligibility = canTeamPlayMatch(match.homeTeamId);
    const awayEligibility = canTeamPlayMatch(match.awayTeamId);

    const blockedTeams: string[] = [];
    
    if (!homeEligibility.canPlay) {
      const homeTeam = teams.find(t => t.id === match.homeTeamId);
      blockedTeams.push(homeTeam?.name || "Home Team");
    }
    
    if (!awayEligibility.canPlay) {
      const awayTeam = teams.find(t => t.id === match.awayTeamId);
      blockedTeams.push(awayTeam?.name || "Away Team");
    }

    if (blockedTeams.length > 0) {
      return {
        canStart: false,
        blockedTeams,
        message: `${blockedTeams.join(", ")} ${blockedTeams.length > 1 ? "have" : "has"} outstanding fines. Payment required or admin override needed.`,
      };
    }

    return { canStart: true, blockedTeams: [] };
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
        minRosterSize: input.minRosterSize ?? 11,
        maxRosterSize: input.maxRosterSize ?? 18,
        maxTeams: input.maxTeams ?? 24,
        status: input.status ?? "Open",
        rosterLocked: false,
        durationSec: input.durationSec ?? (90 * 60),
        createdAt: Date.now(),
        underageRules: input.underageRules,
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
    fieldLocation?: FieldLocation;
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
      fieldLocation: matchData.fieldLocation || null,
      notificationsSent: {
        thirtyMinAlert: false,
        fifteenMinAlert: false,
        gameStarting: false,
      },
    };

    setMatches((prev) => [...(prev ?? []), newMatch]);

    return matchId;
  };

  // ✅ FIXED addPlayer function
  const addPlayer = (input: AddPlayerInput) => {
    const fullName = String(input?.fullName ?? "").trim();
    const id = uid("player");
    
    if (!fullName) {
      return { ok: false, reason: "Player name is required", id };
    }

    const tournamentId = input.tournamentId ?? null;
    const tournament = tournamentId ? tournaments.find(t => t.id === tournamentId) : null;

    // ✅ CHECK 1: Roster locked?
    if (tournament?.rosterLocked) {
      return { ok: false, reason: "Roster is locked. Cannot add players.", id };
    }

    // ✅ CHECK 2: Can modify roster (stage check)?
    if (tournamentId) {
      const rosterCheck = canModifyRoster(tournamentId);
      if (!rosterCheck.canModify) {
        return { ok: false, reason: rosterCheck.reason, id };
      }
    }

    // ✅ CHECK 3: Age validation (FIXED LOGIC)
    if (tournament && input.dob) {
      const age = calcAge(input.dob);
      
      // ✅ If tournament has NEW underage rules system, use it
      if (tournament.underageRules?.enabled) {
        const threshold = tournament.underageRules.ageThreshold;
        const isUnderaged = age < threshold;
        
        console.log("🔍 Age Check:", {
          playerAge: age,
          threshold: threshold,
          isUnderaged: isUnderaged,
          tournamentName: tournament.name
        });
        
        if (isUnderaged) {
          // Player is underaged - check if allowed
          const validation = canAddUnderagedPlayer(String(input.teamId), tournamentId);
          
          console.log("✅ Underage Validation:", validation);
          
          if (!validation.isValid) {
            // NOT allowed - block with reason
            return { ok: false, reason: validation.reason, id };
          }
          
          // IS allowed - continue to add player
          console.log("✅ Underaged player ALLOWED - adding to roster");
        } else {
          // Player is NOT underaged - they're old enough, allow
          console.log("✅ Player is", age, "- meets age threshold of", threshold);
        }
      } 
      // ✅ Fallback: If no underage rules, use OLD age rule system
      else {
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
    }

    // ✅ All checks passed - create player
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
        documentVerified: false,
        verificationStatus: 'PENDING',
        totalCheckIns: 0,
        checkInHistory: [],
        createdAt: Date.now(),
        userId: input.userId,
        motmWins: 0,
        motmNominations: 0,
      },
    ]);

    console.log("✅ Player added successfully:", fullName, "- ID:", id);
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

  const updatePlayerVerification = (input: UpdatePlayerVerificationInput): { ok: boolean; reason?: string } => {
    const player = players.find((p) => p.id === input.playerId);
    if (!player) {
      return { ok: false, reason: "Player not found" };
    }

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === input.playerId
          ? {
              ...p,
              documentType: input.documentType,
              documentVerified: true,
              documentVerificationDate: new Date().toISOString(),
              documentConfidence: input.documentConfidence,
              documentFrontUrl: input.documentFrontUrl,
              documentBackUrl: input.documentBackUrl,
              extractedName: input.extractedName,
              extractedDOB: input.extractedDOB,
              extractedAddress: input.extractedAddress,
              extractedDocumentNumber: input.extractedDocumentNumber,
              extractedExpiration: input.extractedExpiration,
              extractedState: input.extractedState,
              extractedCountry: input.extractedCountry,
              faceEmbedding: input.faceEmbedding,
              facePhotoUrl: input.facePhotoUrl,
              verificationStatus: input.verificationStatus,
              verified: input.verificationStatus === 'APPROVED',
            }
          : p
      )
    );

    return { ok: true };
  };

  const getVerifiedPlayer = (playerId: string): Player | null => {
    return players.find((p) => p.id === playerId) || null;
  };

  const recordCheckIn = (input: GameDayCheckInInput): { ok: boolean; reason?: string } => {
    const player = players.find((p) => p.id === input.playerId);
    if (!player) {
      return { ok: false, reason: "Player not found" };
    }

    if (!player.documentVerified) {
      return { ok: false, reason: "Player must complete document verification first" };
    }

    const checkInRecord: CheckInRecord = {
      id: uid("checkin"),
      matchId: input.matchId,
      playerId: input.playerId,
      timestamp: new Date().toISOString(),
      faceMatchScore: input.faceMatchScore,
      livenessScore: input.livenessScore,
      approved: input.faceMatchScore >= 95 && input.livenessScore >= 70,
      checkInDuration: 2000,
      refereeId: input.refereeId,
      deviceId: input.deviceId,
      photoUrl: input.livePhotoUrl,
      notes: null,
    };

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === input.playerId
          ? {
              ...p,
              lastCheckIn: checkInRecord.timestamp,
              totalCheckIns: (p.totalCheckIns || 0) + 1,
              checkInHistory: [...(p.checkInHistory || []), checkInRecord],
            }
          : p
      )
    );

    return { ok: true };
  };

  const getPlayerCheckIns = (playerId: string): CheckInRecord[] => {
    const player = players.find((p) => p.id === playerId);
    return player?.checkInHistory || [];
  };

  const markNotificationSent = (matchId: string, type: 'thirtyMinAlert' | 'fifteenMinAlert' | 'gameStarting') => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              notificationsSent: {
                ...m.notificationsSent,
                [type]: true,
              },
            }
          : m
      )
    );
  };

  const toggleRosterLock = (tournamentId: string) => {
    const id = String(tournamentId ?? "");
    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, rosterLocked: !t.rosterLocked } : t))
    );
  };

  const registerTeamForTournament = (input: {
    tournamentId: string;
    teamName: string;
    repName: string;
    repPhone: string;
  }) => {
    const tournament = tournaments.find(t => t.id === input.tournamentId);
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

    const tournament = tournaments.find(t => t.id === player.tournamentId);
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
      prev.map((m) => (m.id === matchId ? { ...m, isLive, status: isLive ? "LIVE" as MatchStatus : m.status } : m))
    );
    
    if (isLive) {
      setMatchPools((prev) =>
        prev.map(p => p.matchId === matchId ? { ...p, status: "LOCKED" as const } : p)
      );
    }
  };

  const updateMatchStatus = (matchId: string, status: MatchStatus) => {
    console.log(`✅ updateMatchStatus: ${matchId} -> ${status}`);
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, status } : m
      )
    );
  };

  const tickMatch = (matchId: string, seconds: number) => {
    setMatches((prev) =>
      prev.map((m) => {
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
      prev.map((m) =>
        m.id === matchId ? { ...m, clockSec: 0, isLive: false, status: "SCHEDULED" as MatchStatus } : m
      )
    );
  };

  const logMatchEvent = (input: { matchId: string; type: LoggedEventType; teamId: string; playerId?: string }) => {
    const match = matches.find(m => m.id === input.matchId);
    const clockSec = match?.clockSec ?? 0;
    const minute = Math.min(90, Math.floor(clockSec / 60));
    
    logEvent({
      matchId: input.matchId,
      type: input.type,
      teamId: input.teamId,
      playerId: input.playerId || null,
      minute,
    });

    if ((input.type === "YELLOW" || input.type === "RED") && input.playerId) {
      const player = players.find(p => p.id === input.playerId);
      if (player) {
        createCardFine({
          teamId: input.teamId,
          playerId: input.playerId,
          playerName: player.fullName,
          cardType: input.type === "YELLOW" ? "YELLOW" : "RED",
          matchId: input.matchId,
        });
      }
    }
  };

  const placeBet = (input: { matchId: string; pick: string; wagerCents: number; odds: number }) => {
    console.log("Bet placed:", input);
  };

  useEffect(() => {
    matches.forEach(match => {
      if (match.status === "FINAL") {
        const pool = matchPools.find(p => p.matchId === match.id);
        if (pool && pool.status !== "SETTLED") {
          setTimeout(() => settleMatchPool(match.id), 2000);
        }

        const award = motmAwards.find(a => a.matchId === match.id);
        if (!award) {
          setTimeout(() => determineMotm(match.id), 3000);
        }
      }
    });
  }, [matches.map(m => m.status).join(',')]);

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

    bettingTickets,
    matchPools,
    placeBettingTicket,
    getMatchPool,
    canUserBet,
    settleMatchPool,

    matchVotes,
    motmAwards,
    castMotmVote,
    getUserMotmVote,
    getMotmLeaderboard,
    determineMotm,
    getMotmAward,

    tournamentTemplates,
    createTournamentTemplate,
    updateTournamentTemplate,
    deleteTournamentTemplate,
    getTournamentTemplate,
    archiveTournamentTemplate,
    restoreTournamentTemplate,

    teamEligibility,
    cardFines,
    getTeamEligibility,
    overrideTeamEligibility,
    removeTeamEligibilityOverride,
    createCardFine,
    payCardFine,
    getTeamFines,
    getTeamUnpaidFines,
    canTeamPlayMatch,
    validateMatchEligibility,

    isPlayerUnderaged,
    getTeamUnderagedPlayers,
    canAddUnderagedPlayer,
    validateFieldLineup,
    canModifyRoster,

    getTeamsForTournament,
    getPlayersForTeam,
    getEventsForMatch,

    createTournament,
    createTeam,
    createMatch,
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
    updateMatchStatus,
    tickMatch,
    resetMatchClock,
    logMatchEvent,
    placeBet,

    updatePlayerVerification,
    getVerifiedPlayer,
    recordCheckIn,
    getPlayerCheckIns,
    markNotificationSent,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }
  return context;
}