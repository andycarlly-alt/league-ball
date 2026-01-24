// app/tournaments/[id].tsx - Tournament Detail with Registration - FIXED
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource } from "../../src/utils/logos";

export default function TournamentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const store: any = useAppStore();
  const {
    tournaments,
    teams,
    currentUser,
    addPendingPayment,
    getTeamsForTournament,
  } = store;

  const tournament = useMemo(() => {
    return tournaments?.find((t: any) => t.id === id);
  }, [tournaments, id]);

  const tournamentTeams = useMemo(() => {
    return getTeamsForTournament?.(id as string) || [];
  }, [id, getTeamsForTournament]);

  const userTeam = useMemo(() => {
    return teams?.find((t: any) => t.id === currentUser?.teamId);
  }, [teams, currentUser?.teamId]);

  const isTeamRegistered = useMemo(() => {
    return tournamentTeams.some((t: any) => t.id === currentUser?.teamId);
  }, [tournamentTeams, currentUser?.teamId]);

  if (!tournament) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#EAF2FF", fontSize: 18, fontWeight: "900" }}>
          Tournament not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            backgroundColor: "#22C6D2",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#061A2B", fontWeight: "900" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleRegisterTeam = () => {
    if (!currentUser?.teamId) {
      Alert.alert("No Team", "You need to be a team representative to register");
      return;
    }

    if (isTeamRegistered) {
      Alert.alert("Already Registered", "Your team is already registered for this tournament");
      return;
    }

    const fee = tournament.registrationFee || 15000; // $150
    
    Alert.alert(
      "Register Team",
      `${tournament.name}\n\nTeam: ${userTeam?.name || "Your Team"}\nRegistration Fee: $${(fee / 100).toFixed(2)}\n\nRoster will be locked until payment is complete.\n\nProceed to payment?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay Now",
          onPress: () => {
            // CREATE PENDING PAYMENT
            if (typeof addPendingPayment === 'function') {
              addPendingPayment({
                id: `reg_${tournament.id}_${Date.now()}`,
                type: "TOURNAMENT_REGISTRATION",
                amount: fee,
                teamId: currentUser?.teamId,
                teamName: userTeam?.name,
                tournamentId: tournament.id,
                tournamentName: tournament.name,
                status: "PENDING",
                createdAt: Date.now(),
              });
            }
            
            // FIXED: Changed from '/billing' to '/(tabs)/billing' for proper tab navigation
            router.push('/(tabs)/billing');
            
            setTimeout(() => {
              Alert.alert(
                "Payment Required ⚠️",
                "Complete payment on the Billing screen to finalize registration.\n\nYour roster is locked until payment is received.",
                [{ text: "OK" }]
              );
            }, 500);
          },
        },
      ]
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#061A2B" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
    >
      {/* Header */}
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
        <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back to Tournaments</Text>
      </TouchableOpacity>

      <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900" }}>
        {tournament.name}
      </Text>

      {/* Tournament Info */}
      <View
        style={{
          backgroundColor: "#0A2238",
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
          Tournament Details
        </Text>
        
        <View style={{ gap: 8 }}>
          {tournament.location && (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9FB3C8" }}>Location:</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{tournament.location}</Text>
            </View>
          )}
          
          {tournament.startDate && (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9FB3C8" }}>Start Date:</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{formatDate(tournament.startDate)}</Text>
            </View>
          )}
          
          {tournament.endDate && (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9FB3C8" }}>End Date:</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{formatDate(tournament.endDate)}</Text>
            </View>
          )}
          
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: "#9FB3C8" }}>Teams Registered:</Text>
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{tournamentTeams.length}</Text>
          </View>
          
          {tournament.registrationFee && (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9FB3C8" }}>Registration Fee:</Text>
              <Text style={{ color: "#F2D100", fontWeight: "900" }}>
                ${(tournament.registrationFee / 100).toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Registration Button - Only for Team Reps */}
      {currentUser?.role === "TEAM_REP" && currentUser?.teamId && (
        <View>
          {isTeamRegistered ? (
            <View
              style={{
                backgroundColor: "rgba(52,199,89,0.1)",
                borderRadius: 14,
                padding: 16,
                borderWidth: 2,
                borderColor: "#34C759",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 16 }}>
                ✅ Team Registered
              </Text>
              <Text style={{ color: "#EAF2FF", marginTop: 4 }}>
                {userTeam?.name} is registered for this tournament
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleRegisterTeam}
              style={{
                backgroundColor: "#34C759",
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>
                Register Team - ${((tournament.registrationFee || 15000) / 100).toFixed(2)}
              </Text>
              <Text style={{ color: "#061A2B", marginTop: 4, fontSize: 12 }}>
                {userTeam?.name || "Your Team"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Registered Teams */}
      {tournamentTeams.length > 0 && (
        <View
          style={{
            backgroundColor: "#0A2238",
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
            Registered Teams ({tournamentTeams.length})
          </Text>
          
          <View style={{ gap: 12 }}>
            {tournamentTeams.map((team: any) => (
              <TouchableOpacity
                key={team.id}
                onPress={() => router.push(`/teams/${team.id}`)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderRadius: 12,
                }}
              >
                <Image
                  source={getLogoSource(team.logoKey)}
                  style={{ width: 40, height: 40, borderRadius: 8 }}
                  resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                    {team.name}
                  </Text>
                  {team.repName && (
                    <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                      Rep: {team.repName}
                    </Text>
                  )}
                </View>
                <Text style={{ color: "#22C6D2" }}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={{ gap: 10 }}>
        <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16 }}>
          Quick Actions
        </Text>
        
        <TouchableOpacity
          onPress={() => router.push(`/tournaments/${id}/teams`)}
          style={{
            backgroundColor: "#0A2238",
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
            📋 View All Teams
          </Text>
        </TouchableOpacity>
        
        {currentUser?.role === "LEAGUE_ADMIN" && (
          <TouchableOpacity
            onPress={() => router.push('/admin/revenue')}
            style={{
              backgroundColor: "#0A2238",
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
              💰 View Revenue Dashboard
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}