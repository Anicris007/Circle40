/**
 * Day/night switch: a sun knob slides across and turns into a moon, the track
 * shifts from a soft pink sky to a dark ruby night, and stars fade in.
 * Respects the phone's "reduce motion" setting.
 */
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate, interpolateColor, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming,
} from 'react-native-reanimated';

import { ToggleColors as T } from '@/constants/theme';

const TRACK_W = 72;
const TRACK_H = 38;
const KNOB = 30;
const PAD = (TRACK_H - KNOB) / 2;
const TRAVEL = TRACK_W - KNOB - PAD * 2;

const STARS = [
  { left: 12, top: 9, size: 3 },
  { left: 22, top: 22, size: 2 },
  { left: 30, top: 11, size: 2 },
];

export function ThemeToggle({ dark, onChange, label = 'Dark mode' }: {
  dark: boolean; onChange: (dark: boolean) => void; label?: string;
}) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(dark ? 1 : 0);

  useEffect(() => {
    const to = dark ? 1 : 0;
    progress.value = reduceMotion ? withTiming(to, { duration: 0 }) : withSpring(to, { damping: 15, stiffness: 160 });
  }, [dark, reduceMotion, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [T.dayTrack, T.nightTrack]),
    borderColor: interpolateColor(progress.value, [0, 1], [T.dayBorder, T.nightBorder]),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * TRAVEL },
      { rotate: `${interpolate(progress.value, [0, 1], [0, 360])}deg` },
    ],
    backgroundColor: interpolateColor(progress.value, [0, 1], [T.dayKnob, T.nightKnob]),
  }));

  const sunStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5], [1, 0], 'clamp'),
    transform: [{ scale: interpolate(progress.value, [0, 0.5], [1, 0.4], 'clamp') }],
  }));

  const moonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.5, 1], [0, 1], 'clamp'),
    transform: [{ scale: interpolate(progress.value, [0.5, 1], [0.4, 1], 'clamp') }],
  }));

  const starsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.3, 1], [0, 1], 'clamp'),
  }));

  return (
    <Pressable
      onPress={() => onChange(!dark)}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: dark }}
      hitSlop={8}>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, starsStyle]} pointerEvents="none">
          {STARS.map((s, i) => (
            <View
              key={i}
              style={[styles.star, { left: s.left, top: s.top, width: s.size, height: s.size }]}
            />
          ))}
        </Animated.View>
        <Animated.View style={[styles.knob, knobStyle]}>
          <Animated.View style={[styles.icon, sunStyle]}>
            <Sun />
          </Animated.View>
          <Animated.View style={[styles.icon, moonStyle]}>
            <Moon />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

/** Sun drawn with views (a disc and 8 rays) so it looks the same on every platform. */
function Sun() {
  return (
    <View style={styles.sunBox}>
      {Array.from({ length: 8 }, (_, i) => (
        <View key={i} style={[styles.rayArm, { transform: [{ rotate: `${i * 45}deg` }] }]}>
          <View style={styles.ray} />
        </View>
      ))}
      <View style={styles.sunCore} />
    </View>
  );
}

/** Crescent moon: a disc with a knob-colored disc laid over one side. */
function Moon() {
  return (
    <View style={styles.moonBox}>
      <View style={styles.moonDisc} />
      <View style={styles.moonCut} />
    </View>
  );
}

const SUN = 20;
const MOON = 16;

const styles = StyleSheet.create({
  track: {
    width: TRACK_W, height: TRACK_H, borderRadius: TRACK_H / 2, borderWidth: 1, padding: PAD - 1,
    justifyContent: 'center', overflow: 'hidden',
  },
  knob: {
    width: KNOB, height: KNOB, borderRadius: KNOB / 2, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  icon: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  sunBox: { width: SUN, height: SUN, alignItems: 'center', justifyContent: 'center' },
  rayArm: { position: 'absolute', width: SUN, height: SUN, alignItems: 'center' },
  ray: { width: 2, height: 4, borderRadius: 1, backgroundColor: T.sun },
  sunCore: { width: 10, height: 10, borderRadius: 5, backgroundColor: T.sun },
  moonBox: { width: MOON, height: MOON, overflow: 'hidden', borderRadius: MOON / 2 },
  moonDisc: { width: MOON, height: MOON, borderRadius: MOON / 2, backgroundColor: T.moon },
  moonCut: {
    position: 'absolute', width: MOON, height: MOON, borderRadius: MOON / 2, backgroundColor: T.nightKnob,
    top: -3, left: 6,
  },
  star: { position: 'absolute', borderRadius: 2, backgroundColor: T.star },
});
