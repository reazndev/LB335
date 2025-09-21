// Settings Tab Screen - MVVM Architecture Integration
// Acts as a container that initializes ViewModels and passes them to Views

import { useState } from 'react';

import { GameViewModel, SettingsViewModel, StatsViewModel } from '@/src/viewmodels';
import { SettingsView } from '@/src/views';

export default function SettingsScreen() {
  // MVVM: Initialize ViewModels once per screen instance
  const [settingsViewModel] = useState(() => new SettingsViewModel());
  const [gameViewModel] = useState(() => new GameViewModel());
  const [statsViewModel] = useState(() => new StatsViewModel());

  // MVVM: Pass ViewModels to View component for proper separation
  return (
    <SettingsView 
      settingsViewModel={settingsViewModel}
      gameViewModel={gameViewModel}
      statsViewModel={statsViewModel}
    />
  );
}
