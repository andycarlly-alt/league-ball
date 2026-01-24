// app/vendor-signup.tsx - PLACEHOLDER
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function VendorSignupScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Text style={{ color: "#22C6D2", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900" }}>
          📢 Vendor Sponsorship
        </Text>

        <View style={{
          backgroundColor: "#0A2238",
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}>
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
            Coming Soon
          </Text>
          <Text style={{ color: "#9FB3C8", marginTop: 8 }}>
            Vendor sponsorship packages will be available soon. This feature is currently under development.
          </Text>
        </View>

        <View style={{
          backgroundColor: "rgba(34,198,210,0.1)",
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(34,198,210,0.3)",
        }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 14 }}>
            💡 Interested in Sponsoring?
          </Text>
          <Text style={{ color: "#EAF2FF", marginTop: 8, fontSize: 13 }}>
            Check back soon for sponsorship packages including banner ads, social media promotion, and tournament branding opportunities.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}