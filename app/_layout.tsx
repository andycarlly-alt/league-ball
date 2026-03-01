// app/_layout.tsx - SIMPLEST FIX

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { notificationService } from '../src/services/notifications';

export default function RootLayout() {
  useEffect(() => {
    notificationService.initialize().catch(error => {
      console.log('Failed to initialize notifications:', error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { 
            backgroundColor: '#061A2B',
            paddingTop: Platform.OS === 'ios' ? 44 : 0, // Add top padding
          },
        }}
      />
    </SafeAreaProvider>
  );
}