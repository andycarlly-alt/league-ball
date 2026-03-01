// src/state/AppStore.tsx
// ✅ COMPLETE APPSTORE WITH COMMUNITY HUB + SOCIAL FEATURES + BEREAVEMENT + PERSISTENCE

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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

// ✅ COMMUNITY HUB TYPES
export type BusinessCategory = 
  | 'RESTAURANT' 
  | 'SPORTS_GEAR' 
  | 'FITNESS' 
  | 'MEDICAL' 
  | 'AUTOMOTIVE'
  | 'REAL_ESTATE'
  | 'CONSTRUCTION'
  | 'PROFESSIONAL_SERVICES'
  | 'RETAIL'
  | 'ENTERTAINMENT'
  | 'OTHER';

export type Business = {
  id: string;
  name: string;
  category: BusinessCategory;
  description: string;
  ownerId?: string;
  ownerName: string;
  ownerTeamId?: string;
  ownerTeamName?: string;
  phone?: string;
  email?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string;
  bannerUrl?: string;
  photos?: string[];
  isPremium: boolean;
  isFeatured: boolean;
  featuredUntil?: number;
  tournamentId?: string | null;
  boothNumber?: string;
  boothLocation?: string;
  specialOffer?: string;
  discountCode?: string;
  discountPercent?: number;
  views: number;
  clicks: number;
  saves: number;
  createdAt: number;
  updatedAt?: number;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
};

export type VendorPackage = {
  id: string;
  name: string;
  type: 'MONTHLY' | 'TOURNAMENT' | 'ANNUAL';
  price: number;
  features: string[];
  isFeatured: boolean;
  includedListings: number;
  priority: number;
};

export type BusinessReview = {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: number;
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
  avatar?: string;
};

export type PaymentType =
  | "TOURNAMENT_REGISTRATION"
  | "SUBSCRIPTION"
  | "CARD_FEE"
  | "FINE_PAYMENT"
  | "SPONSOR"
  | "VENDOR_AD"
  | "TEAM_REGISTRATION"
  | "PLAYER_FEE"
  | "BUSINESS_LISTING";

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

// ✅ SOCIAL FEATURE TYPES
export type PostType = 'TEXT' | 'PHOTO' | 'VIDEO' | 'LOCATION' | 'ANNOUNCEMENT' | 'MATCH_HIGHLIGHT';
export type AuthorType = 'USER' | 'TEAM' | 'VENDOR' | 'LEAGUE';
export type ReactionType = 'LIKE' | 'LOVE' | 'FIRE' | 'CLAP' | 'CELEBRATE';
export type PostVisibility = 'PUBLIC' | 'TEAM_ONLY' | 'LEAGUE_ONLY';
export type PostStatus = 'ACTIVE' | 'FLAGGED' | 'REMOVED';

export interface PostLocation {
  latitude: number;
  longitude: number;
  address: string;
  name: string;
}

export interface Post {
  id: string;
  type: PostType;
  content: string;
  mediaUrls: string[];
  authorId: string;
  authorType: AuthorType;
  authorName: string;
  authorAvatar?: string;
  teamId?: string;
  teamName?: string;
  leagueId?: string;
  tournamentId?: string;
  matchId?: string;
  location?: PostLocation;
  hashtags: string[];
  mentions: string[];
  visibility: PostVisibility;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  status: PostStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  type: ReactionType;
  createdAt: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  parentCommentId?: string;
  likeCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  followingType: AuthorType;
  followingName: string;
  createdAt: number;
}

export interface SocialNotification {
  id: string;
  userId: string;
  type: 'LIKE' | 'COMMENT' | 'MENTION' | 'FOLLOW' | 'POST' | 'REPLY';
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  postId?: string;
  commentId?: string;
  content: string;
  isRead: boolean;
  createdAt: number;
}

// ✅ BEREAVEMENT TYPES
export type BereavementEnrollment = {
  id: string;
  teamId: string;
  memberId?: string;
  memberType: 'PLAYER' | 'FAMILY';
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  ssnLastFour?: string;
  email: string;
  phone: string;
  streetAddress: string;
  aptUnit?: string;
  city: string;
  state: string;
  zipCode: string;
  country: 'US' | 'CANADA';
  idType: string;
  idNumber?: string;
  idExpirationDate?: string;
  idIssuingState?: string;
  idDocumentUrl?: string;
  idVerified: boolean;
  proofType?: string;
  proofDocumentUrl?: string;
  proofVerified: boolean;
  primaryBeneficiaryFirstName: string;
  primaryBeneficiaryLastName: string;
  primaryBeneficiaryRelationship: string;
  primaryBeneficiaryPhone: string;
  primaryBeneficiaryEmail?: string;
  primaryBeneficiaryPercentage: number;
  secondaryBeneficiaryFirstName?: string;
  secondaryBeneficiaryLastName?: string;
  secondaryBeneficiaryRelationship?: string;
  secondaryBeneficiaryPhone?: string;
  secondaryBeneficiaryPercentage?: number;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'WITHDRAWN';
  enrolledAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  signatureData?: string;
  signedAt?: string;
  createdAt: number;
  updatedAt?: number;
};

export type BereavementEvent = {
  id: string;
  leagueId: string;
  fundName: string;
  deceasedMemberId: string;
  deceasedName: string;
  deceasedTeamId: string;
  deceasedTeamName: string;
  deceasedRole?: string;
  dateOfPassing: string;
  beneficiaryName: string;
  beneficiaryRelationship: string;
  beneficiaryPhone?: string;
  beneficiaryEmail?: string;
  amountPerMember: number;
  totalFundGoal: number;
  totalEnrolledMembers: number;
  paymentDeadline: string;
  deadline?: string;
  status: 'ACTIVE' | 'COLLECTING' | 'READY' | 'SUBMITTED' | 'COMPLETE';
  createdAt: number;
  createdBy?: string;
  completedAt?: number;
};

export type BereavementPayment = {
  id: string;
  eventId: string;
  teamId: string;
  memberId: string;
  enrollmentId: string;
  amount: number;
  paymentMethod?: string;
  status: 'PENDING' | 'PAID' | 'WAIVED';
  transactionId?: string;
  paidAt?: string;
  paidBy?: string;
  createdAt: number;
};

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

// ✅ ZUSTAND STORE INTERFACE
interface AppState {
  // Core state
  currentUser: User;
  leagues: League[];
  activeLeagueId: string;
  tournaments: Tournament[];
  teams: Team[];
  players: Player[];
  matches: Match[];
  matchEvents: LoggedEvent[];
  messages: Message[];
  payments: Payment[];
  announcements: Announcement[];
  transferLogs: TransferLog[];
  sponsorsAds: SponsorAd[];
  pendingPayments: PendingPayment[];
  walletBalance: number;
  bettingPools: BettingPool[];
  bettingTickets: BettingTicket[];
  matchPools: MatchPool[];
  matchVotes: MatchVote[];
  motmAwards: MotmAward[];
  tournamentTemplates: TournamentTemplate[];
  teamEligibility: Record<string, TeamEligibility>;
  cardFines: CardFine[];
  
  // ✅ COMMUNITY HUB STATE
  businesses: Business[];
  vendorPackages: VendorPackage[];
  businessReviews: BusinessReview[];
  
  // ✅ SOCIAL FEATURE STATE
  posts: Post[];
  reactions: Reaction[];
  comments: Comment[];
  userFollows: UserFollow[];
  socialNotifications: SocialNotification[];
  
  // ✅ BEREAVEMENT STATE
  bereavementEnrollments: BereavementEnrollment[];
  bereavementEvents: BereavementEvent[];
  bereavementPayments: BereavementPayment[];
  
  // Loading state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  // User actions
  setRole: (role: Role) => void;
  setSubscription: (s: SubscriptionStatus) => void;
  can: (permission: string, context?: { teamId?: string }) => boolean;
  
  // League actions
  setActiveLeagueId: (id: string) => void;
  setActiveLeague: (id: string) => void;
  
  // Tournament actions
  createTournament: (input: CreateTournamentInput) => { id: string };
  toggleRosterLock: (tournamentId: string) => void;
  
  // Team actions
  createTeam: (input: CreateTeamInput) => string;
  setTeamForRep: (teamId: string) => void;
  getTeamsForTournament: (tournamentId: string) => Team[];
  
  // Player actions
  addPlayer: (input: AddPlayerInput) => { ok: boolean; reason?: string; id?: string };
  removePlayer: (playerId: string) => void;
  invitePlayer: (input: InvitePlayerInput) => void;
  getPlayersForTeam: (teamId: string) => Player[];
  toggleVerifyPlayer: (playerId: string) => { ok: boolean; reason?: string };
  transferPlayer: (input: { playerId: string; toTeamId: string; by: string }) => { ok: boolean; reason?: string };
  updatePlayerVerification: (input: UpdatePlayerVerificationInput) => { ok: boolean; reason?: string };
  getVerifiedPlayer: (playerId: string) => Player | null;
  recordCheckIn: (input: GameDayCheckInInput) => { ok: boolean; reason?: string };
  getPlayerCheckIns: (playerId: string) => CheckInRecord[];
  
  // Match actions
  createMatch: (matchData: any) => string;
  setMatchLive: (matchId: string, isLive: boolean) => void;
  updateMatchStatus: (matchId: string, status: MatchStatus) => void;
  tickMatch: (matchId: string, seconds: number) => void;
  resetMatchClock: (matchId: string) => void;
  logMatchEvent: (input: any) => void;
  logEvent: (input: any) => void;
  getEventsForMatch: (matchId: string) => LoggedEvent[];
  markNotificationSent: (matchId: string, type: string) => void;
  
  // Payment actions
  addPendingPayment: (payment: PendingPayment) => void;
  markPaymentPaid: (paymentId: string) => void;
  getPendingPayments: () => PendingPayment[];
  addToWallet: (amountCents: number) => void;
  deductFromWallet: (amountCents: number) => void;
  createPaymentIntent: (input: any) => string;
  startCheckout: (plan: string) => Promise<{ ok: boolean; reason?: string }>;
  restorePurchases: () => Promise<{ ok: boolean; reason?: string }>;
  
  // Betting actions
  addBetToPool: (bet: Bet) => void;
  getPoolForMatch: (matchId: string) => BettingPool | undefined;
  placeBettingTicket: (ticket: any) => string | null;
  getMatchPool: (matchId: string) => MatchPool | null;
  settleMatchPool: (matchId: string) => void;
  canUserBet: (matchId: string, userId: string) => { canBet: boolean; reason?: string };
  placeBet: (input: any) => void;
  
  // MOTM actions
  castMotmVote: (matchId: string, playerId: string) => { ok: boolean; reason?: string };
  getUserMotmVote: (matchId: string, userId: string) => MatchVote | null;
  getMotmLeaderboard: (matchId: string) => any[];
  determineMotm: (matchId: string) => void;
  getMotmAward: (matchId: string) => MotmAward | null;
  
  // Template actions
  createTournamentTemplate: (templateData: any) => string;
  updateTournamentTemplate: (templateId: string, updates: any) => void;
  deleteTournamentTemplate: (templateId: string) => void;
  getTournamentTemplate: (templateId: string) => TournamentTemplate | undefined;
  archiveTournamentTemplate: (templateId: string) => void;
  restoreTournamentTemplate: (templateId: string) => void;
  
  // Eligibility actions
  getTeamEligibility: (teamId: string) => TeamEligibility;
  overrideTeamEligibility: (teamId: string, reason: string) => { ok: boolean; message: string };
  removeTeamEligibilityOverride: (teamId: string) => { ok: boolean };
  createCardFine: (input: any) => string;
  payCardFine: (fineId: string) => { ok: boolean; message: string };
  getTeamFines: (teamId: string) => CardFine[];
  getTeamUnpaidFines: (teamId: string) => CardFine[];
  canTeamPlayMatch: (teamId: string) => { canPlay: boolean; reason?: string };
  validateMatchEligibility: (matchId: string) => any;
  
  // Underage validation actions
  isPlayerUnderaged: (playerId: string, tournamentId: string) => boolean;
  getTeamUnderagedPlayers: (teamId: string, tournamentId: string) => Player[];
  canAddUnderagedPlayer: (teamId: string, tournamentId: string) => UnderageValidation;
  validateFieldLineup: (matchId: string, teamId: string, playersOnField: string[]) => any;
  canModifyRoster: (tournamentId: string) => { canModify: boolean; reason?: string };
  
  // Messaging
  sendTeamMessage: (input: SendTeamMessageInput) => void;
  registerTeamForTournament: (input: any) => void;
  
  // ✅ COMMUNITY HUB ACTIONS
  createBusiness: (business: Omit<Business, 'id' | 'createdAt' | 'views' | 'clicks' | 'saves' | 'status'>) => string;
  updateBusiness: (id: string, updates: Partial<Business>) => void;
  deleteBusiness: (id: string) => void;
  getBusinessesByCity: (city: string) => Business[];
  getBusinessesByState: (state: string) => Business[];
  getBusinessesByCategory: (category: BusinessCategory) => Business[];
  getFeaturedBusinesses: () => Business[];
  getTournamentVendors: (tournamentId: string) => Business[];
  trackBusinessView: (businessId: string) => void;
  trackBusinessClick: (businessId: string) => void;
  saveBusinessForLater: (businessId: string, userId: string) => void;
  
  // ✅ SOCIAL ACTIONS
  createPost: (post: Omit<Post, 'id' | 'likeCount' | 'commentCount' | 'shareCount' | 'viewCount' | 'status' | 'createdAt' | 'updatedAt'>) => string;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  deletePost: (postId: string) => void;
  likePost: (postId: string, userId: string, userName: string, type?: ReactionType) => void;
  unlikePost: (postId: string, userId: string) => void;
  createComment: (comment: Omit<Comment, 'id' | 'likeCount' | 'createdAt' | 'updatedAt'>) => string;
  deleteComment: (commentId: string, postId: string) => void;
  followUser: (followerId: string, followingId: string, followingType: AuthorType, followingName: string) => void;
  unfollowUser: (followerId: string, followingId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  incrementPostView: (postId: string) => void;
  
  // ✅ BEREAVEMENT ACTIONS
  getBereavementEnrollmentStats: (teamId: string) => {
    total: number;
    pending: number;
    players: number;
    family: number;
  };
  getActiveBereavementEvent: () => BereavementEvent | null;
  getBereavementEventPayments: (eventId: string, teamId: string) => {
    paid: number;
    pending: number;
    total: number;
    amountCollected: number;
  };
}

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

// ✅ BUILD INITIAL STATE WITH ALL FEATURES
function buildInitialState() {
  const leagueId = "league_nvt_2026";
  const tourId = "tour_nvt_demo";
  const tourNortheast = "tour_northeast_2026";
  const tourDMV = "tour_dmv_2026";
  
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
      id: tourNortheast,
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
      id: tourDMV,
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
  
  // ✅ TEAMS
  const baseTeams = [
    { name: "Spartan Veterans FC", logoKey: "spartan" as LogoKey, wins: 5, draws: 2, losses: 1 },
    { name: "Lanham Veteran FC", logoKey: "lanham" as LogoKey, wins: 4, draws: 3, losses: 1 },
    { name: "Elite Veterans FC", logoKey: "elite" as LogoKey, wins: 4, draws: 2, losses: 2 },
    { name: "Balisao Veterans Club", logoKey: "balisao" as LogoKey, wins: 3, draws: 3, losses: 2 },
    { name: "Nova Vets", logoKey: "nova" as LogoKey, wins: 3, draws: 2, losses: 3 },
    { name: "Delaware Progressives", logoKey: "delaware-progressives" as LogoKey, wins: 2, draws: 4, losses: 2 },
    { name: "Veterans Football Club", logoKey: "vfc" as LogoKey, wins: 2, draws: 3, losses: 3 },
    { name: "Social Boyz", logoKey: "social-boyz" as LogoKey, wins: 2, draws: 2, losses: 4 },
    { name: "Baltimore Veteran FC", logoKey: "bvfc" as LogoKey, wins: 1, draws: 5, losses: 2 },
    { name: "Zoo Zoo", logoKey: "zoo-zoo" as LogoKey, wins: 1, draws: 3, losses: 4 },
    { name: "New England Veterans FC", logoKey: "nevt" as LogoKey, wins: 1, draws: 2, losses: 5 },
    { name: "Delaware Veterans Club", logoKey: "delaware-vets" as LogoKey, wins: 0, draws: 5, losses: 3 },
    { name: "NJ Ndamba Veterans FC", logoKey: "nj-ndamba" as LogoKey, wins: 0, draws: 3, losses: 5 },
    { name: "Landover FC", logoKey: "landover" as LogoKey, wins: 0, draws: 2, losses: 6 },
  ];

  const teams: Team[] = [];
  
  [tourId, tourNortheast, tourDMV].forEach((tournamentId) => {
    baseTeams.forEach((baseTeam, teamIndex) => {
      teams.push({
        id: `team_${tournamentId}_${teamIndex}`,
        leagueId,
        tournamentId,
        name: baseTeam.name,
        logoKey: baseTeam.logoKey,
        repName: "Team Rep",
        wins: baseTeam.wins,
        draws: baseTeam.draws,
        losses: baseTeam.losses,
      });
    });
  });
  
  const matches: Match[] = [
    {
      id: "match_1",
      leagueId,
      tournamentId: tourId,
      homeTeamId: `team_${tourId}_8`,
      awayTeamId: `team_${tourId}_0`,
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
      homeTeamId: `team_${tourId}_5`,
      awayTeamId: `team_${tourId}_2`,
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
      teamId: `team_${tourId}_8`,
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
      teamId: `team_${tourId}_8`,
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
      id: 'player_spartan_1',
      teamId: `team_${tourId}_0`,
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
      id: 'player_elite_1',
      teamId: `team_${tourId}_2`,
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
      id: 'player_dp_1',
      teamId: `team_${tourId}_5`,
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
  ];

  // ✅ COMMUNITY HUB - BUSINESSES
  const businesses: Business[] = [
    {
      id: 'biz_1',
      name: "Andy's Sports Grill",
      category: 'RESTAURANT',
      description: 'Best wings and craft beer in Baltimore. Team discounts available!',
      ownerName: 'Andy Kum',
      ownerId: 'player_bvfc_1',
      ownerTeamId: `team_${tourId}_8`,
      ownerTeamName: 'Baltimore Veteran FC',
      phone: '410-555-0123',
      email: 'andysgrill@email.com',
      address: '456 Sports Ave',
      city: 'Baltimore',
      state: 'MD',
      zipCode: '21201',
      latitude: 39.2904,
      longitude: -76.6122,
      isPremium: true,
      isFeatured: true,
      featuredUntil: Date.now() + 30 * 24 * 60 * 60 * 1000,
      specialOffer: '20% off for NVT players',
      discountCode: 'NVT20',
      discountPercent: 20,
      views: 234,
      clicks: 45,
      saves: 12,
      createdAt: Date.now(),
      status: 'ACTIVE',
    },
    {
      id: 'biz_2',
      name: 'Elite Fitness Center',
      category: 'FITNESS',
      description: 'State-of-the-art gym with veteran-friendly training programs',
      ownerName: 'Henry Atem',
      ownerId: 'player_elite_1',
      ownerTeamId: `team_${tourId}_2`,
      ownerTeamName: 'Elite Veterans FC',
      phone: '301-555-0456',
      email: 'info@elitefitness.com',
      website: 'www.elitefitness.com',
      address: '789 Wellness Blvd',
      city: 'Bethesda',
      state: 'MD',
      zipCode: '20814',
      latitude: 38.9847,
      longitude: -77.0947,
      isPremium: true,
      isFeatured: true,
      featuredUntil: Date.now() + 60 * 24 * 60 * 60 * 1000,
      specialOffer: 'Free month trial for veterans',
      views: 456,
      clicks: 89,
      saves: 23,
      createdAt: Date.now(),
      status: 'ACTIVE',
    },
    {
      id: 'biz_3',
      name: 'Pro Soccer Gear',
      category: 'SPORTS_GEAR',
      description: 'Complete soccer equipment, jerseys, and custom printing',
      ownerName: 'Mukong Adeso',
      ownerId: 'player_spartan_1',
      ownerTeamId: `team_${tourId}_0`,
      ownerTeamName: 'Spartan Veterans FC',
      phone: '202-555-0789',
      email: 'sales@prosoccergear.com',
      website: 'www.prosoccergear.com',
      address: '321 Sports Complex Dr',
      city: 'Washington',
      state: 'DC',
      zipCode: '20001',
      latitude: 38.9072,
      longitude: -77.0369,
      isPremium: false,
      isFeatured: false,
      specialOffer: '15% off team orders',
      discountCode: 'TEAM15',
      discountPercent: 15,
      views: 189,
      clicks: 34,
      saves: 8,
      createdAt: Date.now(),
      status: 'ACTIVE',
    },
    {
      id: 'biz_4',
      name: 'Tournament Vendor - Jersey Printing',
      category: 'SPORTS_GEAR',
      description: 'Same-day custom jersey printing on-site at tournaments',
      ownerName: 'Jersey Pros LLC',
      address: 'Veterans Memorial Field',
      city: 'Baltimore',
      state: 'MD',
      zipCode: '21201',
      latitude: 39.2904,
      longitude: -76.6122,
      isPremium: true,
      isFeatured: false,
      tournamentId: tourId,
      boothNumber: 'A-12',
      boothLocation: 'Main entrance near Field 1',
      specialOffer: '$5 off per jersey for tournament teams',
      views: 567,
      clicks: 123,
      saves: 45,
      createdAt: Date.now(),
      status: 'ACTIVE',
    },
    {
      id: 'biz_5',
      name: 'Veterans Auto Repair',
      category: 'AUTOMOTIVE',
      description: 'Honest, veteran-owned auto service. We support our players!',
      ownerName: 'Valentine Esaka',
      ownerId: 'player_dp_1',
      ownerTeamId: `team_${tourId}_5`,
      ownerTeamName: 'Delaware Progressives',
      phone: '302-555-0234',
      email: 'service@vetsauto.com',
      address: '654 Mechanic Way',
      city: 'Wilmington',
      state: 'DE',
      zipCode: '19801',
      latitude: 39.7391,
      longitude: -75.5398,
      isPremium: false,
      isFeatured: true,
      featuredUntil: Date.now() + 15 * 24 * 60 * 60 * 1000,
      specialOffer: 'Free oil change with any service',
      views: 345,
      clicks: 67,
      saves: 19,
      createdAt: Date.now(),
      status: 'ACTIVE',
    },
  ];

  const vendorPackages: VendorPackage[] = [
    {
      id: 'pkg_1',
      name: 'Monthly Featured Listing',
      type: 'MONTHLY',
      price: 4900,
      features: ['Featured placement', 'Priority search', 'Analytics dashboard', 'Special offer badge'],
      isFeatured: true,
      includedListings: 1,
      priority: 3,
    },
    {
      id: 'pkg_2',
      name: 'Tournament Vendor Booth',
      type: 'TOURNAMENT',
      price: 15000,
      features: ['On-site booth', 'App listing', 'Geolocation pin', 'Push notifications', 'Tournament branding'],
      isFeatured: false,
      includedListings: 1,
      priority: 5,
    },
    {
      id: 'pkg_3',
      name: 'Annual Premium',
      type: 'ANNUAL',
      price: 49900,
      features: ['Year-round featured', 'Unlimited tournaments', '5 business listings', 'Priority support', 'Custom branding'],
      isFeatured: true,
      includedListings: 5,
      priority: 10,
    },
  ];
  
  const sponsorsAds: SponsorAd[] = [
    { id: "sp1", kind: "SPONSOR", name: "Jersey Printing Co", tagline: "Same-day names & numbers" },
    { id: "sp2", kind: "AD", name: "Local Sports Bar", tagline: "Watch all NVT matches here!" },
    { id: "sp3", kind: "SPONSOR", name: "Athletic Gear Shop", tagline: "20% off for NVT players" },
  ];
  
  const tournamentTemplates: TournamentTemplate[] = [
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
  ];

  // ✅ SOCIAL FEATURE - POSTS
  const posts: Post[] = [
    {
      id: 'post_1',
      type: 'PHOTO',
      content: 'Amazing game today! Our team fought hard and came out on top. Proud of every single player! 🏆⚽ #NVTLeague #SpartansFC',
      mediaUrls: ['https://picsum.photos/600/400?random=1'],
      authorId: 'player_spartan_1',
      authorType: 'USER',
      authorName: 'Mukong Adeso',
      authorAvatar: 'https://i.pravatar.cc/150?u=mukong',
      teamId: `team_${tourId}_0`,
      teamName: 'Spartan Veterans FC',
      leagueId: leagueId,
      hashtags: ['nvtleague', 'spartansfc'],
      mentions: [],
      visibility: 'PUBLIC',
      isPinned: false,
      likeCount: 24,
      commentCount: 8,
      shareCount: 3,
      viewCount: 156,
      status: 'ACTIVE',
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
      updatedAt: Date.now() - 2 * 60 * 60 * 1000,
    },
    {
      id: 'post_2',
      type: 'ANNOUNCEMENT',
      content: '📢 IMPORTANT: Spring Tournament registration is now open! Early bird discount ends Friday. Register your team today!',
      mediaUrls: [],
      authorId: leagueId,
      authorType: 'LEAGUE',
      authorName: 'NVT Veterans League',
      authorAvatar: 'https://i.pravatar.cc/150?u=league',
      leagueId: leagueId,
      hashtags: ['tournament', 'registration'],
      mentions: [],
      visibility: 'PUBLIC',
      isPinned: true,
      likeCount: 45,
      commentCount: 12,
      shareCount: 18,
      viewCount: 342,
      status: 'ACTIVE',
      createdAt: Date.now() - 5 * 60 * 60 * 1000,
      updatedAt: Date.now() - 5 * 60 * 60 * 1000,
    },
    {
      id: 'post_3',
      type: 'LOCATION',
      content: 'Come visit us at the tournament! Special NVT discount all weekend 🎁',
      mediaUrls: ['https://picsum.photos/600/400?random=2'],
      authorId: 'biz_5',
      authorType: 'VENDOR',
      authorName: 'Veterans Auto Repair',
      authorAvatar: 'https://i.pravatar.cc/150?u=autorepair',
      location: {
        latitude: 39.2904,
        longitude: -76.6122,
        address: '123 Main St, Baltimore, MD',
        name: 'Veterans Auto Repair',
      },
      hashtags: ['nvtleague', 'discount'],
      mentions: [],
      visibility: 'PUBLIC',
      isPinned: false,
      likeCount: 12,
      commentCount: 3,
      shareCount: 5,
      viewCount: 89,
      status: 'ACTIVE',
      createdAt: Date.now() - 8 * 60 * 60 * 1000,
      updatedAt: Date.now() - 8 * 60 * 60 * 1000,
    },
    {
      id: 'post_4',
      type: 'PHOTO',
      content: 'Training hard for the big game this weekend! Who\'s ready? 💪⚽',
      mediaUrls: [
        'https://picsum.photos/600/400?random=3',
        'https://picsum.photos/600/400?random=4',
      ],
      authorId: `team_${tourId}_2`,
      authorType: 'TEAM',
      authorName: 'Elite Veterans FC',
      authorAvatar: 'https://i.pravatar.cc/150?u=elite',
      teamId: `team_${tourId}_2`,
      teamName: 'Elite Veterans FC',
      leagueId: leagueId,
      hashtags: ['training', 'matchday'],
      mentions: ['player_elite_1'],
      visibility: 'PUBLIC',
      isPinned: false,
      likeCount: 31,
      commentCount: 15,
      shareCount: 7,
      viewCount: 203,
      status: 'ACTIVE',
      createdAt: Date.now() - 12 * 60 * 60 * 1000,
      updatedAt: Date.now() - 12 * 60 * 60 * 1000,
    },
    {
      id: 'post_5',
      type: 'TEXT',
      content: 'Huge shoutout to @Mukong Adeso for the hat trick today! Man of the Match performance! 🔥🔥🔥 #MOTM',
      mediaUrls: [],
      authorId: 'player_bvfc_1',
      authorType: 'USER',
      authorName: 'Andy Kum',
      authorAvatar: 'https://i.pravatar.cc/150?u=andy',
      teamId: `team_${tourId}_8`,
      teamName: 'Baltimore Veteran FC',
      leagueId: leagueId,
      hashtags: ['motm'],
      mentions: ['player_spartan_1'],
      visibility: 'PUBLIC',
      isPinned: false,
      likeCount: 18,
      commentCount: 6,
      shareCount: 2,
      viewCount: 95,
      status: 'ACTIVE',
      createdAt: Date.now() - 1 * 60 * 60 * 1000,
      updatedAt: Date.now() - 1 * 60 * 60 * 1000,
    },
  ];

  // ✅ SOCIAL FEATURE - REACTIONS
  const reactions: Reaction[] = [
    {
      id: 'reaction_1',
      postId: 'post_1',
      userId: 'player_bvfc_1',
      userName: 'Andy Kum',
      type: 'LIKE',
      createdAt: Date.now() - 1.5 * 60 * 60 * 1000,
    },
    {
      id: 'reaction_2',
      postId: 'post_1',
      userId: 'player_elite_1',
      userName: 'Henry Atem',
      type: 'FIRE',
      createdAt: Date.now() - 1 * 60 * 60 * 1000,
    },
    {
      id: 'reaction_3',
      postId: 'post_2',
      userId: 'player_spartan_1',
      userName: 'Mukong Adeso',
      type: 'CELEBRATE',
      createdAt: Date.now() - 4 * 60 * 60 * 1000,
    },
  ];

  // ✅ SOCIAL FEATURE - COMMENTS
  const comments: Comment[] = [
    {
      id: 'comment_1',
      postId: 'post_1',
      userId: 'player_bvfc_1',
      userName: 'Andy Kum',
      userAvatar: 'https://i.pravatar.cc/150?u=andy',
      content: 'Great game! You guys played amazing! 🔥',
      likeCount: 5,
      createdAt: Date.now() - 1.5 * 60 * 60 * 1000,
      updatedAt: Date.now() - 1.5 * 60 * 60 * 1000,
    },
    {
      id: 'comment_2',
      postId: 'post_1',
      userId: 'player_elite_1',
      userName: 'Henry Atem',
      userAvatar: 'https://i.pravatar.cc/150?u=henry',
      content: 'See you next week! Bring your A-game 💪',
      likeCount: 3,
      createdAt: Date.now() - 1 * 60 * 60 * 1000,
      updatedAt: Date.now() - 1 * 60 * 60 * 1000,
    },
    {
      id: 'comment_3',
      postId: 'post_2',
      userId: 'player_spartan_1',
      userName: 'Mukong Adeso',
      userAvatar: 'https://i.pravatar.cc/150?u=mukong',
      content: 'Just registered our team! Can\'t wait!',
      likeCount: 8,
      createdAt: Date.now() - 4 * 60 * 60 * 1000,
      updatedAt: Date.now() - 4 * 60 * 60 * 1000,
    },
  ];

  // ✅ SOCIAL FEATURE - FOLLOWS
  const userFollows: UserFollow[] = [
    {
      id: 'follow_1',
      followerId: 'player_spartan_1',
      followingId: `team_${tourId}_8`,
      followingType: 'TEAM',
      followingName: 'Baltimore Veteran FC',
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'follow_2',
      followerId: 'player_spartan_1',
      followingId: 'player_bvfc_1',
      followingType: 'USER',
      followingName: 'Andy Kum',
      createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    },
  ];

  // ✅ SOCIAL FEATURE - NOTIFICATIONS
  const socialNotifications: SocialNotification[] = [
    {
      id: 'notif_1',
      userId: 'player_spartan_1',
      type: 'LIKE',
      actorId: 'player_bvfc_1',
      actorName: 'Andy Kum',
      actorAvatar: 'https://i.pravatar.cc/150?u=andy',
      postId: 'post_1',
      content: 'liked your post',
      isRead: false,
      createdAt: Date.now() - 30 * 60 * 1000,
    },
    {
      id: 'notif_2',
      userId: 'player_spartan_1',
      type: 'COMMENT',
      actorId: 'player_elite_1',
      actorName: 'Henry Atem',
      actorAvatar: 'https://i.pravatar.cc/150?u=henry',
      postId: 'post_1',
      content: 'commented on your post',
      isRead: false,
      createdAt: Date.now() - 1 * 60 * 60 * 1000,
    },
  ];

  // ✅ BEREAVEMENT MOCK DATA
  const bereavementEnrollments: BereavementEnrollment[] = [
    {
      id: "enroll_001",
      teamId: `team_${tourId}_8`,
      memberId: "player_bvfc_1",
      memberType: "PLAYER",
      firstName: "Andy",
      lastName: "Kum",
      dateOfBirth: "1985-03-15",
      email: "andy.k@email.com",
      phone: "(410) 555-0123",
      streetAddress: "123 Main St",
      city: "Baltimore",
      state: "MD",
      zipCode: "21201",
      country: "US",
      idType: "US_DRIVERS_LICENSE",
      idVerified: true,
      proofVerified: true,
      primaryBeneficiaryFirstName: "Emily",
      primaryBeneficiaryLastName: "Kum",
      primaryBeneficiaryRelationship: "SPOUSE",
      primaryBeneficiaryPhone: "(410) 555-0124",
      primaryBeneficiaryPercentage: 100,
      status: "ACTIVE",
      enrolledAt: "2026-01-15T10:00:00Z",
      approvedAt: "2026-01-15T10:00:00Z",
      approvedBy: "admin_001",
      createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
    },
    {
      id: "enroll_002",
      teamId: `team_${tourId}_8`,
      memberId: "player_bvfc_2",
      memberType: "PLAYER",
      firstName: "David",
      lastName: "Martinez",
      dateOfBirth: "1987-07-22",
      email: "david.m@email.com",
      phone: "(410) 555-0234",
      streetAddress: "456 Oak Ave",
      city: "Baltimore",
      state: "MD",
      zipCode: "21202",
      country: "US",
      idType: "US_STATE_ID",
      idVerified: false,
      proofVerified: false,
      primaryBeneficiaryFirstName: "Maria",
      primaryBeneficiaryLastName: "Martinez",
      primaryBeneficiaryRelationship: "SPOUSE",
      primaryBeneficiaryPhone: "(410) 555-0235",
      primaryBeneficiaryPercentage: 100,
      status: "PENDING",
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    },
    {
      id: "enroll_003",
      teamId: `team_${tourId}_0`,
      memberType: "FAMILY",
      firstName: "Sarah",
      lastName: "Johnson",
      dateOfBirth: "1990-11-08",
      email: "sarah.j@email.com",
      phone: "(301) 555-0345",
      streetAddress: "789 Pine Rd",
      city: "Bethesda",
      state: "MD",
      zipCode: "20814",
      country: "US",
      idType: "US_DRIVERS_LICENSE",
      idVerified: true,
      proofVerified: true,
      primaryBeneficiaryFirstName: "Marcus",
      primaryBeneficiaryLastName: "Johnson",
      primaryBeneficiaryRelationship: "SPOUSE",
      primaryBeneficiaryPhone: "(301) 555-0346",
      primaryBeneficiaryPercentage: 100,
      status: "ACTIVE",
      enrolledAt: "2026-01-20T14:00:00Z",
      approvedAt: "2026-01-20T14:00:00Z",
      approvedBy: "admin_001",
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    },
  ];

  const bereavementEvents: BereavementEvent[] = [
    {
      id: "event_001",
      leagueId: leagueId,
      fundName: "Marcus Johnson Memorial Fund",
      deceasedMemberId: "deceased_001",
      deceasedName: "Marcus Johnson",
      deceasedTeamId: `team_${tourId}_0`,
      deceasedTeamName: "Spartan Veterans FC",
      dateOfPassing: "2026-02-10",
      beneficiaryName: "Sarah Johnson",
      beneficiaryRelationship: "Wife",
      beneficiaryPhone: "(301) 555-0346",
      amountPerMember: 500,
      totalFundGoal: 25000,
      totalEnrolledMembers: 4,
      paymentDeadline: "2026-02-29",
      deadline: "2026-02-29T23:59:59Z",
      status: "ACTIVE",
      createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    },
  ];

  const bereavementPayments: BereavementPayment[] = [
    {
      id: "payment_001",
      eventId: "event_001",
      teamId: `team_${tourId}_8`,
      memberId: "player_bvfc_1",
      enrollmentId: "enroll_001",
      amount: 500,
      paymentMethod: "wallet",
      status: "PAID",
      transactionId: "BF-2026-001-M-0001",
      paidAt: "2026-02-16T10:30:00Z",
      paidBy: "Team Rep",
      createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    },
    {
      id: "payment_002",
      eventId: "event_001",
      teamId: `team_${tourId}_8`,
      memberId: "player_bvfc_2",
      enrollmentId: "enroll_002",
      amount: 500,
      status: "PENDING",
      createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    },
    {
      id: "payment_003",
      eventId: "event_001",
      teamId: `team_${tourId}_0`,
      memberId: "family_001",
      enrollmentId: "enroll_003",
      amount: 500,
      status: "PENDING",
      createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    },
  ];
  
  return {
    leagues,
    activeLeagueId: leagueId,
    tournaments,
    teams,
    players,
    matches,
    sponsorsAds,
    tournamentTemplates,
    businesses,
    vendorPackages,
    posts,
    reactions,
    comments,
    userFollows,
    socialNotifications,
    bereavementEnrollments,
    bereavementEvents,
    bereavementPayments,
  };
}

// ✅ CREATE ZUSTAND STORE WITH PERSISTENCE
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const initialState = buildInitialState();
      
      return {
        // ✅ INITIAL STATE
        currentUser: {
          id: "user_demo",
          name: "Demo User",
          role: "LEAGUE_ADMIN",
          subscription: "FREE",
          teamId: null,
          avatar: 'https://i.pravatar.cc/150?u=demo',
        },
        leagues: initialState.leagues,
        activeLeagueId: initialState.activeLeagueId,
        tournaments: initialState.tournaments,
        teams: initialState.teams,
        players: initialState.players,
        matches: initialState.matches,
        matchEvents: [],
        messages: [],
        payments: [],
        announcements: [],
        transferLogs: [],
        sponsorsAds: initialState.sponsorsAds,
        pendingPayments: [],
        walletBalance: 2500,
        bettingPools: [],
        bettingTickets: [],
        matchPools: [],
        matchVotes: [],
        motmAwards: [],
        tournamentTemplates: initialState.tournamentTemplates,
        teamEligibility: {},
        cardFines: [],
        
        // ✅ COMMUNITY HUB STATE
        businesses: initialState.businesses,
        vendorPackages: initialState.vendorPackages || [],
        businessReviews: [],
        
        // ✅ SOCIAL FEATURE STATE
        posts: initialState.posts || [],
        reactions: initialState.reactions || [],
        comments: initialState.comments || [],
        userFollows: initialState.userFollows || [],
        socialNotifications: initialState.socialNotifications || [],
        
        // ✅ BEREAVEMENT STATE
        bereavementEnrollments: initialState.bereavementEnrollments || [],
        bereavementEvents: initialState.bereavementEvents || [],
        bereavementPayments: initialState.bereavementPayments || [],
        
        isLoading: false,
        
        // ✅ LOADING
        setLoading: (loading) => set({ isLoading: loading }),
        
        // ✅ USER ACTIONS
        setRole: (role) => set((state) => ({ 
          currentUser: { ...state.currentUser, role } 
        })),
        
        setSubscription: (subscription) => set((state) => ({ 
          currentUser: { ...state.currentUser, subscription } 
        })),
        
        can: (permission, context?) => {
          const { currentUser, leagues, activeLeagueId } = get();
          const role = currentUser.role;
          const activeLeague = leagues.find((l) => l.id === activeLeagueId);
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
        },
        
        // ✅ LEAGUE ACTIONS
        setActiveLeagueId: (id) => set({ activeLeagueId: id }),
        setActiveLeague: (id) => set({ activeLeagueId: id }),
        
        // ✅ TOURNAMENT ACTIONS
        createTournament: (input) => {
          const id = uid("tour");
          const { activeLeagueId } = get();
          
          set((state) => ({
            tournaments: [
              ...state.tournaments,
              {
                id,
                leagueId: input.leagueId ?? activeLeagueId,
                name: input.name,
                location: input.location ?? "",
                startDate: input.startDate ?? "",
                endDate: input.endDate ?? "",
                registrationFee: input.registrationFee ?? 0,
                ageRule: input.ageRule ?? "O35",
                ageRuleLabel: input.ageRuleLabel ?? "35+",
                ageBand: input.ageRuleLabel ?? "35+",
                minRosterSize: input.minRosterSize ?? 11,
                maxRosterSize: input.maxRosterSize ?? 18,
                maxTeams: input.maxTeams ?? 24,
                status: input.status ?? "Open",
                rosterLocked: false,
                durationSec: input.durationSec ?? (90 * 60),
                createdAt: Date.now(),
                underageRules: input.underageRules,
              },
            ],
          }));
          
          return { id };
        },
        
        toggleRosterLock: (tournamentId) => {
          set((state) => ({
            tournaments: state.tournaments.map((t) =>
              t.id === tournamentId ? { ...t, rosterLocked: !t.rosterLocked } : t
            ),
          }));
        },
        
        // ✅ TEAM ACTIONS
        createTeam: (input) => {
          const id = uid("team");
          const { activeLeagueId } = get();
          
          set((state) => ({
            teams: [
              ...state.teams,
              {
                id,
                leagueId: activeLeagueId,
                tournamentId: input.tournamentId ?? null,
                name: input.name,
                repName: input.repName ?? "",
                logoKey: input.logoKey ?? "placeholder",
              },
            ],
          }));
          
          return id;
        },
        
        setTeamForRep: (teamId) => {
          set((state) => ({
            currentUser: { ...state.currentUser, teamId },
          }));
        },
        
        getTeamsForTournament: (tournamentId) => {
          const { teams } = get();
          return teams.filter((t) => t.tournamentId === tournamentId);
        },
        
        // ✅ PLAYER ACTIONS
        addPlayer: (input) => {
          const id = uid("player");
          const { tournaments } = get();
          
          if (!input.fullName?.trim()) {
            return { ok: false, reason: "Player name is required", id };
          }

          const tournamentId = input.tournamentId ?? null;
          const tournament = tournamentId ? tournaments.find(t => t.id === tournamentId) : null;

          if (tournament?.rosterLocked) {
            return { ok: false, reason: "Roster is locked. Cannot add players.", id };
          }

          if (tournamentId) {
            const rosterCheck = get().canModifyRoster(tournamentId);
            if (!rosterCheck.canModify) {
              return { ok: false, reason: rosterCheck.reason, id };
            }
          }

          if (tournament && input.dob) {
            const age = calcAge(input.dob);
            
            if (tournament.underageRules?.enabled) {
              const threshold = tournament.underageRules.ageThreshold;
              const isUnderaged = age < threshold;
              
              if (isUnderaged) {
                const validation = get().canAddUnderagedPlayer(String(input.teamId), tournamentId);
                
                if (!validation.isValid) {
                  return { ok: false, reason: validation.reason, id };
                }
              }
            } else {
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

          set((state) => ({
            players: [
              ...state.players,
              {
                id,
                teamId: String(input.teamId),
                tournamentId,
                fullName: input.fullName.trim(),
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
            ],
          }));

          return { ok: true, id };
        },
        
        removePlayer: (playerId) => {
          set((state) => ({
            players: state.players.filter((p) => p.id !== playerId),
          }));
        },
        
        invitePlayer: (input) => {
          console.log("Invite sent to:", input.emailOrPhone);
        },
        
        getPlayersForTeam: (teamId) => {
          const { players } = get();
          return players.filter((p) => p.teamId === teamId);
        },
        
        toggleVerifyPlayer: (playerId) => {
          const { players } = get();
          const player = players.find((p) => p.id === playerId);
          
          if (!player) {
            return { ok: false, reason: "Player not found" };
          }

          set((state) => ({
            players: state.players.map((p) =>
              p.id === playerId
                ? {
                    ...p,
                    verified: !p.verified,
                    verificationNote: !p.verified ? "Verified by admin" : undefined,
                  }
                : p
            ),
          }));

          return { ok: true };
        },
        
        transferPlayer: (input) => {
          const { players, teams, tournaments } = get();
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
          
          set((state) => ({
            players: state.players.map((p) =>
              p.id === input.playerId ? { ...p, teamId: input.toTeamId } : p
            ),
            transferLogs: [
              ...state.transferLogs,
              {
                id: uid("transfer"),
                tournamentId: String(player.tournamentId ?? ""),
                playerId: input.playerId,
                fromTeamId,
                toTeamId: input.toTeamId,
                by: input.by,
                createdAt: Date.now(),
              },
            ],
          }));

          return { ok: true };
        },
        
        updatePlayerVerification: (input) => {
          const { players } = get();
          const player = players.find((p) => p.id === input.playerId);
          
          if (!player) {
            return { ok: false, reason: "Player not found" };
          }

          set((state) => ({
            players: state.players.map((p) =>
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
            ),
          }));

          return { ok: true };
        },
        
        getVerifiedPlayer: (playerId) => {
          const { players } = get();
          return players.find((p) => p.id === playerId) || null;
        },
        
        recordCheckIn: (input) => {
          const { players } = get();
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

          set((state) => ({
            players: state.players.map((p) =>
              p.id === input.playerId
                ? {
                    ...p,
                    lastCheckIn: checkInRecord.timestamp,
                    totalCheckIns: (p.totalCheckIns || 0) + 1,
                    checkInHistory: [...(p.checkInHistory || []), checkInRecord],
                  }
                : p
            ),
          }));

          return { ok: true };
        },
        
        getPlayerCheckIns: (playerId) => {
          const { players } = get();
          const player = players.find((p) => p.id === playerId);
          return player?.checkInHistory || [];
        },
        
        // ✅ MATCH ACTIONS
        createMatch: (matchData) => {
          const matchId = uid("match");
          
          set((state) => ({
            matches: [
              ...state.matches,
              {
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
              },
            ],
          }));

          return matchId;
        },
        
        setMatchLive: (matchId, isLive) => {
          set((state) => ({
            matches: state.matches.map((m) =>
              m.id === matchId ? { ...m, isLive, status: isLive ? "LIVE" : m.status } : m
            ),
            matchPools: state.matchPools.map((p) =>
              p.matchId === matchId ? { ...p, status: "LOCKED" } : p
            ),
          }));
        },
        
        updateMatchStatus: (matchId, status) => {
          set((state) => ({
            matches: state.matches.map((m) =>
              m.id === matchId ? { ...m, status } : m
            ),
          }));
        },
        
        tickMatch: (matchId, seconds) => {
          set((state) => ({
            matches: state.matches.map((m) => {
              if (m.id === matchId) {
                const clockSec = (m.clockSec ?? 0) + seconds;
                return { ...m, clockSec };
              }
              return m;
            }),
          }));
        },
        
        resetMatchClock: (matchId) => {
          set((state) => ({
            matches: state.matches.map((m) =>
              m.id === matchId ? { ...m, clockSec: 0, isLive: false, status: "SCHEDULED" } : m
            ),
          }));
        },
        
        logMatchEvent: (input) => {
          const { matches, players } = get();
          const match = matches.find(m => m.id === input.matchId);
          const clockSec = match?.clockSec ?? 0;
          const minute = Math.min(90, Math.floor(clockSec / 60));
          
          get().logEvent({
            matchId: input.matchId,
            type: input.type,
            teamId: input.teamId,
            playerId: input.playerId || null,
            minute,
          });

          if ((input.type === "YELLOW" || input.type === "RED") && input.playerId) {
            const player = players.find(p => p.id === input.playerId);
            if (player) {
              get().createCardFine({
                teamId: input.teamId,
                playerId: input.playerId,
                playerName: player.fullName,
                cardType: input.type === "YELLOW" ? "YELLOW" : "RED",
                matchId: input.matchId,
              });
            }
          }
        },
        
        logEvent: (input) => {
          set((state) => ({
            matchEvents: [
              ...state.matchEvents,
              {
                id: uid("evt"),
                matchId: input.matchId,
                type: input.type,
                teamId: input.teamId,
                playerId: input.playerId || null,
                minute: input.minute ?? null,
                createdAt: Date.now(),
              },
            ],
            matches: state.matches.map((m) =>
              m.id === input.matchId && m.status === "SCHEDULED"
                ? { ...m, status: "LIVE" }
                : m
            ),
          }));
        },
        
        getEventsForMatch: (matchId) => {
          const { matchEvents } = get();
          return matchEvents.filter((e) => e.matchId === matchId);
        },
        
        markNotificationSent: (matchId, type) => {
          set((state) => ({
            matches: state.matches.map((m) =>
              m.id === matchId
                ? {
                    ...m,
                    notificationsSent: {
                      ...m.notificationsSent,
                      [type]: true,
                    },
                  }
                : m
            ),
          }));
        },
        
        // ✅ PAYMENT ACTIONS
        addPendingPayment: (payment) => {
          set((state) => ({
            pendingPayments: [...state.pendingPayments, payment],
          }));
        },
        
        markPaymentPaid: (paymentId) => {
          set((state) => ({
            pendingPayments: state.pendingPayments.map((p) =>
              p.id === paymentId ? { ...p, status: "PAID" } : p
            ),
            payments: state.payments.map((p) =>
              p.id === paymentId ? { ...p, status: "PAID" } : p
            ),
          }));
        },
        
        getPendingPayments: () => {
          const { pendingPayments } = get();
          return pendingPayments.filter((p) => p.status === "PENDING");
        },
        
        addToWallet: (amountCents) => {
          set((state) => ({
            walletBalance: state.walletBalance + amountCents,
          }));
        },
        
        deductFromWallet: (amountCents) => {
          set((state) => ({
            walletBalance: Math.max(0, state.walletBalance - amountCents),
          }));
        },
        
        createPaymentIntent: (input) => {
          const id = uid("pay");
          
          set((state) => ({
            payments: [
              ...state.payments,
              {
                id,
                type: input.type,
                amount: input.amount,
                currency: "USD",
                status: "PENDING",
                createdAt: Date.now(),
                meta: input.meta ?? {},
              },
            ],
          }));

          setTimeout(() => {
            set((state) => ({
              payments: state.payments.map((p) =>
                p.id === id ? { ...p, status: "PAID" } : p
              ),
            }));
          }, 600);

          return id;
        },
        
        startCheckout: async (plan) => {
          if (plan === "Pro") {
            set((state) => ({
              leagues: state.leagues.map((l) =>
                l.id === state.activeLeagueId ? { ...l, plan: "Pro" } : l
              ),
            }));
            return { ok: true };
          }
          return { ok: false, reason: "Invalid plan" };
        },
        
        restorePurchases: async () => {
          const { leagues, activeLeagueId } = get();
          const activeLeague = leagues.find((l) => l.id === activeLeagueId);
          
          if (activeLeague?.plan === "Pro") {
            return { ok: true };
          }
          return { ok: false, reason: "No active subscription found" };
        },
        
        // ✅ BETTING ACTIONS
        addBetToPool: (bet) => {
          set((state) => {
            const pool = state.bettingPools.find((p) => p.matchId === bet.matchId);
            
            if (pool) {
              return {
                bettingPools: state.bettingPools.map((p) =>
                  p.matchId === bet.matchId
                    ? { ...p, totalAmount: p.totalAmount + bet.amount, bets: [...p.bets, bet] }
                    : p
                ),
              };
            } else {
              return {
                bettingPools: [
                  ...state.bettingPools,
                  { matchId: bet.matchId, totalAmount: bet.amount, bets: [bet] },
                ],
              };
            }
          });
        },
        
        getPoolForMatch: (matchId) => {
          const { bettingPools } = get();
          return bettingPools.find((p) => p.matchId === matchId);
        },
        
        placeBettingTicket: (ticketData) => {
          const ticket: BettingTicket = {
            ...ticketData,
            id: uid("ticket"),
            placedAt: Date.now(),
            status: "PENDING",
          };
          
          set((state) => ({
            bettingTickets: [...state.bettingTickets, ticket],
            matchPools: (() => {
              const existingPool = state.matchPools.find(p => p.matchId === ticket.matchId);
              
              if (existingPool) {
                return state.matchPools.map(p =>
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
                  ...state.matchPools,
                  {
                    matchId: ticket.matchId,
                    totalPotCents: ticket.wagerCents,
                    ticketCount: 1,
                    status: "OPEN" as const,
                  },
                ];
              }
            })(),
          }));

          return ticket.id;
        },
        
        getMatchPool: (matchId) => {
          const { matchPools } = get();
          return matchPools.find(p => p.matchId === matchId) || null;
        },
        
        canUserBet: (matchId, userId) => {
          const { matches, players, currentUser } = get();
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
        },
        
        settleMatchPool: (matchId) => {
          const { matches, matchPools, bettingTickets, matchEvents } = get();
          const match = matches.find(m => m.id === matchId);
          
          if (!match || match.status !== "FINAL") return;
          
          const pool = matchPools.find(p => p.matchId === matchId);
          if (!pool || pool.status === "SETTLED") return;

          const events = matchEvents.filter(e => e.matchId === matchId && e.type === "GOAL");
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
            
            set((state) => ({
              bettingTickets: state.bettingTickets.map((ticket) => {
                if (perfectWinners.find(w => w.id === ticket.id)) {
                  get().addToWallet(payoutPerWinner);
                  return { ...ticket, status: "WON" as const };
                } else if (ticket.matchId === matchId) {
                  return { ...ticket, status: "LOST" as const };
                }
                return ticket;
              }),
            }));
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
              
              set((state) => ({
                bettingTickets: state.bettingTickets.map((ticket) => {
                  if (closestWinners.find(w => w.id === ticket.id)) {
                    get().addToWallet(payoutPerWinner);
                    return { ...ticket, status: "CLOSEST" as const };
                  } else if (ticket.matchId === matchId) {
                    return { ...ticket, status: "LOST" as const };
                  }
                  return ticket;
                }),
              }));
            }
          }

          set((state) => ({
            matchPools: state.matchPools.map(p => {
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
            }),
          }));
        },
        
        placeBet: (input) => {
          console.log("Bet placed:", input);
        },
        
        // ✅ MOTM ACTIONS
        castMotmVote: (matchId, playerId) => {
          const { matches, players, matchVotes, currentUser } = get();
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
            set((state) => ({
              matchVotes: state.matchVotes.map(v =>
                v.id === existingVote.id
                  ? {
                      ...v,
                      playerId,
                      playerName: player.fullName,
                      teamId: player.teamId,
                      votedAt: Date.now(),
                    }
                  : v
              ),
            }));
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
            
            set((state) => ({
              matchVotes: [...state.matchVotes, newVote],
            }));
          }

          return { ok: true };
        },
        
        getUserMotmVote: (matchId, userId) => {
          const { matchVotes } = get();
          return matchVotes.find(v => v.matchId === matchId && v.userId === userId) || null;
        },
        
        getMotmLeaderboard: (matchId) => {
          const { matchVotes } = get();
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
        },
        
        determineMotm: (matchId) => {
          const { matches, matchVotes, motmAwards, teams } = get();
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

          set((state) => ({
            motmAwards: [...state.motmAwards, award],
            players: state.players.map(p =>
              p.id === winner.playerId
                ? {
                    ...p,
                    motmWins: (p.motmWins || 0) + 1,
                    motmNominations: (p.motmNominations || 0) + 1,
                  }
                : p
            ),
          }));

          console.log(`🏆 MOTM: ${winner.playerName} won $25 with ${winner.count} votes!`);
        },
        
        getMotmAward: (matchId) => {
          const { motmAwards } = get();
          return motmAwards.find(a => a.matchId === matchId) || null;
        },
        
        // ✅ TEMPLATE ACTIONS
        createTournamentTemplate: (templateData) => {
          const { currentUser } = get();
          const newTemplate: TournamentTemplate = {
            ...templateData,
            id: uid("template"),
            createdAt: Date.now(),
            createdBy: currentUser.id,
          };
          
          set((state) => ({
            tournamentTemplates: [...state.tournamentTemplates, newTemplate],
          }));
          
          return newTemplate.id;
        },
        
        updateTournamentTemplate: (templateId, updates) => {
          set((state) => ({
            tournamentTemplates: state.tournamentTemplates.map((template) =>
              template.id === templateId
                ? { ...template, ...updates }
                : template
            ),
          }));
        },
        
        deleteTournamentTemplate: (templateId) => {
          set((state) => ({
            tournamentTemplates: state.tournamentTemplates.filter((t) => t.id !== templateId),
          }));
        },
        
        getTournamentTemplate: (templateId) => {
          const { tournamentTemplates } = get();
          return tournamentTemplates.find((t) => t.id === templateId);
        },
        
        archiveTournamentTemplate: (templateId) => {
          get().updateTournamentTemplate(templateId, { status: "ARCHIVED" });
        },
        
        restoreTournamentTemplate: (templateId) => {
          get().updateTournamentTemplate(templateId, { status: "ACTIVE" });
        },
        
        // ✅ ELIGIBILITY ACTIONS
        getTeamEligibility: (teamId) => {
          const { teamEligibility, cardFines } = get();
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
        },
        
        overrideTeamEligibility: (teamId, reason) => {
          const { currentUser } = get();
          
          if (!get().can("MANAGE_TOURNAMENTS")) {
            return { ok: false, message: "Only league admins can override eligibility" };
          }

          const eligibility = get().getTeamEligibility(teamId);
          
          if (eligibility.isEligible && !eligibility.adminOverride) {
            return { ok: false, message: "Team is already eligible" };
          }

          set((state) => ({
            teamEligibility: {
              ...state.teamEligibility,
              [teamId]: {
                ...eligibility,
                isEligible: true,
                adminOverride: true,
                overrideBy: currentUser.name,
                overrideAt: Date.now(),
                overrideReason: reason,
              },
            },
          }));

          return { 
            ok: true, 
            message: `Team cleared to play. Override expires after next match or when fines are paid.` 
          };
        },
        
        removeTeamEligibilityOverride: (teamId) => {
          if (!get().can("MANAGE_TOURNAMENTS")) {
            return { ok: false };
          }

          set((state) => {
            const updated = { ...state.teamEligibility };
            delete updated[teamId];
            return { teamEligibility: updated };
          });

          return { ok: true };
        },
        
        createCardFine: (input) => {
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

          set((state) => ({
            cardFines: [...state.cardFines, fine],
          }));

          get().addPendingPayment({
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

          const { teamEligibility } = get();
          if (teamEligibility[input.teamId]?.adminOverride) {
            get().removeTeamEligibilityOverride(input.teamId);
          }

          return fine.id;
        },
        
        payCardFine: (fineId) => {
          const { cardFines, walletBalance, teamEligibility } = get();
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

          get().deductFromWallet(fine.amount);

          set((state) => ({
            cardFines: state.cardFines.map(f =>
              f.id === fineId
                ? { ...f, status: "PAID" as const, paidAt: Date.now() }
                : f
            ),
          }));

          get().markPaymentPaid(fineId);

          const teamFines = cardFines.filter(
            f => f.teamId === fine.teamId && f.status === "PENDING" && f.id !== fineId
          );
          
          if (teamFines.length === 0 && teamEligibility[fine.teamId]?.adminOverride) {
            get().removeTeamEligibilityOverride(fine.teamId);
          }

          return { ok: true, message: "Fine paid successfully" };
        },
        
        getTeamFines: (teamId) => {
          const { cardFines } = get();
          return cardFines.filter(f => f.teamId === teamId);
        },
        
        getTeamUnpaidFines: (teamId) => {
          const { cardFines } = get();
          return cardFines.filter(f => f.teamId === teamId && f.status === "PENDING");
        },
        
        canTeamPlayMatch: (teamId) => {
          const eligibility = get().getTeamEligibility(teamId);
          
          if (eligibility.isEligible) {
            return { canPlay: true };
          }

          return {
            canPlay: false,
            reason: eligibility.blockedReason,
          };
        },
        
        validateMatchEligibility: (matchId) => {
          const { matches, teams } = get();
          const match = matches.find(m => m.id === matchId);
          
          if (!match) {
            return { canStart: false, blockedTeams: [], message: "Match not found" };
          }

          const homeEligibility = get().canTeamPlayMatch(match.homeTeamId);
          const awayEligibility = get().canTeamPlayMatch(match.awayTeamId);

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
        },
        
        // ✅ UNDERAGE VALIDATION ACTIONS
        isPlayerUnderaged: (playerId, tournamentId) => {
          const { players, tournaments } = get();
          const player = players.find(p => p.id === playerId);
          const tournament = tournaments.find(t => t.id === tournamentId);
          
          if (!player || !tournament?.underageRules?.enabled) return false;
          
          const age = calcAge(player.dob);
          return age < tournament.underageRules.ageThreshold;
        },
        
        getTeamUnderagedPlayers: (teamId, tournamentId) => {
          const { players, tournaments } = get();
          const tournament = tournaments.find(t => t.id === tournamentId);
          
          if (!tournament?.underageRules?.enabled) return [];
          
          return players.filter(p => 
            p.teamId === teamId && 
            p.tournamentId === tournamentId &&
            get().isPlayerUnderaged(p.id, tournamentId)
          );
        },
        
        canAddUnderagedPlayer: (teamId, tournamentId) => {
          const { tournaments } = get();
          const tournament = tournaments.find(t => t.id === tournamentId);
          
          if (!tournament?.underageRules?.enabled) {
            return { isValid: true, currentUnderaged: 0, maxAllowed: 999 };
          }
          
          const underagedPlayers = get().getTeamUnderagedPlayers(teamId, tournamentId);
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
        },
        
        validateFieldLineup: (matchId, teamId, playersOnField) => {
          const { matches, tournaments } = get();
          const match = matches.find(m => m.id === matchId);
          
          if (!match) return { isValid: false, reason: "Match not found" };
          
          const tournament = tournaments.find(t => t.id === match.tournamentId);
          if (!tournament?.underageRules?.enabled || !tournament.underageRules.maxUnderagedOnField) {
            return { isValid: true };
          }
          
          const underagedOnField = playersOnField.filter(playerId => 
            get().isPlayerUnderaged(playerId, match.tournamentId || "")
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
        },
        
        canModifyRoster: (tournamentId) => {
          const { tournaments } = get();
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
        },
        
        // ✅ MESSAGING
        sendTeamMessage: (input) => {
          const { currentUser } = get();
          
          if (!input.teamId || !input.body?.trim()) return;
          
          set((state) => ({
            messages: [
              ...state.messages,
              {
                id: uid("msg"),
                type: "TEAM",
                teamId: input.teamId,
                body: input.body.trim(),
                senderName: input.senderName ?? currentUser.name,
                createdAt: Date.now(),
              },
            ],
          }));
        },
        
        registerTeamForTournament: (input) => {
          const { tournaments, currentUser } = get();
          const tournament = tournaments.find(t => t.id === input.tournamentId);
          
          if (!tournament) return;
          
          const teamId = get().createTeam({
            name: input.teamName,
            repName: input.repName,
            tournamentId: input.tournamentId,
          });

          if (currentUser.role === "TEAM_REP") {
            set((state) => ({
              currentUser: { ...state.currentUser, teamId },
            }));
          }
        },
        
        // ✅ COMMUNITY HUB ACTIONS
        createBusiness: (businessData) => {
          const newBusiness: Business = {
            ...businessData,
            id: uid('biz'),
            views: 0,
            clicks: 0,
            saves: 0,
            createdAt: Date.now(),
            status: 'ACTIVE',
          };
          
          set((state) => ({
            businesses: [...state.businesses, newBusiness],
          }));
          
          return newBusiness.id;
        },
        
        updateBusiness: (id, updates) => {
          set((state) => ({
            businesses: state.businesses.map((b) =>
              b.id === id ? { ...b, ...updates, updatedAt: Date.now() } : b
            ),
          }));
        },
        
        deleteBusiness: (id) => {
          set((state) => ({
            businesses: state.businesses.filter((b) => b.id !== id),
          }));
        },
        
        getBusinessesByCity: (city) => {
          const { businesses } = get();
          return businesses.filter((b) => b.city === city && b.status === 'ACTIVE');
        },
        
        getBusinessesByState: (state) => {
          const { businesses } = get();
          return businesses.filter((b) => b.state === state && b.status === 'ACTIVE');
        },
        
        getBusinessesByCategory: (category) => {
          const { businesses } = get();
          return businesses.filter((b) => b.category === category && b.status === 'ACTIVE');
        },
        
        getFeaturedBusinesses: () => {
          const { businesses } = get();
          const now = Date.now();
          return businesses.filter(
            (b) => b.isFeatured && 
                   b.status === 'ACTIVE' && 
                   (!b.featuredUntil || b.featuredUntil > now)
          );
        },
        
        getTournamentVendors: (tournamentId) => {
          const { businesses } = get();
          return businesses.filter(
            (b) => b.tournamentId === tournamentId && b.status === 'ACTIVE'
          );
        },
        
        trackBusinessView: (businessId) => {
          set((state) => ({
            businesses: state.businesses.map((b) =>
              b.id === businessId ? { ...b, views: b.views + 1 } : b
            ),
          }));
        },
        
        trackBusinessClick: (businessId) => {
          set((state) => ({
            businesses: state.businesses.map((b) =>
              b.id === businessId ? { ...b, clicks: b.clicks + 1 } : b
            ),
          }));
        },
        
        saveBusinessForLater: (businessId, userId) => {
          set((state) => ({
            businesses: state.businesses.map((b) =>
              b.id === businessId ? { ...b, saves: b.saves + 1 } : b
            ),
          }));
        },
        
        // ✅ SOCIAL ACTIONS
        createPost: (postData) => {
          const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newPost: Post = {
            ...postData,
            id: postId,
            likeCount: 0,
            commentCount: 0,
            shareCount: 0,
            viewCount: 0,
            status: 'ACTIVE',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          set((state) => ({
            posts: [newPost, ...state.posts],
          }));
          
          return postId;
        },
        
        updatePost: (postId, updates) => {
          set((state) => ({
            posts: state.posts.map((p) =>
              p.id === postId
                ? { ...p, ...updates, updatedAt: Date.now() }
                : p
            ),
          }));
        },
        
        deletePost: (postId) => {
          set((state) => ({
            posts: state.posts.filter((p) => p.id !== postId),
            reactions: state.reactions.filter((r) => r.postId !== postId),
            comments: state.comments.filter((c) => c.postId !== postId),
          }));
        },
        
        likePost: (postId, userId, userName, type = 'LIKE') => {
          const reactionId = `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newReaction: Reaction = {
            id: reactionId,
            postId,
            userId,
            userName,
            type,
            createdAt: Date.now(),
          };
          
          set((state) => ({
            reactions: [...state.reactions, newReaction],
            posts: state.posts.map((p) =>
              p.id === postId
                ? { ...p, likeCount: p.likeCount + 1 }
                : p
            ),
          }));
        },
        
        unlikePost: (postId, userId) => {
          set((state) => ({
            reactions: state.reactions.filter(
              (r) => !(r.postId === postId && r.userId === userId)
            ),
            posts: state.posts.map((p) =>
              p.id === postId
                ? { ...p, likeCount: Math.max(0, p.likeCount - 1) }
                : p
            ),
          }));
        },
        
        createComment: (commentData) => {
          const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newComment: Comment = {
            ...commentData,
            id: commentId,
            likeCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          set((state) => ({
            comments: [...state.comments, newComment],
            posts: state.posts.map((p) =>
              p.id === commentData.postId
                ? { ...p, commentCount: p.commentCount + 1 }
                : p
            ),
          }));
          
          return commentId;
        },
        
        deleteComment: (commentId, postId) => {
          set((state) => ({
            comments: state.comments.filter((c) => c.id !== commentId),
            posts: state.posts.map((p) =>
              p.id === postId
                ? { ...p, commentCount: Math.max(0, p.commentCount - 1) }
                : p
            ),
          }));
        },
        
        followUser: (followerId, followingId, followingType, followingName) => {
          const followId = `follow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newFollow: UserFollow = {
            id: followId,
            followerId,
            followingId,
            followingType,
            followingName,
            createdAt: Date.now(),
          };
          
          set((state) => ({
            userFollows: [...state.userFollows, newFollow],
          }));
        },
        
        unfollowUser: (followerId, followingId) => {
          set((state) => ({
            userFollows: state.userFollows.filter(
              (f) => !(f.followerId === followerId && f.followingId === followingId)
            ),
          }));
        },
        
        markNotificationRead: (notificationId) => {
          set((state) => ({
            socialNotifications: state.socialNotifications.map((n) =>
              n.id === notificationId ? { ...n, isRead: true } : n
            ),
          }));
        },
        
        incrementPostView: (postId) => {
          set((state) => ({
            posts: state.posts.map((p) =>
              p.id === postId
                ? { ...p, viewCount: p.viewCount + 1 }
                : p
            ),
          }));
        },
        
        // ✅ BEREAVEMENT ACTIONS
        getBereavementEnrollmentStats: (teamId) => {
          const { bereavementEnrollments } = get();
          const teamEnrollments = bereavementEnrollments.filter(e => e.teamId === teamId);
          
          return {
            total: teamEnrollments.filter(e => e.status === 'ACTIVE').length,
            pending: teamEnrollments.filter(e => e.status === 'PENDING').length,
            players: teamEnrollments.filter(e => e.memberType === 'PLAYER' && e.status === 'ACTIVE').length,
            family: teamEnrollments.filter(e => e.memberType === 'FAMILY' && e.status === 'ACTIVE').length,
          };
        },
        
        getActiveBereavementEvent: () => {
          const { bereavementEvents } = get();
          return bereavementEvents.find(e => e.status === 'ACTIVE') || null;
        },
        
        getBereavementEventPayments: (eventId, teamId) => {
          const { bereavementPayments } = get();
          const payments = bereavementPayments.filter(
            p => p.eventId === eventId && p.teamId === teamId
          );
          
          return {
            paid: payments.filter(p => p.status === 'PAID').length,
            pending: payments.filter(p => p.status === 'PENDING').length,
            total: payments.length,
            amountCollected: payments
              .filter(p => p.status === 'PAID')
              .reduce((sum, p) => sum + p.amount, 0),
          };
        },
      };
    },
    {
      name: 'nvt-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      
      partialize: (state) => ({
        currentUser: state.currentUser,
        activeLeagueId: state.activeLeagueId,
        leagues: state.leagues,
        tournaments: state.tournaments,
        teams: state.teams,
        players: state.players,
        matches: state.matches,
        matchEvents: state.matchEvents,
        messages: state.messages,
        payments: state.payments,
        pendingPayments: state.pendingPayments,
        walletBalance: state.walletBalance,
        bettingTickets: state.bettingTickets,
        matchPools: state.matchPools,
        matchVotes: state.matchVotes,
        motmAwards: state.motmAwards,
        cardFines: state.cardFines,
        teamEligibility: state.teamEligibility,
        tournamentTemplates: state.tournamentTemplates,
        businesses: state.businesses,
        vendorPackages: state.vendorPackages,
        businessReviews: state.businessReviews,
        posts: state.posts,
        reactions: state.reactions,
        comments: state.comments,
        userFollows: state.userFollows,
        socialNotifications: state.socialNotifications,
        bereavementEnrollments: state.bereavementEnrollments,
        bereavementEvents: state.bereavementEvents,
        bereavementPayments: state.bereavementPayments,
      }),
    }
  )
);

export const useActiveLeague = () => {
  const leagues = useAppStore((state) => state.leagues);
  const activeLeagueId = useAppStore((state) => state.activeLeagueId);
  return leagues.find((l) => l.id === activeLeagueId) || null;
};

export const useMatchEvents = () => {
  return useAppStore((state) => state.matchEvents);
};