// app/community/my-businesses.tsx - BUSINESS MANAGEMENT DASHBOARD

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppStore } from '../../src/state/AppStore';

export default function MyBusinessesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ANALYTICS'>('ACTIVE');

  const businesses = useAppStore((state) => state.businesses);
  const currentUser = useAppStore((state) => state.currentUser);
  const players = useAppStore((state) => state.players);
  const deleteBusiness = useAppStore((state) => state.deleteBusiness);

  // Find user's player profile
  const userPlayer = players.find((p) => p.userId === currentUser.id);

  // Get user's businesses
  const myBusinesses = businesses.filter(
    (b) => b.ownerId === userPlayer?.id || b.ownerName === currentUser.name
  );

  const handleDeleteBusiness = (businessId: string, businessName: string) => {
    Alert.alert(
      'Delete Business',
      `Are you sure you want to delete "${businessName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteBusiness(businessId);
            Alert.alert('Deleted', 'Business listing has been removed.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Businesses</Text>
        <TouchableOpacity
          onPress={() => router.push('/community/add-business')}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{myBusinesses.length}</Text>
          <Text style={styles.statLabel}>Total Listings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {myBusinesses.filter((b) => b.isFeatured).length}
          </Text>
          <Text style={styles.statLabel}>Featured</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {myBusinesses.reduce((sum, b) => sum + b.views, 0)}
          </Text>
          <Text style={styles.statLabel}>Total Views</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('ACTIVE')}
          style={[styles.tab, activeTab === 'ACTIVE' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'ACTIVE' && styles.tabTextActive]}>
            📋 My Listings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('ANALYTICS')}
          style={[styles.tab, activeTab === 'ANALYTICS' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'ANALYTICS' && styles.tabTextActive]}>
            📊 Analytics
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {myBusinesses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🏪</Text>
            <Text style={styles.emptyStateTitle}>No Businesses Yet</Text>
            <Text style={styles.emptyStateText}>
              List your business to start connecting with NVT players
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/community/add-business')}
              style={styles.emptyStateButton}
            >
              <Text style={styles.emptyStateButtonText}>+ List Your Business</Text>
            </TouchableOpacity>
          </View>
        ) : activeTab === 'ACTIVE' ? (
          myBusinesses.map((business) => (
            <BusinessManagementCard
              key={business.id}
              business={business}
              onEdit={() => router.push(`/community/edit-business/${business.id}`)}
              onDelete={() => handleDeleteBusiness(business.id, business.name)}
              onUpgrade={() => router.push('/community/packages')}
              onView={() => router.push(`/community/business/${business.id}`)}
            />
          ))
        ) : (
          <AnalyticsView businesses={myBusinesses} />
        )}
      </ScrollView>

      {/* Upgrade Prompt for Non-Featured */}
      {myBusinesses.some((b) => !b.isFeatured) && (
        <View style={styles.upgradePrompt}>
          <Text style={styles.upgradePromptIcon}>📈</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.upgradePromptTitle}>Boost Your Visibility</Text>
            <Text style={styles.upgradePromptText}>
              Get 10x more views with featured placement
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/community/packages')}
            style={styles.upgradeButton}
          >
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Business Management Card Component
function BusinessManagementCard({ business, onEdit, onDelete, onUpgrade, onView }: any) {
  const daysUntilExpiration = business.featuredUntil
    ? Math.ceil((business.featuredUntil - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <View style={styles.businessCard}>
      {/* Header */}
      <View style={styles.businessCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.businessCardName}>{business.name}</Text>
          <Text style={styles.businessCardCategory}>
            {formatCategory(business.category)}
          </Text>
        </View>
        {business.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>⭐ FEATURED</Text>
          </View>
        )}
      </View>

      {/* Featured Expiration Warning */}
      {business.isFeatured && daysUntilExpiration && daysUntilExpiration <= 7 && (
        <View style={styles.expirationWarning}>
          <Text style={styles.expirationWarningText}>
            ⚠️ Featured status expires in {daysUntilExpiration} day
            {daysUntilExpiration !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Stats */}
      <View style={styles.businessStats}>
        <View style={styles.businessStat}>
          <Text style={styles.businessStatValue}>{business.views}</Text>
          <Text style={styles.businessStatLabel}>Views</Text>
        </View>
        <View style={styles.businessStat}>
          <Text style={styles.businessStatValue}>{business.clicks}</Text>
          <Text style={styles.businessStatLabel}>Clicks</Text>
        </View>
        <View style={styles.businessStat}>
          <Text style={styles.businessStatValue}>{business.saves}</Text>
          <Text style={styles.businessStatLabel}>Saves</Text>
        </View>
        <View style={styles.businessStat}>
          <Text style={styles.businessStatValue}>
            {business.clicks > 0
              ? ((business.clicks / business.views) * 100).toFixed(1)
              : '0.0'}
            %
          </Text>
          <Text style={styles.businessStatLabel}>CTR</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.businessActions}>
        <TouchableOpacity onPress={onView} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>👁️ View</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>✏️ Edit</Text>
        </TouchableOpacity>

        {!business.isFeatured && (
          <TouchableOpacity onPress={onUpgrade} style={styles.actionButtonPrimary}>
            <Text style={styles.actionButtonPrimaryText}>⭐ Upgrade</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onDelete} style={styles.actionButtonDanger}>
          <Text style={styles.actionButtonDangerText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Analytics View Component
function AnalyticsView({ businesses }: any) {
  const totalViews = businesses.reduce((sum: number, b: any) => sum + b.views, 0);
  const totalClicks = businesses.reduce((sum: number, b: any) => sum + b.clicks, 0);
  const totalSaves = businesses.reduce((sum: number, b: any) => sum + b.saves, 0);
  const avgCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00';

  const sortedByViews = [...businesses].sort((a, b) => b.views - a.views);
  const topPerformer = sortedByViews[0];

  return (
    <View>
      {/* Overall Stats */}
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>📊 Overall Performance</Text>

        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{totalViews}</Text>
            <Text style={styles.analyticsLabel}>Total Views</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{totalClicks}</Text>
            <Text style={styles.analyticsLabel}>Total Clicks</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{totalSaves}</Text>
            <Text style={styles.analyticsLabel}>Total Saves</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{avgCTR}%</Text>
            <Text style={styles.analyticsLabel}>Avg CTR</Text>
          </View>
        </View>
      </View>

      {/* Top Performer */}
      {topPerformer && (
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>🏆 Top Performer</Text>
          <Text style={styles.topPerformerName}>{topPerformer.name}</Text>
          <View style={styles.topPerformerStats}>
            <Text style={styles.topPerformerStat}>
              {topPerformer.views} views • {topPerformer.clicks} clicks
            </Text>
          </View>
        </View>
      )}

      {/* Business Breakdown */}
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>📈 Business Breakdown</Text>

        {sortedByViews.map((business, index) => (
          <View key={business.id} style={styles.businessBreakdownItem}>
            <View style={styles.businessBreakdownRank}>
              <Text style={styles.businessBreakdownRankText}>#{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.businessBreakdownName}>{business.name}</Text>
              <Text style={styles.businessBreakdownStats}>
                {business.views} views • {business.clicks} clicks • {business.saves} saves
              </Text>
            </View>
            {business.isFeatured && (
              <View style={styles.businessBreakdownBadge}>
                <Text style={styles.businessBreakdownBadgeText}>⭐</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Insights */}
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>💡 Insights</Text>

        {businesses.some((b: any) => !b.isFeatured) && (
          <View style={styles.insightItem}>
            <Text style={styles.insightIcon}>📈</Text>
            <Text style={styles.insightText}>
              Featured businesses get 10x more views on average
            </Text>
          </View>
        )}

        {businesses.some((b: any) => !b.specialOffer) && (
          <View style={styles.insightItem}>
            <Text style={styles.insightIcon}>🎁</Text>
            <Text style={styles.insightText}>
              Businesses with special offers get 3x more clicks
            </Text>
          </View>
        )}

        {totalViews > 0 && parseFloat(avgCTR) < 5 && (
          <View style={styles.insightItem}>
            <Text style={styles.insightIcon}>💡</Text>
            <Text style={styles.insightText}>
              Add better photos and special offers to improve your click-through rate
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function formatCategory(category: string) {
  return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#061A2B',
    borderBottomWidth: 1,
    borderBottomColor: '#1A3A52',
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    color: '#22C6D2',
    fontSize: 16,
    fontWeight: '900',
  },
  headerTitle: {
    color: '#F2D100',
    fontSize: 20,
    fontWeight: '900',
  },
  addButton: {
    backgroundColor: '#22C6D2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#061A2B',
    fontSize: 14,
    fontWeight: '900',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0A2238',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    color: '#22C6D2',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9FB3C8',
    fontSize: 11,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#F2D100',
  },
  tabText: {
    color: '#9FB3C8',
    fontSize: 14,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#F2D100',
  },
  content: {
    flex: 1,
  },
  businessCard: {
    backgroundColor: '#0A2238',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  businessCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  businessCardName: {
    color: '#EAF2FF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  businessCardCategory: {
    color: '#9FB3C8',
    fontSize: 13,
  },
  featuredBadge: {
    backgroundColor: '#F2D100',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredBadgeText: {
    color: '#061A2B',
    fontSize: 11,
    fontWeight: '900',
  },
  expirationWarning: {
    backgroundColor: 'rgba(211, 59, 59, 0.2)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  expirationWarningText: {
    color: '#D33B3B',
    fontSize: 12,
    fontWeight: '700',
  },
  businessStats: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  businessStat: {
    flex: 1,
    alignItems: 'center',
  },
  businessStatValue: {
    color: '#22C6D2',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  businessStatLabel: {
    color: '#9FB3C8',
    fontSize: 11,
  },
  businessActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1A3A52',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#EAF2FF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionButtonPrimary: {
    flex: 1,
    backgroundColor: '#22C6D2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonPrimaryText: {
    color: '#061A2B',
    fontSize: 13,
    fontWeight: '900',
  },
  actionButtonDanger: {
    backgroundColor: '#D33B3B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonDangerText: {
    color: '#EAF2FF',
    fontSize: 16,
  },
  analyticsCard: {
    backgroundColor: '#0A2238',
    margin: 16,
    marginBottom: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  analyticsTitle: {
    color: '#F2D100',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticsItem: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(34, 198, 210, 0.1)',
    borderRadius: 12,
  },
  analyticsValue: {
    color: '#22C6D2',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  analyticsLabel: {
    color: '#9FB3C8',
    fontSize: 12,
  },
  topPerformerName: {
    color: '#EAF2FF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  topPerformerStats: {
    flexDirection: 'row',
  },
  topPerformerStat: {
    color: '#22C6D2',
    fontSize: 14,
    fontWeight: '700',
  },
  businessBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  businessBreakdownRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22C6D2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessBreakdownRankText: {
    color: '#061A2B',
    fontSize: 14,
    fontWeight: '900',
  },
  businessBreakdownName: {
    color: '#EAF2FF',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  businessBreakdownStats: {
    color: '#9FB3C8',
    fontSize: 12,
  },
  businessBreakdownBadge: {
    backgroundColor: '#F2D100',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessBreakdownBadgeText: {
    fontSize: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: 'rgba(34, 198, 210, 0.1)',
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  insightIcon: {
    fontSize: 20,
  },
  insightText: {
    color: '#22C6D2',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: '#EAF2FF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#9FB3C8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#22C6D2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: '#061A2B',
    fontSize: 15,
    fontWeight: '900',
  },
  upgradePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C6D2',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  upgradePromptIcon: {
    fontSize: 32,
  },
  upgradePromptTitle: {
    color: '#061A2B',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  upgradePromptText: {
    color: '#061A2B',
    fontSize: 13,
    opacity: 0.8,
  },
  upgradeButton: {
    backgroundColor: '#061A2B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#22C6D2',
    fontSize: 14,
    fontWeight: '900',
  },
});