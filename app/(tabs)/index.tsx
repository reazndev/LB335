import { MainGameView } from '@/src/views';
import { useViewModels } from './_layout';

export default function GameScreen() {
  const { gameViewModel } = useViewModels();

  return <MainGameView viewModel={gameViewModel} />;
}
