import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function MessageBubble({ body, mine, senderName }: { body: string; mine: boolean; senderName?: string }) {
  const c = useTheme();
  return (
    <View
      style={[
        styles.bubble,
        mine
          ? { alignSelf: 'flex-end', backgroundColor: c.accent, borderColor: c.accent }
          : { alignSelf: 'flex-start', backgroundColor: c.surface, borderColor: c.border },
      ]}>
      {senderName ? <AppText variant="small" style={styles.sender} color={c.accent}>{senderName}</AppText> : null}
      <AppText color={mine ? c.onAccent : c.text}>{body}</AppText>
    </View>
  );
}

/** Message box pinned under a chat. Pass `inset` when it sits at the bottom of the screen. */
export function Composer({ placeholder, onSend, inset = true }: {
  placeholder: string; onSend: (text: string) => void; inset?: boolean;
}) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  };
  return (
    <View
      style={[
        styles.composer,
        { backgroundColor: c.surface, borderTopColor: c.border, paddingBottom: (inset ? insets.bottom : 0) + 10 },
      ]}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={c.textSecondary}
        accessibilityLabel={placeholder}
        onSubmitEditing={send}
        returnKeyType="send"
        style={[styles.input, { color: c.text, backgroundColor: c.background, borderColor: c.border }]}
      />
      <Pressable
        onPress={send}
        accessibilityRole="button"
        accessibilityLabel="Send message"
        disabled={!text.trim()}
        style={({ pressed }) => [
          styles.send,
          { backgroundColor: c.accent },
          (pressed || !text.trim()) && { opacity: text.trim() ? 0.85 : 0.5 },
        ]}>
        <AppText variant="bodyStrong" color={c.onAccent}>Send</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '80%', borderWidth: 1, borderRadius: Radius.lg, paddingVertical: 9, paddingHorizontal: 12 },
  sender: { fontWeight: '700', marginBottom: 2 },
  composer: {
    flexDirection: 'row', gap: Spacing.sm, paddingTop: 10, paddingHorizontal: Spacing.md, borderTopWidth: 1,
  },
  input: {
    flex: 1, minWidth: 0, borderWidth: 1, borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15,
  },
  send: { borderRadius: Radius.pill, paddingHorizontal: 16, justifyContent: 'center' },
});
