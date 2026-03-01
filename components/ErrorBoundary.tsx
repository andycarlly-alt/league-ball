// components/ErrorBoundary.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export class ErrorBoundary extends React.Component
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#061A2B', padding: 40 }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>⚠️</Text>
          <Text style={{ color: '#F2D100', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 16 }}>
            Something Went Wrong
          </Text>
          <Text style={{ color: '#9FB3C8', textAlign: 'center', marginBottom: 24 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            style={{ backgroundColor: '#F2D100', padding: 16, borderRadius: 12 }}
          >
            <Text style={{ color: '#061A2B', fontWeight: '900' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}