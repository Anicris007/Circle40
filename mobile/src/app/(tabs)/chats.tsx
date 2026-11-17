import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Card, Note, Screen, Tag } from '@/components/ui';
import { useAppStore } from '@/data/store';
import { ME_ID } from '@/data/types';

export default function ChatsScreen() {
  const chats = useAppStore((s) => s.directChats);
  const people = useAppStore((s) => s.people);

  return (
    <Screen tab title="Chats">
      {chats.length === 0 ? <Note>No chats yet. Say hi to someone in People.</Note> : null}
      {chats.map((chat) => {
        const person = people.find((p) => p.id === chat.personId);
        if (!person) return null;
        const last = chat.messages[chat.messages.length - 1];
        return (
          <Card
            key={chat.personId}
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: chat.personId } })}
            accessibilityLabel={`Chat with ${person.name}${chat.unread ? ', new message' : ''}`}
            style={styles.item}>
            <Avatar name={person.name} colorIndex={person.colorIndex} size={48} photoUri={person.photoUri} />
            <View style={styles.text}>
              <View style={styles.nameRow}>
                <AppText variant="bodyStrong">{person.name}</AppText>
                {chat.unread ? <Tag label="New" warm /> : null}
              </View>
              {last ? (
                <AppText variant="small" muted numberOfLines={1}>
                  {last.senderId === ME_ID ? 'You: ' : ''}{last.body}
                </AppText>
              ) : null}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  text: { flex: 1, minWidth: 0, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
