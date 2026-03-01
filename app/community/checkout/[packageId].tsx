// app/community/checkout/[packageId].tsx - CHECKOUT PAGE

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppStore } from '../../../src/state/AppStore';

export default function CheckoutScreen() {
  const { packageId } = useLocalSearchParams<{ packageId: string }>();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'CARD'>('WALLET');

  const vendorPackages = useAppStore((state) => state.vendorPackages);
  const walletBalance = useAppStore((state) => state.walletBalance);
  const deductFromWallet = useAppStore((state) => state.deductFromWallet);
  const createPaymentIntent = useAppStore((state) => state.createPaymentIntent);
  const currentUser = useAppStore((state) => state.currentUser);

  const selectedPackage = vendorPackages.find((p) => p.id === packageId);

  if (!selectedPackage) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Package Not Found</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>This package could not be found.</Text>
        </View>
      </View>
    );
  }

  const hasEnoughBalance = walletBalance >= selectedPackage.price;

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      if (paymentMethod === 'WALLET') {
        if (!hasEnoughBalance) {
          Alert.alert(
            'Insufficient Funds',
            `You need $${((selectedPackage.price - walletBalance) / 100).toFixed(2)} more in your wallet.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Add Funds', onPress: () => router.push('/billing') },
            ]
          );
          setIsProcessing(false);
          return;
        }

        // Deduct from wallet
        deductFromWallet(selectedPackage.price);

        // Create payment record
        createPaymentIntent({
          type: 'BUSINESS_LISTING',
          amount: selectedPackage.price,
          meta: {
            packageId: selectedPackage.id,
            packageName: selectedPackage.name,
            userId: currentUser.id,
          },
        });

        // Success
        setTimeout(() => {
          setIsProcessing(false);
          Alert.alert(
            'Success! 🎉',
            `You've successfully purchased the ${selectedPackage.name} package!`,
            [
              {
                text: 'View My Businesses',
                onPress: () => router.push('/(tabs)/messages'),
              },
            ]
          );
        }, 1500);
      } else {
        // Card payment simulation
        setTimeout(() => {
          setIsProcessing(false);
          Alert.alert(
            'Payment Processed',
            'Card payment would be processed through Stripe here.',
            [
              {
                text: 'OK',
                onPress: () => router.push('/(tabs)/messages'),
              },
            ]
          );
        }, 2000);
      }
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', 'Payment failed. Please try again.');
      console.error('Payment error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Package Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Package Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Package</Text>
            <Text style={styles.summaryValue}>{selectedPackage.name}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Type</Text>
            <Text style={styles.summaryValue}>
              {selectedPackage.type.replace('_', ' ')}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Listings Included</Text>
            <Text style={styles.summaryValue}>{selectedPackage.includedListings}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ${(selectedPackage.price / 100).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Features Included */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>✨ What's Included</Text>
          {selectedPackage.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Payment Method Selection */}
        <View style={styles.paymentMethodCard}>
          <Text style={styles.paymentMethodTitle}>Payment Method</Text>

          {/* Wallet Option */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('WALLET')}
            style={[
              styles.paymentOption,
              paymentMethod === 'WALLET' && styles.paymentOptionActive,
            ]}
          >
            <View style={styles.radioButton}>
              {paymentMethod === 'WALLET' && <View style={styles.radioButtonInner} />}
            </View>
            <View style={styles.paymentOptionContent}>
              <Text style={styles.paymentOptionTitle}>💰 Wallet Balance</Text>
              <Text style={[
                styles.paymentOptionBalance,
                !hasEnoughBalance && styles.paymentOptionBalanceInsufficient,
              ]}>
                Available: ${(walletBalance / 100).toFixed(2)}
              </Text>
              {!hasEnoughBalance && (
                <Text style={styles.insufficientText}>
                  Insufficient funds. Need $
                  {((selectedPackage.price - walletBalance) / 100).toFixed(2)} more.
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Card Option */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('CARD')}
            style={[
              styles.paymentOption,
              paymentMethod === 'CARD' && styles.paymentOptionActive,
            ]}
          >
            <View style={styles.radioButton}>
              {paymentMethod === 'CARD' && <View style={styles.radioButtonInner} />}
            </View>
            <View style={styles.paymentOptionContent}>
              <Text style={styles.paymentOptionTitle}>💳 Credit/Debit Card</Text>
              <Text style={styles.paymentOptionSubtitle}>
                Secure payment via Stripe
              </Text>
            </View>
          </TouchableOpacity>

          {/* Add Funds Link */}
          {paymentMethod === 'WALLET' && !hasEnoughBalance && (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/billing')}
              style={styles.addFundsLink}
            >
              <Text style={styles.addFundsLinkText}>+ Add Funds to Wallet</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Terms */}
        <View style={styles.termsCard}>
          <Text style={styles.termsText}>
            By completing this purchase, you agree to our Terms of Service and Privacy Policy. 
            Your subscription will {selectedPackage.type === 'MONTHLY' ? 'renew monthly' : 
            selectedPackage.type === 'ANNUAL' ? 'renew annually' : 'be active for the tournament duration'}.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handlePayment}
          disabled={isProcessing || (paymentMethod === 'WALLET' && !hasEnoughBalance)}
          style={[
            styles.payButton,
            (isProcessing || (paymentMethod === 'WALLET' && !hasEnoughBalance)) && 
            styles.payButtonDisabled,
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator color="#061A2B" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay ${(selectedPackage.price / 100).toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  summaryCard: {
    backgroundColor: '#0A2238',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  summaryTitle: {
    color: '#F2D100',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#9FB3C8',
    fontSize: 14,
  },
  summaryValue: {
    color: '#EAF2FF',
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 12,
  },
  totalLabel: {
    color: '#EAF2FF',
    fontSize: 18,
    fontWeight: '900',
  },
  totalValue: {
    color: '#22C6D2',
    fontSize: 24,
    fontWeight: '900',
  },
  featuresCard: {
    backgroundColor: '#0A2238',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featuresTitle: {
    color: '#F2D100',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    marginBottom: 8,
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
  paymentMethodCard: {
    backgroundColor: '#0A2238',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  paymentMethodTitle: {
    color: '#F2D100',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  paymentOptionActive: {
    borderColor: '#22C6D2',
    backgroundColor: 'rgba(34, 198, 210, 0.1)',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#22C6D2',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C6D2',
  },
  paymentOptionContent: {
    flex: 1,
  },
  paymentOptionTitle: {
    color: '#EAF2FF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  paymentOptionSubtitle: {
    color: '#9FB3C8',
    fontSize: 13,
  },
  paymentOptionBalance: {
    color: '#22C6D2',
    fontSize: 13,
    fontWeight: '700',
  },
  paymentOptionBalanceInsufficient: {
    color: '#D33B3B',
  },
  insufficientText: {
    color: '#D33B3B',
    fontSize: 12,
    marginTop: 4,
  },
  addFundsLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  addFundsLinkText: {
    color: '#22C6D2',
    fontSize: 14,
    fontWeight: '900',
  },
  termsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(34, 198, 210, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 198, 210, 0.3)',
  },
  termsText: {
    color: '#9FB3C8',
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    backgroundColor: '#0A2238',
    borderTopWidth: 1,
    borderTopColor: '#1A3A52',
  },
  payButton: {
    backgroundColor: '#22C6D2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#1A3A52',
    opacity: 0.5,
  },
  payButtonText: {
    color: '#061A2B',
    fontSize: 18,
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
  },
});
