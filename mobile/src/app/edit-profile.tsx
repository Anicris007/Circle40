import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText, Avatar, Button, Note, Screen, SectionTitle } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { BIO_MAX, validateProfile, type ProfileErrors } from '@/data/selectors';
import { useAppStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';

export default function EditProfileScreen() {
  const c = useTheme();
  const me = useAppStore((s) => s.me);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [name, setName] = useState(me.name);
  const [age, setAge] = useState(String(me.age));
  const [area, setArea] = useState(me.area);
  const [bio, setBio] = useState(me.bio);
  const [errors, setErrors] = useState<ProfileErrors>({});

  const save = () => {
    const found = validateProfile({ name, age, area, bio });
    setErrors(found);
    if (Object.keys(found).length) return;
    updateProfile({ name, age: Number(age), area, bio });
    router.back();
  };

  const field = (props: TextInputProps & { label: string; error?: string; hint?: string }) => {
    const { label, error, hint, style, ...input } = props;
    return (
      <View style={styles.field}>
        <AppText variant="bodyStrong">{label}</AppText>
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
      <View style={styles.photo}>
        <Avatar name={name.trim() || '?'} colorIndex={me.colorIndex} size={88} />
        <AppText variant="small" muted style={styles.center}>
          Photo upload arrives with sign-in in the next milestone. For now your initial is shown.
        </AppText>
      </View>

      {field({ label: 'First name', value: name, onChangeText: setName, error: errors.name, autoCapitalize: 'words', maxLength: 40, placeholder: 'Your first name' })}
      {field({ label: 'Age', value: age, onChangeText: setAge, error: errors.age, keyboardType: 'number-pad', maxLength: 3, placeholder: '30' })}
      {field({ label: 'Neighbourhood', hint: 'Used to suggest plans and people near you. Your exact location is never shown.', value: area, onChangeText: setArea, error: errors.area, autoCapitalize: 'words', placeholder: 'For example: Baner' })}

      <View style={styles.field}>
        {field({
          label: 'About you',
          hint: 'What do you like doing? What kind of plans are you hoping for?',
          value: bio,
          onChangeText: setBio,
          error: errors.bio,
          multiline: true,
          maxLength: BIO_MAX + 50,
          textAlignVertical: 'top',
          style: styles.bio,
          placeholder: 'A line or two about you',
        })}
        <AppText variant="small" muted style={styles.counter} color={bio.trim().length > BIO_MAX ? c.danger : undefined}>
          {bio.trim().length} / {BIO_MAX}
        </AppText>
      </View>

      <SectionTitle>Good to know</SectionTitle>
      <Note>Circle40 is for friendship. Profiles that ask for dates are removed.</Note>

      <View style={styles.actions}>
        <Button kind="ghost" label="Cancel" onPress={() => router.back()} style={styles.flex} />
        <Button label="Save profile" onPress={save} style={styles.flex} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: { alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  center: { textAlign: 'center', maxWidth: 300 },
  field: { gap: 6 },
  input: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15 },
  bio: { minHeight: 110 },
  counter: { alignSelf: 'flex-end' },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  flex: { flex: 1, minWidth: 0 },
});
