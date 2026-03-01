// components/social/PostCard.tsx

import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    Image,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppStore } from '../../src/state/AppStore';
import { normalize, spacing } from '../../src/utils/responsive';

interface PostCardProps {
  post: any;
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const currentUser = useAppStore((state) => state.currentUser);
  const reactions = useAppStore((state) => state.reactions);
  const comments = useAppStore((state) => state.comments);
  const likePost = useAppStore((state) => state.likePost);
  const unlikePost = useAppStore((state) => state.unlikePost);
  const incrementPostView = useAppStore((state) => state.incrementPostView);

  // Check if current user liked this post
  const userReaction = useMemo(() => {
    return reactions.find((r) => r.postId === post.id && r.userId === currentUser.id);
  }, [reactions, post.id, currentUser.id]);

  const [isLiked, setIsLiked] = useState(!!userReaction);

  const handleLike = () => {
    if (isLiked) {
      unlikePost(post.id, currentUser.id);
      setIsLiked(false);
    } else {
      likePost(post.id, currentUser.id, currentUser.name, 'LIKE');
      setIsLiked(true);
    }
  };

  const handleComment = () => {
    incrementPostView(post.id);
    router.push(`/social/post/${post.id}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${post.authorName}: ${post.content}\n\nShared from NVT League`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAuthorPress = () => {
    if (post.authorType === 'TEAM' && post.teamId) {
      router.push(`/teams/${post.teamId}`);
    } else if (post.authorType === 'USER') {
      // router.push(`/social/profile/${post.authorId}`);
      Alert.alert('User Profile', 'User profiles coming soon!');
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const renderHashtags = (content: string) => {
    const parts = content.split(/(#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <Text key={index} style={styles.hashtag}>
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity onPress={handleAuthorPress} style={styles.header}>
        {post.authorAvatar ? (
          <Image source={{ uri: post.authorAvatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {post.authorName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.authorName}</Text>
          <View style={styles.metadata}>
            <Text style={styles.timestamp}>{formatTimestamp(post.createdAt)}</Text>
            {post.location && (
              <>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.location}>📍 {post.location.name}</Text>
              </>
            )}
          </View>
        </View>

        {/* Team Badge */}
        {post.teamId && (
          <View style={styles.teamBadge}>
            <Text style={styles.teamBadgeText}>⚽</Text>
          </View>
        )}

        {/* Pinned Badge */}
        {post.isPinned && (
          <View style={styles.pinnedBadge}>
            <Text style={styles.pinnedText}>📌</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Content */}
      {post.content && (
        <TouchableOpacity onPress={handleComment} activeOpacity={0.9}>
          <Text style={styles.content}>{renderHashtags(post.content)}</Text>
        </TouchableOpacity>
      )}

      {/* Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <TouchableOpacity onPress={handleComment} activeOpacity={0.9}>
          {post.mediaUrls.length === 1 ? (
            <Image source={{ uri: post.mediaUrls[0] }} style={styles.singleImage} />
          ) : (
            <View style={styles.multiImageContainer}>
              {post.mediaUrls.slice(0, 4).map((url: string, index: number) => (
                <Image key={index} source={{ uri: url }} style={styles.multiImage} />
              ))}
              {post.mediaUrls.length > 4 && (
                <View style={styles.moreImagesOverlay}>
                  <Text style={styles.moreImagesText}>+{post.mediaUrls.length - 4}</Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Location Preview */}
      {post.location && post.type === 'LOCATION' && (
        <View style={styles.locationPreview}>
          <Text style={styles.locationIcon}>📍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationName}>{post.location.name}</Text>
            <Text style={styles.locationAddress}>{post.location.address}</Text>
          </View>
        </View>
      )}

      {/* Engagement Bar */}
      <View style={styles.engagementBar}>
        <Text style={styles.engagementText}>
          ❤️ {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
        </Text>
        <Text style={styles.engagementText}>
          💬 {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <Text style={[styles.actionIcon, isLiked && styles.actionIconActive]}>
            {isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
            {isLiked ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleComment} style={styles.actionButton}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
          <Text style={styles.actionIcon}>🔄</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A2238',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatar: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    backgroundColor: '#1A3A52',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#F2D100',
    fontSize: normalize(18),
    fontWeight: '900',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    color: '#EAF2FF',
    fontSize: normalize(15),
    fontWeight: '900',
    marginBottom: 2,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    color: '#9FB3C8',
    fontSize: normalize(12),
  },
  dot: {
    color: '#9FB3C8',
    marginHorizontal: 4,
  },
  location: {
    color: '#9FB3C8',
    fontSize: normalize(12),
  },
  teamBadge: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: '#F2D100',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  teamBadgeText: {
    fontSize: normalize(16),
  },
  pinnedBadge: {
    marginLeft: spacing.xs,
  },
  pinnedText: {
    fontSize: normalize(18),
  },
  content: {
    color: '#EAF2FF',
    fontSize: normalize(15),
    lineHeight: normalize(22),
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  hashtag: {
    color: '#22C6D2',
    fontWeight: '700',
  },
  singleImage: {
    width: '100%',
    height: normalize(300),
    backgroundColor: '#1A3A52',
  },
  multiImageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  multiImage: {
    width: '50%',
    height: normalize(150),
    backgroundColor: '#1A3A52',
  },
  moreImagesOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '50%',
    height: normalize(150),
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImagesText: {
    color: '#EAF2FF',
    fontSize: normalize(24),
    fontWeight: '900',
  },
  locationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 198, 210, 0.1)',
    padding: spacing.md,
    gap: spacing.sm,
  },
  locationIcon: {
    fontSize: normalize(24),
  },
  locationName: {
    color: '#22C6D2',
    fontSize: normalize(14),
    fontWeight: '900',
    marginBottom: 2,
  },
  locationAddress: {
    color: '#9FB3C8',
    fontSize: normalize(12),
  },
  engagementBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  engagementText: {
    color: '#9FB3C8',
    fontSize: normalize(13),
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  actionIcon: {
    fontSize: normalize(18),
  },
  actionIconActive: {
    transform: [{ scale: 1.2 }],
  },
  actionText: {
    color: '#9FB3C8',
    fontSize: normalize(13),
    fontWeight: '700',
  },
  actionTextActive: {
    color: '#FF3B30',
  },
});