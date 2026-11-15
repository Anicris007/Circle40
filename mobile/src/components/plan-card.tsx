import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Button, Card, DateBadge, Row, Tag, TagRow } from '@/components/ui';
import { formatPlanDate, isFull, isHost, isMember } from '@/data/selectors';
import { useAppStore } from '@/data/store';
import type { Plan } from '@/data/types';

export function PlanCard({ plan }: { plan: Plan }) {
  const host = useAppStore((s) => (plan.hostId === s.me.id ? s.me : s.people.find((p) => p.id === plan.hostId)));
  const joinPlan = useAppStore((s) => s.joinPlan);
  const leavePlan = useAppStore((s) => s.leavePlan);
  const when = formatPlanDate(plan.startsAt);
  const mine = isHost(plan);
  const going = isMember(plan);
  const full = isFull(plan) && !going;

  return (
    <Card
      onPress={() => router.push({ pathname: '/plan/[id]', params: { id: plan.id } })}
      accessibilityLabel={`${plan.title}, ${when.weekday} ${when.day} ${when.month} at ${when.time}`}>
      <View style={styles.when}>
        <DateBadge day={when.day} month={when.month} />
        <View style={styles.whenText}>
          <AppText variant="heading">{plan.title}</AppText>
          <AppText variant="small" muted>{when.weekday} · {when.time} · {plan.placeName}</AppText>
        </View>
      </View>
      <TagRow>
        <Tag label={plan.category} />
        {plan.womenOnly ? <Tag label="Women only" /> : null}
        <Tag label={`${plan.memberIds.length} of ${plan.maxMembers} going`} />
      </TagRow>
      <Row>
        <View style={styles.host}>
          {host ? <Avatar name={host.name} colorIndex={host.colorIndex} size={28} /> : null}
          <AppText variant="small" style={styles.hostText} numberOfLines={1}>
            Hosted by <AppText variant="small" style={styles.bold}>{mine ? 'you' : host?.name}</AppText>
          </AppText>
        </View>
        {mine ? (
          <AppText variant="small" style={styles.bold}>Your plan</AppText>
        ) : (
          <Button
            small
            kind={going ? 'done' : 'primary'}
            label={going ? 'Going ✓' : full ? 'Full' : 'Join'}
            disabled={full}
            onPress={() => (going ? leavePlan(plan.id) : joinPlan(plan.id))}
            accessibilityLabel={going ? `Leave ${plan.title}` : `Join ${plan.title}`}
          />
        )}
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  when: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  whenText: { flex: 1, minWidth: 0, gap: 2 },
  host: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 },
  hostText: { flexShrink: 1 },
  bold: { fontWeight: '700' },
});
