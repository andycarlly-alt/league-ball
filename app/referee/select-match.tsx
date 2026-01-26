// app/referee/select-match.tsx - SELECT GAME TO MANAGE

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { geolocationService } from '../../src/services/geolocation';
import { notificationService } from '../../src/services/notifications';
import { useAppStore } from '../../src/state/AppStore';
import { VerificationTimeWindow } from '../../src/utils/timeWindow';

export default function SelectMatchScreen() {
  const router = useRouter();
  const { matches, teams, players, currentUser, markNotificationSent, getPlayersForTeam } = useAppStore();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [distances, setDistances] = useState<Record<string, string>>({});

  // Update time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate distances to fields
  useEffect(() => {
    async function fetchDistances() {
      const newDistances: Record<string, string> = {};
      
      for (const match of matches) {
        if (match.fieldLocation) {
          const result = await geolocationService.getDistanceToField(match.fieldLocation);
          if (result) {
            newDistances[match.id] = result.distanceText;
          }
        }
      }
      
      setDistances(newDistances);
    }

    fetchDistances();
  }, [matches]);

  // Auto-send notifications when window opens
  useEffect(() => {
    matches.forEach(match => {
      const kickoff = match.kickoffAt || 0;
      const notifications = match.notificationsSent || {};

      // 30-min alert
      if (VerificationTimeWindow.shouldTriggerThirtyMinAlert(kickoff, notifications.thirtyMinAlert || false)) {
        sendTeamNotifications(match);
        markNotificationSent(match.id, 'thirtyMinAlert');
      }

      // 15-min alert
      if (VerificationTimeWindow.shouldTriggerFifteenMinAlert(kickoff, notifications.fifteenMinAlert || false)) {
        notificationService.sendFifteenMinuteWarning(match);
        markNotificationSent(match.id, 'fifteenMinAlert');
      }

      // Game starting
      if (VerificationTimeWindow.shouldTriggerGameStarting(kickoff, notifications.gameStarting || false)) {
        notificationService.sendGameStartingAlert(match);
        markNotificationSent(match.id, 'gameStarting');
      }
    });
  }, [currentTime, matches]);

  // Get today's matches
  const todaysMatches = matches.filter(m => {
    const matchDate = new Date(m.kickoffAt || 0);
    const today = new Date();
    return matchDate.toDateString() === today.toDateString();
  });

  const handleSelectMatch = (match: any) => {
    const isOpen = VerificationTimeWindow.isWindowOpen(match.kickoffAt || 0);
    
    if (!isOpen) {
      const windowStatus = VerificationTimeWindow.getWindowStatusMessage(match.kickoffAt || 0);
      
      Alert.alert(
        '⏰ Verification Window Closed',
        `Check-in opens 30 minutes before kickoff.\n\n${windowStatus.message}`,
        [
          { text: 'OK' },
          {
            text: 'Set Reminder',
            onPress: () => {
              const thirtyMinsBefore = new Date((match.kickoffAt || 0) - 30 * 60 * 1000);
              notificationService.scheduleNotification(
                {
                  title: '⚽ Check-In Opening Soon!',
                  body: `${match.homeTeam} vs ${match.awayTeam} verification starts now!`,
                  data: { matchId: match.id },
                },
                thirtyMinsBefore
              );
              Alert.alert('✅ Reminder Set', 'You\'ll be notified when check-in opens.');
            },
          },
        ]
      );
      return;
    }

    // Navigate to check-in screen
    router.push({
      pathname: '/referee/check-in',
      params: { matchId: match.id },
    });
  };

  const sendTeamNotifications = async (match: any) => {
    try {
      await notificationService.initialize();

      const homeTeam = teams.find(t => t.id === match.homeTeamId);
      const awayTeam = teams.find(t => t.id === match.awayTeamId);

      // Send pre-game alert
      await notificationService.sendPreGameAlert(match);
      
      // Notify each team
      if (homeTeam) {
        const homePlayers = getPlayersForTeam(homeTeam.id);
        await notificationService.notifyTeamVerificationOpen(
          homeTeam.name,
          match,
          homePlayers.length
        );
      }
      
      if (awayTeam) {
        const awayPlayers = getPlayersForTeam(awayTeam.id);
        await notificationService.notifyTeamVerificationOpen(
          awayTeam.name,
          match,
          awayPlayers.length
        );
      }

      Alert.alert(
        '✅ Notifications Sent!',
        `All players, coaches, and team reps have been notified:\n\n• Check-in is now open\n• Field location shared\n• 30-minute window started`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send notifications. Please try again.');
    }
  };

  const openNavigation = (match: any) => {
    if (!match.fieldLocation) {
      Alert.alert('No Location', 'Field location not available for this match.');
      return;
    }

    geolocationService.showNavigationOptions(match.fieldLocation);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#061A2B' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: '#22C6D2', fontWeight: '900', fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ color: '#F2D100', fontSize: 28, fontWeight: '900', marginTop: 16 }}>
            Game Day Check-In
          </Text>
          <Text style={{ color: '#9FB3C8', marginTop: 8 }}>
            Select a match to begin player verification
          </Text>
        </View>

        {/* Info Banner */}
        <View style={{
          backgroundColor: 'rgba(242,209,0,0.1)',
          padding: 16,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: 'rgba(242,209,0,0.3)',
          marginBottom: 20,
        }}>
          <Text style={{ color: '#F2D100', fontWeight: '900', fontSize: 14, marginBottom: 6 }}>
            📋 Check-In Window
          </Text>
          <Text style={{ color: '#9FB3C8', fontSize: 12, lineHeight: 18 }}>
            • Opens 30 minutes before kickoff{'\n'}
            • Teams & players notified automatically{'\n'}
            • Grace period: 15 minutes after kickoff{'\n'}
            • Location-based verification available
          </Text>
        </View>

        {/* Matches */}
        {todaysMatches.length > 0 ? (
          todaysMatches.map(match => {
            const isOpen = VerificationTimeWindow.isWindowOpen(match.kickoffAt || 0);
            const windowStatus = VerificationTimeWindow.getWindowStatusMessage(match.kickoffAt || 0);
            const homeTeam = teams.find(t => t.id === match.homeTeamId);
            const awayTeam = teams.find(t => t.id === match.awayTeamId);
            const homePlayers = getPlayersForTeam(match.homeTeamId);
            const awayPlayers = getPlayersForTeam(match.awayTeamId);
            const totalPlayers = homePlayers.length + awayPlayers.length;
            const checkedInPlayers = [...homePlayers, ...awayPlayers].filter(p => p.lastCheckIn).length;

            return (
              <View
                key={match.id}
                style={{
                  backgroundColor: '#0A2238',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: windowStatus.status === 'OPEN' ? '#34C759' : 
                               windowStatus.status === 'CLOSING_SOON' ? '#FF9500' : 
                               'rgba(255,255,255,0.1)',
                }}
              >
                {/* Match Info */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ color: '#EAF2FF', fontSize: 18, fontWeight: '900' }}>
                    {match.homeTeam} vs {match.awayTeam}
                  </Text>
                  <Text style={{ color: '#9FB3C8', marginTop: 6 }}>
                    🕐 {match.time} • 📍 {match.field}
                  </Text>
                  {match.fieldLocation && (
                    <Text style={{ color: '#9FB3C8', marginTop: 4, fontSize: 12 }}>
                      {match.fieldLocation.address}
                    </Text>
                  )}
                  {distances[match.id] && (
                    <Text style={{ color: '#22C6D2', marginTop: 4, fontSize: 12, fontWeight: '900' }}>
                      📍 {distances[match.id]}
                    </Text>
                  )}
                </View>

                {/* Status Badge */}
                <View style={{
                  backgroundColor: `${windowStatus.color}20`,
                  padding: 12,
                  borderRadius: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: `${windowStatus.color}50`,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ color: windowStatus.color, fontWeight: '900', fontSize: 14 }}>
                        {windowStatus.status === 'OPEN' && '✅ CHECK-IN OPEN'}
                        {windowStatus.status === 'CLOSING_SOON' && '⚠️ CLOSING SOON'}
                        {windowStatus.status === 'NOT_OPEN' && '🔒 NOT OPEN YET'}
                        {windowStatus.status === 'CLOSED' && '🔒 CHECK-IN CLOSED'}
                      </Text>
                      <Text style={{ color: '#9FB3C8', fontSize: 12, marginTop: 4 }}>
                        {windowStatus.message}
                      </Text>
                    </View>
                    {isOpen && (
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: '#EAF2FF', fontWeight: '900', fontSize: 20 }}>
                          {checkedInPlayers}/{totalPlayers}
                        </Text>
                        <Text style={{ color: '#9FB3C8', fontSize: 11 }}>checked in</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Actions */}
                <View style={{ gap: 8 }}>
                  {/* Primary Action: Start Check-In */}
                  <TouchableOpacity
                    onPress={() => handleSelectMatch(match)}
                    disabled={!isOpen}
                    style={{
                      backgroundColor: isOpen ? '#F2D100' : 'rgba(255,255,255,0.1)',
                      padding: 14,
                      borderRadius: 12,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      color: isOpen ? '#061A2B' : '#9FB3C8',
                      fontWeight: '900',
                      fontSize: 15,
                    }}>
                      {isOpen ? '📸 Start Check-In →' : '🔒 Not Open Yet'}
                    </Text>
                  </TouchableOpacity>

                  {/* Secondary Actions */}
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {/* Navigate Button */}
                    {match.fieldLocation && (
                      <TouchableOpacity
                        onPress={() => openNavigation(match)}
                        style={{
                          flex: 1,
                          backgroundColor: '#22C6D2',
                          paddingVertical: 12,
                          borderRadius: 12,
                          alignItems: 'center',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>🗺️</Text>
                        <Text style={{ color: '#061A2B', fontWeight: '900', fontSize: 13 }}>
                          Navigate
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Notify Button */}
                    {isOpen && (
                      <TouchableOpacity
                        onPress={() => sendTeamNotifications(match)}
                        style={{
                          flex: 1,
                          backgroundColor: '#0B2842',
                          paddingVertical: 12,
                          borderRadius: 12,
                          alignItems: 'center',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          gap: 6,
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.2)',
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>🔔</Text>
                        <Text style={{ color: '#EAF2FF', fontWeight: '900', fontSize: 13 }}>
                          Notify Teams
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Parking Info */}
                {match.fieldLocation?.parkingInfo && (
                  <View style={{
                    marginTop: 12,
                    backgroundColor: 'rgba(34,198,210,0.1)',
                    padding: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(34,198,210,0.3)',
                  }}>
                    <Text style={{ color: '#22C6D2', fontSize: 12, fontWeight: '900' }}>
                      🅿️ {match.fieldLocation.parkingInfo}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>📅</Text>
            <Text style={{ color: '#9FB3C8', fontSize: 18, textAlign: 'center', fontWeight: '900' }}>
              No matches scheduled for today
            </Text>
            <Text style={{ color: '#9FB3C8', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
              Check back on match days to manage check-ins
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}