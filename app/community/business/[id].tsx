// app/community/business/[id].tsx - BUSINESS DETAIL PAGE

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Linking,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppStore } from '../../../src/state/AppStore';

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

  const businesses = useAppStore((state) => state.businesses);
  const currentUser = useAppStore((state) => state.currentUser);
  const trackBusinessClick = useAppStore((state) => state.trackBusinessClick);
  const saveBusinessForLater = useAppStore((state) => state.saveBusinessForLater);

  const business = businesses.find((b) => b.id === id);

  if (!business) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Business Not Found</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>This business could not be found.</Text>
        </View>
      </View>
    );
  }

  const handleCall = () => {
    if (business.phone) {
      trackBusinessClick(business.id);
      Linking.openURL(`tel:${business.phone}`);
    }
  };

  const handleEmail = () => {
    if (business.email) {
      trackBusinessClick(business.id);
      Linking.openURL(`mailto:${business.email}`);
    }
  };

  const handleWebsite = () => {
    if (business.website) {
      trackBusinessClick(business.id);
      const url = business.website.startsWith('http') 
        ? business.website 
        : `https://${business.website}`;
      Linking.openURL(url);
    }
  };

  const handleGetDirections = () => {
    trackBusinessClick(business.id);
    const address = encodeURIComponent(
      `${business.address}, ${business.city}, ${business.state} ${business.zipCode || ''}`
    );
    Linking.openURL(`https://maps.google.com/?q=${address}`);
  };

  const handleSave = () => {
    if (!isSaved) {
      saveBusinessForLater(business.id, currentUser.id);
      setIsSaved(true);
      Alert.alert('Saved!', 'Business saved for later.');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${business.name}! ${business.description}\n\n${business.address}, ${business.city}, ${business.state}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{business.name}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareText}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Banner Image */}
        {business.bannerUrl ? (
          <Image source={{ uri: business.bannerUrl }} style={styles.bannerImage} />
        ) : (
          <View style={[styles.bannerImage, styles.bannerPlaceholder]}>
            <Text style={styles.bannerEmoji}>{getCategoryEmoji(business.category)}</Text>
          </View>
        )}

        {/* Featured Badge */}
        {business.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>⭐ FEATURED</Text>
          </View>
        )}

        {/* Business Info */}
        <View style={styles.infoSection}>
          <Text style={styles.businessName}>{business.name}</Text>
          <Text style={styles.businessCategory}>{formatCategory(business.category)}</Text>
          <Text style={styles.businessDescription}>{business.description}</Text>

          {/* Owner Info */}
          {business.ownerName && (
            <View style={styles.ownerCard}>
              <Text style={styles.ownerLabel}>👤 Owner</Text>
              <Text style={styles.ownerName}>{business.ownerName}</Text>
              {business.ownerTeamName && (
                <Text style={styles.ownerTeam}>Team: {business.ownerTeamName}</Text>
              )}
            </View>
          )}

          {/* Special Offer */}
          {business.specialOffer && (
            <View style={styles.offerCard}>
              <Text style={styles.offerIcon}>🎁</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.offerTitle}>Special Offer</Text>
                <Text style={styles.offerText}>{business.specialOffer}</Text>
                {business.discountCode && (
                  <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>Code:</Text>
                    <Text style={styles.codeText}>{business.discountCode}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Tournament Vendor Info */}
          {business.tournamentId && (
            <View style={styles.vendorCard}>
              <Text style={styles.vendorTitle}>🏪 Tournament Vendor</Text>
              {business.boothNumber && (
                <Text style={styles.vendorInfo}>Booth: {business.boothNumber}</Text>
              )}
              {business.boothLocation && (
                <Text style={styles.vendorInfo}>Location: {business.boothLocation}</Text>
              )}
            </View>
          )}

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            {business.phone && (
              <TouchableOpacity onPress={handleCall} style={styles.contactButton}>
                <Text style={styles.contactIcon}>📞</Text>
                <Text style={styles.contactText}>{business.phone}</Text>
              </TouchableOpacity>
            )}

            {business.email && (
              <TouchableOpacity onPress={handleEmail} style={styles.contactButton}>
                <Text style={styles.contactIcon}>✉️</Text>
                <Text style={styles.contactText}>{business.email}</Text>
              </TouchableOpacity>
            )}

            {business.website && (
              <TouchableOpacity onPress={handleWebsite} style={styles.contactButton}>
                <Text style={styles.contactIcon}>🌐</Text>
                <Text style={styles.contactText}>{business.website}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Location Section */}
          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.addressText}>{business.address}</Text>
            <Text style={styles.addressText}>
              {business.city}, {business.state} {business.zipCode}
            </Text>

            <TouchableOpacity onPress={handleGetDirections} style={styles.directionsButton}>
              <Text style={styles.directionsText}>🗺️ Get Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{business.views}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{business.clicks}</Text>
              <Text style={styles.statLabel}>Clicks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{business.saves}</Text>
              <Text style={styles.statLabel}>Saves</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.actionButton, styles.saveButton, isSaved && styles.savedButton]}
        >
          <Text style={styles.actionButtonText}>
            {isSaved ? '✓ Saved' : '🔖 Save'}
          </Text>
        </TouchableOpacity>

        {business.phone && (
          <TouchableOpacity onPress={handleCall} style={[styles.actionButton, styles.callButton]}>
            <Text style={styles.actionButtonText}>📞 Call Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function getCategoryEmoji(category: string) {
  const emojiMap: any = {
    RESTAURANT: '🍔',
    SPORTS_GEAR: '⚽',
    FITNESS: '💪',
    MEDICAL: '🏥',
    AUTOMOTIVE: '🚗',
    REAL_ESTATE: '🏠',
    CONSTRUCTION: '🔨',
    PROFESSIONAL_SERVICES: '💼',
    RETAIL: '🛍️',
    ENTERTAINMENT: '🎉',
    OTHER: '🏢',
  };
  return emojiMap[category] || '🏢';
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
    fontSize: 18,
    fontWeight: '900',
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    paddingVertical: 8,
  },
  shareText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  bannerImage: {
    width: '100%',
    height: 200,
  },
  bannerPlaceholder: {
    backgroundColor: '#1A3A52',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerEmoji: {
    fontSize: 64,
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#F2D100',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  featuredBadgeText: {
    color: '#061A2B',
    fontSize: 12,
    fontWeight: '900',
  },
  infoSection: {
    padding: 16,
  },
  businessName: {
    color: '#EAF2FF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  businessCategory: {
    color: '#22C6D2',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  businessDescription: {
    color: '#9FB3C8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  ownerCard: {
    backgroundColor: '#0A2238',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ownerLabel: {
    color: '#9FB3C8',
    fontSize: 12,
    marginBottom: 6,
  },
  ownerName: {
    color: '#EAF2FF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  ownerTeam: {
    color: '#22C6D2',
    fontSize: 13,
  },
  offerCard: {
    backgroundColor: '#22C6D2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  offerIcon: {
    fontSize: 32,
  },
  offerTitle: {
    color: '#061A2B',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },
  offerText: {
    color: '#061A2B',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeLabel: {
    color: '#061A2B',
    fontSize: 12,
    fontWeight: '700',
  },
  codeText: {
    backgroundColor: 'rgba(6, 26, 43, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    color: '#061A2B',
    fontSize: 14,
    fontWeight: '900',
  },
  vendorCard: {
    backgroundColor: '#F2D100',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  vendorTitle: {
    color: '#061A2B',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  vendorInfo: {
    color: '#061A2B',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  contactSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#F2D100',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2238',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contactIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  contactText: {
    color: '#22C6D2',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  locationSection: {
    marginBottom: 20,
  },
  addressText: {
    color: '#EAF2FF',
    fontSize: 15,
    marginBottom: 6,
  },
  directionsButton: {
    backgroundColor: '#22C6D2',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    alignItems: 'center',
  },
  directionsText: {
    color: '#061A2B',
    fontSize: 15,
    fontWeight: '900',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0A2238',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#22C6D2',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9FB3C8',
    fontSize: 12,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#0A2238',
    borderTopWidth: 1,
    borderTopColor: '#1A3A52',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#0A2238',
    borderWidth: 2,
    borderColor: '#22C6D2',
  },
  savedButton: {
    backgroundColor: '#22C6D2',
    borderColor: '#22C6D2',
  },
  callButton: {
    backgroundColor: '#22C6D2',
  },
  actionButtonText: {
    color: '#EAF2FF',
    fontSize: 15,
    fontWeight: '900',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#9FB3C8',
    fontSize: 16,
    textAlign: 'center',
  },
});