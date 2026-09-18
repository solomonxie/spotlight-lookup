import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { createCollection, listCollections } from '@/src/db/collections';
import { createEntry, listEntries } from '@/src/db/entries';
import { CollectionStats, Entry } from '@/src/db/types';
import { syncSpotlight } from '@/src/spotlight/sync';
import { Button, Card, EmptyState, Field, SectionHeader } from '@/src/ui/components';
import { radius, spacing, useTheme } from '@/src/ui/theme';

export default function CardsScreen() {
  const { colors } = useTheme();
  const [decks, setDecks] = useState<CollectionStats[]>([]);
  const [deckId, setDeckId] = useState<string | null>(null);
  const [cards, setCards] = useState<Entry[]>([]);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useFocusEffect(refresh);

  useEffect(() => {
    listCollections()
      .then((all) => {
        const flashcardDecks = all.filter((collection) => collection.kind === 'flashcards');
        setDecks(flashcardDecks);
        setDeckId((current) =>
          flashcardDecks.some((deck) => deck.id === current)
            ? current
            : (flashcardDecks[0]?.id ?? null)
        );
      })
      .catch(() => undefined);
  }, [revision]);

  useEffect(() => {
    if (!deckId) {
      setCards([]);
      return;
    }
    listEntries(deckId, 50).then(setCards).catch(() => undefined);
  }, [deckId, revision]);

  const save = async () => {
    if (!front.trim() || !back.trim()) {
      Alert.alert('Missing text', 'A card needs both a front and a back.');
      return;
    }
    setSaving(true);
    try {
      const targetDeck =
        deckId ?? (await createCollection({ name: 'My Flashcards', kind: 'flashcards' })).id;
      await createEntry({
        collectionId: targetDeck,
        term: front,
        definition: back,
        tags: tags || null,
      });
      setFront('');
      setBack('');
      setTags('');
      setDeckId(targetDeck);
      refresh();
      syncSpotlight().then(refresh).catch(() => undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.screen}
      data={cards}
      keyExtractor={(card) => card.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.header}>
          <Card>
            <Field label="FRONT" value={front} onChangeText={setFront} placeholder="Term or question" />
            <Field
              label="BACK"
              value={back}
              onChangeText={setBack}
              placeholder="Definition, translation or answer"
              multiline
              style={styles.multiline}
            />
            <Field label="TAGS" value={tags} onChangeText={setTags} placeholder="comma, separated" />
            <Button title="Add card" onPress={save} loading={saving} />
          </Card>

          {decks.length > 1 ? (
            <View>
              <SectionHeader title="Deck" />
              <View style={styles.deckRow}>
                {decks.map((deck) => {
                  const active = deck.id === deckId;
                  return (
                    <Pressable
                      key={deck.id}
                      onPress={() => setDeckId(deck.id)}
                      style={[
                        styles.deckChip,
                        {
                          backgroundColor: active ? colors.accentSoft : colors.card,
                          borderColor: active ? colors.accent : colors.border,
                        },
                      ]}>
                      <Text style={{ color: active ? colors.accent : colors.muted, fontWeight: '600' }}>
                        {deck.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <SectionHeader title={`Cards in ${decks.find((d) => d.id === deckId)?.name ?? 'this deck'}`} />
        </View>
      }
      renderItem={({ item }) => (
        <Card>
          <Text style={[styles.front, { color: colors.text }]}>{item.term}</Text>
          <Text style={[styles.back, { color: colors.muted }]}>{item.definition}</Text>
        </Card>
      )}
      ListEmptyComponent={
        <EmptyState title="No cards yet" body="Anything you add here becomes searchable from the Home Screen." />
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: spacing.md },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  deckRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  deckChip: {
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  front: { fontSize: 16, fontWeight: '700' },
  back: { fontSize: 14, lineHeight: 20 },
});
