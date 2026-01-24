// app/teams/[id].tsx - COMPREHENSIVE TEAM DASHBOARD
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource } from "../../src/utils/logos";

export default function TeamDashboardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const {
    teams,
    currentUser,
    matches,
    pendingPayments,
    tournaments,
    players,
    can,
  } = useAppStore();

  const [showMessaging, setShowMessaging] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [showLineupSubmission, setShowLineupSubmission] = useState(false);
  const [selectedStarters, setSelectedStarters] = useState<string[]>([]);

  const team = useMemo(() => {
    return teams?.find((t: any) => t.id === id);
  }, [teams, id]);

  const tournament = useMemo(() => {
    return tournaments?.find((t: any) => t.id === team?.tournamentId);
  }, [tournaments, team?.tournamentId]);

  const isTeamRep = useMemo(() => {
    return currentUser?.role === "TEAM_REP" && currentUser?.teamId === id;
  }, [currentUser, id]);

  const isAdmin = useMemo(() => {
    return currentUser?.role === "LEAGUE_ADMIN" || currentUser?.role === "TOURNAMENT_ADMIN";
  }, [currentUser]);

  const canManageTeam = isTeamRep || isAdmin;

  // Get team roster
  const roster = useMemo(() => {
    if (!players || !Array.isArray(players)) return [];
    return players.filter((p: any) => p.teamId === id).sort((a, b) => 
      a.fullName?.localeCompare(b.fullName || "") || 0
    );
  }, [players, id]);

  // Get team's upcoming matches
  const teamMatches = useMemo(() => {
    if (!matches || !Array.isArray(matches)) return [];
    return matches.filter((m: any) => 
      m.homeTeamId === id || m.awayTeamId === id
    ).slice(0, 3);
  }, [matches, id]);

  // Get team's pending fines/cards
  const teamFines = useMemo(() => {
    if (!pendingPayments || !Array.isArray(pendingPayments)) return [];
    return pendingPayments.filter((p: any) => 
      p.type === "CARD_FINE" && 
      p.teamId === id && 
      p.status === "PENDING"
    );
  }, [pendingPayments, id]);

  // Get players with suspensions/cards
  const playersWithCards = useMemo(() => {
    return roster.filter((p: any) => p.suspended || p.yellowCards > 0 || p.redCards > 0);
  }, [roster]);

  if (!team) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#EAF2FF", fontSize: 18, fontWeight: "900" }}>Team not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20, backgroundColor: "#22C6D2", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: "#061A2B", fontWeight: "900" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSendMessage = () => {
    const text = messageText.trim();
    if (!text) {
      Alert.alert("Empty Message", "Please enter a message");
      return;
    }

    Alert.alert(
      "Send Team Message",
      `Send to all ${roster.length} players?\n\n"${text}"`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            // Mock sending message
            Alert.alert(
              "Message Sent! 📢",
              `Your message has been sent to all ${roster.length} team members via SMS and email.`,
              [{ text: "OK" }]
            );
            setMessageText("");
            setShowMessaging(false);
          },
        },
      ]
    );
  };

  const togglePlayerForLineup = (playerId: string) => {
    if (selectedStarters.includes(playerId)) {
      setSelectedStarters(selectedStarters.filter(id => id !== playerId));
    } else {
      if (selectedStarters.length >= 11) {
        Alert.alert("Maximum Reached", "You can only select 11 starting players");
        return;
      }
      setSelectedStarters([...selectedStarters, playerId]);
    }
  };

  const handleSubmitLineup = () => {
    if (selectedStarters.length !== 11) {
      Alert.alert("Incomplete Lineup", `Please select exactly 11 starters. You have selected ${selectedStarters.length}.`);
      return;
    }

    const starterNames = roster
      .filter((p: any) => selectedStarters.includes(p.id))
      .map((p: any) => p.fullName)
      .join("\n");

    Alert.alert(
      "Submit Lineup for Verification",
      `Submit these 11 starters?\n\n${starterNames}\n\nThis will be sent to match officials for verification.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: () => {
            // Mock lineup submission
            Alert.alert(
              "Lineup Submitted! ✅",
              "Your starting 11 has been submitted to match officials for verification. You will be notified once approved.",
              [{ text: "OK" }]
            );
            setSelectedStarters([]);
            setShowLineupSubmission(false);
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#061A2B" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
    >
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
        <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back to Teams</Text>
      </TouchableOpacity>

      {/* Team Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Image
          source={getLogoSource(team.logoKey || "placeholder")}
          style={{ width: 80, height: 80, borderRadius: 16 }}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900" }}>{team.name}</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 4 }}>
            {team.repName ? `Rep: ${team.repName}` : "No rep assigned"}
          </Text>
          <View style={{ flexDirection: "row", gap: 16, marginTop: 6 }}>
            <Text style={{ color: "#22C6D2", fontWeight: "900" }}>👥 {roster.length} Players</Text>
            {teamFines.length > 0 && (
              <Text style={{ color: "#FF3B30", fontWeight: "900" }}>⚠️ {teamFines.length} Fines</Text>
            )}
            {playersWithCards.length > 0 && (
              <Text style={{ color: "#F2D100", fontWeight: "900" }}>🟨 {playersWithCards.length} Cards</Text>
            )}
          </View>
        </View>
      </View>

      {/* Role Badge */}
      {isTeamRep && (
        <View style={{ backgroundColor: "rgba(242,209,0,0.1)", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "rgba(242,209,0,0.3)" }}>
          <Text style={{ color: "#F2D100", fontWeight: "900", textAlign: "center" }}>⭐ You are the Team Representative</Text>
        </View>
      )}

      {/* Tournament Info */}
      {tournament && (
        <View style={{ backgroundColor: "#0A2238", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>Tournament</Text>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9FB3C8" }}>Name:</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{tournament.name}</Text>
            </View>
            {tournament.ageBand && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#9FB3C8" }}>Age Band:</Text>
                <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{tournament.ageBand}</Text>
              </View>
            )}
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9FB3C8" }}>Roster Status:</Text>
              <Text style={{ color: tournament.rosterLocked ? "#FF3B30" : "#34C759", fontWeight: "900" }}>
                {tournament.rosterLocked ? "🔒 LOCKED" : "✅ OPEN"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      {canManageTeam && (
        <View>
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 18, marginBottom: 10 }}>Quick Actions</Text>
          <View style={{ gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push(`/teams/${id}/roster`)}
              style={{ backgroundColor: "#34C759", padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Text style={{ fontSize: 20 }}>👥</Text>
              <Text style={{ color: "#061A2B", fontWeight: "900", flex: 1 }}>Manage Roster ({roster.length} Players)</Text>
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>→</Text>
            </TouchableOpacity>

            {can && can("ADD_PLAYER", { teamId: id }) && (
              <TouchableOpacity
                onPress={() => router.push(`/teams/${id}/add-player`)}
                style={{ backgroundColor: "#22C6D2", padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Text style={{ fontSize: 20 }}>➕</Text>
                <Text style={{ color: "#061A2B", fontWeight: "900", flex: 1 }}>Add Player to Roster</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setShowMessaging(!showMessaging)}
              style={{ backgroundColor: "#F2D100", padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Text style={{ fontSize: 20 }}>📢</Text>
              <Text style={{ color: "#061A2B", fontWeight: "900", flex: 1 }}>Send Team Message</Text>
            </TouchableOpacity>

            {teamMatches.length > 0 && (
              <TouchableOpacity
                onPress={() => setShowLineupSubmission(!showLineupSubmission)}
                style={{ backgroundColor: "#0A2238", padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 2, borderColor: "#34C759" }}
              >
                <Text style={{ fontSize: 20 }}>⚽</Text>
                <Text style={{ color: "#34C759", fontWeight: "900", flex: 1 }}>Submit Match Lineup</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/tournaments')}
              style={{ backgroundColor: "#0A2238", padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#F2D100" }}
            >
              <Text style={{ fontSize: 20 }}>🏆</Text>
              <Text style={{ color: "#F2D100", fontWeight: "900", flex: 1 }}>Register for Tournament</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Team Messaging Form */}
      {showMessaging && canManageTeam && (
        <View style={{ backgroundColor: "#0A2238", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
            Team Message
          </Text>
          <Text style={{ color: "#9FB3C8", marginBottom: 8 }}>
            Message will be sent to all {roster.length} players via SMS and email
          </Text>
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="e.g., Practice tomorrow at 6pm at Field #3. Bring water and cleats."
            placeholderTextColor="rgba(255,255,255,0.4)"
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: "#0B2842",
              color: "#EAF2FF",
              padding: 12,
              borderRadius: 12,
              marginBottom: 16,
              minHeight: 100,
              textAlignVertical: "top",
            }}
          />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={handleSendMessage}
              style={{ flex: 1, backgroundColor: "#34C759", padding: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>Send to All {roster.length} Players</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowMessaging(false);
                setMessageText("");
              }}
              style={{ flex: 1, backgroundColor: "#0B2842", padding: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Match Lineup Submission */}
      {showLineupSubmission && canManageTeam && (
        <View style={{ backgroundColor: "#0A2238", borderRadius: 14, padding: 16, borderWidth: 2, borderColor: "#34C759" }}>
          <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
            Submit Match Lineup
          </Text>
          <Text style={{ color: "#9FB3C8", marginBottom: 12 }}>
            Select 11 starting players for pre-match verification ({selectedStarters.length}/11 selected)
          </Text>
          
          <ScrollView style={{ maxHeight: 300 }}>
            {roster.map((player: any) => {
              const isSelected = selectedStarters.includes(player.id);
              const isSuspended = player.suspended;
              
              return (
                <TouchableOpacity
                  key={player.id}
                  onPress={() => !isSuspended && togglePlayerForLineup(player.id)}
                  disabled={isSuspended}
                  style={{
                    backgroundColor: isSelected ? "#34C759" : "#0B2842",
                    padding: 12,
                    borderRadius: 12,
                    marginBottom: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    opacity: isSuspended ? 0.5 : 1,
                  }}
                >
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isSelected ? "#061A2B" : "#9FB3C8",
                    backgroundColor: isSelected ? "#061A2B" : "transparent",
                    marginRight: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {isSelected && <Text style={{ color: "#34C759", fontSize: 16 }}>✓</Text>}
                  </View>
                  <Text style={{ color: isSelected ? "#061A2B" : "#EAF2FF", fontWeight: "900", flex: 1 }}>
                    {player.fullName}
                  </Text>
                  {isSuspended && (
                    <Text style={{ color: "#FF3B30", fontWeight: "900", fontSize: 10 }}>SUSPENDED</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <TouchableOpacity
              onPress={handleSubmitLineup}
              disabled={selectedStarters.length !== 11}
              style={{
                flex: 1,
                backgroundColor: selectedStarters.length === 11 ? "#34C759" : "#0B2842",
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
                opacity: selectedStarters.length === 11 ? 1 : 0.5,
              }}
            >
              <Text style={{ color: selectedStarters.length === 11 ? "#061A2B" : "#9FB3C8", fontWeight: "900" }}>
                Submit Lineup ({selectedStarters.length}/11)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowLineupSubmission(false);
                setSelectedStarters([]);
              }}
              style={{ flex: 1, backgroundColor: "#0B2842", padding: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Pending Fines & Cards */}
      {(teamFines.length > 0 || playersWithCards.length > 0) && canManageTeam && (
        <View>
          <Text style={{ color: "#FF3B30", fontWeight: "900", fontSize: 18, marginBottom: 10 }}>
            ⚠️ Fines & Cards
          </Text>

          {/* Unpaid Fines */}
          {teamFines.map((fine: any) => (
            <View
              key={fine.id}
              style={{ backgroundColor: "#0A2238", borderRadius: 14, padding: 16, borderWidth: 2, borderColor: "#FF3B30", marginBottom: 10 }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>{fine.cardType} Card Fine</Text>
                  <Text style={{ color: "#9FB3C8", marginTop: 4 }}>
                    Player: {fine.playerName || "Unknown"}
                  </Text>
                  <Text style={{ color: "#9FB3C8", marginTop: 2 }}>
                    Match: {fine.matchName || "Recent match"}
                  </Text>
                </View>
                <Text style={{ color: "#FF3B30", fontWeight: "900", fontSize: 18 }}>
                  ${(fine.amount / 100).toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/billing')}
                style={{ marginTop: 12, backgroundColor: "#34C759", padding: 12, borderRadius: 12, alignItems: "center" }}
              >
                <Text style={{ color: "#061A2B", fontWeight: "900" }}>Pay Fine</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Players with Cards/Suspensions */}
          {playersWithCards.map((player: any) => (
            <View
              key={player.id}
              style={{ backgroundColor: "#0A2238", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#F2D100", marginBottom: 10 }}
            >
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>{player.fullName}</Text>
              <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
                {player.yellowCards > 0 && (
                  <Text style={{ color: "#F2D100", fontWeight: "900" }}>🟨 {player.yellowCards} Yellow</Text>
                )}
                {player.redCards > 0 && (
                  <Text style={{ color: "#FF3B30", fontWeight: "900" }}>🟥 {player.redCards} Red</Text>
                )}
                {player.suspended && (
                  <Text style={{ color: "#FF3B30", fontWeight: "900" }}>⛔ SUSPENDED</Text>
                )}
              </View>
              {player.verificationNote && (
                <Text style={{ color: "#9FB3C8", marginTop: 6, fontSize: 12 }}>
                  Note: {player.verificationNote}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Team Roster */}
      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 18 }}>
            Team Roster ({roster.length})
          </Text>
          {canManageTeam && (
            <TouchableOpacity onPress={() => router.push(`/teams/${id}/roster`)}>
              <Text style={{ color: "#22C6D2", fontWeight: "900" }}>View Details →</Text>
            </TouchableOpacity>
          )}
        </View>

        {roster.length > 0 ? (
          <View style={{ gap: 8 }}>
            {roster.map((player: any) => (
              <TouchableOpacity
                key={player.id}
                onPress={() => router.push(`/players/${player.id}`)}
                style={{ backgroundColor: "#0A2238", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 15 }}>
                      {player.fullName}
                    </Text>
                    <Text style={{ color: "#9FB3C8", marginTop: 2, fontSize: 12 }}>
                      DOB: {player.dob} • {player.verified ? "✓ Verified" : "Unverified"}
                    </Text>
                  </View>
                  {player.suspended && (
                    <View style={{ backgroundColor: "#FF3B30", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 }}>
                      <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "900" }}>SUSPENDED</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={{ backgroundColor: "#0A2238", borderRadius: 14, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center" }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>No players on roster</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 8 }}>Tap "Add Player" to get started</Text>
          </View>
        )}
      </View>

      {/* Upcoming Matches */}
      {teamMatches.length > 0 && (
        <View>
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 18, marginBottom: 10 }}>Upcoming Matches</Text>
          {teamMatches.map((match: any) => (
            <TouchableOpacity
              key={match.id}
              onPress={() => router.push(`/live/${match.id}`)}
              style={{ backgroundColor: "#0A2238", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 10 }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 14 }}>
                    {match.homeTeam} vs {match.awayTeam}
                  </Text>
                  <Text style={{ color: "#9FB3C8", marginTop: 4, fontSize: 12 }}>
                    {match.date || "TBD"} • {match.field || "Field TBD"}
                  </Text>
                </View>
                <Text style={{ color: "#22C6D2", fontWeight: "900" }}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Team Stats */}
      <View style={{ backgroundColor: "#0A2238", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
        <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>Team Stats</Text>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: "#9FB3C8" }}>Roster Size:</Text>
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{roster.length} Players</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: "#9FB3C8" }}>Verified Players:</Text>
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
              {roster.filter((p: any) => p.verified).length}/{roster.length}
            </Text>
          </View>
          {team.matchesPlayed !== undefined && (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9FB3C8" }}>Matches Played:</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{team.matchesPlayed || 0}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}