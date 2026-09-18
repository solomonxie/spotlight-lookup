import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { addOpenListener, takePendingOpen } from '@/modules/spotlight-index';
import { getDatabase } from '@/src/db/database';
import { SETTINGS_KEYS, getFlag } from '@/src/db/settings';
import { seedIfEmpty } from '@/src/lib/seed';
import { syncSpotlight } from '@/src/spotlight/sync';
import { useTheme } from '@/src/ui/theme';

export default function RootLayout() {
  const { colors, dark } = useTheme();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await getDatabase();
      await seedIfEmpty();
      if (cancelled) return;
      setReady(true);
      if (await getFlag(SETTINGS_KEYS.autoSync, true)) {
        syncSpotlight().catch(() => undefined);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const open = (id: string) => router.push({ pathname: '/entry/[id]', params: { id } });

    // A cold launch from Spotlight lands before any listener exists.
    const pending = takePendingOpen();
    if (pending) open(pending);

    const subscription = addOpenListener((event) => open(event.id));
    return () => subscription?.remove();
  }, [ready, router]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="entry/[id]" options={{ title: 'Entry' }} />
        <Stack.Screen name="collection/[id]" options={{ title: 'Collection' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
