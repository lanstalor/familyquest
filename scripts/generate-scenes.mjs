#!/usr/bin/env node
/**
 * Generates scene background images using gpt-image-1.
 * Saves to public/assets/scenes/{roomId}.png
 *
 * Usage:  node scripts/generate-scenes.mjs [roomId...]
 *         node scripts/generate-scenes.mjs            # generates all missing
 *         node scripts/generate-scenes.mjs room-gate  # regenerates one room
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'assets', 'scenes');

// ── Load API key from .env ────────────────────────────────────────────────────
const envPath = path.join(ROOT, '.env');
const envText = fs.readFileSync(envPath, 'utf8');
const keyMatch = envText.match(/VITE_OPENAI_API_KEY=(.+)/);
if (!keyMatch) {
  console.error('❌  VITE_OPENAI_API_KEY not found in .env');
  process.exit(1);
}
const OPENAI_KEY = keyMatch[1].trim();

// ── Style preamble ─────────────────────────────────────────────────────────────
const STYLE = [
  '16-bit pixel art, NES/SNES era colour palette.',
  'Deep navy background (#06070f), warm parchment tones, golden yellow accents, moss greens, brick reds.',
  'Crisp hard pixel edges, dark outlines, zero anti-aliasing, zero gradients.',
  'Family-friendly cozy adventure RPG aesthetic — think early Dragon Quest or Final Fantasy.',
  'Wide cinematic landscape composition, atmospheric lighting, no text, no UI, no characters.',
  'Rich background scene with foreground details, midground interest, and atmospheric depth.',
].join(' ');

// ── Scene definitions ──────────────────────────────────────────────────────────
const SCENES = [
  // ── Teacup Dragon (quest-short) ──
  {
    id: 'room-gate',
    prompt: `${STYLE} Scene: a stone archway completely swallowed by thick ivy and flowering vines, two black crows perched on the mossy keystone looking outward, dappled warm forest light filtering through the canopy behind the arch, fallen leaves on the ground, a narrow path leading through.`,
  },
  {
    id: 'room-puzzle',
    prompt: `${STYLE} Scene: an old rope bridge spanning a deep misty green ravine, the bridge made of frayed ropes and four prominent worn wooden planks each with a letter carved into it (T, R, U, E), morning mist rising from the ravine below, ferns clinging to the stone walls on each side.`,
  },
  {
    id: 'room-goblin',
    prompt: `${STYLE} Scene: a forest path ambush point, mossy logs arranged as crude barricades across the trail, a battered scrap-wood shield propped against a stump, dark gnarled trees either side, disturbed muddy ground with boot prints, tension in the shadows between the trees.`,
  },
  {
    id: 'room-treasure',
    prompt: `${STYLE} Scene: a quiet stone chamber lit by a single shaft of golden light from above, an ornate wooden chest sitting on a faded red velvet cushion at the centre, three heavy brass locks on the chest, dust motes floating in the beam, a small round burrow hole in the corner wall.`,
  },
  {
    id: 'room-boss-short',
    prompt: `${STYLE} Scene: a warm steamy cave interior, orange and amber glow from cracks in the stone floor where heat rises, a small mountain of golden objects (tiny keys, rings, coins, thimbles) piled in the centre, wisps of steam curling upward, cave walls glittering with embedded gems.`,
  },

  // ── Whispering Woods (quest-medium) ──
  {
    id: 'room-start',
    prompt: `${STYLE} Scene: the beginning of a forest trail at twilight, a weathered wooden signpost at a fork in the path with a carved sign reading nothing (blank), tall ancient dark pines either side pressing close, the path ahead lit by a soft mysterious glow from deeper in the forest.`,
  },
  {
    id: 'room-riddle-wood',
    prompt: `${STYLE} Scene: a vast hollow ancient oak tree at night, its opening large enough to walk through, twisted roots erupting from the moonlit ground, a great white owl with wide amber eyes perched inside the hollow watching outward, silver moonlight through the canopy above.`,
  },
  {
    id: 'room-spider',
    prompt: `${STYLE} Scene: a narrow forest glen completely laced with thick silver spider webs strung between dark trunks, the webs catching the dim light and shimmering, multiple layers of webs at different heights creating a dense maze, dark shadows behind the webs, eerie beauty.`,
  },
  {
    id: 'room-statue',
    prompt: `${STYLE} Scene: a mossy forest clearing with a large ancient stone face statue at its centre, the face carved mid-laugh with a wide open grin and closed laughing eyes, a small gold coin balanced on its lower lip, wildflowers growing around its base, afternoon sunlight.`,
  },
  {
    id: 'room-pond',
    prompt: `${STYLE} Scene: a perfectly still forest pond at night, the black water reflecting a sky packed with golden stars and a crescent moon with pixel-perfect clarity, flat mossy stepping stones disappearing into the centre, weeping willow fronds trailing at the edges, total silence implied.`,
  },
  {
    id: 'room-rest-woods',
    prompt: `${STYLE} Scene: a sheltered forest campsite at night, a small crackling fire in a ring of river stones casting warm orange light on the surrounding dark trees, two mossy log seats, a bedroll on one side, a battered kettle on a flat stone beside the fire, fireflies above.`,
  },
  {
    id: 'room-boss-medium',
    prompt: `${STYLE} Scene: the ancient heart of a forest, a vast clearing dominated by an enormous gnarled tree older than memory, its massive roots erupting from the earth in all directions, the bark covered in green-gold bioluminescence, smaller trees bowing away from it, sacred and intimidating.`,
  },

  // ── Thorned King (quest-long) ──
  {
    id: 'room-market',
    prompt: `${STYLE} Scene: a cheerful open-air market square in warm afternoon light, a row of colourful wooden stalls with striped canvas awnings selling apples, charms, and old books, cobblestone ground, a fortune teller's lantern-lit tent in one corner, bunting strung between posts.`,
  },
  {
    id: 'room-rest1',
    prompt: `${STYLE} Scene: a warm inn common room at night, a stone fireplace with a generous fire at the far wall, heavy wooden tables and benches, two steaming bowls of stew, a single candle on the windowsill showing darkness outside, low ceiling beams, everything amber and cosy.`,
  },
  {
    id: 'room-mushrooms',
    prompt: `${STYLE} Scene: a dark forest clearing at night with a perfect ring of large glowing mushrooms, each mushroom a different saturated colour (red, blue, yellow, purple, green), emitting soft pulses of coloured light onto the dark earth, fireflies drifting above the ring, magical atmosphere.`,
  },
  {
    id: 'room-riddle',
    prompt: `${STYLE} Scene: an ancient carved wooden door set into a mossy stone archway at the end of a forest corridor, the door surface covered in intricate carved musical notes and scrollwork, its hinges made of twisted iron roots, light glowing warmly through the crack beneath it, expectant.`,
  },
  {
    id: 'room-rest2',
    prompt: `${STYLE} Scene: a wide open starlit glade, the night sky above absolutely packed with golden pixel stars and a bright crescent moon, the grass covered in small bioluminescent flowers, a tiny natural spring bubbling at one edge, total peace and quiet implied, the air of a safe haven.`,
  },
  {
    id: 'room-boss-long',
    prompt: `${STYLE} Scene: a crumbling ancient throne room seen from the entrance, the stone throne at the far end wrapped tightly in thick dark thorny vines and brambles, a single shaft of pale light breaking through a hole in the vaulted ceiling illuminating the throne, vines covering the floor and walls, dramatic and melancholy.`,
  },
];

// ── Quad scene items (for your reference — generate these manually in ChatGPT)
// Each is a 1:1 square with 4 items, then slice with Gemini.
const QUAD_PROMPTS = [
  {
    outputFiles: ['item-shield.png', 'item-tome.png', 'item-bow.png', 'item-lute.png'],
    prompt: `16-bit pixel art RPG item icons, transparent background, no text, no shadows, clean crisp edges. Single 1:1 square sheet divided into 2×2 grid (4 equal panels separated by a thin dark line):
Top-left: chunky iron heater shield, simple crest, isometric view.
Top-right: thick leather-bound spell tome with golden clasps and a glowing blue rune on the cover.
Bottom-left: carved wooden shortbow with taut string and leaf motif on the grip.
Bottom-right: silver lute with ornate scroll headstock and two ribbons tied to its neck.`,
  },
  {
    outputFiles: ['icon-weakened.png', 'icon-inspired.png', 'icon-stunned.png', 'icon-d20.png'],
    prompt: `16-bit pixel art status icons, each on a dark navy (#06070f) circular badge, bold clear silhouettes, no text. Single 1:1 square sheet divided into 2×2 grid:
Top-left: a cracked red shield — Weakened status.
Top-right: a glowing golden star with radiating lines — Inspired status.
Bottom-left: a cartoon head with three yellow spinning stars circling it — Stunned status.
Bottom-right: a chunky d20 dice face showing the number 20 in gold on a dark face, bold pixel art.`,
  },
  {
    outputFiles: ['room-type-combat.png', 'room-type-puzzle.png', 'room-type-rest.png', 'room-type-treasure.png'],
    prompt: `16-bit pixel art room type banner icons, each a small landscape scene thumbnail, no text. Single 1:1 square sheet divided into 2×2 grid:
Top-left: crossed swords over a fiery background — combat room icon.
Top-right: a glowing gear and key crossed — puzzle room icon.
Bottom-left: a cosy bed with pillow and candle — rest room icon.
Bottom-right: an open treasure chest with gold coins spilling out — treasure room icon.`,
  },
];

// ── Generator ──────────────────────────────────────────────────────────────────
async function generateImage(scene) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-1.5',
      prompt: scene.prompt,
      n: 1,
      size: '1024x1024',
      quality: 'high',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI ${res.status}: ${err}`);
  }

  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (b64) return Buffer.from(b64, 'base64');
  
  const url = data.data?.[0]?.url;
  if (url) {
    const imgRes = await fetch(url);
    const buf = await imgRes.arrayBuffer();
    return Buffer.from(buf);
  }

  throw new Error('No image data or URL in response');
}

async function main() {
  const targets = process.argv.slice(2);
  const scenes = targets.length
    ? SCENES.filter((s) => targets.includes(s.id))
    : SCENES.filter((s) => !fs.existsSync(path.join(OUT_DIR, `${s.id}.png`)));

  if (!scenes.length) {
    console.log('✅  All scene images already exist. Pass room IDs to regenerate specific ones.');
    return;
  }

  console.log(`🎨  Generating ${scenes.length} scene image(s)...\n`);

  for (const scene of scenes) {
    const outPath = path.join(OUT_DIR, `${scene.id}.png`);
    process.stdout.write(`  ${scene.id}... `);
    try {
      const buf = await generateImage(scene);
      fs.writeFileSync(outPath, buf);
      console.log(`✅  saved (${Math.round(buf.length / 1024)}kb)`);
    } catch (err) {
      console.log(`❌  ${err.message}`);
    }
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log('\n📁  Quad prompts for ChatGPT (copy these manually):\n');
  QUAD_PROMPTS.forEach((q, i) => {
    console.log(`--- Quad ${i + 1}: ${q.outputFiles.join(', ')} ---`);
    console.log(q.prompt);
    console.log();
  });

  console.log('Done! Drop sliced quad images into public/assets/items/ and public/assets/icons/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
