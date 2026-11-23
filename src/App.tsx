import { useEffect, useMemo, useRef, useState } from 'react';
import { ambientAudioEngine } from './audio/ambientAudioEngine';
import { getBoardById } from './data/boards';
import { getNightSteps } from './logic';
import { useGameStore } from './store/gameStore';
import { HistoryDrawer } from './components/common/HistoryDrawer';
import { NotebookDrawer } from './components/common/NotebookDrawer';
import { QADrawer } from './components/common/QADrawer';
import { RestartModal } from './components/common/RestartModal';
import { TopBar } from './components/common/TopBar';
import { AboutScreen } from './components/screens/AboutScreen';
import { BoardSelectScreen } from './components/screens/BoardSelectScreen';
import { DayAnnouncementScreen } from './components/screens/DayAnnouncementScreen';
import { DayVoteScreen } from './components/screens/DayVoteScreen';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { JoinRoomScreen } from './components/screens/JoinRoomScreen';
import { NightConsoleScreen } from './components/screens/NightConsoleScreen';
import { PassAndRevealScreen } from './components/screens/PassAndRevealScreen';
import { RulesAtlasScreen } from './components/screens/RulesAtlasScreen';
import { SeatSetupScreen } from './components/screens/SeatSetupScreen';

function App() {
  const activeView = useGameStore((s) => s.activeView);
  const setActiveView = useGameStore((s) => s.setActiveView);
  const phase = useGameStore((s) => s.phase);
  const round = useGameStore((s) => s.round);
  const selectedBoardId = useGameStore((s) => s.selectedBoardId);
  const currentStepIndex = useGameStore((s) => s.currentStepIndex);
  const currentNightDraft = useGameStore((s) => s.currentNightDraft);
  const pendingSelfExplodeSeat = useGameStore((s) => s.pendingSelfExplodeSeat);
  const hostMode = useGameStore((s) => s.hostMode);
  const nightHistory = useGameStore((s) => s.nightHistory);
  const dayHistory = useGameStore((s) => s.dayHistory);
  const ambientAudio = useGameStore((s) => s.ambientAudio);
  const restartGame = useGameStore((s) => s.restartGame);

  const [qaOpen, setQaOpen] = useState(false);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const wasNightAutoPlayingRef = useRef(false);

  const board = getBoardById(selectedBoardId);
  const hasActiveGame = Boolean(selectedBoardId) || phase !== 'board_select';

  useEffect(() => {
    const shouldAutoPlay =
      activeView === 'game' &&
      phase === 'night' &&
      ambientAudio.autoPlayAtNight &&
      ambientAudio.presetId !== 'none';

    if (shouldAutoPlay) {
      ambientAudioEngine.play(ambientAudio.presetId, ambientAudio.volume);
      wasNightAutoPlayingRef.current = true;
    } else if (wasNightAutoPlayingRef.current) {
      ambientAudioEngine.stop();
      wasNightAutoPlayingRef.current = false;
    }
  }, [
    activeView,
    phase,
    ambientAudio.autoPlayAtNight,
    ambientAudio.presetId,
    ambientAudio.volume,
  ]);

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
        return <SeatSetupScreen onOpenQA={() => setQaOpen(true)} />;
      case 'pass_and_reveal':
        return <PassAndRevealScreen />;
      case 'night':
        return (
          <NightConsoleScreen
            onOpenHistory={() => setHistoryOpen(true)}
            onOpenQA={() => setQaOpen(true)}
          />
        );
      case 'day_announcement':
        return <DayAnnouncementScreen />;
      case 'day_vote':
        return <DayVoteScreen />;
      case 'game_over':
        return <GameOverScreen />;
    }
  };

  const isZeroScrollPhase =
    phase === 'seat_setup' || phase === 'pass_and_reveal' || phase === 'night';

  const renderMainContent = () => {
    switch (activeView) {
      case 'join_room':
        return (
          <JoinRoomScreen
            onBackHome={() => setActiveView('home')}
            onGoHost={() => setActiveView('game')}
          />
        );
      case 'rules_atlas':
        return <RulesAtlasScreen />;
      case 'about':
        return <AboutScreen onBackHome={() => setActiveView('home')} />;
      case 'game':
      default:
        return isZeroScrollPhase ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{renderPhaseScreen()}</div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">{renderPhaseScreen()}</div>
        );
    }
  };

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      {activeView === 'home' ? (
        <HomeScreen
          hasActiveGame={hasActiveGame}
          currentPhase={phase}
          selectedBoardName={board?.name}
          onHost={() => setActiveView('game')}
          onJoin={() => setActiveView('join_room')}
          onRules={() => setActiveView('rules_atlas')}
          onAbout={() => setActiveView('about')}
        />
      ) : (
        <>
          <TopBar
            activeView={activeView}
            phase={phase}
            round={round}
            board={board}
            onGoHome={() => setActiveView('home')}
            onOpenQA={() => setQaOpen(true)}
            onOpenNotebook={() => setNotebookOpen(true)}
            onOpenHistory={() => setHistoryOpen(true)}
            onOpenRestart={() => setRestartOpen(true)}
          />

          <main className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col overflow-hidden px-3 py-3 md:max-w-2xl">
            {renderMainContent()}
          </main>
        </>
      )}

      <QADrawer
        open={qaOpen}
        board={board}
        highlightRoleIds={highlightRoleIds}
        onClose={() => setQaOpen(false)}
      />

      <NotebookDrawer open={notebookOpen} onClose={() => setNotebookOpen(false)} />

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        nightHistory={nightHistory}
        dayHistory={dayHistory}
        inProgressNight={
          phase === 'night' && hostMode.judgeMode === 'physical_judge'
            ? {
                round,
                draft: currentNightDraft,
                pendingSelfExplodeSeat,
              }
            : null
        }
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
