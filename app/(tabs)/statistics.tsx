// Statistics Tab Screen - MVVM Architecture Integration
// Acts as a container that initializes ViewModels and passes them to Views

import { useState } from 'react';

import { GameViewModel } from '@/src/viewmodels';
import { StatisticsView } from '@/src/views';

export default function StatisticsScreen() {
  // MVVM: Initialize ViewModel once per screen instance
  const [gameViewModel] = useState(() => new GameViewModel());

  // MVVM: Pass ViewModel to View component for proper separation
  return <StatisticsView viewModel={gameViewModel} />;
}
