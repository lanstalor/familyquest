import { useState } from 'react';
import { CLASSES } from '../game/classes';
import { ADVENTURES } from '../game/adventures';
import { createPlayer } from '../game/engine';
import type { ClassId, Player, Quest, Settings } from '../types';

interface Props {
  settings: Settings;
  onStart: (players: Player[], quest: Quest, kidsMode: boolean) => void;
  onUpdateSettings: (s: Settings) => void;
}

interface Draft {
  name: string;
  classId: ClassId;
}

function getAvatarUrl(name: string, classId: string): string | undefined {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('ben')) {
    return `/assets/characters/ben-${classId}.png`;
  } else if (lowerName.includes('myla')) {
    return `/assets/characters/myla-${classId}.png`;
  }
  return undefined;
}

export function Setup({ settings, onStart, onUpdateSettings }: Props) {
  const [drafts, setDrafts] = useState<Draft[]>([
    { name: 'Ben', classId: 'warrior' },
    { name: 'Myla', classId: 'bard' },
  ]);
  const [questId, setQuestId] = useState(ADVENTURES[0].id);
  const [kids, setKids] = useState(settings.kidsMode);

  function addPlayer() {
    if (drafts.length >= 4) return;
    const nextClass = CLASSES[drafts.length % CLASSES.length].id;
    const names = drafts.map(d => d.name.toLowerCase());
    let nextName = '';
    if (!names.includes('ben')) nextName = 'Ben';
    else if (!names.includes('myla')) nextName = 'Myla';
    setDrafts([...drafts, { name: nextName, classId: nextClass }]);
  }
  function removePlayer(i: number) {
    if (drafts.length <= 2) return;
    setDrafts(drafts.filter((_, idx) => idx !== i));
  }
  function update(i: number, patch: Partial<Draft>) {
    setDrafts(drafts.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  function begin() {
    const players = drafts.map((d, i) =>
      createPlayer(d.name || `Hero ${i + 1}`, d.classId, i)
    );
    const quest = ADVENTURES.find((q) => q.id === questId)!;
    onUpdateSettings({ ...settings, kidsMode: kids });
    onStart(players, JSON.parse(JSON.stringify(quest)), kids);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 lg:py-12 scanlines">
      <header className="text-center mb-10">
        <div className="text-coin font-display text-xs mb-3 tracking-widest">
          ★ PRESS START ★
        </div>
        <h1 className="font-display text-3xl sm:text-5xl text-ink drop-shadow-[4px_4px_0_#0a0e27] leading-snug">
          FAMILY QUEST<br />BOARD
        </h1>
        <p className="mt-6 text-ink-muted font-pixel text-2xl">
          A cozy 8-bit co-op adventure for 2–4 heroes.
        </p>
        <p className="mt-3 text-ink-muted font-pixel text-xl max-w-3xl mx-auto">
          Built for Ben and Myla to play together while an adult reads, helps,
          and keeps the table moving.
        </p>
      </header>

      <section className="pixel-panel p-6 sm:p-8 mb-8">
        <h2 className="font-display text-lg sm:text-xl mb-5">
          ① Assemble Your Party
        </h2>
        <div className="space-y-4">
          {drafts.map((d, i) => (
            <div
              key={i}
              className="bg-bg-800 border-4 border-ink p-4 flex flex-col lg:flex-row gap-3 lg:items-center"
            >
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                <div
                  className="sprite-frame overflow-hidden shrink-0"
                  style={{ background: '#1b1203', color: '#f0f0e8' }}
                >
                  {getAvatarUrl(d.name, d.classId) ? (
                    <img
                      src={getAvatarUrl(d.name, d.classId)}
                      alt={d.name}
                      className="w-full h-full object-cover image-pixelated"
                    />
                  ) : (
                    CLASSES.find((c) => c.id === d.classId)?.emoji
                  )}
                </div>
                <input
                  aria-label={`Player ${i + 1} name`}
                  placeholder={`Hero ${i + 1} name`}
                  value={d.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  className="bg-bg-900 border-2 border-ink px-3 py-3 text-ink text-xl font-pixel flex-1 min-w-0"
                />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {CLASSES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => update(i, { classId: c.id })}
                    className={`pixel-btn ${d.classId === c.id ? 'primary' : ''}`}
                  >
                    <span className="text-xl">{c.emoji}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
              {drafts.length > 2 && (
                <button
                  onClick={() => removePlayer(i)}
                  className="pixel-btn danger lg:ml-2"
                  aria-label={`Remove player ${i + 1}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {drafts.length < 4 && (
          <button onClick={addPlayer} className="pixel-btn ghost mt-5">
            + Add Hero
          </button>
        )}
      </section>

      <section className="pixel-panel p-6 sm:p-8 mb-8">
        <h2 className="font-display text-lg sm:text-xl mb-5">
          ② Choose Adventure
        </h2>
        <div className="grid lg:grid-cols-2 gap-5">
          {ADVENTURES.map((q) => (
            <button
              key={q.id}
              onClick={() => setQuestId(q.id)}
              className={`text-left p-5 border-4 ${
                questId === q.id
                  ? 'bg-coin text-bg-900 border-bg-900'
                  : 'bg-panel-dark text-ink border-ink'
              }`}
              style={{
                boxShadow:
                  questId === q.id
                    ? '0 0 0 2px #06070f, 4px 4px 0 2px rgba(0,0,0,0.6)'
                    : '0 0 0 2px #06070f, 4px 4px 0 2px rgba(0,0,0,0.5)',
              }}
            >
              <div className="font-display text-sm sm:text-base leading-snug">
                {q.name.toUpperCase()}
              </div>
              <div className="font-pixel text-2xl mt-3">
                {q.length} min · {q.rooms.length} rooms
              </div>
              <div className="font-pixel text-xl mt-2 opacity-90">{q.goal}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="pixel-panel p-6 sm:p-8 mb-8">
        <h2 className="font-display text-lg sm:text-xl mb-4">③ Difficulty</h2>
        <label className="flex items-center gap-4 font-pixel text-2xl">
          <input
            type="checkbox"
            className="w-7 h-7"
            checked={kids}
            onChange={(e) => setKids(e.target.checked)}
          />
          <span>
            KIDS MODE
            <span className="block text-lg text-ink-muted">
              Softer difficulty, shorter text, +1 to every roll.
            </span>
          </span>
        </label>
      </section>

      <div className="flex justify-center mt-10">
        <button onClick={begin} className="pixel-btn primary text-lg px-12 py-6">
          ▶ BEGIN QUEST
        </button>
      </div>
    </div>
  );
}
