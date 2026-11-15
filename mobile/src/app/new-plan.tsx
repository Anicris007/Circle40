import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Switch, TextInput, View } from 'react-native';

import { AppText, Button, Chip, ChipRow, Note, Screen, SectionTitle } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { parseTime } from '@/data/selectors';
import { useAppStore } from '@/data/store';
import { PLAN_CATEGORIES, type PlanCategory } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';

const SIZES = [2, 3, 4, 6];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n: number) => n.toString().padStart(2, '0');

/** The next 7 days as local YYYY-MM-DD strings, with short labels. */
function nextDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${DAY_NAMES[d.getDay()]} ${d.getDate()}`;
    return { label, value: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` };
  });
}

export default function NewPlanScreen() {
  const c = useTheme();
  const createPlan = useAppStore((s) => s.createPlan);
  const days = useMemo(() => nextDays(), []);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PlanCategory>('Food');
  const [size, setSize] = useState(4);
  const [day, setDay] = useState(days[2].value);
  const [time, setTime] = useState('19:00');
  const [place, setPlace] = useState('');
  const [womenOnly, setWomenOnly] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    title: title.trim().length < 3 ? 'Describe the plan in a few words (at least 3 characters).' : null,
    time: parseTime(time) ? null : 'Enter a time like 19:00 (24-hour).',
    place: place.trim().length < 2 ? 'Add a public place, such as a café or mall.' : null,
  };
  const valid = !errors.title && !errors.time && !errors.place;

  const inputStyle = [styles.input, { color: c.text, backgroundColor: c.surface, borderColor: c.border }];

  const submit = () => {
    setSubmitted(true);
    if (!valid) return;
    const plan = createPlan({
      title: title.trim(),
      category,
      startsAt: `${day}T${parseTime(time)}:00`,
      placeName: place.trim(),
      maxMembers: size,
      womenOnly,
    });
    router.replace({ pathname: '/plan/[id]', params: { id: plan.id } });
  };

  const error = (msg: string | null) =>
    submitted && msg ? <AppText variant="small" color={c.danger}>{msg}</AppText> : null;

  return (
    <Screen>
      <SectionTitle>What do you want to do?</SectionTitle>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="For example: try the new momo place"
        placeholderTextColor={c.textSecondary}
        accessibilityLabel="What do you want to do?"
        style={inputStyle}
      />
      {error(errors.title)}

      <SectionTitle>Type</SectionTitle>
      <ChipRow wrap>
        {PLAN_CATEGORIES.map((cat) => (
          <Chip key={cat} label={cat} selected={category === cat} onPress={() => setCategory(cat)} />
        ))}
      </ChipRow>

      <SectionTitle hint="Small groups make first meetups easier.">Group size</SectionTitle>
      <ChipRow wrap>
        {SIZES.map((n) => <Chip key={n} label={`${n} people`} selected={size === n} onPress={() => setSize(n)} />)}
      </ChipRow>

      <SectionTitle>Day</SectionTitle>
      <ChipRow>
        {days.map((d) => <Chip key={d.value} label={d.label} selected={day === d.value} onPress={() => setDay(d.value)} />)}
      </ChipRow>

      <SectionTitle>Time</SectionTitle>
      <TextInput
        value={time}
        onChangeText={setTime}
        placeholder="19:00"
        placeholderTextColor={c.textSecondary}
        accessibilityLabel="Time, 24-hour"
        keyboardType="numbers-and-punctuation"
        style={inputStyle}
      />
      {error(errors.time)}

      <SectionTitle hint="First meetups are always in public places.">Place</SectionTitle>
      <TextInput
        value={place}
        onChangeText={setPlace}
        placeholder="For example: FC Road"
        placeholderTextColor={c.textSecondary}
        accessibilityLabel="Public place"
        style={inputStyle}
      />
      {error(errors.place)}

      <View style={[styles.switchRow, { borderColor: c.border, backgroundColor: c.surface }]}>
        <View style={styles.flex}>
          <AppText variant="bodyStrong">Women only</AppText>
          <AppText variant="small" muted>Only women can see and join this plan.</AppText>
        </View>
        <Switch
          value={womenOnly}
          onValueChange={setWomenOnly}
          trackColor={{ true: c.accent, false: c.border }}
          accessibilityLabel="Women only"
        />
      </View>

      <Note>Circle40 is for friendship. Plans asking for dates are removed.</Note>
      <View style={styles.actions}>
        <Button kind="ghost" label="Cancel" onPress={() => router.back()} style={styles.flex} />
        <Button label="Post plan" onPress={submit} style={styles.flex} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15 },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 1, borderRadius: Radius.md,
    padding: Spacing.md, marginTop: Spacing.sm,
  },
  flex: { flex: 1, minWidth: 0 },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
});
