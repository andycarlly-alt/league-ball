import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAppStore } from "../../../src/state/AppStore";

export default function TeamChatScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const { teams, messages, sendTeamMessage } = useAppStore();

  const team = teams.find((t) => t.id === teamId);
  const thread = useMemo(() => messages.filter((m) => m.teamId === teamId), [messages, teamId]);

  const [text, setText] = useState("");

  const send = () => {
    if (!teamId || !text.trim()) return;
    sendTeamMessage({ teamId: String(teamId), sender: "Coach/Rep", body: text.trim() });
    setText("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      <Text style={{ color: "#F2D100", fontSize: 20, fontWeight: "900" }}>
        {team?.name ?? "Team Chat"}
      </Text>
      <Text style={{ color: "#9FB3C8", marginTop: 6 }}>Coach/Rep messaging</Text>

      <ScrollView style={{ marginTop: 12 }} contentContainerStyle={{ gap: 12, paddingBottom: 20 }}>
        {thread.map((m) => (
          <View
            key={m.id}
            style={{
              backgroundColor: "#0A2238",
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Text style={{ color: "#22C6D2", fontWeight: "900" }}>{m.sender}</Text>
            <Text style={{ color: "#EAF2FF", marginTop: 6 }}>{m.body}</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 6, fontSize: 12 }}>
              {new Date(m.createdAt).toLocaleString()}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type message..."
          placeholderTextColor="#9FB3C8"
          style={{
            flex: 1,
            backgroundColor: "#0B2842",
            color: "#EAF2FF",
            padding: 12,
            borderRadius: 12,
          }}
        />
        <TouchableOpacity
          onPress={send}
          style={{
            backgroundColor: "#F2D100",
            paddingHorizontal: 16,
            borderRadius: 12,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "900", color: "#061A2B" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
