// app/join/[inviteCode].tsx - MOBILE PLAYER SIGN-UP PAGE

import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function PlayerSignUpPage() {
  const { inviteCode } = useLocalSearchParams<{ inviteCode: string }>();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [frontIdUri, setFrontIdUri] = useState<string | null>(null);
  const [backIdUri, setBackIdUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  
  // Auto-extracted from ID (in production, would use OCR service)
  const [extractedData, setExtractedData] = useState({
    name: "",
    dob: "",
    address: "",
    dlNumber: "",
  });

  const takeOrPickImage = async (type: 'front' | 'back' | 'selfie') => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to upload ID');
      return;
    }

    Alert.alert(
      `Upload ${type === 'front' ? 'Front of ID' : type === 'back' ? 'Back of ID' : 'Selfie'}`,
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 0.8,
              allowsEditing: true,
            });

            if (!result.canceled && result.assets[0]) {
              if (type === 'front') setFrontIdUri(result.assets[0].uri);
              else if (type === 'back') setBackIdUri(result.assets[0].uri);
              else setSelfieUri(result.assets[0].uri);

              // In production: Send to OCR service here
              if (type === 'front') {
                // Simulate OCR extraction
                setTimeout(() => {
                  setExtractedData({
                    name: "John Smith",
                    dob: "1990-03-15",
                    address: "123 Main St, Baltimore, MD",
                    dlNumber: "M123-456-789",
                  });
                }, 1000);
              }
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.8,
              allowsEditing: true,
            });

            if (!result.canceled && result.assets[0]) {
              if (type === 'front') setFrontIdUri(result.assets[0].uri);
              else if (type === 'back') setBackIdUri(result.assets[0].uri);
              else setSelfieUri(result.assets[0].uri);

              // In production: Send to OCR service here
              if (type === 'front') {
                setTimeout(() => {
                  setExtractedData({
                    name: "John Smith",
                    dob: "1990-03-15",
                    address: "123 Main St, Baltimore, MD",
                    dlNumber: "M123-456-789",
                  });
                }, 1000);
              }
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const onSubmit = () => {
    // In production: Send to backend for verification and team assignment
    Alert.alert(
      "✅ Sign-Up Complete!",
      `Thanks ${extractedData.name || fullName}!\n\nYour profile has been submitted for approval. You'll receive a confirmation once the team manager approves your registration.\n\nNext steps:\n• Download NVT League app\n• Complete check-in before match\n• Receive jersey on game day`,
      [
        {
          text: "Download App",
          onPress: () => {
            // Deep link to app store
          },
        },
        {
          text: "Done",
          style: "cancel",
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚽</Text>
          <Text style={{ color: "#F2D100", fontSize: 28, fontWeight: "900", textAlign: "center" }}>
            Join NVT League
          </Text>
          <Text style={{ color: "#9FB3C8", fontSize: 14, marginTop: 6, textAlign: "center" }}>
            Complete your player registration
          </Text>
        </View>

        {/* Progress Steps */}
        <View style={{ flexDirection: "row", marginBottom: 30, gap: 8 }}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              style={{
                flex: 1,
                height: 4,
                backgroundColor: step >= s ? "#34C759" : "rgba(255,255,255,0.2)",
                borderRadius: 2,
              }}
            />
          ))}
        </View>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <View>
            <Text style={{ color: "#EAF2FF", fontSize: 20, fontWeight: "900", marginBottom: 20 }}>
              Step 1: Your Information
            </Text>

            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>
                  Full Name
                </Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="John Smith"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={{
                    backgroundColor: "#0A2238",
                    color: "#EAF2FF",
                    padding: 14,
                    borderRadius: 12,
                    fontSize: 16,
                  }}
                />
              </View>

              <View>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 8 }}>
                  Phone Number
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="phone-pad"
                  style={{
                    backgroundColor: "#0A2238",
                    color: "#EAF2FF",
                    padding: 14,
                    borderRadius: 12,
                    fontSize: 16,
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={() => setStep(2)}
                disabled={!fullName.trim() || !phone.trim()}
                style={{
                  backgroundColor: (fullName.trim() && phone.trim()) ? "#34C759" : "#0A2238",
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <Text style={{
                  color: (fullName.trim() && phone.trim()) ? "#061A2B" : "#9FB3C8",
                  fontWeight: "900",
                  fontSize: 16,
                }}>
                  Continue →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 2: ID Front */}
        {step === 2 && (
          <View>
            <Text style={{ color: "#EAF2FF", fontSize: 20, fontWeight: "900", marginBottom: 12 }}>
              Step 2: Upload ID (Front)
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: 14, marginBottom: 20 }}>
              Take a clear photo of the front of your driver's license or state ID
            </Text>

            {frontIdUri ? (
              <View>
                <Image
                  source={{ uri: frontIdUri }}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 12,
                    marginBottom: 16,
                  }}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  onPress={() => takeOrPickImage('front')}
                  style={{
                    backgroundColor: "#0A2238",
                    padding: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ color: "#22C6D2", fontWeight: "900" }}>
                    Retake Photo
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => takeOrPickImage('front')}
                style={{
                  backgroundColor: "#0A2238",
                  padding: 40,
                  borderRadius: 12,
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "rgba(255,255,255,0.2)",
                  borderStyle: "dashed",
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 48, marginBottom: 12 }}>📸</Text>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>
                  Take or Upload Photo
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 12, textAlign: "center" }}>
                  Front of driver's license or state ID
                </Text>
              </TouchableOpacity>
            )}

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setStep(1)}
                style={{
                  flex: 1,
                  backgroundColor: "#0A2238",
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStep(3)}
                disabled={!frontIdUri}
                style={{
                  flex: 2,
                  backgroundColor: frontIdUri ? "#34C759" : "#0A2238",
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{
                  color: frontIdUri ? "#061A2B" : "#9FB3C8",
                  fontWeight: "900",
                }}>
                  Continue →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 3: ID Back */}
        {step === 3 && (
          <View>
            <Text style={{ color: "#EAF2FF", fontSize: 20, fontWeight: "900", marginBottom: 12 }}>
              Step 3: Upload ID (Back)
            </Text>
            <Text style={{ color: "#9FB3C8", fontSize: 14, marginBottom: 20 }}>
              Take a photo of the back of your ID
            </Text>

            {backIdUri ? (
              <View>
                <Image
                  source={{ uri: backIdUri }}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 12,
                    marginBottom: 16,
                  }}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  onPress={() => takeOrPickImage('back')}
                  style={{
                    backgroundColor: "#0A2238",
                    padding: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ color: "#22C6D2", fontWeight: "900" }}>
                    Retake Photo
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => takeOrPickImage('back')}
                style={{
                  backgroundColor: "#0A2238",
                  padding: 40,
                  borderRadius: 12,
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "rgba(255,255,255,0.2)",
                  borderStyle: "dashed",
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 48, marginBottom: 12 }}>📸</Text>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>
                  Take or Upload Photo
                </Text>
                <Text style={{ color: "#9FB3C8", fontSize: 12, textAlign: "center" }}>
                  Back of your ID
                </Text>
              </TouchableOpacity>
            )}

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setStep(2)}
                style={{
                  flex: 1,
                  backgroundColor: "#0A2238",
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStep(4)}
                disabled={!backIdUri}
                style={{
                  flex: 2,
                  backgroundColor: backIdUri ? "#34C759" : "#0A2238",
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{
                  color: backIdUri ? "#061A2B" : "#9FB3C8",
                  fontWeight: "900",
                }}>
                  Continue →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <View>
            <Text style={{ color: "#EAF2FF", fontSize: 20, fontWeight: "900", marginBottom: 20 }}>
              Step 4: Review & Submit
            </Text>

            {/* Extracted Data */}
            <View style={{
              backgroundColor: "rgba(52,199,89,0.1)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "rgba(52,199,89,0.3)",
            }}>
              <Text style={{ color: "#34C759", fontWeight: "900", marginBottom: 12 }}>
                ✓ ID Verified
              </Text>
              <View style={{ gap: 8 }}>
                <Text style={{ color: "#EAF2FF" }}>
                  <Text style={{ fontWeight: "900" }}>Name:</Text> {extractedData.name || fullName}
                </Text>
                <Text style={{ color: "#EAF2FF" }}>
                  <Text style={{ fontWeight: "900" }}>DOB:</Text> {extractedData.dob}
                </Text>
                <Text style={{ color: "#EAF2FF" }}>
                  <Text style={{ fontWeight: "900" }}>Age:</Text> 33 years old
                </Text>
                <Text style={{ color: "#EAF2FF" }}>
                  <Text style={{ fontWeight: "900" }}>Phone:</Text> {phone}
                </Text>
              </View>
            </View>

            {/* Photos Preview */}
            <View style={{ gap: 12, marginBottom: 20 }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Image source={{ uri: frontIdUri || '' }} style={{ flex: 1, height: 100, borderRadius: 8 }} />
                <Image source={{ uri: backIdUri || '' }} style={{ flex: 1, height: 100, borderRadius: 8 }} />
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={onSubmit}
              style={{
                backgroundColor: "#34C759",
                padding: 18,
                borderRadius: 12,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>
                ✓ Submit Registration
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStep(3)}
              style={{
                backgroundColor: "#0A2238",
                padding: 14,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#9FB3C8", fontWeight: "900" }}>← Back</Text>
            </TouchableOpacity>

            {/* Privacy Notice */}
            <View style={{
              marginTop: 20,
              padding: 14,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 10,
            }}>
              <Text style={{ color: "#9FB3C8", fontSize: 11, lineHeight: 16, textAlign: "center" }}>
                🔒 Your ID photos are encrypted and used only for age verification. We comply with all data protection regulations.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}