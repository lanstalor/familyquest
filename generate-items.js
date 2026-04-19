import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');
const env = fs.readFileSync(envPath, 'utf8');
const apiKey = env.match(/VITE_OPENAI_API_KEY=(.*)/)?.[1]?.trim();

if (!apiKey) {
  console.error('No OpenAI API key found in .env');
  process.exit(1);
}

// Strict prompt for transparent, single item pixel art
const PIXEL_ITEM_STYLE = "16-bit pixel art icon, centered, single item, isolated on a completely transparent background, no shadows, clean sharp pixel edges, retro RPG inventory item aesthetic.";

const NEW_ASSETS = [
  { id: 'loot-coins', prompt: `A small brown leather pouch spilling shiny copper coins. ${PIXEL_ITEM_STYLE}`, folder: 'items' },
  { id: 'loot-ring', prompt: `A glowing silver ring with a tiny blue gem humming with magic. ${PIXEL_ITEM_STYLE}`, folder: 'items' },
  { id: 'loot-dragon-scale', prompt: `A single large, warm red dragon scale faintly steaming. ${PIXEL_ITEM_STYLE}`, folder: 'items' },
  { id: 'loot-gold-pile', prompt: `A small pile of shiny gold coins. ${PIXEL_ITEM_STYLE}`, folder: 'items' },
  { id: 'loot-pelt', prompt: `A thick, soft silver wolf pelt, slightly glowing. ${PIXEL_ITEM_STYLE}`, folder: 'items' },
  { id: 'loot-crown', prompt: `A crown woven from dark wooden vines and blunt thorns, magically calm. ${PIXEL_ITEM_STYLE}`, folder: 'items' },
  { id: 'loot-final-key', prompt: `An ornate key carved entirely out of living green heartwood. ${PIXEL_ITEM_STYLE}`, folder: 'items' },
  
  // Adding an extra monster just to prove we can do characters properly now
  { id: 'slime', prompt: `A cute, squishy green slime monster, 16-bit pixel art sprite, centered, full body, isolated on a completely transparent background, clean sharp edges, retro RPG game asset.`, folder: 'monsters' }
];

async function generateImage(asset) {
  const filePath = path.join(__dirname, 'public', 'assets', asset.folder, `${asset.id}.png`);
  
  if (fs.existsSync(filePath)) {
    console.log(`Skipping ${asset.id} (already exists)`);
    return;
  }

  console.log(`Generating ${asset.id} using gpt-image-1.5...`);
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-image-1.5",
        prompt: asset.prompt,
        n: 1,
        size: "1024x1024",
        background: "transparent",
        output_format: "png"
      })
    });

    if (!response.ok) throw new Error(`OpenAI error: ${await response.text()}`);

    const data = await response.json();
    const b64Data = data.data[0].b64_json;
    
    if (b64Data) {
      fs.writeFileSync(filePath, Buffer.from(b64Data, 'base64'));
      console.log(`Saved transparent PNG: ${asset.id}.png`);
    } else if (data.data[0].url) {
      const imgResponse = await fetch(data.data[0].url);
      const buffer = await imgResponse.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(`Saved transparent PNG from URL: ${asset.id}.png`);
    }
    
  } catch (error) {
    console.error(`Failed to generate ${asset.id}:`, error);
  }
}

async function run() {
  // Ensure folders exist
  fs.mkdirSync(path.join(__dirname, 'public', 'assets', 'items'), { recursive: true });
  fs.mkdirSync(path.join(__dirname, 'public', 'assets', 'monsters'), { recursive: true });

  for (const asset of NEW_ASSETS) {
    await generateImage(asset);
  }
  console.log("Finished generating all new native transparent assets!");
}

run();
