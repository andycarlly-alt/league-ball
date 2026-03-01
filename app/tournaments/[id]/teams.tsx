// app/tournaments/[id]/teams.tsx - FIXED (Simple Teams List)
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../../src/state/AppStore";
import { getLogoSource } from "../../../src/utils/logos";

export default function TournamentTeamsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tournaments, getTeamsForTournament } = useAppStore();

  const t = tournaments.find((x) => x.id === id);
  const teams = useMemo(() => (t ? getTeamsForTournament(t.id) : []), [t?.id]);

  if (!t) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Teams</Text>
        <Text style={{ color: "#9FB3C8", marginTop: 8 }}>Tournament not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      {/* Header */}
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
        <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back to Tournament</Text>
      </TouchableOpacity>

      <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>
        Registered Teams
      </Text>
      <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
        {t.name} • {teams.length} {teams.length === 1 ? 'team' : 'teams'}
      </Text>

      {/* Teams List */}
      <ScrollView 
        style={{ marginTop: 14 }} 
        contentContainerStyle={{ gap: 12, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {teams.length > 0 ? (
          teams.map((tm: any) => (
            <TouchableOpacity
              key={tm.id}
              onPress={() => router.push(`/teams/${tm.id}`)}
              style={{ 
                backgroundColor: "#0A2238", 
                borderRadius: 16, 
                padding: 14, 
                borderWidth: 1, 
                borderColor: "rgba(255,255,255,0.08)",
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              {/* Team Logo */}
              <Image
                source={getLogoSource(tm.logoKey || 'placeholder')}
                style={{ width: 48, height: 48, borderRadius: 12 }}
                resizeMode="cover"
              />

              {/* Team Info */}
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                  {tm.name}
                </Text>
                <Text style={{ color: "#9FB3C8", marginTop: 4 }}>
                  Rep: {tm.repName || "Not specified"}  •  Players: {tm.playerCount || 0}
                </Text>
              </View>

              {/* Arrow */}
              <Text style={{ color: "#22C6D2", fontSize: 18 }}>→</Text>
            </TouchableOpacity>
          ))
        ) : (
          // Empty State
          <View style={{ 
            backgroundColor: "#0A2238", 
            borderRadius: 16, 
            padding: 20,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 40,
          }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>⚽</Text>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 18, textAlign: "center" }}>
              No Teams Registered Yet
            </Text>
            <Text style={{ color: "#9FB3C8", marginTop: 8, textAlign: "center", lineHeight: 20 }}>
              Teams will appear here once they register and complete payment for this tournament.
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/tournaments/${t.id}`)}
              style={{
                marginTop: 16,
                backgroundColor: "#22C6D2",
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>
                Back to Tournament
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Info Card */}
      {teams.length > 0 && (
        <View style={{
          backgroundColor: "rgba(34,198,210,0.1)",
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: "rgba(34,198,210,0.3)",
          marginTop: 12,
        }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 13 }}>
            💡 Tap any team to view roster and details
          </Text>
        </View>
      )}
    </View>
  );
}