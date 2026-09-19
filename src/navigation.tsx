import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CardsScreen } from '@/src/screens/CardsScreen';
import { CollectionScreen } from '@/src/screens/CollectionScreen';
import { EntryScreen } from '@/src/screens/EntryScreen';
import { LibraryScreen } from '@/src/screens/LibraryScreen';
import { SearchScreen } from '@/src/screens/SearchScreen';
import { SettingsScreen } from '@/src/screens/SettingsScreen';
import { CardsIcon, LibraryIcon, SearchIcon, SettingsIcon } from '@/src/ui/icons';
import { useTheme } from '@/src/ui/theme';

export type RootStackParamList = {
  Tabs: undefined;
  Entry: { id: string };
  Collection: { id: string };
};

export type TabParamList = {
  Search: undefined;
  Library: undefined;
  Cards: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Look up',
          tabBarIcon: ({ color, size }) => <SearchIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => <LibraryIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Cards"
        component={CardsScreen}
        options={{
          title: 'Cards',
          tabBarIcon: ({ color, size }) => <CardsIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="Entry" component={EntryScreen} options={{ title: 'Entry' }} />
      <Stack.Screen name="Collection" component={CollectionScreen} options={{ title: 'Collection' }} />
    </Stack.Navigator>
  );
}
