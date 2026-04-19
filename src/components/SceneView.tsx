import { useState, useRef } from 'react';
import type {
  Choice,
  MonsterEncounter,
  Outcome,
  Player,
  Room,
  Scene,
  Settings,
} from '../types';
import { statBonus } from '../game/engine';
import { getClass } from '../game/classes';
import { calculateEffectiveBonus } from '../game/modifiers';
import { DiceRoller } from './DiceRoller';

interface Props {
  settings: Settings;
  quest: Quest;
  room: Room;
  scene: Scene | null;
  loading: boolean;
  sourceNote?: string;
  activePlayer: Player | null;
  encounter: MonsterEncounter | null;
  outcome: Outcome | null;
  kidsMode: boolean;
  abilityUsage: Record<string, string>;
  lastRollSuccess?: boolean;
  lastRoll?: {
    playerId: string;
    d20: number;
    bonus: number;
    target: number;
    success: boolean;
    stat: string;
  } | null;
  loadingDeviation?: boolean;
  onChoose: (choice: Choice) => void;
  onUseAbility: () => void;
  onRequestScene: () => void;
  onCustomAction?: (text: string) => void;
}

const KIND_LABEL: Record<NonNullable<Scene['activityKind']>, string> = {
  craft: 'CRAFT',
  draw: 'DRAW',
  move: 'MOVE',
  puzzle: 'PUZZLE',
  story: 'STORY',
};

export function SceneView({
  settings,
  quest,
  room,
  scene,
  loading,
  sourceNote,
  activePlayer,
  encounter,
  outcome,
  kidsMode,
  abilityUsage,
  lastRollSuccess,
  lastRoll,
  loadingDeviation,
  onChoose,
  onUseAbility,
  onRequestScene,
  onCustomAction,
}: Props) {
  const combatEncounter =
    room.monster && encounter?.roomId === room.id ? encounter : null;
  const foeHpPct = combatEncounter
    ? Math.max(0, Math.min(100, (combatEncounter.currentHp / combatEncounter.maxHp) * 100))
    : 0;
  const activeClass = activePlayer ? getClass(activePlayer.classId) : null;
  const abilityAvailable =
    !!activePlayer &&
    !!combatEncounter &&
    !outcome &&
    abilityUsage[activePlayer.id] !== room.id;

  return (
    <div className="pixel-panel p-5 sm:p-6 lg:p-8">
      <div className="flex items-start gap-4">
        <div className="sprite-frame text-4xl">{room.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-[10px] text-coin tracking-widest">
            ROOM · {room.type.toUpperCase()}
          </div>
          <h2 className="font-display text-lg sm:text-2xl leading-tight mt-1">
            {room.name.toUpperCase()}
          </h2>
          <p className="font-pixel text-xl lg:text-2xl mt-3 text-ink-muted italic">
            {room.description}
          </p>
        </div>
        {activePlayer && !outcome && (
          <div className="pixel-panel dark px-3 py-2 flex items-center gap-3">
            {activePlayer.avatarUrl && (
              <img
                src={activePlayer.avatarUrl}
                alt={activePlayer.name}
                className="w-14 h-14 image-pixelated object-contain"
              />
            )}
            <div className="text-right">
              <div className="font-display text-[9px] text-coin tracking-widest">
                ACTIVE HERO
              </div>
              <div className="font-pixel text-2xl leading-none mt-1">
                {activePlayer.name}
              </div>
            </div>
          </div>
        )}
        {kidsMode && (
          <span className="tag kind-move">KIDS</span>
        )}
      </div>

      <SceneBanner room={room} quest={quest} />

      <div className="mt-6 min-h-[8rem]">
        {loading && (
          <div className="dialogue-box animate-pulse">
            <span className="font-pixel text-2xl">
              The narrator gathers their breath<span className="dots">...</span>
            </span>
          </div>
        )}
        {!loading && scene && (
          <div className="log-entry">
            <div className="dialogue-box">
              <p className="font-pixel text-2xl leading-snug">{scene.narration}</p>
            </div>

            {scene.hint && (
              <p className="mt-3 font-pixel text-xl text-coin italic">
                ✦ Hint: {scene.hint}
              </p>
            )}

            {scene.activity && (
              <div className="mt-4 pixel-panel dark p-4 flex gap-3 items-start">
                <span
                  className={`tag ${
                    scene.activityKind
                      ? `kind-${scene.activityKind}`
                      : 'kind-craft'
                  }`}
                >
                  {scene.activityKind ? KIND_LABEL[scene.activityKind] : 'ACTIVITY'}
                </span>
                <div className="font-pixel text-xl flex-1">{scene.activity}</div>
              </div>
            )}

            {outcome && (
              <div className="mt-4 space-y-4">
                {lastRoll && <DiceRoller lastRoll={lastRoll} />}
                <div className="pixel-panel dark p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className={`font-display text-[10px] px-2 py-1 border-2 ${
                      outcome.success
                        ? 'bg-quest-green text-bg-900 border-bg-900'
                        : 'bg-hp text-white border-bg-900'
                    }`}
                  >
                    {outcome.success ? 'SUCCESS' : 'SETBACK'}
                  </div>
                  <div className="font-display text-[10px] text-coin tracking-widest">
                    {outcome.playerName.toUpperCase()} · {outcome.choiceLabel.toUpperCase()}
                  </div>
                </div>
                <p className="font-pixel text-2xl mt-3 leading-snug">{outcome.text}</p>
                {outcome.rollSummary && (
                  <div className="font-pixel text-xl text-coin mt-3">
                    {outcome.rollSummary}
                  </div>
                )}
                {outcome.rewards.length > 0 && (
                  <div className="mt-4">
                    <div className="font-display text-[10px] text-coin tracking-widest">
                      REWARDS
                    </div>
                    <ul className="mt-2 space-y-1 font-pixel text-xl">
                      {outcome.rewards.map((reward) => (
                        <li key={reward} className="border-l-4 border-quest-green pl-2">
                          {reward}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {outcome.consequences.length > 0 && (
                  <div className="mt-4">
                    <div className="font-display text-[10px] text-coin tracking-widest">
                      CONSEQUENCES
                    </div>
                    <ul className="mt-2 space-y-1 font-pixel text-xl">
                      {outcome.consequences.map((consequence) => (
                        <li key={consequence} className="border-l-4 border-hp pl-2">
                          {consequence}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="font-pixel text-xl italic text-ink-muted mt-4">
                  {outcome.advancesRoom
                    ? 'Challenge complete! Tap the button below to move to the NEXT ROOM.'
                    : 'The challenge remains! Tap the button below to pass to the NEXT HERO.'}
                </div>
              </div>
              </div>
            )}
          </div>
        )}
        {!loading && !scene && (
          <div className="text-center">
            <button onClick={onRequestScene} className="pixel-btn primary touch-big">
              Reveal this room
            </button>
          </div>
        )}
      </div>

      {sourceNote && (
        <div className="mt-4 font-pixel text-lg text-hp">⚠ {sourceNote}</div>
      )}

      {room.npcAvatarUrl && !combatEncounter && (
        <div className="mt-4 pixel-panel dark p-4 flex items-center gap-4">
          <img
            src={room.npcAvatarUrl}
            alt="NPC"
            className="w-20 h-20 image-pixelated object-contain drop-shadow-md"
          />
          <div>
            <div className="font-display text-[10px] text-coin tracking-widest">
              ENCOUNTER
            </div>
            <div className="font-pixel text-xl text-ink-muted mt-2">
              A creature watches you from the shadows.
            </div>
          </div>
        </div>
      )}

      {combatEncounter && (
        <div className="mt-4 pixel-panel dark p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-4">
              {room.monster?.avatarUrl && (
                <img
                  src={room.monster.avatarUrl}
                  alt={combatEncounter.monsterName}
                  className="w-20 h-20 image-pixelated object-contain drop-shadow-md"
                />
              )}
              <div>
                <div className="font-display text-[10px] text-coin tracking-widest">
                  FOE
                </div>
                <div className="font-display text-[11px] mt-2 leading-snug">
                  {combatEncounter.monsterName.toUpperCase()}
                </div>
                <div className="font-pixel text-xl text-ink-muted mt-2">
                  Fight until this foe is knocked flat, pinned, or forced to run.
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-[10px] text-coin tracking-widest">
                HP
              </div>
              <div className="font-pixel text-2xl mt-2">
                {combatEncounter.currentHp}/{combatEncounter.maxHp}
              </div>
            </div>
          </div>
          <div className="pixel-bar mt-3" style={{ color: '#e74c3c' }}>
            <span style={{ width: `${foeHpPct}%` }} />
          </div>
        </div>
      )}

      {combatEncounter && activePlayer && activeClass && (
        <div className="mt-4 pixel-panel dark p-4">
          <div className="font-display text-[10px] text-coin tracking-widest">
            COMBAT KIT
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] mt-3">
            <div>
              <div className="font-display text-[10px] text-coin tracking-widest">
                EQUIPPED
              </div>
              <div className="font-pixel text-2xl mt-2">
                {activeClass.startingItem.name}
              </div>
              <div className="font-pixel text-xl text-ink-muted mt-1">
                {activeClass.startingItem.effect ?? activeClass.startingItem.description}
              </div>
            </div>
            <div>
              <div className="font-display text-[10px] text-coin tracking-widest">
                CLASS MOVE
              </div>
              <div className="font-pixel text-2xl mt-2">
                {activeClass.combatAbility.name}
              </div>
              <div className="font-pixel text-xl text-ink-muted mt-1">
                {activeClass.combatAbility.description}
              </div>
              <button
                onClick={onUseAbility}
                disabled={!abilityAvailable}
                className="pixel-btn primary w-full mt-4"
              >
                {abilityAvailable
                  ? `Use ${activeClass.combatAbility.name}`
                  : `${activeClass.combatAbility.name} spent`}
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && scene && (
        <div className={`mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 ${outcome || loadingDeviation ? 'opacity-60' : ''}`}>
          {scene.choices.map((c) => (
            <ChoiceButton
              key={c.id}
              choice={c}
              activePlayer={activePlayer}
              settings={settings}
              lastRollSuccess={lastRollSuccess}
              disabled={!!outcome || !!loadingDeviation}
              onClick={() => onChoose(c)}
            />
          ))}
        </div>
      )}

      {!loading && scene && !outcome && onCustomAction && (
        <DeviationInput
          loading={!!loadingDeviation}
          onSubmit={onCustomAction}
        />
      )}
    </div>
  );
}

function SceneBanner({ room, quest }: { room: Room; quest: Quest }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const src = room.backgroundUrl || quest.backgroundUrl || `/assets/scenes/${room.id}.png`;

  return (
    <div className="mt-4 -mx-5 sm:-mx-6 lg:-mx-8 border-y-4 border-ink bg-bg-900 flex justify-center overflow-hidden shadow-inner">
      <img
        src={src}
        alt=""
        onError={() => setVisible(false)}
        className="max-h-[50vh] sm:max-h-[60vh] w-auto image-pixelated object-contain"
      />
    </div>
  );
}

function DeviationInput({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
    setText('');
    setOpen(false);
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="pixel-btn ghost w-full text-left justify-between"
        disabled={loading}
      >
        <span className="font-pixel text-xl">
          {loading ? 'The narrator is thinking...' : '💡 Got another idea?'}
        </span>
        <span className="font-display text-[9px]">{open ? '▲' : '▼'}</span>
      </button>

      {open && !loading && (
        <div className="mt-2 pixel-panel dark p-4 space-y-3">
          <div className="font-display text-[10px] text-coin tracking-widest">
            TRY SOMETHING DIFFERENT
          </div>
          <p className="font-pixel text-xl text-ink-muted">
            Type what your hero does. The narrator will improvise!
          </p>
          <textarea
            className="w-full bg-bg-900 border-2 border-ink text-ink font-pixel text-xl p-3 resize-none focus:outline-none focus:border-coin"
            rows={3}
            placeholder="e.g. I try to befriend the goblin by sharing food..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="pixel-btn primary w-full"
          >
            ▶ TRY IT
          </button>
        </div>
      )}
    </div>
  );
}

function ChoiceButton({
  choice,
  activePlayer,
  settings,
  lastRollSuccess,
  disabled,
  onClick,
}: {
  choice: Choice;
  activePlayer: Player | null;
  settings: Settings;
  lastRollSuccess?: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const bonus =
    !disabled && choice.requiresRoll && choice.stat && activePlayer
      ? calculateEffectiveBonus(activePlayer, choice.stat, settings, lastRollSuccess)
      : 0;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="pixel-btn touch-big text-left justify-between"
      style={{ textAlign: 'left' }}
    >
      <span className="font-display text-[11px] leading-snug">
        ▸ {choice.label}
      </span>
      {!disabled && choice.requiresRoll && choice.stat && (
        <span className="font-display text-[9px] bg-coin text-bg-900 px-2 py-1 border-2 border-bg-900 whitespace-nowrap">
          d20 {bonus >= 0 ? '+' : ''}
          {bonus} {choice.stat.toUpperCase()} vs {choice.target}
        </span>
      )}
    </button>
  );
}
