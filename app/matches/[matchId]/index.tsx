// app/matches/[matchId]/index.tsx - PROPER MATCH DETAIL WITH BETTING

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppStore } from '../../../src/state/AppStore';
import { getLogoSource } from '../../../src/utils/logos';

export default function MatchDetailScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();

  const {
    matches,
    teams,
    players,
    getPlayersForTeam,
    getMatchPool,
    matchPools,
  } = useAppStore();

  const match = matches.find((m) => m.id === matchId);
  const homeTeam = teams.find((t) => t.id === match?.homeTeamId);
  const awayTeam = teams.find((t) => t.id === match?.awayTeamId);
  const pool = useMemo(() => getMatchPool(matchId), [matchId, matchPools]);

  const homePlayers = match ? getPlayersForTeam(match.homeTeamId) : [];
  const awayPlayers = match ? getPlayersForTeam(match.awayTeamId) : [];

  const stats = useMemo(() => {
    const homeCheckedIn = homePlayers.filter((p) => p.lastCheckIn).length;
    const awayCheckedIn = awayPlayers.filter((p) => p.lastCheckIn).length;
    const totalPlayers = homePlayers.length + awayPlayers.length;
    const totalCheckedIn = homeCheckedIn + awayCheckedIn;
    const percentComplete = totalPlayers > 0 ? Math.round((totalCheckedIn / totalPlayers) * 100) : 0;

    return {
      homeTotal: homePlayers.length,
      homeCheckedIn,
      awayTotal: awayPlayers.length,
      awayCheckedIn,
      totalPlayers,
      totalCheckedIn,
      percentComplete,
    };
  }, [homePlayers, awayPlayers]);

  if (!match) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Match not found</Text>
        </View>
      </View>
    );
  }

  const isScheduled = match.status === 'SCHEDULED' && !match.isLive;
  const isLive = match.status === 'LIVE' || match.isLive;
  const isFinal = match.status === 'FINAL';
  const isBettingOpen = isScheduled;
  
  const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back to Matches</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Details</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Match Info Card */}
        <View style={styles.matchCard}>
          {/* Match Status Badge */}
          <View style={[
            styles.statusBadge,
            isLive && styles.statusBadgeLive,
            isFinal && styles.statusBadgeFinal,
          ]}>
            <Text style={styles.statusText}>
              {isLive ? '🔴 LIVE' : isFinal ? '✅ FINAL' : '📅 SCHEDULED'}
            </Text>
          </View>

          {/* Teams */}
          <View style={styles.teamsRow}>
            <View style={styles.teamColumn}>
              <Image 
                source={getLogoSource(homeTeam?.logoKey)} 
                style={styles.teamLogo} 
              />
              <Text style={styles.teamName}>{homeTeam?.name || match.homeTeam}</Text>
            </View>

            <Text style={styles.vsText}>VS</Text>

            <View style={styles.teamColumn}>
              <Image 
                source={getLogoSource(awayTeam?.logoKey)} 
                style={styles.teamLogo} 
              />
              <Text style={styles.teamName}>{awayTeam?.name || match.awayTeam}</Text>
            </View>
          </View>

          {/* Match Details */}
          <View style={styles.matchDetails}>
            <Text style={styles.matchDetailText}>📅 {match.date || 'TBD'}</Text>
            <Text style={styles.matchDetailText}>⏰ {match.time || 'TBD'}</Text>
            <Text style={styles.matchDetailText}>📍 {match.field || 'Field TBD'}</Text>
          </View>
        </View>

        {/* 🎰 BETTING POOL CARD - ONLY SHOW IF SCHEDULED */}
        {isBettingOpen && (
          <TouchableOpacity
            onPress={() => router.push(`/betting/${matchId}`)}
            style={styles.bettingCard}
          >
            <View style={styles.bettingHeader}>
              <View style={styles.bettingLeft}>
                <Text style={styles.bettingIcon}>🎰</Text>
                <View>
                  <Text style={styles.bettingTitle}>Match Betting Pool</Text>
                  {pool ? (
                    <Text style={styles.bettingSubtitle}>
                      {pool.ticketCount} tickets • {formatMoney(pool.totalPotCents)} pot
                    </Text>
                  ) : (
                    <Text style={styles.bettingSubtitle}>
                      No bets yet - Be the first! 🎯
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.bettingStatus}>
                <Text style={styles.bettingStatusText}>OPEN</Text>
                <Text style={styles.bettingStatusIcon}>✅</Text>
              </View>
            </View>

            <View style={styles.bettingFooter}>
              <Text style={styles.bettingFooterText}>
                💰 Winner takes 90% of pot • Max payout $500
              </Text>
            </View>

            <View style={styles.bettingAction}>
              <Text style={styles.bettingActionText}>TAP TO PLACE BET →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Betting Closed Banner */}
        {!isBettingOpen && !isFinal && (
          <View style={styles.bettingClosedCard}>
            <Text style={styles.bettingClosedIcon}>🔒</Text>
            <Text style={styles.bettingClosedTitle}>Betting Closed</Text>
            <Text style={styles.bettingClosedText}>
              {isLive ? 'Match is live' : 'Match has ended'}
            </Text>
            {pool && pool.ticketCount > 0 && (
              <TouchableOpacity 
                onPress={() => router.push(`/betting/${matchId}`)}
                style={styles.viewTicketsButton}
              >
                <Text style={styles.viewTicketsText}>View {pool.ticketCount} Tickets →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Check-In Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>📊 Check-In Progress</Text>
          <Text style={styles.progressPercent}>{stats.percentComplete}%</Text>
          <Text style={styles.progressText}>
            {stats.totalCheckedIn}/{stats.totalPlayers} players checked in
          </Text>

          {/* Team Breakdown */}
          <View style={styles.teamProgressRow}>
            <View style={styles.teamProgress}>
              <Text style={styles.teamProgressLabel}>{homeTeam?.name}</Text>
              <Text style={styles.teamProgressValue}>
                {stats.homeCheckedIn}/{stats.homeTotal}
              </Text>
            </View>
            <View style={styles.teamProgress}>
              <Text style={styles.teamProgressLabel}>{awayTeam?.name}</Text>
              <Text style={styles.teamProgressValue}>
                {stats.awayCheckedIn}/{stats.awayTotal}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Check-In Button */}
        {isScheduled && (
          <TouchableOpacity
            onPress={() => router.push(`/matches/${matchId}/quick-check-in`)}
            style={styles.quickCheckInButton}
          >
            <View style={styles.actionButtonContent}>
              <View style={styles.actionButtonLeft}>
                <Text style={styles.actionButtonIcon}>⚡</Text>
                <View>
                  <Text style={styles.quickCheckInTitle}>Quick Check-In</Text>
                  <Text style={styles.quickCheckInSubtitle}>
                    Lightning fast - 5 sec per player
                  </Text>
                </View>
              </View>
              <Text style={styles.actionButtonArrow}>→</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Standard Check-In Button */}
        {isScheduled && (
          <TouchableOpacity
            onPress={() => router.push(`/referee/check-in?matchId=${matchId}`)}
            style={styles.standardCheckInButton}
          >
            <View style={styles.actionButtonContent}>
              <View style={styles.actionButtonLeft}>
                <Text style={styles.actionButtonIcon}>📸</Text>
                <View>
                  <Text style={styles.standardCheckInTitle}>Standard Check-In</Text>
                  <Text style={styles.standardCheckInSubtitle}>
                    Traditional roster-based
                  </Text>
                </View>
              </View>
              <Text style={styles.actionButtonArrow}>→</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Watch Live Button */}
        {(isLive || isFinal) && (
          <TouchableOpacity
            onPress={() => router.push(`/live/${matchId}`)}
            style={styles.watchLiveButton}
          >
            <View style={styles.actionButtonContent}>
              <View style={styles.actionButtonLeft}>
                <Text style={styles.actionButtonIcon}>
                  {isLive ? '📺' : '📊'}
                </Text>
                <View>
                  <Text style={styles.watchLiveTitle}>
                    {isLive ? 'Watch Live Match' : 'View Match Results'}
                  </Text>
                  <Text style={styles.watchLiveSubtitle}>
                    {isLive ? 'Live updates & events' : 'Final score & stats'}
                  </Text>
                </View>
              </View>
              <Text style={styles.actionButtonArrow}>→</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Match Day Checklist</Text>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistIcon}>
              {isBettingOpen ? '⏰' : '✅'}
            </Text>
            <Text style={styles.checklistText}>
              {isBettingOpen 
                ? 'Place your bets before kickoff' 
                : 'Betting closed'}
            </Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistIcon}>
              {stats.percentComplete === 100 ? '✅' : '⏰'}
            </Text>
            <Text style={styles.checklistText}>
              Check in all players
            </Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistIcon}>
              {isLive ? '🔴' : isFinal ? '✅' : '⏰'}
            </Text>
            <Text style={styles.checklistText}>
              {isLive ? 'Match in progress' : isFinal ? 'Match completed' : 'Waiting for kickoff'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061A2B' },
  scrollContent: { paddingBottom: 100 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingTop: 60, 
    paddingBottom: 16,
  },
  backText: { color: '#22C6D2', fontSize: 16, fontWeight: '900' },
  headerTitle: { color: '#F2D100', fontSize: 20, fontWeight: '900' },
  
  // Match Card
  matchCard: { 
    backgroundColor: '#0A2238', 
    margin: 16, 
    marginTop: 0,
    borderRadius: 16, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusBadge: {
    backgroundColor: 'rgba(242,209,0,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(242,209,0,0.4)',
  },
  statusBadgeLive: {
    backgroundColor: 'rgba(255,59,48,0.2)',
    borderColor: '#FF3B30',
  },
  statusBadgeFinal: {
    backgroundColor: 'rgba(52,199,89,0.2)',
    borderColor: '#34C759',
  },
  statusText: { 
    color: '#EAF2FF', 
    fontSize: 14, 
    fontWeight: '900' 
  },
  teamsRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  teamColumn: { 
    alignItems: 'center', 
    flex: 1 
  },
  teamLogo: { 
    width: 64, 
    height: 64, 
    borderRadius: 16, 
    marginBottom: 12 
  },
  teamName: { 
    color: '#EAF2FF', 
    fontSize: 16, 
    fontWeight: '900',
    textAlign: 'center',
  },
  vsText: { 
    color: '#F2D100', 
    fontSize: 20, 
    fontWeight: '900',
    marginHorizontal: 20,
  },
  matchDetails: { 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
    gap: 8,
  },
  matchDetailText: { 
    color: '#9FB3C8', 
    fontSize: 14,
    textAlign: 'center',
  },

  // Betting Card
  bettingCard: {
    backgroundColor: '#0A2238',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 18,
    borderWidth: 3,
    borderColor: '#34C759',
  },
  bettingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bettingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bettingIcon: { fontSize: 32 },
  bettingTitle: { 
    color: '#F2D100', 
    fontSize: 18, 
    fontWeight: '900',
    marginBottom: 4,
  },
  bettingSubtitle: { 
    color: '#9FB3C8', 
    fontSize: 13 
  },
  bettingStatus: { 
    alignItems: 'flex-end' 
  },
  bettingStatusText: { 
    color: '#34C759', 
    fontSize: 16, 
    fontWeight: '900',
    marginBottom: 4,
  },
  bettingStatusIcon: { 
    fontSize: 20 
  },
  bettingFooter: {
    backgroundColor: 'rgba(34,198,210,0.1)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  bettingFooterText: {
    color: '#22C6D2',
    fontSize: 12,
    textAlign: 'center',
  },
  bettingAction: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  bettingActionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },

  // Betting Closed
  bettingClosedCard: {
    backgroundColor: '#0A2238',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FF3B30',
    alignItems: 'center',
  },
  bettingClosedIcon: { fontSize: 48, marginBottom: 12 },
  bettingClosedTitle: {
    color: '#FF3B30',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  bettingClosedText: {
    color: '#9FB3C8',
    fontSize: 14,
    marginBottom: 12,
  },
  viewTicketsButton: {
    backgroundColor: 'rgba(34,198,210,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 8,
  },
  viewTicketsText: {
    color: '#22C6D2',
    fontSize: 14,
    fontWeight: '900',
  },

  // Progress Card
  progressCard: { 
    backgroundColor: '#0A2238', 
    margin: 16, 
    marginTop: 0,
    borderRadius: 16, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  progressTitle: { 
    color: '#F2D100', 
    fontSize: 18, 
    fontWeight: '900', 
    marginBottom: 12 
  },
  progressPercent: { 
    color: '#22C6D2', 
    fontSize: 48, 
    fontWeight: '900',
    marginVertical: 8,
  },
  progressText: { 
    color: '#9FB3C8', 
    fontSize: 14,
    marginBottom: 16,
  },
  teamProgressRow: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
    justifyContent: 'center',
  },
  teamProgress: {
    alignItems: 'center',
  },
  teamProgressLabel: {
    color: '#9FB3C8',
    fontSize: 12,
    marginBottom: 4,
  },
  teamProgressValue: {
    color: '#EAF2FF',
    fontSize: 18,
    fontWeight: '900',
  },

  // Action Buttons
  quickCheckInButton: {
    backgroundColor: '#34C759',
    margin: 16,
    marginTop: 0,
    borderRadius: 14,
    padding: 18,
    borderWidth: 2,
    borderColor: '#34C759',
  },
  standardCheckInButton: {
    backgroundColor: '#0A2238',
    margin: 16,
    marginTop: 0,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  watchLiveButton: {
    backgroundColor: '#FF3B30',
    margin: 16,
    marginTop: 0,
    borderRadius: 14,
    padding: 18,
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  actionButtonIcon: { fontSize: 28 },
  quickCheckInTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  quickCheckInSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  standardCheckInTitle: {
    color: '#EAF2FF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  standardCheckInSubtitle: {
    color: '#9FB3C8',
    fontSize: 12,
  },
  watchLiveTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  watchLiveSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  actionButtonArrow: {
    color: '#22C6D2',
    fontSize: 24,
    fontWeight: '900',
  },

  // Info Card
  infoCard: {
    backgroundColor: 'rgba(34,198,210,0.1)',
    margin: 16,
    marginTop: 0,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(34,198,210,0.3)',
  },
  infoTitle: {
    color: '#22C6D2',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  checklistIcon: { fontSize: 20 },
  checklistText: {
    color: '#EAF2FF',
    fontSize: 14,
  },

  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 40 
  },
  errorText: { 
    color: '#9FB3C8', 
    fontSize: 16 
  },
});