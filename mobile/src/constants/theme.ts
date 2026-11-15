/**
 * Circle40 design tokens. Every screen takes its colors from here, so light and
 * dark mode always match.
 *
 * Palette: white background with ruby red. Light mode uses a deep ruby (#9B111E)
 * on white; dark mode uses a brighter ruby (#F0566A) so it stays readable on
 * near-black. Every text/background pair meets WCAG AA contrast (4.5:1 or more).
 */
import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#FBEDEF',
    text: '#1F1416',
    textSecondary: '#6B5A5D',
    border: '#EADDE0',
    accent: '#9B111E',
    onAccent: '#FFFFFF',
    warm: '#C2185B',
    warmSoft: '#FCE4EA',
    onWarm: '#FFFFFF',
    danger: '#B3261E',
    overlay: 'rgba(31, 20, 22, 0.45)',
  },
  dark: {
    background: '#141012',
    surface: '#1E181A',
    surfaceAlt: '#2C1F23',
    text: '#F5ECEE',
    textSecondary: '#B8A9AD',
    border: '#3A2E32',
    accent: '#F0566A',
    onAccent: '#1A0508',
    warm: '#F48FB1',
    warmSoft: '#3A1D26',
    onWarm: '#1A0508',
    danger: '#FFB4AB',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = { [K in keyof typeof Colors.light]: string };

/** Avatar colors. Readable with white text on both themes. */
export const AvatarColors = ['#9B111E', '#B5552A', '#5B5FC7', '#AD1457', '#2F6FA5', '#6D7A2A', '#7B3FA0'];

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
