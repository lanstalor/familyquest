import { StatusEffect } from '../types';

export const STATUS_WEAKENED: Omit<StatusEffect, 'turnsRemaining'> = {
  id: 'status-weakened',
  name: 'Weakened',
  icon: '🤕',
  effect: '-1 to all rolls',
};

export const STATUS_STUNNED: Omit<StatusEffect, 'turnsRemaining'> = {
  id: 'status-stunned',
  name: 'Stunned',
  icon: '💫',
  effect: 'Can only use basic actions (no abilities)',
};

export const STATUS_INSPIRED: Omit<StatusEffect, 'turnsRemaining'> = {
  id: 'status-inspired',
  name: 'Inspired',
  icon: '✨',
  effect: '+1 to next roll',
};

export function createStatusEffect(
  base: Omit<StatusEffect, 'turnsRemaining'>,
  turns: number
): StatusEffect {
  return {
    ...base,
    turnsRemaining: turns,
  };
}
