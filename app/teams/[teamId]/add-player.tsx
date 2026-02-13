// app/teams/[teamId]/add-player.tsx - FIXED + IMPROVED

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ageBannerStyle, calcAge, useAppStore } from "../../../src/state/AppStore";

export default function AddPlayerScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const router = useRouter();
  
  const { 
    teams, 
    tournaments, 
    addPlayer,
    canAddUnderagedPlayer,
    getTeamUnderagedPlayers,
    isPlayerUnderaged,
  } = useAppStore() as any;

  const team = teams.find((t: any) => t.id === teamId);
  const tournament = tournaments.find((t: any) => t.id === team?.tournamentId);

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD
  const [shirtNumber, setShirtNumber] = useState(""); // NOW OPTIONAL
  const [position, setPosition] = useState("");

  // 🐛 DEBUG: Log tournament info
  console.log("🔍 Debug Info:", {
    teamId,
    teamTournamentId: team?.tournamentId,
    tournamentFound: !!tournament,
    tournamentName: tournament?.name,
    underageRules: tournament?.underageRules,
  });

  // ✅ Calculate preview age from DOB input
  const previewAge = useMemo(() => (dob ? calcAge(dob) : null), [dob]);
  
  // ✅ Check if player would be underaged for this tournament
  const isUnderaged = useMemo(() => {
    if (!tournament?.underageRules?.enabled || !previewAge) return false;
    return previewAge < tournament.underageRules.ageThreshold;
  }, [tournament, previewAge]);

  // ✅ Get current underage validation status
  const underageValidation = useMemo(() => {
    if (!team?.id || !tournament?.id) {
      console.log("⚠️ Missing team or tournament ID");
      return null;
    }
    const validation = canAddUnderagedPlayer(team.id, tournament.id);
    console.log("✅ Validation result:", validation);
    return validation;
  }, [team?.id, tournament?.id, canAddUnderagedPlayer]);

  // ✅ Get list of current underage players on roster
  const currentUnderaged = useMemo(() => {
    if (!team?.id || !tournament?.id) return [];
    return getTeamUnderagedPlayers(team.id, tournament.id);
  }, [team?.id, tournament?.id, getTeamUnderagedPlayers]);

  // ✅ Determine if submit should be disabled
  const canSubmit = useMemo(() => {
    if (!fullName.trim() || !dob.trim()) return false;
    
    // If player is underaged and validation says it's not valid, disable submit
    if (isUnderaged && underageValidation && !underageValidation.isValid) {
      console.log("🚫 Cannot submit - validation failed");
      return false;
    }
    
    console.log("✅ Can submit");
    return true;
  }, [fullName, dob, isUnderaged, underageValidation]);

  const onSubmit = () => {
    if (!fullName.trim()) {
      Alert.alert("Missing Info", "Please enter player name");
      return;
    }

    if (!dob.trim()) {
      Alert.alert("Missing Info", "Please enter date of birth");
      return;
    }

    if (!team || !tournament) {
      Alert.alert("Error", "Team/tournament not found.");
      return;
    }

    // ✅ Double-check validation before submitting
    if (isUnderaged && underageValidation && !underageValidation.isValid) {
      Alert.alert("Cannot Add Player", underageValidation.reason ?? "Underage limit reached");
      return;
    }

    const res = addPlayer({
      leagueId: team.leagueId,
      tournamentId: team.tournamentId,
      teamId: team.id,
      fullName,
      dob,
      shirtNumber: shirtNumber.trim() || undefined, // Optional now
      position,
    });

    if (!res.ok) {
      Alert.alert("Cannot Add Player", res.reason ?? "Unknown error");
      return;
    }

    Alert.alert(
      "✅ Player Added!",
      `${fullName} has been added to ${team.name}${!shirtNumber.trim() ? '\n\nJersey number can be assigned during check-in.' : ''}`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  if (!team) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: "#EAF2FF", marginTop: 20 }}>Team not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>
          
          {/* Quick Invite Button */}
          <TouchableOpacity 
            onPress={() => router.push(`/teams/${teamId}/invite-player`)}
            style={{
              backgroundColor: "#22C6D2",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 13 }}>
              📱 Send Invite
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900", marginTop: 16 }}>
          Add Player
        </Text>
        <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
          Team: {team.name} • {tournament?.ageRuleLabel ?? "No age rule"}
        </Text>

        {/* Mobile Invite Info */}
        <View style={{
          marginTop: 16,
          backgroundColor: "rgba(34,198,210,0.1)",
          borderRadius: 12,
          padding: 14,
          borderWidth: 1,
          borderColor: "rgba(34,198,210,0.3)",
        }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 13, marginBottom: 6 }}>
            💡 New: Easy Player Sign-Up
          </Text>
          <Text style={{ color: "#9FB3C8", fontSize: 12, lineHeight: 18 }}>
            Tap "Send Invite" to let players sign up on their phones with ID photos. Or add them manually below.
          </Text>
        </View>

        {/* ✅ TOURNAMENT RULES BANNER */}
        {tournament?.underageRules?.enabled && (
          <View style={{ 
            marginTop: 16, 
            backgroundColor: tournament.underageRules.maxUnderagedOnRoster === 0 
              ? "rgba(211,59,59,0.1)" 
              : "rgba(242,209,0,0.1)",
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: tournament.underageRules.maxUnderagedOnRoster === 0
              ? "rgba(211,59,59,0.3)"
              : "rgba(242,209,0,0.3)",
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 20, marginRight: 8 }}>
                {tournament.underageRules.maxUnderagedOnRoster === 0 ? "🔥" : "⚠️"}
              </Text>
              <Text style={{ 
                color: tournament.underageRules.maxUnderagedOnRoster === 0 ? "#D33B3B" : "#F2D100",
                fontWeight: "900",
                fontSize: 16,
              }}>
                {tournament.underageRules.maxUnderagedOnRoster === 0
                  ? `STRICT ${tournament.underageRules.ageThreshold}+ ONLY`
                  : `Under-${tournament.underageRules.ageThreshold} Rules`}
              </Text>
            </View>
            
            {tournament.underageRules.maxUnderagedOnRoster === 0 ? (
              <Text style={{ color: "#EAF2FF", fontSize: 13, lineHeight: 19 }}>
                • NO players under {tournament.underageRules.ageThreshold} allowed{"\n"}
                • All players must be {tournament.underageRules.ageThreshold}+{"\n"}
                • Strictest enforcement
              </Text>
            ) : (
              <>
                <Text style={{ color: "#EAF2FF", fontSize: 13 }}>
                  • Max {tournament.underageRules.maxUnderagedOnRoster} players under {tournament.underageRules.ageThreshold} on roster
                </Text>
                {tournament.underageRules.maxUnderagedOnField && (
                  <Text style={{ color: "#EAF2FF", fontSize: 13, marginTop: 2 }}>
                    • Max {tournament.underageRules.maxUnderagedOnField} on field at once
                  </Text>
                )}
                
                {/* Current Status Display */}
                <View style={{ 
                  marginTop: 10, 
                  backgroundColor: "rgba(0,0,0,0.2)", 
                  padding: 10, 
                  borderRadius: 10 
                }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 13 }}>
                    Current: {underageValidation?.currentUnderaged || 0}/{underageValidation?.maxAllowed || 0} underaged players
                  </Text>
                  {currentUnderaged.length > 0 && (
                    <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4 }}>
                      {currentUnderaged.map((p: any) => p.fullName).join(", ")}
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>
        )}

        {/* ✅ AGE PREVIEW BANNER */}
        {typeof previewAge === "number" && (
          <View style={{ marginTop: 16, borderRadius: 14, overflow: "hidden" }}>
            {(() => {
              const banner = ageBannerStyle(previewAge);
              return (
                <View style={{ backgroundColor: banner.bg, padding: 14 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ color: banner.fg, fontWeight: "900", fontSize: 16 }}>
                      Preview: {banner.label} • Age {previewAge}
                    </Text>
                    {/* Underage indicator badge */}
                    {isUnderaged && (
                      <View style={{ 
                        backgroundColor: "rgba(255,255,255,0.2)", 
                        paddingHorizontal: 10, 
                        paddingVertical: 4, 
                        borderRadius: 8 
                      }}>
                        <Text style={{ color: banner.fg, fontWeight: "900", fontSize: 11 }}>
                          UNDER {tournament?.underageRules?.ageThreshold}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })()}
          </View>
        )}

        {/* ✅ WARNING: STRICT TOURNAMENT - CANNOT ADD */}
        {isUnderaged && tournament?.underageRules?.maxUnderagedOnRoster === 0 && (
          <View style={{
            marginTop: 16,
            backgroundColor: "rgba(211,59,59,0.15)",
            borderRadius: 12,
            padding: 14,
            borderWidth: 2,
            borderColor: "#D33B3B",
          }}>
            <Text style={{ color: "#FF3B30", fontWeight: "900", fontSize: 14 }}>
              ⛔ Cannot Add This Player
            </Text>
            <Text style={{ color: "#EAF2FF", fontSize: 13, marginTop: 6, lineHeight: 19 }}>
              This player is {previewAge} years old. {tournament.name} is a strict {tournament.underageRules.ageThreshold}+ tournament with NO underaged players allowed.
            </Text>
          </View>
        )}

        {/* ✅ WARNING: AT UNDERAGE LIMIT */}
        {isUnderaged && 
         underageValidation && 
         !underageValidation.isValid && 
         tournament?.underageRules?.maxUnderagedOnRoster !== 0 && (
          <View style={{
            marginTop: 16,
            backgroundColor: "rgba(242,209,0,0.15)",
            borderRadius: 12,
            padding: 14,
            borderWidth: 2,
            borderColor: "#F2D100",
          }}>
            <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 14 }}>
              ⚠️ Underage Limit Reached
            </Text>
            <Text style={{ color: "#EAF2FF", fontSize: 13, marginTop: 6, lineHeight: 19 }}>
              {underageValidation.reason}
            </Text>
            
            {/* List current underage players */}
            {underageValidation.underagedPlayers && underageValidation.underagedPlayers.length > 0 && (
              <View style={{ 
                marginTop: 8, 
                paddingTop: 8, 
                borderTopWidth: 1, 
                borderTopColor: "rgba(255,255,255,0.1)" 
              }}>
                <Text style={{ color: "#9FB3C8", fontSize: 12, fontWeight: "900", marginBottom: 4 }}>
                  Current underaged players:
                </Text>
                {underageValidation.underagedPlayers.map((p: any) => (
                  <Text key={p.id} style={{ color: "#9FB3C8", fontSize: 11, marginTop: 2 }}>
                    • {p.fullName} (Age {calcAge(p.dob)})
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ✅ SUCCESS: CAN ADD UNDERAGE PLAYER */}
        {isUnderaged && 
         underageValidation && 
         underageValidation.isValid && 
         tournament?.underageRules?.maxUnderagedOnRoster !== 0 && (
          <View style={{
            marginTop: 16,
            backgroundColor: "rgba(52,199,89,0.15)",
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(52,199,89,0.3)",
          }}>
            <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 14 }}>
              ✓ Can Add Underage Player
            </Text>
            <Text style={{ color: "#EAF2FF", fontSize: 13, marginTop: 6, lineHeight: 19 }}>
              This player is under {tournament.underageRules.ageThreshold}, but your team still has room for {underageValidation.maxAllowed - underageValidation.currentUnderaged} more underaged player{(underageValidation.maxAllowed - underageValidation.currentUnderaged) !== 1 ? 's' : ''}.
            </Text>
          </View>
        )}

        {/* FORM */}
        <View style={{ marginTop: 20, backgroundColor: "#0A2238", borderRadius: 14, padding: 16 }}>
          {/* Full Name */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8, fontSize: 15 }}>
              Full Name *
            </Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g., John Smith"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={{
                backgroundColor: "#0B2842",
                color: "#EAF2FF",
                padding: 12,
                borderRadius: 10,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </View>

          {/* Date of Birth */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8, fontSize: 15 }}>
              Date of Birth * (YYYY-MM-DD)
            </Text>
            <TextInput
              value={dob}
              onChangeText={setDob}
              placeholder="1990-03-15"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={{
                backgroundColor: "#0B2842",
                color: "#EAF2FF",
                padding: 12,
                borderRadius: 10,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </View>

          {/* Jersey Number - NOW OPTIONAL */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 15 }}>
                Jersey Number
              </Text>
              <View style={{ 
                marginLeft: 8,
                backgroundColor: "rgba(242,209,0,0.2)",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
              }}>
                <Text style={{ color: "#F2D100", fontSize: 11, fontWeight: "900" }}>OPTIONAL</Text>
              </View>
            </View>
            <TextInput
              value={shirtNumber}
              onChangeText={setShirtNumber}
              placeholder="Can assign during check-in"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="number-pad"
              style={{
                backgroundColor: "#0B2842",
                color: "#EAF2FF",
                padding: 12,
                borderRadius: 10,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
            <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 6 }}>
              Jerseys distributed on game day - number can be assigned then
            </Text>
          </View>

          {/* Position */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8, fontSize: 15 }}>
              Position
            </Text>
            <TextInput
              value={position}
              onChangeText={setPosition}
              placeholder="e.g., Midfielder"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={{
                backgroundColor: "#0B2842",
                color: "#EAF2FF",
                padding: 12,
                borderRadius: 10,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={onSubmit} 
            disabled={!canSubmit}
            style={{ 
              backgroundColor: canSubmit ? "#34C759" : "#0B2842",
              padding: 14, 
              borderRadius: 12, 
              alignItems: "center",
              borderWidth: 2,
              borderColor: canSubmit ? "#34C759" : "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{ 
              fontWeight: "900", 
              color: canSubmit ? "#061A2B" : "#9FB3C8",
              fontSize: 16,
            }}>
              {canSubmit ? "Add Player" : "Cannot Add Player"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ✅ HELP TEXT / TOURNAMENT RULES EXPLANATION */}
        {tournament?.underageRules?.enabled && (
          <View style={{
            marginTop: 16,
            backgroundColor: "rgba(34,198,210,0.1)",
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(34,198,210,0.3)",
          }}>
            <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 13, marginBottom: 6 }}>
              💡 Tournament Rules
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: 12, lineHeight: 18 }}>
              {tournament.underageRules.maxUnderagedOnRoster === 0
                ? `This is a strict ${tournament.underageRules.ageThreshold}+ tournament. All players must be ${tournament.underageRules.ageThreshold} or older on the tournament start date.`
                : `This tournament allows up to ${tournament.underageRules.maxUnderagedOnRoster} players under ${tournament.underageRules.ageThreshold} years old on your roster${tournament.underageRules.maxUnderagedOnField ? `, but only ${tournament.underageRules.maxUnderagedOnField} can be on the field at once` : ''}.`}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}