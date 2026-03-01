// app/admin/bereavement/debug.tsx - DIAGNOSTIC TOOL

import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../../src/state/AppStore";

export default function BereavementDebugScreen() {
  const router = useRouter();
  const {
    bereavementEnrollments,
    bereavementEvents,
    bereavementPayments,
    teams,
    players,
  } = useAppStore() as any;

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <View style={{
        backgroundColor: "#0A2238",
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 16,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#22C6D2", fontSize: 16, fontWeight: "900" }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900", textAlign: "center", marginTop: 10 }}>
          🔍 Bereavement Debug
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Enrollments */}
        <View style={{
          backgroundColor: "#0A2238",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ color: "#F2D100", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
            📋 Enrollments ({(bereavementEnrollments || []).length})
          </Text>
          
          {(bereavementEnrollments || []).length === 0 ? (
            <View style={{ backgroundColor: "#0B2842", padding: 16, borderRadius: 10 }}>
              <Text style={{ color: "#FF3B30", fontWeight: "900", marginBottom: 8 }}>
                ❌ NO ENROLLMENTS FOUND
              </Text>
              <Text style={{ color: "#9FB3C8", fontSize: 12 }}>
                This is the problem! Enrollments are not being saved to the store.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {bereavementEnrollments.map((enrollment: any, index: number) => (
                <View
                  key={enrollment.id || index}
                  style={{
                    backgroundColor: "#0B2842",
                    padding: 12,
                    borderRadius: 10,
                    borderLeftWidth: 4,
                    borderLeftColor: enrollment.status === "ACTIVE" ? "#34C759" : "#F2D100",
                  }}
                >
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 14 }}>
                    {enrollment.firstName} {enrollment.lastName}
                  </Text>
                  <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4 }}>
                    ID: {enrollment.id}
                  </Text>
                  <Text style={{ color: "#9FB3C8", fontSize: 11 }}>
                    Team ID: {enrollment.teamId}
                  </Text>
                  <Text style={{ color: "#9FB3C8", fontSize: 11 }}>
                    Status: {enrollment.status}
                  </Text>
                  <Text style={{ color: "#9FB3C8", fontSize: 11 }}>
                    Type: {enrollment.memberType}
                  </Text>
                  <Text style={{ color: "#9FB3C8", fontSize: 11 }}>
                    Created: {enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleString() : 'N/A'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Events */}
        <View style={{
          backgroundColor: "#0A2238",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ color: "#F2D100", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
            ❤️ Events ({(bereavementEvents || []).length})
          </Text>
          
          {(bereavementEvents || []).length === 0 ? (
            <View style={{ backgroundColor: "#0B2842", padding: 16, borderRadius: 10 }}>
              <Text style={{ color: "#9FB3C8" }}>No events created yet</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {bereavementEvents.map((event: any, index: number) => (
                <View
                  key={event.id || index}
                  style={{
                    backgroundColor: "#0B2842",
                    padding: 12,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                    {event.deceasedName}
                  </Text>
                  <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4 }}>
                    Status: {event.status}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Payments */}
        <View style={{
          backgroundColor: "#0A2238",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ color: "#F2D100", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
            💳 Payments ({(bereavementPayments || []).length})
          </Text>
          
          {(bereavementPayments || []).length === 0 ? (
            <View style={{ backgroundColor: "#0B2842", padding: 16, borderRadius: 10 }}>
              <Text style={{ color: "#9FB3C8" }}>No payments yet</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {bereavementPayments.map((payment: any, index: number) => (
                <View
                  key={payment.id || index}
                  style={{
                    backgroundColor: "#0B2842",
                    padding: 12,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                    Team: {payment.teamId}
                  </Text>
                  <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4 }}>
                    Amount: ${(payment.amount / 100).toFixed(2)} • Status: {payment.status}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Teams */}
        <View style={{
          backgroundColor: "#0A2238",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ color: "#F2D100", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
            🏟️ Teams ({(teams || []).length})
          </Text>
          
          <View style={{ gap: 10 }}>
            {(teams || []).slice(0, 5).map((team: any, index: number) => (
              <View
                key={team.id || index}
                style={{
                  backgroundColor: "#0B2842",
                  padding: 12,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                  {team.name}
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4 }}>
                  ID: {team.id}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Raw Data Dump */}
        <View style={{
          backgroundColor: "#0A2238",
          borderRadius: 12,
          padding: 16,
        }}>
          <Text style={{ color: "#F2D100", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
            📄 Raw Store Data
          </Text>
          
          <View style={{ backgroundColor: "#0B2842", padding: 12, borderRadius: 10 }}>
            <Text style={{ color: "#9FB3C8", fontSize: 10, fontFamily: "monospace" }}>
              bereavementEnrollments: {JSON.stringify(bereavementEnrollments, null, 2).substring(0, 500)}...
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              console.log("=== BEREAVEMENT DEBUG DATA ===");
              console.log("Enrollments:", JSON.stringify(bereavementEnrollments, null, 2));
              console.log("Events:", JSON.stringify(bereavementEvents, null, 2));
              console.log("Payments:", JSON.stringify(bereavementPayments, null, 2));
              console.log("Teams:", teams?.map((t: any) => ({ id: t.id, name: t.name })));
            }}
            style={{
              marginTop: 12,
              backgroundColor: "#22C6D2",
              padding: 12,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>
              📋 Log Full Data to Console
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}