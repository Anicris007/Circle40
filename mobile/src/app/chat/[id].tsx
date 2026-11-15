import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Composer, MessageBubble } from '@/components/chat';
import { Button, Note } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAppStore } from '@/data/store';
import { ME_ID } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';

const REPLIES = [
  'That sounds great! This weekend works for me.',
  'Haha, same here. All my friends are busy with in-laws now.',
  'Yes! Should we pick a café first?',
  "Love that. I'll check the Plans tab too.",
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useTheme();
  const person = useAppStore((s) => s.people.find((p) => p.id === id));
  const chat = useAppStore((s) => s.directChats.find((d) => d.personId === id));
  const send = useAppStore((s) => s.sendDirectMessage);
  const receive = useAppStore((s) => s.receiveDirectMessage);
  const markRead = useAppStore((s) => s.markChatRead);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const count = chat?.messages.length ?? 0;

  useEffect(() => {
    if (id && chat?.unread) markRead(id);
  }, [id, chat?.unread, markRead]);

  useEffect(() => {
    const t = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [count]);

  if (!person || !chat || !id) {
    return (
      <View style={[styles.fill, styles.missing, { backgroundColor: c.background }]}>
        <Note>This chat isn’t available. You may have blocked this person.</Note>
        <Button label="Back to chats" onPress={() => router.back()} />
      </View>
    );
  }

  const onSend = (text: string) => {
    send(id, text);
    // Sample data only: a pretend reply. Real messages arrive through Supabase Realtime in milestone 2.
    setTimeout(() => receive(id, REPLIES[Math.floor(Math.random() * REPLIES.length)]), 1200);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.fill, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <Stack.Screen options={{ title: person.name }} />
      <ScrollView ref={scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <Note>Tip: meet in a public place first, and share the plan with someone you trust.</Note>
          <Button
            small
            kind="danger"
            label={`Report or block ${person.name}`}
            style={styles.report}
            onPress={() => router.push({ pathname: '/report', params: { type: 'person', id } })}
          />
          {chat.messages.map((m) => (
            <MessageBubble key={m.id} body={m.body} mine={m.senderId === ME_ID} />
          ))}
        </View>
      </ScrollView>
      <Composer placeholder={`Message ${person.name}`} onSend={onSend} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  missing: { padding: Spacing.lg, gap: Spacing.md },
  content: { padding: Spacing.lg },
  inner: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: 8 },
  report: { alignSelf: 'flex-start' },
});
