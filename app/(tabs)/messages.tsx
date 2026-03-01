// app/(tabs)/messages.tsx - COMMUNITY HUB WITH MY BUSINESSES BUTTON

import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppStore } from '../../src/state/AppStore';

const { width } = Dimensions.get('window');

type TabType = 'FEATURED' | 'BUSINESSES' | 'VENDORS' | 'MAP';

export default function CommunityHubScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('FEATURED');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const businesses = useAppStore((state) => state.businesses);
  const tournaments = useAppStore((state) => state.tournaments);
  const trackBusinessView = useAppStore((state) => state.trackBusinessView);

  // Get unique cities
  const cities = useMemo(() => {
    const unique = Array.from(new Set(businesses.map(b => b.city)));
    return ['All', ...unique.sort()];
  }, [businesses]);

  // Filter businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           b.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = selectedCity === 'All' || b.city === selectedCity;
      const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
      return matchesSearch && matchesCity && matchesCategory && b.status === 'ACTIVE';
    });
  }, [businesses, searchQuery, selectedCity, selectedCategory]);

  const featuredBusinesses = useMemo(() => {
    return businesses.filter(b => b.isFeatured && b.status === 'ACTIVE');
  }, [businesses]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community Hub</Text>
        <Text style={styles.subtitle}>
          Support our players & partners
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses..."
          placeholderTextColor="#9FB3C8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Vendor Packages Promo */}
      <TouchableOpacity
        onPress={() => router.push('/community/packages')}
        style={styles.packagesPromo}
      >
        <Text style={styles.packagesPromoIcon}>📈</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.packagesPromoTitle}>Grow Your Business</Text>
          <Text style={styles.packagesPromoText}>
            Get featured and reach 1,000+ NVT players
          </Text>
        </View>
        <Text style={styles.packagesPromoArrow}>→</Text>
      </TouchableOpacity>

      {/* My Businesses Button */}
      <TouchableOpacity
        onPress={() => router.push('/community/my-businesses')}
        style={styles.myBusinessesButton}
      >
        <Text style={styles.myBusinessesButtonIcon}>📊</Text>
        <Text style={styles.myBusinessesButtonText}>My Businesses</Text>
        <Text style={styles.myBusinessesButtonArrow}>→</Text>
      </TouchableOpacity>

      {/* City Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {cities.map((city) => (
          <TouchableOpacity
            key={city}
            onPress={() => setSelectedCity(city)}
            style={[
              styles.filterChip,
              selectedCity === city && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCity === city && styles.filterChipTextActive,
              ]}
            >
              📍 {city}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('FEATURED')}
          style={[styles.tab, activeTab === 'FEATURED' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'FEATURED' && styles.tabTextActive]}>
            ⭐ Featured
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('BUSINESSES')}
          style={[styles.tab, activeTab === 'BUSINESSES' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'BUSINESSES' && styles.tabTextActive]}>
            💼 Directory
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('VENDORS')}
          style={[styles.tab, activeTab === 'VENDORS' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'VENDORS' && styles.tabTextActive]}>
            🏪 Vendors
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('MAP')}
          style={[styles.tab, activeTab === 'MAP' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'MAP' && styles.tabTextActive]}>
            🗺️ Map
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {activeTab === 'FEATURED' && (
          <FeaturedSection businesses={featuredBusinesses} onBusinessPress={(b) => {
            trackBusinessView(b.id);
            router.push(`/community/business/${b.id}`);
          }} />
        )}

        {activeTab === 'BUSINESSES' && (
          <BusinessDirectory 
            businesses={filteredBusinesses}
            onCategoryChange={setSelectedCategory}
            selectedCategory={selectedCategory}
            onBusinessPress={(b) => {
              trackBusinessView(b.id);
              router.push(`/community/business/${b.id}`);
            }}
          />
        )}

        {activeTab === 'VENDORS' && (
          <TournamentVendors 
            tournaments={tournaments}
            businesses={businesses}
            onBusinessPress={(b) => {
              trackBusinessView(b.id);
              router.push(`/community/business/${b.id}`);
            }}
          />
        )}

        {activeTab === 'MAP' && (
          <BusinessMap businesses={filteredBusinesses} />
        )}
      </ScrollView>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => router.push('/community/add-business')}
      >
        <Text style={styles.ctaButtonText}>+ List Your Business</Text>
      </TouchableOpacity>
    </View>
  );
}

// Featured Carousel Component
function FeaturedSection({ businesses, onBusinessPress }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (businesses.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateEmoji}>⭐</Text>
        <Text style={styles.emptyStateTitle}>No Featured Businesses</Text>
        <Text style={styles.emptyStateText}>
          Featured businesses will appear here
        </Text>
      </View>
    );
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      >
        {businesses.map((business: any) => (
          <TouchableOpacity
            key={business.id}
            onPress={() => onBusinessPress(business)}
            style={styles.featuredCard}
          >
            {business.bannerUrl ? (
              <Image source={{ uri: business.bannerUrl }} style={styles.featuredImage} />
            ) : (
              <View style={[styles.featuredImage, { backgroundColor: '#1A3A52' }]}>
                <Text style={{ fontSize: 48 }}>
                  {getCategoryEmoji(business.category)}
                </Text>
              </View>
            )}

            <View style={styles.featuredOverlay}>
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>⭐ FEATURED</Text>
              </View>

              <View style={styles.featuredContent}>
                <Text style={styles.featuredTitle}>{business.name}</Text>
                <Text style={styles.featuredSubtitle}>
                  {business.ownerName} • {business.city}, {business.state}
                </Text>

                {business.specialOffer && (
                  <View style={styles.offerBadge}>
                    <Text style={styles.offerText}>🎁 {business.specialOffer}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {businesses.map((_: any, index: number) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      {/* All Businesses Below */}
      <Text style={styles.sectionTitle}>All Businesses</Text>
      <View style={styles.gridContainer}>
        {businesses.map((business: any) => (
          <BusinessCard key={business.id} business={business} onPress={() => onBusinessPress(business)} />
        ))}
      </View>
    </View>
  );
}

// Business Directory Component
function BusinessDirectory({ businesses, selectedCategory, onCategoryChange, onBusinessPress }: any) {
  const categories = [
    { key: 'All', label: 'All', emoji: '🏢' },
    { key: 'RESTAURANT', label: 'Food', emoji: '🍔' },
    { key: 'SPORTS_GEAR', label: 'Sports', emoji: '⚽' },
    { key: 'FITNESS', label: 'Fitness', emoji: '💪' },
    { key: 'MEDICAL', label: 'Medical', emoji: '🏥' },
    { key: 'AUTOMOTIVE', label: 'Auto', emoji: '🚗' },
    { key: 'REAL_ESTATE', label: 'Realty', emoji: '🏠' },
    { key: 'CONSTRUCTION', label: 'Build', emoji: '🔨' },
    { key: 'PROFESSIONAL_SERVICES', label: 'Services', emoji: '💼' },
    { key: 'RETAIL', label: 'Retail', emoji: '🛍️' },
    { key: 'ENTERTAINMENT', label: 'Fun', emoji: '🎉' },
  ];

  return (
    <View>
      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => onCategoryChange(cat.key)}
            style={[
              styles.categoryPill,
              selectedCategory === cat.key && styles.categoryPillActive,
            ]}
          >
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.key && styles.categoryTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Business Grid */}
      <View style={styles.gridContainer}>
        {businesses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>💼</Text>
            <Text style={styles.emptyStateTitle}>No Businesses Found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your filters
            </Text>
          </View>
        ) : (
          businesses.map((business: any) => (
            <BusinessCard key={business.id} business={business} onPress={() => onBusinessPress(business)} />
          ))
        )}
      </View>
    </View>
  );
}

// Tournament Vendors Component
function TournamentVendors({ tournaments, businesses, onBusinessPress }: any) {
  const upcomingTournaments = tournaments.filter((t: any) => t.status === 'Open');

  return (
    <View>
      {upcomingTournaments.map((tournament: any) => {
        const vendors = businesses.filter((b: any) => b.tournamentId === tournament.id);

        if (vendors.length === 0) return null;

        return (
          <View key={tournament.id} style={styles.tournamentSection}>
            <Text style={styles.tournamentTitle}>
              🏆 {tournament.name}
            </Text>
            <Text style={styles.tournamentSubtitle}>
              {vendors.length} vendors attending
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vendorScroll}
            >
              {vendors.map((vendor: any) => (
                <VendorCard key={vendor.id} vendor={vendor} onPress={() => onBusinessPress(vendor)} />
              ))}
            </ScrollView>
          </View>
        );
      })}

      {upcomingTournaments.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>🏪</Text>
          <Text style={styles.emptyStateTitle}>No Tournament Vendors</Text>
          <Text style={styles.emptyStateText}>
            Vendors will appear here during tournaments
          </Text>
        </View>
      )}
    </View>
  );
}

// Business Map Component
function BusinessMap({ businesses }: any) {
  return (
    <View style={styles.mapPlaceholder}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>🗺️</Text>
      <Text style={styles.mapTitle}>Business Map</Text>
      <Text style={styles.mapText}>
        Map view will show {businesses.length} businesses with geolocation pins
      </Text>
      <Text style={styles.mapText}>
        Integration: React Native Maps or Mapbox
      </Text>
      
      {/* List view as fallback */}
      <View style={{ marginTop: 20, width: '100%' }}>
        {businesses.slice(0, 5).map((business: any) => (
          <View key={business.id} style={styles.mapListItem}>
            <Text style={styles.mapListEmoji}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.mapListTitle}>{business.name}</Text>
              <Text style={styles.mapListAddress}>
                {business.address}, {business.city}, {business.state}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// Business Card Component
function BusinessCard({ business, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.businessCard}>
      {business.logoUrl ? (
        <Image source={{ uri: business.logoUrl }} style={styles.businessLogo} />
      ) : (
        <View style={[styles.businessLogo, { backgroundColor: '#1A3A52', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 32 }}>{getCategoryEmoji(business.category)}</Text>
        </View>
      )}

      <View style={styles.businessInfo}>
        <Text style={styles.businessName} numberOfLines={1}>{business.name}</Text>
        <Text style={styles.businessOwner} numberOfLines={1}>
          {business.ownerName}
        </Text>
        <Text style={styles.businessLocation} numberOfLines={1}>
          📍 {business.city}, {business.state}
        </Text>

        {business.specialOffer && (
          <View style={styles.businessOfferBadge}>
            <Text style={styles.businessOfferText} numberOfLines={1}>
              🎁 Special Offer
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Vendor Card Component
function VendorCard({ vendor, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.vendorCard}>
      {vendor.logoUrl ? (
        <Image source={{ uri: vendor.logoUrl }} style={styles.vendorImage} />
      ) : (
        <View style={[styles.vendorImage, { backgroundColor: '#1A3A52', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 40 }}>{getCategoryEmoji(vendor.category)}</Text>
        </View>
      )}

      <Text style={styles.vendorName} numberOfLines={2}>{vendor.name}</Text>
      
      {vendor.boothNumber && (
        <View style={styles.boothBadge}>
          <Text style={styles.boothText}>Booth {vendor.boothNumber}</Text>
        </View>
      )}

      {vendor.specialOffer && (
        <Text style={styles.vendorOffer} numberOfLines={2}>
          🎁 {vendor.specialOffer}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// Helper function
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#061A2B',
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    color: '#F2D100',
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: '#9FB3C8',
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2238',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#EAF2FF',
    fontSize: 16,
  },
  // Packages Promo Styles
  packagesPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C6D2',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  packagesPromoIcon: {
    fontSize: 32,
  },
  packagesPromoTitle: {
    color: '#061A2B',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  packagesPromoText: {
    color: '#061A2B',
    fontSize: 13,
    opacity: 0.8,
  },
  packagesPromoArrow: {
    color: '#061A2B',
    fontSize: 20,
    fontWeight: '900',
  },
  // My Businesses Button Styles
  myBusinessesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2238',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  myBusinessesButtonIcon: {
    fontSize: 24,
  },
  myBusinessesButtonText: {
    color: '#EAF2FF',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  myBusinessesButtonArrow: {
    color: '#22C6D2',
    fontSize: 18,
    fontWeight: '900',
  },
  // End New Styles
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#0A2238',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterChipActive: {
    backgroundColor: '#22C6D2',
    borderColor: '#22C6D2',
  },
  filterChipText: {
    color: '#9FB3C8',
    fontSize: 14,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#061A2B',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 8,
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
    fontSize: 13,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#F2D100',
  },
  content: {
    flex: 1,
  },
  featuredCard: {
    width: width - 32,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(6, 26, 43, 0.9)',
  },
  featuredBadge: {
    backgroundColor: '#F2D100',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  featuredBadgeText: {
    color: '#061A2B',
    fontSize: 11,
    fontWeight: '900',
  },
  featuredContent: {
    gap: 4,
  },
  featuredTitle: {
    color: '#EAF2FF',
    fontSize: 20,
    fontWeight: '900',
  },
  featuredSubtitle: {
    color: '#9FB3C8',
    fontSize: 13,
  },
  offerBadge: {
    backgroundColor: '#22C6D2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  offerText: {
    color: '#061A2B',
    fontSize: 12,
    fontWeight: '900',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9FB3C8',
  },
  paginationDotActive: {
    backgroundColor: '#F2D100',
    width: 20,
  },
  sectionTitle: {
    color: '#F2D100',
    fontSize: 18,
    fontWeight: '900',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2238',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryPillActive: {
    backgroundColor: '#22C6D2',
    borderColor: '#22C6D2',
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    color: '#9FB3C8',
    fontSize: 13,
    fontWeight: '700',
  },
  categoryTextActive: {
    color: '#061A2B',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  businessCard: {
    width: (width - 48) / 2,
    backgroundColor: '#0A2238',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  businessLogo: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  businessInfo: {
    gap: 4,
  },
  businessName: {
    color: '#EAF2FF',
    fontSize: 15,
    fontWeight: '900',
  },
  businessOwner: {
    color: '#9FB3C8',
    fontSize: 12,
  },
  businessLocation: {
    color: '#9FB3C8',
    fontSize: 11,
  },
  businessOfferBadge: {
    backgroundColor: 'rgba(34, 198, 210, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  businessOfferText: {
    color: '#22C6D2',
    fontSize: 10,
    fontWeight: '700',
  },
  tournamentSection: {
    marginBottom: 24,
  },
  tournamentTitle: {
    color: '#F2D100',
    fontSize: 18,
    fontWeight: '900',
    marginHorizontal: 16,
    marginBottom: 4,
  },
  tournamentSubtitle: {
    color: '#9FB3C8',
    fontSize: 13,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  vendorScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  vendorCard: {
    width: 140,
    backgroundColor: '#0A2238',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  vendorImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  vendorName: {
    color: '#EAF2FF',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 6,
  },
  boothBadge: {
    backgroundColor: '#F2D100',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  boothText: {
    color: '#061A2B',
    fontSize: 10,
    fontWeight: '900',
  },
  vendorOffer: {
    color: '#22C6D2',
    fontSize: 11,
    marginTop: 4,
  },
  mapPlaceholder: {
    padding: 16,
    alignItems: 'center',
  },
  mapTitle: {
    color: '#F2D100',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  mapText: {
    color: '#9FB3C8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  mapListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2238',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  mapListEmoji: {
    fontSize: 24,
  },
  mapListTitle: {
    color: '#EAF2FF',
    fontSize: 15,
    fontWeight: '900',
  },
  mapListAddress: {
    color: '#9FB3C8',
    fontSize: 12,
    marginTop: 2,
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
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#9FB3C8',
    fontSize: 14,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#22C6D2',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#061A2B',
    fontSize: 16,
    fontWeight: '900',
  },
});