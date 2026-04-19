import { useState } from 'react';
import type { Provider, Settings } from '../types';

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
  onClose: () => void;
  onReset: () => void;
}

const PROVIDER_INFO: Record<
  Provider,
  { label: string; keyLabel: string; modelHint: string; note: string }
> = {
  demo: {
    label: 'DEMO',
    keyLabel: '',
    modelHint: '',
    note: 'Plays using seeded mock scenes. Fully offline.',
  },
  openai: {
    label: 'OPENAI',
    keyLabel: 'OPENAI_API_KEY',
    modelHint: 'gpt-4o-mini, gpt-4o',
    note: 'Calls the OpenAI API directly. Key stored in localStorage.',
  },
  anthropic: {
    label: 'ANTHROPIC',
    keyLabel: 'ANTHROPIC_API_KEY',
    modelHint: 'claude-haiku-4-5-20251001, claude-3-5-sonnet-20240620',
    note: 'Calls the Anthropic API directly (browser header required).',
  },
  gemini: {
    label: 'GEMINI',
    keyLabel: 'GEMINI_API_KEY',
    modelHint: 'gemini-1.5-flash, gemini-1.5-pro',
    note: 'Calls Google Generative Language API directly.',
  },
};

export function SettingsModal({ settings, onChange, onClose, onReset }: Props) {
  const [local, setLocal] = useState<Settings>(settings);
  const info = PROVIDER_INFO[local.provider];

  function save() {
    onChange(local);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-bg-900/85 z-50 flex items-center justify-center p-4 no-print">
      <div className="pixel-panel max-w-2xl w-full p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-base">⚙ SETTINGS</h3>
          <button
            onClick={onClose}
            className="pixel-btn ghost"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <label className="block font-display text-[10px] text-coin tracking-widest mb-2">
          PROVIDER
        </label>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {(['demo', 'openai', 'anthropic', 'gemini'] as Provider[]).map((p) => (
            <button
              key={p}
              onClick={() => setLocal({ ...local, provider: p })}
              className={`pixel-btn ${local.provider === p ? 'primary' : ''}`}
            >
              {PROVIDER_INFO[p].label}
            </button>
          ))}
        </div>

        {local.provider !== 'demo' && (
          <>
            <label className="block font-display text-[10px] text-coin tracking-widest mb-2">
              API KEY ({info.keyLabel})
            </label>
            <input
              type="password"
              autoComplete="off"
              value={local.apiKey}
              onChange={(e) => setLocal({ ...local, apiKey: e.target.value })}
              placeholder="paste key here"
              className="w-full bg-bg-900 border-4 border-ink px-3 py-3 text-ink font-pixel text-xl mb-4"
            />
            <label className="block font-display text-[10px] text-coin tracking-widest mb-2">
              MODEL (optional)
            </label>
            <input
              value={local.model}
              onChange={(e) => setLocal({ ...local, model: e.target.value })}
              placeholder={info.modelHint}
              className="w-full bg-bg-900 border-4 border-ink px-3 py-3 text-ink font-pixel text-xl mb-4"
            />
          </>
        )}

        <p className="font-pixel text-xl text-ink-muted italic mb-5">{info.note}</p>

        <label className="flex items-center gap-3 font-pixel text-2xl mb-5">
          <input
            type="checkbox"
            className="w-7 h-7"
            checked={local.kidsMode}
            onChange={(e) => setLocal({ ...local, kidsMode: e.target.checked })}
          />
          KIDS MODE
        </label>

        <label className="flex items-center gap-3 font-pixel text-2xl mb-5">
          <input
            type="checkbox"
            className="w-7 h-7"
            checked={local.musicEnabled}
            onChange={(e) => setLocal({ ...local, musicEnabled: e.target.checked })}
          />
          MUSIC ENABLED
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={save} className="pixel-btn primary flex-1">
            Save
          </button>
          <button onClick={onReset} className="pixel-btn danger">
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
}
