import type { Scene, Choice, Item, Stat, StoryQuestion } from './types';

const STATS: Stat[] = ['str', 'dex', 'int', 'cha'];

export type Validation<T> = { ok: true; value: T } | { ok: false; error: string };

function isString(v: unknown): v is string {
  return typeof v === 'string';
}
function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}
function isBool(v: unknown): v is boolean {
  return typeof v === 'boolean';
}
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function validateItem(v: unknown, path: string): Validation<Item> {
  if (!isObj(v)) return { ok: false, error: `${path} must be object` };
  const { id, name, description, type } = v;
  if (!isString(id) || !isString(name) || !isString(description))
    return { ok: false, error: `${path} missing id/name/description` };
  const validTypes = ['weapon', 'armor', 'potion', 'key', 'artifact', 'loot'];
  if (!isString(type) || !validTypes.includes(type))
    return { ok: false, error: `${path}.type invalid` };
  const item: Item = {
    id,
    name,
    description,
    type: type as Item['type'],
  };
  if (isString(v.effect)) item.effect = v.effect;
  if (isNumber(v.goldValue)) item.goldValue = v.goldValue;
  if (isObj(v.bonus)) {
    const bonus: Partial<Item['bonus']> = {};
    for (const s of STATS) {
      const n = (v.bonus as Record<string, unknown>)[s];
      if (isNumber(n)) (bonus as Record<string, number>)[s] = n;
    }
    item.bonus = bonus as Item['bonus'];
  }
  if (isBool(v.fromPhoto)) item.fromPhoto = v.fromPhoto;
  return { ok: true, value: item };
}

function pickText(v: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const val = v[k];
    if (isString(val) && val.length > 0) return val;
  }
  return undefined;
}

function validateChoice(v: unknown, path: string): Validation<Choice> {
  if (!isObj(v)) return { ok: false, error: `${path} must be object` };
  const id = isString(v.id) ? v.id : `c${Math.random().toString(36).slice(2, 5)}`;
  const label = pickText(v, ['label', 'text', 'name', 'action']);
  if (!label) return { ok: false, error: `${path} missing label` };
  const requiresRoll = isBool(v.requiresRoll)
    ? v.requiresRoll
    : isBool(v.roll)
      ? v.roll
      : (isString(v.stat) && STATS.includes(v.stat as Stat));
  const successText = pickText(v, [
    'successText',
    'success',
    'onSuccess',
    'successNarration',
    'successResult',
  ]);
  const failureText = pickText(v, [
    'failureText',
    'failure',
    'onFailure',
    'failureNarration',
    'failureResult',
    'failText',
    'fail',
  ]);
  if (!successText || !failureText)
    return { ok: false, error: `${path} missing success/failure text` };
  const choice: Choice = { id, label, requiresRoll, successText, failureText };
  if (isString(v.stat) && STATS.includes(v.stat as Stat))
    choice.stat = v.stat as Stat;
  if (isNumber(v.target)) choice.target = v.target;
  if (isNumber(v.rewardGold)) choice.rewardGold = v.rewardGold;
  if (isNumber(v.rewardHp)) choice.rewardHp = v.rewardHp;
  if (isNumber(v.consequenceGold)) choice.consequenceGold = v.consequenceGold;
  if (isNumber(v.consequenceHp)) choice.consequenceHp = v.consequenceHp;
  if (isBool(v.advancesQuest)) choice.advancesQuest = v.advancesQuest;
  if (v.rewardItem !== undefined) {
    const r = validateItem(v.rewardItem, `${path}.rewardItem`);
    if (!r.ok) return r;
    choice.rewardItem = r.value;
  }
  if (isObj(v.consequenceStatus)) {
    const cs = v.consequenceStatus;
    if (
      isString(cs.id) &&
      isString(cs.name) &&
      isString(cs.icon) &&
      isNumber(cs.turnsRemaining) &&
      isString(cs.effect)
    ) {
      choice.consequenceStatus = {
        id: cs.id,
        name: cs.name,
        icon: cs.icon,
        turnsRemaining: cs.turnsRemaining,
        effect: cs.effect,
      };
    }
  }
  if (choice.requiresRoll && choice.target === undefined)
    return { ok: false, error: `${path} requiresRoll=true needs target` };
  return { ok: true, value: choice };
}

export function validateScene(v: unknown): Validation<Scene> {
  if (!isObj(v)) return { ok: false, error: 'scene must be object' };
  const { id, roomId, narration, choices } = v;
  if (!isString(id)) return { ok: false, error: 'scene.id missing' };
  if (!isString(roomId)) return { ok: false, error: 'scene.roomId missing' };
  if (!isString(narration) || narration.length < 10)
    return { ok: false, error: 'scene.narration too short' };
  if (!Array.isArray(choices) || choices.length < 2 || choices.length > 4)
    return { ok: false, error: 'scene.choices must be 2-4' };
  const validChoices: Choice[] = [];
  for (let i = 0; i < choices.length; i++) {
    const c = validateChoice(choices[i], `scene.choices[${i}]`);
    if (!c.ok) return c;
    validChoices.push(c.value);
  }
  const scene: Scene = {
    id,
    roomId,
    narration,
    choices: validChoices,
  };
  if (isString(v.hint)) scene.hint = v.hint;
  if (isString(v.activity)) scene.activity = v.activity;
  else if (isString(v.craftPrompt)) scene.activity = v.craftPrompt;
  const validKinds = ['craft', 'draw', 'move', 'puzzle', 'story'];
  if (isString(v.activityKind) && validKinds.includes(v.activityKind))
    scene.activityKind = v.activityKind as Scene['activityKind'];
  return { ok: true, value: scene };
}

export function validatePhotoArtifact(v: unknown): Validation<Item> {
  return validateItem(v, 'artifact');
}

export function validateStoryQuestions(v: unknown): Validation<StoryQuestion[]> {
  if (!isObj(v)) return { ok: false, error: 'story questions payload must be object' };
  const rawQuestions = v.questions;
  if (!Array.isArray(rawQuestions) || rawQuestions.length < 2 || rawQuestions.length > 4) {
    return { ok: false, error: 'story questions must be 2-4' };
  }

  const questions: StoryQuestion[] = [];
  for (let i = 0; i < rawQuestions.length; i++) {
    const raw = rawQuestions[i];
    if (!isObj(raw)) return { ok: false, error: `story.questions[${i}] must be object` };
    if (!isString(raw.id) || !isString(raw.askedTo) || !isString(raw.prompt)) {
      return { ok: false, error: `story.questions[${i}] missing id/askedTo/prompt` };
    }
    if (!Array.isArray(raw.options) || raw.options.length !== 2) {
      return { ok: false, error: `story.questions[${i}] must have exactly 2 options` };
    }

    const options: StoryQuestion['options'] = [];
    for (let optionIndex = 0; optionIndex < raw.options.length; optionIndex++) {
      const option = raw.options[optionIndex];
      if (!isObj(option) || !isString(option.id) || !isString(option.label)) {
        return {
          ok: false,
          error: `story.questions[${i}].options[${optionIndex}] missing id/label`,
        };
      }
      options.push({
        id: option.id,
        label: option.label,
        detail: isString(option.detail) ? option.detail : undefined,
      });
    }

    questions.push({
      id: raw.id,
      askedTo: raw.askedTo,
      prompt: raw.prompt,
      options,
    });
  }

  return { ok: true, value: questions };
}

export const SCENE_JSON_SCHEMA = {
  type: 'object',
  required: ['id', 'roomId', 'narration', 'choices'],
  properties: {
    id: { type: 'string' },
    roomId: { type: 'string' },
    narration: { type: 'string', minLength: 10 },
    hint: { type: 'string' },
    activity: { type: 'string' },
    activityKind: { enum: ['craft', 'draw', 'move', 'puzzle', 'story'] },
    choices: {
      type: 'array',
      minItems: 2,
      maxItems: 4,
      items: {
        type: 'object',
        required: ['id', 'label', 'requiresRoll', 'successText', 'failureText'],
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          stat: { enum: STATS },
          requiresRoll: { type: 'boolean' },
          target: { type: 'number' },
          successText: { type: 'string' },
          failureText: { type: 'string' },
          rewardGold: { type: 'number' },
          rewardHp: { type: 'number' },
          consequenceGold: { type: 'number' },
          consequenceHp: { type: 'number' },
          advancesQuest: { type: 'boolean' },
          rewardItem: {
            type: 'object',
            required: ['id', 'name', 'description', 'type'],
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              type: {
                enum: ['weapon', 'armor', 'potion', 'key', 'artifact', 'loot'],
              },
              effect: { type: 'string' },
              goldValue: { type: 'number' },
            },
          },
          consequenceStatus: {
            type: 'object',
            required: ['id', 'name', 'icon', 'turnsRemaining', 'effect'],
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              icon: { type: 'string' },
              turnsRemaining: { type: 'number' },
              effect: { type: 'string' },
            },
          },
        },
      },
    },
  },
};

export const ARTIFACT_JSON_SCHEMA = {
  type: 'object',
  required: ['id', 'name', 'description', 'type'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    type: { enum: ['weapon', 'armor', 'potion', 'key', 'artifact', 'loot'] },
    effect: { type: 'string' },
    goldValue: { type: 'number' },
  },
};

export const STORY_QUESTIONS_JSON_SCHEMA = {
  type: 'object',
  required: ['questions'],
  properties: {
    questions: {
      type: 'array',
      minItems: 2,
      maxItems: 4,
      items: {
        type: 'object',
        required: ['id', 'askedTo', 'prompt', 'options'],
        properties: {
          id: { type: 'string' },
          askedTo: { type: 'string' },
          prompt: { type: 'string' },
          options: {
            type: 'array',
            minItems: 2,
            maxItems: 2,
            items: {
              type: 'object',
              required: ['id', 'label'],
              properties: {
                id: { type: 'string' },
                label: { type: 'string' },
                detail: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
};
