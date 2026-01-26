// src/services/notifications.ts - REAL NOTIFICATION SERVICE

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Match } from '../state/AppStore';

// Configure notification behavior (UPDATED - no more deprecation warnings)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private initialized = false;
  private expoPushToken: string | null = null;

  /**
   * Initialize notification service (REAL)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('📱 Notification permissions not granted');
        return;
      }

      // Get push token (for backend integration)
      // Skip in development/Expo Go - only needed for production builds
      if (Platform.OS !== 'web' && !__DEV__) {
        try {
          const token = await Notifications.getExpoPushTokenAsync({
            projectId: process.env.EXPO_PUBLIC_PROJECT_ID || 'your-project-id',
          });
          this.expoPushToken = token.data;
          console.log('📱 Push Token:', this.expoPushToken);
        } catch (error) {
          console.log('📱 Push token not available (expected in dev mode)');
        }
      }

      // Configure notification channel (Android)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#F2D100',
        });
      }

      this.initialized = true;
      console.log('📬 Notification service initialized');
    } catch (error) {
      console.error('Notification initialization error:', error);
    }
  }

  /**
   * Send local notification (REAL)
   */
  async sendLocalNotification(payload: {
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          sound: true,
        },
        trigger: null, // Send immediately
      });
      console.log('📬 Notification sent:', payload.title);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Schedule notification for specific time (REAL)
   */
  async scheduleNotification(
    payload: {
      title: string;
      body: string;
      data?: Record<string, any>;
    },
    triggerDate: Date
  ): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          sound: true,
        },
        trigger: triggerDate,
      });
      console.log('⏰ Notification scheduled for:', triggerDate);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  /**
   * Cancel notification (REAL)
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('❌ Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  /**
   * Cancel all notifications (REAL)
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('❌ All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  /**
   * Get push token for backend integration
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Send pre-game alert (30 mins before)
   */
  async sendPreGameAlert(match: Match): Promise<void> {
    const message = {
      title: '⚽ Check-In OPEN',
      body: `${match.homeTeam} vs ${match.awayTeam} - Check-in window is now open!`,
      data: { matchId: match.id, type: 'pre_game' },
    };

    await this.sendLocalNotification(message);
  }

  /**
   * Send check-in reminder to individual player
   */
  async sendCheckInReminder(playerName: string, match: Match): Promise<void> {
    const message = {
      title: '📸 Time to Check In',
      body: `${playerName}, please check in for ${match.homeTeam} vs ${match.awayTeam}`,
      data: { matchId: match.id, type: 'reminder' },
    };

    await this.sendLocalNotification(message);
  }

  /**
   * Notify entire team that verification is open
   */
  async notifyTeamVerificationOpen(
    teamName: string,
    match: Match,
    playerCount: number
  ): Promise<void> {
    const message = {
      title: `🏆 ${teamName} - Check-In Open`,
      body: `All ${playerCount} players can now check in at ${match.field}`,
      data: { matchId: match.id, teamName, type: 'team_alert' },
    };

    await this.sendLocalNotification(message);
  }

  /**
   * Send navigation reminder
   */
  async sendNavigationReminder(match: Match): Promise<void> {
    const message = {
      title: '🗺️ Navigate to Field',
      body: `${match.field} - Tap to get directions`,
      data: { matchId: match.id, type: 'navigation' },
    };

    await this.sendLocalNotification(message);
  }

  /**
   * 15-minute warning
   */
  async sendFifteenMinuteWarning(match: Match): Promise<void> {
    const message = {
      title: '⏰ 15 Minutes Until Kickoff',
      body: `${match.homeTeam} vs ${match.awayTeam} - Final call for check-in!`,
      data: { matchId: match.id, type: 'fifteen_min' },
    };

    await this.sendLocalNotification(message);
  }

  /**
   * Game starting alert
   */
  async sendGameStartingAlert(match: Match): Promise<void> {
    const message = {
      title: '🎯 Game Starting NOW',
      body: `${match.homeTeam} vs ${match.awayTeam} - Kickoff!`,
      data: { matchId: match.id, type: 'game_start' },
    };

    await this.sendLocalNotification(message);
  }

  /**
   * Notify coach of missing players
   */
  async notifyMissingPlayers(
    teamName: string,
    missingPlayers: string[],
    match: Match
  ): Promise<void> {
    const message = {
      title: `⚠️ ${teamName} - Missing Check-Ins`,
      body: `${missingPlayers.length} players haven't checked in: ${missingPlayers.join(', ')}`,
      data: { matchId: match.id, teamName, type: 'missing_players' },
    };

    await this.sendLocalNotification(message);
  }
}

export const notificationService = new NotificationService();