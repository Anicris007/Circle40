/**
 * Device settings that should survive an app restart. Kept apart from the
 * sample-data store so resetting sample data never resets the user's choices.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** 'system' follows the phone's light/dark setting. */
export type ThemePreference = 'system' | 'light' | 'dark';

interface SettingsState {
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
}

/** Tells React Native (and so native UI like the tab bar and keyboard) which scheme to use. */
export function applyThemePreference(pref: ThemePreference) {
  try {
    Appearance.setColorScheme(pref === 'system' ? 'auto' : pref);
  } catch {
    // Some platforms (web) don't support an override; useColorSchemeName still applies it.
  }
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      themePreference: 'system',
      setThemePreference: (themePreference) => {
        applyThemePreference(themePreference);
        set({ themePreference });
      },
    }),
    {
      name: 'circle40-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ themePreference: s.themePreference }),
      onRehydrateStorage: () => (state) => {
        if (state) applyThemePreference(state.themePreference);
      },
    },
  ),
);
