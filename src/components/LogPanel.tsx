import { useState } from 'react';
import type { LogEntry } from '../types';

interface Props {
  logs: LogEntry[];
}

export function LogPanel({ logs }: Props) {
  const [open, setOpen] = useState(true);
  const recent = logs.slice(-30).reverse();
  return (
    <div className="pixel-panel p-4">
      <button
        className="w-full flex justify-between items-center"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-display text-[10px] text-coin tracking-widest">
          CHRONICLE
        </span>
        <span className="font-display text-[10px]">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="mt-3 max-h-[60vh] lg:max-h-[75vh] overflow-y-auto">
          {recent.length === 0 && (
            <div className="font-pixel text-xl text-ink-muted italic">
              Your story has not yet begun.
            </div>
          )}
          <ul className="space-y-1.5">
            {recent.map((l) => (
              <li
                key={l.id}
                className="log-entry font-pixel text-xl leading-snug border-l-4 pl-2"
                style={{ borderColor: colorFor(l.kind) }}
              >
                <span className="text-ink-muted mr-2 text-base">
                  {new Date(l.ts).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {l.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function colorFor(kind: LogEntry['kind']): string {
  switch (kind) {
    case 'roll':
      return '#f9d71c';
    case 'reward':
      return '#5fc860';
    case 'consequence':
      return '#e74c3c';
    case 'narration':
      return '#3aa8ff';
    default:
      return '#a6a6c0';
  }
}
