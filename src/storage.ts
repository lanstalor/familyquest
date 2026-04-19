import type { GameState, Settings } from './types';
import { getAdventure } from './game/adventures';

const STATE_KEY = 'fqb:state:v1';
const SETTINGS_KEY = 'fqb:settings:v1';

export const DEFAULT_SETTINGS: Settings = {
  provider: 'demo',
  apiKey: '',
  model: '',
  kidsMode: false,
  fullscreenHint: true,
  musicEnabled: true,
};

export function loadSettings(): Settings {
  const env = bootstrapFromEnv();
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return env;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    const merged: Settings = { ...DEFAULT_SETTINGS, ...parsed };
    // If saved settings have no key but env does, prefer env (handles first-launch after adding .env).
    if (!merged.apiKey && env.apiKey) {
      return {
        ...merged,
        provider: env.provider,
        apiKey: env.apiKey,
        model: merged.model || env.model,
      };
    }
    return merged;
  } catch {
    return env;
  }
}

export function saveSettings(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    return normalizeState(JSON.parse(raw) as Partial<GameState>);
  } catch {
    return null;
  }
}

export function saveState(state: GameState) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function clearState() {
  localStorage.removeItem(STATE_KEY);
}

function bootstrapFromEnv(): Settings {
  const env = import.meta.env;
  const provider = (env.VITE_AI_PROVIDER as Settings['provider']) || 'demo';
  let apiKey = '';
  if (provider === 'openai') apiKey = String(env.VITE_OPENAI_API_KEY || '');
  else if (provider === 'anthropic') apiKey = String(env.VITE_ANTHROPIC_API_KEY || '');
  else if (provider === 'gemini') apiKey = String(env.VITE_GEMINI_API_KEY || '');
  const model = String(env.VITE_AI_MODEL || '');
  return {
    ...DEFAULT_SETTINGS,
    provider: apiKey ? provider : 'demo',
    apiKey,
    model,
  };
}

function normalizeState(saved: Partial<GameState>): GameState | null {
  if (!saved || typeof saved !== 'object') return null;

  const settings = saved.settings
    ? { ...DEFAULT_SETTINGS, ...saved.settings }
    : DEFAULT_SETTINGS;
  const players = Array.isArray(saved.players) ? saved.players : [];
  const savedQuest = saved.quest ?? null;
  const quest = savedQuest?.id
    ? {
        ...(getAdventure(savedQuest.id) ?? savedQuest),
        ...savedQuest,
      }
    : null;
  const phase =
    saved.phase ??
    (quest ? (quest.completed ? 'epilogue' : 'playing') : 'setup');

  return {
    settings,
    players,
    startingPlayers: Array.isArray(saved.startingPlayers)
      ? saved.startingPlayers
      : players,
    abilityUsage:
      saved.abilityUsage && typeof saved.abilityUsage === 'object'
        ? saved.abilityUsage
        : {},
    currentPlayerIndex: saved.currentPlayerIndex ?? 0,
    quest,
    phase,
    storyQuestions: Array.isArray(saved.storyQuestions) ? saved.storyQuestions : [],
    storyAnswers: Array.isArray(saved.storyAnswers) ? saved.storyAnswers : [],
    encounter: saved.encounter ?? null,
    currentScene: saved.currentScene ?? null,
    outcome: saved.outcome ?? null,
    lastRoll: saved.lastRoll ?? null,
    logs: Array.isArray(saved.logs) ? saved.logs : [],
    turnCount: saved.turnCount ?? 0,
  };
}
