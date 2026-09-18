import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { isSpotlightAvailable } from '@/modules/spotlight-index';
import { recentEntries, searchEntries } from '@/src/db/entries';
import { EntryWithCollection } from '@/src/db/types';
import { useDebounced } from '@/src/lib/useDebounced';
import { EntryRow } from '@/src/ui/EntryRow';
import { Banner, EmptyState } from '@/src/ui/components';
import { radius, spacing, useTheme } from '@/src/ui/theme';

export default function SearchScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EntryWithCollection[]>([]);
  const debouncedQuery = useDebounced(query);
  const trimmed = debouncedQuery.trim();

  const loadRecent = useCallback(() => {
    recentEntries().then(setResults).catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!trimmed) {
      loadRecent();
      return;
    }
    searchEntries(trimmed)
      .then((rows) => {
        if (!cancelled) setResults(rows);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [trimmed, loadRecent]);

  useFocusEffect(
    useCallback(() => {
      if (!trimmed) loadRecent();
    }, [trimmed, loadRecent])
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search every indexed word and card"
        placeholderTextColor={colors.muted}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        returnKeyType="search"
        style={[
          styles.search,
          { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
        ]}
      />

      {!isSpotlightAvailable() ? (
        <Banner text="Running without Core Spotlight — in-app search works, but system Spotlight indexing needs a development build (npx expo run:ios)." />
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(entry) => entry.id}
        renderItem={({ item }) => <EntryRow entry={item} />}
        contentContainerStyle={styles.list}
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <Text style={[styles.heading, { color: colors.muted }]}>
            {trimmed ? `${results.length} match${results.length === 1 ? '' : 'es'}` : 'RECENT'}
          </Text>
        }
        ListEmptyComponent={
          trimmed ? (
            <EmptyState
              title="Nothing found"
              body={`No entry matches “${trimmed}”. Import a dictionary or add a card for it.`}
            />
          ) : (
            <EmptyState
              title="Your library is empty"
              body="Import a dictionary file or add a flashcard to start filling Spotlight."
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  search: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 17,
  },
  heading: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginBottom: spacing.sm },
  list: { paddingBottom: spacing.xxl, gap: spacing.md },
});
