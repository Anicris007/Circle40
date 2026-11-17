/**
 * Opens the phone's photo picker with a square crop and saves the chosen photo
 * to the profile. The system picker needs no permission prompt on current
 * iOS and Android. Docs: https://docs.expo.dev/versions/v58.0.0/sdk/imagepicker/
 */
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

import { useAppStore } from '@/data/store';

export function usePhotoPicker() {
  const setPhoto = useAppStore((s) => s.setPhoto);
  const [error, setError] = useState<string | null>(null);

  const pickPhoto = async () => {
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) setPhoto(result.assets[0].uri);
    } catch {
      setError('Couldn’t open your photos. Check that Circle40 is allowed to access them in your phone’s settings.');
    }
  };

  const removePhoto = () => setPhoto(undefined);

  return { pickPhoto, removePhoto, error };
}
