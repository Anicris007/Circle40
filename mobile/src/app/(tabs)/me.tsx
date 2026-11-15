import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Card, Chip, ChipRow, DateBadge, Note, Row, Screen, SectionTitle } from '@/components/ui';
import { formatPlanDate, isMember, sortByStart } from '@/data/selectors';
import { useAppStore } from '@/data/store';
import { ALL_INTERESTS } from '@/data/types';
import { ThemeToggle } from '@/components/theme-toggle';
import { useSettings } from '@/data/settings';
import { useColorSchemeName, useTheme } from '@/hooks/use-theme';

export default function MeScreen() {
  const c = useTheme();
  const me = useAppStore((s) => s.me);
  const plans = useAppStore((s) => s.plans);
  const people = useAppStore((s) => s.people);
  const meetups = useAppStore((s) => s.meetupCounts);
  const blockedIds = useAppStore((s) => s.blockedIds);
  const toggleInterest = useAppStore((s) => s.toggleInterest);
  const scheme = useColorSchemeName();
  const pref = useSettings((s) => s.themePreference);
  const setPref = useSettings((s) => s.setThemePreference);

  const mine = sortByStart(plans.filter(isMember));
  const known = Object.entries(meetups)
    .filter(([id]) => !blockedIds.includes(id))
    .map(([id, count]) => ({ person: people.find((p) => p.id === id), count }))
    .filter((x) => x.person);

  return (
    <Screen tab title="Me">
      <Card>
        <View style={styles.profile}>
          <Avatar name="Y" colorIndex={me.colorIndex} size={56} />
          <View style={styles.flex}>
            <AppText variant="heading">Your profile</AppText>
            <AppText variant="small" muted>{me.area} · Looking for friends to go out with</AppText>
          </View>
        </View>
      </Card>

      <Card>
        <Row>
          <View style={styles.flex}>
            <AppText variant="bodyStrong">Dark mode</AppText>
            <AppText variant="small" muted>
              {pref === 'system' ? `Matching your phone (${scheme})` : scheme === 'dark' ? 'On' : 'Off'}
            </AppText>
          </View>
          <ThemeToggle dark={scheme === 'dark'} onChange={(dark) => setPref(dark ? 'dark' : 'light')} />
        </Row>
        <Row>
          <AppText variant="small" muted style={styles.flex}>Follow your phone’s light/dark setting</AppText>
          <Chip label={pref === 'system' ? 'Matching phone ✓' : 'Match phone'} selected={pref === 'system'} onPress={() => setPref('system')} />
        </Row>
      </Card>

      <SectionTitle hint="Tap to change. The People tab updates its matches.">Your interests</SectionTitle>
      <ChipRow wrap>
        {ALL_INTERESTS.map((i) => (
          <Chip key={i} label={i} selected={me.interests.includes(i)} onPress={() => toggleInterest(i)} />
        ))}
      </ChipRow>

      <SectionTitle>Your upcoming plans</SectionTitle>
      {mine.length ? (
        mine.map((p) => {
          const when = formatPlanDate(p.startsAt);
          return (
            <Card
              key={p.id}
              style={styles.planRow}
              onPress={() => router.push({ pathname: '/plan/[id]', params: { id: p.id } })}
              accessibilityLabel={`${p.title}, ${when.day} ${when.month}`}>
              <DateBadge day={when.day} month={when.month} />
              <View style={styles.flex}>
                <AppText variant="bodyStrong">{p.title}</AppText>
                <AppText variant="small" muted>{when.time} · {p.placeName}</AppText>
              </View>
            </Card>
          );
        })
      ) : (
        <Note>You haven’t joined a plan yet. Plans you join or post show up here.</Note>
      )}

      <SectionTitle hint="People you've met at least twice. They see your new plans first.">Regulars</SectionTitle>
      {known.map(({ person, count }) => (
        <Card key={person!.id} style={styles.planRow}>
          <Avatar name={person!.name} colorIndex={person!.colorIndex} />
          <View style={styles.flex}>
            <AppText variant="bodyStrong">{person!.name}</AppText>
            <AppText variant="small" muted>
              {count >= 2 ? `Regular · met ${count} times` : 'Met once. Meet again to become regulars.'}
            </AppText>
          </View>
          {count >= 2 ? <AppText variant="small" color={c.accent} style={styles.bold}>★ Regular</AppText> : null}
        </Card>
      ))}

      <SectionTitle>Safety</SectionTitle>
      <Card>
        <Row><AppText>Share my plans with a trusted contact</AppText><AppText color={c.accent} style={styles.bold}>On</AppText></Row>
        <Row><AppText>Only show plans in public places</AppText><AppText color={c.accent} style={styles.bold}>On</AppText></Row>
        <Row><AppText>Women-only plans</AppText><AppText muted>Available</AppText></Row>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1, minWidth: 0 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bold: { fontWeight: '700' },
});
