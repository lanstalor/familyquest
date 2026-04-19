import { getClass } from '../game/classes';
import type { Player } from '../types';

interface Props {
  players: Player[];
  currentPlayerId: string;
  currentRoomId?: string | null;
  abilityUsage: Record<string, string>;
  compact?: boolean;
}

export function PartyPanel({ players, currentPlayerId, currentRoomId, abilityUsage, compact }: Props) {
  return (
    <div className={`grid gap-5 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'}`}>
      {players.map((p) => (
        <PlayerCard
          key={p.id}
          player={p}
          active={p.id === currentPlayerId}
          abilityReady={!currentRoomId || abilityUsage[p.id] !== currentRoomId}
          compact={compact}
        />
      ))}
    </div>
  );
}

function PlayerCard({
  player,
  active,
  abilityReady,
  compact,
}: {
  player: Player;
  active: boolean;
  abilityReady: boolean;
  compact?: boolean;
}) {
  const cls = getClass(player.classId);
  const hpPct = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const low = hpPct < 35;

  if (compact) {
    return (
      <div
        className={`pixel-panel p-3 ${active ? 'ring-0' : ''}`}
        style={
          active
            ? {
                borderColor: '#f9d71c',
                boxShadow: '0 0 0 2px #06070f, 0 0 0 4px #f9d71c',
              }
            : undefined
        }
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 shrink-0 flex items-center justify-center overflow-visible"
          >
            {player.avatarUrl ? (
              <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-contain image-pixelated" />
            ) : (
              <div className="sprite-frame" style={{ width: '2.5rem', height: '2.5rem', background: player.color, color: '#f0f0e8' }}>{cls.emoji}</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[9px] leading-tight truncate">
              {player.name.toUpperCase()}
            </div>
            <div className="font-pixel text-lg text-ink-muted leading-none">
              {cls.name}
            </div>
          </div>
          <div className="text-right">
            <div className="font-pixel text-lg leading-none">
               <span className={low ? 'text-hp' : 'text-ink'}>{player.hp}</span>
               <span className="text-ink-muted">/{player.maxHp}</span>
            </div>
            <div className={`mt-1 font-display text-[8px] px-1 py-0.5 border-2 ${abilityReady ? 'bg-quest-green text-bg-900 border-bg-900' : 'bg-bg-900 text-ink-muted border-ink-muted'}`}>
              {abilityReady ? 'READY' : 'USED'}
            </div>
          </div>
        </div>
        <div className="pixel-bar mt-2 h-2" style={{ height: '8px', color: low ? '#e74c3c' : '#5fc860' }}>
          <span style={{ width: `${hpPct}%` }} />
        </div>
        {player.statusEffects.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {player.statusEffects.map((s) => (
              <span key={s.id} className="text-lg leading-none" title={s.effect}>
                {s.icon}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`pixel-panel p-4 ${active ? 'ring-0' : ''}`}
      style={
        active
          ? {
              borderColor: '#f9d71c',
              boxShadow:
                '0 0 0 4px #06070f, 0 0 0 8px #f9d71c, 6px 6px 0 8px rgba(0,0,0,0.55)',
            }
          : undefined
      }
    >
      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 shrink-0 flex items-center justify-center overflow-visible"
        >
          {player.avatarUrl ? (
            <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-contain image-pixelated drop-shadow-sm" />
          ) : (
            <div className="sprite-frame" style={{ background: player.color, color: '#f0f0e8' }}>{cls.emoji}</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-xs leading-tight truncate">
            {player.name.toUpperCase()}
          </div>
          <div className="font-pixel text-xl text-ink-muted leading-none">
            {cls.name}
          </div>
        </div>
        {active && (
          <div className="font-display text-[9px] bg-coin text-bg-900 px-2 py-1 border-2 border-bg-900">
            TURN
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between font-pixel text-xl leading-none">
          <span className="font-display text-[10px] text-ink">HP</span>
          <span>
            <span className={low ? 'text-hp' : 'text-ink'}>
              {String(player.hp).padStart(2, '0')}
            </span>
            <span className="text-ink-muted">/{String(player.maxHp).padStart(2, '0')}</span>
          </span>
        </div>
        <div className="pixel-bar mt-1" style={{ color: low ? '#e74c3c' : '#5fc860' }}>
          <span style={{ width: `${hpPct}%` }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-y-1 gap-x-3 font-pixel text-xl">
        <div className="flex justify-between"><span className="font-display text-[9px]">STR</span><span>{formatStat(player.stats.str)}</span></div>
        <div className="flex justify-between"><span className="font-display text-[9px]">DEX</span><span>{formatStat(player.stats.dex)}</span></div>
        <div className="flex justify-between"><span className="font-display text-[9px]">INT</span><span>{formatStat(player.stats.int)}</span></div>
        <div className="flex justify-between"><span className="font-display text-[9px]">CHA</span><span>{formatStat(player.stats.cha)}</span></div>
      </div>

      <div className="mt-3 flex items-center gap-2 font-pixel text-xl text-coin">
        <span className="font-display text-[9px] text-ink">GOLD</span>
        <span>{player.gold}</span>
      </div>

      <div className="mt-3 border-t-2 border-ink/30 pt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-[9px] text-ink">ABILITY</span>
          <span
            className={`font-display text-[8px] px-2 py-1 border-2 ${
              abilityReady
                ? 'bg-quest-green text-bg-900 border-bg-900'
                : 'bg-bg-900 text-ink-muted border-ink-muted'
            }`}
          >
            {abilityReady ? 'READY' : 'USED'}
          </span>
        </div>
        <div className="font-pixel text-xl mt-2">{cls.combatAbility.name}</div>
        <div className="font-pixel text-lg text-ink-muted mt-1">
          {cls.combatAbility.description}
        </div>
      </div>

      {player.statusEffects.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {player.statusEffects.map((s) => (
            <span
              key={s.id}
              className="tag"
              title={s.effect}
            >
              {s.icon} {s.name} ({s.turnsRemaining})
            </span>
          ))}
        </div>
      )}

      {player.inventory.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer font-display text-[10px] text-ink">
            ITEMS ({player.inventory.length}) ▼
          </summary>
          <ul className="mt-2 space-y-2 font-pixel text-lg">
            {player.inventory.map((i) => (
              <li key={i.id} className="leading-snug border-l-4 border-coin pl-2 flex items-start gap-2">
                {i.imageUrl && (
                  <img src={i.imageUrl} alt={i.name} className="w-8 h-8 image-pixelated object-contain drop-shadow-sm" />
                )}
                <div>
                  <span className="text-ink font-semibold block">{i.name}</span>
                  {i.effect && (
                    <span className="block text-ink-muted">{i.effect}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function formatStat(n: number): string {
  if (n >= 0) return `+${n}`;
  return String(n);
}
