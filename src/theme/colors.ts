// src/theme/colors.ts
// NVT Veterans League App Color Palette

export const Colors = {
  // Primary colors
  background: "#061A2B",      // Dark navy blue - main background
  primary: "#F2D100",         // Yellow - primary actions, headers
  secondary: "#22C6D2",       // Cyan - secondary actions, links
  
  // Text colors
  text: {
    primary: "#EAF2FF",       // Light - main text
    secondary: "#9FB3C8",     // Muted gray - secondary text
    inverse: "#061A2B",       // Dark - text on light backgrounds
  },

  // Card/Surface colors
  surface: {
    card: "#0A2238",          // Darker blue - cards
    cardAlt: "#0B2842",       // Alternative card color
    elevated: "rgba(255,255,255,0.06)", // Subtle elevation
  },

  // Borders
  border: {
    default: "rgba(255,255,255,0.08)",
    strong: "rgba(255,255,255,0.10)",
  },

  // Status colors
  status: {
    success: "#34C759",       // Green - success, verified, 35+
    warning: "#FFD60A",       // Yellow - warnings, 30-34 age
    error: "#FF3B30",         // Red - errors, under 30 age
    info: "#22C6D2",          // Cyan - info, live status
  },

  // Age verification colors (specific to app)
  ageBand: {
    under30: {
      bg: "#D33B3B",          // Red background
      fg: "#FFFFFF",          // White text
    },
    age30to34: {
      bg: "#F2D100",          // Yellow background
      fg: "#061A2B",          // Dark text
    },
    age35plus: {
      bg: "#1FBF75",          // Green background
      fg: "#061A2B",          // Dark text
    },
  },

  // Transparent overlays
  overlay: {
    light: "rgba(255,255,255,0.06)",
    medium: "rgba(255,255,255,0.10)",
    dark: "rgba(0,0,0,0.5)",
  },

  // Sponsor/Ad specific
  sponsor: {
    banner: "#22C6D2",        // Cyan background for sponsor banners
    text: "#061A2B",          // Dark text on sponsor banners
  },
} as const;

// Helper function to get opacity variations
export function withOpacity(color: string, opacity: number): string {
  // For hex colors, convert to rgba
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
}

// Color semantic mappings for common use cases
export const SemanticColors = {
  buttonPrimary: Colors.primary,
  buttonSecondary: Colors.secondary,
  buttonDanger: Colors.status.error,
  buttonSuccess: Colors.status.success,
  
  linkDefault: Colors.secondary,
  linkHover: Colors.primary,
  
  inputBackground: Colors.surface.cardAlt,
  inputBorder: Colors.border.default,
  inputText: Colors.text.primary,
  inputPlaceholder: Colors.text.secondary,
} as const;