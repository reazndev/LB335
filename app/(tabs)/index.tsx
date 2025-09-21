// Game Tab Screen - MVVM Architecture Integration
// Acts as a container that initializes ViewModels and passes them to Views
// Demonstrates proper MVVM separation where the tab screen coordinates components

import { useState } from 'react';

import { GameViewModel } from '@/src/viewmodels';
import { MainGameView } from '@/src/views';

export default function GameScreen() {
  // MVVM: Initialize ViewModel once per screen instance
  const [gameViewModel] = useState(() => new GameViewModel());

  // MVVM: Pass ViewModel to View component for proper separation
  return <MainGameView viewModel={gameViewModel} />;
}
