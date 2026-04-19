import { Settings, Stat, Player, Monster } from '../types';
import { statBonus } from './engine';

export interface DifficultyModifiers {
  rollBonus: number;
  monsterDamageReduction: number;
  targetAdjustment: number;
}

export function getDifficultyModifiers(settings: Settings): DifficultyModifiers {
  if (settings.kidsMode) {
    return {
      rollBonus: 1,
      monsterDamageReduction: 1,
      targetAdjustment: -2, // Make AI-generated targets easier if they didn't follow prompt
    };
  }
  return {
    rollBonus: 0,
    monsterDamageReduction: 0,
    targetAdjustment: 0,
  };
}

export function calculateEffectiveBonus(
  player: Player,
  stat: Stat,
  settings: Settings,
  lastRollSuccess?: boolean
): number {
  const baseBonus = statBonus(player, stat);
  const modifiers = getDifficultyModifiers(settings);
  const teamworkBonus = lastRollSuccess ? 1 : 0;
  return baseBonus + modifiers.rollBonus + teamworkBonus;
}

export function calculateMonsterDamage(
  monster: Monster,
  settings: Settings
): number {
  const modifiers = getDifficultyModifiers(settings);
  return Math.max(1, monster.attackBonus - modifiers.monsterDamageReduction);
}
