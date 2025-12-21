import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource, LogoKey } from "../../src/utils/logos";

const LOGO_OPTIONS: { key: LogoKey; label: string }[] = [
  { key: "spartan", label: "Spartan" },
  { key: "lanham", label: "Lanham" },
  { key: "elite", label: "Elite" },
  { key: "balisao", label: "Balisao" },
  { key: "nova", label: "Nova" },
  { key: "delaware-progressives", label: "DE Progressives" },
  { key: "vfc", label: "VFC" },
  { key: "social-boyz", label: "Social Boyz" },
  { key: "bvfc", label: "BVFC" },
  { key: "zoo-zoo", label: "Zoo Zoo" },
  { key: "nevt", label: "NEVT" },
  { key: "delaware-vets", label: "DE Vets" },
  { key: "nj-ndamba", label: "NJ Ndamba" },
  { key: "landover", label: "Landover" },
];

export default function TeamsTab() {
  const router = useRouter();
  const { teams, tournaments, activeLeagueId, createTeam } = useAppStore() as any;

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [repName, setRepName] = useState("");
  const [logoKey, setLogoKey] = useState<LogoKey | undefined>(undefined);

  const leagueTeams = useMemo(() => {
    return (teams ?? [])
      .filter((t: any) => t.leagueId === activeLeagueId)
      .sort((a: any, b: any) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
  }, [teams, activeLeagueId]);

  const tournamentName = (id?: string) =>
    (tournaments ?? []).find((t: any) => t.id === id)?.name ?? "—";

  const canSave = String(name ?? "").trim().length > 1;

  const onSave = () => {
    if (!canSave) return;

    const teamId = createTeam({
      leagueId: activeLeagueId,
      name: String(name ?? "").trim(),
      repName: String(repName ?? "").trim() || undefined,
      logoKey: logoKey, // ✅ this is what fixes your issue
    });

    setName("");
    setRepName("");
    setLogoKey(undefined);
    setShowAdd(false);

    // Optional: jump into roster screen right away
    if (teamId) router.push(`/teams/${teamId}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Teams</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
            Tap a team to view roster + age banners + verification.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowAdd((s) => !s)}
          style={{
            backgroundColor: "#F2D100",
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#061A2B", fontWeight: "900" }}>{showAdd ? "Close" : "+ Team"}</Text>
        </TouchableOpacity>
      </View>

      {/* Add Team Panel */}
      {showAdd ? (
        <View
          style={{
            marginTop: 14,
            backgroundColor: "#0A2238",
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>Add Team</Text>

          <Text style={{ color: "#9FB3C8", marginTop: 10 }}>Team name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g., Spartan Veterans FC"
            placeholderTextColor="#9FB3C8"
            style={{
              marginTop: 8,
              color: "#EAF2FF",
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: 12,
            }}
          />

          <Text style={{ color: "#9FB3C8", marginTop: 12 }}>Rep/Coach (optional)</Text>
          <TextInput
            value={repName}
            onChangeText={setRepName}
            placeholder="e.g., Coach Mike"
            placeholderTextColor="#9FB3C8"
            style={{
              marginTop: 8,
              color: "#EAF2FF",
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: 12,
            }}
          />

          <Text style={{ color: "#9FB3C8", marginTop: 12 }}>Pick logo</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            <View style={{ flexDirection: "row", gap: 10, paddingRight: 10 }}>
              {LOGO_OPTIONS.map((opt) => {
                const selected = logoKey === opt.key;
                return (
                  <TouchableOpacity key={opt.key} onPress={() => setLogoKey(opt.key)}>
                    <View
                      style={{
                        width: 92,
                        backgroundColor: selected ? "rgba(242,209,0,0.18)" : "rgba(255,255,255,0.06)",
                        borderRadius: 14,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: selected ? "rgba(242,209,0,0.55)" : "rgba(255,255,255,0.10)",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={getLogoSource(opt.key)}
                        style={{ width: 44, height: 44, borderRadius: 14 }}
                      />
                      <Text style={{ color: "#EAF2FF", marginTop: 8, fontWeight: "900", fontSize: 12 }}>
                        {opt.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <TouchableOpacity
            disabled={!canSave}
            onPress={onSave}
            style={{
              marginTop: 14,
              backgroundColor: canSave ? "#F2D100" : "rgba(242,209,0,0.25)",
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>Save Team</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Team list */}
      <ScrollView style={{ marginTop: 14 }} contentContainerStyle={{ gap: 12, paddingBottom: 30 }}>
        {leagueTeams.map((t: any) => (
          <TouchableOpacity key={t.id} onPress={() => router.push(`/teams/${t.id}`)}>
            <View
              style={{
                backgroundColor: "#0A2238",
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Image
                source={getLogoSource(t.logoKey)}
                style={{ width: 44, height: 44, borderRadius: 16 }}
              />

              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                  {t.name}
                </Text>
                <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
                  Tournament: {tournamentName(t.tournamentId)}{"  "}
                  {t.repName ? `• Rep: ${t.repName}` : ""}
                </Text>
              </View>

              <Text style={{ color: "#22C6D2", fontWeight: "900" }}>Open →</Text>
            </View>
          </TouchableOpacity>
        ))}

        {!leagueTeams.length ? (
          <Text style={{ color: "#9FB3C8" }}>No teams yet for this league.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
