import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../../src/state/AppStore";

export default function TestDashboard() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = String(id ?? "");

  const { teams, getBereavementEnrollmentStats } = useAppStore() as any;
  const team = teams.find((t: any) => t.id === teamId);
  
  const stats = getBereavementEnrollmentStats 
    ? getBereavementEnrollmentStats(teamId)
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontSize: 18, fontWeight: "900" }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ color: "#F2D100", fontSize: 32, fontWeight: "900", marginTop: 20, marginBottom: 30 }}>
          🔍 DIAGNOSTIC TEST
        </Text>

        {/* INFO CARD */}
        <View style={{ backgroundColor: "#0A2238", padding: 20, borderRadius: 16, marginBottom: 20 }}>
          <Text style={{ color: "#F2D100", fontSize: 18, fontWeight: "900", marginBottom: 16 }}>
            📊 System Status
          </Text>
          
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9FB3C8", fontSize: 15 }}>Team:</Text>
              <Text style={{ color: "#EAF2FF", fontSize: 15, fontWeight: "900" }}>
                {team?.name || '❌ NOT FOUND'}
              </Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9FB3C8", fontSize: 15 }}>Team ID:</Text>
              <Text style={{ color: "#EAF2FF", fontSize: 15, fontWeight: "900" }}>
                {teamId.slice(-10)}...
              </Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9FB3C8", fontSize: 15 }}>Function:</Text>
              <Text style={{ 
                color: getBereavementEnrollmentStats ? "#34C759" : "#FF3B30", 
                fontSize: 15, 
                fontWeight: "900" 
              }}>
                {getBereavementEnrollmentStats ? '✅ EXISTS' : '❌ MISSING'}
              </Text>
            </View>

            {stats && (
              <>
                <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 8 }} />
                
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#9FB3C8", fontSize: 15 }}>Total Enrolled:</Text>
                  <Text style={{ color: "#34C759", fontSize: 15, fontWeight: "900" }}>
                    {stats.total}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#9FB3C8", fontSize: 15 }}>Pending Approval:</Text>
                  <Text style={{ color: "#F2D100", fontSize: 15, fontWeight: "900" }}>
                    {stats.pending}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#9FB3C8", fontSize: 15 }}>Players:</Text>
                  <Text style={{ color: "#22C6D2", fontSize: 15, fontWeight: "900" }}>
                    {stats.players}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#9FB3C8", fontSize: 15 }}>Family:</Text>
                  <Text style={{ color: "#22C6D2", fontSize: 15, fontWeight: "900" }}>
                    {stats.family}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* THE TEST BUTTON */}
        <TouchableOpacity
          onPress={() => {
            if (getBereavementEnrollmentStats) {
              router.push(`/teams/${teamId}/bereavement`);
            } else {
              alert('❌ Function not available - AppStore not updated correctly');
            }
          }}
          style={{
            backgroundColor: "#FF3B30",
            padding: 24,
            borderRadius: 16,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 28, fontWeight: "900", marginBottom: 8 }}>
            🏥 TEST BUTTON
          </Text>
          <Text style={{ color: "#FFF", fontSize: 16, opacity: 0.9 }}>
            {stats ? `${stats.total} enrolled • ${stats.pending} pending` : 'No data available'}
          </Text>
          <Text style={{ color: "#FFF", fontSize: 13, opacity: 0.7, marginTop: 8 }}>
            Tap to test navigation →
          </Text>
        </TouchableOpacity>

        {/* EXPECTED RESULTS */}
        <View style={{ backgroundColor: "#0B2842", padding: 20, borderRadius: 16, borderWidth: 2, borderColor: "#F2D100" }}>
          <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18, marginBottom: 16 }}>
            ✅ Expected Results (Baltimore Veteran FC):
          </Text>
          
          <View style={{ gap: 8 }}>
            <Text style={{ color: "#EAF2FF", fontSize: 14 }}>✓ Team: Baltimore Veteran FC</Text>
            <Text style={{ color: "#EAF2FF", fontSize: 14 }}>✓ Function: ✅ EXISTS</Text>
            <Text style={{ color: "#EAF2FF", fontSize: 14 }}>✓ Total Enrolled: 4</Text>
            <Text style={{ color: "#EAF2FF", fontSize: 14 }}>✓ Pending Approval: 2</Text>
            <Text style={{ color: "#EAF2FF", fontSize: 14 }}>✓ Players: 2</Text>
            <Text style={{ color: "#EAF2FF", fontSize: 14 }}>✓ Family: 0</Text>
            <Text style={{ color: "#EAF2FF", fontSize: 14 }}>✓ BIG RED BUTTON visible above</Text>
          </View>

          <View style={{ 
            marginTop: 16, 
            padding: 12, 
            backgroundColor: "rgba(255,59,48,0.2)", 
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: "#FF3B30"
          }}>
            <Text style={{ color: "#FF3B30", fontSize: 13, fontWeight: "900" }}>
              ⚠️ If you see different results, take a screenshot and send it to me!
            </Text>
          </View>
        </View>

        {/* CONSOLE LOG INFO */}
        <View style={{ marginTop: 20, backgroundColor: "#0A2238", padding: 16, borderRadius: 12 }}>
          <Text style={{ color: "#22C6D2", fontSize: 14, marginBottom: 8 }}>
            💡 Check your console/terminal for:
          </Text>
          <Text style={{ color: "#9FB3C8", fontSize: 12, fontFamily: "monospace" }}>
            {`Console logs will show if data loaded`}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}