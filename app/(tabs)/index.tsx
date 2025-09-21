// Game Tab Screen - MVVM Architecture Integration
// Acts as a container that receives shared ViewModels from parent layout

import { MainGameView } from '@/src/views';
import { useViewModels } from './_layout';

export default function GameScreen() {
  // Get shared ViewModel from context
  const { gameViewModel } = useViewModels();

  // MVVM: Pass shared ViewModel to View component
  return <MainGameView viewModel={gameViewModel} />;
}
