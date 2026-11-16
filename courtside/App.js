import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { colors } from './src/theme';
import { StoreProvider, useStore } from './src/store';
import { ToastProvider } from './src/components/ui';
import FindScreen from './src/screens/FindScreen';
import MySessionsScreen from './src/screens/MySessionsScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SessionDetailScreen from './src/screens/SessionDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.bg, card: colors.card, text: colors.text, border: colors.border },
};

const TAB_ICONS = {
  Find: ['search', 'search-outline'],
  MySessions: ['calendar', 'calendar-outline'],
  Alerts: ['notifications', 'notifications-outline'],
  Profile: ['person-circle', 'person-circle-outline'],
};

function Tabs() {
  const { state } = useStore();
  const unread = state.alerts.filter((a) => !a.read).length;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarIcon: ({ focused, color, size }) => <Ionicons name={TAB_ICONS[route.name][focused ? 0 : 1]} size={size + 2} color={color} />,
      })}
    >
      <Tab.Screen name="Find" component={FindScreen} options={{ title: 'Find' }} />
      <Tab.Screen name="MySessions" component={MySessionsScreen} options={{ title: 'My Sessions' }} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Alerts', tabBarBadge: unread || undefined, tabBarBadgeStyle: { backgroundColor: colors.danger, fontWeight: '800' } }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { ready } = useStore();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false, title: 'Back' }} />
        <Stack.Screen
          name="Session"
          component={SessionDetailScreen}
          options={{
            title: 'Session Details',
            headerBackTitle: 'Back',
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text, fontWeight: '700' },
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.bg },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <Root />
        </ToastProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
