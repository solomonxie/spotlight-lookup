import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EntryWithCollection } from '@/src/db/types';

import { radius, spacing, useTheme } from './theme';

export function EntryRow({ entry }: { entry: EntryWithCollection }) {
  const { colors } = useTheme();

  return (
    <Link href={{ pathname: '/entry/[id]', params: { id: entry.id } }} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}>
        <View style={styles.headline}>
          <Text style={[styles.term, { color: colors.text }]} numberOfLines={1}>
            {entry.term}
          </Text>
          {entry.reading ? (
            <Text style={[styles.reading, { color: colors.muted }]} numberOfLines={1}>
              {entry.reading}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.definition, { color: colors.text }]} numberOfLines={2}>
          {entry.definition}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: colors.muted }]} numberOfLines={1}>
            {entry.collectionName}
          </Text>
          <View
            style={[
              styles.dot,
              { backgroundColor: entry.indexedAt ? colors.success : colors.border },
            ]}
          />
          <Text style={[styles.metaText, { color: colors.muted }]}>
            {entry.indexedAt ? 'in Spotlight' : entry.collectionIndexed ? 'queued' : 'not indexed'}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  headline: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  term: { fontSize: 18, fontWeight: '700', flexShrink: 1 },
  reading: { fontSize: 13, flexShrink: 1 },
  definition: { fontSize: 15, lineHeight: 21 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  metaText: { fontSize: 12 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
