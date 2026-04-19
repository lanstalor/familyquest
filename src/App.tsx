import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Setup } from './components/Setup';
import { SceneView } from './components/SceneView';
import { PartyPanel } from './components/PartyPanel';
import { DiceRoller } from './components/DiceRoller';
import { LogPanel } from './components/LogPanel';
import { PhotoArtifact } from './components/PhotoArtifact';
import { SettingsModal } from './components/SettingsModal';
import { PrintView } from './components/PrintView';
import { Prologue } from './components/Prologue';
import { Epilogue } from './components/Epilogue';
import { MapModal } from './components/MapModal';
import { MusicPlayer } from './components/MusicPlayer';
import { generateScene, generateStoryQuestions, resolveDeviation } from './ai/provider';
import {
  clearState,
  loadSettings,
  loadState,
  saveSettings,
  saveState,
} from './storage';
import {
  advanceRoom,
  appendLog,
  currentPlayer,
  currentRoom,
  ensureEncounter,
  logEntry,
  resolveClassAbility,
  resolveChoice,
  revivePlayers,
  uid,
} from './game/engine';
import type {
  Choice,
  GameState,
  Item,
  MonsterEncounter,
  Player,
  Quest,
  Scene,
  Settings,
  StoryAnswer,
  StoryQuestion,
  StoryQuestionOption,
} from './types';

function initialState(settings: Settings): GameState {
  return {
    settings,
    players: [],
    startingPlayers: [],
    abilityUsage: {},
    currentPlayerIndex: 0,
    quest: null,
    phase: 'setup',
    storyQuestions: [],
    storyAnswers: [],
    encounter: null,
    currentScene: null,
    outcome: null,
    lastRoll: null,
    logs: [],
    turnCount: 0,
  };
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [state, setState] = useState<GameState>(() => {
    const saved = loadState();
    if (saved) return { ...saved, settings: loadSettings() };
    return initialState(loadSettings());
  });
  const [loadingScene, setLoadingScene] = useState(false);
  const [loadingDeviation, setLoadingDeviation] = useState(false);
  const plotHintRef = useRef<string | undefined>(undefined);
  const [loadingStorySetup, setLoadingStorySetup] = useState(false);
  const [sourceNote, setSourceNote] = useState<string | undefined>();
  const [storySetupNote, setStorySetupNote] = useState<string | undefined>();
  const [showPhoto, setShowPhoto] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTurnSplash, setShowTurnSplash] = useState(false);

  useEffect(() => {
    if (state.phase === 'playing' && !state.outcome && state.players.length > 0) {
      setShowTurnSplash(true);
      const timer = setTimeout(() => setShowTurnSplash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.currentPlayerIndex, state.phase]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.quest?.currentRoomIndex, !!state.currentScene]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const player = currentPlayer(state);
  const room = currentRoom(state);

  const startGame = useCallback(
    (players: Player[], quest: Quest, kidsMode: boolean) => {
      const nextSettings = { ...settings, kidsMode };
      setSettings(nextSettings);
      const startingPlayers = clonePlayers(players);
      setState({
        ...initialState(nextSettings),
        settings: nextSettings,
        players,
        startingPlayers,
        quest,
        phase: 'prologue',
        currentPlayerIndex: 0,
        logs: [
          logEntry('system', `Adventure begins: ${quest.name}.`),
          logEntry('narration', quest.goal),
        ],
      });
      setStorySetupNote(undefined);
    },
    [settings]
  );

  const requestStoryQuestions = useCallback(async () => {
    if (state.phase !== 'prologue' || !state.quest) return;
    setLoadingStorySetup(true);
    setStorySetupNote(undefined);
    const result = await generateStoryQuestions(
      state.quest,
      state.players,
      state.settings
    );
    if (result.note) setStorySetupNote(result.note);
    setState((s) => {
      if (s.phase !== 'prologue') return s;
      return { ...s, storyQuestions: result.questions };
    });
    setLoadingStorySetup(false);
  }, [state.phase, state.players, state.quest, state.settings]);

  const requestScene = useCallback(async () => {
    if (state.phase !== 'playing' || !room || !player) return;
    setLoadingScene(true);
    setSourceNote(undefined);
    const hint = plotHintRef.current;
    plotHintRef.current = undefined;
    const result = await generateScene(
      { room, player, state, plotHint: hint },
      state.settings
    );
    const scene = result.scene;
    // Special handling for rest rooms — always offer to heal
    const finalScene: Scene = enrichRestScene(scene, room.type);
    if (result.note) setSourceNote(result.note);
    setState((s) => {
      if (s.phase !== 'playing') return s;
      return {
        ...s,
        encounter: ensureEncounter(s),
        currentScene: finalScene,
        logs: [
          ...s.logs,
          logEntry(
            'system',
            `Room ${s.quest ? s.quest.currentRoomIndex + 1 : '?'}: ${room.name} — narrator: ${result.source}`
          ),
        ].slice(-200),
      };
    });
    setLoadingScene(false);
  }, [player, room, state]);

  const chooseChoice = useCallback(
    (choice: Choice) => {
      setState((s) => {
        if (s.phase !== 'playing' || s.outcome) return s;
        const resolved = resolveChoice(s, choice);
        return { ...resolved.state, outcome: resolved.outcome };
      });
      setSourceNote(undefined);
    },
    []
  );

  const useClassAbility = useCallback(() => {
    setState((s) => {
      if (s.phase !== 'playing' || s.outcome) return s;
      const resolved = resolveClassAbility(s);
      return { ...resolved.state, outcome: resolved.outcome };
    });
    setSourceNote(undefined);
  }, []);

  const customAction = useCallback(
    async (actionText: string) => {
      if (!player || !room || !state.currentScene || state.outcome) return;
      setLoadingDeviation(true);
      const result = await resolveDeviation(
        {
          actionText,
          scene: state.currentScene,
          room,
          player,
          state,
        },
        state.settings
      );
      if (result.plotHint) plotHintRef.current = result.plotHint;
      setState((s) => {
        if (s.phase !== 'playing' || s.outcome) return s;
        return {
          ...s,
          outcome: result.outcome,
          logs: [
            ...s.logs,
            logEntry('narration', `${player.name} tried: "${actionText}"`, player.id),
            logEntry('narration', result.outcome.text, player.id),
          ].slice(-200),
        };
      });
      setLoadingDeviation(false);
    },
    [player, room, state]
  );

  const nextScene = useCallback(() => {
    setState((s) => {
      if (s.phase !== 'playing' || !s.quest) return s;
      if (!s.outcome) {
        return { ...s, currentScene: null };
      }

      if (!s.outcome.advancesRoom) {
        return {
          ...s,
          currentScene: null,
          outcome: null,
          lastRoll: null,
        };
      }

      const quest = advanceRoom(s.quest);
      const players = revivePlayers(s.players);
      const phase = quest.completed ? 'epilogue' : 'playing';
      const logs = quest.completed
        ? [...s.logs, logEntry('system', `${quest.name} is complete.`)].slice(-200)
        : s.logs;

      return {
        ...s,
        quest,
        players,
        phase,
        encounter: null,
        currentScene: null,
        outcome: null,
        lastRoll: null,
        logs,
      };
    });
    setSourceNote(undefined);
  }, []);

  const beginAdventure = useCallback(() => {
    setState((s) => {
      if (s.phase !== 'prologue') return s;
      if (
        s.storyQuestions.length > 0 &&
        s.storyAnswers.length < s.storyQuestions.length
      ) {
        return s;
      }
      return { ...s, phase: 'playing', currentScene: null, outcome: null };
    });
  }, []);

  const answerStoryQuestion = useCallback(
    (question: StoryQuestion, option: StoryQuestionOption) => {
      setState((s) => {
        if (s.phase !== 'prologue') return s;
        const answer: StoryAnswer = {
          questionId: question.id,
          askedTo: question.askedTo,
          prompt: question.prompt,
          answerId: option.id,
          answerLabel: option.label,
          answerDetail: option.detail,
        };
        const existingIndex = s.storyAnswers.findIndex(
          (entry) => entry.questionId === question.id
        );
        const storyAnswers =
          existingIndex >= 0
            ? s.storyAnswers.map((entry, index) =>
                index === existingIndex ? answer : entry
              )
            : [...s.storyAnswers, answer];
        return {
          ...s,
          storyAnswers,
          logs: [
            ...s.logs,
            logEntry(
              'narration',
              `${question.askedTo} chose ${option.label}.`,
              undefined
            ),
          ].slice(-200),
        };
      });
    },
    []
  );

  // Auto-request scene when we have a quest, a room, but no scene.
  useEffect(() => {
    if (
      state.phase === 'prologue' &&
      state.quest &&
      state.storyQuestions.length === 0 &&
      !loadingStorySetup
    ) {
      void requestStoryQuestions();
    }
  }, [
    state.phase,
    state.quest,
    state.storyQuestions.length,
    loadingStorySetup,
    requestStoryQuestions,
  ]);

  useEffect(() => {
    if (
      state.phase === 'playing' &&
      state.quest &&
      !state.quest.completed &&
      !state.currentScene &&
      !state.outcome &&
      !loadingScene
    ) {
      void requestScene();
    }
  }, [
    state.phase,
    state.quest,
    state.currentScene,
    state.outcome,
    loadingScene,
    requestScene,
  ]);

  const resetGame = useCallback(() => {
    clearState();
    setState(initialState(settings));
    setShowSettings(false);
  }, [settings]);

  const onAddItem = useCallback((playerId: string, item: Item) => {
    setState((s) => {
      const players = s.players.map((p) =>
        p.id === playerId
          ? { ...p, inventory: [...p.inventory, { ...item, id: `${item.id}-${uid('x')}` }] }
          : p
      );
      return appendLog(
        { ...s, players },
        logEntry('reward', `${players.find((p) => p.id === playerId)?.name} claims ${item.name}.`, playerId)
      );
    });
  }, []);

  const onGoFullscreen = useCallback(async () => {
    const el = document.documentElement;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen?.();
      else await document.exitFullscreen?.();
    } catch {
      /* ignored */
    }
  }, []);

  const progress = useMemo(() => {
    if (!state.quest) return { current: 0, total: 0 };
    return {
      current: state.quest.currentRoomIndex + 1,
      total: state.quest.rooms.length,
    };
  }, [state.quest]);

  // Setup screen
  if (!state.quest) {
    return (
      <Setup
        settings={settings}
        onStart={startGame}
        onUpdateSettings={setSettings}
      />
    );
  }

  const questComplete = state.quest.completed;
  const currentStage =
    state.phase === 'prologue'
      ? 'Story Setup'
      : state.phase === 'epilogue'
        ? 'Epilogue'
        : `Room ${progress.current}/${progress.total}`;
  const nextButtonLabel = state.outcome
    ? state.outcome.advancesRoom
      ? '▶ NEXT ROOM'
      : '▶ NEXT HERO'
    : '▶ NEXT SCENE';

  return (
    <div className="min-h-screen">
      <MusicPlayer
        phase={state.phase}
        roomType={room?.type ?? null}
        settings={settings}
      />
      <TopBar
        questName={state.quest.name}
        stageLabel={currentStage}
        provider={state.settings.provider}
        kids={state.settings.kidsMode}
        music={state.settings.musicEnabled}
        onToggleMusic={() => {
          const next = { ...settings, musicEnabled: !settings.musicEnabled };
          setSettings(next);
          setState((s) => ({ ...s, settings: next }));
        }}
        onOpenMap={() => setShowMap(true)}
        onOpenPhoto={() => setShowPhoto(true)}
        onOpenSettings={() => setShowSettings(true)}
        onPrint={() => window.print()}
        onFullscreen={onGoFullscreen}
      />

      {state.phase === 'prologue' ? (
        <Prologue
          quest={state.quest}
          players={state.players}
          storyQuestions={state.storyQuestions}
          storyAnswers={state.storyAnswers}
          loadingQuestions={loadingStorySetup}
          note={storySetupNote}
          onAnswer={answerStoryQuestion}
          onBegin={beginAdventure}
        />
      ) : state.phase === 'epilogue' ? (
        <Epilogue
          quest={state.quest}
          players={state.players}
          startingPlayers={state.startingPlayers}
          onReset={resetGame}
        />
      ) : (
        <main className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pb-40 pt-5 no-print scanlines">
          <div className="grid gap-5 lg:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
              {room && (
                <SceneView
                  settings={state.settings}
                  room={room}
                  scene={state.currentScene}
                  loading={loadingScene}
                  sourceNote={sourceNote}
                  activePlayer={player}
                  encounter={state.encounter}
                  outcome={state.outcome}
                  kidsMode={state.settings.kidsMode}
                  abilityUsage={state.abilityUsage}
                  lastRollSuccess={state.lastRoll?.success}
                  lastRoll={state.lastRoll}
                  onChoose={chooseChoice}
                  onUseAbility={useClassAbility}
                  onRequestScene={requestScene}
                  onCustomAction={customAction}
                  loadingDeviation={loadingDeviation}
                />
              )}
            </div>
            <div className="space-y-5 lg:sticky lg:top-24 self-start">
              <div className="hidden lg:block">
                <div className="font-display text-[10px] text-coin tracking-widest mb-3">
                  PARTY
                </div>
                <PartyPanel
                  players={state.players}
                  currentPlayerId={player?.id ?? ''}
                  currentRoomId={room?.id}
                  abilityUsage={state.abilityUsage}
                  compact
                />
              </div>
              <LogPanel logs={state.logs} />
            </div>
          </div>

          <section className="mt-6 lg:hidden">
            <div className="font-display text-[10px] text-coin tracking-widest mb-3">
              PARTY ROSTER
            </div>
            <PartyPanel
              players={state.players}
              currentPlayerId={player?.id ?? ''}
              currentRoomId={room?.id}
              abilityUsage={state.abilityUsage}
            />
          </section>
        </main>
      )}

      {showMap && state.quest && (
        <MapModal
          quest={state.quest}
          currentRoomId={room?.id ?? null}
          encounter={state.encounter}
          onClose={() => setShowMap(false)}
        />
      )}

      <PrintView quest={state.quest} />

      {state.phase === 'playing' && (
        <BottomBar
          readyToReveal={!state.currentScene && !loadingScene && !state.outcome}
          questComplete={questComplete}
          loading={loadingScene}
          onNext={nextScene}
          onRequest={requestScene}
          sceneActive={!!state.currentScene}
          outcomeReady={!!state.outcome}
          nextPlayerName={player?.name}
          nextLabel={nextButtonLabel}
        />
      )}

      {showTurnSplash && player && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-5">
          <div className="pixel-panel parchment p-8 animate-bounce max-w-sm text-center">
            <div className="font-display text-lg mb-4 text-bg-900">
              {player.name.toUpperCase()}'S TURN!
            </div>
            {player.avatarUrl && (
              <img
                src={player.avatarUrl}
                alt={player.name}
                className="w-48 h-48 mx-auto image-pixelated object-contain drop-shadow-2xl"
              />
            )}
            <div className="font-pixel text-2xl mt-4 text-bg-900 italic">
              Ready, Hero?
            </div>
          </div>
        </div>
      )}

      {showPhoto && (
        <PhotoArtifact
          settings={state.settings}
          players={state.players}
          onAddItem={onAddItem}
          onClose={() => setShowPhoto(false)}
        />
      )}
      {showSettings && (
        <SettingsModal
          settings={state.settings}
          onChange={(s) => {
            setSettings(s);
            setState((prev) => ({ ...prev, settings: s }));
          }}
          onClose={() => setShowSettings(false)}
          onReset={resetGame}
        />
      )}
    </div>
  );
}

function enrichRestScene(scene: Scene, roomType: string): Scene {
  if (roomType !== 'rest') return scene;
  // Ensure at least one choice grants rewardHp.
  if (scene.choices.some((c) => c.rewardHp && c.rewardHp > 0)) return scene;
  return {
    ...scene,
    choices: scene.choices.map((c, i) =>
      i === 0 ? { ...c, rewardHp: 3 } : c
    ),
  };
}

function TopBar({
  questName,
  stageLabel,
  provider,
  kids,
  music,
  onToggleMusic,
  onOpenMap,
  onOpenPhoto,
  onOpenSettings,
  onPrint,
  onFullscreen,
}: {
  questName: string;
  stageLabel: string;
  provider: Settings['provider'];
  kids: boolean;
  music: boolean;
  onToggleMusic: () => void;
  onOpenMap: () => void;
  onOpenPhoto: () => void;
  onOpenSettings: () => void;
  onPrint: () => void;
  onFullscreen: () => void;
}) {
  return (
    <div className="sticky top-0 z-30 bg-bg-900/95 backdrop-blur border-b-4 border-ink no-print">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-2 flex items-center gap-3">
        <div className="min-w-0">
          <div className="font-display text-[10px] sm:text-sm text-ink leading-tight truncate">
            {questName.toUpperCase()}
          </div>
          <div className="font-pixel text-lg text-ink-muted leading-none">
            {stageLabel} · {provider}
            {kids ? ' · kids' : ''}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <IconBtn onClick={onToggleMusic} label="Music" icon={music ? '🔊' : '🔇'} />
          <IconBtn onClick={onOpenMap} label="Map" icon="🗺" />
          <IconBtn onClick={onOpenPhoto} label="Photo" icon="📸" />
          <IconBtn onClick={onPrint} label="Print" icon="🖨" />
          <IconBtn onClick={onFullscreen} label="Full" icon="⛶" />
          <IconBtn onClick={onOpenSettings} label="Settings" icon="⚙" />
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="pixel-btn ghost min-w-[2.75rem] min-h-[2.75rem] px-1 py-1"
      aria-label={label}
      title={label}
    >
      <span className="text-xl">{icon}</span>
    </button>
  );
}

function BottomBar({
  readyToReveal,
  questComplete,
  loading,
  onNext,
  onRequest,
  sceneActive,
  outcomeReady,
  nextPlayerName,
  nextLabel,
}: {
  readyToReveal: boolean;
  questComplete: boolean;
  loading: boolean;
  onNext: () => void;
  onRequest: () => void;
  sceneActive: boolean;
  outcomeReady: boolean;
  nextPlayerName?: string;
  nextLabel: string;
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-bg-900/95 backdrop-blur border-t-4 border-ink no-print">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 flex gap-3">
        {questComplete ? (
          <div className="flex-1 pixel-btn success text-base">
            🎉 QUEST COMPLETE — Open ⚙ → Reset to play again
          </div>
        ) : outcomeReady ? (
          <button onClick={onNext} className="flex-1 pixel-btn primary text-lg py-6">
            {nextLabel}
            {nextPlayerName ? ` · ${nextPlayerName.toUpperCase()} READY` : ''}
          </button>
        ) : sceneActive ? (
          <div className="flex-1 font-pixel text-2xl text-ink-muted italic self-center text-center">
            Choose an action above...
          </div>
        ) : loading ? (
          <div className="flex-1 font-pixel text-2xl text-ink-muted italic self-center text-center">
            The narrator is setting the next room...
          </div>
        ) : (
          <button
            onClick={onRequest}
            disabled={!readyToReveal}
            className="flex-1 pixel-btn primary text-lg py-6"
          >
            ▶ REVEAL ROOM
          </button>
        )}
      </div>
    </div>
  );
}

function clonePlayers(players: Player[]): Player[] {
  return players.map((player) => ({
    ...player,
    stats: { ...player.stats },
    inventory: player.inventory.map((item) => ({
      ...item,
      bonus: item.bonus ? { ...item.bonus } : undefined,
    })),
    statusEffects: player.statusEffects.map((effect) => ({ ...effect })),
  }));
}
