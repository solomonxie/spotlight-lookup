import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { deleteEntry, getEntry, updateEntry } from '@/src/db/entries';
import { EntryWithCollection } from '@/src/db/types';
import { syncSpotlight } from '@/src/spotlight/sync';
import { Button, Card, EmptyState, Field, Pill, SectionHeader } from '@/src/ui/components';
import { spacing, useTheme } from '@/src/ui/theme';

export default function EntryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<EntryWithCollection | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ term: '', reading: '', definition: '', example: '', tags: '' });

  useEffect(() => {
    getEntry(id)
      .then((row) => {
        setEntry(row);
        if (row) {
          setDraft({
            term: row.term,
            reading: row.reading ?? '',
            definition: row.definition,
            example: row.example ?? '',
            tags: row.tags ?? '',
          });
        }
      })
      .catch(() => setEntry(null));
  }, [id]);

  const save = async () => {
    await updateEntry(id, draft);
    const updated = await getEntry(id);
    setEntry(updated);
    setEditing(false);
    syncSpotlight().catch(() => undefined);
  };

  const remove = () =>
    Alert.alert('Delete entry?', 'It is removed from the app and from Spotlight.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteEntry(id);
          syncSpotlight().catch(() => undefined);
          router.back();
        },
      },
    ]);

  if (entry === undefined) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  if (entry === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          title="Entry not found"
          body="It may have been deleted since Spotlight last indexed it."
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.screen}>
      <Stack.Screen options={{ title: entry.term }} />

      {editing ? (
        <Card>
          <Field label="TERM" value={draft.term} onChangeText={(term) => setDraft({ ...draft, term })} />
          <Field
            label="READING"
            value={draft.reading}
            onChangeText={(reading) => setDraft({ ...draft, reading })}
          />
          <Field
            label="DEFINITION"
            value={draft.definition}
            multiline
            style={styles.multiline}
            onChangeText={(definition) => setDraft({ ...draft, definition })}
          />
          <Field
            label="EXAMPLE"
            value={draft.example}
            multiline
            style={styles.multiline}
            onChangeText={(example) => setDraft({ ...draft, example })}
          />
          <Field label="TAGS" value={draft.tags} onChangeText={(tags) => setDraft({ ...draft, tags })} />
          <Button title="Save" onPress={save} />
          <Button title="Cancel" variant="secondary" onPress={() => setEditing(false)} />
        </Card>
      ) : (
        <>
          <Card>
            <Text style={[styles.term, { color: colors.text }]}>{entry.term}</Text>
            {entry.reading ? (
              <Text style={[styles.reading, { color: colors.muted }]}>{entry.reading}</Text>
            ) : null}
            <Text style={[styles.definition, { color: colors.text }]}>{entry.definition}</Text>
            {entry.example ? (
              <Text style={[styles.example, { color: colors.muted }]}>{entry.example}</Text>
            ) : null}
          </Card>

          <SectionHeader title="Details" />
          <Card>
            <View style={styles.pills}>
              <Pill label={entry.collectionName} tone="accent" />
              {entry.tags
                ?.split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
                .map((tag) => <Pill key={tag} label={tag} />)}
            </View>
            <Text style={[styles.meta, { color: colors.muted }]}>
              {entry.indexedAt
                ? `Indexed ${new Date(entry.indexedAt).toLocaleString()}`
                : entry.collectionIndexed
                  ? 'Queued for the next Spotlight sync'
                  : 'This collection is excluded from Spotlight'}
            </Text>
          </Card>

          <View style={styles.actions}>
            <Button title="Edit" onPress={() => setEditing(true)} />
            <Button title="Delete" variant="danger" onPress={remove} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xs },
  term: { fontSize: 28, fontWeight: '700' },
  reading: { fontSize: 15 },
  definition: { fontSize: 17, lineHeight: 25, marginTop: spacing.sm },
  example: { fontSize: 15, lineHeight: 22, fontStyle: 'italic' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  meta: { fontSize: 13 },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  actions: { gap: spacing.md, marginTop: spacing.xl },
});
