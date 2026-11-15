/**
 * Returns the color tokens for the phone's current light or dark setting.
 * Docs: https://docs.expo.dev/guides/color-schemes/
 */
import { Colors, type ColorScheme, type ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useColorSchemeName(): ColorScheme {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}

export function useTheme(): ThemeColors {
  return Colors[useColorSchemeName()];
}
