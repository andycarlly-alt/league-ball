// app/teams/[id]/bereavement-enroll.tsx - ENROLLMENT FORM (COMPLETE)

import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type IDType = "US_DRIVERS_LICENSE" | "US_STATE_ID" | "US_PASSPORT" | "CANADA_DRIVERS_LICENSE" | "CANADA_PROVINCIAL_ID" | "CANADA_PASSPORT";
type ProofType = "UTILITY_BILL" | "LEASE_AGREEMENT" | "BANK_STATEMENT" | "GOVERNMENT_LETTER";
type MemberType = "PLAYER" | "FAMILY";
type Relationship = "SPOUSE" | "CHILD" | "PARENT" | "SIBLING" | "PARTNER" | "OTHER";

export default function BereavementEnrollmentForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = String(id ?? "");

  // Member Information
  const [memberType, setMemberType] = useState<MemberType>("PLAYER");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [ssn, setSSN] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Address Information
  const [streetAddress, setStreetAddress] = useState("");
  const [aptUnit, setAptUnit] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState<"US" | "CANADA">("US");

  // ID Information
  const [idType, setIDType] = useState<IDType>("US_DRIVERS_LICENSE");
  const [idNumber, setIDNumber] = useState("");
  const [idExpirationDate, setIDExpirationDate] = useState("");
  const [idIssuingState, setIDIssuingState] = useState("");
  const [idDocument, setIDDocument] = useState<any>(null);

  // Proof of Residence
  const [proofType, setProofType] = useState<ProofType>("UTILITY_BILL");
  const [proofDocument, setProofDocument] = useState<any>(null);

  // Primary Beneficiary
  const [beneficiaryFirstName, setBeneficiaryFirstName] = useState("");
  const [beneficiaryLastName, setBeneficiaryLastName] = useState("");
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState<Relationship>("SPOUSE");
  const [beneficiaryPhone, setBeneficiaryPhone] = useState("");
  const [beneficiaryEmail, setBeneficiaryEmail] = useState("");

  // Agreements
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [certifyAccuracy, setCertifyAccuracy] = useState(false);
  const [signature, setSignature] = useState("");

  const pickIDDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIDDocument(result.assets[0]);
        Alert.alert("✓ Document Added", "ID document uploaded successfully");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const pickProofDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProofDocument(result.assets[0]);
        Alert.alert("✓ Document Added", "Proof of residence uploaded successfully");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const validateForm = () => {
    if (!firstName || !lastName || !dateOfBirth) {
      Alert.alert("Required Fields", "Please fill in all required personal information");
      return false;
    }
    if (!streetAddress || !city || !state || !zipCode) {
      Alert.alert("Required Fields", "Please fill in complete address");
      return false;
    }
    if (!idNumber || !idExpirationDate || !idDocument) {
      Alert.alert("Required Fields", "Please provide valid ID information and upload document");
      return false;
    }
    if (!proofDocument) {
      Alert.alert("Required Fields", "Please upload proof of residence");
      return false;
    }
    if (!beneficiaryFirstName || !beneficiaryLastName || !beneficiaryPhone) {
      Alert.alert("Required Fields", "Please fill in primary beneficiary information");
      return false;
    }
    if (!agreedToTerms || !certifyAccuracy || !signature) {
      Alert.alert("Required", "Please agree to terms and provide signature");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    Alert.alert(
      "Enrollment Submitted",
      "Your enrollment has been submitted for Team Rep approval. You'll receive a notification once reviewed.",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const renderSection = (title: string, icon: string, children: React.ReactNode) => (
    <View style={{
      backgroundColor: "#0A2238",
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Text style={{ fontSize: 24 }}>{icon}</Text>
        <Text style={{ color: "#F2D100", fontSize: 18, fontWeight: "900" }}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#061A2B" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#0A2238",
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}
        >
          <View style={{ backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
            <Text style={{ color: "#22C6D2", fontSize: 16, fontWeight: "900" }}>← Cancel</Text>
          </View>
        </TouchableOpacity>

        <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900", textAlign: "center" }}>
          📝 Bereavement Enrollment
        </Text>
        <Text style={{ color: "#9FB3C8", textAlign: "center", fontSize: 12, marginTop: 4 }}>
          Complete all sections to enroll
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Member Type */}
        {renderSection("Member Type", "👤", (
          <View style={{ gap: 10 }}>
            <TouchableOpacity
              onPress={() => setMemberType("PLAYER")}
              style={{
                backgroundColor: memberType === "PLAYER" ? "#34C759" : "#0B2842",
                padding: 14,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: memberType === "PLAYER" ? "#34C759" : "rgba(255,255,255,0.1)",
              }}
            >
              <Text style={{
                color: memberType === "PLAYER" ? "#061A2B" : "#EAF2FF",
                fontWeight: "900",
                fontSize: 15,
              }}>
                ⚽ Player (Team Member)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMemberType("FAMILY")}
              style={{
                backgroundColor: memberType === "FAMILY" ? "#34C759" : "#0B2842",
                padding: 14,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: memberType === "FAMILY" ? "#34C759" : "rgba(255,255,255,0.1)",
              }}
            >
              <Text style={{
                color: memberType === "FAMILY" ? "#061A2B" : "#EAF2FF",
                fontWeight: "900",
                fontSize: 15,
              }}>
                👨‍👩‍👧‍👦 Family Member
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Personal Information */}
        {renderSection("Personal Information", "📋", (
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>First Name *</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="John"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Middle Name</Text>
              <TextInput
                value={middleName}
                onChangeText={setMiddleName}
                placeholder="Optional"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Last Name *</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Smith"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Date of Birth *</Text>
              <TextInput
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Last 4 Digits of SSN/SIN *</Text>
              <TextInput
                value={ssn}
                onChangeText={(text) => setSSN(text.slice(0, 4))}
                placeholder="1234"
                keyboardType="number-pad"
                maxLength={4}
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
              <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4 }}>
                For verification purposes only
              </Text>
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Email *</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="john.smith@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Phone Number *</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="(555) 123-4567"
                keyboardType="phone-pad"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </View>
          </View>
        ))}

        {/* Address Information */}
        {renderSection("Address Information", "🏠", (
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Country *</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setCountry("US")}
                  style={{
                    flex: 1,
                    backgroundColor: country === "US" ? "#34C759" : "#0B2842",
                    padding: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: country === "US" ? "#34C759" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text style={{
                    color: country === "US" ? "#061A2B" : "#EAF2FF",
                    fontWeight: "900",
                  }}>
                    🇺🇸 United States
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCountry("CANADA")}
                  style={{
                    flex: 1,
                    backgroundColor: country === "CANADA" ? "#34C759" : "#0B2842",
                    padding: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: country === "CANADA" ? "#34C759" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text style={{
                    color: country === "CANADA" ? "#061A2B" : "#EAF2FF",
                    fontWeight: "900",
                  }}>
                    🇨🇦 Canada
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Street Address *</Text>
              <TextInput
                value={streetAddress}
                onChangeText={setStreetAddress}
                placeholder="123 Main Street"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Apt/Unit #</Text>
              <TextInput
                value={aptUnit}
                onChangeText={setAptUnit}
                placeholder="Optional"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>City *</Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="Baltimore"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 2 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>
                  {country === "US" ? "State" : "Province"} *
                </Text>
                <TextInput
                  value={state}
                  onChangeText={setState}
                  placeholder={country === "US" ? "MD" : "ON"}
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={{
                    backgroundColor: "#0B2842",
                    color: "#EAF2FF",
                    padding: 12,
                    borderRadius: 10,
                    fontSize: 15,
                  }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>
                  {country === "US" ? "ZIP" : "Postal"} *
                </Text>
                <TextInput
                  value={zipCode}
                  onChangeText={setZipCode}
                  placeholder={country === "US" ? "21236" : "M5H 2N2"}
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={{
                    backgroundColor: "#0B2842",
                    color: "#EAF2FF",
                    padding: 12,
                    borderRadius: 10,
                    fontSize: 15,
                  }}
                />
              </View>
            </View>
          </View>
        ))}

        {/* ID Information */}
        {renderSection("Government-Issued ID", "🪪", (
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>ID Type *</Text>
              <View style={{ gap: 8 }}>
                {country === "US" ? (
                  <>
                    <TouchableOpacity
                      onPress={() => setIDType("US_DRIVERS_LICENSE")}
                      style={{
                        backgroundColor: idType === "US_DRIVERS_LICENSE" ? "#34C759" : "#0B2842",
                        padding: 12,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: idType === "US_DRIVERS_LICENSE" ? "#34C759" : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Text style={{
                        color: idType === "US_DRIVERS_LICENSE" ? "#061A2B" : "#EAF2FF",
                        fontWeight: "900",
                      }}>
                        US Driver's License
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setIDType("US_STATE_ID")}
                      style={{
                        backgroundColor: idType === "US_STATE_ID" ? "#34C759" : "#0B2842",
                        padding: 12,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: idType === "US_STATE_ID" ? "#34C759" : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Text style={{
                        color: idType === "US_STATE_ID" ? "#061A2B" : "#EAF2FF",
                        fontWeight: "900",
                      }}>
                        US State ID
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setIDType("US_PASSPORT")}
                      style={{
                        backgroundColor: idType === "US_PASSPORT" ? "#34C759" : "#0B2842",
                        padding: 12,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: idType === "US_PASSPORT" ? "#34C759" : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Text style={{
                        color: idType === "US_PASSPORT" ? "#061A2B" : "#EAF2FF",
                        fontWeight: "900",
                      }}>
                        US Passport
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => setIDType("CANADA_DRIVERS_LICENSE")}
                      style={{
                        backgroundColor: idType === "CANADA_DRIVERS_LICENSE" ? "#34C759" : "#0B2842",
                        padding: 12,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: idType === "CANADA_DRIVERS_LICENSE" ? "#34C759" : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Text style={{
                        color: idType === "CANADA_DRIVERS_LICENSE" ? "#061A2B" : "#EAF2FF",
                        fontWeight: "900",
                      }}>
                        Canadian Driver's License
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setIDType("CANADA_PROVINCIAL_ID")}
                      style={{
                        backgroundColor: idType === "CANADA_PROVINCIAL_ID" ? "#34C759" : "#0B2842",
                        padding: 12,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: idType === "CANADA_PROVINCIAL_ID" ? "#34C759" : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Text style={{
                        color: idType === "CANADA_PROVINCIAL_ID" ? "#061A2B" : "#EAF2FF",
                        fontWeight: "900",
                      }}>
                        Provincial ID Card
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setIDType("CANADA_PASSPORT")}
                      style={{
                        backgroundColor: idType === "CANADA_PASSPORT" ? "#34C759" : "#0B2842",
                        padding: 12,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: idType === "CANADA_PASSPORT" ? "#34C759" : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Text style={{
                        color: idType === "CANADA_PASSPORT" ? "#061A2B" : "#EAF2FF",
                        fontWeight: "900",
                      }}>
                        Canadian Passport
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>ID Number *</Text>
              <TextInput
                value={idNumber}
                onChangeText={setIDNumber}
                placeholder="Enter ID number"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Expiration Date *</Text>
              <TextInput
                value={idExpirationDate}
                onChangeText={setIDExpirationDate}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>
                Issuing {country === "US" ? "State" : "Province"} *
              </Text>
              <TextInput
                value={idIssuingState}
                onChangeText={setIDIssuingState}
                placeholder={country === "US" ? "Maryland" : "Ontario"}
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Upload ID Document *</Text>
              <TouchableOpacity
                onPress={pickIDDocument}
                style={{
                  backgroundColor: idDocument ? "#34C759" : "#0B2842",
                  padding: 14,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: idDocument ? "#34C759" : "#22C6D2",
                  borderStyle: "dashed",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 32, marginBottom: 8 }}>
                  {idDocument ? "✓" : "📸"}
                </Text>
                <Text style={{
                  color: idDocument ? "#061A2B" : "#22C6D2",
                  fontWeight: "900",
                }}>
                  {idDocument ? "ID Uploaded" : "Tap to Upload Photo/Scan"}
                </Text>
                {idDocument && (
                  <Text style={{ color: "#061A2B", fontSize: 11, marginTop: 4 }}>
                    Tap to change
                  </Text>
                )}
              </TouchableOpacity>
              <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 6 }}>
                Clear photo of front of ID showing name, date of birth, and photo
              </Text>
            </View>
          </View>
        ))}

        {/* Proof of Residence */}
        {renderSection("Proof of Residence", "📄", (
          <View style={{ gap: 12 }}>
            <Text style={{ color: "#9FB3C8", fontSize: 12 }}>
              Must show your name and current address (within last 90 days)
            </Text>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Document Type *</Text>
              <View style={{ gap: 8 }}>
                {[
                  { value: "UTILITY_BILL", label: "Utility Bill (Electric, Gas, Water)" },
                  { value: "BANK_STATEMENT", label: "Bank/Credit Card Statement" },
                  { value: "LEASE_AGREEMENT", label: "Lease/Rental Agreement" },
                  { value: "GOVERNMENT_LETTER", label: "Government Letter/Document" },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => setProofType(type.value as ProofType)}
                    style={{
                      backgroundColor: proofType === type.value ? "#34C759" : "#0B2842",
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: proofType === type.value ? "#34C759" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Text style={{
                      color: proofType === type.value ? "#061A2B" : "#EAF2FF",
                      fontWeight: "900",
                      fontSize: 13,
                    }}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Upload Document *</Text>
              <TouchableOpacity
                onPress={pickProofDocument}
                style={{
                  backgroundColor: proofDocument ? "#34C759" : "#0B2842",
                  padding: 14,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: proofDocument ? "#34C759" : "#22C6D2",
                  borderStyle: "dashed",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 32, marginBottom: 8 }}>
                  {proofDocument ? "✓" : "📸"}
                </Text>
                <Text style={{
                  color: proofDocument ? "#061A2B" : "#22C6D2",
                  fontWeight: "900",
                }}>
                  {proofDocument ? "Document Uploaded" : "Tap to Upload Photo/Scan"}
                </Text>
                {proofDocument && (
                  <Text style={{ color: "#061A2B", fontSize: 11, marginTop: 4 }}>
                    Tap to change
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Beneficiary Information */}
        {renderSection("Primary Beneficiary", "❤️", (
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>First Name *</Text>
              <TextInput
                value={beneficiaryFirstName}
                onChangeText={setBeneficiaryFirstName}
                placeholder="Jane"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Last Name *</Text>
              <TextInput
                value={beneficiaryLastName}
                onChangeText={setBeneficiaryLastName}
                placeholder="Smith"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Relationship *</Text>
              <View style={{ gap: 8 }}>
                {[
                  { value: "SPOUSE", label: "Spouse" },
                  { value: "CHILD", label: "Child" },
                  { value: "PARENT", label: "Parent" },
                  { value: "SIBLING", label: "Sibling" },
                  { value: "PARTNER", label: "Partner" },
                ].map((rel) => (
                  <TouchableOpacity
                    key={rel.value}
                    onPress={() => setBeneficiaryRelationship(rel.value as Relationship)}
                    style={{
                      backgroundColor: beneficiaryRelationship === rel.value ? "#34C759" : "#0B2842",
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: beneficiaryRelationship === rel.value ? "#34C759" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Text style={{
                      color: beneficiaryRelationship === rel.value ? "#061A2B" : "#EAF2FF",
                      fontWeight: "900",
                      fontSize: 13,
                    }}>
                      {rel.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Phone Number *</Text>
              <TextInput
                value={beneficiaryPhone}
                onChangeText={setBeneficiaryPhone}
                placeholder="(555) 123-4567"
                keyboardType="phone-pad"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Email (Optional)</Text>
              <TextInput
                value={beneficiaryEmail}
                onChangeText={setBeneficiaryEmail}
                placeholder="jane.smith@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </View>
          </View>
        ))}

        {/* Agreement & Signature */}
        {renderSection("Agreement & Signature", "✍️", (
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 12,
                backgroundColor: "#0B2842",
                borderRadius: 10,
              }}
            >
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: agreedToTerms ? "#34C759" : "#9FB3C8",
                backgroundColor: agreedToTerms ? "#34C759" : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {agreedToTerms && (
                  <Text style={{ color: "#FFF", fontSize: 16 }}>✓</Text>
                )}
              </View>
              <Text style={{ color: "#EAF2FF", flex: 1, fontSize: 13 }}>
                I agree to the bereavement fund terms and conditions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCertifyAccuracy(!certifyAccuracy)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 12,
                backgroundColor: "#0B2842",
                borderRadius: 10,
              }}
            >
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: certifyAccuracy ? "#34C759" : "#9FB3C8",
                backgroundColor: certifyAccuracy ? "#34C759" : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {certifyAccuracy && (
                  <Text style={{ color: "#FFF", fontSize: 16 }}>✓</Text>
                )}
              </View>
              <Text style={{ color: "#EAF2FF", flex: 1, fontSize: 13 }}>
                I certify that all information provided is accurate
              </Text>
            </TouchableOpacity>

            <View>
              <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 6 }}>Digital Signature *</Text>
              <TextInput
                value={signature}
                onChangeText={setSignature}
                placeholder="Type your full name"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "#0B2842",
                  color: "#EAF2FF",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 15,
                  fontStyle: "italic",
                }}
              />
              <Text style={{ color: "#9FB3C8", fontSize: 11, marginTop: 4 }}>
                By typing your name, you agree this constitutes a legal signature
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Submit Button */}
      <View style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#0A2238",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
      }}>
        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: "#34C759",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 16 }}>
            Submit for Approval
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}