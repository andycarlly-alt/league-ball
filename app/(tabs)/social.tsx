// app/(tabs)/social.tsx - MAIN SOCIAL FEED TAB

import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import PostCard from '../../components/social/PostCard';
import { useAppStore } from '../../src/state/AppStore';
import { normalize, spacing } from '../../src/utils/responsive';

type FeedFilter = 'ALL' | 'FOLLOWING' | 'TEAMS' | 'ANNOUNCEMENTS';

export default function SocialFeedScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FeedFilter>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const posts = useAppStore((state) => state.posts);
  const currentUser = useAppStore((state) => state.currentUser);
  const userFollows = useAppStore((state) => state.userFollows);
  const socialNotifications = useAppStore((state) => state.socialNotifications);
  const players = useAppStore((state) => state.players);
  const teams = useAppStore((state) => state.teams);

  // Get current user's player profile
  const currentPlayer = useMemo(() => {
    return players.find((p) => p.userId === currentUser.id);
  }, [players, currentUser.id]);

  // Unread notifications count
  const unreadCount = useMemo(() => {
    return socialNotifications.filter((n) => !n.isRead && n.userId === currentUser.id).length;
  }, [socialNotifications, currentUser.id]);

  // Filter posts based on selected filter
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    switch (filter) {
      case 'FOLLOWING':
        const followingIds = userFollows
          .filter((f) => f.followerId === currentUser.id)
          .map((f) => f.followingId);
        filtered = filtered.filter((p) => followingIds.includes(p.authorId));
        break;

      case 'TEAMS':
        filtered = filtered.filter((p) => p.authorType === 'TEAM' || p.teamId);
        break;

      case 'ANNOUNCEMENTS':
        filtered = filtered.filter((p) => p.type === 'ANNOUNCEMENT' || p.isPinned);
        break;

      case 'ALL':
      default:
        // Show all posts
        break;
    }

    // Sort: Pinned first, then by date
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [posts, filter, userFollows, currentUser.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Social Hub</Text>
          <Text style={styles.subtitle}>Connect with the NVT community</Text>
        </View>

        {/* Notifications */}
        <TouchableOpacity
          onPress={() => router.push('/social/notifications')}
          style={styles.notificationButton}
        >
          <Text style={styles.notificationIcon}>🔔</Text>
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <FilterChip
          label="All Posts"
          emoji="🌐"
          isActive={filter === 'ALL'}
          onPress={() => setFilter('ALL')}
        />
        <FilterChip
          label="Following"
          emoji="👥"
          isActive={filter === 'FOLLOWING'}
          onPress={() => setFilter('FOLLOWING')}
        />
        <FilterChip
          label="Teams"
          emoji="⚽"
          isActive={filter === 'TEAMS'}
          onPress={() => setFilter('TEAMS')}
        />
        <FilterChip
          label="Announcements"
          emoji="📢"
          isActive={filter === 'ANNOUNCEMENTS'}
          onPress={() => setFilter('ANNOUNCEMENTS')}
        />
      </ScrollView>

      {/* Feed */}
      <ScrollView
        style={styles.feed}
        contentContainerStyle={{ paddingBottom: spacing.huge }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F2D100"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📱</Text>
            <Text style={styles.emptyStateTitle}>No Posts Yet</Text>
            <Text style={styles.emptyStateText}>
              Be the first to share something with the community!
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/social/create-post')}
              style={styles.emptyStateButton}
            >
              <Text style={styles.emptyStateButtonText}>Create Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </ScrollView>

      {/* Floating Create Button */}
      <TouchableOpacity
        onPress={() => router.push('/social/create-post')}
        style={styles.createButton}
        activeOpacity={0.9}
      >
        <Text style={styles.createButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// Filter Chip Component
function FilterChip({ label, emoji, isActive, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.filterChip, isActive && styles.filterChipActive]}
    >
      <Text style={styles.filterEmoji}>{emoji}</Text>
      <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#061A2B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 40,
    paddingBottom: spacing.md,
  },
  title: {
    color: '#F2D100',
    fontSize: normalize(28),
    fontWeight: '900',
  },
  subtitle: {
    color: '#9FB3C8',
    fontSize: normalize(14),
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    backgroundColor: '#0A2238',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    fontSize: normalize(22),
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF3B30',
    minWidth: normalize(18),
    height: normalize(18),
    borderRadius: normalize(9),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: normalize(10),
    fontWeight: '900',
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2238',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: normalize(20),
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterChipActive: {
    backgroundColor: '#22C6D2',
    borderColor: '#22C6D2',
  },
  filterEmoji: {
    fontSize: normalize(16),
  },
  filterText: {
    color: '#9FB3C8',
    fontSize: normalize(13),
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#061A2B',
  },
  feed: {
    flex: 1,
  },
  emptyState: {
    padding: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyStateEmoji: {
    fontSize: normalize(64),
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    color: '#EAF2FF',
    fontSize: normalize(20),
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    color: '#9FB3C8',
    fontSize: normalize(14),
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyStateButton: {
    backgroundColor: '#22C6D2',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: normalize(12),
  },
  emptyStateButtonText: {
    color: '#061A2B',
    fontSize: normalize(15),
    fontWeight: '900',
  },
  createButton: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.huge,
    width: normalize(60),
    height: normalize(60),
    borderRadius: normalize(30),
    backgroundColor: '#F2D100',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F2D100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonText: {
    color: '#061A2B',
    fontSize: normalize(32),
    fontWeight: '900',
    marginTop: -4,
  },
});