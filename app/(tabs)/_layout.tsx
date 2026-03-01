// app/(tabs)/_layout.tsx - FINAL VERSION

import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#F2D100',
        tabBarInactiveTintColor: '#9FB3C8',
        tabBarStyle: {
          backgroundColor: '#0A2238',
          borderTopColor: '#1A3A52',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 60 + insets.bottom : 60,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '900',
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
        }}
      />

      {/* SOCIAL - NEW! */}
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ color }) => <TabIcon icon="💬" color={color} />,
        }}
      />

      {/* MATCHES */}
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color }) => <TabIcon icon="⚽" color={color} />,
        }}
      />

      {/* TOURNAMENTS */}
      <Tabs.Screen
        name="tournaments"
        options={{
          title: 'Tournaments',
          tabBarIcon: ({ color }) => <TabIcon icon="🏆" color={color} />,
        }}
      />

      {/* TEAMS */}
      <Tabs.Screen
        name="teams"
        options={{
          title: 'Teams',
          tabBarIcon: ({ color }) => <TabIcon icon="👥" color={color} />,
        }}
      />

      {/* LIVE */}
      <Tabs.Screen
        name="live"
        options={{
          title: 'Live',
          tabBarIcon: ({ color }) => <TabIcon icon="🔴" color={color} />,
        }}
      />

      {/* PROFILE (includes wallet access) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />,
        }}
      />

      {/* BILLING - Hidden from tab bar, accessible via Profile */}
      <Tabs.Screen
        name="billing"
        options={{
          href: null, // This hides it from tab bar but keeps it accessible
        }}
      />

      {/* COMMUNITY HUB (Businesses) */}
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Business',
          tabBarIcon: ({ color }) => <TabIcon icon="🏪" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          opacity: color === '#F2D100' ? 1 : 0.6,
        }}
      >
        {icon}
      </Text>
    </View>
  );
}