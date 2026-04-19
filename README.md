# Family Quest Board

A single-page co-op RPG companion app for families. The physical side is a paper board with printable room tiles and tokens; this app is the narrator, rules helper, and state tracker.

**2–4 players · iPad friendly · no login · no database · localStorage only.**

## Getting started

```bash
npm install
npm run dev
```

Open on the same tablet you play on. Tap the fullscreen icon in the top bar for a distraction-free iPad experience.

## Demo mode vs. AI mode

Without an API key the app runs in **demo mode** using a seeded set of scenes — fully playable. To enable live AI narration, copy `.env.example` to `.env` and fill in **one** provider:

- `VITE_AI_PROVIDER=openai` + `VITE_OPENAI_API_KEY`
- `VITE_AI_PROVIDER=anthropic` + `VITE_ANTHROPIC_API_KEY`
- `VITE_AI_PROVIDER=gemini` + `VITE_GEMINI_API_KEY`

You can also set the provider/key in **Settings** inside the app — it will be saved to localStorage.

All AI responses are returned in a strict JSON schema that is validated client-side. Invalid responses fall back to a seeded scene so play never stalls.

## Playing

1. **Setup** — enter player names, pick classes, choose the 45-minute or 90-minute adventure, toggle Kids Mode if you want softer difficulty and shorter text.
2. **Print** the room tiles and cards (File → Print). Deal them face-down or stack by deck.
3. **Play** — each turn the app draws a room, narrates the scene, and offers 2–3 choices. Some choices require a d20 roll plus a stat bonus vs. a target number.
4. **Photo Artifact** — upload a photo of a drawing or craft your kid made and the app turns it into a one-of-a-kind in-game item.
5. **Craft Prompts** — the app suggests little paper crafts or drawings for kids to make between scenes.

## Tech

Vite + React + TypeScript + Tailwind. All state in `localStorage`. Print stylesheet included.

## File layout

```
src/
  ai/           provider abstraction + mock scenes
  game/         pure engine, classes, adventures
  components/   UI
  types.ts      game types
  schema.ts     AI response validator
  storage.ts    localStorage helpers
```
