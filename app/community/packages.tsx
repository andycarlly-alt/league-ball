// app/community/packages.tsx - VENDOR PACKAGES PAGE

import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppStore } from '../../src/state/AppStore';

export default function VendorPackagesScreen() {
  const router = useRouter();
  const vendorPackages = useAppStore((state) => state.vendorPackages);
  const walletBalance = useAppStore((state) => state.walletBalance);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendor Packages</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Wallet Balance */}
        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Your Wallet Balance</Text>
          <Text style={styles.walletAmount}>${(walletBalance / 100).toFixed(2)}</Text>
          <TouchableOpacity
            onPress={() => router.push('/billing')}
            style={styles.addFundsButton}
          >
            <Text style={styles.addFundsText}>+ Add Funds</Text>
          </TouchableOpacity>
        </View>

        {/* Intro Section */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>📈 Grow Your Business</Text>
          <Text style={styles.introText}>
            Get more visibility and connect with thousands of NVT players and fans.
            Choose the package that's right for you.
          </Text>
        </View>

        {/* Package Cards */}
        <View style={styles.packagesGrid}>
          {vendorPackages
            .sort((a, b) => a.priority - b.priority)
            .map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} onSelect={() => {
                router.push(`/community/checkout/${pkg.id}`);
              }} />
            ))}
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Why Advertise with NVT?</Text>
          
          <BenefitItem
            icon="👥"
            title="Large Audience"
            description="Reach 1,000+ active players and fans across the DMV"
          />
          
          <BenefitItem
            icon="🎯"
            title="Targeted Marketing"
            description="Connect with sports enthusiasts and community supporters"
          />
          
          <BenefitItem
            icon="📊"
            title="Track Performance"
            description="See views, clicks, and engagement metrics in real-time"
          />
          
          <BenefitItem
            icon="💰"
            title="Affordable Pricing"
            description="Packages starting at just $49/month"
          />
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          
          <FAQItem
            question="How long does my listing stay active?"
            answer="Monthly packages are active for 30 days. Tournament packages last for the duration of the tournament. Annual packages are active for 365 days."
          />
          
          <FAQItem
            question="Can I cancel anytime?"
            answer="Yes! Monthly packages can be canceled anytime. You'll continue to have access until the end of your billing period."
          />
          
          <FAQItem
            question="What payment methods do you accept?"
            answer="We accept wallet balance (loaded via credit/debit card) and direct card payments."
          />
          
          <FAQItem
            question="Can I upgrade my package?"
            answer="Absolutely! Contact support and we'll help you upgrade with prorated pricing."
          />
        </View>
      </ScrollView>
    </View>
  );
}

// Package Card Component
function PackageCard({ package: pkg, onSelect }: any) {
  const getTypeColor = () => {
    switch (pkg.type) {
      case 'MONTHLY': return '#22C6D2';
      case 'TOURNAMENT': return '#F2D100';
      case 'ANNUAL': return '#1FBF75';
      default: return '#9FB3C8';
    }
  };

  const getTypeBadge = () => {
    switch (pkg.type) {
      case 'MONTHLY': return '📅 Monthly';
      case 'TOURNAMENT': return '🏆 Tournament';
      case 'ANNUAL': return '⭐ Annual';
      default: return pkg.type;
    }
  };

  return (
    <View style={[styles.packageCard, pkg.isFeatured && styles.packageCardFeatured]}>
      {pkg.isFeatured && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}

      <View style={[styles.packageTypeBadge, { backgroundColor: getTypeColor() }]}>
        <Text style={styles.packageTypeText}>{getTypeBadge()}</Text>
      </View>

      <Text style={styles.packageName}>{pkg.name}</Text>
      
      <View style={styles.priceContainer}>
        <Text style={styles.priceSymbol}>$</Text>
        <Text style={styles.priceAmount}>{(pkg.price / 100).toFixed(0)}</Text>
        <Text style={styles.pricePeriod}>
          /{pkg.type === 'MONTHLY' ? 'mo' : pkg.type === 'ANNUAL' ? 'yr' : 'event'}
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        {pkg.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.featureCheck}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {pkg.includedListings > 1 && (
        <View style={styles.listingsInfo}>
          <Text style={styles.listingsText}>
            {pkg.includedListings} business listings included
          </Text>
        </View>
      )}

      <TouchableOpacity onPress={onSelect} style={styles.selectButton}>
        <Text style={styles.selectButtonText}>Select Package</Text>
      </TouchableOpacity>
    </View>
  );
}

// Benefit Item Component
function BenefitItem({ icon, title, description }: any) {
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.benefitIcon}>{icon}</Text>
      <View style={styles.benefitContent}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDescription}>{description}</Text>
      </View>
    </View>
  );
}

// FAQ Item Component
function FAQItem({ question, answer }: any) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <TouchableOpacity
      onPress={() => setIsExpanded(!isExpanded)}
      style={styles.faqItem}
    >
      <View style={styles.faqQuestion}>
        <Text style={styles.faqQuestionText}>{question}</Text>
        <Text style={styles.faqIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </View>
      {isExpanded && (
        <Text style={styles.faqAnswer}>{answer}</Text>
      )}
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
  content: {
    flex: 1,
  },
  walletCard: {
    backgroundColor: '#0A2238',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  walletLabel: {
    color: '#9FB3C8',
    fontSize: 14,
    marginBottom: 8,
  },
  walletAmount: {
    color: '#22C6D2',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 12,
  },
  addFundsButton: {
    backgroundColor: '#22C6D2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFundsText: {
    color: '#061A2B',
    fontSize: 14,
    fontWeight: '900',
  },
  introSection: {
    padding: 16,
    paddingTop: 0,
  },
  introTitle: {
    color: '#F2D100',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  introText: {
    color: '#9FB3C8',
    fontSize: 15,
    lineHeight: 22,
  },
  packagesGrid: {
    padding: 16,
    gap: 16,
  },
  packageCard: {
    backgroundColor: '#0A2238',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  packageCardFeatured: {
    borderColor: '#F2D100',
    borderWidth: 3,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#F2D100',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#061A2B',
    fontSize: 11,
    fontWeight: '900',
  },
  packageTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  packageTypeText: {
    color: '#061A2B',
    fontSize: 12,
    fontWeight: '900',
  },
  packageName: {
    color: '#EAF2FF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  priceSymbol: {
    color: '#22C6D2',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 8,
  },
  priceAmount: {
    color: '#22C6D2',
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 48,
  },
  pricePeriod: {
    color: '#9FB3C8',
    fontSize: 16,
    marginTop: 20,
    marginLeft: 4,
  },
  featuresContainer: {
    gap: 10,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureCheck: {
    color: '#22C6D2',
    fontSize: 16,
    fontWeight: '900',
    marginRight: 10,
  },
  featureText: {
    color: '#EAF2FF',
    fontSize: 14,
    flex: 1,
  },
  listingsInfo: {
    backgroundColor: 'rgba(34, 198, 210, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  listingsText: {
    color: '#22C6D2',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  selectButton: {
    backgroundColor: '#22C6D2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#061A2B',
    fontSize: 16,
    fontWeight: '900',
  },
  benefitsSection: {
    padding: 16,
  },
  benefitsTitle: {
    color: '#F2D100',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    backgroundColor: '#0A2238',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  benefitIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    color: '#EAF2FF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  benefitDescription: {
    color: '#9FB3C8',
    fontSize: 14,
    lineHeight: 20,
  },
  faqSection: {
    padding: 16,
  },
  faqTitle: {
    color: '#F2D100',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: '#0A2238',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    color: '#EAF2FF',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  faqIcon: {
    color: '#22C6D2',
    fontSize: 12,
    marginLeft: 12,
  },
  faqAnswer: {
    color: '#9FB3C8',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
});