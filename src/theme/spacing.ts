// src/theme/spacing.ts
// Consistent spacing scale for the app

export const Spacing = {
  // Base unit (4px)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  // Specific use cases
  screenPadding: 16,        // Default screen padding
  cardPadding: 14,          // Default card padding
  cardGap: 12,              // Gap between cards in lists
  sectionGap: 14,           // Gap between sections
  
  // Component spacing
  buttonPaddingVertical: 12,
  buttonPaddingHorizontal: 14,
  inputPadding: 12,
  
  // Border radius
  radiusSm: 12,
  radiusMd: 14,
  radiusLg: 16,
  radiusXl: 18,
  radiusFull: 999,          // For pill-shaped buttons
} as const;

// Helper function for consistent gaps
export function gap(multiplier: number = 1): number {
  return Spacing.md * multiplier;
}

// Padding helper for common patterns
export const Padding = {
  screen: { padding: Spacing.screenPadding },
  card: { padding: Spacing.cardPadding },
  button: {
    paddingVertical: Spacing.buttonPaddingVertical,
    paddingHorizontal: Spacing.buttonPaddingHorizontal,
  },
  input: { padding: Spacing.inputPadding },
} as const;

// Margin helpers
export const Margin = {
  top: {
    sm: { marginTop: Spacing.sm },
    md: { marginTop: Spacing.md },
    lg: { marginTop: Spacing.lg },
  },
  bottom: {
    sm: { marginBottom: Spacing.sm },
    md: { marginBottom: Spacing.md },
    lg: { marginBottom: Spacing.lg },
  },
  vertical: {
    sm: { marginVertical: Spacing.sm },
    md: { marginVertical: Spacing.md },
    lg: { marginVertical: Spacing.lg },
  },
} as const;