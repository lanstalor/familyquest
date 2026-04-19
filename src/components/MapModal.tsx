import type { MonsterEncounter, Quest } from '../types';

interface Props {
  quest: Quest;
  currentRoomId: string | null;
  encounter: MonsterEncounter | null;
  onClose: () => void;
}

export function MapModal({ quest, currentRoomId, encounter, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-bg-900/85 z-50 flex items-center justify-center p-4 no-print">
      <div className="pixel-panel max-w-5xl w-full p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-display text-[10px] text-coin tracking-widest">
              QUEST MAP
            </div>
            <h3 className="font-display text-base mt-2 leading-snug">
              {quest.name.toUpperCase()}
            </h3>
          </div>
          <button onClick={onClose} className="pixel-btn ghost" aria-label="Close map">
            ✕
          </button>
        </div>

        <p className="font-pixel text-2xl text-ink-muted">
          Track where the party is, what is already cleared, and what kind of room is coming next.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quest.rooms.map((room, index) => {
            const isCurrent = room.id === currentRoomId && !quest.completed;
            const isCleared = index < quest.currentRoomIndex;
            const isUpcoming = index > quest.currentRoomIndex || quest.completed;
            const fightActive = encounter?.roomId === room.id && encounter.currentHp > 0;

            return (
              <div
                key={room.id}
                className={`pixel-panel p-4 ${
                  isCurrent ? 'ring-0' : room.type === 'boss' ? 'dark' : ''
                }`}
                style={
                  isCurrent
                    ? {
                        borderColor: '#f9d71c',
                        boxShadow:
                          '0 0 0 4px #06070f, 0 0 0 8px #f9d71c, 6px 6px 0 8px rgba(0,0,0,0.55)',
                      }
                    : undefined
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-[10px] text-coin tracking-widest">
                      ROOM {index + 1}
                    </div>
                    <div className="font-display text-[11px] mt-2 leading-snug">
                      {room.emoji} {room.name.toUpperCase()}
                    </div>
                  </div>
                  <span
                    className={`font-display text-[8px] px-2 py-1 border-2 ${
                      isCurrent
                        ? 'bg-coin text-bg-900 border-bg-900'
                        : isCleared
                          ? 'bg-quest-green text-bg-900 border-bg-900'
                          : 'bg-bg-900 text-ink-muted border-ink-muted'
                    }`}
                  >
                    {isCurrent ? 'HERE' : isCleared ? 'CLEAR' : 'AHEAD'}
                  </span>
                </div>

                <div className="font-pixel text-xl text-ink-muted mt-3">
                  {room.type.toUpperCase()}
                  {room.monster ? ` · ${room.monster.name}` : ''}
                </div>
                <p className="font-pixel text-xl mt-3">{room.description}</p>

                {fightActive && encounter && (
                  <div className="mt-4 border-t-2 border-ink/30 pt-3">
                    <div className="font-display text-[10px] text-coin tracking-widest">
                      ACTIVE FIGHT
                    </div>
                    <div className="font-pixel text-2xl mt-2">
                      {encounter.monsterName}: {encounter.currentHp}/{encounter.maxHp} HP
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
