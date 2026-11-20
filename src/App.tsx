import { useMemo, useState } from 'react';
import { getBoardById } from './data/boards';
import { getNightSteps } from './logic';
import { useGameStore } from './store/gameStore';
import { QADrawer } from './components/common/QADrawer';
import { RestartModal } from './components/common/RestartModal';
import { TopBar } from './components/common/TopBar';
import { BoardSelectScreen } from './components/screens/BoardSelectScreen';
import { DayAnnouncementScreen } from './components/screens/DayAnnouncementScreen';
import { DayVoteScreen } from './components/screens/DayVoteScreen';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { NightConsoleScreen } from './components/screens/NightConsoleScreen';
import { SeatSetupScreen } from './components/screens/SeatSetupScreen';

function App() {
  const phase = useGameStore((s) => s.phase);
  const round = useGameStore((s) => s.round);
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const currentStepIndex = useGameStore((s) => s.currentStepIndex);
  const restartGame = useGameStore((s) => s.restartGame);

  const [qaOpen, setQaOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);

  const board = getBoardById(selectedBoardId);

  const highlightRoleIds = useMemo(() => {
    if (!board || phase !== 'night') return [];
    const steps = getNightSteps(board, round);
    return steps[currentStepIndex]?.actorRoleIds ?? [];
  }, [board, phase, round, currentStepIndex]);

  const renderPhaseScreen = () => {
    switch (phase) {
      case 'board_select':
        return <BoardSelectScreen />;
      case 'seat_setup':
        return <SeatSetupScreen />;
      case 'night':
        return <NightConsoleScreen />;
      case 'day_announcement':
        return <DayAnnouncementScreen />;
      case 'day_vote':
        return <DayVoteScreen />;
      case 'game_over':
        return <GameOverScreen />;
    }
  };

  return (
    <div className="min-h-dvh w-full bg-slate-950 text-slate-100">
      <TopBar
        phase={phase}
        round={round}
        board={board}
        onOpenQA={() => setQaOpen(true)}
        onOpenRestart={() => setRestartOpen(true)}
      />

      <main className="mx-auto w-full max-w-lg px-3 pt-4">{renderPhaseScreen()}</main>

      <QADrawer
        open={qaOpen}
        board={board}
        highlightRoleIds={highlightRoleIds}
        onClose={() => setQaOpen(false)}
      />

      <RestartModal
        open={restartOpen}
        hasSelectedBoard={Boolean(board)}
        onRestartKeepNicknames={() => {
          restartGame({ keepNicknames: true });
          setRestartOpen(false);
          setQaOpen(false);
        }}
        onRestartClearAll={() => {
          restartGame({ keepNicknames: false });
          setRestartOpen(false);
          setQaOpen(false);
        }}
        onCancel={() => setRestartOpen(false)}
      />
    </div>
  );
}

export default App;
