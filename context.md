# Family Quest Board — Developer Context

*Last updated: 2026-04-19. Pick this up and keep going.*

---

## What this is

Single-page local web app. Physical paper board + tokens on the table; the app is the narrator, rules helper, and state tracker for a cozy co-op RPG (2–4 players, iPad-friendly, kids mode).

**Stack:** Vite 5 + React 18 + TypeScript 5 + Tailwind 3. localStorage only. No DB, no login.
**Visual theme:** 8-bit retro RPG. Press Start 2P + VT323 fonts, NES/FF1 navy/gold/cream palette, chunky pixel-panel double-border boxes.

---

## How to run

```bash
cd /home/lans/familyquest
npm install        # already done
npm run dev -- --port 5190 --strictPort --host
# open http://localhost:5190/ or LAN IP on iPad
```

`.env` is wired to **Anthropic** by default:

```
VITE_AI_PROVIDER=anthropic
VITE_ANTHROPIC_API_KEY=sk-ant-...   # see /home/lans/mythic/.env
VITE_AI_MODEL=claude-sonnet-4-6
VITE_OPENAI_API_KEY=sk-proj-...     # also present, used for image generation script
```

Falls back to pre-authored scripted scenes (no network) if no key. AI is only invoked for free-text deviations.

---

## Game loop

```
Setup      → party builder (names, classes), adventure picker, kids mode toggle
Prologue   → quest briefing + story questions (2 per quest) + how-to-play steps
Playing (per room):
    1. Reveal   → selectScene() picks a pre-authored variant; no AI call needed
    2. Choose   → active player picks a choice (some require d20 + stat vs target)
                  OR types a custom action → resolveDeviation() calls AI
    3. Resolve  → Outcome shown (success/fail badge, text, rewards/consequences)
    4. Advance  → "Next room" button bumps currentRoomIndex, rotates active player
Epilogue   → closing narration, loot summary, "Play again" reset
```

Phase is tracked in `state.phase: GamePhase = 'setup' | 'prologue' | 'playing' | 'epilogue'`.

---

## Scene resolution (priority order)

```
requestScene(room, state)
  │
  ├─ 1. selectScene(questId, roomId, state)   [src/game/scripts/index.ts]
  │       Finds first ScriptedScene variant whose condition(state) → true
  │       Returns instantly. source: 'scripted'
  │
  ├─ 2. pickMockScene(roomId)                 [src/ai/mockData.ts]
  │       Returns a seeded scene. source: 'mock'
  │
  └─ 3. AI generation                         [src/ai/provider.ts]
          Calls OpenAI / Anthropic / Gemini. source: 'ai'
          Validates via schema.ts. Falls back to mock on failure.
```

**plotHint flow:** After a deviation, `resolveDeviation()` returns an optional `plotHint` string. It is stored in `plotHintRef` (a `useRef` in App.tsx), consumed and cleared on the *next* call to `requestScene()`, and injected into the scene prompt as a CONTINUITY NOTE.

---

## Pre-authored scripts

`src/game/scripts/` holds full scene scripts for all three quests. Each room has 2–3 `ScriptedScene` variants with a `condition` predicate:

```ts
interface ScriptedScene extends Scene {
  variantId: string;
  condition: (state: GameState) => boolean;
}

interface AdventureScript {
  questId: string;
  narrativeSpine: string;
  plotBeats: Record<string, string>;
  scenes: Record<string, ScriptedScene[]>;  // roomId → variants in priority order
}
```

Common condition patterns:
```ts
(s) => s.players.some(p => p.classId === 'warrior')
(s) => s.storyAnswers.find(a => a.questionId === 'short-helper')?.answerId === 'fox'
(s) => s.players.every(p => p.hp / p.maxHp < 0.5)
(s) => !!s.outcome?.success          // last action was a success
() => true                           // catch-all default (always last)
```

---

## Data model (key shapes)

```ts
GameState = {
  settings: Settings;
  players: Player[];
  startingPlayers: Player[];       // snapshot for epilogue comparison
  currentPlayerIndex: number;
  quest: Quest | null;
  phase: GamePhase;
  storyQuestions: StoryQuestion[];
  storyAnswers: StoryAnswer[];
  encounter: MonsterEncounter | null;
  currentScene: Scene | null;
  outcome: Outcome | null;
  abilityUsage: Record<string, string>;  // playerId → roomId of last ability use
  lastRoll: { playerId, d20, bonus, target, success, stat } | null;
  logs: LogEntry[];               // capped at 200
  turnCount: number;
}

Quest    = { id, name, length: 45|90, goal, theme, briefing[], closing[], rooms: Room[], currentRoomIndex, completed, narrativeSpine?, plotBeats? }
Room     = { id, name, type: RoomType, emoji, description, suggestedStat?, target, monster?, possibleLoot?, npcAvatarUrl? }
Scene    = { id, roomId, narration, hint?, choices: Choice[], activity?, activityKind?, plotPurpose?, variantId? }
Choice   = { id, label, stat?, requiresRoll, target?, successText, failureText, reward*, consequence*, advancesQuest? }
Outcome  = { playerId, playerName, playerColor, choiceLabel, success, advancesRoom, text, rollSummary?, encounter?, rewards[], consequences[] }
```

Persistence: `saveState` on every state change via `useEffect`. Keys: `fqb:state:v1`, `fqb:settings:v1`.

---

## Combat

Monster HP tracked in `state.encounter: MonsterEncounter`. On each successful hit, damage is subtracted. When `encounter.currentHp <= 0` the monster is defeated and the encounter clears. Failed roll = monster hits back (consequenceHp loss on the active player).

Each class has a `combatAbility` (one use per room, tracked in `abilityUsage`):
- Warrior: Battle Cry — boost STR
- Mage: Arcane Bolt — extra damage
- Ranger: Eagle Eye — reroll
- Bard: Inspire — +2 to next ally's roll

---

## AI integration

- Provider abstraction in `src/ai/provider.ts` (OpenAI, Anthropic with `anthropic-dangerous-direct-browser-access`, Gemini, demo).
- JSON-only prompts with strict schema. Validator in `schema.ts` is **forgiving** — accepts field name aliases (`success`/`failure`, `label`/`text`/`action`).
- `resolveDeviation(ctx, settings)` — generates Outcome for free-text player actions. Includes narrativeSpine, plotPurpose, bypassed choice labels, party state. Returns `{ outcome, plotHint? }`. Falls back to generic outcome if provider is demo or API fails.
- Photo artifact mode: sends image as base64 with a short prompt → returns an `Item` JSON.
- All raw AI responses logged via `console.debug('[fqb] ...')`.

---

## Assets

```
public/assets/
  characters/   player sprites, NPC sprites, monster sprites (PNG, some transparent)
  items/        item icons (transparent PNG, ~500×500)
  scenes/       1024×1024 pixel art room backgrounds (all 18 rooms generated)
  music/        MP3 tracks (4 tracks)
  import/       staging area — drop new quad images here, run process-imports.py
```

Scene images generated by `scripts/generate-scenes.mjs` using gpt-image-1.
New quad sheets processed by `scripts/process-imports.py` (PIL — slices 2×2 grid, removes white bg from JPEGs).

---

## 8-bit theme cheatsheet

- `.pixel-panel` — chunky menu window (double border + black offset shadow). Variants: `.parchment`, `.dark`
- `.pixel-btn` — 3D button; press-inwards on :active. Variants: `.primary` (gold), `.danger` (red), `.success` (green), `.ghost`
- `.dialogue-box` — classic RPG text window with blinking ▼ indicator
- `.pixel-bar` — segmented HP bar; set `color:` and child `span` width
- `.sprite-frame` — 4rem pixel-framed icon box
- `.tag.kind-{craft|draw|move|puzzle|story}` — color-coded activity tags
- `.scanlines` — subtle CRT overlay wrapper

Fonts: `font-display` = Press Start 2P (keep ≤16px), `font-pixel` = VT323 (body, 20px+).

Palette key: `bg-900` (navy), `ink` (cream), `coin` (gold), `hp` (red), `quest-green`.

---

## Known gaps / next steps

- **No unit tests.** Manual play-through is the primary verification path.
- **`advancesQuest` on Choice** is currently a no-op. `advanceRoom()` is always triggered by the "Next room" button, not by choices. Either remove the field or wire it for branching rooms.
- **Anthropic direct-browser calls** expose the API key to the user's device. Fine for local single-device play; do not deploy publicly.
- **Scene variants for new rooms** (Slime Crossing, Rattled Hollow) have no scripted scenes yet — they fall back to AI/mock.
- **Audio autoplay** may be blocked by the browser on first load (known UX issue).
- **Avatar images** for some class/player combos may 404 if the filename convention doesn't match.

---

## Current System Rules
- **Strict Progression**: Puzzles and Combat rooms MUST be solved/defeated to advance. Failure rotates the turn to the next hero to try again.
- **Visuals**: Full 1024x1024 background support via `backgroundUrl`. Layout uses a "Cinematic Letterbox" format (max 60vh) to ensure zero cropping of artwork.
- **Narrator**: Native transparent `gpt-image-1.5` assets for items and monsters.
- **Puzzle Logic**: The Whispering Bridge uses **T, R, U, E** as the correct path (Word: TRUE).

## Asset Conventions
- **Characters**: Sliced from quadrants into `public/assets/characters/`.
- **Items**: Generated via `gpt-image-1.5` with native alpha transparency into `public/assets/items/`.
- **Scenes**: Backgrounds stored in `public/assets/scenes/`. Fallback chain: Room `backgroundUrl` -> Quest `backgroundUrl` -> `roomId.png`.
