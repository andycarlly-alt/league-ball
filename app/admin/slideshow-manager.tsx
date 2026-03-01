// app/admin/slideshow-manager.tsx - ADMIN SLIDESHOW MANAGEMENT

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppStore } from '../../src/state/AppStore';

export default function SlideshowManagerScreen() {
  const router = useRouter();
  const { currentUser, can } = useAppStore() as any;
  
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
  const [showAddSponsorModal, setShowAddSponsorModal] = useState(false);
  
  // Form states for new announcement
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annActionText, setAnnActionText] = useState('');
  const [annUrgent, setAnnUrgent] = useState(false);
  const [annStartDate, setAnnStartDate] = useState('');
  const [annEndDate, setAnnEndDate] = useState('');
  
  // Form states for new sponsor
  const [sponsorCompany, setSponsorCompany] = useState('');
  const [sponsorTagline, setSponsorTagline] = useState('');
  const [sponsorOffer, setSponsorOffer] = useState('');
  const [sponsorTier, setSponsorTier] = useState<'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'>('SILVER');
  const [sponsorFeatured, setSponsorFeatured] = useState(false);
  const [sponsorColor, setSponsorColor] = useState('#F2D100');
  
  // NVT League Announcements (sample data - in production, load from AppStore)
  const [announcements, setAnnouncements] = useState([
    {
      id: 'ann_1',
      title: 'NVT Veterans League - Spring 2026',
      message: 'Spring season is underway! Check standings and upcoming matches.',
      actionText: 'View Schedule',
      urgent: false,
      active: true,
      startDate: '2026-02-01',
      endDate: '2026-05-31',
    },
    {
      id: 'ann_2',
      title: 'Game Day Protocols',
      message: 'All players must check-in 30 minutes before kickoff using face recognition.',
      actionText: 'Learn More',
      urgent: false,
      active: true,
      startDate: '2026-02-01',
      endDate: '2026-12-31',
    },
  ]);
  
  // NVT League Sponsors (sample data - in production, load from AppStore)
  const [sponsors, setSponsors] = useState([
    {
      id: 'sponsor_1',
      company: 'ATEM Foundation',
      tagline: 'Supporting Our Veterans',
      offer: 'Proud Sponsor of NVT Veterans League',
      tier: 'PLATINUM' as const,
      featured: true,
      color: '#34C759',
      active: true,
    },
    {
      id: 'sponsor_2',
      company: 'AFOSMA Foundation',
      tagline: 'Building Stronger Communities',
      offer: 'Official Community Partner',
      tier: 'PLATINUM' as const,
      featured: true,
      color: '#22C6D2',
      active: true,
    },
    {
      id: 'sponsor_3',
      company: 'JB Atlantic',
      tagline: 'Excellence in Service',
      offer: '15% Discount for League Members',
      tier: 'GOLD' as const,
      featured: true,
      color: '#F2D100',
      active: true,
    },
    {
      id: 'sponsor_4',
      company: 'BSF Bereavement',
      tagline: 'Compassionate Support Services',
      offer: 'Free Consultation for Veterans',
      tier: 'GOLD' as const,
      featured: true,
      color: '#9B59B6',
      active: true,
    },
    {
      id: 'sponsor_5',
      company: 'Veterans Auto Repair',
      tagline: 'Quality Service for Our Heroes',
      offer: '10% Off for League Members',
      tier: 'SILVER' as const,
      featured: false,
      color: '#E74C3C',
      active: true,
    },
  ]);

  // Check admin access
  if (!can("VIEW_ADMIN")) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 20, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#FF3B30", fontSize: 24, fontWeight: "900", marginBottom: 16 }}>
          🔒 Access Denied
        </Text>
        <Text style={{ color: "#9FB3C8", textAlign: "center", marginBottom: 24 }}>
          You need admin permissions to manage slideshow content
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: "#22C6D2", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
        >
          <Text style={{ color: "#061A2B", fontWeight: "900" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddAnnouncement = () => {
    if (!annTitle.trim() || !annMessage.trim()) {
      Alert.alert('Error', 'Title and message are required');
      return;
    }

    const newAnn = {
      id: `ann_${Date.now()}`,
      title: annTitle,
      message: annMessage,
      actionText: annActionText,
      urgent: annUrgent,
      active: true,
      startDate: annStartDate || new Date().toISOString().split('T')[0],
      endDate: annEndDate || '',
    };

    setAnnouncements([...announcements, newAnn]);
    
    // Reset form
    setAnnTitle('');
    setAnnMessage('');
    setAnnActionText('');
    setAnnUrgent(false);
    setAnnStartDate('');
    setAnnEndDate('');
    setShowAddAnnouncementModal(false);
    
    Alert.alert('✅ Success', 'Announcement added to slideshow');
  };

  const handleAddSponsor = () => {
    if (!sponsorCompany.trim()) {
      Alert.alert('Error', 'Company name is required');
      return;
    }

    const newSponsor = {
      id: `sponsor_${Date.now()}`,
      company: sponsorCompany,
      tagline: sponsorTagline,
      offer: sponsorOffer,
      tier: sponsorTier,
      featured: sponsorFeatured,
      color: sponsorColor,
      active: true,
    };

    setSponsors([...sponsors, newSponsor]);
    
    // Reset form
    setSponsorCompany('');
    setSponsorTagline('');
    setSponsorOffer('');
    setSponsorTier('SILVER');
    setSponsorFeatured(false);
    setSponsorColor('#F2D100');
    setShowAddSponsorModal(false);
    
    Alert.alert('✅ Success', 'Sponsor added to slideshow');
  };

  const toggleAnnouncementActive = (id: string) => {
    setAnnouncements(announcements.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    ));
  };

  const toggleSponsorActive = (id: string) => {
    setSponsors(sponsors.map(s => 
      s.id === id ? { ...s, active: !s.active } : s
    ));
  };

  const deleteAnnouncement = (id: string) => {
    Alert.alert(
      'Delete Announcement?',
      'This will remove it from the slideshow.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setAnnouncements(announcements.filter(a => a.id !== id)),
        },
      ]
    );
  };

  const deleteSponsor = (id: string) => {
    Alert.alert(
      'Remove Sponsor?',
      'This will remove them from the slideshow.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setSponsors(sponsors.filter(s => s.id !== id)),
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16 }}>
              ← Back to Admin Portal
            </Text>
          </TouchableOpacity>
          <Text style={{ color: "#F2D100", fontSize: 28, fontWeight: "900", marginTop: 16 }}>
            Slideshow Manager
          </Text>
          <Text style={{ color: "#9FB3C8", marginTop: 8 }}>
            Manage announcements and featured sponsors
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <View style={{
            flex: 1,
            backgroundColor: "#0A2238",
            padding: 16,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: "rgba(52,199,89,0.3)",
          }}>
            <Text style={{ color: "#34C759", fontSize: 12, fontWeight: "900" }}>Active Announcements</Text>
            <Text style={{ color: "#34C759", fontSize: 32, fontWeight: "900", marginTop: 4 }}>
              {announcements.filter(a => a.active).length}
            </Text>
          </View>

          <View style={{
            flex: 1,
            backgroundColor: "#0A2238",
            padding: 16,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: "rgba(242,209,0,0.3)",
          }}>
            <Text style={{ color: "#F2D100", fontSize: 12, fontWeight: "900" }}>Featured Sponsors</Text>
            <Text style={{ color: "#F2D100", fontSize: 32, fontWeight: "900", marginTop: 4 }}>
              {sponsors.filter(s => s.featured && s.active).length}
            </Text>
          </View>
        </View>

        {/* ANNOUNCEMENTS SECTION */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ color: "#F2D100", fontSize: 20, fontWeight: "900" }}>
              📢 Announcements
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddAnnouncementModal(true)}
              style={{
                backgroundColor: "#34C759",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 13 }}>
                + Add New
              </Text>
            </TouchableOpacity>
          </View>

          {announcements.length === 0 ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ fontSize: 48 }}>📢</Text>
              <Text style={{ color: "#9FB3C8", marginTop: 16 }}>No announcements yet</Text>
            </View>
          ) : (
            announcements.map((ann) => (
              <View
                key={ann.id}
                style={{
                  backgroundColor: ann.active ? "rgba(52,199,89,0.1)" : "rgba(159,179,200,0.1)",
                  borderWidth: 2,
                  borderColor: ann.urgent ? "#FF3B30" : ann.active ? "rgba(52,199,89,0.3)" : "rgba(159,179,200,0.3)",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      {ann.urgent && (
                        <View style={{
                          backgroundColor: "#FF3B30",
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          borderRadius: 6,
                        }}>
                          <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "900" }}>URGENT</Text>
                        </View>
                      )}
                      <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                        {ann.title}
                      </Text>
                    </View>
                    <Text style={{ color: "#9FB3C8", fontSize: 13, marginTop: 6 }}>
                      {ann.message}
                    </Text>
                    {ann.actionText && (
                      <Text style={{ color: "#22C6D2", fontSize: 12, marginTop: 4 }}>
                        Action: {ann.actionText}
                      </Text>
                    )}
                    <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 8 }}>
                      {ann.startDate} {ann.endDate && `→ ${ann.endDate}`}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end", gap: 8 }}>
                    <Switch
                      value={ann.active}
                      onValueChange={() => toggleAnnouncementActive(ann.id)}
                      trackColor={{ false: "#767577", true: "#34C759" }}
                      thumbColor="#FFF"
                    />
                    <TouchableOpacity onPress={() => deleteAnnouncement(ann.id)}>
                      <Text style={{ color: "#FF3B30", fontSize: 24 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* SPONSORS SECTION */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ color: "#F2D100", fontSize: 20, fontWeight: "900" }}>
              🏪 Featured Sponsors
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddSponsorModal(true)}
              style={{
                backgroundColor: "#34C759",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 13 }}>
                + Add Sponsor
              </Text>
            </TouchableOpacity>
          </View>

          {sponsors.length === 0 ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ fontSize: 48 }}>🏪</Text>
              <Text style={{ color: "#9FB3C8", marginTop: 16 }}>No sponsors yet</Text>
            </View>
          ) : (
            sponsors.map((sponsor) => (
              <View
                key={sponsor.id}
                style={{
                  backgroundColor: sponsor.active ? `${sponsor.color}10` : "rgba(159,179,200,0.1)",
                  borderWidth: 2,
                  borderColor: sponsor.active ? sponsor.color : "rgba(159,179,200,0.3)",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{
                        backgroundColor: sponsor.color,
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: 6,
                      }}>
                        <Text style={{ color: "#061A2B", fontSize: 10, fontWeight: "900" }}>
                          {sponsor.tier}
                        </Text>
                      </View>
                      {sponsor.featured && (
                        <Text style={{ fontSize: 16 }}>⭐</Text>
                      )}
                      <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                        {sponsor.company}
                      </Text>
                    </View>
                    <Text style={{ color: "#9FB3C8", fontSize: 13, marginTop: 6 }}>
                      {sponsor.tagline}
                    </Text>
                    {sponsor.offer && (
                      <Text style={{ color: sponsor.color, fontSize: 13, marginTop: 4, fontWeight: "900" }}>
                        🎁 {sponsor.offer}
                      </Text>
                    )}
                  </View>

                  <View style={{ alignItems: "flex-end", gap: 8 }}>
                    <Switch
                      value={sponsor.active}
                      onValueChange={() => toggleSponsorActive(sponsor.id)}
                      trackColor={{ false: "#767577", true: "#34C759" }}
                      thumbColor="#FFF"
                    />
                    <TouchableOpacity onPress={() => deleteSponsor(sponsor.id)}>
                      <Text style={{ color: "#FF3B30", fontSize: 24 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Info Section */}
        <View style={{
          backgroundColor: "rgba(34,198,210,0.1)",
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#22C6D2",
        }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", marginBottom: 8 }}>
            💡 How Slideshow Works
          </Text>
          <Text style={{ color: "#9FB3C8", fontSize: 13, lineHeight: 20 }}>
            • Slides auto-rotate every 6 seconds{'\n'}
            • Urgent announcements appear first{'\n'}
            • Featured sponsors (Gold/Platinum) appear in rotation{'\n'}
            • Users can swipe to navigate manually{'\n'}
            • Inactive items won't appear in slideshow
          </Text>
        </View>
      </ScrollView>

      {/* ADD ANNOUNCEMENT MODAL */}
      <Modal
        visible={showAddAnnouncementModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddAnnouncementModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: "#0A2238",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              maxHeight: "90%",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
              <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>📢 New Announcement</Text>
              <TouchableOpacity onPress={() => setShowAddAnnouncementModal(false)}>
                <Text style={{ color: "#9FB3C8", fontSize: 32 }}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 20 }}>
              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>Title *</Text>
                <TextInput
                  value={annTitle}
                  onChangeText={setAnnTitle}
                  placeholder="PLAYOFF BRACKETS ANNOUNCED"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={{
                    backgroundColor: "#0B2842",
                    color: "#EAF2FF",
                    padding: 14,
                    borderRadius: 12,
                    fontWeight: "900",
                    fontSize: 16,
                  }}
                />
              </View>

              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>Message *</Text>
                <TextInput
                  value={annMessage}
                  onChangeText={setAnnMessage}
                  placeholder="Semi-Finals start March 15th..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: "#0B2842",
                    color: "#EAF2FF",
                    padding: 14,
                    borderRadius: 12,
                    fontSize: 14,
                    minHeight: 80,
                  }}
                />
              </View>

              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>Action Button Text</Text>
                <TextInput
                  value={annActionText}
                  onChangeText={setAnnActionText}
                  placeholder="View Schedule"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={{
                    backgroundColor: "#0B2842",
                    color: "#EAF2FF",
                    padding: 14,
                    borderRadius: 12,
                    fontSize: 14,
                  }}
                />
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Mark as Urgent</Text>
                <Switch
                  value={annUrgent}
                  onValueChange={setAnnUrgent}
                  trackColor={{ false: "#767577", true: "#FF3B30" }}
                  thumbColor="#FFF"
                />
              </View>

              {annUrgent && (
                <View style={{
                  backgroundColor: "rgba(255,59,48,0.1)",
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#FF3B30",
                }}>
                  <Text style={{ color: "#FF3B30", fontSize: 12 }}>
                    ⚠️ Urgent announcements appear first and have red styling
                  </Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              onPress={handleAddAnnouncement}
              disabled={!annTitle || !annMessage}
              style={{
                backgroundColor: annTitle && annMessage ? "#34C759" : "rgba(255,255,255,0.1)",
                padding: 16,
                borderRadius: 14,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  color: annTitle && annMessage ? "#FFF" : "#9FB3C8",
                  fontWeight: "900",
                  fontSize: 18,
                }}
              >
                Add Announcement
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ADD SPONSOR MODAL */}
      <Modal
        visible={showAddSponsorModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddSponsorModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: "#0A2238",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              maxHeight: "90%",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
              <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>🏪 New Sponsor</Text>
              <TouchableOpacity onPress={() => setShowAddSponsorModal(false)}>
                <Text style={{ color: "#9FB3C8", fontSize: 32 }}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 20 }}>
              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>Company Name *</Text>
                <TextInput
                  value={sponsorCompany}
                  onChangeText={setSponsorCompany}
                  placeholder="SoccerPro Sports"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={{
                    backgroundColor: "#0B2842",
                    color: "#EAF2FF",
                    padding: 14,
                    borderRadius: 12,
                    fontWeight: "900",
                    fontSize: 16,
                  }}
                />
              </View>

              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>Tagline</Text>
                <TextInput
                  value={sponsorTagline}
                  onChangeText={setSponsorTagline}
                  placeholder="Official Equipment Partner"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={{
                    backgroundColor: "#0B2842",
                    color: "#EAF2FF",
                    padding: 14,
                    borderRadius: 12,
                    fontSize: 14,
                  }}
                />
              </View>

              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>Special Offer</Text>
                <TextInput
                  value={sponsorOffer}
                  onChangeText={setSponsorOffer}
                  placeholder="20% OFF ALL CLEATS"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={{
                    backgroundColor: "#0B2842",
                    color: "#EAF2FF",
                    padding: 14,
                    borderRadius: 12,
                    fontSize: 14,
                  }}
                />
              </View>

              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>Sponsorship Tier</Text>
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  {(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const).map((tier) => (
                    <TouchableOpacity
                      key={tier}
                      onPress={() => setSponsorTier(tier)}
                      style={{
                        backgroundColor: sponsorTier === tier ? "#F2D100" : "#0B2842",
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{
                        color: sponsorTier === tier ? "#061A2B" : "#9FB3C8",
                        fontWeight: "900",
                      }}>
                        {tier}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Featured in Slideshow</Text>
                <Switch
                  value={sponsorFeatured}
                  onValueChange={setSponsorFeatured}
                  trackColor={{ false: "#767577", true: "#F2D100" }}
                  thumbColor="#FFF"
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={handleAddSponsor}
              disabled={!sponsorCompany}
              style={{
                backgroundColor: sponsorCompany ? "#34C759" : "rgba(255,255,255,0.1)",
                padding: 16,
                borderRadius: 14,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  color: sponsorCompany ? "#FFF" : "#9FB3C8",
                  fontWeight: "900",
                  fontSize: 18,
                }}
              >
                Add Sponsor
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}