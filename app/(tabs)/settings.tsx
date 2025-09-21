import { SettingsView } from '@/src/views';
import { useViewModels } from './_layout';

export default function SettingsScreen() {
  const { gameViewModel, settingsViewModel, statsViewModel } = useViewModels();

  return (
    <SettingsView
      settingsViewModel={settingsViewModel}
      gameViewModel={gameViewModel}
      statsViewModel={statsViewModel}
    />
  );
}
