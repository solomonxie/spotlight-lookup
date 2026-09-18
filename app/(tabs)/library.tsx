import { File } from 'expo-file-system';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import {
  createCollection,
  listCollections,
  updateCollection,
} from '@/src/db/collections';
import { bulkInsertEntries } from '@/src/db/entries';
import { CollectionStats } from '@/src/db/types';
import { ImportPreview, parseImportFile } from '@/src/lib/importers';
import { syncSpotlight } from '@/src/spotlight/sync';
import { Button, Card, EmptyState, Field, Pill } from '@/src/ui/components';
import { radius, spacing, useTheme } from '@/src/ui/theme';

type PendingImport = {
  fileName: string;
  preview: ImportPreview;
  name: string;
  language: string;
  targetLanguage: string;
};

export default function LibraryScreen() {
  const { colors } = useTheme();
  const [collections, setCollections] = useState<CollectionStats[]>([]);
  const [pending, setPending] = useState<PendingImport | null>(null);
  const [importing, setImporting] = useState(false);

  const reload = useCallback(() => {
    listCollections().then(setCollections).catch(() => undefined);
  }, []);

  useFocusEffect(useCallback(() => reload(), [reload]));

  const toggleIndexed = async (collection: CollectionStats, indexed: boolean) => {
    await updateCollection(collection.id, { indexed });
    reload();
    syncSpotlight().then(reload).catch(() => undefined);
  };

  const pickFile = async () => {
    try {
      const result = await File.pickFileAsync({ mimeTypes: ['*/*'] });
      if (result.canceled) return;

      const file = result.result;
      const preview = parseImportFile(file.name, await file.text());
      if (preview.entries.length === 0) {
        Alert.alert(
          'Nothing to import',
          'Expected JSON, CSV or TSV with a term and a definition per row.'
        );
        return;
      }
      setPending({
        fileName: file.name,
        preview,
        name: file.name.replace(/\.[^.]+$/, ''),
        language: '',
        targetLanguage: '',
      });
    } catch (error) {
      Alert.alert('Could not read that file', String(error));
    }
  };

  const confirmImport = async () => {
    if (!pending) return;
    setImporting(true);
    try {
      const collection = await createCollection({
        name: pending.name.trim() || pending.fileName,
        kind: 'dictionary',
        language: pending.language,
        targetLanguage: pending.targetLanguage,
      });
      const inserted = await bulkInsertEntries(collection.id, pending.preview.entries);
      setPending(null);
      reload();
      syncSpotlight().then(reload).catch(() => undefined);
      Alert.alert('Imported', `${inserted} entries added and queued for Spotlight.`);
    } catch (error) {
      Alert.alert('Import failed', String(error));
    } finally {
      setImporting(false);
    }
  };

  const addDeck = async () => {
    await createCollection({ name: 'New deck', kind: 'flashcards' });
    reload();
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.actions}>
        <Button title="Import dictionary" onPress={pickFile} style={styles.action} />
        <Button title="New deck" variant="secondary" onPress={addDeck} style={styles.action} />
      </View>

      <FlatList
        data={collections}
        keyExtractor={(collection) => collection.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card>
            <Link href={{ pathname: '/collection/[id]', params: { id: item.id } }} asChild>
              <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, gap: spacing.sm })}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                <View style={styles.pills}>
                  <Pill label={item.kind === 'dictionary' ? 'Dictionary' : 'Flashcards'} tone="accent" />
                  {item.language ? <Pill label={item.language} /> : null}
                  {item.targetLanguage ? <Pill label={`→ ${item.targetLanguage}`} /> : null}
                </View>
                <Text style={[styles.meta, { color: colors.muted }]}>
                  {item.entryCount} entries · {item.indexedCount} in Spotlight · cap {item.indexLimit}
                </Text>
              </Pressable>
            </Link>
            <View style={[styles.indexRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.indexLabel, { color: colors.text }]}>Index in Spotlight</Text>
              <Switch
                value={item.indexed}
                onValueChange={(value) => toggleIndexed(item, value)}
                trackColor={{ true: colors.accent, false: colors.border }}
              />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No collections yet"
            body="Import a dictionary file or create a deck of your own cards."
          />
        }
      />

      <Modal visible={pending !== null} animationType="slide" presentationStyle="pageSheet">
        <ScrollView
          style={{ backgroundColor: colors.background }}
          contentContainerStyle={styles.sheet}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>Import {pending?.fileName}</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>
            {pending?.preview.entries.length} entries parsed as {pending?.preview.format.toUpperCase()}
            {pending?.preview.skipped ? ` · ${pending.preview.skipped} rows skipped` : ''}
          </Text>

          <Field
            label="COLLECTION NAME"
            value={pending?.name ?? ''}
            onChangeText={(name) => setPending((current) => (current ? { ...current, name } : current))}
          />
          <Field
            label="SOURCE LANGUAGE"
            placeholder="en, ja, de …"
            autoCapitalize="none"
            value={pending?.language ?? ''}
            onChangeText={(language) =>
              setPending((current) => (current ? { ...current, language } : current))
            }
          />
          <Field
            label="TRANSLATION LANGUAGE"
            placeholder="zh-Hans, en …"
            autoCapitalize="none"
            value={pending?.targetLanguage ?? ''}
            onChangeText={(targetLanguage) =>
              setPending((current) => (current ? { ...current, targetLanguage } : current))
            }
          />

          <Button title="Import" onPress={confirmImport} loading={importing} />
          <Button title="Cancel" variant="secondary" onPress={() => setPending(null)} />
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md },
  action: { flex: 1 },
  list: { paddingBottom: spacing.xxl, gap: spacing.md },
  name: { fontSize: 17, fontWeight: '700' },
  pills: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  meta: { fontSize: 13 },
  indexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  indexLabel: { fontSize: 15, fontWeight: '500' },
  sheet: { padding: spacing.xl, gap: spacing.lg },
  sheetTitle: { fontSize: 22, fontWeight: '700' },
});
