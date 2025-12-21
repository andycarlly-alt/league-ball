import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Pressable,
  TextInput,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAppStore } from "../../src/state/AppStore";

function fmtClock(sec: number) {
  const mm = Math.floor(sec / 60);
  const ss = sec % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function score(m: any) {
  const goals = (m.events || []).filter((e: any) => e.type === "GOAL");
  const home = goals.filter((g: any) => g.teamId === m.homeTeamId).length;
  const away = goals.filter((g: any) => g.teamId === m.awayTeamId).length;
  return { home, away };
}

function nowMinute(clockSeconds: number) {
  return Math.max(1, Math.floor(clockSeconds / 60));
}

type PickedPlayer = { id: string; name: string };

function PlayerPickerModal({
  visible,
  onClose,
  homeTeamName,
  awayTeamName,
  homeRoster,
  awayRoster,
  initialSide,
  onPick,
  subtitle,
}: {
  visible: boolean;
  onClose: () => void;
  homeTeamName: string;
  awayTeamName: string;
  homeRoster: PickedPlayer[];
  awayRoster: PickedPlayer[];
  initialSide: "HOME" | "AWAY";
  onPick: (side: "HOME" | "AWAY", player: PickedPlayer) => void;
  subtitle?: string;
}) {
  const [side, setSide] = useState<"HOME" | "AWAY">(initialSide);

  useEffect(() => {
    if (visible) setSide(initialSide);
  }, [visible, initialSide]);

  const data = side === "HOME" ? homeRoster : awayRoster;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", padding: 16, justifyContent: "center" }}>
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: "#061A2B",
            borderRadius: 18,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.10)",
            maxHeight: "85%",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18 }}>Select Player</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
              <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>Close</Text>
            </TouchableOpacity>
          </View>

          {subtitle ? <Text style={{ color: "#9FB3C8", marginTop: 8 }}>{subtitle}</Text> : null}

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => setSide("HOME")}
              style={{
                flex: 1,
                backgroundColor: side === "HOME" ? "#34C759" : "#0A2238",
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ fontWeight: "900", color: "#061A2B" }}>{homeTeamName}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSide("AWAY")}
              style={{
                flex: 1,
                backgroundColor: side === "AWAY" ? "#34C759" : "#0A2238",
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ fontWeight: "900", color: "#061A2B" }}>{awayTeamName}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            style={{ marginTop: 12 }}
            data={data}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={{ color: "#9FB3C8", marginTop: 12 }}>
                No roster found for this side yet.
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onPick(side, item)}
                style={{
                  backgroundColor: "#0B2842",
                  padding: 12,
                  borderRadius: 12,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function LiveMatchScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const {
    matches,
    teams,
    tournaments,
    players,
    ads,
    tickMatch,
    addEvent,
    activeLeague,
    can,
    currentUser,
  } = useAppStore();

  const match = matches.find((m) => m.id === matchId);
  const tournament = tournaments.find((t) => t.id === match?.tournamentId);
  const homeTeam = teams.find((t) => t.id === match?.homeTeamId);
  const awayTeam = teams.find((t) => t.id === match?.awayTeamId);

  const [isTicking, setIsTicking] = useState(true);

  // Manual mode state (still supported)
  const [pickedSide, setPickedSide] = useState<"HOME" | "AWAY">("HOME");
  const [pickedPlayer, setPickedPlayer] = useState<PickedPlayer | null>(null);
  const [minute, setMinute] = useState<number | "">("");
  const [typePick, setTypePick] = useState<"GOAL" | "YELLOW" | "RED">("GOAL");

  // FASTLOG state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [fastType, setFastType] = useState<"GOAL" | "YELLOW" | "RED" | null>(null);

  const isPro = activeLeague?.plan === "Pro";
  const canOperate = can("VIEW_ADMIN"); // refs/admins

  // rosters for picker (from Store players)
  const homeRoster = useMemo<PickedPlayer[]>(() => {
    if (!match) return [];
    return players
      .filter((p) => p.teamId === match.homeTeamId)
      .map((p) => ({ id: p.id, name: p.fullName }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [players, match?.homeTeamId]);

  const awayRoster = useMemo<PickedPlayer[]>(() => {
    if (!match) return [];
    return players
      .filter((p) => p.teamId === match.awayTeamId)
      .map((p) => ({ id: p.id, name: p.fullName }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [players, match?.awayTeamId]);

  // ads rotation (Pro only)
  const eligibleAds = useMemo(() => {
    if (!match) return [];
    return ads.filter((a) => a.tournamentId === match.tournamentId || a.leagueId === match.leagueId || !a.leagueId);
  }, [ads, match]);

  const [adIndex, setAdIndex] = useState(0);
  useEffect(() => {
    if (!isPro || eligibleAds.length === 0) return;
    const id = setInterval(() => setAdIndex((i) => (i + 1) % eligibleAds.length), 5000);
    return () => clearInterval(id);
  }, [isPro, eligibleAds.length]);

  // ticking
  useEffect(() => {
    if (!match) return;
    if (!isTicking) return;
    if (match.status !== "Live") return;

    const id = setInterval(() => tickMatch(match.id), 1000);
    return () => clearInterval(id);
  }, [match?.id, match?.status, isTicking]);

  if (!match || !tournament || !homeTeam || !awayTeam) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Live Match</Text>
        <Text style={{ color: "#9FB3C8", marginTop: 8 }}>Match not found.</Text>
      </View>
    );
  }

  const s = score(match);

  const logEvent = (side: "HOME" | "AWAY", playerName: string, eventType: "GOAL" | "YELLOW" | "RED") => {
    const teamId = side === "HOME" ? match.homeTeamId : match.awayTeamId;
    const min = nowMinute(match.clockSeconds);
    addEvent({ matchId: match.id, type: eventType, teamId, playerName, minute: min });
  };

  const onPickPlayer = (side: "HOME" | "AWAY", p: PickedPlayer) => {
    // FASTLOG path: if fastType is set, log instantly and close modal
    if (fastType) {
      logEvent(side, p.name, fastType);
      setFastType(null);
      setPickerOpen(false);
      // Keep the side for next time (speed)
      setPickedSide(side);
      return;
    }

    // Manual mode: just attach to form
    setPickedSide(side);
    setPickedPlayer(p);
    setPickerOpen(false);
  };

  const addManual = () => {
    if (!canOperate) return Alert.alert("Not allowed", "Only Admin/Ref can log live events.");
    if (!pickedPlayer) return Alert.alert("Missing", "Pick a player from the roster.");

    const min = minute === "" ? nowMinute(match.clockSeconds) : Number(minute);
    if (!min || Number.isNaN(min)) return Alert.alert("Invalid minute", "Enter a valid minute.");

    const teamId = pickedSide === "HOME" ? match.homeTeamId : match.awayTeamId;

    addEvent({
      matchId: match.id,
      type: typePick,
      teamId,
      playerName: pickedPlayer.name,
      minute: min,
    });

    setPickedPlayer(null);
    setMinute("");
  };

  const adBg = isPro ? "#22C6D2" : "#9FB3C8";

  const fastOpen = (t: "GOAL" | "YELLOW" | "RED") => {
    if (!canOperate) return Alert.alert("Not allowed", "Only Admin/Ref can log live events.");
    setFastType(t);
    setPickerOpen(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      {/* header */}
      <View style={{ padding: 16 }}>
        <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Live Match</Text>
        <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
          {tournament.name}  {currentUser.role}  Plan: {activeLeague?.plan ?? ""}
        </Text>
      </View>

      {/* scoreboard */}
      <View
        style={{
          marginHorizontal: 16,
          backgroundColor: "#0A2238",
          borderRadius: 16,
          padding: 14,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 18 }}>
          {homeTeam.name} {s.home} - {s.away} {awayTeam.name}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10, alignItems: "center" }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900" }}>
             {fmtClock(match.clockSeconds)} / {fmtClock(match.durationSeconds)}
          </Text>

          <TouchableOpacity
            onPress={() => setIsTicking((v) => !v)}
            style={{
              backgroundColor: "#F2D100",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 12,
              opacity: canOperate ? 1 : 0.5,
            }}
            disabled={!canOperate}
          >
            <Text style={{ fontWeight: "900", color: "#061A2B" }}>{isTicking ? "Pause" : "Resume"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BIGGER AD BANNER */}
      <View style={{ marginHorizontal: 16, marginTop: 12 }}>
        <View
          style={{
            backgroundColor: adBg,
            borderRadius: 18,
            paddingVertical: 18,
            paddingHorizontal: 16,
            borderWidth: 2,
            borderColor: "rgba(0,0,0,0.25)",
          }}
        >
          {isPro && eligibleAds.length ? (
            <>
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 20 }}>
                {eligibleAds[adIndex]?.title}
              </Text>
              {eligibleAds[adIndex]?.subtitle ? (
                <Text style={{ color: "#061A2B", marginTop: 6, fontWeight: "900", fontSize: 16 }}>
                  {eligibleAds[adIndex]?.subtitle}
                </Text>
              ) : null}
              <Text style={{ color: "#061A2B", marginTop: 8, fontWeight: "900" }}>
                Sponsored
              </Text>
            </>
          ) : (
            <>
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 18 }}>
                Ads/Sponsors are a Pro feature
              </Text>
              <Text style={{ color: "#061A2B", marginTop: 6, fontWeight: "800" }}>
                Upgrade to enable rotating sponsor banner on Live screens.
              </Text>
            </>
          )}
        </View>
      </View>

      <ScrollView style={{ marginTop: 12 }} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        {/* FASTLOG */}
        <View style={{ backgroundColor: "#0B2842", borderRadius: 16, padding: 14 }}>
          <Text style={{ color: "#F2D100", fontWeight: "900" }}>FASTLOG (1-Tap)</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
            Tap GOAL/YELLOW/RED  pick player  logs instantly (minute auto).
          </Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <TouchableOpacity
              onPress={() => fastOpen("GOAL")}
              style={{ flex: 1, minWidth: 90, backgroundColor: "#F2D100", padding: 12, borderRadius: 12, alignItems: "center", opacity: canOperate ? 1 : 0.5 }}
              disabled={!canOperate}
            >
              <Text style={{ fontWeight: "900", color: "#061A2B" }}> GOAL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => fastOpen("YELLOW")}
              style={{ flex: 1, minWidth: 90, backgroundColor: "#F2D100", padding: 12, borderRadius: 12, alignItems: "center", opacity: canOperate ? 1 : 0.5 }}
              disabled={!canOperate}
            >
              <Text style={{ fontWeight: "900", color: "#061A2B" }}> YELLOW</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => fastOpen("RED")}
              style={{ flex: 1, minWidth: 90, backgroundColor: "#F2D100", padding: 12, borderRadius: 12, alignItems: "center", opacity: canOperate ? 1 : 0.5 }}
              disabled={!canOperate}
            >
              <Text style={{ fontWeight: "900", color: "#061A2B" }}> RED</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MANUAL (kept for edge cases) */}
        <View style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <Text style={{ color: "#F2D100", fontWeight: "900" }}>Manual Log (Optional)</Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <TouchableOpacity
              onPress={() => setTypePick("GOAL")}
              style={{ backgroundColor: typePick === "GOAL" ? "#22C6D2" : "#0B2842", padding: 10, borderRadius: 12, opacity: canOperate ? 1 : 0.5 }}
              disabled={!canOperate}
            >
              <Text style={{ fontWeight: "900", color: "#061A2B" }}>GOAL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTypePick("YELLOW")}
              style={{ backgroundColor: typePick === "YELLOW" ? "#22C6D2" : "#0B2842", padding: 10, borderRadius: 12, opacity: canOperate ? 1 : 0.5 }}
              disabled={!canOperate}
            >
              <Text style={{ fontWeight: "900", color: "#061A2B" }}>YELLOW</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTypePick("RED")}
              style={{ backgroundColor: typePick === "RED" ? "#22C6D2" : "#0B2842", padding: 10, borderRadius: 12, opacity: canOperate ? 1 : 0.5 }}
              disabled={!canOperate}
            >
              <Text style={{ fontWeight: "900", color: "#061A2B" }}>RED</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => setPickerOpen(true)}
              style={{ flex: 1, backgroundColor: "#22C6D2", padding: 12, borderRadius: 12, alignItems: "center", opacity: canOperate ? 1 : 0.5 }}
              disabled={!canOperate}
            >
              <Text style={{ fontWeight: "900", color: "#061A2B" }}>
                {pickedPlayer ? `Player: ${pickedPlayer.name}` : "Pick Player"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setPickedSide((s) => (s === "HOME" ? "AWAY" : "HOME"));
                setPickedPlayer(null);
              }}
              style={{ backgroundColor: "#34C759", padding: 12, borderRadius: 12, alignItems: "center", opacity: canOperate ? 1 : 0.5 }}
              disabled={!canOperate}
            >
              <Text style={{ fontWeight: "900", color: "#061A2B" }}>{pickedSide}</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            value={minute === "" ? "" : String(minute)}
            onChangeText={(v) => setMinute(v ? Number(v) : "")}
            placeholder={`Minute (blank = auto ${nowMinute(match.clockSeconds)}')`}
            placeholderTextColor="rgba(255,255,255,0.4)"
            keyboardType="number-pad"
            style={{
              marginTop: 10,
              backgroundColor: "#0B2842",
              color: "#EAF2FF",
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
            editable={canOperate}
          />

          <TouchableOpacity
            onPress={addManual}
            style={{ marginTop: 12, backgroundColor: "#F2D100", padding: 12, borderRadius: 12, alignItems: "center", opacity: canOperate ? 1 : 0.5 }}
            disabled={!canOperate}
          >
            <Text style={{ fontWeight: "900", color: "#061A2B" }}>Add Event</Text>
          </TouchableOpacity>
        </View>

        {/* feed */}
        <View style={{ backgroundColor: "#0A2238", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <Text style={{ color: "#F2D100", fontWeight: "900" }}>Event Feed</Text>

          {(match.events || []).slice(0, 30).map((e: any) => {
            const icon = e.type === "GOAL" ? "" : e.type === "YELLOW" ? "" : "";
            const tName = teams.find((t) => t.id === e.teamId)?.name ?? "Team";
            return (
              <View key={e.id} style={{ marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: "#0B2842" }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>
                  {icon} {e.minute}'  {e.playerName}
                </Text>
                <Text style={{ color: "#9FB3C8", marginTop: 4 }}>{tName}</Text>
              </View>
            );
          })}

          {!match.events?.length ? <Text style={{ color: "#9FB3C8", marginTop: 10 }}>No events yet.</Text> : null}
        </View>
      </ScrollView>

      <PlayerPickerModal
        visible={pickerOpen}
        onClose={() => {
          setFastType(null);
          setPickerOpen(false);
        }}
        homeTeamName={homeTeam.name}
        awayTeamName={awayTeam.name}
        homeRoster={homeRoster}
        awayRoster={awayRoster}
        initialSide={pickedSide}
        onPick={onPickPlayer}
        subtitle={fastType ? `FASTLOG: Tap player for ${fastType} (auto-minute)` : "Tap a player to attach to the manual event form."}
      />
    </View>
  );
}
