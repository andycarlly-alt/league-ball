// app/admin/check-ins.tsx - ADMIN CHECK-IN VERIFICATION WITH JERSEY NUMBERS

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppStore } from '../../src/state/AppStore';

type FilterType = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function AdminCheckInsScreen() {
  const router = useRouter();
  const { players, matches, teams, getPlayersForTeam } = useAppStore();
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  // Get all check-ins from all players
  const allCheckIns = players
    .flatMap(player => {
      const team = teams.find(t => t.id === player.teamId);
      return (player.checkInHistory || []).map(checkIn => ({
        ...checkIn,
        playerName: player.fullName,
        teamName: team?.name || 'Unknown',
        shirtNumber: player.shirtNumber || '?',
        documentVerified: player.documentVerified,
        // Add match-specific jersey number (from check-in flow)
        matchJerseyNumber: checkIn.jerseyNumber || null,
      }));
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filter check-ins
  const filteredCheckIns = allCheckIns.filter(checkIn => {
    if (selectedMatch && checkIn.matchId !== selectedMatch) return false;
    
    if (filter === 'APPROVED') return checkIn.approved;
    if (filter === 'REJECTED') return !checkIn.approved;
    if (filter === 'PENDING') {
      // Borderline cases: face match 90-95% OR liveness 60-70%
      return (
        (checkIn.faceMatchScore >= 90 && checkIn.faceMatchScore < 95) ||
        (checkIn.livenessScore >= 60 && checkIn.livenessScore < 70)
      );
    }
    return true; // ALL
  });

  // Stats
  const totalCheckIns = allCheckIns.length;
  const approvedCount = allCheckIns.filter(c => c.approved).length;
  const rejectedCount = allCheckIns.filter(c => !c.approved).length;
  const pendingCount = allCheckIns.filter(c => 
    (c.faceMatchScore >= 90 && c.faceMatchScore < 95) ||
    (c.livenessScore >= 60 && c.livenessScore < 70)
  ).length;

  // Get today's matches for filter
  const todaysMatches = matches.filter(m => {
    const matchDate = new Date(m.kickoffAt || 0);
    const today = new Date();
    return matchDate.toDateString() === today.toDateString();
  });

  const exportReport = () => {
    // Generate CSV data with jersey numbers
    const csvData = [
      ['Timestamp', 'Player', 'Team', 'Jersey #', 'Face Match', 'Liveness', 'Status', 'Match ID'].join(','),
      ...filteredCheckIns.map(c => [
        new Date(c.timestamp).toISOString(),
        c.playerName,
        c.teamName,
        c.matchJerseyNumber || c.shirtNumber,
        c.faceMatchScore.toFixed(1),
        c.livenessScore.toFixed(1),
        c.approved ? 'APPROVED' : 'REJECTED',
        c.matchId,
      ].join(','))
    ].join('\n');

    Alert.alert(
      '📄 Export Report',
      `Generated CSV with ${filteredCheckIns.length} check-ins.\n\nIn production, this would download a file.`,
      [
        { text: 'OK' },
        {
          text: 'Copy Data',
          onPress: () => {
            console.log('CSV Data:', csvData);
            Alert.alert('✅ Data logged to console');
          }
        }
      ]
    );
  };

  const manualReview = (checkIn: any, approve: boolean) => {
    Alert.alert(
      approve ? '✅ Approve Check-In?' : '❌ Reject Check-In?',
      `${checkIn.playerName} - ${checkIn.teamName}\nJersey: #${checkIn.matchJerseyNumber || checkIn.shirtNumber}\n\nFace Match: ${checkIn.faceMatchScore.toFixed(1)}%\nLiveness: ${checkIn.livenessScore.toFixed(1)}%`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: approve ? 'Approve' : 'Reject',
          style: approve ? 'default' : 'destructive',
          onPress: () => {
            // TODO: Update check-in status in AppStore
            Alert.alert(
              '✅ Updated',
              `Check-in ${approve ? 'approved' : 'rejected'} by admin.`
            );
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#061A2B' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: '#22C6D2', fontWeight: '900', fontSize: 16 }}>
              ← Back to Admin Portal
            </Text>
          </TouchableOpacity>
          <Text style={{ color: '#F2D100', fontSize: 28, fontWeight: '900', marginTop: 16 }}>
            Check-In Verification
          </Text>
          <Text style={{ color: '#9FB3C8', marginTop: 8 }}>
            Review and manage all player check-ins with jersey assignments
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <View style={{
            flex: 1,
            minWidth: 150,
            backgroundColor: '#0A2238',
            padding: 16,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.1)',
          }}>
            <Text style={{ color: '#9FB3C8', fontSize: 12 }}>Total Check-Ins</Text>
            <Text style={{ color: '#EAF2FF', fontSize: 32, fontWeight: '900', marginTop: 4 }}>
              {totalCheckIns}
            </Text>
          </View>

          <View style={{
            flex: 1,
            minWidth: 150,
            backgroundColor: '#0A2238',
            padding: 16,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: 'rgba(52,199,89,0.3)',
          }}>
            <Text style={{ color: '#34C759', fontSize: 12, fontWeight: '900' }}>Approved</Text>
            <Text style={{ color: '#34C759', fontSize: 32, fontWeight: '900', marginTop: 4 }}>
              {approvedCount}
            </Text>
          </View>

          <View style={{
            flex: 1,
            minWidth: 150,
            backgroundColor: '#0A2238',
            padding: 16,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: 'rgba(255,59,48,0.3)',
          }}>
            <Text style={{ color: '#FF3B30', fontSize: 12, fontWeight: '900' }}>Rejected</Text>
            <Text style={{ color: '#FF3B30', fontSize: 32, fontWeight: '900', marginTop: 4 }}>
              {rejectedCount}
            </Text>
          </View>

          <View style={{
            flex: 1,
            minWidth: 150,
            backgroundColor: '#0A2238',
            padding: 16,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: 'rgba(255,149,0,0.3)',
          }}>
            <Text style={{ color: '#FF9500', fontSize: 12, fontWeight: '900' }}>Needs Review</Text>
            <Text style={{ color: '#FF9500', fontSize: 32, fontWeight: '900', marginTop: 4 }}>
              {pendingCount}
            </Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: '#9FB3C8', fontSize: 14, marginBottom: 10, fontWeight: '900' }}>
            Filter Status:
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as FilterType[]).map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={{
                  backgroundColor: filter === f ? '#F2D100' : '#0A2238',
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: filter === f ? '#F2D100' : 'rgba(255,255,255,0.2)',
                }}
              >
                <Text style={{
                  color: filter === f ? '#061A2B' : '#9FB3C8',
                  fontWeight: '900',
                  fontSize: 13,
                }}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Match Filter */}
        {todaysMatches.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: '#9FB3C8', fontSize: 14, marginBottom: 10, fontWeight: '900' }}>
              Filter by Match:
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <TouchableOpacity
                onPress={() => setSelectedMatch(null)}
                style={{
                  backgroundColor: !selectedMatch ? '#F2D100' : '#0A2238',
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: !selectedMatch ? '#F2D100' : 'rgba(255,255,255,0.2)',
                }}
              >
                <Text style={{
                  color: !selectedMatch ? '#061A2B' : '#9FB3C8',
                  fontWeight: '900',
                  fontSize: 13,
                }}>
                  All Matches
                </Text>
              </TouchableOpacity>
              {todaysMatches.map(m => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setSelectedMatch(m.id)}
                  style={{
                    backgroundColor: selectedMatch === m.id ? '#22C6D2' : '#0A2238',
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: selectedMatch === m.id ? '#22C6D2' : 'rgba(255,255,255,0.2)',
                  }}
                >
                  <Text style={{
                    color: selectedMatch === m.id ? '#061A2B' : '#9FB3C8',
                    fontWeight: '900',
                    fontSize: 13,
                  }}>
                    {m.homeTeam} vs {m.awayTeam}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Export Button */}
        <TouchableOpacity
          onPress={exportReport}
          style={{
            backgroundColor: '#22C6D2',
            padding: 14,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Text style={{ color: '#061A2B', fontWeight: '900', fontSize: 15 }}>
            📄 Export Report ({filteredCheckIns.length} check-ins)
          </Text>
        </TouchableOpacity>

        {/* Check-Ins List */}
        <View>
          <Text style={{ color: '#F2D100', fontSize: 18, fontWeight: '900', marginBottom: 16 }}>
            Check-In History ({filteredCheckIns.length})
          </Text>

          {filteredCheckIns.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 64 }}>📋</Text>
              <Text style={{ color: '#9FB3C8', fontSize: 16, marginTop: 16, textAlign: 'center' }}>
                No check-ins found
              </Text>
            </View>
          ) : (
            filteredCheckIns.map((checkIn, index) => {
              const isBorderline = 
                (checkIn.faceMatchScore >= 90 && checkIn.faceMatchScore < 95) ||
                (checkIn.livenessScore >= 60 && checkIn.livenessScore < 70);

              return (
                <View
                  key={`${checkIn.id}-${index}`}
                  style={{
                    backgroundColor: checkIn.approved ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)',
                    borderWidth: 2,
                    borderColor: checkIn.approved ? 'rgba(52,199,89,0.3)' : 'rgba(255,59,48,0.3)',
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                >
                  {/* Header with Jersey Number */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: checkIn.approved ? '#34C759' : '#FF3B30',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 18 }}>
                            {checkIn.matchJerseyNumber || checkIn.shirtNumber || '?'}
                          </Text>
                        </View>
                        <View>
                          <Text style={{ color: '#EAF2FF', fontWeight: '900', fontSize: 16 }}>
                            {checkIn.playerName}
                          </Text>
                          <Text style={{ color: '#9FB3C8', fontSize: 12 }}>
                            {checkIn.teamName}
                          </Text>
                          {checkIn.matchJerseyNumber && (
                            <Text style={{ color: '#22C6D2', fontSize: 11, fontWeight: '900', marginTop: 2 }}>
                              Match Jersey: #{checkIn.matchJerseyNumber}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={{
                      backgroundColor: checkIn.approved ? '#34C759' : '#FF3B30',
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                    }}>
                      <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 12 }}>
                        {checkIn.approved ? '✓ APPROVED' : '✗ REJECTED'}
                      </Text>
                    </View>
                  </View>

                  {/* Scores */}
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                    <View style={{ flex: 1, backgroundColor: '#0A2238', padding: 12, borderRadius: 8 }}>
                      <Text style={{ color: '#9FB3C8', fontSize: 11, marginBottom: 4 }}>
                        Face Match
                      </Text>
                      <Text style={{
                        color: checkIn.faceMatchScore >= 95 ? '#34C759' : 
                               checkIn.faceMatchScore >= 90 ? '#FF9500' : '#FF3B30',
                        fontWeight: '900',
                        fontSize: 20,
                      }}>
                        {checkIn.faceMatchScore.toFixed(1)}%
                      </Text>
                    </View>

                    <View style={{ flex: 1, backgroundColor: '#0A2238', padding: 12, borderRadius: 8 }}>
                      <Text style={{ color: '#9FB3C8', fontSize: 11, marginBottom: 4 }}>
                        Liveness
                      </Text>
                      <Text style={{
                        color: checkIn.livenessScore >= 70 ? '#34C759' : 
                               checkIn.livenessScore >= 60 ? '#FF9500' : '#FF3B30',
                        fontWeight: '900',
                        fontSize: 20,
                      }}>
                        {checkIn.livenessScore.toFixed(1)}%
                      </Text>
                    </View>
                  </View>

                  {/* Timestamp */}
                  <Text style={{ color: '#9FB3C8', fontSize: 11, marginBottom: 12 }}>
                    🕐 {new Date(checkIn.timestamp).toLocaleString()}
                  </Text>

                  {/* Warning for borderline cases */}
                  {isBorderline && (
                    <View style={{
                      backgroundColor: 'rgba(255,149,0,0.2)',
                      padding: 10,
                      borderRadius: 8,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: 'rgba(255,149,0,0.3)',
                    }}>
                      <Text style={{ color: '#FF9500', fontWeight: '900', fontSize: 12 }}>
                        ⚠️ BORDERLINE CASE - Manual review recommended
                      </Text>
                    </View>
                  )}

                  {/* Manual Review Actions */}
                  {isBorderline && (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => manualReview(checkIn, true)}
                        style={{
                          flex: 1,
                          backgroundColor: '#34C759',
                          paddingVertical: 12,
                          borderRadius: 8,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: '#FFF', fontWeight: '900' }}>
                          ✓ Approve
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => manualReview(checkIn, false)}
                        style={{
                          flex: 1,
                          backgroundColor: '#FF3B30',
                          paddingVertical: 12,
                          borderRadius: 8,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: '#FFF', fontWeight: '900' }}>
                          ✗ Reject
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}