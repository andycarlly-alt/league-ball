// app/community/edit-business/[id].tsx - EDIT BUSINESS FORM

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { BusinessCategory, useAppStore } from '../../../src/state/AppStore';

type FormData = {
  name: string;
  category: BusinessCategory;
  description: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  specialOffer: string;
  discountCode: string;
  discountPercent: string;
};

export default function EditBusinessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const businesses = useAppStore((state) => state.businesses);
  const updateBusiness = useAppStore((state) => state.updateBusiness);
  const currentUser = useAppStore((state) => state.currentUser);
  const players = useAppStore((state) => state.players);

  const business = businesses.find((b) => b.id === id);
  const userPlayer = players.find((p) => p.userId === currentUser.id);

  // Check authorization
  const isOwner = business && (
    business.ownerId === userPlayer?.id || 
    business.ownerName === currentUser.name
  );

  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: 'RESTAURANT',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    specialOffer: '',
    discountCode: '',
    discountPercent: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Load business data
  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name,
        category: business.category,
        description: business.description,
        phone: business.phone || '',
        email: business.email || '',
        website: business.website || '',
        address: business.address,
        city: business.city,
        state: business.state,
        zipCode: business.zipCode || '',
        specialOffer: business.specialOffer || '',
        discountCode: business.discountCode || '',
        discountPercent: business.discountPercent ? String(business.discountPercent) : '',
      });
    }
  }, [business]);

  if (!business) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Business Not Found</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>This business could not be found.</Text>
        </View>
      </View>
    );
  }

  if (!isOwner) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Unauthorized</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You don't have permission to edit this business.</Text>
        </View>
      </View>
    );
  }

  const categories: { key: BusinessCategory; label: string; emoji: string }[] = [
    { key: 'RESTAURANT', label: 'Restaurant', emoji: '🍔' },
    { key: 'SPORTS_GEAR', label: 'Sports Gear', emoji: '⚽' },
    { key: 'FITNESS', label: 'Fitness', emoji: '💪' },
    { key: 'MEDICAL', label: 'Medical', emoji: '🏥' },
    { key: 'AUTOMOTIVE', label: 'Automotive', emoji: '🚗' },
    { key: 'REAL_ESTATE', label: 'Real Estate', emoji: '🏠' },
    { key: 'CONSTRUCTION', label: 'Construction', emoji: '🔨' },
    { key: 'PROFESSIONAL_SERVICES', label: 'Professional Services', emoji: '💼' },
    { key: 'RETAIL', label: 'Retail', emoji: '🛍️' },
    { key: 'ENTERTAINMENT', label: 'Entertainment', emoji: '🎉' },
    { key: 'OTHER', label: 'Other', emoji: '🏢' },
  ];

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Invalid email address';
    }

    if (formData.phone && !/^\d{3}-?\d{3}-?\d{4}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }

    try {
      updateBusiness(business.id, {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        website: formData.website.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim() || undefined,
        specialOffer: formData.specialOffer.trim() || undefined,
        discountCode: formData.discountCode.trim() || undefined,
        discountPercent: formData.discountPercent ? parseInt(formData.discountPercent) : undefined,
      });

      Alert.alert(
        'Success!',
        'Your business has been updated.',
        [
          {
            text: 'View Business',
            onPress: () => router.push(`/community/business/${business.id}`),
          },
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update business. Please try again.');
      console.error('Error updating business:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Business</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Featured Status */}
        {business.isFeatured && (
          <View style={styles.featuredNotice}>
            <Text style={styles.featuredNoticeIcon}>⭐</Text>
            <Text style={styles.featuredNoticeText}>
              This is a featured business listing
            </Text>
          </View>
        )}

        {/* Category Selection */}
        <Text style={styles.sectionTitle}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => updateField('category', cat.key)}
              style={[
                styles.categoryButton,
                formData.category === cat.key && styles.categoryButtonActive,
              ]}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  formData.category === cat.key && styles.categoryLabelActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Business Name */}
        <Text style={styles.label}>Business Name *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="e.g., Andy's Sports Grill"
          placeholderTextColor="#9FB3C8"
          value={formData.name}
          onChangeText={(text) => updateField('name', text)}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        {/* Description */}
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.textArea, errors.description && styles.inputError]}
          placeholder="Tell players about your business..."
          placeholderTextColor="#9FB3C8"
          value={formData.description}
          onChangeText={(text) => updateField('description', text)}
          multiline
          numberOfLines={4}
        />
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

        {/* Contact Information */}
        <Text style={styles.sectionTitle}>Contact Information</Text>

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          placeholder="(410) 555-0123"
          placeholderTextColor="#9FB3C8"
          value={formData.phone}
          onChangeText={(text) => updateField('phone', text)}
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="contact@yourbusiness.com"
          placeholderTextColor="#9FB3C8"
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <Text style={styles.label}>Website</Text>
        <TextInput
          style={styles.input}
          placeholder="www.yourbusiness.com"
          placeholderTextColor="#9FB3C8"
          value={formData.website}
          onChangeText={(text) => updateField('website', text)}
          keyboardType="url"
          autoCapitalize="none"
        />

        {/* Location */}
        <Text style={styles.sectionTitle}>Location</Text>

        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={[styles.input, errors.address && styles.inputError]}
          placeholder="123 Main Street"
          placeholderTextColor="#9FB3C8"
          value={formData.address}
          onChangeText={(text) => updateField('address', text)}
        />
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              placeholder="Baltimore"
              placeholderTextColor="#9FB3C8"
              value={formData.city}
              onChangeText={(text) => updateField('city', text)}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={[styles.input, errors.state && styles.inputError]}
              placeholder="MD"
              placeholderTextColor="#9FB3C8"
              value={formData.state}
              onChangeText={(text) => updateField('state', text.toUpperCase())}
              maxLength={2}
              autoCapitalize="characters"
            />
            {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
          </View>
        </View>

        <Text style={styles.label}>Zip Code</Text>
        <TextInput
          style={styles.input}
          placeholder="21201"
          placeholderTextColor="#9FB3C8"
          value={formData.zipCode}
          onChangeText={(text) => updateField('zipCode', text)}
          keyboardType="number-pad"
          maxLength={5}
        />

        {/* Special Offer (Optional) */}
        <Text style={styles.sectionTitle}>Special Offer (Optional)</Text>

        <Text style={styles.label}>Offer Description</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 20% off for NVT players"
          placeholderTextColor="#9FB3C8"
          value={formData.specialOffer}
          onChangeText={(text) => updateField('specialOffer', text)}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Discount Code</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., NVT20"
              placeholderTextColor="#9FB3C8"
              value={formData.discountCode}
              onChangeText={(text) => updateField('discountCode', text.toUpperCase())}
              autoCapitalize="characters"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Discount %</Text>
            <TextInput
              style={styles.input}
              placeholder="20"
              placeholderTextColor="#9FB3C8"
              value={formData.discountPercent}
              onChangeText={(text) => updateField('discountPercent', text)}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
        </View>

        {/* Analytics Info */}
        <View style={styles.analyticsInfo}>
          <Text style={styles.analyticsInfoTitle}>📊 Current Performance</Text>
          <View style={styles.analyticsStats}>
            <View style={styles.analyticsStat}>
              <Text style={styles.analyticsStatValue}>{business.views}</Text>
              <Text style={styles.analyticsStatLabel}>Views</Text>
            </View>
            <View style={styles.analyticsStat}>
              <Text style={styles.analyticsStatValue}>{business.clicks}</Text>
              <Text style={styles.analyticsStatLabel}>Clicks</Text>
            </View>
            <View style={styles.analyticsStat}>
              <Text style={styles.analyticsStatValue}>{business.saves}</Text>
              <Text style={styles.analyticsStatLabel}>Saves</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Save Changes</Text>
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
    padding: 16,
  },
  featuredNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 209, 0, 0.2)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(242, 209, 0, 0.4)',
    gap: 12,
  },
  featuredNoticeIcon: {
    fontSize: 24,
  },
  featuredNoticeText: {
    color: '#F2D100',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  sectionTitle: {
    color: '#F2D100',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 12,
  },
  categoryScroll: {
    paddingVertical: 8,
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#0A2238',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 100,
  },
  categoryButtonActive: {
    backgroundColor: '#22C6D2',
    borderColor: '#22C6D2',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  categoryLabel: {
    color: '#9FB3C8',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryLabelActive: {
    color: '#061A2B',
  },
  label: {
    color: '#EAF2FF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#0A2238',
    borderRadius: 12,
    padding: 14,
    color: '#EAF2FF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    backgroundColor: '#0A2238',
    borderRadius: 12,
    padding: 14,
    color: '#EAF2FF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#D33B3B',
  },
  errorText: {
    color: '#D33B3B',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  analyticsInfo: {
    backgroundColor: '#0A2238',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  analyticsInfoTitle: {
    color: '#F2D100',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  analyticsStats: {
    flexDirection: 'row',
    gap: 12,
  },
  analyticsStat: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(34, 198, 210, 0.1)',
    borderRadius: 10,
  },
  analyticsStatValue: {
    color: '#22C6D2',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  analyticsStatLabel: {
    color: '#9FB3C8',
    fontSize: 11,
  },
  footer: {
    padding: 16,
    backgroundColor: '#0A2238',
    borderTopWidth: 1,
    borderTopColor: '#1A3A52',
  },
  submitButton: {
    backgroundColor: '#22C6D2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#061A2B',
    fontSize: 16,
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