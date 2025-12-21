import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "../src/state/AppStore";

function FeatureRow({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 }}>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: ok ? "#34C759" : "#FF3B30",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#061A2B", fontWeight: "900" }}>{ok ? "" : ""}</Text>
      </View>
      <Text style={{ color: "#EAF2FF", fontWeight: "800", flex: 1 }}>{text}</Text>
    </View>
  );
}

export default function BillingScreen() {
  const router = useRouter();
  const { activeLeague, startCheckout, restorePurchases } = useAppStore();
  const [busy, setBusy] = useState(false);

  const plan = activeLeague?.plan ?? "Free";

  const title = useMemo(() => {
    return activeLeague ? `${activeLeague.name} Billing` : "Billing";
  }, [activeLeague?.id]);

  const upgrade = async () => {
    try {
      setBusy(true);
      const res = await startCheckout("Pro");
      if (!res.ok) Alert.alert("Upgrade failed", res.reason);
      else Alert.alert("Success", "League upgraded to Pro.");
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    try {
      setBusy(true);
      const res = await restorePurchases();
      if (!res.ok) Alert.alert("Restore failed", res.reason);
      else Alert.alert("Restored", "Subscription status refreshed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>{title}</Text>
        <Text style={{ color: "#9FB3C8" }}>
          Current plan: <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{plan}</Text>
        </Text>

        <View style={{ backgroundColor: "#0A2238", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 18 }}>Free</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 6 }}>Good for testing and small leagues.</Text>
          <FeatureRow ok text="Create tournaments (limited later)" />
          <FeatureRow ok text="Teams & rosters" />
          <FeatureRow ok text="Live match view" />
          <FeatureRow ok={false} text="Sponsor/Vendor ads on Live screen" />
          <FeatureRow ok={false} text="Unlimited tournaments" />
          <FeatureRow ok={false} text="Player transfer between tournaments/leagues" />
          <FeatureRow ok={false} text="Roster lock before kickoff" />
        </View>

        <View style={{ backgroundColor: "#0A2238", borderRadius: 18, padding: 14, borderWidth: 2, borderColor: "rgba(242,209,0,0.5)" }}>
          <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18 }}>Pro</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
            Built for DMV/NEVT/NVT  capture data year-round and reuse verified players for Labor Day.
          </Text>
          <FeatureRow ok text="Unlimited tournaments" />
          <FeatureRow ok text="Sponsor/Vendor ads on Live screen" />
          <FeatureRow ok text="Player transfer (reuse verified rosters)" />
          <FeatureRow ok text="Roster lock before kickoff" />
          <FeatureRow ok text="Admin announcements + team messaging" />

          {plan === "Pro" ? (
            <View style={{ marginTop: 14, backgroundColor: "#34C759", padding: 12, borderRadius: 14, alignItems: "center" }}>
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>Youre on Pro </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={upgrade}
              disabled={busy}
              style={{
                marginTop: 14,
                backgroundColor: "#F2D100",
                padding: 14,
                borderRadius: 14,
                alignItems: "center",
                opacity: busy ? 0.6 : 1,
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>
                {busy ? "Processing..." : "Upgrade to Pro"}
              </Text>
              <Text style={{ color: "#061A2B", marginTop: 6, fontWeight: "800" }}>
                Stripe-ready checkout (hook next)
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={restore}
            disabled={busy}
            style={{
              marginTop: 10,
              backgroundColor: "#22C6D2",
              padding: 12,
              borderRadius: 14,
              alignItems: "center",
              opacity: busy ? 0.6 : 1,
            }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>
              {busy ? "Working..." : "Restore Purchases"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={{ padding: 10, alignItems: "center" }}>
          <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
