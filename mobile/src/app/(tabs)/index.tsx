import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import { PlanCard } from '@/components/plan-card';
import { AppText, Button, Chip, ChipRow, Note, Screen } from '@/components/ui';
import { sortByStart } from '@/data/selectors';
import { useAppStore } from '@/data/store';
import { PLAN_CATEGORIES, type PlanCategory } from '@/data/types';

type Filter = 'All' | PlanCategory;

export default function PlansScreen() {
  const plans = useAppStore((s) => s.plans);
  const blockedIds = useAppStore((s) => s.blockedIds);
  const area = useAppStore((s) => s.me.area);
  const [filter, setFilter] = useState<Filter>('All');

  const visible = useMemo(
    () => sortByStart(plans.filter((p) => !blockedIds.includes(p.hostId) && (filter === 'All' || p.category === filter))),
    [plans, blockedIds, filter],
  );

  return (
    <Screen
      tab
      title="Plans"
      right={<Button small kind="warm" label="+ Post a plan" onPress={() => router.push('/new-plan')} />}>
      <AppText variant="small" muted>Near {area} · within 5 km</AppText>
      <ChipRow>
        {(['All', ...PLAN_CATEGORIES] as Filter[]).map((f) => (
          <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ChipRow>
      <Note>Example plans for now. First meetups are always in public places.</Note>
      {visible.length ? (
        visible.map((p) => <PlanCard key={p.id} plan={p} />)
      ) : (
        <Note>No {filter.toLowerCase()} plans yet. Post one and people nearby with similar interests will see it.</Note>
      )}
    </Screen>
  );
}
