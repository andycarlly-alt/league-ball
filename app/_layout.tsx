import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AppStoreProvider } from "../src/state/AppStore";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#061A2B" }} edges={["top", "left", "right"]}>
        <AppStoreProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AppStoreProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
