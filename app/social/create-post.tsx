// app/social/create-post.tsx

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppStore } from '../../src/state/AppStore';
import { normalize, spacing } from '../../src/utils/responsive';

export default function CreatePostScreen() {
  const router = useRouter();
  const currentUser = useAppStore((state) => state.currentUser);
  const players = useAppStore((state) => state.players);
  const teams = useAppStore((state) => state.teams);
  const createPost = useAppStore((state) => state.createPost);

  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postType, setPostType] = useState<'TEXT' | 'PHOTO' | 'LOCATION'>('TEXT');

  // Get current player and team info
  const currentPlayer = players.find((p) => p.userId === currentUser.id);
  const currentTeam = currentPlayer ? teams.find((t) => t.id === currentPlayer.teamId) : null;

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 4,
    });

    if (!result.canceled) {
      setSelectedMedia(result.assets.map((asset) => asset.uri));
      if (result.assets.length > 0) {
        setPostType('PHOTO');
      }
    }
  };

  const handleAddLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow location access');
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    const geocode = await Location.reverseGeocodeAsync({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    });

    setLocation({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      address: geocode[0]
        ? `${geocode[0].city}, ${geocode[0].region}`
        : 'Unknown location',
      name: geocode[0]?.name || 'Current Location',
    });
    setPostType('LOCATION');
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map((tag) => tag.slice(1).toLowerCase()) : [];
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    // In a real app, you'd resolve these to actual user IDs
    return matches ? matches.map((mention) => mention.slice(1)) : [];
  };

  const handlePost = async () => {
    if (!content.trim() && selectedMedia.length === 0) {
      Alert.alert('Empty Post', 'Please add some content or a photo');
      return;
    }

    setIsPosting(true);

    try {
      // In production, you'd upload media to Firebase Storage here
      // For now, we'll just use the local URIs
      const mediaUrls = selectedMedia; // In prod: await uploadMediaToStorage(selectedMedia)

      createPost({
        type: postType,
        content: content.trim(),
        mediaUrls,
        authorId: currentUser.id,
        authorType: 'USER',
        authorName: currentUser.name,
        authorAvatar: `https://i.pravatar.cc/150?u=${currentUser.id}`,
        teamId: currentTeam?.id,
        teamName: currentTeam?.name,
        leagueId: currentTeam?.leagueId,
        location,
        hashtags: extractHashtags(content),
        mentions: extractMentions(content),
        visibility: 'PUBLIC',
        isPinned: false,
      });

      Alert.alert('Success! 🎉', 'Your post has been shared', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
      console.error('Post creation error:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const removeMedia = (index: number) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
    if (selectedMedia.length === 1) {
      setPostType('TEXT');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity onPress={handlePost} disabled={isPosting}>
          <Text style={[styles.postText, isPosting && styles.postTextDisabled]}>
            {isPosting ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {currentUser.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{currentUser.name}</Text>
            {currentTeam && <Text style={styles.userTeam}>{currentTeam.name}</Text>}
          </View>
        </View>

        {/* Text Input */}
        <TextInput
          style={styles.textInput}
          placeholder="What's happening in NVT League?"
          placeholderTextColor="#9FB3C8"
          multiline
          value={content}
          onChangeText={setContent}
          autoFocus
        />

        {/* Media Preview */}
        {selectedMedia.length > 0 && (
          <View style={styles.mediaContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedMedia.map((uri, index) => (
                <View key={index} style={styles.mediaItem}>
                  <Image source={{ uri }} style={styles.mediaImage} />
                  <TouchableOpacity
                    onPress={() => removeMedia(index)}
                    style={styles.removeMediaButton}
                  >
                    <Text style={styles.removeMediaText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Location Preview */}
        {location && (
          <View style={styles.locationContainer}>
            <View style={styles.locationContent}>
              <Text style={styles.locationIcon}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.locationAddress}>{location.address}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setLocation(null)} style={styles.removeLocation}>
              <Text style={styles.removeLocationText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tips:</Text>
          <Text style={styles.tipsText}>• Use #hashtags to increase visibility</Text>
          <Text style={styles.tipsText}>• @mention players or teams</Text>
          <Text style={styles.tipsText}>• Add photos or location for engagement</Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handlePickImage} style={styles.actionButton}>
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionLabel}>Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAddLocation} style={styles.actionButton}>
          <Text style={styles.actionIcon}>📍</Text>
          <Text style={styles.actionLabel}>Location</Text>
        </TouchableOpacity>

        <View style={styles.actionButton}>
          <Text style={styles.actionIcon}>#</Text>
          <Text style={styles.actionLabel}>Hashtag</Text>
        </View>

        <View style={styles.actionButton}>
          <Text style={styles.actionIcon}>@</Text>
          <Text style={styles.actionLabel}>Mention</Text>
        </View>
      </View>

      {/* Loading Overlay */}
      {isPosting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#F2D100" />
          <Text style={styles.loadingText}>Posting...</Text>
        </View>
      )}
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
  cancelText: {
    color: '#9FB3C8',
    fontSize: normalize(16),
    fontWeight: '700',
  },
  headerTitle: {
    color: '#F2D100',
    fontSize: normalize(18),
    fontWeight: '900',
  },
  postText: {
    color: '#22C6D2',
    fontSize: normalize(16),
    fontWeight: '900',
  },
  postTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  userAvatar: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    backgroundColor: '#F2D100',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: '#061A2B',
    fontSize: normalize(18),
    fontWeight: '900',
  },
  userName: {
    color: '#EAF2FF',
    fontSize: normalize(15),
    fontWeight: '900',
  },
  userTeam: {
    color: '#9FB3C8',
    fontSize: normalize(12),
  },
  textInput: {
    color: '#EAF2FF',
    fontSize: normalize(16),
    lineHeight: normalize(24),
    paddingHorizontal: spacing.lg,
    minHeight: normalize(150),
    textAlignVertical: 'top',
  },
  mediaContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  mediaItem: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  mediaImage: {
    width: normalize(120),
    height: normalize(120),
    borderRadius: normalize(12),
    backgroundColor: '#1A3A52',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeMediaText: {
    color: '#FFF',
    fontSize: normalize(14),
    fontWeight: '900',
  },
  locationContainer: {
    backgroundColor: '#0A2238',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: 'rgba(34, 198, 210, 0.3)',
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  removeLocation: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  removeLocationText: {
    color: '#9FB3C8',
    fontSize: normalize(18),
  },
  tipsContainer: {
    backgroundColor: 'rgba(34, 198, 210, 0.1)',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: 'rgba(34, 198, 210, 0.2)',
  },
  tipsTitle: {
    color: '#22C6D2',
    fontSize: normalize(13),
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  tipsText: {
    color: '#9FB3C8',
    fontSize: normalize(12),
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#1A3A52',
    backgroundColor: '#0A2238',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: normalize(22),
  },
  actionLabel: {
    color: '#9FB3C8',
    fontSize: normalize(11),
    fontWeight: '700',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(6, 26, 43, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#F2D100',
    fontSize: normalize(16),
    fontWeight: '900',
    marginTop: spacing.md,
  },
});