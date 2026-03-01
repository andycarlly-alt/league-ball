// 3. Add Loading States (60 min)
// Create: components/LoadingOverlay.tsx

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function LoadingOverlay({ visible, message }: { visible: boolean; message?: string }) {
  if (!visible) return null;
  
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#F2D100" />
        <Text style={styles.text}>{message || 'Loading...'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    backgroundColor: '#0A2238',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  text: {
    color: '#EAF2FF',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '900',
  },
});