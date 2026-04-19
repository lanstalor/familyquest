import type { ClassId, CombatAbility, Item, Stats } from '../types';

export interface ClassDef {
  id: ClassId;
  name: string;
  emoji: string;
  tagline: string;
  baseStats: Stats;
  baseMaxHp: number;
  startingItem: Item;
  combatAbility: CombatAbility;
  color: string;
}

export const CLASSES: ClassDef[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    emoji: '🛡️',
    tagline: 'Strong arms, stronger heart.',
    baseStats: { str: 3, dex: 1, int: 0, cha: 1 },
    baseMaxHp: 14,
    color: '#b03a2e',
    startingItem: {
      id: 'item-sword',
      name: 'Iron Sword',
      description: 'A reliable blade with a leather grip.',
      type: 'weapon',
      effect: '+1 to STR rolls in combat',
      bonus: { str: 1 },
    },
    combatAbility: {
      id: 'warrior-shield-bash',
      name: 'Shield Bash',
      description: 'Crash straight through the foe and hit hard. Deals 4 damage once per room.',
      damage: 4,
    },
  },
  {
    id: 'mage',
    name: 'Mage',
    emoji: '🔮',
    tagline: 'Reads the old runes.',
    baseStats: { str: 0, dex: 1, int: 3, cha: 1 },
    baseMaxHp: 10,
    color: '#2e4a87',
    startingItem: {
      id: 'item-tome',
      name: 'Pocket Tome',
      description: 'Crackling pages that hum when you read them.',
      type: 'artifact',
      effect: '+1 to INT rolls on puzzles',
      bonus: { int: 1 },
    },
    combatAbility: {
      id: 'mage-arc-bolt',
      name: 'Arc Bolt',
      description: 'Loose a crackling rune-bolt from range. Deals 4 damage once per room.',
      damage: 4,
    },
  },
  {
    id: 'ranger',
    name: 'Ranger',
    emoji: '🏹',
    tagline: 'Sees what others miss.',
    baseStats: { str: 1, dex: 3, int: 1, cha: 0 },
    baseMaxHp: 12,
    color: '#3f8d5f',
    startingItem: {
      id: 'item-bow',
      name: 'Yew Short Bow',
      description: 'Light, quick, and quiet as a leaf.',
      type: 'weapon',
      effect: '+1 to DEX rolls at range',
      bonus: { dex: 1 },
    },
    combatAbility: {
      id: 'ranger-twin-shot',
      name: 'Twin Shot',
      description: 'Fire a fast pair of arrows into an opening. Deals 4 damage once per room.',
      damage: 4,
    },
  },
  {
    id: 'bard',
    name: 'Bard',
    emoji: '🎵',
    tagline: 'Turns strangers into friends.',
    baseStats: { str: 0, dex: 1, int: 1, cha: 3 },
    baseMaxHp: 11,
    color: '#d4a835',
    startingItem: {
      id: 'item-lute',
      name: 'Travel Lute',
      description: 'Missing one string, but still sings true.',
      type: 'artifact',
      effect: '+1 to CHA rolls with NPCs',
      bonus: { cha: 1 },
    },
    combatAbility: {
      id: 'bard-war-song',
      name: 'War Song',
      description: 'Hit the foe with a thunder-chord and steady the party. Deals 2 damage and heals everyone 1 HP once per room.',
      damage: 2,
      healAll: 1,
    },
  },
];

export function getClass(id: ClassId): ClassDef {
  return CLASSES.find((c) => c.id === id) ?? CLASSES[0];
}

export const PLAYER_COLORS = ['#b03a2e', '#2e4a87', '#3f8d5f', '#d4a835'];
