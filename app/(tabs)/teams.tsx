// app/(tabs)/teams.tsx - ENHANCED WITH FILTERING & GROUPING

import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";
import { getLogoSource, LogoKey } from "../../src/utils/logos";
import { normalize, spacing } from "../../src/utils/responsive";

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

type ViewMode = "ALL" | "BY_TOURNAMENT";

export default function TeamsTab() {
  const router = useRouter();
  const { teams, tournaments, activeLeagueId, createTeam, players } = useAppStore() as any;

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [repName, setRepName] = useState("");
  const [logoKey, setLogoKey] = useState<LogoKey | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("BY_TOURNAMENT");
  const [selectedTournamentFilter, setSelectedTournamentFilter] = useState<string | null>(null);
  const [expandedTournaments, setExpandedTournaments] = useState<Set<string>>(new Set());

  const leagueTeams = useMemo(() => {
    return (teams ?? [])
      .filter((t: any) => t.leagueId === activeLeagueId)
      .sort((a: any, b: any) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
  }, [teams, activeLeagueId]);

  const leagueTournaments = useMemo(() => {
    return (tournaments ?? [])
      .filter((t: any) => t.leagueId === activeLeagueId)
      .sort((a: any, b: any) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
  }, [tournaments, activeLeagueId]);

  // Group teams by tournament
  const teamsByTournament = useMemo(() => {
    const grouped: Record<string, any[]> = {
      'no_tournament': []
    };

    leagueTeams.forEach((team: any) => {
      const tourId = team.tournamentId || 'no_tournament';
      if (!grouped[tourId]) grouped[tourId] = [];
      grouped[tourId].push(team);
    });

    return grouped;
  }, [leagueTeams]);

  // Filter teams based on search
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return leagueTeams;
    
    const query = searchQuery.toLowerCase();
    return leagueTeams.filter((t: any) => 
      t.name?.toLowerCase().includes(query) ||
      t.repName?.toLowerCase().includes(query)
    );
  }, [leagueTeams, searchQuery]);

  // Get team roster count
  const getTeamRosterCount = (teamId: string) => {
    return (players ?? []).filter((p: any) => p.teamId === teamId).length;
  };

  const tournamentName = (id?: string) => {
    if (!id) return "No Tournament";
    return (tournaments ?? []).find((t: any) => t.id === id)?.name ?? "Unknown Tournament";
  };

  const getTournamentColor = (id?: string) => {
    const colors = [
      "#F2D100", "#22C6D2", "#34C759", "#FF3B30", 
      "#FF9500", "#AF52DE", "#32ADE6", "#FF2D55"
    ];
    if (!id) return "#9FB3C8";
    const index = (id.charCodeAt(0) + id.charCodeAt(id.length - 1)) % colors.length;
    return colors[index];
  };

  const toggleTournament = (tourId: string) => {
    const newExpanded = new Set(expandedTournaments);
    if (newExpanded.has(tourId)) {
      newExpanded.delete(tourId);
    } else {
      newExpanded.add(tourId);
    }
    setExpandedTournaments(newExpanded);
  };

  const canSave = String(name ?? "").trim().length > 1;

  const onSave = () => {
    if (!canSave) return;

    const teamId = createTeam({
      leagueId: activeLeagueId,
      name: String(name ?? "").trim(),
      repName: String(repName ?? "").trim() || undefined,
      logoKey: logoKey,
    });

    setName("");
    setRepName("");
    setLogoKey(undefined);
    setShowAdd(false);

    if (teamId) router.push(`/teams/${teamId}`);
  };

  const renderTeamCard = (team: any, showTournament: boolean = false) => {
    const rosterCount = getTeamRosterCount(team.id);
    const tournamentColor = getTournamentColor(team.tournamentId);
    
    return (
      <TouchableOpacity 
        key={team.id} 
        onPress={() => router.push(`/teams/${team.id}`)}
        activeOpacity={0.7}
      >
        <View
          style={{
            backgroundColor: "#0A2238",
            borderRadius: normalize(16),
            padding: spacing.md,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          {/* Team Logo */}
          <View style={{ position: "relative" }}>
            <Image
              source={getLogoSource(team.logoKey)}
              style={{ width: normalize(52), height: normalize(52), borderRadius: normalize(14) }}
            />
            {rosterCount > 0 && (
              <View style={{
                position: "absolute",
                top: -6,
                right: -6,
                backgroundColor: "#34C759",
                borderRadius: 12,
                minWidth: 24,
                height: 24,
                paddingHorizontal: 6,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "#0A2238",
              }}>
                <Text style={{ color: "#061A2B", fontSize: normalize(11), fontWeight: "900" }}>
                  {rosterCount}
                </Text>
              </View>
            )}
          </View>

          {/* Team Info */}
          <View style={{ marginLeft: spacing.md, flex: 1 }}>
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(16) }}>
              {team.name}
            </Text>
            
            {showTournament && team.tournamentId && (
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 6,
                gap: 6,
              }}>
                <View style={{
                  backgroundColor: `${tournamentColor}20`,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: `${tournamentColor}40`,
                }}>
                  <Text style={{ 
                    color: tournamentColor, 
                    fontSize: normalize(11), 
                    fontWeight: "900" 
                  }}>
                    🏆 {tournamentName(team.tournamentId)}
                  </Text>
                </View>
              </View>
            )}

            <View style={{ flexDirection: "row", gap: spacing.md, marginTop: 6 }}>
              {team.repName && (
                <Text style={{ color: "#9FB3C8", fontSize: normalize(12) }}>
                  👤 {team.repName}
                </Text>
              )}
              <Text style={{ color: "#22C6D2", fontSize: normalize(12), fontWeight: "900" }}>
                {rosterCount} Players
              </Text>
            </View>
          </View>

          {/* Arrow */}
          <View style={{
            backgroundColor: "rgba(34,198,210,0.15)",
            width: normalize(32),
            height: normalize(32),
            borderRadius: normalize(16),
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Text style={{ color: "#22C6D2", fontSize: normalize(16), fontWeight: "900" }}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#0A2238",
        paddingTop: spacing.xl + 40,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.05)",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#F2D100", fontSize: normalize(24), fontWeight: "900" }}>
              Teams
            </Text>
            <Text style={{ color: "#9FB3C8", marginTop: 4, fontSize: normalize(13) }}>
              {leagueTeams.length} teams across {leagueTournaments.length} tournaments
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowAdd((s) => !s)}
            style={{
              backgroundColor: "#F2D100",
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderRadius: normalize(12),
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Text style={{ fontSize: normalize(18) }}>{showAdd ? "×" : "+"}</Text>
            <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: normalize(14) }}>
              {showAdd ? "Close" : "Team"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={{
          backgroundColor: "#061A2B",
          borderRadius: normalize(12),
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.md,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
        }}>
          <Text style={{ fontSize: normalize(16), marginRight: spacing.sm }}>🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search teams..."
            placeholderTextColor="#9FB3C8"
            style={{
              flex: 1,
              color: "#EAF2FF",
              paddingVertical: spacing.sm,
              fontSize: normalize(15),
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={{ color: "#9FB3C8", fontSize: normalize(18) }}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* View Mode Toggle */}
        <View style={{ 
          flexDirection: "row", 
          gap: spacing.sm, 
          marginTop: spacing.md,
        }}>
          <TouchableOpacity
            onPress={() => setViewMode("BY_TOURNAMENT")}
            style={{
              flex: 1,
              backgroundColor: viewMode === "BY_TOURNAMENT" ? "#22C6D2" : "rgba(34,198,210,0.15)",
              paddingVertical: spacing.sm,
              borderRadius: normalize(10),
              alignItems: "center",
              borderWidth: 1,
              borderColor: viewMode === "BY_TOURNAMENT" ? "#22C6D2" : "rgba(34,198,210,0.3)",
            }}
          >
            <Text style={{ 
              color: viewMode === "BY_TOURNAMENT" ? "#061A2B" : "#22C6D2", 
              fontWeight: "900",
              fontSize: normalize(13),
            }}>
              🏆 By Tournament
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setViewMode("ALL")}
            style={{
              flex: 1,
              backgroundColor: viewMode === "ALL" ? "#22C6D2" : "rgba(34,198,210,0.15)",
              paddingVertical: spacing.sm,
              borderRadius: normalize(10),
              alignItems: "center",
              borderWidth: 1,
              borderColor: viewMode === "ALL" ? "#22C6D2" : "rgba(34,198,210,0.3)",
            }}
          >
            <Text style={{ 
              color: viewMode === "ALL" ? "#061A2B" : "#22C6D2", 
              fontWeight: "900",
              fontSize: normalize(13),
            }}>
              📋 All Teams
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ 
          padding: spacing.lg, 
          paddingBottom: spacing.huge,
          gap: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Add Team Panel */}
        {showAdd && (
          <View
            style={{
              backgroundColor: "#0A2238",
              borderRadius: normalize(16),
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              marginBottom: spacing.md,
            }}
          >
            <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: normalize(18), marginBottom: spacing.md }}>
              Add New Team
            </Text>

            <Text style={{ color: "#9FB3C8", marginTop: spacing.sm, fontSize: normalize(13) }}>Team name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Spartan Veterans FC"
              placeholderTextColor="#9FB3C8"
              style={{
                marginTop: spacing.xs,
                color: "#EAF2FF",
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: normalize(12),
                padding: spacing.md,
                fontSize: normalize(15),
              }}
            />

            <Text style={{ color: "#9FB3C8", marginTop: spacing.md, fontSize: normalize(13) }}>
              Rep/Coach (optional)
            </Text>
            <TextInput
              value={repName}
              onChangeText={setRepName}
              placeholder="e.g., Coach Mike"
              placeholderTextColor="#9FB3C8"
              style={{
                marginTop: spacing.xs,
                color: "#EAF2FF",
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: normalize(12),
                padding: spacing.md,
                fontSize: normalize(15),
              }}
            />

            <Text style={{ color: "#9FB3C8", marginTop: spacing.md, fontSize: normalize(13) }}>
              Pick logo
            </Text>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={{ marginTop: spacing.sm }}
              contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.sm }}
            >
              {LOGO_OPTIONS.map((opt) => {
                const selected = logoKey === opt.key;
                return (
                  <TouchableOpacity key={opt.key} onPress={() => setLogoKey(opt.key)}>
                    <View
                      style={{
                        width: normalize(92),
                        backgroundColor: selected ? "rgba(242,209,0,0.18)" : "rgba(255,255,255,0.06)",
                        borderRadius: normalize(14),
                        padding: spacing.sm,
                        borderWidth: 2,
                        borderColor: selected ? "#F2D100" : "rgba(255,255,255,0.10)",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={getLogoSource(opt.key)}
                        style={{ width: normalize(44), height: normalize(44), borderRadius: normalize(12) }}
                      />
                      <Text style={{ 
                        color: "#EAF2FF", 
                        marginTop: spacing.xs, 
                        fontWeight: "900", 
                        fontSize: normalize(11),
                        textAlign: "center",
                      }}>
                        {opt.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              disabled={!canSave}
              onPress={onSave}
              style={{
                marginTop: spacing.lg,
                backgroundColor: canSave ? "#F2D100" : "rgba(242,209,0,0.25)",
                paddingVertical: spacing.md,
                borderRadius: normalize(12),
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: normalize(16) }}>
                Save Team
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* BY TOURNAMENT VIEW */}
        {viewMode === "BY_TOURNAMENT" && !searchQuery && (
          <>
            {Object.entries(teamsByTournament)
              .filter(([_, teamsInTournament]) => teamsInTournament.length > 0)
              .sort((a, b) => {
                // Sort: tournaments first, then "no tournament"
                if (a[0] === 'no_tournament') return 1;
                if (b[0] === 'no_tournament') return -1;
                const nameA = tournamentName(a[0]);
                const nameB = tournamentName(b[0]);
                return nameA.localeCompare(nameB);
              })
              .map(([tournamentId, teamsInTournament]) => {
                const isExpanded = expandedTournaments.has(tournamentId);
                const tournament = tournaments?.find((t: any) => t.id === tournamentId);
                const tournamentColor = getTournamentColor(tournamentId);

                return (
                  <View key={tournamentId}>
                    {/* Tournament Header */}
                    <TouchableOpacity
                      onPress={() => toggleTournament(tournamentId)}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: "#0A2238",
                        borderRadius: normalize(16),
                        padding: spacing.md,
                        borderWidth: 2,
                        borderColor: isExpanded ? tournamentColor : "rgba(255,255,255,0.08)",
                        marginBottom: isExpanded ? spacing.sm : 0,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                          <View style={{
                            backgroundColor: `${tournamentColor}20`,
                            width: normalize(40),
                            height: normalize(40),
                            borderRadius: normalize(20),
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 2,
                            borderColor: `${tournamentColor}40`,
                          }}>
                            <Text style={{ fontSize: normalize(20) }}>
                              {tournamentId === 'no_tournament' ? '📂' : '🏆'}
                            </Text>
                          </View>
                          
                          <View style={{ flex: 1 }}>
                            <Text style={{ 
                              color: "#EAF2FF", 
                              fontWeight: "900", 
                              fontSize: normalize(16),
                            }}>
                              {tournamentName(tournamentId)}
                            </Text>
                            <Text style={{ color: "#9FB3C8", fontSize: normalize(12), marginTop: 2 }}>
                              {teamsInTournament.length} team{teamsInTournament.length !== 1 ? 's' : ''}
                              {tournament?.ageBand && ` • ${tournament.ageBand}`}
                            </Text>
                          </View>
                        </View>

                        <View style={{
                          backgroundColor: isExpanded ? `${tournamentColor}20` : "rgba(255,255,255,0.05)",
                          width: normalize(32),
                          height: normalize(32),
                          borderRadius: normalize(16),
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <Text style={{ 
                            color: isExpanded ? tournamentColor : "#9FB3C8", 
                            fontSize: normalize(16), 
                            fontWeight: "900",
                          }}>
                            {isExpanded ? "−" : "+"}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Teams in Tournament */}
                    {isExpanded && (
                      <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
                        {teamsInTournament.map((team: any) => renderTeamCard(team, false))}
                      </View>
                    )}
                  </View>
                );
              })}
          </>
        )}

        {/* ALL TEAMS VIEW */}
        {(viewMode === "ALL" || searchQuery) && (
          <>
            {filteredTeams.length === 0 ? (
              <View style={{
                backgroundColor: "#0A2238",
                borderRadius: normalize(16),
                padding: spacing.xl * 2,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}>
                <Text style={{ fontSize: normalize(48), marginBottom: spacing.md }}>
                  {searchQuery ? "🔍" : "⚽"}
                </Text>
                <Text style={{ color: "#EAF2FF", fontSize: normalize(18), fontWeight: "900", marginBottom: spacing.xs }}>
                  {searchQuery ? "No teams found" : "No teams yet"}
                </Text>
                <Text style={{ color: "#9FB3C8", textAlign: "center", fontSize: normalize(14) }}>
                  {searchQuery 
                    ? `No teams match "${searchQuery}"`
                    : "Tap '+ Team' to create your first team"}
                </Text>
              </View>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {filteredTeams.map((team: any) => renderTeamCard(team, true))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
