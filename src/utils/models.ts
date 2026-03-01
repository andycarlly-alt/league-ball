// src/utils/models.ts
// Central type exports for the app
// Re-exports types from AppStore for convenience

export type {
    Announcement, League, LoggedEvent, LoggedEventType, LogoKey, Match, MatchStatus, Message, Payment, PaymentType, Player, Role, SponsorAd, SubscriptionStatus, Team, TransferLog, User
} from "../state/AppStore";

// Additional utility types

/**
 * Generic API response type
 */
export type ApiResponse<T = void> = {
  ok: boolean;
  reason?: string;
  data?: T;
};

/**
 * Form validation result
 */
export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

/**
 * Loading state for async operations
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Pagination metadata
 */
export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

/**
 * Filter options for lists
 */
export type FilterOptions = {
  search?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
  filters?: Record<string, any>;
};

/**
 * Navigation route params (can be extended per screen)
 */
export type RouteParams = {
  id?: string;
  teamId?: string;
  tournamentId?: string;
  matchId?: string;
  playerId?: string;
};