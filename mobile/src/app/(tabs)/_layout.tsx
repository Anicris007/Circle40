import { NativeTabs } from 'expo-router/native-tabs';

import { useAppStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const c = useTheme();
  const unread = useAppStore((s) => s.directChats.filter((chat) => chat.unread).length);

  return (
    <NativeTabs
      backgroundColor={c.surface}
      tintColor={c.accent}
      iconColor={{ default: c.textSecondary, selected: c.accent }}
      indicatorColor={c.surfaceAlt}
      badgeBackgroundColor={c.warm}
      labelStyle={{ default: { color: c.textSecondary }, selected: { color: c.accent } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Plans</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="event" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="people">
        <NativeTabs.Trigger.Label>People</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2" md="group" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="chats">
        <NativeTabs.Trigger.Label>Chats</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bubble.left.and.bubble.right" md="chat" />
        <NativeTabs.Trigger.Badge hidden={unread === 0}>{String(unread)}</NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="me">
        <NativeTabs.Trigger.Label>Me</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle" md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
