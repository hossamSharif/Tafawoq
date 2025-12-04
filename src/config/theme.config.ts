import { MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

/**
 * Custom font configuration for Noto Kufi Arabic
 *
 * Font is loaded via expo-font in App.tsx:
 * ```typescript
 * import { useFonts } from 'expo-font';
 * import { NotoKufiArabic_400Regular, NotoKufiArabic_700Bold } from '@expo-google-fonts/noto-kufi-arabic';
 *
 * const [fontsLoaded] = useFonts({
 *   NotoKufiArabic_400Regular,
 *   NotoKufiArabic_700Bold,
 * });
 * ```
 */
const fontConfig = {
  fontFamily: 'NotoKufiArabic_400Regular',
  displayLarge: {
    fontFamily: 'NotoKufiArabic_700Bold',
    fontSize: 57,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: 'NotoKufiArabic_700Bold',
    fontSize: 45,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: 'NotoKufiArabic_700Bold',
    fontSize: 36,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: 'NotoKufiArabic_700Bold',
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: 'NotoKufiArabic_700Bold',
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: 'NotoKufiArabic_700Bold',
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: 'NotoKufiArabic_700Bold',
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: 'NotoKufiArabic_700Bold',
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: 'NotoKufiArabic_700Bold',
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  bodyLarge: {
    fontFamily: 'NotoKufiArabic_400Regular',
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'NotoKufiArabic_400Regular',
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: 'NotoKufiArabic_400Regular',
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  labelLarge: {
    fontFamily: 'NotoKufiArabic_700Bold',
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: 'NotoKufiArabic_700Bold',
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: 'NotoKufiArabic_700Bold',
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
};

/**
 * Tafawoq App Theme with RTL Support
 *
 * Color Palette:
 * - Primary: Saudi Arabia Green (#006C35) for CTAs and premium features
 * - Secondary: Gold/Amber for achievements and highlights
 * - Error: Red for validation and critical errors
 * - Background: Light gray for content areas
 * - Surface: White for cards and panels
 *
 * RTL Considerations:
 * - All spacing uses paddingStart/marginEnd instead of left/right
 * - Icons and navigation automatically flip via I18nManager
 * - Text alignment defaults to 'right' for Arabic
 */
export const theme: MD3Theme = {
  ...MD3LightTheme,

  // Custom color palette
  colors: {
    ...MD3LightTheme.colors,
    primary: '#006C35', // Saudi Green
    primaryContainer: '#A8E6C1',
    secondary: '#FFA000', // Amber/Gold
    secondaryContainer: '#FFECB3',
    tertiary: '#0077B6', // Blue for analytics
    tertiaryContainer: '#B3E5FC',
    error: '#D32F2F',
    errorContainer: '#FFCDD2',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceVariant: '#E0E0E0',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onBackground: '#1C1B1F',
    onSurface: '#1C1B1F',
    outline: '#79747E',
    shadow: '#000000',
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#7FD896',
    // Additional custom colors
    success: '#2E7D32',
    warning: '#F57C00',
    info: '#0288D1',
  },

  // Fonts with Noto Kufi Arabic
  fonts: configureFonts({ config: fontConfig }),

  // Roundness for cards and buttons
  roundness: 8,

  // Animation configuration
  animation: {
    scale: 1.0,
  },
};

/**
 * Dark theme variant (optional - can be implemented later)
 *
 * Usage:
 * ```typescript
 * import { theme, darkTheme } from '@/config/theme.config';
 *
 * const currentTheme = isDarkMode ? darkTheme : theme;
 * ```
 */
export const darkTheme: MD3Theme = {
  ...theme,
  dark: true,
  colors: {
    ...theme.colors,
    primary: '#7FD896',
    background: '#1C1B1F',
    surface: '#2B2930',
    onBackground: '#E6E1E5',
    onSurface: '#E6E1E5',
  },
};

/**
 * Spacing constants for consistent layout
 * Use with StyleSheet.create()
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Border radius constants
 */
export const borderRadius = {
  small: 4,
  medium: 8,
  large: 16,
  full: 9999, // For circular elements
} as const;

/**
 * Shadow presets for elevation
 */
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
