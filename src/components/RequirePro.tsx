import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "../state/AppStore";

export function RequirePro({
  title = "Pro feature",
  subtitle = "Upgrade this league to Pro to unlock this feature.",
}: {
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const { activeLeague } = useAppStore();

  const isPro = activeLeague?.plan === "Pro";
  if (isPro) return null;

  return (
    <View
      style={{
        marginTop: 12,
        backgroundColor: "#0A2238",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16 }}>{title}</Text>
      <Text style={{ color: "#9FB3C8", marginTop: 6 }}>{subtitle}</Text>

      <TouchableOpacity
        onPress={() => router.push("/billing")}
        style={{
          marginTop: 12,
          backgroundColor: "#F2D100",
          padding: 12,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#061A2B", fontWeight: "900" }}>Go to Billing</Text>
      </TouchableOpacity>
    </View>
  );
}
