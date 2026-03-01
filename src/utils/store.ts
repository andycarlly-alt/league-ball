// src/utils/store.ts
// Utility helpers for working with the AppStore

import type { LoggedEvent, Match, Player, Team } from "./models";

/**
 * Calculate team statistics from matches
 */
export function calculateTeamStats(teamId: string, matches: Match[], events: LoggedEvent[]) {
  const teamMatches = matches.filter(
    (m) => m.homeTeamId === teamId || m.awayTeamId === teamId
  );

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  teamMatches.forEach((match) => {
    if (match.status !== "FINAL") return;

    const isHome = match.homeTeamId === teamId;
    const matchEvents = events.filter((e) => e.matchId === match.id && e.type === "GOAL");

    const homeGoals = matchEvents.filter((e) => e.teamId === match.homeTeamId).length;
    const awayGoals = matchEvents.filter((e) => e.teamId === match.awayTeamId).length;

    const teamGoals = isHome ? homeGoals : awayGoals;
    const opponentGoals = isHome ? awayGoals : homeGoals;

    goalsFor += teamGoals;
    goalsAgainst += opponentGoals;

    if (teamGoals > opponentGoals) wins++;
    else if (teamGoals < opponentGoals) losses++;
    else draws++;
  });

  return {
    played: teamMatches.length,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: wins * 3 + draws,
  };
}

/**
 * Get score for a specific match from events
 */
export function getMatchScore(
  matchId: string,
  homeTeamId: string,
  awayTeamId: string,
  events: LoggedEvent[]
) {
  const goals = events.filter((e) => e.matchId === matchId && e.type === "GOAL");

  const homeGoals = goals.filter((e) => e.teamId === homeTeamId).length;
  const awayGoals = goals.filter((e) => e.teamId === awayTeamId).length;

  return { homeGoals, awayGoals };
}

/**
 * Get card counts for a team in a match
 */
export function getMatchCards(
  matchId: string,
  teamId: string,
  events: LoggedEvent[]
) {
  const teamEvents = events.filter((e) => e.matchId === matchId && e.teamId === teamId);

  const yellows = teamEvents.filter((e) => e.type === "YELLOW").length;
  const reds = teamEvents.filter((e) => e.type === "RED").length;

  return { yellows, reds };
}

/**
 * Check if a player is eligible for a tournament based on age
 */
export function isPlayerEligible(
  playerAge: number,
  tournamentAgeRule: string
): { eligible: boolean; reason?: string } {
  switch (tournamentAgeRule) {
    case "U30":
      if (playerAge >= 30) {
        return { eligible: false, reason: `Player is ${playerAge} years old. Tournament requires Under 30.` };
      }
      break;
    case "30_34":
      if (playerAge < 30 || playerAge > 34) {
        return { eligible: false, reason: `Player is ${playerAge} years old. Tournament requires 30-34 age bracket.` };
      }
      break;
    case "O35":
      if (playerAge < 35) {
        return { eligible: false, reason: `Player is ${playerAge} years old. Tournament requires 35 and over.` };
      }
      break;
  }
  return { eligible: true };
}

/**
 * Get player count for a team
 */
export function getPlayerCount(teamId: string, players: Player[]): number {
  return players.filter((p) => p.teamId === teamId).length;
}

/**
 * Get verified player count for a team
 */
export function getVerifiedPlayerCount(teamId: string, players: Player[]): number {
  return players.filter((p) => p.teamId === teamId && p.verified).length;
}

/**
 * Generate unique ID with prefix
 */
export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

/**
 * Sort teams by name alphabetically
 */
export function sortTeamsByName(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Sort players by name alphabetically
 */
export function sortPlayersByName(players: Player[]): Player[] {
  return [...players].sort((a, b) => a.fullName.localeCompare(b.fullName));
}

/**
 * Sort players by jersey number
 */
export function sortPlayersByNumber(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    const numA = parseInt(a.shirtNumber || "999");
    const numB = parseInt(b.shirtNumber || "999");
    return numA - numB;
  });
}

/**
 * Filter players by verification status
 */
export function filterPlayersByVerification(
  players: Player[],
  verified: boolean
): Player[] {
  return players.filter((p) => !!p.verified === verified);
}

/**
 * Get unique team IDs from a list of players
 */
export function getUniqueTeamIds(players: Player[]): string[] {
  return [...new Set(players.map((p) => p.teamId))];
}

/**
 * Check if roster is complete (all players verified)
 */
export function isRosterComplete(teamId: string, players: Player[]): boolean {
  const teamPlayers = players.filter((p) => p.teamId === teamId);
  if (teamPlayers.length === 0) return false;
  return teamPlayers.every((p) => p.verified);
}

/**
 * Get roster completion percentage
 */
export function getRosterCompletionPercentage(teamId: string, players: Player[]): number {
  const teamPlayers = players.filter((p) => p.teamId === teamId);
  if (teamPlayers.length === 0) return 0;
  const verified = teamPlayers.filter((p) => p.verified).length;
  return Math.round((verified / teamPlayers.length) * 100);
}