import type { GameState, Scene } from '../../types';
import { uid } from '../engine';
import { TEACUP_DRAGON } from './teacup-dragon';
import type { AdventureScript } from './teacup-dragon';
import { WHISPERING_WOODS } from './whispering-woods';
import { THORNED_KING } from './thorned-king';

const SCRIPTS: Record<string, AdventureScript> = {
  'quest-short': TEACUP_DRAGON,
  'quest-medium': WHISPERING_WOODS,
  'quest-long': THORNED_KING,
};

export function selectScene(
  questId: string,
  roomId: string,
  state: GameState
): Scene | null {
  const script = SCRIPTS[questId];
  if (!script) return null;
  const variants = script.scenes[roomId];
  if (!variants || variants.length === 0) return null;
  const match = variants.find((v) => v.condition(state));
  if (!match) return null;
  return {
    ...match,
    id: uid(`scene-${roomId}`),
  };
}

export function getScript(questId: string): AdventureScript | null {
  return SCRIPTS[questId] ?? null;
}
