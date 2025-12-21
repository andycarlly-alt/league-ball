import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MatchesTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Matches</Text>
      <Text style={styles.sub}>Next: Live Match screen + match list</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700" },
  sub: { marginTop: 8, opacity: 0.7 },
});
