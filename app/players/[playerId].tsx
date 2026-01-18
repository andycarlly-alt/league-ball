import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ageBannerStyle, calcAge, useAppStore } from "../../src/state/AppStore";

export default function PlayerProfileScreen() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>();
  const router = useRouter();
  const { players, teams, tournaments, toggleVerifyPlayer, can } = useAppStore();

  const player = players.find((p) => p.id === playerId);
  const team = teams.find((t) => t.id === player?.teamId);
  const tournament = tournaments.find((t) => t.id === player?.tournamentId);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!player) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A2B", padding: 16 }}>
        <Text style={{ color: "#F2D100", fontSize: 22, fontWeight: "900" }}>Player Profile</Text>
        <Text style={{ color: "#9FB3C8", marginTop: 8 }}>Player not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900" }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const age = calcAge(player.dob) ?? 0;
  const banner = ageBannerStyle(age);
  const canVerify = can("VERIFY_PLAYER");
  const canInvite = can("INVITE_PLAYER");

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera access is needed to capture player photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        setTimeout(() => {
          setPhotoUri(result.assets[0].uri);
          setUploading(false);
          Alert.alert("Photo Captured", "Player photo saved for verification.");
        }, 500);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const uploadPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission Required", "Photo library access is needed.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        setTimeout(() => {
          setPhotoUri(result.assets[0].uri);
          setUploading(false);
          Alert.alert("Photo Uploaded", "Player photo saved successfully.");
        }, 500);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload photo. Please try again.");
    }
  };

  const sendInvite = () => {
    if (!canInvite) {
      Alert.alert("Not Allowed", "Only coaches and team reps can send invites.");
      return;
    }

    Alert.alert(
      "Send Player Invite",
      `Send registration invite to ${player.fullName}?\n\nThey'll receive a link to upload their photo and verify details.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Invite",
          onPress: () => {
            Alert.alert(
              "Invite Sent! 📧",
              `Invite sent to ${player.fullName}\n\nThey can now:\n1. Upload their photo\n2. Confirm DOB\n3. Sign waiver\n\nYou'll be notified when complete.`
            );
          },
        },
      ]
    );
  };

  const handleVerify = () => {
    if (!canVerify) {
      Alert.alert("Not Allowed", "Only admins can verify players.");
      return;
    }

    if (!photoUri && !player.verified) {
      Alert.alert(
        "Photo Recommended",
        "Consider uploading a photo before verification for faster game-day check-in.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Verify Anyway",
            onPress: () => {
              const res = toggleVerifyPlayer(player.id);
              if (!res.ok) {
                Alert.alert("Error", res.reason || "Unable to verify");
              }
            },
          },
        ]
      );
      return;
    }

    const res = toggleVerifyPlayer(player.id);
    if (!res.ok) {
      Alert.alert("Error", res.reason || "Unable to verify");
    } else {
      Alert.alert(
        player.verified ? "Unverified" : "Verified!",
        player.verified
          ? "Player verification removed."
          : "✅ Player verified and ready for game day!"
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ color: "#F2D100", fontSize: 20, fontWeight: "900" }}>Player Profile</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Age Banner */}
        <View style={{ borderRadius: 14, overflow: "hidden" }}>
          <View style={{ backgroundColor: banner.bg, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: banner.fg, fontWeight: "900", fontSize: 16 }}>
              {banner.label} • Age {age}
            </Text>
            {player.verified && (
              <View style={{ backgroundColor: "rgba(255,255,255,0.2)", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 }}>
                <Text style={{ color: banner.fg, fontWeight: "900", fontSize: 12 }}>✓ VERIFIED</Text>
              </View>
            )}
          </View>
        </View>

        {/* Photo Section */}
        <View style={{ backgroundColor: "#0A2238", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16 }}>Player Photo</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 6, lineHeight: 20 }}>
            Photo verification speeds up game-day check-in and prevents fraud.
          </Text>

          {uploading ? (
            <View style={{ marginTop: 14, height: 240, backgroundColor: "#0B2842", borderRadius: 14, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" color="#F2D100" />
              <Text style={{ color: "#9FB3C8", marginTop: 10 }}>Processing...</Text>
            </View>
          ) : photoUri ? (
            <View style={{ marginTop: 14 }}>
              <Image
                source={{ uri: photoUri }}
                style={{ width: "100%", height: 240, borderRadius: 14, backgroundColor: "#0B2842" }}
                resizeMode="cover"
              />
              <Text style={{ color: "#22C6D2", marginTop: 8, fontWeight: "900", textAlign: "center" }}>
                ✓ Photo saved
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: 14, height: 240, backgroundColor: "#0B2842", borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(242,209,0,0.3)", borderStyle: "dashed" }}>
              <Text style={{ color: "#9FB3C8", fontSize: 48 }}>📸</Text>
              <Text style={{ color: "#9FB3C8", marginTop: 10, fontWeight: "900" }}>No photo yet</Text>
            </View>
          )}

          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <TouchableOpacity
              onPress={takePhoto}
              style={{ flex: 1, backgroundColor: "#F2D100", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>📷 Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={uploadPhoto}
              style={{ flex: 1, backgroundColor: "#22C6D2", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>🖼️ Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Player Details */}
        <View style={{ backgroundColor: "#0A2238", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16 }}>Details</Text>

          <View style={{ marginTop: 12, gap: 10 }}>
            <View>
              <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Name</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 18, marginTop: 4 }}>
                {player.fullName}
              </Text>
            </View>

            <View>
              <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Date of Birth</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 4 }}>
                {player.dob || "Not provided"}
              </Text>
            </View>

            <View>
              <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Team</Text>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 4 }}>
                {team?.name || "Unknown"}
              </Text>
            </View>

            {tournament && (
              <View>
                <Text style={{ color: "#9FB3C8", fontSize: 12 }}>Tournament</Text>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginTop: 4 }}>
                  {tournament.name}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Invite Section */}
        {canInvite && (
          <View style={{ backgroundColor: "#0A2238", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16 }}>Player Invite</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
              Send invite so player can upload photo and verify details.
            </Text>

            <TouchableOpacity
              onPress={sendInvite}
              style={{ marginTop: 12, backgroundColor: "#22C6D2", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>📧 Send Invite</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Verification */}
        {canVerify && (
          <View style={{ backgroundColor: "#0A2238", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16 }}>Verification</Text>
            <Text style={{ color: "#9FB3C8", marginTop: 6 }}>
              {player.verified
                ? "Player is verified and ready for game day."
                : "Verify player after checking photo and documentation."}
            </Text>

            <TouchableOpacity
              onPress={handleVerify}
              style={{
                marginTop: 12,
                backgroundColor: player.verified ? "#FF3B30" : "#34C759",
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900" }}>
                {player.verified ? "✗ Unverify" : "✓ Verify Player"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Benefits */}
        <View style={{ backgroundColor: "rgba(34,198,210,0.1)", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(34,198,210,0.3)" }}>
          <Text style={{ color: "#22C6D2", fontWeight: "900", fontSize: 16 }}>⚡ Game Day Benefits</Text>
          <Text style={{ color: "#9FB3C8", marginTop: 8, lineHeight: 20 }}>
            • 30-second check-in vs 5-minute ID check{"\n"}
            • Prevent roster fraud{"\n"}
            • No physical ID needed{"\n"}
            • Digital verification trail
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}