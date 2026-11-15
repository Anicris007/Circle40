/**
 * Circle40 design tokens. Every screen takes its colors from here, so light and
 * dark mode always match. The palette follows the clickable prototype.
 */
import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#EEF3F2',
    surface: '#FFFFFF',
    surfaceAlt: '#E3ECEA',
    text: '#12282A',
    textSecondary: '#5B706F',
    border: '#CFDCD9',
    accent: '#0F7A6E',
    onAccent: '#FFFFFF',
    warm: '#F0A23A',
    warmSoft: '#FCEBD2',
    onWarm: '#2A1A04',
    danger: '#B3261E',
    overlay: 'rgba(5, 20, 20, 0.45)',
  },
  dark: {
    background: '#0D1A1B',
    surface: '#152627',
    surfaceAlt: '#1C3233',
    text: '#E6F0EE',
    textSecondary: '#93A9A6',
    border: '#294546',
    accent: '#3CC2AE',
    onAccent: '#06201C',
    warm: '#F4B357',
    warmSoft: '#3A2D19',
    onWarm: '#2A1A04',
    danger: '#F2B8B5',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = { [K in keyof typeof Colors.light]: string };

/** Avatar colors. Readable with white text on both themes. */
export const AvatarColors = ['#0F7A6E', '#C26A1B', '#5B5FC7', '#B3416B', '#2F7FB5', '#7A8B2C', '#8A4FB0'];

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const Type = {
  title: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.4 },
  heading: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 21 },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const, lineHeight: 21 },
  small: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.6 },
};

/** Space to leave under scrolling content so the tab bar never covers it. */
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 640;
