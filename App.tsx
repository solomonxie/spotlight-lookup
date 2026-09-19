import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { addOpenListener, takePendingOpen } from '@/modules/spotlight-index';
import { getDatabase } from '@/src/db/database';
import { SETTINGS_KEYS, getFlag } from '@/src/db/settings';
import { seedIfEmpty } from '@/src/lib/seed';
import { RootNavigator, type RootStackParamList } from '@/src/navigation';
import { syncSpotlight } from '@/src/spotlight/sync';
import { useTheme } from '@/src/ui/theme';

const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function App() {
  const { colors, dark } = useTheme();
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
    const open = (id: string) => navigationRef.navigate('Entry', { id });

    // A cold launch from Spotlight lands before any listener exists.
    const pending = takePendingOpen();
    if (pending) open(pending);

    const subscription = addOpenListener((event) => {
      // Drain the buffer too, so a later JS reload does not replay this tap.
      takePendingOpen();
      open(event.id);
    });
    return () => subscription.remove();
  }, [ready]);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <NavigationContainer ref={navigationRef}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
