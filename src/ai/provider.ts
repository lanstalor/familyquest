import type {
  GameState,
  Item,
  Outcome,
  Player,
  Quest,
  Room,
  Scene,
  Settings,
  StoryQuestion,
} from '../types';
import {
  validatePhotoArtifact,
  validateScene,
  validateStoryQuestions,
} from '../schema';
import { mockArtifact, pickMockScene, pickStoryQuestions } from './mockData';
import { selectScene, getScript } from '../game/scripts/index';
import { uid } from '../game/engine';

export interface SceneContext {
  room: Room;
  player: Player;
  state: GameState;
  plotHint?: string;
}

export interface DeviationContext {
  actionText: string;
  scene: Scene;
  room: Room;
  player: Player;
  state: GameState;
}

const SCENE_SYSTEM = `You are the narrator of Family Quest Board, a retro family co-op RPG for kids and adults.
Style: adventurous, vivid, punchy, and easy to read aloud. Keep danger real and exciting without gore.
Fights are nonlethal but physical: clashes, blocks, tackles, disarms, pins, knockdowns, chases, and foes being driven off.
Avoid baby-talk, sparkle overload, or syrupy sweetness unless the story setup clearly asks for it.
Always return a single JSON object matching the schema. NO prose, NO markdown, NO code fences. JSON only.`;

const SCENE_SCHEMA_HINT = `{
  "id": "string",
  "roomId": "string matching the current room id",
  "narration": "2-4 sentences describing the scene",
  "hint": "optional one-line hint for the active player",
  "activity": "optional one-line real-world activity (drawing, craft, quick movement, mini-puzzle, or story prompt) to do at the table before the next scene",
  "activityKind": "optional — one of: craft | draw | move | puzzle | story",
  "choices": [
    {
      "id": "c1" | "c2" | "c3",
      "label": "short action label",
      "stat": "str"|"dex"|"int"|"cha" (optional, only if requiresRoll is true),
      "requiresRoll": boolean,
      "target": number (required if requiresRoll),
      "successText": "what happens on success",
      "failureText": "what happens on failure (hard-fought, never grisly)",
      "rewardGold": number (optional),
      "rewardHp": number (optional),
      "rewardItem": { "id":"...", "name":"...", "description":"...", "type":"weapon|armor|potion|key|artifact|loot" } (optional),
      "rewardStat": "str"|"dex"|"int"|"cha" (optional, permanently increase stat),
      "rewardStatus": { "id":"...", "name":"...", "icon":"...", "turnsRemaining": number, "effect":"..." } (optional, e.g. Inspired),
      "consequenceGold": number (optional),
      "consequenceHp": number (optional, max 3),
      "advancesQuest": boolean (optional)
    }
  ]
}`;

const ARTIFACT_SYSTEM = `You turn a child's drawing or craft into a cozy RPG item for Family Quest Board.
Return JSON only, matching: { "id":"string", "name":"string (max 4 words)", "description":"1-2 warm sentences", "type":"weapon|armor|potion|key|artifact|loot", "effect":"optional short effect" }.
Keep it family friendly, gentle, and whimsical. NO prose, NO code fences.`;

const STORY_SETUP_SYSTEM = `You are creating a collaborative story setup for Family Quest Board.
The players are Ben (6) and Myla (4). An adult acts as the GM and reads the options aloud.
Return JSON only in the form:
{
  "questions": [
    {
      "id": "string",
      "askedTo": "Ben" | "Myla" | "Both",
      "prompt": "a short read-aloud either/or question",
      "options": [
        { "id": "string", "label": "short option", "detail": "one short sentence about how it shapes the story" },
        { "id": "string", "label": "short option", "detail": "one short sentence about how it shapes the story" }
      ]
    }
  ]
}
Create exactly 3 questions. Keep the language concrete, warm, and simple enough for young kids.`;

function buildScenePrompt(ctx: SceneContext, kids: boolean): string {
  const { room, player, state } = ctx;
  const party = state.players
    .map(
      (p) =>
        `${p.name} (${p.classId}, HP ${p.hp}/${p.maxHp}, gold ${p.gold})`
    )
    .join('; ');
  const questLine = state.quest
    ? `Adventure: ${state.quest.name} — ${state.quest.goal}.`
    : '';
  const recentStory = state.logs
    .filter(
      (entry) =>
        entry.kind !== 'roll' &&
        !(entry.kind === 'system' && entry.text.startsWith('Room '))
    )
    .slice(-4)
    .map((entry) => `- ${entry.text}`)
    .join('\n');
  const modeLine = kids
    ? 'Kids Mode: use short sentences, softer outcomes, and easier targets (10-12).'
    : 'Use crisp, evocative prose and moderate targets (10-14).';
  const teamworkLine =
    'Ben and Myla are siblings on the same team. Encourage them to talk out loud, help each other, and feel clever together. At least one choice should feel cooperative or invite the other child to contribute an idea.';
  const combatLine =
    room.type === 'combat' || room.type === 'boss'
      ? 'This is a real fight. Give at least two direct combat or tactical action choices. The foe should feel dangerous. Successes should land hits, blocks, disarms, knockdowns, or force the enemy backward. Failures should mean hard pressure, counter-attacks, or getting knocked around. Do not hand out gold or treasure on each exchange; save rewards for the room aftermath.'
      : '';
  const lengthHint = kids
    ? 'Keep narration under 50 words.'
    : 'Keep narration under 80 words.';
  return [
    `Room: ${room.name} [${room.type}] — ${room.description}`,
    `Suggested stat: ${room.suggestedStat ?? 'any'}. Target: ${room.target}.`,
    `Active player: ${player.name} the ${player.classId}.`,
    `Party: ${party}.`,
    questLine,
    recentStory ? `Recent story beats:\n${recentStory}` : '',
    state.storyAnswers.length
      ? `Story setup chosen by the family:\n${state.storyAnswers
          .map(
            (answer) =>
              `- ${answer.askedTo} chose ${answer.answerLabel}: ${answer.answerDetail ?? answer.answerLabel}`
          )
          .join('\n')}`
      : '',
    teamworkLine,
    combatLine,
    modeLine,
    lengthHint,
    `Return JSON exactly matching this schema:\n${SCENE_SCHEMA_HINT}`,
    `The roomId in the response MUST be "${room.id}".`,
    `Provide 2 or 3 choices. At least one should have requiresRoll=true with a stat and target.`,
    `CRITICAL field names (use EXACTLY these keys on every choice): id, label, requiresRoll, stat, target, successText, failureText. Do NOT rename to "success"/"failure" or nest them.`,
    ctx.plotHint
      ? `CONTINUITY NOTE from the previous room: "${ctx.plotHint}". Weave this in subtly if it fits — don't force it.`
      : '',
    `NEVER output anything except the JSON object.`,
  ].filter(Boolean).join('\n');
}

export async function generateStoryQuestions(
  quest: Quest,
  players: Player[],
  settings: Settings
): Promise<{ questions: StoryQuestion[]; source: 'ai' | 'mock'; note?: string }> {
  if (settings.provider === 'demo' || !settings.apiKey) {
    return { questions: pickStoryQuestions(quest), source: 'mock' };
  }

  const playerNames = players.map((player) => player.name).join(', ');
  const prompt = [
    `Quest: ${quest.name}`,
    `Theme: ${quest.theme}`,
    `Goal: ${quest.goal}`,
    `Players: ${playerNames}`,
    'Ask short read-aloud questions that let the kids shape the story before room one.',
    'Keep the options vivid and different from each other.',
  ].join('\n');

  try {
    const raw = await callProvider(settings, STORY_SETUP_SYSTEM, prompt);
    const json = parseJson(raw);
    const result = validateStoryQuestions(json);
    if (!result.ok) {
      return {
        questions: pickStoryQuestions(quest),
        source: 'mock',
        note: `AI validation failed: ${result.error}`,
      };
    }
    return { questions: result.value, source: 'ai' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      questions: pickStoryQuestions(quest),
      source: 'mock',
      note: `AI call failed: ${msg}`,
    };
  }
}

export async function generateScene(
  ctx: SceneContext,
  settings: Settings
): Promise<{ scene: Scene; source: 'scripted' | 'ai' | 'mock'; note?: string }> {
  const kids = settings.kidsMode;
  const { room, state } = ctx;
  const questId = state.quest?.id ?? '';

  // 1. Try pre-authored scripted scene first (works in any provider mode)
  const scripted = selectScene(questId, room.id, state);
  if (scripted) return { scene: scripted, source: 'scripted' };

  // 2. Demo / no key — use mock or fallback
  if (settings.provider === 'demo' || !settings.apiKey) {
    const scene = pickMockScene(room.id);
    if (scene) return { scene, source: 'mock' };
    return {
      scene: fallbackScene(room.id),
      source: 'mock',
      note: 'No mock scene for room; using generic fallback.',
    };
  }

  // 3. AI generation
  try {
    const raw = await callProvider(settings, SCENE_SYSTEM, buildScenePrompt(ctx, kids));
    console.debug('[fqb] AI raw response:', raw);
    const json = parseJson(raw);
    console.debug('[fqb] AI parsed:', json);
    const result = validateScene(json);
    if (!result.ok) {
      console.warn('[fqb] Scene validation failed:', result.error, json);
      const fallback = pickMockScene(room.id) ?? fallbackScene(room.id);
      return { scene: fallback, source: 'mock', note: `AI validation failed: ${result.error}` };
    }
    const scene = { ...result.value, roomId: room.id };
    return { scene, source: 'ai' };
  } catch (err) {
    const fallback = pickMockScene(room.id) ?? fallbackScene(room.id);
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[fqb] AI call failed:', err);
    return { scene: fallback, source: 'mock', note: `AI call failed: ${msg}` };
  }
}

const DEVIATION_OUTCOME_SCHEMA = `{
  "success": boolean,
  "text": "2-4 vivid sentences describing what happens",
  "advancesRoom": boolean,
  "rewards": ["short reward descriptions, e.g. 'Party earns 2 gold'"],
  "consequences": ["short consequence descriptions, e.g. 'Hero takes 1 damage'"],
  "plotHint": "optional: one sentence note for the next scene to weave in subtly, e.g. 'they left a torch burning at the crossroads'"
}`;

export async function resolveDeviation(
  ctx: DeviationContext,
  settings: Settings
): Promise<{ outcome: Outcome; plotHint?: string }> {
  const { actionText, scene, room, player, state } = ctx;
  const questId = state.quest?.id ?? '';
  const script = getScript(questId);
  const narrativeSpine = script?.narrativeSpine ?? state.quest?.goal ?? '';
  const plotPurpose = scene.plotPurpose ?? script?.plotBeats[room.id] ?? '';
  const nextRoomIdx = (state.quest?.currentRoomIndex ?? 0) + 1;
  const nextRoom = state.quest?.rooms[nextRoomIdx];
  const bypassedChoices = scene.choices.map((c) => c.label).join(', ');
  const party = state.players
    .map((p) => `${p.name} (${p.classId}, HP ${p.hp}/${p.maxHp})`)
    .join('; ');

  const userPrompt = [
    `QUEST ARC: ${narrativeSpine}`,
    `THIS ROOM'S PURPOSE: ${plotPurpose}`,
    nextRoom ? `NEXT ROOM (coming up): ${nextRoom.type} — ${nextRoom.name}` : '',
    ``,
    `The party chose to do something unexpected instead of the scripted options.`,
    `Pre-built options they bypassed: ${bypassedChoices}`,
    ``,
    `PLAYER'S CUSTOM ACTION: "${actionText}"`,
    `ACTIVE HERO: ${player.name} (${player.classId}, HP ${player.hp}/${player.maxHp})`,
    `PARTY: ${party}`,
    ``,
    `Write an outcome. Rules:`,
    `- Honor the player's creative choice — do not punish creativity`,
    `- Weave loosely toward the room's narrative purpose without forcing it`,
    `- Keep danger real but nonlethal`,
    `- If the action is wild but fun, let it work with a twist`,
    `- advancesRoom: true if the action is bold/creative enough to move things forward`,
    `- Return JSON only, no prose, no code fences:`,
    DEVIATION_OUTCOME_SCHEMA,
  ]
    .filter(Boolean)
    .join('\n');

  const fallbackOutcome = (): Outcome => ({
    playerId: player.id,
    playerName: player.name,
    playerColor: player.color,
    choiceLabel: actionText,
    success: true,
    advancesRoom: false,
    text: `${player.name} tries something bold and unexpected. The world takes note.`,
    rewards: [],
    consequences: [],
  });

  if (settings.provider === 'demo' || !settings.apiKey) {
    return { outcome: fallbackOutcome() };
  }

  try {
    const raw = await callProvider(settings, SCENE_SYSTEM, userPrompt);
    const json = parseJson(raw) as Record<string, unknown>;
    const outcome: Outcome = {
      playerId: player.id,
      playerName: player.name,
      playerColor: player.color,
      choiceLabel: actionText,
      success: Boolean(json.success),
      advancesRoom: Boolean(json.advancesRoom),
      text: String(json.text ?? ''),
      rewards: Array.isArray(json.rewards) ? (json.rewards as string[]) : [],
      consequences: Array.isArray(json.consequences) ? (json.consequences as string[]) : [],
    };
    const plotHint = typeof json.plotHint === 'string' ? json.plotHint : undefined;
    return { outcome, plotHint };
  } catch (err) {
    console.warn('[fqb] resolveDeviation failed:', err);
    return { outcome: fallbackOutcome() };
  }
}

export async function generatePhotoArtifact(
  imageDataUrl: string,
  label: string,
  settings: Settings
): Promise<{ item: Item; source: 'ai' | 'mock'; note?: string }> {
  if (settings.provider === 'demo' || !settings.apiKey) {
    return { item: mockArtifact(label), source: 'mock' };
  }
  const userText = `The player's drawing/craft is titled: "${label || 'untitled'}". Describe it as a small magical item for the game. Return JSON only.`;
  try {
    const raw = await callProvider(
      settings,
      ARTIFACT_SYSTEM,
      userText,
      imageDataUrl
    );
    const json = parseJson(raw);
    const res = validatePhotoArtifact(json);
    if (!res.ok) {
      return { item: mockArtifact(label), source: 'mock', note: res.error };
    }
    return { item: { ...res.value, fromPhoto: true }, source: 'ai' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { item: mockArtifact(label), source: 'mock', note: msg };
  }
}

function parseJson(raw: string): unknown {
  let text = raw.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) text = text.slice(first, last + 1);
  return JSON.parse(text);
}

function fallbackScene(roomId: string): Scene {
  return {
    id: `scene-fallback-${Math.random().toString(36).slice(2, 6)}`,
    roomId,
    narration:
      'You step into a tight stone chamber. Something glints in the dark, and you hear boots scrape just ahead.',
    choices: [
      {
        id: 'c1',
        label: 'Rush the shadow first',
        stat: 'str',
        requiresRoll: true,
        target: 11,
        successText: 'You hit first, knock the lurking figure off balance, and a few coins spill loose.',
        failureText: 'The figure ducks low and slams into you shoulder-first before you can grab it.',
        rewardGold: 3,
      },
      {
        id: 'c2',
        label: 'Circle and look for an opening',
        stat: 'dex',
        requiresRoll: true,
        target: 10,
        successText: 'You cut to the side and find a clean line past the guard.',
        failureText: 'You hesitate, and the guard crowds you hard.',
      },
    ],
  };
}

async function callProvider(
  settings: Settings,
  systemPrompt: string,
  userPrompt: string,
  imageDataUrl?: string
): Promise<string> {
  if (!settings.apiKey) throw new Error('API key not set');
  switch (settings.provider) {
    case 'openai':
      return callOpenAI(settings, systemPrompt, userPrompt, imageDataUrl);
    case 'anthropic':
      return callAnthropic(settings, systemPrompt, userPrompt, imageDataUrl);
    case 'gemini':
      return callGemini(settings, systemPrompt, userPrompt, imageDataUrl);
    default:
      throw new Error(`Unsupported provider: ${settings.provider}`);
  }
}

async function callOpenAI(
  settings: Settings,
  system: string,
  user: string,
  image?: string
): Promise<string> {
  const model = settings.model || (image ? 'gpt-4o-mini' : 'gpt-4o-mini');
  const content: Array<Record<string, unknown>> = [{ type: 'text', text: user }];
  if (image) content.push({ type: 'image_url', image_url: { url: image } });
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content },
      ],
      temperature: 0.8,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function callAnthropic(
  settings: Settings,
  system: string,
  user: string,
  image?: string
): Promise<string> {
  const model = (settings.model || 'claude-haiku-4-5-20251001').trim();
  
  let messagesContent: any = user;
  
  if (image) {
    const m = image.match(/^data:(image\/[^;]+);base64,(.*)$/);
    if (m) {
      messagesContent = [
        {
          type: 'image',
          source: { type: 'base64', media_type: m[1], data: m[2] },
        },
        { type: 'text', text: user }
      ];
    }
  }

  const res = await fetch('/api/anthropic', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: settings.apiKey.trim(),
      model,
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: messagesContent }],
    }),
  });
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }
  
  const data = await res.json();
  const text = data.content?.find((block: any) => block.type === "text")?.text ?? "";
  return text;
}

async function callGemini(
  settings: Settings,
  system: string,
  user: string,
  image?: string
): Promise<string> {
  const model = settings.model || 'gemini-1.5-flash';
  const parts: Array<Record<string, unknown>> = [{ text: user }];
  if (image) {
    const m = image.match(/^data:(image\/[^;]+);base64,(.*)$/);
    if (m) {
      parts.push({ inline_data: { mime_type: m[1], data: m[2] } });
    }
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(settings.apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.9,
      },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const out = data.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? '')
    .join('') ?? '';
  return out;
}
