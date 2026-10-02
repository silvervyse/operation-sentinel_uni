import { GameProvider } from './hooks/use-game-state';
import { PlayerProfileProvider } from './hooks/use-player-profile';
import { VolumeProvider } from './hooks/use-volume';
import ScreenNavigator from './features/game/ScreenNavigator';

function App() {
  return (
    <VolumeProvider>
      <PlayerProfileProvider>
        <GameProvider>
          <ScreenNavigator />
        </GameProvider>
      </PlayerProfileProvider>
    </VolumeProvider>
  );
}

export default App;
