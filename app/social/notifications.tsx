// app/social/notifications.tsx

import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppStore } from '../../src/state/AppStore';
import { normalize, spacing } from '../../src/utils/responsive';

export default function NotificationsScreen() {
  const router = useRouter();
  const currentUser = useAppStore((state) => state.currentUser);
  const socialNotifications = useAppStore((state) => state.socialNotifications);
  const markNotificationRead = useAppStore((state) => state.markNotificationRead);

  const myNotifications = socialNotifications
    .filter((n) => n.userId === currentUser.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  // Mark all as read when screen opens
  useEffect(() => {
    myNotifications.forEach((n) => {
      if (!n.isRead) {
        markNotificationRead(n.id);
      }
    });
  }, []);

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return '❤️';
      case 'COMMENT':
        return '💬';
      case 'MENTION':
        return '@';
      case 'FOLLOW':
        return '👤';
      case 'POST':
        return '📸';
      case 'REPLY':
        return '↩️';
      default:
        return '🔔';
    }
  };

  const handleNotificationPress = (notification: any) => {
    if (notification.postId) {
      router.push(`/social/post/${notification.postId}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {myNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🔔</Text>
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateText}>
              You'll see notifications here when people interact with your posts
            </Text>
          </View>
        ) : (
          myNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => handleNotificationPress(notification)}
              style={[
                styles.notificationCard,
                !notification.isRead && styles.notificationCardUnread,
              ]}
            >
              {/* Actor Avatar */}
              {notification.actorAvatar ? (
                <Image
                  source={{ uri: notification.actorAvatar }}
                  style={styles.actorAvatar}
                />
              ) : (
                <View style={[styles.actorAvatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {notification.actorName.charAt(0)}
                  </Text>
                </View>
              )}

              {/* Notification Content */}
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </Text>
                  <Text style={styles.actorName}>{notification.actorName}</Text>
                  <Text style={styles.notificationAction}>{notification.content}</Text>
                </View>
                <Text style={styles.notificationTimestamp}>
                  {formatTimestamp(notification.createdAt)}
                </Text>
              </View>

              {/* Unread Indicator */}
              {!notification.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
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
  content: {
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
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2238',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: spacing.sm,
  },
  notificationCardUnread: {
    backgroundColor: 'rgba(34, 198, 210, 0.05)',
    borderColor: 'rgba(34, 198, 210, 0.2)',
  },
  actorAvatar: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
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
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  notificationIcon: {
    fontSize: normalize(16),
  },
  actorName: {
    color: '#EAF2FF',
    fontSize: normalize(14),
    fontWeight: '900',
  },
  notificationAction: {
    color: '#9FB3C8',
    fontSize: normalize(14),
  },
  notificationTimestamp: {
    color: '#9FB3C8',
    fontSize: normalize(12),
  },
  unreadDot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    backgroundColor: '#22C6D2',
  },
});