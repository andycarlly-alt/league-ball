// src/theme/typography.ts
// Typography system for the app

import { TextStyle } from "react-native";
import { Colors } from "./colors";

// Font weights used throughout the app
export const FontWeight = {
  regular: "400" as TextStyle["fontWeight"],
  medium: "600" as TextStyle["fontWeight"],
  semibold: "700" as TextStyle["fontWeight"],
  bold: "800" as TextStyle["fontWeight"],
  black: "900" as TextStyle["fontWeight"],
} as const;

// Font sizes
export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 22,
  xxxl: 24,
} as const;

// Common text styles used in the app
export const Typography = {
  // Headers
  h1: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.black,
    color: Colors.primary,
  } as TextStyle,

  h2: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    color: Colors.primary,
  } as TextStyle,

  h3: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    color: Colors.text.primary,
  } as TextStyle,

  h4: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: Colors.text.primary,
  } as TextStyle,

  // Body text
  body: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    color: Colors.text.primary,
  } as TextStyle,

  bodyBold: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    color: Colors.text.primary,
  } as TextStyle,

  bodySecondary: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    color: Colors.text.secondary,
  } as TextStyle,

  // Small text
  caption: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: Colors.text.secondary,
  } as TextStyle,

  captionBold: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    color: Colors.text.primary,
  } as TextStyle,

  // Tiny text
  tiny: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    color: Colors.text.secondary,
  } as TextStyle,

  // Special styles
  link: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    color: Colors.secondary,
  } as TextStyle,

  button: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    color: Colors.text.inverse,
  } as TextStyle,

  badge: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    color: Colors.text.primary,
  } as TextStyle,

  // Score/number display
  score: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    color: Colors.primary,
  } as TextStyle,
} as const;

// Line heights for better readability
export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;