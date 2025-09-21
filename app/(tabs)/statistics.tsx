// Statistics Tab Screen - MVVM Architecture Integration
// Acts as a container that receives shared ViewModels from parent layout

import { StatisticsView } from '@/src/views';
import { useViewModels } from './_layout';

export default function StatisticsScreen() {
  // Get shared ViewModel from context
  const { gameViewModel } = useViewModels();

  // MVVM: Pass shared ViewModel to View component
  return <StatisticsView viewModel={gameViewModel} />;
}
