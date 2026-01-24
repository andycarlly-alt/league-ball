// app/(tabs)/billing.tsx - FULL FEATURED VERSION
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/state/AppStore";

export default function BillingScreen() {
  const router = useRouter();
  const store: any = useAppStore();
  const {
    currentUser,
    walletBalance = 2500,
    addToWallet,
    pendingPayments = [],
    markPaymentPaid,
  } = store;

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const formatMoney = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const myPendingPayments = pendingPayments.filter((p: any) => {
    if (p.status !== "PENDING") return false;
    
    if (currentUser?.role === "LEAGUE_ADMIN" || currentUser?.role === "TOURNAMENT_ADMIN") {
      return true;
    }
    
    if (p.teamId === currentUser?.teamId) return true;
    if (p.userId === currentUser?.id) return true;
    
    return false;
  });

  const handleDeposit = () => {
    const amountCents = Math.floor(parseFloat(depositAmount || "0") * 100);
    
    if (amountCents < 500) {
      Alert.alert("Minimum Deposit", "Minimum deposit is $5.00");
      return;
    }
    
    if (amountCents > 50000) {
      Alert.alert("Maximum Deposit", "Maximum deposit is $500.00");
      return;
    }

    Alert.alert(
      "Confirm Deposit",
      `Add ${formatMoney(amountCents)} to your wallet?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deposit",
          onPress: () => {
            if (typeof addToWallet === 'function') {
              addToWallet(amountCents);
            }
            
            Alert.alert(
              "Deposit Successful! ✅",
              `${formatMoney(amountCents)} added to wallet\n\nNew balance: ${formatMoney((walletBalance || 0) + amountCents)}`,
              [{ text: "OK" }]
            );
            
            setDepositAmount("");
          },
        },
      ]
    );
  };

  const handleWithdraw = () => {
    const amountCents = Math.floor(parseFloat(withdrawAmount || "0") * 100);
    
    if (amountCents < 500) {
      Alert.alert("Minimum Withdrawal", "Minimum withdrawal is $5.00");
      return;
    }
    
    if (amountCents > (walletBalance || 0)) {
      Alert.alert("Insufficient Funds", `You only have ${formatMoney(walletBalance || 0)} available`);
      return;
    }

    Alert.alert(
      "Confirm Withdrawal",
      `Withdraw ${formatMoney(amountCents)} to your bank account?\n\nProcessing time: 2-3 business days`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Withdraw",
          onPress: () => {
            if (typeof addToWallet === 'function') {
              addToWallet(-amountCents);
            }
            
            Alert.alert(
              "Withdrawal Initiated ✅",
              `${formatMoney(amountCents)} will be transferred to your bank account ending in ••4242\n\nNew balance: ${formatMoney((walletBalance || 0) - amountCents)}`,
              [{ text: "OK" }]
            );
            
            setWithdrawAmount("");
          },
        },
      ]
    );
  };

  const handlePayment = (payment: any) => {
    Alert.alert(
      "Process Payment",
      `Pay ${formatMoney(payment.amount)} for ${getPaymentTitle(payment)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay Now",
          onPress: () => {
            if (typeof markPaymentPaid === 'function') {
              markPaymentPaid(payment.id);
            }
            
            Alert.alert(
              "Payment Successful! ✅",
              `${formatMoney(payment.amount)} charged to card ending in ••4242\n\nReceipt sent to ${currentUser?.email || "your email"}`,
              [{ text: "OK" }]
            );
            
            if (payment.type === "TOURNAMENT_REGISTRATION") {
              setTimeout(() => {
                Alert.alert(
                  "Roster Unlocked!",
                  "Your team roster has been unlocked. You can now make changes and play in the tournament.",
                  [{ text: "OK" }]
                );
              }, 500);
            }
            
            if (payment.type === "CARD_FINE") {
              setTimeout(() => {
                Alert.alert(
                  "Fine Paid",
                  "The player suspension has been lifted. They can now play in matches.",
                  [{ text: "OK" }]
                );
              }, 500);
            }
          },
        },
      ]
    );
  };

  const getPaymentTitle = (payment: any) => {
    switch (payment.type) {
      case "TOURNAMENT_REGISTRATION":
        return `${payment.tournamentName || "Tournament"} Registration`;
      case "CARD_FINE":
        return `${payment.cardType || ""} Card Fine - ${payment.teamName || "Team"}`;
      case "VENDOR_AD":
        return `${payment.vendorPackage || ""} Sponsorship Package`;
      case "SUBSCRIPTION":
        return "Pro Subscription";
      case "DIGITAL_ID":
        return "Digital ID Card";
      default:
        return "Payment";
    }
  };

  const getPaymentDescription = (payment: any) => {
    switch (payment.type) {
      case "TOURNAMENT_REGISTRATION":
        return `Registration fee for ${payment.teamName || "your team"}`;
      case "CARD_FINE":
        const daysLeft = payment.dueDate ? Math.ceil((payment.dueDate - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
        return `Due in ${daysLeft} days. Late fee: 50% after deadline.`;
      case "VENDOR_AD":
        return `${payment.companyName || "Vendor"} sponsorship package`;
      case "SUBSCRIPTION":
        return "Unlimited teams, advanced stats, priority support";
      case "DIGITAL_ID":
        return "Verified digital ID card";
      default:
        return "";
    }
  };

  const isOverdue = (payment: any) => {
    if (!payment.dueDate) return false;
    return Date.now() > payment.dueDate;
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#061A2B" }} contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}>
      <Text style={{ color: "#F2D100", fontSize: 24, fontWeight: "900" }}>
        💳 Billing & Payments
      </Text>

      <View
        style={{
          backgroundColor: "#0A2238",
          borderRadius: 14,
          padding: 16,
          borderWidth: 2,
          borderColor: "#22C6D2",
        }}
      >
        <Text style={{ color: "#9FB3C8", fontSize: 14 }}>Betting Wallet Balance</Text>
        <Text style={{ color: "#22C6D2", fontSize: 32, fontWeight: "900", marginTop: 4 }}>
          {formatMoney(walletBalance || 0)}
        </Text>
        <Text style={{ color: "#9FB3C8", fontSize: 12, marginTop: 4 }}>
          Available for betting
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Quick Deposit</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {[5, 10, 25, 50, 100].map((amount) => (
            <TouchableOpacity
              key={amount}
              onPress={() => {
                setDepositAmount(amount.toString());
                setTimeout(() => handleDeposit(), 100);
              }}
              style={{
                backgroundColor: "#0A2238",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#22C6D2",
              }}
            >
              <Text style={{ color: "#22C6D2", fontWeight: "900" }}>
                ${amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Custom Amount</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            value={depositAmount}
            onChangeText={setDepositAmount}
            placeholder="0.00"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="decimal-pad"
            style={{
              flex: 1,
              backgroundColor: "#0A2238",
              color: "#EAF2FF",
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              fontWeight: "900",
              fontSize: 16,
            }}
          />
          <TouchableOpacity
            onPress={handleDeposit}
            style={{
              backgroundColor: "#34C759",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>Deposit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>Withdraw to Bank</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            value={withdrawAmount}
            onChangeText={setWithdrawAmount}
            placeholder="0.00"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="decimal-pad"
            style={{
              flex: 1,
              backgroundColor: "#0A2238",
              color: "#EAF2FF",
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              fontWeight: "900",
              fontSize: 16,
            }}
          />
          <TouchableOpacity
            onPress={handleWithdraw}
            style={{
              backgroundColor: "#22C6D2",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#061A2B", fontWeight: "900" }}>Withdraw</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: "#9FB3C8", fontSize: 12 }}>
          Transfers to bank account ••4242 in 2-3 business days
        </Text>
      </View>

      {myPendingPayments.length > 0 && (
        <View style={{ gap: 10, marginTop: 8 }}>
          <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18 }}>
            ⚠️ Pending Payments ({myPendingPayments.length})
          </Text>
          
          {myPendingPayments.map((payment: any) => (
            <View
              key={payment.id}
              style={{
                backgroundColor: "#0A2238",
                borderRadius: 14,
                padding: 16,
                borderWidth: 2,
                borderColor: isOverdue(payment) ? "#FF3B30" : "rgba(255,255,255,0.08)",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#EAF2FF", fontWeight: "900", fontSize: 16 }}>
                    {getPaymentTitle(payment)}
                  </Text>
                  <Text style={{ color: "#9FB3C8", marginTop: 4 }}>
                    {getPaymentDescription(payment)}
                  </Text>
                  {isOverdue(payment) && (
                    <Text style={{ color: "#FF3B30", marginTop: 6, fontWeight: "900" }}>
                      ⚠️ OVERDUE - Late fees may apply
                    </Text>
                  )}
                </View>
                <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 18 }}>
                  {formatMoney(payment.amount)}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => handlePayment(payment)}
                style={{
                  marginTop: 12,
                  backgroundColor: "#34C759",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#061A2B", fontWeight: "900" }}>
                  Pay {formatMoney(payment.amount)}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View
        style={{
          backgroundColor: "#0A2238",
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#EAF2FF", fontWeight: "900", marginBottom: 12 }}>
          Payment Method
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 40,
                height: 28,
                backgroundColor: "#22C6D2",
                borderRadius: 6,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#061A2B", fontWeight: "900", fontSize: 10 }}>VISA</Text>
            </View>
            <Text style={{ color: "#EAF2FF", fontWeight: "900" }}>•••• 4242</Text>
          </View>
          <TouchableOpacity>
            <Text style={{ color: "#22C6D2", fontWeight: "900" }}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: "rgba(242,209,0,0.1)",
          borderRadius: 14,
          padding: 16,
          borderWidth: 2,
          borderColor: "#F2D100",
        }}
      >
        <Text style={{ color: "#F2D100", fontWeight: "900", fontSize: 16 }}>
          ⭐ Upgrade to Pro
        </Text>
        <Text style={{ color: "#EAF2FF", marginTop: 6 }}>
          Unlimited teams • Advanced stats • Priority support
        </Text>
        <Text style={{ color: "#22C6D2", marginTop: 6, fontWeight: "900" }}>
          $9.99/month or $99/year (save $20!)
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}