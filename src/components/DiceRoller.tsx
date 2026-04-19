import type { GameState } from '../types';

interface Props {
  lastRoll: GameState['lastRoll'];
}

export function DiceRoller({ lastRoll }: Props) {
  if (!lastRoll) return null;
  const { d20, bonus, target, success, stat } = lastRoll;
  const total = d20 + bonus;
  return (
    <div className="pixel-panel dark p-5">
      <div className="flex items-center justify-between">
        <div className="font-display text-[10px] text-coin tracking-widest">
          LAST ROLL
        </div>
        <div
          className={`font-display text-[10px] px-2 py-1 border-2 ${
            success
              ? 'bg-quest-green text-bg-900 border-bg-900'
              : 'bg-hp text-white border-bg-900'
          }`}
        >
          {success ? 'SUCCESS' : 'FAIL'}
        </div>
      </div>
      <div className="mt-4 flex items-end gap-4">
        <div
          key={`${d20}-${Date.now()}`}
          className="dice-roll sprite-frame font-display text-3xl"
          style={{ width: '5.5rem', height: '5.5rem', background: '#f9d71c', color: '#1b1203' }}
        >
          {d20}
        </div>
        <div className="flex-1 font-pixel text-xl leading-tight">
          <div>
            d20 <b className="text-coin">{d20}</b> + {bonus} ({stat.toUpperCase()})
          </div>
          <div className="text-2xl mt-1">
            = <b className={success ? 'text-quest-green' : 'text-hp'}>{total}</b>
            <span className="text-ink-muted"> vs {target}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
