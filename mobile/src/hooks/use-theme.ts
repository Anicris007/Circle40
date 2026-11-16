/**
 * Returns the color tokens for the active scheme: the user's choice on the Me
 * tab (Light / Dark), or the phone's setting when they picked System.
 * Docs: https://docs.expo.dev/guides/color-schemes/
 */
import { Colors, type ColorScheme, type ThemeColors } from '@/constants/theme';
import { useSettings } from '@/data/settings';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useColorSchemeName(): ColorScheme {
  const system = useColorScheme();
  const pref = useSettings((s) => s.themePreference);
  if (pref !== 'system') return pref;
  return system === 'dark' ? 'dark' : 'light';
}

export function useTheme(): ThemeColors {
  return Colors[useColorSchemeName()];
}
