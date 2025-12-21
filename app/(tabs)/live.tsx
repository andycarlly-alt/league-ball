import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource } from "../../src/utils/logos";

function scoreForMatch(matchId: string, events: any[], homeTeamId: string, awayTeamId: string) {
  const ev = (events ?? []).filter((e: any) => e.matchId === matchId);

  const homeGoals = ev.filter((e: any) => e.type === "GOAL" && e.teamId === homeTeamId).length;
  const awayGoals = ev.filter((e: any) => e.type === "GOAL" && e.teamId === awayTeamId).length;

  const homeY = ev.filter((e: any) => e.type === "YELLOW" && e.teamId === homeTeamId).length;
  const awayY = ev.filter((e: any) => e.type === "YELLOW" && e.teamId === awayTeamId).length;

  const homeR = ev.filter((e: any) => e.type === "RED" && e.teamId === homeTeamId).length;
  const awayR = ev.filter((e: any) => e.type === "RED" && e.teamId === awayTeamId).length;

  return { homeGoals, awayGoals, homeY, awayY, homeR, awayR };
}

export default function LiveTab() {
  const router = useRouter();
  const { matches, teams, events } = useAppStore() as any;

  const liveMatches = useMemo(() => {
    // if you already mark matches LIVE in store, great.
    // otherwise we just show the most recent ones too.
    const live = (matches ?? []).filter((m: any) => m.status === "LIVE");
    return live.length ? live : (matches ?? []).slice(0, 8);
  }, [matches]);

  const teamById = useMemo(() => {
    const map: Record<string, any> = {};
    (teams ?? []).forEach((t: any) => (map[t.id] = t));
    return map;
  }, [teams]);

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
      <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>
        Live
      </Text>
      <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
        Live scores  cards  tap a match for timeline + ads
      </Text>

      <ScrollView style={{ marginTop: 14 }} contentContainerStyle={{ gap: 12, paddingBottom: 30 }}>
        {liveMatches.map((m: any) => {
          const home = teamById[m.homeTeamId] ?? { name: m.homeTeamName ?? "Home", logoKey: "placeholder" };
          const away = teamById[m.awayTeamId] ?? { name: m.awayTeamName ?? "Away", logoKey: "placeholder" };

          const s = scoreForMatch(String(m.id), events ?? [], String(m.homeTeamId), String(m.awayTeamId));

          return (
            <TouchableOpacity key={m.id} onPress={() => router.push(`/live/${m.id}`)}>
              <View
                style={{
                  backgroundColor: "#0A2238",
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                {/* Teams row */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {/* Home */}
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                    <Image
                      source={getLogoSource(home.logoKey)}
                      style={{ width: 42, height: 42, borderRadius: 12, marginRight: 10 }}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#EAF2FF", fontWeight: "900" }} numberOfLines={1}>
                        {home.name}
                      </Text>
                      <Text style={{ color: "#9FB3C8", marginTop: 2, fontSize: 12 }}>
                        Y:{s.homeY} R:{s.homeR}
                      </Text>
                    </View>
                  </View>

                  {/* Score */}
                  <View style={{ alignItems: "center", justifyContent: "center", paddingHorizontal: 10 }}>
                    <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>
                      {s.homeGoals} - {s.awayGoals}
                    </Text>
                    <Text style={{ color: "#22C6D2", fontSize: 12, fontWeight: "900" }}>
                      {m.status === "LIVE" ? "LIVE" : (m.status ?? "MATCH")}
                    </Text>
                  </View>

                  {/* Away */}
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                    <View style={{ flex: 1, alignItems: "flex-end", marginRight: 10 }}>
                      <Text style={{ color: "#EAF2FF", fontWeight: "900" }} numberOfLines={1}>
                        {away.name}
                      </Text>
                      <Text style={{ color: "#9FB3C8", marginTop: 2, fontSize: 12 }}>
                        Y:{s.awayY} R:{s.awayR}
                      </Text>
                    </View>
                    <Image
                      source={getLogoSource(away.logoKey)}
                      style={{ width: 42, height: 42, borderRadius: 12 }}
                      resizeMode="cover"
                    />
                  </View>
                </View>

                {/* Meta */}
                <View style={{ marginTop: 10, flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#9FB3C8", fontSize: 12 }}>
                    {m.venue ?? "Venue TBD"}
                  </Text>
                  <Text style={{ color: "#9FB3C8", fontSize: 12 }}>
                    {m.kickoffLabel ?? "Kickoff"}
                  </Text>
                </View>

                <Text style={{ color: "#22C6D2", marginTop: 10, fontWeight: "900" }}>
                  Tap to open live match 
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {!liveMatches.length ? (
          <Text style={{ color: "#9FB3C8" }}>No matches yet.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
