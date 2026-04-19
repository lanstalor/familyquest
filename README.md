# Family Quest Board ⚔️🛡️

A retro 8-bit co-op RPG narrator designed for family game night. This app acts as the "Dungeon Master" for a physical board game, handling the story, combat math, and atmosphere.

## 🚀 Current Status (April 2026)
The project is currently in **Phase 2: The Visual Awakening**. We have moved beyond placeholders into a fully realized 8-bit aesthetic with strict co-op mechanics.

### Key Features
- **Authoritative Narrator**: Powered by `claude-haiku-4-5-20251001` via a secure server-side proxy.
- **Hero System**: Custom 8-bit sprites for Ben (6) and Myla (4) across all classes (Warrior, Mage, Ranger, Bard).
- **Pro Asset Library**: Handcrafted and automated slicing for NPCs (Druids, Knights, Merchants) and Monsters (Shadow-Stalkers, Golems, Slimes).
- **Native Transparency**: High-quality items and icons generated using `gpt-image-1.5` with true alpha-channel PNG support.
- **Cinematic Backgrounds**: Full-frame 1024x1024 backgrounds generated via `gpt-image-1.5` with intelligent quest-level fallbacks.
- **Hard Progression**: Rooms must be "Won" (puzzles solved or monsters defeated) before the party can advance. Turn-based rotation handles failed attempts.
- **Dynamic Audio**: Context-aware soundtrack that shifts between cozy tavern tunes and high-stakes boss themes.

## 🛠️ Technical Stack
- **Frontend**: React 18, TypeScript 5, Tailwind CSS 3.
- **Backend**: Vite-based Node.js proxy for secure Anthropic Messages API calls.
- **Art Pipeline**: 
    - `scripts/process-imports.py`: Python (Pillow) for automated quadrant slicing and background normalization.
    - `scripts/generate-scenes.mjs`: Node.js utility for mass-generating room backgrounds using `gpt-image-1.5`.

## 🏃 How to Run
1. Ensure your `.env` has a valid `VITE_ANTHROPIC_API_KEY` and `VITE_OPENAI_API_KEY`.
2. Install dependencies: `npm install`
3. Launch the game: `npm run dev -- --host`
4. Access via `http://localhost:5176` (or your LAN IP on iPad).

---
*Created with love for Ben and Myla.*
