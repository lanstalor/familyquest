import type { Quest } from '../types';

interface Props {
  quest: Quest;
}

export function PrintView({ quest }: Props) {
  return (
    <div className="print-only">
      <h1 className="font-display text-3xl text-center">
        {quest.name} — Print Pack
      </h1>
      <p className="text-center italic">{quest.goal}</p>

      <h2 className="font-display text-2xl mt-6">Room Tiles</h2>
      <div className="print-grid">
        {quest.rooms.map((r, i) => (
          <div key={r.id} className="print-card parchment-card">
            <div className="text-xs uppercase tracking-widest">
              Room {i + 1} · {r.type}
            </div>
            <div className="font-display text-3xl mt-1">
              {r.emoji} {r.name}
            </div>
            <p className="mt-2 italic">{r.description}</p>
            {r.monster && (
              <div className="mt-3 border-t pt-2">
                <div className="font-display text-lg">
                  Monster: {r.monster.name}
                </div>
                <div className="small">
                  HP {r.monster.hp} · ATK +{r.monster.attackBonus} · DEF{' '}
                  {r.monster.defense}
                </div>
                <div className="small italic">{r.monster.description}</div>
              </div>
            )}
            {r.suggestedStat && (
              <div className="mt-2 small">
                Suggested: d20 + {r.suggestedStat.toUpperCase()} vs {r.target}
              </div>
            )}
            {r.possibleLoot && r.possibleLoot.length > 0 && (
              <div className="mt-2 small">
                <b>Possible loot:</b>{' '}
                {r.possibleLoot.map((l) => l.name).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl mt-6">Loot Cards</h2>
      <div className="print-grid">
        {quest.rooms
          .flatMap((r) => r.possibleLoot ?? [])
          .map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className="print-card parchment-card"
            >
              <div className="text-xs uppercase tracking-widest">
                {item.type}
              </div>
              <div className="font-display text-2xl mt-1">{item.name}</div>
              <p className="italic mt-1">{item.description}</p>
              {item.effect && (
                <div className="mt-2 small">
                  <b>Effect:</b> {item.effect}
                </div>
              )}
              {item.goldValue !== undefined && (
                <div className="small">Value: {item.goldValue}g</div>
              )}
            </div>
          ))}
      </div>

      <h2 className="font-display text-2xl mt-6">Monster Cards</h2>
      <div className="print-grid">
        {quest.rooms
          .filter((r) => r.monster)
          .map((r) => {
            const m = r.monster!;
            return (
              <div key={m.id} className="print-card parchment-card">
                <div className="text-xs uppercase tracking-widest">
                  Monster · {r.name}
                </div>
                <div className="font-display text-2xl mt-1">{m.name}</div>
                <p className="italic mt-1">{m.description}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 small">
                  <div>
                    <b>HP</b>
                    <br />
                    {m.hp}
                  </div>
                  <div>
                    <b>ATK</b>
                    <br />+{m.attackBonus}
                  </div>
                  <div>
                    <b>DEF</b>
                    <br />
                    {m.defense}
                  </div>
                </div>
                <div className="mt-2 small">
                  In combat rooms, keep fighting until this foe hits 0 HP and is
                  knocked down, pinned, disarmed, or driven off. Use the app
                  choices to resolve each exchange.
                </div>
              </div>
            );
          })}
      </div>

      <h2 className="font-display text-2xl mt-6">Activity Cards</h2>
      <div className="print-grid">
        {ACTIVITIES.map((p, i) => (
          <div key={i} className="print-card parchment-card">
            <div className="text-xs uppercase tracking-widest">{p.kind}</div>
            <div className="font-display text-xl mt-1">{p.title}</div>
            <p className="mt-1 italic">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const ACTIVITIES = [
  {
    kind: 'Draw',
    title: 'Draw your hero',
    body: 'On a small card, sketch your hero mid-adventure. Keep it near your token.',
  },
  {
    kind: 'Craft',
    title: 'Fold a paper crow',
    body: 'Make an origami crow as a helper NPC. Give it a name.',
  },
  {
    kind: 'Craft',
    title: 'Design your shield',
    body: 'Cut a shield shape. Add two symbols: one for your family, one for your hero.',
  },
  {
    kind: 'Move',
    title: 'Stand & stretch',
    body: 'Everyone stands, does 5 jumping jacks, then back to the table. Your heroes feel faster.',
  },
  {
    kind: 'Puzzle',
    title: 'Word riddle',
    body: 'Write a 4-letter word. Pass the paper. Next player adds a letter to make a new word.',
  },
  {
    kind: 'Story',
    title: 'Two truths & a tale',
    body: 'Tell your party two true facts about yourself and one funny lie. They guess.',
  },
  {
    kind: 'Draw',
    title: 'Map fragment',
    body: 'Tear a piece of paper. Sketch a tiny map of a place you have NOT visited yet.',
  },
  {
    kind: 'Move',
    title: 'Token trail',
    body: 'Collect 3 small objects (button, bead, stone). Place them to guard the boss room.',
  },
];
