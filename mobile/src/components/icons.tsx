/**
 * Small icons drawn with plain views, so they look the same on iOS, Android
 * and web without an icon font.
 */
import { StyleSheet, View } from 'react-native';

/** A pen tilted 45°: body, a band near the top, and a pointed nib. */
export function PenIcon({ color, size = 16 }: { color: string; size?: number }) {
  const s = size / 16;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ transform: [{ rotate: '45deg' }], alignItems: 'center' }}>
        <View style={{ width: 5 * s, height: 3 * s, borderTopLeftRadius: 1.5 * s, borderTopRightRadius: 1.5 * s, backgroundColor: color }} />
        <View style={{ width: 5 * s, height: 1 * s }} />
        <View style={{ width: 5 * s, height: 9 * s, backgroundColor: color }} />
        <View
          style={{
            width: 0, height: 0,
            borderLeftWidth: 2.5 * s, borderRightWidth: 2.5 * s, borderTopWidth: 4 * s,
            borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: color,
          }}
        />
      </View>
    </View>
  );
}

/** A camera: body, viewfinder bump, and a lens ring. */
export function CameraIcon({ color, background, size = 18 }: { color: string; background: string; size?: number }) {
  const s = size / 18;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 7 * s, height: 3 * s, borderTopLeftRadius: 1.5 * s, borderTopRightRadius: 1.5 * s, backgroundColor: color }} />
      <View style={[styles.cameraBody, { width: 18 * s, height: 12 * s, borderRadius: 3 * s, backgroundColor: color }]}>
        <View style={{ width: 7 * s, height: 7 * s, borderRadius: 3.5 * s, borderWidth: 1.5 * s, borderColor: background }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraBody: { alignItems: 'center', justifyContent: 'center' },
});
