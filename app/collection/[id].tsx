import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { deleteCollection, getCollection, updateCollection } from '@/src/db/collections';
import { listEntries } from '@/src/db/entries';
import { CollectionStats, Entry } from '@/src/db/types';
import { syncSpotlight } from '@/src/spotlight/sync';
import { Button, Card, EmptyState, Field, SectionHeader } from '@/src/ui/components';
import { spacing, useTheme } from '@/src/ui/theme';

export default function CollectionScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [collection, setCollection] = useState<CollectionStats | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState({ name: '', language: '', targetLanguage: '', indexLimit: '' });
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    getCollection(id)
      .then((row) => {
        setCollection(row);
        if (row) {
          setDraft({
            name: row.name,
            language: row.language ?? '',
            targetLanguage: row.targetLanguage ?? '',
            indexLimit: String(row.indexLimit),
          });
        }
      })
      .catch(() => undefined);
    listEntries(id, 100).then(setEntries).catch(() => undefined);
  }, [id, revision]);

  const save = async () => {
    const limit = Number.parseInt(draft.indexLimit, 10);
    await updateCollection(id, {
      name: draft.name,
      language: draft.language,
      targetLanguage: draft.targetLanguage,
      indexLimit: Number.isFinite(limit) && limit > 0 ? limit : undefined,
    });
    refresh();
    syncSpotlight().then(refresh).catch(() => undefined);
  };

  const remove = () =>
    Alert.alert('Delete collection?', 'Every entry in it leaves the app and Spotlight.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCollection(id);
          syncSpotlight().catch(() => undefined);
          router.back();
        },
      },
    ]);

  if (!collection) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.screen}
      data={entries}
      keyExtractor={(entry) => entry.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.header}>
          <Stack.Screen options={{ title: collection.name }} />

          <Card>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.text }]}>Index in Spotlight</Text>
              <Switch
                value={collection.indexed}
                trackColor={{ true: colors.accent, false: colors.border }}
                onValueChange={async (indexed) => {
                  await updateCollection(id, { indexed });
                  refresh();
                  syncSpotlight().then(refresh).catch(() => undefined);
                }}
              />
            </View>
            <Text style={[styles.hint, { color: colors.muted }]}>
              {collection.indexedCount} of {collection.entryCount} entries are in system search.
            </Text>
          </Card>

          <SectionHeader title="Collection" />
          <Card>
            <Field label="NAME" value={draft.name} onChangeText={(name) => setDraft({ ...draft, name })} />
            <Field
              label="SOURCE LANGUAGE"
              autoCapitalize="none"
              placeholder="en, ja, de …"
              value={draft.language}
              onChangeText={(language) => setDraft({ ...draft, language })}
            />
            <Field
              label="TRANSLATION LANGUAGE"
              autoCapitalize="none"
              placeholder="zh-Hans, en …"
              value={draft.targetLanguage}
              onChangeText={(targetLanguage) => setDraft({ ...draft, targetLanguage })}
            />
            <Field
              label="MAX ENTRIES IN SPOTLIGHT"
              keyboardType="number-pad"
              value={draft.indexLimit}
              onChangeText={(indexLimit) => setDraft({ ...draft, indexLimit })}
            />
            <Text style={[styles.hint, { color: colors.muted }]}>
              Core Spotlight slows down on very large indexes; a cap keeps a big dictionary usable by
              indexing only its first N entries.
            </Text>
            <Button title="Save" onPress={save} />
          </Card>

          <SectionHeader title={`Entries (${collection.entryCount})`} />
        </View>
      }
      renderItem={({ item }) => (
        <Link href={{ pathname: '/entry/[id]', params: { id: item.id } }} asChild>
          <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <Card>
              <Text style={[styles.term, { color: colors.text }]}>{item.term}</Text>
              <Text style={[styles.definition, { color: colors.muted }]} numberOfLines={2}>
                {item.definition}
              </Text>
            </Card>
          </Pressable>
        </Link>
      )}
      ListEmptyComponent={<EmptyState title="Empty collection" body="Nothing has been added here yet." />}
      ListFooterComponent={
        <Button title="Delete collection" variant="danger" onPress={remove} style={styles.delete} />
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  header: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 15, fontWeight: '500' },
  hint: { fontSize: 13, lineHeight: 18 },
  term: { fontSize: 16, fontWeight: '700' },
  definition: { fontSize: 14, lineHeight: 20 },
  delete: { marginTop: spacing.xl },
});
