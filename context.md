# Family Quest Board — Context for Codex Handoff

Written 2026-04-18 as a stop-point summary. Pick this up and keep going.

## What this is

Single-page local web app. Physical paper board + tokens on the table; the app is the narrator, rules helper, and state tracker for a cozy co-op RPG (2–4 players, iPad-friendly, kids mode).

**Stack**: Vite + React + TypeScript + Tailwind. localStorage only. No DB, no login.
**Visual theme**: 8-bit retro RPG (Press Start 2P + VT323 fonts, NES/FF1 navy/gold/cream palette, chunky pixel-panel double-border boxes).

## How to run

```bash
cd /home/lans/familyquest
npm install       # already done
npm run dev -- --port 5190 --strictPort --host
# open http://localhost:5190/  (or LAN IP on iPad)
```

A dev server is currently running in the background (task id `bowxokgdd` at the time of writing; may be dead by the time you read this — just relaunch).

`.env` is wired to **Anthropic** with a key copied from `/home/lans/mythic/.env`:

```
VITE_AI_PROVIDER=anthropic
VITE_ANTHROPIC_API_KEY=sk-ant-...   (see /home/lans/mythic/.env for current value)
VITE_AI_MODEL=claude-sonnet-4-6
```

Falls back to demo-mode seeded scenes if no key.

## File layout

```
/home/lans/familyquest/
├── index.html                fonts: Press Start 2P, VT323
├── package.json              react 18, vite 5, tailwind 3
├── tailwind.config.js        8-bit palette (bg, panel, ink, coin, hp, quest.*)
├── postcss.config.js
├── tsconfig*.json
├── vite.config.ts
├── .env                      local, gitignored, real key
├── .env.example              template
└── src/
    ├── main.tsx              React entry
    ├── App.tsx               top-level: setup → playing → completion
    ├── index.css             tailwind layers + pixel-panel, pixel-btn, dialogue-box, HP bar, scanlines
    ├── types.ts              Player, Quest, Room, Scene, Choice, Item, Settings, GameState + NEW unused types (see TODO)
    ├── schema.ts             hand-rolled validator for AI Scene/Item JSON (forgiving field aliases)
    ├── storage.ts            loadSettings/saveSettings/loadState/saveState + env bootstrap merge
    ├── vite-env.d.ts         import.meta.env typings
    ├── game/
    │   ├── classes.ts        warrior/mage/ranger/bard defs + starting items + PLAYER_COLORS
    │   ├── adventures.ts     45-min "Teacup Dragon" (6 rooms), 90-min "Thorned King" (12 rooms)
    │   └── engine.ts         pure functions: createPlayer, rollD20, statBonus, resolveChoice, advanceRoom, healAll
    ├── ai/
    │   ├── provider.ts       openai | anthropic | gemini | demo; JSON-only prompting; falls back to mock on error
    │   └── mockData.ts       seeded scenes per roomId
    └── components/
        ├── Setup.tsx         party builder + adventure picker + kids-mode toggle
        ├── SceneView.tsx     room header, dialogue box, activity tag, choice buttons
        ├── PartyPanel.tsx    big cards with sprite frame, HP bar, stats, items (iPad Pro layout)
        ├── DiceRoller.tsx    d20 tile + success/fail badge
        ├── LogPanel.tsx      collapsible chronicle
        ├── PrintView.tsx     print-only: room tiles, loot cards, monster cards, activity cards
        ├── PhotoArtifact.tsx upload photo → AI forges an item (or mock fallback) → assign to player
        └── SettingsModal.tsx provider/key/model/kids/reset
```

## Game loop (intended)

```
Setup          → build party, pick adventure, kids mode
Prologue       → warm-up: roll call + quest briefing + how-to-play  [NOT YET BUILT]
Playing (per room):
    1. Reveal   → app auto-requests scene for current room
    2. Choose   → active player picks a choice (some require d20 + stat vs target)
    3. Resolve  → scene shows outcome text + rewards/consequences       [BROKEN — see bug]
    4. Advance  → "▶ NEXT SCENE" button bumps currentRoomIndex, revives downed heroes
Epilogue       → celebrate, loot summary, reset CTA                     [NOT YET BUILT]
```

## Combat / rolls

`d20 + statBonus(player, stat) + kidsModeBonus(+1) >= target`. Implemented in `engine.ts:resolveChoice`. Status effects (currently only `status-weakened` = -1) decrement each turn.

## AI integration

- Provider abstraction in `src/ai/provider.ts` (OpenAI, Anthropic with `anthropic-dangerous-direct-browser-access`, Gemini, demo).
- JSON-only prompts. Validator in `schema.ts` is **forgiving** — accepts `success`/`failure` as aliases for `successText`/`failureText`, and `label`/`text`/`name`/`action` for labels.
- On parse/validation failure, falls back to `mockData.ts` and shows a ⚠ note in the scene view. Raw response is logged via `console.debug('[fqb] ...')`.
- For photo artifact mode, sends the image as base64 with a short prompt; returns an Item JSON.

## Data model (key shapes)

```ts
GameState = {
  settings: Settings;
  players: Player[];
  currentPlayerIndex: number;
  quest: Quest | null;          // null means setup screen
  currentScene: Scene | null;
  lastRoll: { playerId, d20, bonus, target, success, stat } | null;
  logs: LogEntry[];             // capped at 200
  turnCount: number;
  // NEW but UNUSED (scaffolding for the fix — see TODO)
  // phase?: GamePhase;
  // outcome?: Outcome | null;
}

Quest = { id, name, length: 45|90, goal, theme, rooms: Room[], currentRoomIndex, completed }
Scene = { id, roomId, narration, hint?, choices: Choice[], activity?, activityKind? }
Choice = { id, label, stat?, requiresRoll, target?, successText, failureText, rewardGold?, rewardItem?, rewardHp?, consequenceHp?, consequenceStatus?, advancesQuest? }
```

Persistence: `saveState` runs on every state change via `useEffect`. localStorage keys `fqb:state:v1`, `fqb:settings:v1`.

## 8-bit theme cheatsheet (in `index.css`)

- `.pixel-panel` — chunky menu window (double border + black offset shadow). Variants: `.parchment`, `.dark`.
- `.pixel-btn` — 3D button; press-inwards on :active. Variants: `.primary` (gold), `.danger` (red), `.success` (green), `.ghost`.
- `.dialogue-box` — classic RPG text window with blinking ▼ indicator.
- `.pixel-bar` — segmented HP bar; set its color via `color:` and width on the child span.
- `.sprite-frame` — 4rem pixel-framed icon box.
- `.tag.kind-{craft|draw|move|puzzle|story}` — color-coded activity tags.
- `.scanlines` — subtle CRT overlay wrapper.

Fonts: `font-display` = Press Start 2P (titles/buttons, keep sizes tiny: 10px–16px), `font-pixel` = VT323 (body, 20px+).

## What's done ✅

- Full scaffolding, build passes clean (`npx tsc -b` and `npm run build`).
- Setup screen (party builder, adventure pick, kids mode) — retro styled.
- Main play layout (scene left 2/3 + log right 1/3 + full-width party roster row below) — iPad Pro friendly.
- AI provider + validator + demo fallback.
- Photo Artifact modal (upload → AI/mock → award).
- Print view (room tiles, loot, monsters, activity cards).
- `.env` bootstrap: merges VITE_* keys into loaded settings when localStorage has no key, so adding `.env` after first run works without clearing storage.
- Validator accepts field-name drift from Claude (`success`/`failure`, `text`/`action`, etc.).
- Renamed `craftPrompt` → `activity` with a typed `activityKind` (craft/draw/move/puzzle/story).

## 🔴 Known bugs / in-flight work

### 1. Room loop bug (USER-REPORTED — TOP PRIORITY)

> "feels like we're in a loop of the archway it stinks"

**Cause**: in `App.tsx`, `chooseChoice` clears `currentScene` to null. The auto-fetch `useEffect` then immediately re-requests a scene for the **same** `currentRoomIndex`, because the room only advances when the user taps "▶ NEXT SCENE". So the user never gets to see their outcome or press the button — a new scene just appears for the same room.

**Fix plan (partially scaffolded, not yet wired)**:

1. Added (but not yet used) types in `src/types.ts`:
   ```ts
   export type GamePhase = 'setup' | 'prologue' | 'playing' | 'epilogue';
   export interface Outcome {
     playerName; playerColor; choiceLabel; success; text;
     rollSummary?; rewards: string[]; consequences: string[];
   }
   ```
2. Add `phase: GamePhase` and `outcome: Outcome | null` to `GameState`.
3. In `engine.ts:resolveChoice`, also return an `Outcome` describing what happened.
4. In `App.tsx:chooseChoice`: **do NOT clear `currentScene`**. Instead, set `state.outcome`. Disable/dim the choice buttons in `SceneView`.
5. In `App.tsx:nextScene`: clear `currentScene` AND `outcome`, advance room. Auto-fetch effect then pulls the next room's scene.
6. Gate the auto-fetch effect on `!currentScene && !outcome && !loadingScene`.
7. In `SceneView.tsx`, when `outcome` prop is set, render a result panel below the narration (success/fail badge, outcome text, rewards list). Keep narration visible above.

**Pseudocode for the gated effect**:
```ts
useEffect(() => {
  if (phase !== 'playing') return;
  if (!quest || quest.completed) return;
  if (currentScene || outcome || loadingScene) return;
  void requestScene();
}, [phase, quest, currentScene, outcome, loadingScene]);
```

### 2. No prologue / warm-up

User: "you need to warm us up to the game and think about the user experience."

Build a `Prologue.tsx` that runs after Setup before the first scene:
- Quest name + tagline + goal in a big dialogue box.
- Party roll call — each hero card appears with their tagline.
- 3-beat how-to-play: "Reveal the room → Pick an action → Tap Next Scene."
- Single "▶ Enter the Valley" button → sets `phase: 'playing'` and triggers the first scene fetch.

Flip `phase` to `'prologue'` at the end of `startGame`.

### 3. No epilogue

When `quest.completed`, show an `Epilogue.tsx` with:
- Final narration (either AI-generated "closing scene" or static per adventure).
- Loot summary: total gold, items gained per hero.
- "Play again" → reset → Setup.

Set `phase: 'epilogue'` when `advanceRoom` flips `completed: true`.

### 4. Still-rough edges

- Combat is implicit (any stat-action can "hit" a monster via stat vs target). A dedicated combat turn with HP on the monster sheet never reduces — monsters are flavor only. Consider fleshing this out if you want real combat: track `room.monster.hp` in state, let a success subtract damage, narrate a monster counter-attack on fail.
- `advancesQuest` on Choice is a no-op right now (engine was simplified so "Next Scene" is the single source of room progress). Either remove the field or re-wire it for branching.
- `LogPanel` collapsible state doesn't persist (it's in component state, fine, but worth noting).
- Anthropic direct-browser calls rely on the `anthropic-dangerous-direct-browser-access: true` header — that's explicitly flagged as "dangerous" by Anthropic because it exposes the key to the user's device. Fine for local single-user iPad play; do not deploy publicly.

## Suggested next steps for the next agent session

1. **Wire the Outcome/Phase fix (the loop bug)** — highest priority, biggest UX win. See "Fix plan" above.
2. **Build Prologue.tsx** — short, punchy, one dialogue-box pass through: quest goal → party → rules → begin.
3. **Build Epilogue.tsx** — a closing dialogue box and a reset button.
4. **Better AI prompt seeding** — pass the last 3 scene outcomes into the `buildScenePrompt` so the narrator has continuity. Right now each scene is generated fresh with no memory.
5. **Room variety** — currently rooms are drawn in fixed order. Consider shuffling non-boss rooms per quest for replay.
6. **Kids Mode ramp** — the +1 is applied. Also consider: shorter narration (enforce 40-word cap in prompt), simpler words, and show a "nice try!" instead of damage on fail for really young kids.
7. **Sound** — a single 8-bit SFX per event (success chime, fail buzz, dice roll) would sell the theme massively.

## Testing quick-checks

```bash
npx tsc -b             # should be silent
npm run build          # should succeed
```

There are no unit tests. The game loop is simple enough that manual play-through is the testing story.

## One-line mental model

> localStorage-backed turn state machine, rendered in 8-bit chrome, driven by AI-narrated scenes that must pass a forgiving JSON validator before hitting the UI, with a graceful demo-mode fallback.

Good luck. The archway loop fix unlocks everything.
