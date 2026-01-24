// src/utils/responsive.ts - Responsive Utilities

import { Dimensions, PixelRatio, Platform } from 'react-native';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro)
const baseWidth = 375;
const baseHeight = 812;

// Scale factor
const widthScale = SCREEN_WIDTH / baseWidth;
const heightScale = SCREEN_HEIGHT / baseHeight;
const scale = Math.min(widthScale, heightScale);

/**
 * Normalize font size based on screen size
 * Works for both mobile and web
 */
export function normalize(size: number): number {
  const newSize = size * scale;
  
  if (Platform.OS === 'web') {
    // On web, use a different scaling approach
    const minSize = size * 0.9; // Minimum 90% of original
    const maxSize = size * 1.3; // Maximum 130% of original
    
    if (SCREEN_WIDTH < 768) {
      // Mobile web
      return Math.round(PixelRatio.roundToNearestPixel(Math.max(minSize, newSize)));
    } else {
      // Desktop web - make fonts larger
      return Math.round(PixelRatio.roundToNearestPixel(Math.min(maxSize, size * 1.15)));
    }
  }
  
  // Native mobile
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  
  if (Platform.OS === 'android') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
  
  return Math.round(size);
}

/**
 * Get responsive width
 */
export function wp(percentage: number): number {
  const value = (percentage * SCREEN_WIDTH) / 100;
  return Math.round(value);
}

/**
 * Get responsive height
 */
export function hp(percentage: number): number {
  const value = (percentage * SCREEN_HEIGHT) / 100;
  return Math.round(value);
}

/**
 * Check if device is tablet
 */
export function isTablet(): boolean {
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  return (
    (Platform.OS === 'ios' && !Platform.isPad && aspectRatio < 1.6) ||
    (Platform.OS === 'android' && aspectRatio < 1.6) ||
    (Platform.OS === 'web' && SCREEN_WIDTH >= 768)
  );
}

/**
 * Check if running on web
 */
export function isWeb(): boolean {
  return Platform.OS === 'web';
}

/**
 * Get platform-specific styles
 */
export function platformStyle<T>(config: {
  ios?: T;
  android?: T;
  web?: T;
  default?: T;
}): T | undefined {
  if (Platform.OS === 'ios' && config.ios) return config.ios;
  if (Platform.OS === 'android' && config.android) return config.android;
  if (Platform.OS === 'web' && config.web) return config.web;
  return config.default;
}

/**
 * Get responsive font sizes (presets)
 */
export const fontSize = {
  tiny: normalize(10),
  small: normalize(12),
  regular: normalize(14),
  medium: normalize(16),
  large: normalize(18),
  xlarge: normalize(20),
  xxlarge: normalize(24),
  huge: normalize(28),
  massive: normalize(32),
};

/**
 * Get responsive spacing
 */
export const spacing = {
  xs: normalize(4),
  sm: normalize(8),
  md: normalize(12),
  lg: normalize(16),
  xl: normalize(20),
  xxl: normalize(24),
  huge: normalize(32),
};

/**
 * Get container width for web
 */
export function getContainerWidth(): number {
  if (Platform.OS === 'web') {
    if (SCREEN_WIDTH >= 1200) return 1140; // Desktop
    if (SCREEN_WIDTH >= 992) return 960; // Laptop
    if (SCREEN_WIDTH >= 768) return 720; // Tablet
    return SCREEN_WIDTH - 32; // Mobile
  }
  return SCREEN_WIDTH;
}

/**
 * Responsive styles for common use
 */
export const responsive = {
  container: {
    width: getContainerWidth(),
    maxWidth: '100%',
    marginHorizontal: 'auto' as any,
    paddingHorizontal: Platform.OS === 'web' ? spacing.lg : spacing.md,
  },
  text: {
    fontSize: fontSize.regular,
    lineHeight: fontSize.regular * 1.5,
  },
  heading1: {
    fontSize: fontSize.huge,
    lineHeight: fontSize.huge * 1.2,
    fontWeight: '900' as any,
  },
  heading2: {
    fontSize: fontSize.xxlarge,
    lineHeight: fontSize.xxlarge * 1.2,
    fontWeight: '900' as any,
  },
  heading3: {
    fontSize: fontSize.xlarge,
    lineHeight: fontSize.xlarge * 1.2,
    fontWeight: '900' as any,
  },
  button: {
    minHeight: Platform.OS === 'web' ? 48 : 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  card: {
    padding: spacing.lg,
    borderRadius: Platform.OS === 'web' ? 16 : 14,
  },
};