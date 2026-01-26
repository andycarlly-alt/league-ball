// app/referee/check-in.tsx - GAME DAY CHECK-IN WITH FACE MATCHING

import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import { geolocationService } from '../../src/services/geolocation';
import { useAppStore } from '../../src/state/AppStore';
import { VerificationTimeWindow } from '../../src/utils/timeWindow';

type CheckInResult = {
  approved: boolean;
  playerName: string;
  teamName: string;
  shirtNumber: string;
  faceMatchScore: number;
  livenessScore: number;
  reason?: string;
};

export default function CheckInScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const {
    matches,
    teams,
    players,
    getPlayersForTeam,
    currentUser,
    recordCheckIn,
  } = useAppStore();

  const match = matches.find(m => m.id === matchId);
  const homeTeam = teams.find(t => t.id === match?.homeTeamId);
  const awayTeam = teams.find(t => t.id === match?.awayTeamId);
  const homePlayers = match ? getPlayersForTeam(match.homeTeamId) : [];
  const awayPlayers = match ? getPlayersForTeam(match.awayTeamId) : [];
  const allPlayers = [...homePlayers, ...awayPlayers];

  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [distanceToField, setDistanceToField] = useState<string | null>(null);
  const [withinRadius, setWithinRadius] = useState<boolean>(false);

  // Check distance to field
  useEffect(() => {
    async function checkDistance() {
      if (match?.fieldLocation) {
        const result = await geolocationService.getDistanceToField(match.fieldLocation);
        if (result) {
          setDistanceToField(result.distanceText);
        }

        const within = await geolocationService.isWithinCheckInRadius(match.fieldLocation);
        setWithinRadius(within);
      }
    }

    checkDistance();
    const interval = setInterval(checkDistance, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [match]);

  if (!match) {
    return (
      <View style={{ flex: 1, backgroundColor: '#061A2B', padding: 20, justifyContent: 'center' }}>
        <Text style={{ color: '#F2D100', fontSize: 22, fontWeight: '900', textAlign: 'center' }}>
          Match Not Found
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#22C6D2', fontWeight: '900', textAlign: 'center' }}>
            ← Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const checkInPlayer = async (player: any) => {
    if (!player.documentVerified) {
      Alert.alert(
        '⚠️ Player Not Verified',
        `${player.fullName} has not completed document verification.\n\nThey must scan their ID first.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedPlayer(player);
    setScanning(true);

    try {
      // Step 1: Take live photo
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is needed for check-in.');
        setScanning(false);
        return;
      }

      const photo = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        cameraType: ImagePicker.CameraType.front, // Selfie camera
      });

      if (photo.canceled || !photo.assets[0]) {
        setScanning(false);
        setSelectedPlayer(null);
        return;
      }

      const livePhotoUri = photo.assets[0].uri;

      // Step 2: Simulate AI face matching & liveness detection
      // TODO: Replace with real AWS Rekognition call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock face matching result
      const mockFaceMatch = Math.random() * 10 + 90; // 90-100% match
      const mockLiveness = Math.random() * 20 + 80; // 80-100% liveness

      const checkInResult: CheckInResult = {
        approved: mockFaceMatch >= 95 && mockLiveness >= 70,
        playerName: player.fullName,
        teamName: teams.find(t => t.id === player.teamId)?.name || 'Unknown',
        shirtNumber: player.shirtNumber || '00',
        faceMatchScore: mockFaceMatch,
        livenessScore: mockLiveness,
        reason: mockFaceMatch < 95 ? 'Face match too low' : mockLiveness < 70 ? 'Liveness check failed' : undefined,
      };

      // Step 3: Record check-in
      if (checkInResult.approved) {
        recordCheckIn({
          playerId: player.id,
          matchId: match.id,
          livePhotoUrl: livePhotoUri,
          faceMatchScore: mockFaceMatch,
          livenessScore: mockLiveness,
          refereeId: currentUser.id,
          deviceId: 'device_123',
        });
      }

      // Step 4: Show result
      setResult(checkInResult);

      // Haptic feedback
      if (checkInResult.approved) {
        Vibration.vibrate(200); // Success vibration
      } else {
        Vibration.vibrate([0, 100, 100, 100]); // Error pattern
      }

    } catch (error) {
      Alert.alert('Error', 'Check-in failed. Please try again.');
      console.error('Check-in error:', error);
    } finally {
      setScanning(false);
    }
  };

  const resetCheckIn = () => {
    setResult(null);
    setSelectedPlayer(null);
  };

  // Show result screen
  if (result) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: result.approved ? '#34C759' : '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
      }}>
        <Text style={{ fontSize: 100 }}>
          {result.approved ? '✅' : '❌'}
        </Text>
        
        <Text style={{
          color: '#FFF',
          fontSize: 36,
          fontWeight: '900',
          marginTop: 30,
          textAlign: 'center',
        }}>
          {result.approved ? 'APPROVED' : 'DENIED'}
        </Text>

        {result.approved ? (
          <View style={{ marginTop: 30, alignItems: 'center' }}>
            <Text style={{ color: '#FFF', fontSize: 28, fontWeight: '900' }}>
              {result.playerName}
            </Text>
            <Text style={{ color: '#FFF', fontSize: 20, marginTop: 12 }}>
              #{result.shirtNumber} • {result.teamName}
            </Text>
            <View style={{ marginTop: 20, backgroundColor: 'rgba(255,255,255,0.2)', padding: 16, borderRadius: 12 }}>
              <Text style={{ color: '#FFF', fontSize: 14, textAlign: 'center' }}>
                Face Match: {result.faceMatchScore.toFixed(1)}%{'\n'}
                Liveness: {result.livenessScore.toFixed(1)}%
              </Text>
            </View>
          </View>
        ) : (
          <View style={{ marginTop: 30, alignItems: 'center' }}>
            <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900', textAlign: 'center' }}>
              {result.playerName}
            </Text>
            <Text style={{ color: '#FFF', fontSize: 16, marginTop: 12, textAlign: 'center', opacity: 0.9 }}>
              {result.reason || 'Verification failed'}
            </Text>
            <View style={{ marginTop: 20, backgroundColor: 'rgba(255,255,255,0.2)', padding: 16, borderRadius: 12 }}>
              <Text style={{ color: '#FFF', fontSize: 14, textAlign: 'center' }}>
                Face Match: {result.faceMatchScore.toFixed(1)}%{'\n'}
                Liveness: {result.livenessScore.toFixed(1)}%
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert('Manual Review', 'Flagged for coach/admin review')}
              style={{
                marginTop: 20,
                backgroundColor: '#FFF',
                paddingVertical: 14,
                paddingHorizontal: 24,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#FF3B30', fontWeight: '900' }}>
                Flag for Manual Review
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={resetCheckIn}
          style={{
            marginTop: 50,
            backgroundColor: 'rgba(255,255,255,0.3)',
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16 }}>
            Next Player →
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show scanning screen
  if (scanning) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#061A2B',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
      }}>
        <ActivityIndicator size="large" color="#F2D100" />
        <Text style={{ color: '#F2D100', fontSize: 24, fontWeight: '900', marginTop: 24 }}>
          🤖 AI Processing...
        </Text>
        <Text style={{ color: '#9FB3C8', marginTop: 12, textAlign: 'center', fontSize: 16 }}>
          Matching face with verified ID{'\n'}
          Checking liveness
        </Text>
        {selectedPlayer && (
          <Text style={{ color: '#22C6D2', marginTop: 20, fontSize: 18, fontWeight: '900' }}>
            {selectedPlayer.fullName}
          </Text>
        )}
      </View>
    );
  }

  // Main roster screen
  const isWindowOpen = VerificationTimeWindow.isWindowOpen(match.kickoffAt || 0);
  const windowStatus = VerificationTimeWindow.getWindowStatusMessage(match.kickoffAt || 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#061A2B' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: '#22C6D2', fontWeight: '900', fontSize: 16 }}>← Back to Matches</Text>
          </TouchableOpacity>
          <Text style={{ color: '#F2D100', fontSize: 24, fontWeight: '900', marginTop: 16 }}>
            {match.homeTeam} vs {match.awayTeam}
          </Text>
          <Text style={{ color: '#9FB3C8', marginTop: 6 }}>
            {match.field} • {match.time}
          </Text>
        </View>

        {/* TEMPORARY TEST HELPER - Remove before production */}
        {__DEV__ && (
          <View style={{ marginBottom: 16, gap: 8 }}>
            <TouchableOpacity
              onPress={() => {
                // Check in all HOME team verified players
                let checkedCount = 0;
                homePlayers.forEach(player => {
                  if (player.documentVerified && !player.lastCheckIn) {
                    const mockFaceScore = 96 + Math.random() * 3; // 96-99%
                    const mockLivenessScore = 85 + Math.random() * 10; // 85-95%
                    
                    recordCheckIn({
                      playerId: player.id,
                      matchId: match.id,
                      livePhotoUrl: 'mock://photo.jpg',
                      faceMatchScore: mockFaceScore,
                      livenessScore: mockLivenessScore,
                      refereeId: currentUser.id,
                      deviceId: 'test_device',
                    });
                    checkedCount++;
                  }
                });
                
                Alert.alert(
                  '✅ Home Team Checked In!',
                  `${checkedCount} ${homeTeam?.name} players checked in successfully.`,
                  [{ text: 'OK' }]
                );
              }}
              style={{
                backgroundColor: '#FF9500',
                padding: 14,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 20 }}>🏠</Text>
              <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>
                TEST: Check In All Home Players
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // Check in all AWAY team verified players
                let checkedCount = 0;
                awayPlayers.forEach(player => {
                  if (player.documentVerified && !player.lastCheckIn) {
                    const mockFaceScore = 96 + Math.random() * 3; // 96-99%
                    const mockLivenessScore = 85 + Math.random() * 10; // 85-95%
                    
                    recordCheckIn({
                      playerId: player.id,
                      matchId: match.id,
                      livePhotoUrl: 'mock://photo.jpg',
                      faceMatchScore: mockFaceScore,
                      livenessScore: mockLivenessScore,
                      refereeId: currentUser.id,
                      deviceId: 'test_device',
                    });
                    checkedCount++;
                  }
                });
                
                Alert.alert(
                  '✅ Away Team Checked In!',
                  `${checkedCount} ${awayTeam?.name} players checked in successfully.`,
                  [{ text: 'OK' }]
                );
              }}
              style={{
                backgroundColor: '#5856D6',
                padding: 14,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 20 }}>✈️</Text>
              <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>
                TEST: Check In All Away Players
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // Check in BOTH teams
                let homeCount = 0;
                let awayCount = 0;
                
                homePlayers.forEach(player => {
                  if (player.documentVerified && !player.lastCheckIn) {
                    recordCheckIn({
                      playerId: player.id,
                      matchId: match.id,
                      livePhotoUrl: 'mock://photo.jpg',
                      faceMatchScore: 96 + Math.random() * 3,
                      livenessScore: 85 + Math.random() * 10,
                      refereeId: currentUser.id,
                      deviceId: 'test_device',
                    });
                    homeCount++;
                  }
                });
                
                awayPlayers.forEach(player => {
                  if (player.documentVerified && !player.lastCheckIn) {
                    recordCheckIn({
                      playerId: player.id,
                      matchId: match.id,
                      livePhotoUrl: 'mock://photo.jpg',
                      faceMatchScore: 96 + Math.random() * 3,
                      livenessScore: 85 + Math.random() * 10,
                      refereeId: currentUser.id,
                      deviceId: 'test_device',
                    });
                    awayCount++;
                  }
                });
                
                Alert.alert(
                  '🎉 ALL PLAYERS CHECKED IN!',
                  `${homeTeam?.name}: ${homeCount} players\n${awayTeam?.name}: ${awayCount} players\n\nMatch ready to start!`,
                  [{ text: 'Awesome! 🎯' }]
                );
              }}
              style={{
                backgroundColor: '#34C759',
                padding: 14,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 20 }}>⚡</Text>
              <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>
                TEST: Check In ALL Players (Both Teams)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Window Status */}
        <View style={{
          backgroundColor: `${windowStatus.color}20`,
          padding: 16,
          borderRadius: 14,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: `${windowStatus.color}50`,
        }}>
          <Text style={{ color: windowStatus.color, fontWeight: '900', fontSize: 16 }}>
            {windowStatus.status === 'OPEN' && '✅ CHECK-IN OPEN'}
            {windowStatus.status === 'CLOSING_SOON' && '⚠️ CLOSING SOON'}
            {windowStatus.status === 'NOT_OPEN' && '🔒 NOT OPEN YET'}
            {windowStatus.status === 'CLOSED' && '🔒 CHECK-IN CLOSED'}
          </Text>
          <Text style={{ color: '#9FB3C8', marginTop: 6, fontSize: 14 }}>
            {windowStatus.message}
          </Text>
        </View>

        {/* Location Info */}
        {match.fieldLocation && (
          <View style={{
            backgroundColor: '#0A2238',
            padding: 16,
            borderRadius: 14,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: '#F2D100', fontWeight: '900', fontSize: 16 }}>
                📍 Field Location
              </Text>
              {distanceToField && (
                <Text style={{ color: '#22C6D2', fontWeight: '900', fontSize: 14 }}>
                  {distanceToField}
                </Text>
              )}
            </View>
            
            <Text style={{ color: '#EAF2FF', fontSize: 14, marginBottom: 4 }}>
              {match.fieldLocation.name}
            </Text>
            <Text style={{ color: '#9FB3C8', fontSize: 12 }}>
              {match.fieldLocation.address}
            </Text>

            {match.fieldLocation.parkingInfo && (
              <Text style={{ color: '#22C6D2', fontSize: 12, marginTop: 8 }}>
                🅿️ {match.fieldLocation.parkingInfo}
              </Text>
            )}

            {/* Location Status */}
            {withinRadius ? (
              <View style={{
                marginTop: 12,
                backgroundColor: 'rgba(52,199,89,0.2)',
                padding: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: 'rgba(52,199,89,0.3)',
              }}>
                <Text style={{ color: '#34C759', fontWeight: '900', fontSize: 13 }}>
                  ✓ You are at the field
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => geolocationService.showNavigationOptions(match.fieldLocation!)}
                style={{
                  marginTop: 12,
                  backgroundColor: '#22C6D2',
                  padding: 12,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#061A2B', fontWeight: '900' }}>
                  🗺️ Navigate to Field
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Check-In Stats */}
        <View style={{
          backgroundColor: '#0A2238',
          padding: 16,
          borderRadius: 14,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
        }}>
          <Text style={{ color: '#F2D100', fontWeight: '900', fontSize: 16, marginBottom: 12 }}>
            📊 Check-In Progress
          </Text>
          
          <View style={{ gap: 12 }}>
            {/* Home Team */}
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#EAF2FF', fontWeight: '900' }}>{homeTeam?.name}</Text>
                <Text style={{ color: '#22C6D2', fontWeight: '900' }}>
                  {homePlayers.filter(p => p.lastCheckIn).length}/{homePlayers.length}
                </Text>
              </View>
              <View style={{ marginTop: 6, height: 6, backgroundColor: '#0B2842', borderRadius: 3, overflow: 'hidden' }}>
                <View style={{
                  width: `${(homePlayers.filter(p => p.lastCheckIn).length / homePlayers.length) * 100}%`,
                  height: '100%',
                  backgroundColor: '#34C759',
                }} />
              </View>
            </View>

            {/* Away Team */}
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#EAF2FF', fontWeight: '900' }}>{awayTeam?.name}</Text>
                <Text style={{ color: '#22C6D2', fontWeight: '900' }}>
                  {awayPlayers.filter(p => p.lastCheckIn).length}/{awayPlayers.length}
                </Text>
              </View>
              <View style={{ marginTop: 6, height: 6, backgroundColor: '#0B2842', borderRadius: 3, overflow: 'hidden' }}>
                <View style={{
                  width: `${(awayPlayers.filter(p => p.lastCheckIn).length / awayPlayers.length) * 100}%`,
                  height: '100%',
                  backgroundColor: '#34C759',
                }} />
              </View>
            </View>
          </View>
        </View>

        {/* Home Team Roster */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: '#F2D100', fontSize: 18, fontWeight: '900', marginBottom: 12 }}>
            {homeTeam?.name}
          </Text>
          {homePlayers.map(player => (
            <TouchableOpacity
              key={player.id}
              onPress={() => checkInPlayer(player)}
              disabled={!isWindowOpen || !!player.lastCheckIn}
              style={{
                backgroundColor: player.lastCheckIn ? '#34C759' : '#0A2238',
                padding: 16,
                borderRadius: 12,
                marginBottom: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: !isWindowOpen || player.lastCheckIn ? 0.6 : 1,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: player.lastCheckIn ? '#FFF' : '#F2D100',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{
                    color: player.lastCheckIn ? '#34C759' : '#061A2B',
                    fontWeight: '900',
                    fontSize: 18,
                  }}>
                    {player.shirtNumber || '?'}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: '#EAF2FF', fontWeight: '900', fontSize: 16 }}>
                    {player.fullName}
                  </Text>
                  {player.documentVerified ? (
                    <Text style={{ color: player.lastCheckIn ? '#FFF' : '#34C759', fontSize: 11, marginTop: 2 }}>
                      ✓ Document verified
                    </Text>
                  ) : (
                    <Text style={{ color: '#FF3B30', fontSize: 11, marginTop: 2 }}>
                      ⚠️ Not verified
                    </Text>
                  )}
                </View>
              </View>

              {player.lastCheckIn ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14 }}>✓ Checked In</Text>
                  <Text style={{ color: '#FFF', fontSize: 10, marginTop: 2, opacity: 0.8 }}>
                    {new Date(player.lastCheckIn).toLocaleTimeString()}
                  </Text>
                </View>
              ) : (
                <View style={{
                  backgroundColor: '#F2D100',
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                }}>
                  <Text style={{ color: '#061A2B', fontWeight: '900', fontSize: 13 }}>
                    Check In
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Away Team Roster */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: '#F2D100', fontSize: 18, fontWeight: '900', marginBottom: 12 }}>
            {awayTeam?.name}
          </Text>
          {awayPlayers.map(player => (
            <TouchableOpacity
              key={player.id}
              onPress={() => checkInPlayer(player)}
              disabled={!isWindowOpen || !!player.lastCheckIn}
              style={{
                backgroundColor: player.lastCheckIn ? '#34C759' : '#0A2238',
                padding: 16,
                borderRadius: 12,
                marginBottom: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: !isWindowOpen || player.lastCheckIn ? 0.6 : 1,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: player.lastCheckIn ? '#FFF' : '#F2D100',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{
                    color: player.lastCheckIn ? '#34C759' : '#061A2B',
                    fontWeight: '900',
                    fontSize: 18,
                  }}>
                    {player.shirtNumber || '?'}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: '#EAF2FF', fontWeight: '900', fontSize: 16 }}>
                    {player.fullName}
                  </Text>
                  {player.documentVerified ? (
                    <Text style={{ color: player.lastCheckIn ? '#FFF' : '#34C759', fontSize: 11, marginTop: 2 }}>
                      ✓ Document verified
                    </Text>
                  ) : (
                    <Text style={{ color: '#FF3B30', fontSize: 11, marginTop: 2 }}>
                      ⚠️ Not verified
                    </Text>
                  )}
                </View>
              </View>

              {player.lastCheckIn ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14 }}>✓ Checked In</Text>
                  <Text style={{ color: '#FFF', fontSize: 10, marginTop: 2, opacity: 0.8 }}>
                    {new Date(player.lastCheckIn).toLocaleTimeString()}
                  </Text>
                </View>
              ) : (
                <View style={{
                  backgroundColor: '#F2D100',
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                }}>
                  <Text style={{ color: '#061A2B', fontWeight: '900', fontSize: 13 }}>
                    Check In
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}