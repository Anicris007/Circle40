import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { Composer, MessageBubble } from '@/components/chat';
import {
  AppText, Avatar, Button, Card, DateBadge, Note, Row, Screen, SectionTitle, Tag, TagRow,
} from '@/components/ui';
import { formatPlanDate, isFull, isHost, isMember, spotsLeft } from '@/data/selectors';
import { useAppStore } from '@/data/store';
import { ME_ID } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';

export default function PlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useTheme();
  const plan = useAppStore((s) => s.plans.find((p) => p.id === id));
  const me = useAppStore((s) => s.me);
  const people = useAppStore((s) => s.people);
  const messages = useAppStore((s) => (id ? s.groupChats[id] : undefined));
  const joinPlan = useAppStore((s) => s.joinPlan);
  const leavePlan = useAppStore((s) => s.leavePlan);
  const sendGroupMessage = useAppStore((s) => s.sendGroupMessage);
  const [shared, setShared] = useState(false);

  if (!plan) {
    return (
      <Screen>
        <Note>This plan isn’t available any more. It may have been removed by its host.</Note>
        <Button label="Back to plans" onPress={() => router.back()} />
      </Screen>
    );
  }

  const personFor = (pid: string) => (pid === ME_ID ? me : people.find((p) => p.id === pid));
  const host = personFor(plan.hostId);
  const when = formatPlanDate(plan.startsAt);
  const mine = isHost(plan);
  const going = isMember(plan);
  const full = isFull(plan) && !going;

  return (
    // Pushes the group-chat message box above the keyboard on iOS and Android.
    <KeyboardAvoidingView style={styles.fill} behavior="padding" automaticOffset>
      <Stack.Screen options={{ title: plan.category }} />
      <Screen>
        <Card>
          <View style={styles.when}>
            <DateBadge day={when.day} month={when.month} />
            <View style={styles.flex}>
              <AppText variant="heading" style={styles.title}>{plan.title}</AppText>
              <AppText variant="small" muted>{when.weekday} · {when.time} · {plan.placeName}</AppText>
            </View>
          </View>
          <TagRow>
            <Tag label={plan.category} />
            {plan.womenOnly ? <Tag label="Women only" /> : null}
            <Tag label="Public place" />
          </TagRow>
          {host ? (
            <View style={styles.host}>
              <Avatar name={host.name} colorIndex={host.colorIndex} photoUri={host.photoUri} />
              <View style={styles.flex}>
                <AppText variant="bodyStrong">{mine ? 'You are hosting' : `${host.name} is hosting`}</AppText>
                <AppText variant="small" muted>
                  {mine ? 'People nearby with similar interests can see this plan.' : host.bio}
                </AppText>
              </View>
            </View>
          ) : null}
          {mine ? null : (
            <Button
              kind={going ? 'done' : 'primary'}
              label={going ? 'Going ✓  ·  Tap to leave' : full ? 'This plan is full' : 'Join this plan'}
              disabled={full}
              onPress={() => (going ? leavePlan(plan.id) : joinPlan(plan.id))}
            />
          )}
        </Card>

        <SectionTitle>{`Who's going · ${plan.memberIds.length} of ${plan.maxMembers}`}</SectionTitle>
        <View style={styles.grid}>
          {plan.memberIds.map((pid) => {
            const p = personFor(pid);
            if (!p) return null;
            return (
              <View key={pid} style={styles.member}>
                <Avatar name={p.name} colorIndex={p.colorIndex} size={30} photoUri={p.photoUri} />
                <AppText variant="small">{pid === ME_ID ? 'You' : `${p.name}, ${p.age}`}</AppText>
              </View>
            );
          })}
          {Array.from({ length: spotsLeft(plan) }, (_, i) => (
            <View key={`open-${i}`} style={styles.member}>
              <Avatar name="" colorIndex={-1} size={30} />
              <AppText variant="small" muted>Open spot</AppText>
            </View>
          ))}
        </View>

        <SectionTitle>Group chat</SectionTitle>
        {going ? (
          <View style={styles.thread}>
            {(messages ?? []).length === 0 ? <Note>No messages yet. Say hello to the group.</Note> : null}
            {(messages ?? []).map((m) => (
              <MessageBubble
                key={m.id}
                body={m.body}
                mine={m.senderId === ME_ID}
                senderName={m.senderId === ME_ID ? undefined : personFor(m.senderId)?.name}
              />
            ))}
          </View>
        ) : (
          <Note>Join to see the group chat and say hello before you meet.</Note>
        )}

        <Row>
          <Button
            small
            kind="ghost"
            label={shared ? 'Shared ✓' : 'Share with a trusted contact'}
            onPress={() => setShared(true)}
          />
          {mine ? null : (
            <Button
              small
              kind="danger"
              label="Report plan"
              onPress={() => router.push({ pathname: '/report', params: { type: 'plan', id: plan.id } })}
            />
          )}
        </Row>
        {shared ? (
          <AppText variant="small" color={c.accent}>
            Plan details are marked as shared. Sending them to a contact arrives in a later milestone.
          </AppText>
        ) : null}
      </Screen>
      {going ? (
        <Composer placeholder="Message the group" onSend={(t) => sendGroupMessage(plan.id, t)} />
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1, minWidth: 0 },
  when: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 20 },
  host: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 },
  member: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 8 },
  thread: { gap: 8 },
});
