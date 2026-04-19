import type {
  Choice,
  GameState,
  Item,
  LogEntry,
  MonsterEncounter,
  Outcome,
  Player,
  Quest,
  Scene,
  Stat,
  Stats,
  StatusEffect,
} from '../types';
import { getClass, PLAYER_COLORS } from './classes';
import { calculateEffectiveBonus, calculateMonsterDamage } from './modifiers';

export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function rollD20(): number {
  return 1 + Math.floor(Math.random() * 20);
}

export function statBonus(player: Player, stat: Stat): number {
  const base = player.stats[stat] ?? 0;
  const itemBonus = player.inventory.reduce(
    (sum, i) => sum + (i.bonus?.[stat] ?? 0),
    0
  );
  const statusPenalty = player.statusEffects.some((s) => s.id === 'status-weakened') ? -1 : 0;
  const statusBonus = player.statusEffects.some((s) => s.id === 'status-inspired') ? 1 : 0;
  return base + itemBonus + statusPenalty + statusBonus;
}

export function createPlayer(
  name: string,
  classId: Player['classId'],
  index: number
): Player {
  const cls = getClass(classId);
  const stats: Stats = { ...cls.baseStats };
  const lowerName = name.toLowerCase();
  let avatarUrl: string | undefined;
  
  if (lowerName.includes('ben')) {
    avatarUrl = `/assets/characters/ben-${classId}.png`;
  } else if (lowerName.includes('myla')) {
    avatarUrl = `/assets/characters/myla-${classId}.png`;
  }

  return {
    id: uid('p'),
    name: name.trim() || cls.name,
    classId,
    color: PLAYER_COLORS[index % PLAYER_COLORS.length],
    hp: cls.baseMaxHp,
    maxHp: cls.baseMaxHp,
    gold: 5,
    stats,
    inventory: [{ ...cls.startingItem, id: `${cls.startingItem.id}-${uid('x')}` }],
    statusEffects: [],
    avatarUrl,
  };
}

export function logEntry(
  kind: LogEntry['kind'],
  text: string,
  playerId?: string
): LogEntry {
  return { id: uid('log'), ts: Date.now(), kind, text, playerId };
}

export function currentPlayer(state: GameState): Player | null {
  if (!state.players.length) return null;
  return state.players[state.currentPlayerIndex % state.players.length];
}

export function currentRoom(state: GameState) {
  const q = state.quest;
  if (!q) return null;
  return q.rooms[q.currentRoomIndex] ?? null;
}

export function advanceTurn(state: GameState): GameState {
  const nextIndex = (state.currentPlayerIndex + 1) % Math.max(1, state.players.length);
  const decremented = state.players.map((p) => ({
    ...p,
    statusEffects: p.statusEffects
      .map((s) => ({ ...s, turnsRemaining: s.turnsRemaining - 1 }))
      .filter((s) => s.turnsRemaining > 0),
  }));
  return {
    ...state,
    players: decremented,
    currentPlayerIndex: nextIndex,
    turnCount: state.turnCount + 1,
  };
}

export function advanceRoom(quest: Quest): Quest {
  const nextIndex = quest.currentRoomIndex + 1;
  const completed = nextIndex >= quest.rooms.length;
  return {
    ...quest,
    currentRoomIndex: Math.min(nextIndex, quest.rooms.length - 1),
    completed,
  };
}

export function applyReward(
  player: Player,
  choice: Choice,
  options: { skipHp?: boolean; skipTreasure?: boolean } = {}
): { player: Player; log: LogEntry[] } {
  const log: LogEntry[] = [];
  let p = { ...player };
  if (!options.skipTreasure && choice.rewardGold) {
    if (choice.rewardGold > 0) {
      p = { ...p, gold: p.gold + choice.rewardGold };
      log.push(
        logEntry('reward', `${p.name} found ${choice.rewardGold} gold.`, p.id)
      );
    } else {
      const spent = Math.min(p.gold, Math.abs(choice.rewardGold));
      p = { ...p, gold: Math.max(0, p.gold - spent) };
      if (spent > 0) {
        log.push(logEntry('consequence', `${p.name} spent ${spent} gold.`, p.id));
      }
    }
  }
  if (!options.skipHp && choice.rewardHp) {
    const heal = Math.min(choice.rewardHp, p.maxHp - p.hp);
    p = { ...p, hp: p.hp + heal };
    if (heal > 0)
      log.push(logEntry('reward', `${p.name} recovered ${heal} HP.`, p.id));
  }
  if (!options.skipTreasure && choice.rewardItem) {
    const newItem: Item = { ...choice.rewardItem, id: `${choice.rewardItem.id}-${uid('x')}` };
    p = { ...p, inventory: [...p.inventory, newItem] };
    log.push(
      logEntry('reward', `${p.name} received ${newItem.name}.`, p.id)
    );
  }
  if (choice.rewardStatus) {
    const s: StatusEffect = { ...choice.rewardStatus };
    p = { ...p, statusEffects: [...p.statusEffects, s] };
    log.push(
      logEntry('reward', `${p.name} is ${s.name} (${s.turnsRemaining}t).`, p.id)
    );
  }
  if (choice.rewardStat) {
    const nextVal = (p.stats[choice.rewardStat] ?? 0) + 1;
    p = { ...p, stats: { ...p.stats, [choice.rewardStat]: nextVal } };
    log.push(
      logEntry('reward', `${p.name}'s ${choice.rewardStat.toUpperCase()} increased to ${nextVal}!`, p.id)
    );
  }
  return { player: p, log };
}

export function applyConsequence(
  player: Player,
  choice: Choice
): { player: Player; log: LogEntry[] } {
  const log: LogEntry[] = [];
  let p = { ...player };
  if (choice.consequenceGold) {
    const lost = Math.min(p.gold, choice.consequenceGold);
    p = { ...p, gold: Math.max(0, p.gold - lost) };
    if (lost > 0) {
      log.push(logEntry('consequence', `${p.name} lost ${lost} gold.`, p.id));
    }
  }
  if (choice.consequenceHp) {
    const damage = Math.max(0, choice.consequenceHp);
    p = { ...p, hp: Math.max(0, p.hp - damage) };
    if (damage > 0)
      log.push(
        logEntry('consequence', `${p.name} took ${damage} damage.`, p.id)
      );
  }
  if (choice.consequenceStatus) {
    const s: StatusEffect = { ...choice.consequenceStatus };
    p = { ...p, statusEffects: [...p.statusEffects, s] };
    log.push(
      logEntry('consequence', `${p.name} is ${s.name} (${s.turnsRemaining}t).`, p.id)
    );
  }
  return { player: p, log };
}

export function revivePlayers(players: Player[]): Player[] {
  return players.map((p) => (p.hp <= 0 ? { ...p, hp: 1 } : p));
}

export function healAll(players: Player[], amount: number): Player[] {
  return players.map((p) => ({
    ...p,
    hp: Math.min(p.maxHp, p.hp + amount),
  }));
}

export function canUseAbility(
  state: GameState,
  playerId: string,
  roomId: string
): boolean {
  return state.abilityUsage[playerId] !== roomId;
}

export function ensureEncounter(
  state: GameState,
  quest: Quest | null = state.quest
): MonsterEncounter | null {
  if (!quest) return null;
  const room = quest.rooms[quest.currentRoomIndex] ?? null;
  if (!room?.monster) return null;
  if (
    state.encounter &&
    state.encounter.roomId === room.id &&
    state.encounter.monsterId === room.monster.id
  ) {
    return state.encounter;
  }
  return {
    roomId: room.id,
    monsterId: room.monster.id,
    monsterName: room.monster.name,
    currentHp: room.monster.hp,
    maxHp: room.monster.hp,
  };
}

function combatDamage(
  stat: Stat,
  d20: number,
  total: number,
  target: number
): { damage: number; heal?: number; extraText?: string } {
  let damage = stat === 'str' ? 3 : 2;
  let heal = 0;
  let extraText = '';

  if (d20 === 20) {
    damage += 2;
    heal = 1;
    extraText = 'CRITICAL HIT! +2 damage and +1 party HP!';
  } else if (total >= target + 5) {
    damage += 1;
    extraText = 'Great hit! +1 damage.';
  }

  return { damage, heal, extraText };
}

export interface ResolveOutcome {
  state: GameState;
  outcome: Outcome;
  rolled: boolean;
  d20?: number;
  bonus?: number;
  success: boolean;
  narrative: string;
}

export function resolveClassAbility(state: GameState): ResolveOutcome {
  const player = currentPlayer(state);
  const room = currentRoom(state);
  const encounter = ensureEncounter(state);

  if (!player || !room || !room.monster || !encounter || encounter.currentHp <= 0) {
    const outcome: Outcome = {
      playerId: player?.id ?? '',
      playerName: player?.name ?? 'Nobody',
      playerColor: player?.color ?? '#f0f0e8',
      choiceLabel: 'Class Ability',
      success: false,
      advancesRoom: false,
      text: 'There is no active combat target for that ability.',
      rewards: [],
      consequences: ['No active combat target.'],
    };
    return {
      state,
      outcome,
      rolled: false,
      success: false,
      narrative: outcome.text,
    };
  }

  const ability = getClass(player.classId).combatAbility;
  const isStunned = player.statusEffects.some((s) => s.id === 'status-stunned');

  if (isStunned) {
    const outcome: Outcome = {
      playerId: player.id,
      playerName: player.name,
      playerColor: player.color,
      choiceLabel: ability.name,
      success: false,
      advancesRoom: false,
      text: `${player.name} is stunned and cannot use their special move!`,
      encounter,
      rewards: [],
      consequences: [`${player.name} is stunned!`],
    };
    return {
      state,
      outcome,
      rolled: false,
      success: false,
      narrative: outcome.text,
    };
  }

  if (!canUseAbility(state, player.id, room.id)) {
    const outcome: Outcome = {
      playerId: player.id,
      playerName: player.name,
      playerColor: player.color,
      choiceLabel: ability.name,
      success: false,
      advancesRoom: false,
      text: `${ability.name} has already been used in this room.`,
      encounter,
      rewards: [],
      consequences: [`${ability.name} is already spent for this room.`],
    };
    return {
      state,
      outcome,
      rolled: false,
      success: false,
      narrative: outcome.text,
    };
  }

  let players = [...state.players];
  let nextEncounter: MonsterEncounter = {
    ...encounter,
    currentHp: Math.max(0, encounter.currentHp - (ability.damage ?? 0)),
  };
  const logs: LogEntry[] = [
    logEntry('reward', `${player.name} used ${ability.name}.`, player.id),
  ];

  if (ability.damage) {
    logs.push(
      logEntry(
        'reward',
        `${ability.name} hit ${encounter.monsterName} for ${ability.damage}.`,
        player.id
      )
    );
  }
  if (ability.healAll) {
    players = healAll(players, ability.healAll);
    logs.push(
      logEntry(
        'reward',
        `The whole party recovered up to ${ability.healAll} HP.`,
        player.id
      )
    );
  }
  if (ability.healSelf) {
    players = players.map((entry) =>
      entry.id === player.id
        ? { ...entry, hp: Math.min(entry.maxHp, entry.hp + ability.healSelf!) }
        : entry
    );
    logs.push(
      logEntry(
        'reward',
        `${player.name} recovered ${ability.healSelf} HP.`,
        player.id
      )
    );
  }

  const advancesRoom = nextEncounter.currentHp <= 0;
  const text = advancesRoom
    ? `${ability.name} lands clean. ${encounter.monsterName} goes down and the fight is over.`
    : `${ability.name} lands hard and shifts the fight in your favor.`;

  if (advancesRoom) {
    logs.push(
      logEntry(
        'reward',
        `${encounter.monsterName} is beaten and driven off.`,
        player.id
      )
    );
  }

  const nextIndex = (state.currentPlayerIndex + 1) % Math.max(1, players.length);
  const nextState: GameState = {
    ...state,
    players,
    abilityUsage: {
      ...state.abilityUsage,
      [player.id]: room.id,
    },
    encounter: nextEncounter,
    currentPlayerIndex: nextIndex,
    turnCount: state.turnCount + 1,
    lastRoll: null,
    logs: [...state.logs, ...logs, logEntry('narration', text, player.id)].slice(-200),
  };

  const outcome: Outcome = {
    playerId: player.id,
    playerName: player.name,
    playerColor: player.color,
    choiceLabel: ability.name,
    success: true,
    advancesRoom,
    text,
    encounter: nextEncounter,
    rewards: logs
      .filter((entry) => entry.kind === 'reward')
      .map((entry) => entry.text),
    consequences: [],
  };

  return {
    state: nextState,
    outcome,
    rolled: false,
    success: true,
    narrative: text,
  };
}

export function resolveChoice(
  state: GameState,
  choice: Choice
): ResolveOutcome {
  const player = currentPlayer(state);
  if (!player) {
    const outcome: Outcome = {
      playerId: '',
      playerName: 'Nobody',
      playerColor: '#f0f0e8',
      choiceLabel: choice.label,
      success: false,
      advancesRoom: false,
      text: 'No active player.',
      rewards: [],
      consequences: ['No active player.'],
    };
    return {
      state,
      outcome,
      rolled: false,
      success: false,
      narrative: 'No active player.',
    };
  }

  const room = currentRoom(state);
  let success = true;
  let d20: number | undefined;
  let bonus: number | undefined;
  let stat: Stat | undefined;
  let rolled = false;
  let target = choice.target ?? 10;
  let encounter = ensureEncounter(state);
  const combatActive =
    !!room?.monster &&
    !!encounter &&
    encounter.roomId === room.id &&
    encounter.currentHp > 0;

  if (choice.requiresRoll && choice.stat) {
    rolled = true;
    stat = choice.stat;
    d20 = rollD20();
    bonus = calculateEffectiveBonus(player, stat, state.settings, state.lastRoll?.success);
    success = d20 + bonus >= target;
  }

  const logs: LogEntry[] = [];
  let players = [...state.players];
  const idx = state.currentPlayerIndex;
  let updated = { ...player };

  if (rolled && d20 !== undefined && bonus !== undefined && stat) {
    logs.push(
      logEntry(
        'roll',
        `${player.name} rolled d20=${d20} +${bonus} (${stat.toUpperCase()}) vs ${target} → ${success ? 'success' : 'fail'}`,
        player.id
      )
    );
  }

  if (success) {
    const { player: np, log } = applyReward(updated, choice, {
      skipHp: room?.type === 'rest',
      skipTreasure: combatActive,
    });
    updated = np;
    logs.push(...log);
    if (combatActive && rolled && d20 !== undefined && bonus !== undefined && stat) {
      const currentEncounter = encounter as MonsterEncounter;
      const { damage, heal, extraText } = combatDamage(stat, d20, d20 + bonus, target);
      encounter = {
        ...currentEncounter,
        currentHp: Math.max(0, currentEncounter.currentHp - damage),
      };
      logs.push(
        logEntry(
          'reward',
          `${player.name} hit ${currentEncounter.monsterName} for ${damage}.${extraText ? ` ${extraText}` : ''}`,
          player.id
        )
      );
      if (heal && heal > 0) {
        players = healAll(players, heal);
        updated = players[idx];
        logs.push(logEntry('reward', `Party recovered ${heal} HP from the critical hit!`, player.id));
      }
      if (encounter.currentHp <= 0) {
        logs.push(
          logEntry(
            'reward',
            `${currentEncounter.monsterName} is beaten and driven off.`,
            player.id
          )
        );
      }
    }
    logs.push(logEntry('narration', choice.successText, player.id));
  } else {
    const fallbackCombatDamage =
      combatActive && room?.monster
        ? calculateMonsterDamage(room.monster, state.settings)
        : undefined;
    const failureChoice: Choice =
      fallbackCombatDamage && choice.consequenceHp === undefined
        ? { ...choice, consequenceHp: fallbackCombatDamage }
        : choice;
    const { player: np, log } = applyConsequence(updated, failureChoice);
    updated = np;
    logs.push(...log);
    logs.push(logEntry('narration', choice.failureText, player.id));
  }

  players[idx] = updated;
  if (success && room?.type === 'rest' && choice.rewardHp) {
    players = healAll(players, choice.rewardHp);
    logs.push(
      logEntry(
        'reward',
        `The whole party recovered up to ${choice.rewardHp} HP.`,
        player.id
      )
    );
  }

  // Room advancement is handled by the "Next Scene" button (see App),
  // not here — so we don't skip rooms on choices that set advancesQuest.
  const quest = state.quest;
  const nextIndex = (idx + 1) % players.length;
  const advancesRoom = combatActive
    ? !!encounter && encounter.currentHp <= 0
    : choice.advancesQuest ?? success;

  const nextState: GameState = {
    ...state,
    players,
    encounter:
      combatActive || encounter?.roomId === room?.id
        ? encounter
        : state.encounter,
    quest,
    currentPlayerIndex: nextIndex,
    turnCount: state.turnCount + 1,
    lastRoll:
      rolled && d20 !== undefined && bonus !== undefined && stat
        ? { playerId: player.id, d20, bonus, target, success, stat }
        : null,
    logs: [...state.logs, ...logs].slice(-200),
  };

  const rewardLines = logs
    .filter((entry) => entry.kind === 'reward')
    .map((entry) => entry.text);
  const consequenceLines = logs
    .filter((entry) => entry.kind === 'consequence')
    .map((entry) => entry.text);
  const outcome: Outcome = {
    playerId: player.id,
    playerName: player.name,
    playerColor: player.color,
    choiceLabel: choice.label,
    success,
    advancesRoom,
    text: success ? choice.successText : choice.failureText,
    rollSummary:
      rolled && d20 !== undefined && bonus !== undefined && stat
        ? `d20 ${d20} + ${bonus} ${stat.toUpperCase()} vs ${target}`
        : undefined,
    encounter: encounter ?? undefined,
    rewards: rewardLines,
    consequences: consequenceLines,
  };

  return {
    state: nextState,
    outcome,
    rolled,
    d20,
    bonus,
    success,
    narrative: success ? choice.successText : choice.failureText,
  };
}

export function anyPlayerAlive(state: GameState): boolean {
  return state.players.some((p) => p.hp > 0);
}

export function questProgress(state: GameState): { current: number; total: number } {
  const q = state.quest;
  if (!q) return { current: 0, total: 0 };
  return { current: q.currentRoomIndex + 1, total: q.rooms.length };
}

export function appendLog(state: GameState, entry: LogEntry): GameState {
  return { ...state, logs: [...state.logs, entry].slice(-200) };
}
