import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { isSpotlightAvailable } from '@/modules/spotlight-index';
import { countEntries } from '@/src/db/entries';
import { SETTINGS_KEYS, getFlag, setFlag } from '@/src/db/settings';
import { SyncProgress, clearSpotlightIndex, syncSpotlight } from '@/src/spotlight/sync';
import { Banner, Button, Card, SectionHeader } from '@/src/ui/components';
import { spacing, useTheme } from '@/src/ui/theme';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const available = isSpotlightAvailable();
  const [counts, setCounts] = useState({ total: 0, indexed: 0, pending: 0 });
  const [autoSync, setAutoSync] = useState(true);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useFocusEffect(refresh);

  useEffect(() => {
    countEntries().then(setCounts).catch(() => undefined);
    getFlag(SETTINGS_KEYS.autoSync, true).then(setAutoSync).catch(() => undefined);
  }, [revision]);

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    try {
      await task();
    } catch (error) {
      Alert.alert('Spotlight error', String(error));
    } finally {
      setBusy(false);
      setProgress(null);
      refresh();
    }
  };

  const sync = (rebuild: boolean) =>
    run(async () => {
      const result = await syncSpotlight({ rebuild, onProgress: setProgress });
      if (!result.available) {
        Alert.alert('Not available here', 'Core Spotlight is missing from this build.');
        return;
      }
      Alert.alert(
        rebuild ? 'Index rebuilt' : 'Index updated',
        `${result.indexed} entries added, ${result.removed} removed.`
      );
    });

  const clear = () =>
    Alert.alert('Clear Spotlight index?', 'Your entries stay in the app but leave system search.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => run(clearSpotlightIndex),
      },
    ]);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.screen}>
      {!available ? (
        <Banner
          tone="danger"
          text="Core Spotlight is not part of this binary. Expo Go cannot index — run `npx expo run:ios` once to get a development build with the native module."
        />
      ) : null}

      <SectionHeader title="Index status" />
      <Card>
        <Row label="Entries in app" value={String(counts.total)} />
        <Row label="In Spotlight" value={String(counts.indexed)} />
        <Row label="Waiting to index" value={String(counts.pending)} />
        {progress ? (
          <Text style={[styles.progress, { color: colors.accent }]}>
            {progress.phase} {progress.done}/{progress.total}
          </Text>
        ) : null}
      </Card>

      <SectionHeader
        title="Indexing"
        info={{
          title: 'Indexing',
          body:
            'New and edited entries are pushed to Spotlight in the background. Per-collection ' +
            'limits and language tags live on each collection in Library.',
        }}
      />
      <Card>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>Sync on launch</Text>
          <Switch
            value={autoSync}
            trackColor={{ true: colors.accent, false: colors.border }}
            onValueChange={(value) => {
              setAutoSync(value);
              setFlag(SETTINGS_KEYS.autoSync, value).catch(() => undefined);
            }}
          />
        </View>
      </Card>

      <View style={styles.actions}>
        <Button title="Sync now" onPress={() => sync(false)} loading={busy} />
        <Button title="Rebuild index" variant="secondary" onPress={() => sync(true)} disabled={busy} />
        <Button title="Clear Spotlight index" variant="danger" onPress={clear} disabled={busy} />
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 15 },
  value: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  progress: { fontSize: 13, fontWeight: '600' },
  actions: { gap: spacing.md, marginTop: spacing.xl },
});
