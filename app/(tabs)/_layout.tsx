// app/(tabs)/_layout.tsx - Complete Tabs Layout

import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text, View } from 'react-native';

export default function TabLayout() {
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
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="🏠" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="⚽" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="tournaments"
        options={{
          title: 'Tournaments',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="🏆" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="teams"
        options={{
          title: 'Teams',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="👥" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="live"
        options={{
          title: 'Live',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="🔴" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="billing"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="💰" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="💬" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// Simple emoji icon component
function TabIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ 
        fontSize: 22, 
        opacity: color === '#F2D100' ? 1 : 0.6,
      }}>
        {icon}
      </Text>
    </View>
  );
}