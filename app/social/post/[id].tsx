// app/social/post/[id].tsx

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppStore } from '../../../src/state/AppStore';
import { normalize, spacing } from '../../../src/utils/responsive';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const posts = useAppStore((state) => state.posts);
  const comments = useAppStore((state) => state.comments);
  const reactions = useAppStore((state) => state.reactions);
  const currentUser = useAppStore((state) => state.currentUser);
  const createComment = useAppStore((state) => state.createComment);
  const deleteComment = useAppStore((state) => state.deleteComment);
  const likePost = useAppStore((state) => state.likePost);
  const unlikePost = useAppStore((state) => state.unlikePost);
  const deletePost = useAppStore((state) => state.deletePost);
  const incrementPostView = useAppStore((state) => state.incrementPostView);

  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const post = useMemo(() => posts.find((p) => p.id === id), [posts, id]);

  const postComments = useMemo(
    () => comments.filter((c) => c.postId === id && !c.parentCommentId),
    [comments, id]
  );

  const userReaction = useMemo(
    () => reactions.find((r) => r.postId === id && r.userId === currentUser.id),
    [reactions, id, currentUser.id]
  );

  const [isLiked, setIsLiked] = useState(!!userReaction);

  // Increment view count on mount
  React.useEffect(() => {
    if (post) {
      incrementPostView(post.id);
    }
  }, [post?.id]);

  if (!post) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Not Found</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>This post could not be found.</Text>
        </View>
      </View>
    );
  }

  const handleLike = () => {
    if (isLiked) {
      unlikePost(post.id, currentUser.id);
      setIsLiked(false);
    } else {
      likePost(post.id, currentUser.id, currentUser.name, 'LIKE');
      setIsLiked(true);
    }
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;

    createComment({
      postId: post.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: `https://i.pravatar.cc/150?u=${currentUser.id}`,
      content: commentText.trim(),
      parentCommentId: replyingTo,
    });

    setCommentText('');
    setReplyingTo(null);
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteComment(commentId, post.id),
      },
    ]);
  };

  const handleDeletePost = () => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deletePost(post.id);
          router.back();
        },
      },
    ]);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        {post.authorId === currentUser.id && (
          <TouchableOpacity onPress={handleDeletePost}>
            <Text style={styles.deleteText}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Post Content */}
        <View style={styles.postContainer}>
          {/* Author */}
          <View style={styles.postHeader}>
            {post.authorAvatar ? (
              <Image source={{ uri: post.authorAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{post.authorName.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{post.authorName}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(post.createdAt)}</Text>
            </View>
          </View>

          {/* Content */}
          {post.content && (
            <Text style={styles.postContent}>{renderHashtags(post.content)}</Text>
          )}

          {/* Media */}
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {post.mediaUrls.map((url, index) => (
                <Image key={index} source={{ uri: url }} style={styles.postImage} />
              ))}
            </ScrollView>
          )}

          {/* Location */}
          {post.location && (
            <View style={styles.locationPreview}>
              <Text style={styles.locationIcon}>📍</Text>
              <View>
                <Text style={styles.locationName}>{post.location.name}</Text>
                <Text style={styles.locationAddress}>{post.location.address}</Text>
              </View>
            </View>
          )}

          {/* Engagement Stats */}
          <View style={styles.stats}>
            <Text style={styles.statText}>❤️ {post.likeCount} likes</Text>
            <Text style={styles.statText}>💬 {post.commentCount} comments</Text>
            <Text style={styles.statText}>👁️ {post.viewCount} views</Text>
          </View>

          {/* Actions */}
          <View style={styles.postActions}>
            <TouchableOpacity onPress={handleLike} style={styles.postActionButton}>
              <Text style={[styles.postActionIcon, isLiked && styles.postActionIconActive]}>
                {isLiked ? '❤️' : '🤍'}
              </Text>
              <Text
                style={[styles.postActionText, isLiked && styles.postActionTextActive]}
              >
                {isLiked ? 'Liked' : 'Like'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>
            Comments ({postComments.length})
          </Text>

          {postComments.length === 0 ? (
            <View style={styles.noComments}>
              <Text style={styles.noCommentsText}>
                No comments yet. Be the first to comment!
              </Text>
            </View>
          ) : (
            postComments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  {comment.userAvatar ? (
                    <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatar} />
                  ) : (
                    <View style={[styles.commentAvatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarText}>
                        {comment.userName.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.commentUserName}>{comment.userName}</Text>
                    <Text style={styles.commentTimestamp}>
                      {formatTimestamp(comment.createdAt)}
                    </Text>
                  </View>
                  {comment.userId === currentUser.id && (
                    <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                      <Text style={styles.commentDeleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInput}>
        <View style={styles.currentUserAvatar}>
          <Text style={styles.currentUserAvatarText}>
            {currentUser.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <TextInput
          style={styles.commentTextInput}
          placeholder="Write a comment..."
          placeholderTextColor="#9FB3C8"
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity
          onPress={handleSendComment}
          disabled={!commentText.trim()}
          style={[
            styles.sendButton,
            !commentText.trim() && styles.sendButtonDisabled,
          ]}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#1A3A52',
  },
  backText: {
    color: '#22C6D2',
    fontSize: normalize(16),
    fontWeight: '900',
  },
  headerTitle: {
    color: '#F2D100',
    fontSize: normalize(18),
    fontWeight: '900',
  },
  deleteText: {
    fontSize: normalize(20),
  },
  content: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: '#0A2238',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
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
    fontSize: normalize(16),
    fontWeight: '900',
    marginBottom: 2,
  },
  timestamp: {
    color: '#9FB3C8',
    fontSize: normalize(12),
  },
  postContent: {
    color: '#EAF2FF',
    fontSize: normalize(16),
    lineHeight: normalize(24),
    marginBottom: spacing.md,
  },
  hashtag: {
    color: '#22C6D2',
    fontWeight: '700',
  },
  postImage: {
    width: normalize(300),
    height: normalize(300),
    borderRadius: normalize(12),
    marginBottom: spacing.md,
    backgroundColor: '#1A3A52',
  },
  locationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 198, 210, 0.1)',
    padding: spacing.md,
    borderRadius: normalize(12),
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  stats: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    marginBottom: spacing.sm,
  },
  statText: {
    color: '#9FB3C8',
    fontSize: normalize(13),
  },
  postActions: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: spacing.sm,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  postActionIcon: {
    fontSize: normalize(20),
  },
  postActionIconActive: {
    transform: [{ scale: 1.2 }],
  },
  postActionText: {
    color: '#9FB3C8',
    fontSize: normalize(14),
    fontWeight: '700',
  },
  postActionTextActive: {
    color: '#FF3B30',
  },
  commentsSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  commentsTitle: {
    color: '#F2D100',
    fontSize: normalize(18),
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  noComments: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  noCommentsText: {
    color: '#9FB3C8',
    fontSize: normalize(14),
    textAlign: 'center',
  },
  commentCard: {
    backgroundColor: '#0A2238',
    padding: spacing.md,
    borderRadius: normalize(12),
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  commentAvatar: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    marginRight: spacing.xs,
  },
  commentUserName: {
    color: '#EAF2FF',
    fontSize: normalize(14),
    fontWeight: '900',
  },
  commentTimestamp: {
    color: '#9FB3C8',
    fontSize: normalize(11),
  },
  commentDeleteIcon: {
    fontSize: normalize(16),
  },
  commentContent: {
    color: '#EAF2FF',
    fontSize: normalize(14),
    lineHeight: normalize(20),
    paddingLeft: normalize(40),
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#0A2238',
    borderTopWidth: 1,
    borderTopColor: '#1A3A52',
    gap: spacing.sm,
  },
  currentUserAvatar: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: '#F2D100',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentUserAvatarText: {
    color: '#061A2B',
    fontSize: normalize(16),
    fontWeight: '900',
  },
  commentTextInput: {
    flex: 1,
    backgroundColor: '#061A2B',
    borderRadius: normalize(20),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: '#EAF2FF',
    fontSize: normalize(14),
    maxHeight: normalize(100),
  },
  sendButton: {
    backgroundColor: '#22C6D2',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: normalize(20),
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#061A2B',
    fontSize: normalize(14),
    fontWeight: '900',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    color: '#9FB3C8',
    fontSize: normalize(16),
  },
});