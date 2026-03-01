// components/HomeSlideshowCarousel.tsx - AUTO-ROTATING SLIDESHOW

import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    PanResponder,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getLogoSource } from '../src/utils/logos';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH; // Full screen width
const AUTO_ROTATE_INTERVAL = 6000; // 6 seconds per slide

interface Slide {
  id: string;
  type: 'leaderboard' | 'scorers' | 'announcement' | 'sponsor' | 'match';
  priority: number;
  data: any;
}

interface Props {
  teams: any[];
  players: any[];
  announcements: any[];
  sponsors: any[];
  upcomingMatch: any;
  onSlidePress?: (slide: Slide) => void;
}

export default function HomeSlideshowCarousel({
  teams,
  players,
  announcements,
  sponsors,
  upcomingMatch,
  onSlidePress,
}: Props) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const autoRotateTimer = useRef<NodeJS.Timeout | null>(null);

  // Build slides array
  const slides: Slide[] = [];

  // 1. League Standings Slide
  const topTeams = teams
    .sort((a: any, b: any) => {
      const aPoints = (a.wins || 0) * 3 + (a.draws || 0);
      const bPoints = (b.wins || 0) * 3 + (b.draws || 0);
      return bPoints - aPoints;
    })
    .slice(0, 5);

  slides.push({
    id: 'leaderboard',
    type: 'leaderboard',
    priority: 2,
    data: { teams: topTeams },
  });

  // 2. Top Scorers Slide
  const topScorers = players
    .filter((p: any) => (p.goals || 0) > 0)
    .sort((a: any, b: any) => (b.goals || 0) - (a.goals || 0))
    .slice(0, 5);

  slides.push({
    id: 'scorers',
    type: 'scorers',
    priority: 2,
    data: { players: topScorers },
  });

  // 3. Announcements (if any)
  if (announcements && announcements.length > 0) {
    announcements.forEach((announcement: any, index: number) => {
      slides.push({
        id: `announcement_${index}`,
        type: 'announcement',
        priority: announcement.urgent ? 1 : 3,
        data: announcement,
      });
    });
  }

  // 4. Featured Sponsor Slides
  if (sponsors && sponsors.length > 0) {
    sponsors
      .filter((s: any) => s.featured || s.tier === 'PLATINUM' || s.tier === 'GOLD')
      .forEach((sponsor: any, index: number) => {
        slides.push({
          id: `sponsor_${index}`,
          type: 'sponsor',
          priority: 4,
          data: sponsor,
        });
      });
  }

  // 5. Match of the Week
  if (upcomingMatch) {
    slides.push({
      id: 'match_featured',
      type: 'match',
      priority: 3,
      data: upcomingMatch,
    });
  }

  // Sort by priority (lower number = higher priority)
  const sortedSlides = slides.sort((a, b) => a.priority - b.priority);

  // Auto-rotation logic
  useEffect(() => {
    if (!isPaused && sortedSlides.length > 1) {
      autoRotateTimer.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % sortedSlides.length);
      }, AUTO_ROTATE_INTERVAL);
    }

    return () => {
      if (autoRotateTimer.current) {
        clearInterval(autoRotateTimer.current);
      }
    };
  }, [isPaused, sortedSlides.length]);

  // Animate slide change
  useEffect(() => {
    Animated.spring(scrollX, {
      toValue: -currentIndex * SLIDE_WIDTH,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [currentIndex]);

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsPaused(true);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 50) {
          if (gestureState.dx > 0 && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          } else if (gestureState.dx < 0 && currentIndex < sortedSlides.length - 1) {
            setCurrentIndex(currentIndex + 1);
          }
        }
        setTimeout(() => setIsPaused(false), 3000);
      },
    })
  ).current;

  const handleSlidePress = (slide: Slide) => {
    setIsPaused(true);
    if (onSlidePress) {
      onSlidePress(slide);
    }
    setTimeout(() => setIsPaused(false), 5000);
  };

  const getTeamPoints = (team: any) => (team.wins || 0) * 3 + (team.draws || 0);

  // Render individual slide based on type
  const renderSlide = (slide: Slide, index: number) => {
    const slideStyle = {
      width: SLIDE_WIDTH,
      paddingHorizontal: 20,
    };

    switch (slide.type) {
      case 'leaderboard':
        return (
          <TouchableOpacity
            key={slide.id}
            onPress={() => handleSlidePress(slide)}
            style={slideStyle}
          >
            <View
              style={{
                backgroundColor: '#0A2238',
                borderRadius: 20,
                padding: 24,
                borderWidth: 2,
                borderColor: '#F2D100',
                minHeight: 320,
              }}
            >
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🏆</Text>
                <Text style={{ color: '#F2D100', fontSize: 24, fontWeight: '900' }}>
                  LEAGUE TABLE
                </Text>
              </View>

              {slide.data.teams.map((team: any, idx: number) => (
                <View
                  key={team.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: idx < slide.data.teams.length - 1 ? 1 : 0,
                    borderBottomColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor:
                        idx === 0 ? '#F2D100' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'rgba(255,255,255,0.1)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: idx < 3 ? '#061A2B' : '#9FB3C8',
                        fontWeight: '900',
                        fontSize: 14,
                      }}
                    >
                      {idx + 1}
                    </Text>
                  </View>

                  <Image
                    source={getLogoSource(team.logoKey || 'placeholder')}
                    style={{ width: 36, height: 36, borderRadius: 8, marginRight: 12 }}
                    resizeMode="cover"
                  />

                  <Text style={{ color: '#EAF2FF', fontWeight: '900', flex: 1, fontSize: 16 }}>
                    {team.name}
                  </Text>

                  <Text style={{ color: '#34C759', fontWeight: '900', fontSize: 18 }}>
                    {getTeamPoints(team)} pts
                  </Text>
                </View>
              ))}

              <View style={{ marginTop: 16, alignItems: 'center' }}>
                <Text style={{ color: '#9FB3C8', fontSize: 12 }}>
                  Tap to view full standings
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );

      case 'scorers':
        return (
          <TouchableOpacity
            key={slide.id}
            onPress={() => handleSlidePress(slide)}
            style={slideStyle}
          >
            <View
              style={{
                backgroundColor: '#0A2238',
                borderRadius: 20,
                padding: 24,
                borderWidth: 2,
                borderColor: '#22C6D2',
                minHeight: 320,
              }}
            >
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>⚽</Text>
                <Text style={{ color: '#22C6D2', fontSize: 24, fontWeight: '900' }}>
                  TOP SCORERS
                </Text>
                <Text style={{ color: '#9FB3C8', fontSize: 12, marginTop: 4 }}>
                  Golden Boot Race
                </Text>
              </View>

              {slide.data.players.map((player: any, idx: number) => (
                <View
                  key={player.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: idx < slide.data.players.length - 1 ? 1 : 0,
                    borderBottomColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor:
                        idx === 0 ? '#F2D100' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'rgba(255,255,255,0.1)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: idx < 3 ? '#061A2B' : '#9FB3C8',
                        fontWeight: '900',
                        fontSize: 14,
                      }}
                    >
                      {idx + 1}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#EAF2FF', fontWeight: '900', fontSize: 16 }}>
                      {player.fullName || player.name}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 20 }}>⚽</Text>
                    <Text style={{ color: '#F2D100', fontWeight: '900', fontSize: 24 }}>
                      {player.goals || 0}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={{ marginTop: 16, alignItems: 'center' }}>
                <Text style={{ color: '#9FB3C8', fontSize: 12 }}>
                  Tap to view player stats
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );

      case 'announcement':
        return (
          <TouchableOpacity
            key={slide.id}
            onPress={() => handleSlidePress(slide)}
            style={slideStyle}
          >
            <View
              style={{
                backgroundColor: slide.data.urgent ? '#FF3B30' : '#0A2238',
                borderRadius: 20,
                padding: 24,
                borderWidth: 2,
                borderColor: slide.data.urgent ? '#FF3B30' : '#34C759',
                minHeight: 320,
                justifyContent: 'center',
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>
                  {slide.data.urgent ? '🚨' : '📢'}
                </Text>
                <Text
                  style={{
                    color: slide.data.urgent ? '#FFF' : '#34C759',
                    fontSize: 14,
                    fontWeight: '900',
                    marginBottom: 12,
                  }}
                >
                  {slide.data.urgent ? 'URGENT ANNOUNCEMENT' : 'LEAGUE ANNOUNCEMENT'}
                </Text>
                <Text
                  style={{
                    color: '#EAF2FF',
                    fontSize: 28,
                    fontWeight: '900',
                    textAlign: 'center',
                    marginBottom: 16,
                    paddingHorizontal: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  {slide.data.title}
                </Text>
                <Text
                  style={{
                    color: '#EAF2FF',
                    fontSize: 16,
                    textAlign: 'center',
                    lineHeight: 24,
                    opacity: 0.9,
                  }}
                >
                  {slide.data.message}
                </Text>

                {slide.data.actionText && (
                  <View
                    style={{
                      marginTop: 20,
                      backgroundColor: slide.data.urgent ? '#FFF' : '#34C759',
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: slide.data.urgent ? '#FF3B30' : '#061A2B',
                        fontWeight: '900',
                        fontSize: 14,
                      }}
                    >
                      {slide.data.actionText}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );

      case 'sponsor':
        return (
          <TouchableOpacity
            key={slide.id}
            onPress={() => handleSlidePress(slide)}
            style={slideStyle}
          >
            <View
              style={{
                backgroundColor: '#0A2238',
                borderRadius: 20,
                padding: 24,
                borderWidth: 2,
                borderColor: slide.data.color || '#F2D100',
                minHeight: 320,
                justifyContent: 'center',
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#9FB3C8', fontSize: 12, fontWeight: '900', marginBottom: 12 }}>
                  SPONSORED BY
                </Text>

                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 16,
                    backgroundColor: slide.data.color || '#F2D100',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ fontSize: 48 }}>🏪</Text>
                </View>

                <Text style={{ color: '#EAF2FF', fontSize: 24, fontWeight: '900', textAlign: 'center', flexWrap: 'wrap', paddingHorizontal: 8 }}>
                  {slide.data.company}
                </Text>

                <Text
                  style={{
                    color: '#9FB3C8',
                    fontSize: 14,
                    textAlign: 'center',
                    marginTop: 8,
                    marginBottom: 20,
                  }}
                >
                  {slide.data.tagline}
                </Text>

                {slide.data.offer && (
                  <View
                    style={{
                      backgroundColor: `${slide.data.color || '#F2D100'}20`,
                      padding: 16,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: slide.data.color || '#F2D100',
                      width: '100%',
                    }}
                  >
                    <Text
                      style={{
                        color: slide.data.color || '#F2D100',
                        fontWeight: '900',
                        fontSize: 18,
                        textAlign: 'center',
                      }}
                    >
                      🎁 {slide.data.offer}
                    </Text>
                  </View>
                )}

                <Text style={{ color: '#9FB3C8', fontSize: 11, marginTop: 16 }}>
                  Show this screen in-store
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );

      case 'match':
        return (
          <TouchableOpacity
            key={slide.id}
            onPress={() => handleSlidePress(slide)}
            style={slideStyle}
          >
            <View
              style={{
                backgroundColor: '#0A2238',
                borderRadius: 20,
                padding: 24,
                borderWidth: 2,
                borderColor: '#FF9500',
                minHeight: 320,
                justifyContent: 'center',
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🔥</Text>
                <Text style={{ color: '#FF9500', fontSize: 14, fontWeight: '900', marginBottom: 16 }}>
                  MATCH OF THE WEEK
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: '#EAF2FF', fontSize: 20, fontWeight: '900', textAlign: 'center' }}>
                      {slide.data.homeTeam}
                    </Text>
                  </View>

                  <Text style={{ color: '#F2D100', fontSize: 28, fontWeight: '900' }}>VS</Text>

                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: '#EAF2FF', fontSize: 20, fontWeight: '900', textAlign: 'center' }}>
                      {slide.data.awayTeam}
                    </Text>
                  </View>
                </View>

                <View style={{ backgroundColor: 'rgba(255,149,0,0.1)', padding: 12, borderRadius: 10, marginBottom: 16 }}>
                  <Text style={{ color: '#9FB3C8', fontSize: 14, textAlign: 'center' }}>
                    {slide.data.kickoffAt
                      ? new Date(slide.data.kickoffAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Date TBD'}{' '}
                    •{' '}
                    {slide.data.kickoffAt
                      ? new Date(slide.data.kickoffAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })
                      : 'Time TBD'}
                  </Text>
                  <Text style={{ color: '#9FB3C8', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                    {slide.data.field || 'Venue TBD'}
                  </Text>
                </View>

                {slide.data.bettingPool && (
                  <View
                    style={{
                      backgroundColor: 'rgba(34,198,210,0.1)',
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: '#22C6D2',
                      width: '100%',
                    }}
                  >
                    <Text style={{ color: '#22C6D2', fontWeight: '900', fontSize: 14, textAlign: 'center' }}>
                      Current Betting Pool: ${slide.data.bettingPool || 0}
                    </Text>
                  </View>
                )}

                <Text style={{ color: '#9FB3C8', fontSize: 11, marginTop: 16 }}>
                  Tap to place bets
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  if (sortedSlides.length === 0) {
    return null;
  }

  return (
    <View style={{ marginBottom: 24 }}>
      {/* Slideshow Container */}
      <View style={{ height: 340, width: SCREEN_WIDTH, overflow: 'hidden' }} {...panResponder.panHandlers}>
        <Animated.View
          style={{
            flexDirection: 'row',
            transform: [{ translateX: scrollX }],
          }}
        >
          {sortedSlides.map((slide, index) => renderSlide(slide, index))}
        </Animated.View>
      </View>

      {/* Progress Dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 8 }}>
        {sortedSlides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setCurrentIndex(index);
              setIsPaused(true);
              setTimeout(() => setIsPaused(false), 3000);
            }}
          >
            <View
              style={{
                width: currentIndex === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: currentIndex === index ? '#F2D100' : 'rgba(255,255,255,0.2)',
              }}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Pause Indicator */}
      {isPaused && (
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Text style={{ color: '#9FB3C8', fontSize: 11 }}>⏸ Paused • Swipe or wait to resume</Text>
        </View>
      )}
    </View>
  );
}