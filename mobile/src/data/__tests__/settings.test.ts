import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

import { useSettings } from '../settings';

jest.mock('@react-native-async-storage/async-storage', () =>
  // jest.mock factories run before imports, so the mock has to be loaded with require().
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('theme preference', () => {
  beforeEach(() => {
    useSettings.setState({ themePreference: 'system' });
  });

  it('starts by following the phone', () => {
    expect(useSettings.getState().themePreference).toBe('system');
  });

  it('forces the app scheme and maps "system" to auto', () => {
    const spy = jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => {});
    useSettings.getState().setThemePreference('dark');
    expect(spy).toHaveBeenLastCalledWith('dark');
    useSettings.getState().setThemePreference('light');
    expect(spy).toHaveBeenLastCalledWith('light');
    useSettings.getState().setThemePreference('system');
    expect(spy).toHaveBeenLastCalledWith('auto');
    spy.mockRestore();
  });

  it('saves the choice to device storage', async () => {
    jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => {});
    useSettings.getState().setThemePreference('dark');
    await new Promise((r) => setTimeout(r, 0));
    const saved = await AsyncStorage.getItem('circle40-settings');
    expect(JSON.parse(saved ?? '{}').state).toEqual({ themePreference: 'dark' });
  });
});
