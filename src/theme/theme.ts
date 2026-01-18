// src/theme/theme.ts
// Main theme export - NVT Veterans League App

import { Colors, SemanticColors } from "./colors";
import { Margin, Padding, Spacing } from "./spacing";
import { FontSize, FontWeight, LineHeight, Typography } from "./typography";

// Main theme object
export const Theme = {
  colors: Colors,
  semantic: SemanticColors,
  spacing: Spacing,
  padding: Padding,
  margin: Margin,
  typography: Typography,
  fontSize: FontSize,
  fontWeight: FontWeight,
  lineHeight: LineHeight,
} as const;

// Export individual modules for convenience
export { Colors, SemanticColors, withOpacity } from "./colors";
export { Margin, Padding, Spacing, gap } from "./spacing";
export { FontSize, FontWeight, LineHeight, Typography } from "./typography";

// Helper to create common card style
export const cardStyle = {
  backgroundColor: Colors.surface.card,
  borderRadius: Spacing.radiusLg,
  padding: Spacing.cardPadding,
  borderWidth: 1,
  borderColor: Colors.border.default,
} as const;

// Helper to create button styles
export const buttonStyles = {
  primary: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.buttonPaddingVertical,
    paddingHorizontal: Spacing.buttonPaddingHorizontal,
    borderRadius: Spacing.radiusMd,
    alignItems: "center" as const,
  },
  secondary: {
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.buttonPaddingVertical,
    paddingHorizontal: Spacing.buttonPaddingHorizontal,
    borderRadius: Spacing.radiusMd,
    alignItems: "center" as const,
  },
  danger: {
    backgroundColor: Colors.status.error,
    paddingVertical: Spacing.buttonPaddingVertical,
    paddingHorizontal: Spacing.buttonPaddingHorizontal,
    borderRadius: Spacing.radiusMd,
    alignItems: "center" as const,
  },
  success: {
    backgroundColor: Colors.status.success,
    paddingVertical: Spacing.buttonPaddingVertical,
    paddingHorizontal: Spacing.buttonPaddingHorizontal,
    borderRadius: Spacing.radiusMd,
    alignItems: "center" as const,
  },
  outline: {
    backgroundColor: Colors.surface.card,
    paddingVertical: Spacing.buttonPaddingVertical,
    paddingHorizontal: Spacing.buttonPaddingHorizontal,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
    borderColor: Colors.border.default,
    alignItems: "center" as const,
  },
} as const;

// Helper to create input styles
export const inputStyle = {
  backgroundColor: Colors.surface.cardAlt,
  color: Colors.text.primary,
  borderRadius: Spacing.radiusMd,
  padding: Spacing.inputPadding,
  borderWidth: 1,
  borderColor: Colors.border.default,
} as const;

// Default export
export default Theme;