// app/live/[matchId].tsx
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource } from "../../src/utils/logos";

function fmtClock(sec: number) {
  const s = Math.max(0, Math.floor(sec || 0));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function scoreFromEvents(matchId: string, events: any[], homeTeamId: string, awayTeamId: string) {
  const list = (events ?? []).filter((e: any) => e.matchId === matchId && e.type === "GOAL");
  let home = 0;
  let away = 0;
  list.forEach((e: any) => {
    if (e.teamId === homeTeamId) home += 1;
    if (e.teamId === awayTeamId) away += 1;
  });
  return { home, away };
}

export default function LiveMatchScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const id = String(matchId ?? "");

  const {
    matches,
    teams,
    matchEvents,
    setMatchLive,
    tickMatch,
    resetMatchClock,
    logMatchEvent,
    sponsorsAds,
    placeBet,
  } = useAppStore() as any;

  const match = useMemo(() => (matches ?? []).find((m: any) => String(m.id) === id), [matches, id]);
  const home = useMemo(() => (teams ?? []).find((t: any) => t.id === match?.homeTeamId), [teams, match]);
  const away = useMemo(() => (teams ?? []).find((t: any) => t.id === match?.awayTeamId), [teams, match]);

  const eventsForMatch = useMemo(() => {
    return (matchEvents ?? []).filter((e: any) => e.matchId === id);
  }, [matchEvents, id]);

  const score = useMemo(() => {
    return scoreFromEvents(id, matchEvents ?? [], match?.homeTeamId, match?.awayTeamId);
  }, [id, matchEvents, match]);

  // sponsor/ad rotator
  const [slot, setSlot] = useState(0);
  const slots = sponsorsAds ?? [];
  useEffect(() => {
    if (!slots.length) return;
    const t = setInterval(() => setSlot((s) => (s + 1) % slots.length), 7000);
    return () => clearInterval(t);
  }, [slots.length]);

  // timer tick
  useEffect(() => {
    if (!match?.isLive) return;
    const timer = setInterval(() => tickMatch(match.id, 1), 1000);
    return () => clearInterval(timer);
  }, [match?.isLive, match?.id, tickMatch]);

  if (!match) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <Text style={{ color: "#EAF2FF" }}>Match not found.</Text>
      </View>
    );
  }

  const timeLeft = Math.max(0, (match.durationSec ?? 0) - (match.clockSec ?? 0));
  const isFT = timeLeft <= 0 && !match.isLive;

  const currentSlot = slots.length ? slots[slot] : null;

  const quickEvent = (type: "GOAL" | "YELLOW" | "RED", teamId?: string) => {
    if (!teamId) return;
    logMatchEvent({ matchId: match.id, type, teamId });
  };

  const onStartPause = () => {
    if (isFT) {
      Alert.alert("Full time", "Reset the match clock to start again.");
      return;
    }
    setMatchLive(match.id, !match.isLive);
  };

  const onReset = () => {
    resetMatchClock(match.id);
  };

  const betOdds = useMemo(() => {
    // simple demo odds
    return { home: 1.9, draw: 3.2, away: 2.1 };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      {/* Top */}
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" }}>
        <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Live Match</Text>

        <View style={{ marginTop: 10, flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>
            Time left:{" "}
            <Text style={{ color: "#EAF2FF" }}>{isFT ? "FT" : fmtClock(timeLeft)}</Text>
          </Text>

          <Text style={{ color: match.isLive ? "#FF3B30" : "#9FB3C8", fontWeight: "900" }}>
            {match.isLive ? "LIVE" : isFT ? "FINAL" : "PAUSED"}
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 30 }}>
        {/* Sponsor / Ad */}
        {currentSlot ? (
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>
              {currentSlot.kind === "SPONSOR" ? "SPONSOR" : "AD"}
            </Text>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16, marginTop: 6 }}>
              {currentSlot.name}
            </Text>
            <Text style={{ color: "#22C6D2", marginTop: 6 }}>{currentSlot.tagline}</Text>
          </View>
        ) : null}

        {/* Scoreboard */}
        <View
          style={{
            backgroundColor: "#0A2238",
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={getLogoSource(home?.logoKey)} style={{ width: 44, height: 44, borderRadius: 16 }} />
            <Text style={{ color: "#EAF2FF", fontWeight: "900", marginLeft: 10, flex: 1 }}>
              {home?.name ?? "Home"}
            </Text>
            <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 22 }}>{score.home}</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
            <Image source={getLogoSource(away?.logoKey)} style={{ width: 44, height: 44, borderRadius: 16 }} />
            <Text style={{ color: "#EAF2FF", fontWeight: "900", marginLeft: 10, flex: 1 }}>
              {away?.name ?? "Away"}
            </Text>
            <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 22 }}>{score.away}</Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <TouchableOpacity
              onPress={onStartPause}
              style={{
                flex: 1,
                backgroundColor: match.isLive ? "rgba(255,59,48,0.18)" : "rgba(52,199,89,0.18)",
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                {match.isLive ? "Pause" : isFT ? "Final" : "Start"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onReset}
              style={{
                flex: 1,
                backgroundColor: "rgba(242,209,0,0.18)",
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick events */}
        <View
          style={{
            backgroundColor: "#0A2238",
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>Quick Events</Text>

          <View style={{ marginTop: 12, gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => quickEvent("GOAL", home?.id)}
                style={{ flex: 1, backgroundColor: "rgba(52,199,89,0.18)", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
              >
                <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Home Goal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => quickEvent("GOAL", away?.id)}
                style={{ flex: 1, backgroundColor: "rgba(52,199,89,0.18)", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
              >
                <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Away Goal</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* Yellow = yellow */}
              <TouchableOpacity
                onPress={() => quickEvent("YELLOW", home?.id)}
                style={{ flex: 1, backgroundColor: "#FFD60A", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
              >
                <Text style={{ color: "#061A2B", fontWeight: "900" }}>Home Yellow</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => quickEvent("YELLOW", away?.id)}
                style={{ flex: 1, backgroundColor: "#FFD60A", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
              >
                <Text style={{ color: "#061A2B", fontWeight: "900" }}>Away Yellow</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* Red = red */}
              <TouchableOpacity
                onPress={() => quickEvent("RED", home?.id)}
                style={{ flex: 1, backgroundColor: "#FF3B30", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
              >
                <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Home Red</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => quickEvent("RED", away?.id)}
                style={{ flex: 1, backgroundColor: "#FF3B30", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
              >
                <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Away Red</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Betting (demo) */}
        <View
          style={{
            backgroundColor: "#0A2238",
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>Betting (Demo)</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 6 }}>Tap to place a demo $10 wager.</Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => placeBet({ matchId: match.id, pick: "HOME", wagerCents: 1000, odds: betOdds.home })}
              style={{ flex: 1, backgroundColor: "rgba(242,209,0,0.18)", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Home {betOdds.home}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => placeBet({ matchId: match.id, pick: "DRAW", wagerCents: 1000, odds: betOdds.draw })}
              style={{ flex: 1, backgroundColor: "rgba(159,179,200,0.18)", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Draw {betOdds.draw}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => placeBet({ matchId: match.id, pick: "AWAY", wagerCents: 1000, odds: betOdds.away })}
              style={{ flex: 1, backgroundColor: "rgba(34,198,210,0.18)", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Away {betOdds.away}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Event log */}
        <View
          style={{
            backgroundColor: "#0A2238",
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>Event Log</Text>

          <View style={{ marginTop: 12, gap: 10 }}>
            {eventsForMatch.length ? (
              eventsForMatch
                .slice()
                .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
                .map((e: any) => (
                  <View key={e.id} style={{ padding: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>{fmtClock(e.atSec ?? 0)}</Text>
                    <Text style={{ color: "#EAF2FF", marginTop: 6, fontWeight: "900" }}>
                      {e.type} {e.teamId === home?.id ? "(Home)" : e.teamId === away?.id ? "(Away)" : ""}
                    </Text>
                  </View>
                ))
            ) : (
              <Text style={{ color: "#9FB3C8" }}>No events yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
