export type Stat = 'str' | 'dex' | 'int' | 'cha';
export type ClassId = 'warrior' | 'mage' | 'ranger' | 'bard';
export type RoomType = 'combat' | 'puzzle' | 'treasure' | 'story' | 'boss' | 'rest';
export type ItemType = 'weapon' | 'armor' | 'potion' | 'key' | 'artifact' | 'loot';
export type Provider = 'openai' | 'anthropic' | 'gemini' | 'demo';
export type AdventureLength = 45 | 90;

export interface Stats {
  str: number;
  dex: number;
  int: number;
  cha: number;
}

export interface StatusEffect {
  id: string;
  name: string;
  icon: string;
  turnsRemaining: number;
  effect: string;
}

export interface CombatAbility {
  id: string;
  name: string;
  description: string;
  damage?: number;
  healAll?: number;
  healSelf?: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  effect?: string;
  bonus?: Partial<Stats>;
  goldValue?: number;
  fromPhoto?: boolean;
  imageUrl?: string;
}

export interface Player {
  id: string;
  name: string;
  classId: ClassId;
  color: string;
  hp: number;
  maxHp: number;
  gold: number;
  stats: Stats;
  inventory: Item[];
  statusEffects: StatusEffect[];
  avatarUrl?: string;
}

export interface Monster {
  id: string;
  name: string;
  description: string;
  hp: number;
  attackBonus: number;
  defense: number;
  xp: number;
  avatarUrl?: string;
}

export interface MonsterEncounter {
  roomId: string;
  monsterId: string;
  monsterName: string;
  currentHp: number;
  maxHp: number;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  emoji: string;
  description: string;
  suggestedStat?: Stat;
  target: number;
  monster?: Monster;
  possibleLoot?: Item[];
  npcAvatarUrl?: string;
}

export interface Choice {
  id: string;
  label: string;
  stat?: Stat;
  requiresRoll: boolean;
  target?: number;
  successText: string;
  failureText: string;
  rewardGold?: number;
  rewardItem?: Item;
  rewardHp?: number;
  rewardStatus?: StatusEffect;
  rewardStat?: Stat;
  consequenceGold?: number;
  consequenceHp?: number;
  consequenceStatus?: StatusEffect;
  advancesQuest?: boolean;
}

export interface Scene {
  id: string;
  roomId: string;
  narration: string;
  hint?: string;
  choices: Choice[];
  activity?: string;
  activityKind?: 'craft' | 'draw' | 'move' | 'puzzle' | 'story';
  plotPurpose?: string;
  variantId?: string;
}

export interface Quest {
  id: string;
  name: string;
  length: AdventureLength;
  goal: string;
  theme: string;
  briefing: string[];
  closing: string[];
  rooms: Room[];
  currentRoomIndex: number;
  completed: boolean;
  narrativeSpine?: string;
  plotBeats?: Record<string, string>;
}

export interface LogEntry {
  id: string;
  ts: number;
  kind: 'narration' | 'roll' | 'reward' | 'consequence' | 'system';
  text: string;
  playerId?: string;
}

export type GamePhase = 'setup' | 'prologue' | 'playing' | 'epilogue';

export interface Outcome {
  playerId: string;
  playerName: string;
  playerColor: string;
  choiceLabel: string;
  success: boolean;
  advancesRoom: boolean;
  text: string;
  rollSummary?: string;
  encounter?: MonsterEncounter;
  rewards: string[];
  consequences: string[];
}

export interface StoryQuestionOption {
  id: string;
  label: string;
  detail?: string;
}

export interface StoryQuestion {
  id: string;
  askedTo: string;
  prompt: string;
  options: StoryQuestionOption[];
}

export interface StoryAnswer {
  questionId: string;
  askedTo: string;
  prompt: string;
  answerId: string;
  answerLabel: string;
  answerDetail?: string;
}

export interface Settings {
  provider: Provider;
  apiKey: string;
  model: string;
  kidsMode: boolean;
  fullscreenHint: boolean;
  musicEnabled: boolean;
}

export interface GameState {
  settings: Settings;
  players: Player[];
  startingPlayers: Player[];
  abilityUsage: Record<string, string>;
  currentPlayerIndex: number;
  quest: Quest | null;
  phase: GamePhase;
  storyQuestions: StoryQuestion[];
  storyAnswers: StoryAnswer[];
  encounter: MonsterEncounter | null;
  currentScene: Scene | null;
  outcome: Outcome | null;
  lastRoll: {
    playerId: string;
    d20: number;
    bonus: number;
    target: number;
    success: boolean;
    stat: Stat;
  } | null;
  logs: LogEntry[];
  turnCount: number;
}
