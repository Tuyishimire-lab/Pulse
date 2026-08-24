/**
 * Maps ISO 3166-1 alpha-2 country codes to primary & secondary flag colors and gradient styles.
 * Curated for modern dark UI with subtle gradients, flag-inspired badge accents, and hover glows.
 */

export interface FlagColors {
  primary: string;       // Main vibrant flag color
  secondary: string;     // Accent flag color
  bgGradient: string;    // Subtle dark ambient gradient based on flag
  glowColor: string;     // Glow on hover
  borderColor: string;   // Subtle card border
  tagBg: string;         // Pill background for country code / flag badge
  tagText: string;       // Pill text color
}

// Fallback for unlisted codes
const DEFAULT_FLAG_COLORS: FlagColors = {
  primary: '#82c8e5',
  secondary: '#0047ab',
  bgGradient: 'linear-gradient(135deg, rgba(0, 71, 171, 0.12) 0%, rgba(130, 200, 229, 0.04) 100%)',
  glowColor: 'rgba(130, 200, 229, 0.25)',
  borderColor: 'rgba(130, 200, 229, 0.15)',
  tagBg: 'rgba(130, 200, 229, 0.12)',
  tagText: '#82c8e5',
};

export const COUNTRY_FLAG_COLORS: Record<string, FlagColors> = {
  // United States (Red, White, Blue)
  US: {
    primary: '#3c70f4',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(60, 112, 244, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
    glowColor: 'rgba(60, 112, 244, 0.3)',
    borderColor: 'rgba(60, 112, 244, 0.2)',
    tagBg: 'rgba(60, 112, 244, 0.15)',
    tagText: '#93c5fd',
  },
  // India (Saffron, White, Green, Navy)
  IN: {
    primary: '#f97316',
    secondary: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)',
    glowColor: 'rgba(249, 115, 22, 0.3)',
    borderColor: 'rgba(249, 115, 22, 0.2)',
    tagBg: 'rgba(249, 115, 22, 0.15)',
    tagText: '#fdba74',
  },
  // Brazil (Green, Yellow/Gold, Blue)
  BR: {
    primary: '#10b981',
    secondary: '#eab308',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(234, 179, 8, 0.08) 100%)',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    tagBg: 'rgba(16, 185, 129, 0.15)',
    tagText: '#6ee7b7',
  },
  // United Kingdom (Royal Blue, Crimson, White)
  GB: {
    primary: '#3b82f6',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    tagBg: 'rgba(59, 130, 246, 0.15)',
    tagText: '#93c5fd',
  },
  // Germany (Black, Crimson Red, Gold)
  DE: {
    primary: '#eab308',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(234, 179, 8, 0.12) 100%)',
    glowColor: 'rgba(234, 179, 8, 0.3)',
    borderColor: 'rgba(234, 179, 8, 0.2)',
    tagBg: 'rgba(234, 179, 8, 0.15)',
    tagText: '#fde047',
  },
  // France (Blue, White, Red)
  FR: {
    primary: '#3b82f6',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    tagBg: 'rgba(59, 130, 246, 0.15)',
    tagText: '#93c5fd',
  },
  // Japan (Crimson Sun, White)
  JP: {
    primary: '#ef4444',
    secondary: '#fca5a5',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%)',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    tagBg: 'rgba(239, 68, 68, 0.15)',
    tagText: '#fca5a5',
  },
  // Canada (Red, White)
  CA: {
    primary: '#ef4444',
    secondary: '#ffffff',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%)',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    tagBg: 'rgba(239, 68, 68, 0.15)',
    tagText: '#fca5a5',
  },
  // Australia (Green & Gold / Navy & Red)
  AU: {
    primary: '#0ea5e9',
    secondary: '#eab308',
    bgGradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(234, 179, 8, 0.08) 100%)',
    glowColor: 'rgba(14, 165, 233, 0.3)',
    borderColor: 'rgba(14, 165, 233, 0.2)',
    tagBg: 'rgba(14, 165, 233, 0.15)',
    tagText: '#7dd3fc',
  },
  // Mexico (Green, White, Red)
  MX: {
    primary: '#10b981',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    tagBg: 'rgba(16, 185, 129, 0.15)',
    tagText: '#6ee7b7',
  },
  // South Korea (White, Red, Blue, Black)
  KR: {
    primary: '#3b82f6',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    tagBg: 'rgba(59, 130, 246, 0.15)',
    tagText: '#93c5fd',
  },
  // Indonesia (Red, White)
  ID: {
    primary: '#ef4444',
    secondary: '#f87171',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(255, 255, 255, 0.03) 100%)',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    tagBg: 'rgba(239, 68, 68, 0.15)',
    tagText: '#fca5a5',
  },
  // Nigeria (Green, White)
  NG: {
    primary: '#10b981',
    secondary: '#34d399',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(255, 255, 255, 0.03) 100%)',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    tagBg: 'rgba(16, 185, 129, 0.15)',
    tagText: '#6ee7b7',
  },
  // Argentina (Sky Blue, White, Sun Gold)
  AR: {
    primary: '#38bdf8',
    secondary: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.16) 0%, rgba(245, 158, 11, 0.08) 100%)',
    glowColor: 'rgba(56, 189, 248, 0.3)',
    borderColor: 'rgba(56, 189, 248, 0.2)',
    tagBg: 'rgba(56, 189, 248, 0.15)',
    tagText: '#7dd3fc',
  },
  // Spain (Red, Spanish Yellow)
  ES: {
    primary: '#ef4444',
    secondary: '#eab308',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(234, 179, 8, 0.12) 100%)',
    glowColor: 'rgba(234, 179, 8, 0.3)',
    borderColor: 'rgba(234, 179, 8, 0.2)',
    tagBg: 'rgba(234, 179, 8, 0.15)',
    tagText: '#fde047',
  },
  // Italy (Green, White, Red)
  IT: {
    primary: '#10b981',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    tagBg: 'rgba(16, 185, 129, 0.15)',
    tagText: '#6ee7b7',
  },
  // Netherlands (Red, White, Royal Blue, Orange)
  NL: {
    primary: '#f97316',
    secondary: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.16) 0%, rgba(59, 130, 246, 0.08) 100%)',
    glowColor: 'rgba(249, 115, 22, 0.3)',
    borderColor: 'rgba(249, 115, 22, 0.2)',
    tagBg: 'rgba(249, 115, 22, 0.15)',
    tagText: '#fdba74',
  },
  // Sweden (Blue, Yellow)
  SE: {
    primary: '#0ea5e9',
    secondary: '#eab308',
    bgGradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.16) 0%, rgba(234, 179, 8, 0.12) 100%)',
    glowColor: 'rgba(14, 165, 233, 0.3)',
    borderColor: 'rgba(14, 165, 233, 0.2)',
    tagBg: 'rgba(14, 165, 233, 0.15)',
    tagText: '#7dd3fc',
  },
  // Poland (White, Crimson Red)
  PL: {
    primary: '#ef4444',
    secondary: '#ffffff',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(255, 255, 255, 0.04) 100%)',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    tagBg: 'rgba(239, 68, 68, 0.15)',
    tagText: '#fca5a5',
  },
  // Singapore (Red, White)
  SG: {
    primary: '#ef4444',
    secondary: '#f87171',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(255, 255, 255, 0.04) 100%)',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    tagBg: 'rgba(239, 68, 68, 0.15)',
    tagText: '#fca5a5',
  },
  // South Africa (Green, Gold, Black, White, Red, Blue)
  ZA: {
    primary: '#10b981',
    secondary: '#eab308',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(234, 179, 8, 0.1) 100%)',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    tagBg: 'rgba(16, 185, 129, 0.15)',
    tagText: '#6ee7b7',
  },
  // Turkey (Crimson, White)
  TR: {
    primary: '#ef4444',
    secondary: '#f87171',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(255, 255, 255, 0.03) 100%)',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    tagBg: 'rgba(239, 68, 68, 0.15)',
    tagText: '#fca5a5',
  },
  // Philippines (Blue, Red, White, Sun Gold)
  PH: {
    primary: '#3b82f6',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    tagBg: 'rgba(59, 130, 246, 0.15)',
    tagText: '#93c5fd',
  },
  // Vietnam (Red, Gold Star)
  VN: {
    primary: '#ef4444',
    secondary: '#eab308',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(234, 179, 8, 0.12) 100%)',
    glowColor: 'rgba(234, 179, 8, 0.3)',
    borderColor: 'rgba(234, 179, 8, 0.2)',
    tagBg: 'rgba(234, 179, 8, 0.15)',
    tagText: '#fde047',
  },
  // China (Red, Gold)
  CN: {
    primary: '#ef4444',
    secondary: '#eab308',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(234, 179, 8, 0.1) 100%)',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    tagBg: 'rgba(239, 68, 68, 0.15)',
    tagText: '#fca5a5',
  },
  // Saudi Arabia (Forest Green, White)
  SA: {
    primary: '#15803d',
    secondary: '#22c55e',
    bgGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.16) 0%, rgba(21, 128, 61, 0.08) 100%)',
    glowColor: 'rgba(34, 197, 94, 0.3)',
    borderColor: 'rgba(34, 197, 94, 0.2)',
    tagBg: 'rgba(34, 197, 94, 0.15)',
    tagText: '#86efac',
  },
  // United Arab Emirates (Green, White, Black, Red)
  AE: {
    primary: '#10b981',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    tagBg: 'rgba(16, 185, 129, 0.15)',
    tagText: '#6ee7b7',
  },
  // Egypt (Red, White, Black, Eagle Gold)
  EG: {
    primary: '#eab308',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(234, 179, 8, 0.12) 100%)',
    glowColor: 'rgba(234, 179, 8, 0.3)',
    borderColor: 'rgba(234, 179, 8, 0.2)',
    tagBg: 'rgba(234, 179, 8, 0.15)',
    tagText: '#fde047',
  },
  // Kenya (Black, Red, Green, White)
  KE: {
    primary: '#10b981',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    tagBg: 'rgba(16, 185, 129, 0.15)',
    tagText: '#6ee7b7',
  },
  // Ghana (Red, Gold, Green, Black Star)
  GH: {
    primary: '#eab308',
    secondary: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
    glowColor: 'rgba(234, 179, 8, 0.3)',
    borderColor: 'rgba(234, 179, 8, 0.2)',
    tagBg: 'rgba(234, 179, 8, 0.15)',
    tagText: '#fde047',
  },
  // Rwanda (Sky Blue, Yellow, Green)
  RW: {
    primary: '#0ea5e9',
    secondary: '#eab308',
    bgGradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.16) 0%, rgba(16, 185, 129, 0.1) 100%)',
    glowColor: 'rgba(14, 165, 233, 0.3)',
    borderColor: 'rgba(14, 165, 233, 0.2)',
    tagBg: 'rgba(14, 165, 233, 0.15)',
    tagText: '#7dd3fc',
  },
  // Colombia (Yellow, Blue, Red)
  CO: {
    primary: '#eab308',
    secondary: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)',
    glowColor: 'rgba(234, 179, 8, 0.3)',
    borderColor: 'rgba(234, 179, 8, 0.2)',
    tagBg: 'rgba(234, 179, 8, 0.15)',
    tagText: '#fde047',
  },
  // Chile (Blue, White, Red)
  CL: {
    primary: '#3b82f6',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    tagBg: 'rgba(59, 130, 246, 0.15)',
    tagText: '#93c5fd',
  },
  // Ukraine (Blue, Yellow)
  UA: {
    primary: '#0284c7',
    secondary: '#eab308',
    bgGradient: 'linear-gradient(135deg, rgba(2, 132, 199, 0.16) 0%, rgba(234, 179, 8, 0.12) 100%)',
    glowColor: 'rgba(234, 179, 8, 0.3)',
    borderColor: 'rgba(2, 132, 199, 0.2)',
    tagBg: 'rgba(2, 132, 199, 0.15)',
    tagText: '#7dd3fc',
  },
  // Switzerland (Red, White Cross)
  CH: {
    primary: '#ef4444',
    secondary: '#ffffff',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%)',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    tagBg: 'rgba(239, 68, 68, 0.15)',
    tagText: '#fca5a5',
  },
  // Portugal (Green, Red, Shield Gold)
  PT: {
    primary: '#10b981',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    tagBg: 'rgba(16, 185, 129, 0.15)',
    tagText: '#6ee7b7',
  },
  // Belgium (Black, Yellow, Red)
  BE: {
    primary: '#eab308',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
    glowColor: 'rgba(234, 179, 8, 0.3)',
    borderColor: 'rgba(234, 179, 8, 0.2)',
    tagBg: 'rgba(234, 179, 8, 0.15)',
    tagText: '#fde047',
  },
  // Greece (Cyan Blue, White)
  GR: {
    primary: '#0284c7',
    secondary: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, rgba(2, 132, 199, 0.16) 0%, rgba(255, 255, 255, 0.03) 100%)',
    glowColor: 'rgba(2, 132, 199, 0.3)',
    borderColor: 'rgba(2, 132, 199, 0.2)',
    tagBg: 'rgba(2, 132, 199, 0.15)',
    tagText: '#7dd3fc',
  },
  // Norway (Red, White, Navy)
  NO: {
    primary: '#ef4444',
    secondary: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    tagBg: 'rgba(239, 68, 68, 0.15)',
    tagText: '#fca5a5',
  },
  // Denmark (Red, White Cross)
  DK: {
    primary: '#ef4444',
    secondary: '#ffffff',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(255, 255, 255, 0.04) 100%)',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    tagBg: 'rgba(239, 68, 68, 0.15)',
    tagText: '#fca5a5',
  },
  // Finland (White, Blue Cross)
  FI: {
    primary: '#3b82f6',
    secondary: '#93c5fd',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.16) 0%, rgba(255, 255, 255, 0.03) 100%)',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    tagBg: 'rgba(59, 130, 246, 0.15)',
    tagText: '#93c5fd',
  },
  // Ireland (Green, White, Orange)
  IE: {
    primary: '#10b981',
    secondary: '#f97316',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(249, 115, 22, 0.08) 100%)',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    tagBg: 'rgba(16, 185, 129, 0.15)',
    tagText: '#6ee7b7',
  },
  // New Zealand (Royal Blue, Red Stars, White)
  NZ: {
    primary: '#3b82f6',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    tagBg: 'rgba(59, 130, 246, 0.15)',
    tagText: '#93c5fd',
  },
  // Pakistan (Dark Green, White)
  PK: {
    primary: '#15803d',
    secondary: '#86efac',
    bgGradient: 'linear-gradient(135deg, rgba(21, 128, 61, 0.16) 0%, rgba(255, 255, 255, 0.03) 100%)',
    glowColor: 'rgba(34, 197, 94, 0.3)',
    borderColor: 'rgba(34, 197, 94, 0.2)',
    tagBg: 'rgba(34, 197, 94, 0.15)',
    tagText: '#86efac',
  },
  // Bangladesh (Green, Red Circle)
  BD: {
    primary: '#10b981',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(239, 68, 68, 0.08) 100%)',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    tagBg: 'rgba(16, 185, 129, 0.15)',
    tagText: '#6ee7b7',
  },
  // Thailand (Red, White, Blue)
  TH: {
    primary: '#3b82f6',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    tagBg: 'rgba(59, 130, 246, 0.15)',
    tagText: '#93c5fd',
  },
  // Malaysia (Red, White, Blue, Yellow Crescent)
  MY: {
    primary: '#eab308',
    secondary: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)',
    glowColor: 'rgba(234, 179, 8, 0.3)',
    borderColor: 'rgba(234, 179, 8, 0.2)',
    tagBg: 'rgba(234, 179, 8, 0.15)',
    tagText: '#fde047',
  },
  // Morocco (Red, Green Star)
  MA: {
    primary: '#ef4444',
    secondary: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(16, 185, 129, 0.08) 100%)',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    tagBg: 'rgba(239, 68, 68, 0.15)',
    tagText: '#fca5a5',
  },
  // Israel (Blue, White)
  IL: {
    primary: '#2563eb',
    secondary: '#60a5fa',
    bgGradient: 'linear-gradient(135deg, rgba(37, 99, 235, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%)',
    glowColor: 'rgba(37, 99, 235, 0.3)',
    borderColor: 'rgba(37, 99, 235, 0.2)',
    tagBg: 'rgba(37, 99, 235, 0.15)',
    tagText: '#93c5fd',
  },
  // Peru (Red, White)
  PE: {
    primary: '#ef4444',
    secondary: '#ffffff',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(255, 255, 255, 0.03) 100%)',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    tagBg: 'rgba(239, 68, 68, 0.15)',
    tagText: '#fca5a5',
  },
  // Venezuela (Yellow, Blue, Red)
  VE: {
    primary: '#eab308',
    secondary: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)',
    glowColor: 'rgba(234, 179, 8, 0.3)',
    borderColor: 'rgba(234, 179, 8, 0.2)',
    tagBg: 'rgba(234, 179, 8, 0.15)',
    tagText: '#fde047',
  },
  // Sri Lanka (Gold, Crimson, Orange, Green)
  LK: {
    primary: '#f59e0b',
    secondary: '#b91c1c',
    bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(185, 28, 28, 0.08) 100%)',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
    tagBg: 'rgba(245, 158, 11, 0.15)',
    tagText: '#fcd34d',
  },
  // Czech Republic (Blue, White, Red)
  CZ: {
    primary: '#3b82f6',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    tagBg: 'rgba(59, 130, 246, 0.15)',
    tagText: '#93c5fd',
  },
  // Hungary (Red, White, Green)
  HU: {
    primary: '#10b981',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(16, 185, 129, 0.1) 100%)',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    tagBg: 'rgba(16, 185, 129, 0.15)',
    tagText: '#6ee7b7',
  },
  // Romania (Blue, Yellow, Red)
  RO: {
    primary: '#3b82f6',
    secondary: '#eab308',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(234, 179, 8, 0.08) 100%)',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    tagBg: 'rgba(59, 130, 246, 0.15)',
    tagText: '#93c5fd',
  },
  // Austria (Red, White)
  AT: {
    primary: '#ef4444',
    secondary: '#f87171',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%)',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    tagBg: 'rgba(239, 68, 68, 0.15)',
    tagText: '#fca5a5',
  },
  // Algeria (Green, White, Red Crescent)
  DZ: {
    primary: '#10b981',
    secondary: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    tagBg: 'rgba(16, 185, 129, 0.15)',
    tagText: '#6ee7b7',
  },
  // Ethiopia (Green, Yellow, Red, Blue Star)
  ET: {
    primary: '#eab308',
    secondary: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
    glowColor: 'rgba(234, 179, 8, 0.3)',
    borderColor: 'rgba(234, 179, 8, 0.2)',
    tagBg: 'rgba(234, 179, 8, 0.15)',
    tagText: '#fde047',
  },
};

/**
 * Returns flag colors and gradients for any country code.
 * Deterministically generates harmonious colors if the country isn't explicitly listed.
 */
export function getCountryFlagColors(cfCode: string): FlagColors {
  const upper = cfCode.toUpperCase();
  if (COUNTRY_FLAG_COLORS[upper]) {
    return COUNTRY_FLAG_COLORS[upper];
  }

  // Deterministic palette derivation for other countries
  let hash = 0;
  for (let i = 0; i < upper.length; i++) {
    hash = (hash << 5) - hash + upper.charCodeAt(i);
    hash |= 0;
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 45) % 360;

  return {
    primary: `hsl(${hue1}, 80%, 65%)`,
    secondary: `hsl(${hue2}, 85%, 55%)`,
    bgGradient: `linear-gradient(135deg, hsla(${hue1}, 75%, 55%, 0.14) 0%, hsla(${hue2}, 80%, 45%, 0.05) 100%)`,
    glowColor: `hsla(${hue1}, 80%, 60%, 0.28)`,
    borderColor: `hsla(${hue1}, 70%, 60%, 0.2)`,
    tagBg: `hsla(${hue1}, 75%, 55%, 0.15)`,
    tagText: `hsl(${hue1}, 90%, 75%)`,
  };
}
