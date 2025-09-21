import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import React, { createContext, useContext, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GameViewModel, SettingsViewModel, StatsViewModel } from '@/src/viewmodels';

// Create context for shared ViewModels
const ViewModelsContext = createContext<{
  gameViewModel: GameViewModel;
  settingsViewModel: SettingsViewModel;
  statsViewModel: StatsViewModel;
} | null>(null);

// Hook to use shared ViewModels
export const useViewModels = () => {
  const context = useContext(ViewModelsContext);
  if (!context) {
    throw new Error('useViewModels must be used within a ViewModelsProvider');
  }
  return context;
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Create shared ViewModel instances for all tabs
  const [gameViewModel] = useState(() => new GameViewModel());
  const [settingsViewModel] = useState(() => new SettingsViewModel());
  const [statsViewModel] = useState(() => new StatsViewModel());

  const viewModels = {
    gameViewModel,
    settingsViewModel,
    statsViewModel,
  };

  return (
    <ViewModelsContext.Provider value={viewModels}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: false,
            tabBarButton: HapticTab,
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Game',
              tabBarIcon: ({ color }) => <MaterialIcons size={28} name="gamepad" color={color} />,
            }}
          />
          <Tabs.Screen
            name="statistics"
            options={{
              title: 'Statistics',
              tabBarIcon: ({ color }) => <MaterialIcons size={28} name="bar-chart" color={color} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => <MaterialIcons size={28} name="settings" color={color} />,
            }}
          />
        </Tabs>
      </GestureHandlerRootView>
    </ViewModelsContext.Provider>
  );
}
