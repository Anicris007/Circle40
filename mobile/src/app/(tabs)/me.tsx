import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemeToggle } from '@/components/theme-toggle';
import {
  AppText, Avatar, Button, Card, Chip, ChipRow, DateBadge, Note, Row, Screen, SectionTitle,
} from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import {
  formatPlanDate, isMember, profileBadges, profileStats, sortByStart, type Badge,
} from '@/data/selectors';
import { useSettings } from '@/data/settings';
import { useAppStore } from '@/data/store';
import { ALL_INTERESTS } from '@/data/types';
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

  const stats = profileStats(plans, meetups, blockedIds);
  const badges = profileBadges(me, stats);
  const earnedCount = badges.filter((b) => b.earned).length;
  const upcoming = sortByStart(plans.filter(isMember));
  const known = Object.entries(meetups)
    .filter(([id]) => !blockedIds.includes(id))
    .map(([id, count]) => ({ person: people.find((p) => p.id === id), count }))
    .filter((x): x is { person: NonNullable<typeof x.person>; count: number } => !!x.person)
    .sort((a, b) => b.count - a.count);

  return (
    <Screen tab title="Me">
      {/* Profile header */}
      <Card style={styles.header}>
        <View style={styles.headerTop}>
          <Avatar name={me.name} colorIndex={me.colorIndex} size={72} />
          <View style={styles.flex}>
            <AppText variant="title" style={styles.name}>{me.name}, {me.age}</AppText>
            <AppText variant="small" muted>{me.area}</AppText>
            {me.verified ? (
              <View style={[styles.verified, { backgroundColor: c.surfaceAlt }]}>
                <AppText variant="small" color={c.accent} style={styles.bold}>✓ ID verified</AppText>
              </View>
            ) : null}
          </View>
        </View>
        {me.bio ? <AppText>{me.bio}</AppText> : <AppText muted>Add a line about yourself so people know what plans you enjoy.</AppText>}
        <Button kind="ghost" small label="Edit profile" onPress={() => router.push('/edit-profile')} style={styles.editButton} />
      </Card>

      {/* Stats */}
      <View style={styles.stats} accessibilityRole="summary">
        <Stat value={stats.plansJoined} label="Plans joined" />
        <Stat value={stats.plansHosted} label="Hosted" />
        <Stat value={stats.peopleMet} label="People met" />
        <Stat value={stats.regulars} label="Regulars" />
      </View>

      {/* Badges */}
      <SectionTitle hint={`${earnedCount} of ${badges.length} earned. Badges come from what you actually do on Circle40.`}>
        Badges
      </SectionTitle>
      <View style={styles.badgeGrid}>
        {badges.map((b) => <BadgeTile key={b.id} badge={b} />)}
      </View>

      {/* Appearance */}
      <SectionTitle>Appearance</SectionTitle>
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
          <Chip
            label={pref === 'system' ? 'Matching phone ✓' : 'Match phone'}
            selected={pref === 'system'}
            onPress={() => setPref('system')}
          />
        </Row>
      </Card>

      {/* Interests */}
      <SectionTitle hint="Tap to change. The People tab updates its matches.">Your interests</SectionTitle>
      <ChipRow wrap>
        {ALL_INTERESTS.map((i) => (
          <Chip key={i} label={i} selected={me.interests.includes(i)} onPress={() => toggleInterest(i)} />
        ))}
      </ChipRow>

      {/* Upcoming plans */}
      <SectionTitle>Your upcoming plans</SectionTitle>
      {upcoming.length ? (
        upcoming.map((p) => {
          const when = formatPlanDate(p.startsAt);
          return (
            <Card
              key={p.id}
              style={styles.listRow}
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

      {/* Regulars */}
      <SectionTitle hint="People you’ve met at least twice. They see your new plans first.">Regulars</SectionTitle>
      {known.length ? known.map(({ person, count }) => (
        <Card key={person.id} style={styles.listRow}>
          <Avatar name={person.name} colorIndex={person.colorIndex} />
          <View style={styles.flex}>
            <AppText variant="bodyStrong">{person.name}</AppText>
            <AppText variant="small" muted>
              {count >= 2 ? `Met ${count} times` : 'Met once. Meet again to become regulars.'}
            </AppText>
          </View>
          {count >= 2 ? <AppText variant="small" color={c.accent} style={styles.bold}>★ Regular</AppText> : null}
        </Card>
      )) : <Note>No meetups yet. After a plan, the people you met show up here.</Note>}

      {/* Safety */}
      <SectionTitle>Safety</SectionTitle>
      <Card style={styles.list}>
        <SettingRow label="Share my plans with a trusted contact" value="On" on />
        <Divider />
        <SettingRow label="Only show plans in public places" value="On" on />
        <Divider />
        <SettingRow label="Women-only plans" value="Available" />
        <Divider />
        <SettingRow label="Blocked people" value={String(blockedIds.length)} />
      </Card>
    </Screen>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  const c = useTheme();
  return (
    <View
      style={[styles.stat, { backgroundColor: c.surface, borderColor: c.border }]}
      accessible
      accessibilityLabel={`${value} ${label}`}>
      <AppText style={[styles.statValue, { color: c.accent }]}>{value}</AppText>
      <AppText variant="small" muted style={styles.statLabel} numberOfLines={1}>{label}</AppText>
    </View>
  );
}

function BadgeTile({ badge }: { badge: Badge }) {
  const c = useTheme();
  const earned = badge.earned;
  return (
    <View
      style={[
        styles.badge,
        earned
          ? { backgroundColor: c.surfaceAlt, borderColor: c.accent }
          : { backgroundColor: c.surface, borderColor: c.border, borderStyle: 'dashed' },
      ]}
      accessible
      accessibilityLabel={earned ? `${badge.label}, earned` : `${badge.label}, locked. ${badge.howTo}`}>
      <View style={[styles.badgeIcon, { backgroundColor: earned ? c.accent : c.surfaceAlt }]}>
        <AppText variant="bodyStrong" color={earned ? c.onAccent : c.textSecondary}>{earned ? '✓' : '·'}</AppText>
      </View>
      <View style={styles.flex}>
        <AppText variant="bodyStrong" color={earned ? c.text : c.textSecondary} numberOfLines={1}>{badge.label}</AppText>
        <AppText variant="small" muted numberOfLines={2}>{earned ? 'Earned' : badge.howTo}</AppText>
      </View>
    </View>
  );
}

function SettingRow({ label, value, on }: { label: string; value: string; on?: boolean }) {
  const c = useTheme();
  return (
    <Row style={styles.settingRow}>
      <AppText style={styles.flex}>{label}</AppText>
      <AppText color={on ? c.accent : c.textSecondary} style={on ? styles.bold : undefined}>{value}</AppText>
    </Row>
  );
}

function Divider() {
  const c = useTheme();
  return <View style={[styles.divider, { backgroundColor: c.border }]} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  bold: { fontWeight: '700' },
  header: { gap: Spacing.md },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  name: { fontSize: 24 },
  verified: { alignSelf: 'flex-start', borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
  editButton: { alignSelf: 'flex-start' },
  stats: { flexDirection: 'row', gap: Spacing.sm },
  stat: { flex: 1, minWidth: 0, borderWidth: 1, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 11, textAlign: 'center' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badge: {
    width: '48.5%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1,
    borderRadius: Radius.md, padding: Spacing.md,
  },
  badgeIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  list: { gap: 0, paddingVertical: Spacing.xs },
  settingRow: { paddingVertical: Spacing.md },
  divider: { height: StyleSheet.hairlineWidth },
});
