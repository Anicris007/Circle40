import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { PenIcon } from '@/components/icons';
import { AppText, Avatar, Button, Card, Chip, ChipRow, Note, Screen, SectionTitle } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import {
  BIO_MAX, NAME_MAX, STATUS_MAX, fullName, validateProfile, type ProfileErrors,
} from '@/data/selectors';
import { useAppStore } from '@/data/store';
import { STATUS_SUGGESTIONS } from '@/data/types';
import { usePhotoPicker } from '@/hooks/use-photo-picker';
import { useTheme } from '@/hooks/use-theme';

export default function EditProfileScreen() {
  const c = useTheme();
  const me = useAppStore((s) => s.me);
  const account = useAppStore((s) => s.account);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const { pickPhoto, removePhoto, error: photoError } = usePhotoPicker();

  const [name, setName] = useState(me.name);
  const [lastName, setLastName] = useState(me.lastName ?? '');
  const [status, setStatus] = useState(me.status ?? '');
  const [age, setAge] = useState(String(me.age));
  const [area, setArea] = useState(me.area);
  const [bio, setBio] = useState(me.bio);
  const [errors, setErrors] = useState<ProfileErrors>({});

  const save = () => {
    const found = validateProfile({ name, lastName, status, age, area, bio });
    setErrors(found);
    if (Object.keys(found).length) return;
    updateProfile({ name, lastName, status, age: Number(age), area, bio });
    router.back();
  };

  /** An editable field: pen icon on the left of the label, then the input. */
  const field = (props: TextInputProps & { label: string; error?: string; hint?: string; count?: number; max?: number }) => {
    const { label, error, hint, style, count, max, ...input } = props;
    return (
      <View style={styles.field}>
        <View style={styles.labelRow}>
          <PenIcon color={c.accent} size={14} />
          <AppText variant="bodyStrong" style={styles.flex}>{label}</AppText>
          {max !== undefined && count !== undefined ? (
            <AppText variant="small" color={count > max ? c.danger : c.textSecondary}>{count} / {max}</AppText>
          ) : null}
        </View>
        {hint ? <AppText variant="small" muted>{hint}</AppText> : null}
        <TextInput
          {...input}
          accessibilityLabel={label}
          placeholderTextColor={c.textSecondary}
          style={[
            styles.input,
            { color: c.text, backgroundColor: c.surface, borderColor: error ? c.danger : c.border },
            style,
          ]}
        />
        {error ? <AppText variant="small" color={c.danger}>{error}</AppText> : null}
      </View>
    );
  };

  return (
    <Screen>
      {/* Photo */}
      <View style={styles.photo}>
        <Avatar name={name.trim() || '?'} colorIndex={me.colorIndex} size={104} photoUri={me.photoUri} />
        <View style={styles.photoButtons}>
          <Button small label={me.photoUri ? 'Change photo' : 'Upload photo'} onPress={pickPhoto} />
          {me.photoUri ? <Button small kind="ghost" label="Remove" onPress={removePhoto} /> : null}
        </View>
        {photoError ? <AppText variant="small" color={c.danger} style={styles.center}>{photoError}</AppText> : null}
        <AppText variant="small" muted style={styles.center}>
          Use a clear photo of your face. It helps people recognise you at the meetup.
        </AppText>
      </View>

      {/* About you */}
      <SectionTitle>Your details</SectionTitle>
      <View style={styles.row2}>
        <View style={styles.flex}>
          {field({ label: 'First name', value: name, onChangeText: setName, error: errors.name, autoCapitalize: 'words', maxLength: NAME_MAX, placeholder: 'First name' })}
        </View>
        <View style={styles.flex}>
          {field({ label: 'Last name', value: lastName, onChangeText: setLastName, error: errors.lastName, autoCapitalize: 'words', maxLength: NAME_MAX, placeholder: 'Last name' })}
        </View>
      </View>
      <AppText variant="small" muted>
        Shown in full on your profile: {fullName({ name: name.trim() || 'First', lastName: lastName.trim() })}
      </AppText>

      {field({
        label: 'Status', hint: 'A short line under your name.', value: status, onChangeText: setStatus,
        error: errors.status, maxLength: STATUS_MAX + 10, placeholder: 'For example: Free this weekend',
        count: status.trim().length, max: STATUS_MAX,
      })}
      <ChipRow>
        {STATUS_SUGGESTIONS.map((s) => (
          <Chip key={s} label={s} selected={status.trim() === s} onPress={() => setStatus(s)} />
        ))}
      </ChipRow>

      {field({ label: 'Age', value: age, onChangeText: setAge, error: errors.age, keyboardType: 'number-pad', maxLength: 3, placeholder: '30' })}
      {field({
        label: 'Neighbourhood', hint: 'Used to suggest plans and people near you. Your exact location is never shown.',
        value: area, onChangeText: setArea, error: errors.area, autoCapitalize: 'words', placeholder: 'For example: Baner',
      })}
      {field({
        label: 'About you', hint: 'What do you like doing? What kind of plans are you hoping for?',
        value: bio, onChangeText: setBio, error: errors.bio, multiline: true, maxLength: BIO_MAX + 50,
        textAlignVertical: 'top', style: styles.bio, placeholder: 'A line or two about you',
        count: bio.trim().length, max: BIO_MAX,
      })}

      {/* Account (read-only) */}
      <SectionTitle hint="These come from how you signed in, so they can’t be edited here.">Account</SectionTitle>
      <Card style={styles.list}>
        <AccountRow label="Activated with phone number" value={account.phone} verified={account.phoneVerified} />
        <View style={[styles.divider, { backgroundColor: c.border }]} />
        <AccountRow label="Registered email" value={account.email} verified={account.emailVerified} />
      </Card>
      <Note>Changing your phone number or email needs a verification code. That arrives with sign-in in the next milestone. The details shown are sample values.</Note>

      <Note>Circle40 is for friendship. Profiles that ask for dates are removed.</Note>

      <View style={styles.actions}>
        <Button kind="ghost" label="Cancel" onPress={() => router.back()} style={styles.flex} />
        <Button label="Save profile" onPress={save} style={styles.flex} />
      </View>
    </Screen>
  );
}

function AccountRow({ label, value, verified }: { label: string; value: string; verified: boolean }) {
  const c = useTheme();
  return (
    <View style={styles.accountRow} accessible accessibilityLabel={`${label}: ${value}. ${verified ? 'Verified' : 'Not verified'}`}>
      <AppText variant="small" muted>{label}</AppText>
      <View style={styles.accountValue}>
        <AppText variant="bodyStrong" style={styles.flex} selectable>{value}</AppText>
        <View style={[styles.pill, { backgroundColor: verified ? c.surfaceAlt : c.warmSoft }]}>
          <AppText variant="small" color={verified ? c.accent : c.text} style={styles.pillText}>
            {verified ? '✓ Verified' : 'Not verified'}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  photoButtons: { flexDirection: 'row', gap: Spacing.sm },
  center: { textAlign: 'center', maxWidth: 320 },
  row2: { flexDirection: 'row', gap: Spacing.md },
  field: { gap: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15 },
  bio: { minHeight: 110 },
  list: { gap: 0, paddingVertical: Spacing.xs },
  accountRow: { paddingVertical: Spacing.md, gap: 4 },
  accountValue: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  pill: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  pillText: { fontWeight: '700' },
  divider: { height: StyleSheet.hairlineWidth },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  flex: { flex: 1, minWidth: 0 },
});
