/**
 * Shared building blocks. Every color comes from useTheme(), so each piece
 * works in light and dark mode without extra code in the screens.
 */
import type { ReactNode } from 'react';
import {
  Pressable, ScrollView, StyleSheet, Text, View,
  type PressableProps, type StyleProp, type TextProps, type TextStyle, type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarColors, BottomTabInset, MaxContentWidth, Radius, Spacing, TopTabInset, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextVariant = keyof typeof Type;

export function AppText({
  variant = 'body', muted, color, style, ...rest
}: TextProps & { variant?: TextVariant; muted?: boolean; color?: string }) {
  const c = useTheme();
  return (
    <Text
      {...rest}
      style={[Type[variant], { color: color ?? (muted ? c.textSecondary : c.text) }, style as StyleProp<TextStyle>]}
    />
  );
}

/** Scrolling page body. `tab` adds room for the status bar and tab bar. */
export function Screen({
  title, right, children, tab, scroll = true, contentStyle,
}: {
  title?: string; right?: ReactNode; children: ReactNode; tab?: boolean; scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const inner = (
    <View style={[styles.inner, contentStyle]}>
      {title ? (
        <View style={styles.titleRow}>
          <AppText variant="title" accessibilityRole="header">{title}</AppText>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
  const padding = {
    paddingTop: tab ? insets.top + TopTabInset + Spacing.md : Spacing.lg,
    paddingBottom: (tab ? BottomTabInset : 0) + insets.bottom + Spacing.xxl,
    paddingLeft: Math.max(Spacing.lg, insets.left),
    paddingRight: Math.max(Spacing.lg, insets.right),
  };
  if (!scroll) {
    return <View style={[styles.fill, { backgroundColor: c.background }, padding]}>{inner}</View>;
  }
  return (
    <ScrollView
      style={[styles.fill, { backgroundColor: c.background }]}
      contentContainerStyle={padding}
      keyboardShouldPersistTaps="handled">
      {inner}
    </ScrollView>
  );
}

export function Card({ children, style, onPress, accessibilityLabel }: {
  children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string;
}) {
  const c = useTheme();
  const base = [styles.card, { backgroundColor: c.surface, borderColor: c.border }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [base, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: selected ? c.text : c.surface, borderColor: selected ? c.text : c.border },
        pressed && { opacity: 0.8 },
      ]}>
      <AppText variant="small" style={styles.chipText} color={selected ? c.background : c.text}>{label}</AppText>
    </Pressable>
  );
}

export function ChipRow({ children, wrap }: { children: ReactNode; wrap?: boolean }) {
  if (wrap) return <View style={styles.chipWrap}>{children}</View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
      {children}
    </ScrollView>
  );
}

type ButtonKind = 'primary' | 'ghost' | 'done' | 'warm' | 'danger';

export function Button({
  label, kind = 'primary', small, style, disabled, ...rest
}: Omit<PressableProps, 'style' | 'children'> & {
  label: string; kind?: ButtonKind; small?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  const palette: Record<ButtonKind, { bg: string; fg: string; border: string }> = {
    primary: { bg: c.accent, fg: c.onAccent, border: c.accent },
    ghost: { bg: 'transparent', fg: c.text, border: c.border },
    done: { bg: c.surfaceAlt, fg: c.accent, border: c.surfaceAlt },
    warm: { bg: c.warm, fg: c.onWarm, border: c.warm },
    danger: { bg: 'transparent', fg: c.danger, border: c.border },
  };
  const p = palette[kind];
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: p.bg, borderColor: p.border },
        (pressed || disabled) && { opacity: disabled ? 0.5 : 0.85 },
        style,
      ]}>
      <AppText variant="bodyStrong" color={p.fg} style={small ? styles.buttonSmallText : undefined}>{label}</AppText>
    </Pressable>
  );
}

export function Tag({ label, warm }: { label: string; warm?: boolean }) {
  const c = useTheme();
  return (
    <View style={[styles.tag, { backgroundColor: warm ? c.warmSoft : c.surfaceAlt }]}>
      <AppText variant="small" style={styles.tagText} color={warm ? c.text : c.accent}>{label}</AppText>
    </View>
  );
}

export function TagRow({ children }: { children: ReactNode }) {
  return <View style={styles.tagRow}>{children}</View>;
}

export function Avatar({ name, colorIndex, size = 36 }: { name: string; colorIndex: number; size?: number }) {
  const c = useTheme();
  const isOpen = colorIndex < 0;
  return (
    <View
      accessible={false}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        isOpen
          ? { backgroundColor: c.surfaceAlt, borderColor: c.border, borderWidth: 1, borderStyle: 'dashed' }
          : { backgroundColor: AvatarColors[colorIndex % AvatarColors.length] },
      ]}>
      <Text style={{ color: isOpen ? c.textSecondary : '#FFFFFF', fontWeight: '700', fontSize: size * 0.38 }}>
        {isOpen ? '+' : name.charAt(0)}
      </Text>
    </View>
  );
}

export function DateBadge({ day, month }: { day: string; month: string }) {
  const c = useTheme();
  return (
    <View style={[styles.dateBadge, { backgroundColor: c.warmSoft }]}>
      <AppText style={styles.dateDay}>{day}</AppText>
      <AppText variant="label" muted style={styles.dateMonth}>{month.toUpperCase()}</AppText>
    </View>
  );
}

export function Note({ children }: { children: ReactNode }) {
  const c = useTheme();
  return (
    <View style={[styles.note, { backgroundColor: c.surfaceAlt }]}>
      <AppText variant="small" muted>{children}</AppText>
    </View>
  );
}

export function SectionTitle({ children, hint }: { children: string; hint?: string }) {
  return (
    <View style={styles.section}>
      <AppText variant="heading" accessibilityRole="header">{children}</AppText>
      {hint ? <AppText variant="small" muted>{hint}</AppText> : null}
    </View>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  inner: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  card: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg - 2, gap: Spacing.md },
  chip: { borderWidth: 1, borderRadius: Radius.pill, paddingVertical: 7, paddingHorizontal: 12 },
  chipText: { fontWeight: '600' },
  chipScroll: { gap: Spacing.sm, paddingRight: Spacing.lg },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  button: {
    borderWidth: 1, borderRadius: Radius.pill, paddingVertical: 12, paddingHorizontal: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  buttonSmall: { paddingVertical: 7, paddingHorizontal: 14 },
  buttonSmallText: { fontSize: 13 },
  tag: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  tagText: { fontSize: 12, fontWeight: '700' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  dateBadge: { width: 48, borderRadius: Radius.md, paddingVertical: 5, alignItems: 'center' },
  dateDay: { fontSize: 19, fontWeight: '800', lineHeight: 22 },
  dateMonth: { fontSize: 10 },
  note: { borderRadius: Radius.md, paddingVertical: 10, paddingHorizontal: Spacing.md },
  section: { gap: 2, marginTop: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
});
