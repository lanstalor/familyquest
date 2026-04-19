import type { Player, Quest } from '../types';

interface Props {
  quest: Quest;
  players: Player[];
  startingPlayers: Player[];
  onReset: () => void;
}

export function Epilogue({
  quest,
  players,
  startingPlayers,
  onReset,
}: Props) {
  const totalGold = players.reduce((sum, player) => sum + player.gold, 0);

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 no-print scanlines">
      <section className="pixel-panel p-6 sm:p-8">
        <div className="font-display text-[10px] text-coin tracking-widest">
          QUEST COMPLETE
        </div>
        <h1 className="font-display text-xl sm:text-2xl mt-3 leading-snug">
          {quest.name.toUpperCase()}
        </h1>
        <div className="dialogue-box mt-6">
          {quest.closing.map((line) => (
            <p key={line} className="font-pixel text-2xl leading-snug mb-3 last:mb-0">
              {line}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-6 pixel-panel p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="font-display text-[10px] text-coin tracking-widest">
              LOOT SUMMARY
            </div>
            <p className="font-pixel text-2xl mt-2 text-ink-muted">
              Your family carried home {totalGold} gold in all.
            </p>
          </div>
          <button onClick={onReset} className="pixel-btn primary">
            ▶ PLAY AGAIN
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-6">
          {players.map((player) => {
            const start = startingPlayers.find(
              (startingPlayer) => startingPlayer.id === player.id
            );
            const gainedItems = player.inventory.filter(
              (item) => !start?.inventory.some((startingItem) => startingItem.id === item.id)
            );
            const goldDelta = player.gold - (start?.gold ?? 0);

            return (
              <div key={player.id} className="pixel-panel dark p-4">
                <div className="flex items-center gap-4">
                  {player.avatarUrl && (
                    <img
                      src={player.avatarUrl}
                      alt={player.name}
                      className="w-16 h-16 image-pixelated object-contain drop-shadow-md"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-display text-[11px] leading-snug">
                        {player.name.toUpperCase()}
                      </div>
                      <div className="font-pixel text-xl text-coin">
                        {player.gold}g {goldDelta >= 0 ? `(+${goldDelta})` : `(${goldDelta})`}
                      </div>
                    </div>
                    <div className="font-pixel text-xl mt-3 text-ink-muted">
                      Final HP {player.hp}/{player.maxHp}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-display text-[10px] text-coin tracking-widest">
                    NEW TREASURES
                  </div>
                  {gainedItems.length > 0 ? (
                    <ul className="mt-2 space-y-2 font-pixel text-xl">
                      {gainedItems.map((item) => (
                        <li key={item.id} className="border-l-4 border-coin pl-2 flex items-center gap-3">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name} className="w-8 h-8 image-pixelated object-contain drop-shadow-sm" />
                          )}
                          <span>{item.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="font-pixel text-xl mt-2 text-ink-muted italic">
                      This hero mostly carried the story.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
