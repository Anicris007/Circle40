import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText, Button, Note, Screen, SectionTitle } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useAppStore } from '@/data/store';
import { REPORT_REASONS, type ReportReason } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';

export default function ReportScreen() {
  const { type, id } = useLocalSearchParams<{ type: 'person' | 'plan'; id: string }>();
  const c = useTheme();
  const person = useAppStore((s) => (type === 'person' ? s.people.find((p) => p.id === id) : undefined));
  const plan = useAppStore((s) => (type === 'plan' ? s.plans.find((p) => p.id === id) : undefined));
  const report = useAppStore((s) => s.report);
  const block = useAppStore((s) => s.block);

  const [reason, setReason] = useState<ReportReason>('romantic_advances');
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [sent, setSent] = useState<null | { blocked: boolean }>(null);

  const name = person?.name ?? (plan ? 'this plan' : 'this');

  if (!id || (!person && !plan)) {
    return (
      <Screen>
        <Note>There’s nothing to report here any more.</Note>
        <Button label="Close" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (sent) {
    return (
      <Screen>
        <SectionTitle>{sent.blocked ? `Reported and blocked ${name}` : 'Report sent'}</SectionTitle>
        <AppText muted>
          {sent.blocked
            ? `${name} can no longer message you or see your plans. Our team reviews reports within 24 hours.`
            : 'Our team reviews reports within 24 hours. Thanks for keeping Circle40 safe.'}
        </AppText>
        <Button
          label="Done"
          onPress={() => {
            if (sent.blocked) {
              router.dismissAll();
              router.navigate('/chats');
            } else {
              router.back();
            }
          }}
        />
      </Screen>
    );
  }

  const submit = () => {
    report(type === 'person' ? 'person' : 'plan', id, reason);
    const didBlock = type === 'person' && alsoBlock;
    if (didBlock) block(id);
    setSent({ blocked: didBlock });
  };

  return (
    <Screen>
      <SectionTitle hint="Reports are private. Nobody is told who reported them.">{`Report ${name}`}</SectionTitle>
      <View accessibilityRole="radiogroup" style={styles.list}>
        {REPORT_REASONS.map((r) => {
          const selected = reason === r.value;
          return (
            <Pressable
              key={r.value}
              onPress={() => setReason(r.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              style={[
                styles.option,
                { backgroundColor: c.surface, borderColor: selected ? c.accent : c.border },
              ]}>
              <View style={[styles.radio, { borderColor: selected ? c.accent : c.border }]}>
                {selected ? <View style={[styles.dot, { backgroundColor: c.accent }]} /> : null}
              </View>
              <AppText>{r.label}</AppText>
            </Pressable>
          );
        })}
      </View>

      {type === 'person' ? (
        <View style={[styles.option, { backgroundColor: c.surface, borderColor: c.border }]}>
          <AppText style={styles.flex}>Also block {name}</AppText>
          <Switch
            value={alsoBlock}
            onValueChange={setAlsoBlock}
            trackColor={{ true: c.accent, false: c.border }}
            accessibilityLabel={`Also block ${name}`}
          />
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button kind="ghost" label="Cancel" onPress={() => router.back()} style={styles.flex} />
        <Button label="Send report" onPress={submit} style={styles.flex} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.sm },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 1, borderRadius: Radius.md,
    padding: Spacing.md,
  },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  flex: { flex: 1, minWidth: 0 },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
});
