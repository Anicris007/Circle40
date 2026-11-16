import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Button, Card, Note, Row, Screen, Tag, TagRow } from '@/components/ui';
import { matchScore, sharedInterests } from '@/data/selectors';
import { useAppStore } from '@/data/store';

const GREETING = 'Hi! Looks like we like the same things. Up for a plan sometime?';
const REPLY = 'Hey! Yes, definitely. What are you up to this weekend?';

export default function PeopleScreen() {
  const me = useAppStore((s) => s.me);
  const people = useAppStore((s) => s.people);
  const blockedIds = useAppStore((s) => s.blockedIds);
  const chats = useAppStore((s) => s.directChats);
  const startChat = useAppStore((s) => s.startChat);
  const receive = useAppStore((s) => s.receiveDirectMessage);

  const ranked = people
    .filter((p) => !blockedIds.includes(p.id))
    .map((p) => ({ person: p, score: matchScore(me, p), shared: sharedInterests(me, p) }))
    .sort((a, b) => b.score - a.score);

  const sayHi = (personId: string) => {
    const hasChat = chats.some((c) => c.personId === personId);
    if (!hasChat) {
      startChat(personId, GREETING);
      // Sample data only: a pretend reply so the chat feels alive.
      setTimeout(() => receive(personId, REPLY), 1800);
    }
    router.push({ pathname: '/chat/[id]', params: { id: personId } });
  };

  return (
    <Screen tab title="People">
      <Note>Suggested by shared interests and area. Circle40 is for friendship only.</Note>
      {ranked.map(({ person, score, shared }) => {
        const hasChat = chats.some((c) => c.personId === person.id);
        return (
          <Card key={person.id}>
            <Row>
              <View style={styles.who}>
                <Avatar name={person.name} colorIndex={person.colorIndex} size={52} />
                <View style={styles.whoText}>
                  <AppText variant="heading">{person.name}, {person.age}</AppText>
                  <AppText variant="small" muted>
                    {person.area}{person.verified ? ' · ID verified' : ''}
                  </AppText>
                </View>
              </View>
              <Tag label={`${score}% match`} />
            </Row>
            <AppText>{person.bio}</AppText>
            <TagRow>
              {person.interests.map((i) => <Tag key={i} label={i} warm={shared.includes(i)} />)}
            </TagRow>
            <Row>
              <AppText variant="small" muted>
                {shared.length} {shared.length === 1 ? 'interest' : 'interests'} in common
              </AppText>
              <Button
                small
                kind={hasChat ? 'done' : 'primary'}
                label={hasChat ? 'Open chat' : 'Say hi'}
                onPress={() => sayHi(person.id)}
                accessibilityLabel={hasChat ? `Open chat with ${person.name}` : `Say hi to ${person.name}`}
              />
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  who: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  whoText: { flex: 1, minWidth: 0 },
});
