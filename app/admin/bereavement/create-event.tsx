// app/admin/bereavement/create-event.tsx - CREATE BEREAVEMENT EVENT

import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../../src/state/AppStore";

export default function CreateBereavementEventScreen() {
  const router = useRouter();
  const {
    currentUser,
    can,
    bereavementEnrollments,
    createBereavementEvent,
  } = useAppStore() as any;

  // Form state
  const [deceasedName, setDeceasedName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [amountPerMember, setAmountPerMember] = useState("5.00");
  const [deadlineDays, setDeadlineDays] = useState("7");
  const [message, setMessage] = useState("");

  // Check admin access
  const isAdmin = can("MANAGE_TOURNAMENTS") || currentUser?.role === "LEAGUE_ADMIN" || currentUser?.role === "TOURNAMENT_ADMIN";

  // Calculate active enrollments
  const activeEnrollments = useMemo(() => {
    return (bereavementEnrollments || []).filter((e: any) => e.status === "ACTIVE");
  }, [bereavementEnrollments]);

  // Calculate projected collection
  const projectedCollection = useMemo(() => {
    const amount = parseFloat(amountPerMember) || 0;
    return amount * activeEnrollments.length;
  }, [amountPerMember, activeEnrollments.length]);

  // Calculate deadline date
  const deadlineDate = useMemo(() => {
    const days = parseInt(deadlineDays) || 7;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }, [deadlineDays]);

  // Validate form
  const canSubmit = useMemo(() => {
    return (
      deceasedName.trim().length > 0 &&
      parseFloat(amountPerMember) > 0 &&
      parseInt(deadlineDays) > 0 &&
      activeEnrollments.length > 0
    );
  }, [deceasedName, amountPerMember, deadlineDays, activeEnrollments.length]);

  const handleCreateEvent = () => {
    if (!canSubmit) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const amount = Math.round(parseFloat(amountPerMember) * 100); // Convert to cents
    const days = parseInt(deadlineDays);

    Alert.alert(
      "Create Bereavement Event",
      `This will create a bereavement event for ${deceasedName}.\n\n` +
      `Collection: $${amountPerMember} per member\n` +
      `Total Expected: $${projectedCollection.toFixed(2)}\n` +
      `Enrolled Members: ${activeEnrollments.length}\n` +
      `Deadline: ${deadlineDate.toLocaleDateString()}\n\n` +
      `Payment notifications will be sent to all team representatives.\n\n` +
      `Continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create Event",
          style: "default",
          onPress: () => {
            // Create the event
            if (typeof createBereavementEvent === "function") {
              const eventData = {
                deceasedName: deceasedName.trim(),
                relationship: relationship.trim() || undefined,
                amountPerMember: amount,
                deadline: deadlineDate.toISOString(),
                message: message.trim() || undefined,
                createdBy: currentUser?.id,
                createdAt: new Date().toISOString(),
                status: "ACTIVE",
              };

              const result = createBereavementEvent(eventData);

              if (result.ok) {
                Alert.alert(
                  "✅ Event Created",
                  `Bereavement event for ${deceasedName} has been created.\n\n` +
                  `${activeEnrollments.length} payment notifications will be sent to team representatives.\n\n` +
                  `Total to collect: $${projectedCollection.toFixed(2)}`,
                  [
                    {
                      text: "Done",
                      onPress: () => router.back(),
                    },
                  ]
                );
              } else {
                Alert.alert("Error", result.message || "Failed to create event");
              }
            } else {
              // Mock creation for demo
              Alert.alert(
                "✅ Event Created (Demo)",
                `Bereavement event for ${deceasedName} has been created.\n\n` +
                `In production:\n` +
                `• ${activeEnrollments.length} payment entries created\n` +
                `• Team reps notified via SMS/email\n` +
                `• Total to collect: $${projectedCollection.toFixed(2)}`,
                [
                  {
                    text: "Done",
                    onPress: () => router.back(),
                  },
                ]
              );
            }
          },
        },
      ]
    );
  };

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#FF3B30", fontSize: 18, fontWeight: "900" }}>Access Denied</Text>
        <Text style={{ color: "#9FB3C8", marginTop: 8, textAlign: "center" }}>
          Only league administrators can create bereavement events
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20, backgroundColor: "#22C6D2", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: "#061A2B", fontWeight: "900" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (activeEnrollments.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
        {/* Header */}
        <View style={{
          backgroundColor: "#0A2238",
          paddingTop: 60,
          paddingBottom: 20,
          paddingHorizontal: 16,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}
          >
            <View style={{ backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
              <Text style={{ color: "#22C6D2", fontSize: 16, fontWeight: "900" }}>← Back</Text>
            </View>
          </TouchableOpacity>

          <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900", textAlign: "center" }}>
            Create Bereavement Event
          </Text>
        </View>

        {/* No Enrollments Warning */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <View style={{
            backgroundColor: "#0A2238",
            borderRadius: 16,
            padding: 24,
            borderWidth: 2,
            borderColor: "#FF3B30",
            maxWidth: 400,
          }}>
            <Text style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>⚠️</Text>
            <Text style={{ color: "#FF3B30", fontSize: 20, fontWeight: "900", textAlign: "center", marginBottom: 12 }}>
              No Enrolled Members
            </Text>
            <Text style={{ color: "#EAF2FF", textAlign: "center", lineHeight: 22 }}>
              There are no active bereavement fund enrollments. Events cannot be created without enrolled members.
            </Text>
            <Text style={{ color: "#9FB3C8", textAlign: "center", marginTop: 16, fontSize: 13, lineHeight: 20 }}>
              Team representatives need to enroll their players and family members before bereavement events can be created.
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                marginTop: 20,
                backgroundColor: "#22C6D2",
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#0A2238",
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}
        >
          <View style={{ backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
            <Text style={{ color: "#22C6D2", fontSize: 16, fontWeight: "900" }}>← Back</Text>
          </View>
        </TouchableOpacity>

        <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900", textAlign: "center" }}>
          Create Bereavement Event
        </Text>
        <Text style={{ color: "#9FB3C8", textAlign: "center", fontSize: 12, marginTop: 4 }}>
          Initiate collection for deceased member
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Active Enrollments Info */}
        <View style={{
          backgroundColor: "#0A2238",
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: "rgba(34,198,210,0.3)",
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Text style={{ fontSize: 32 }}>👥</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#22C6D2", fontSize: 18, fontWeight: "900" }}>
                {activeEnrollments.length} Enrolled Members
              </Text>
              <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 2 }}>
                Payments will be collected from these members
              </Text>
            </View>
          </View>
          
          {projectedCollection > 0 && (
            <View style={{
              backgroundColor: "#0B2842",
              borderRadius: 10,
              padding: 12,
              marginTop: 8,
            }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: "#9FB3C8", fontSize: 13 }}>Projected Collection:</Text>
                <Text style={{ color: "#34C759", fontSize: 24, fontWeight: "900" }}>
                  ${projectedCollection.toFixed(2)}
                </Text>
              </View>
              <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4 }}>
                {activeEnrollments.length} members × ${parseFloat(amountPerMember).toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Form */}
        <View style={{
          backgroundColor: "#0A2238",
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
        }}>
          {/* Deceased Name */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8, fontSize: 15 }}>
              Deceased Person's Name *
            </Text>
            <TextInput
              value={deceasedName}
              onChangeText={setDeceasedName}
              placeholder="e.g., John Smith"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={{
                backgroundColor: "#0B2842",
                color: "#EAF2FF",
                padding: 14,
                borderRadius: 12,
                fontSize: 16,
                borderWidth: 1,
                borderColor: deceasedName.trim() ? "rgba(52,199,89,0.3)" : "rgba(255,255,255,0.1)",
              }}
            />
          </View>

          {/* Relationship (Optional) */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 15 }}>
                Relationship to League
              </Text>
              <View style={{
                marginLeft: 8,
                backgroundColor: "rgba(159,179,200,0.2)",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
              }}>
                <Text style={{ color: "#9FB3C8", fontSize: 11, fontWeight: "900" }}>OPTIONAL</Text>
              </View>
            </View>
            <TextInput
              value={relationship}
              onChangeText={setRelationship}
              placeholder="e.g., Player, Family Member, Coach, Former Player"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={{
                backgroundColor: "#0B2842",
                color: "#EAF2FF",
                padding: 14,
                borderRadius: 12,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </View>

          {/* Amount Per Member */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8, fontSize: 15 }}>
              Collection Amount Per Member *
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <View style={{
                  backgroundColor: "#0B2842",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: parseFloat(amountPerMember) > 0 ? "rgba(52,199,89,0.3)" : "rgba(255,255,255,0.1)",
                  flexDirection: "row",
                  alignItems: "center",
                  paddingLeft: 14,
                }}>
                  <Text style={{ color: "#34C759", fontSize: 20, fontWeight: "900" }}>$</Text>
                  <TextInput
                    value={amountPerMember}
                    onChangeText={setAmountPerMember}
                    placeholder="5.00"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    keyboardType="decimal-pad"
                    style={{
                      flex: 1,
                      color: "#EAF2FF",
                      padding: 14,
                      paddingLeft: 8,
                      fontSize: 16,
                    }}
                  />
                </View>
              </View>

              {/* Quick Amount Buttons */}
              <View style={{ flexDirection: "row", gap: 6 }}>
                {["5.00", "10.00", "20.00"].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    onPress={() => setAmountPerMember(amount)}
                    style={{
                      backgroundColor: amountPerMember === amount ? "#34C759" : "#0B2842",
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: amountPerMember === amount ? "#34C759" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Text style={{
                      color: amountPerMember === amount ? "#061A2B" : "#EAF2FF",
                      fontWeight: "900",
                      fontSize: 13,
                    }}>
                      ${amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 8 }}>
              Standard collection is $5 per member
            </Text>
          </View>

          {/* Payment Deadline */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8, fontSize: 15 }}>
              Payment Deadline *
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <View style={{
                  backgroundColor: "#0B2842",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: parseInt(deadlineDays) > 0 ? "rgba(52,199,89,0.3)" : "rgba(255,255,255,0.1)",
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 14,
                }}>
                  <TextInput
                    value={deadlineDays}
                    onChangeText={setDeadlineDays}
                    placeholder="7"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    keyboardType="number-pad"
                    style={{
                      flex: 1,
                      color: "#EAF2FF",
                      padding: 14,
                      fontSize: 16,
                    }}
                  />
                  <Text style={{ color: "#9FB3C8", fontSize: 14, fontWeight: "900" }}>days</Text>
                </View>
              </View>

              {/* Quick Days Buttons */}
              <View style={{ flexDirection: "row", gap: 6 }}>
                {["7", "14", "30"].map((days) => (
                  <TouchableOpacity
                    key={days}
                    onPress={() => setDeadlineDays(days)}
                    style={{
                      backgroundColor: deadlineDays === days ? "#F2D100" : "#0B2842",
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: deadlineDays === days ? "#F2D100" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Text style={{
                      color: deadlineDays === days ? "#061A2B" : "#EAF2FF",
                      fontWeight: "900",
                      fontSize: 13,
                    }}>
                      {days}d
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{
              backgroundColor: "#0B2842",
              borderRadius: 10,
              padding: 12,
              marginTop: 8,
            }}>
              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 14 }}>
                Deadline: {deadlineDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>
                {parseInt(deadlineDays)} days from today
              </Text>
            </View>
          </View>

          {/* Message (Optional) */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 15 }}>
                Message to Team Reps
              </Text>
              <View style={{
                marginLeft: 8,
                backgroundColor: "rgba(159,179,200,0.2)",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
              }}>
                <Text style={{ color: "#9FB3C8", fontSize: 11, fontWeight: "900" }}>OPTIONAL</Text>
              </View>
            </View>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Additional details or memorial service information..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: "#0B2842",
                color: "#EAF2FF",
                padding: 14,
                borderRadius: 12,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                minHeight: 100,
                textAlignVertical: "top",
              }}
            />
            <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 8 }}>
              This message will be included in payment notifications
            </Text>
          </View>
        </View>

        {/* Summary Preview */}
        <View style={{
          backgroundColor: "#0A2238",
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
          borderWidth: 2,
          borderColor: canSubmit ? "rgba(52,199,89,0.3)" : "rgba(255,59,48,0.3)",
        }}>
          <Text style={{ 
            color: canSubmit ? "#34C759" : "#FF3B30", 
            fontWeight: "900", 
            fontSize: 16, 
            marginBottom: 16 
          }}>
            📋 Event Summary
          </Text>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9FB3C8" }}>Deceased:</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                {deceasedName.trim() || "—"}
              </Text>
            </View>

            {relationship.trim() && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#9FB3C8" }}>Relationship:</Text>
                <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                  {relationship.trim()}
                </Text>
              </View>
            )}

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9FB3C8" }}>Amount per member:</Text>
              <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16 }}>
                ${parseFloat(amountPerMember || 0).toFixed(2)}
              </Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9FB3C8" }}>Enrolled members:</Text>
              <Text style={{ color: "#22C6D2", fontWeight: "900" }}>
                {activeEnrollments.length}
              </Text>
            </View>

            <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 4 }} />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>Total to Collect:</Text>
              <Text style={{ color: "#34C759", fontWeight: "900", fontSize: 20 }}>
                ${projectedCollection.toFixed(2)}
              </Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9FB3C8" }}>Deadline:</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                {deadlineDate.toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* What Happens Next */}
        <View style={{
          backgroundColor: "rgba(34,198,210,0.1)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: "rgba(34,198,210,0.3)",
        }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 14, marginBottom: 12 }}>
            💡 What Happens Next?
          </Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Text style={{ color: "#22C6D2", fontSize: 18 }}>1.</Text>
              <Text style={{ color: "#EAF2FF", flex: 1, lineHeight: 20 }}>
                Event created with {activeEnrollments.length} payment entries
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Text style={{ color: "#22C6D2", fontSize: 18 }}>2.</Text>
              <Text style={{ color: "#EAF2FF", flex: 1, lineHeight: 20 }}>
                Team reps notified via SMS and email
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Text style={{ color: "#22C6D2", fontSize: 18 }}>3.</Text>
              <Text style={{ color: "#EAF2FF", flex: 1, lineHeight: 20 }}>
                Reps collect from enrolled members
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Text style={{ color: "#22C6D2", fontSize: 18 }}>4.</Text>
              <Text style={{ color: "#EAF2FF", flex: 1, lineHeight: 20 }}>
                Payments submitted through team dashboards
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Text style={{ color: "#34C759", fontSize: 18 }}>5.</Text>
              <Text style={{ color: "#EAF2FF", flex: 1, lineHeight: 20 }}>
                Funds distributed to designated beneficiary
              </Text>
            </View>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          onPress={handleCreateEvent}
          disabled={!canSubmit}
          style={{
            backgroundColor: canSubmit ? "#34C759" : "#0B2842",
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: "center",
            borderWidth: 2,
            borderColor: canSubmit ? "#34C759" : "rgba(255,255,255,0.1)",
          }}
        >
          <Text style={{
            color: canSubmit ? "#061A2B" : "#9FB3C8",
            fontWeight: "900",
            fontSize: 18,
          }}>
            {canSubmit ? "Create Bereavement Event" : "Fill Required Fields"}
          </Text>
          {canSubmit && (
            <Text style={{ color: "#061A2B", fontSize: 13, marginTop: 4 }}>
              Collect ${projectedCollection.toFixed(2)} from {activeEnrollments.length} members
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: "transparent",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}