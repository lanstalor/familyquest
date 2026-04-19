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

// Updated prompt optimized for gpt-image-1.5 transparency
const PIXEL_ART_STYLE = "8-bit pixel art sprite, centered, full body, isolated cutout on a transparent background, no shadows, clean sharp edges, retro RPG game asset.";

const PLAYER_ASSETS = [
  { id: 'ben-warrior', prompt: `A 6-year-old boy warrior named Ben, red plate armor, holding a simple sword, hero pose. ${PIXEL_ART_STYLE}` },
  { id: 'myla-warrior', prompt: `A 4-year-old girl warrior named Myla, red plate armor, holding a simple sword, hero pose. ${PIXEL_ART_STYLE}` },
  { id: 'ben-mage', prompt: `A 6-year-old boy mage named Ben, blue wizard robes and hat, holding a wooden staff. ${PIXEL_ART_STYLE}` },
  { id: 'myla-mage', prompt: `A 4-year-old girl mage named Myla, blue wizard robes and hat, holding a wooden staff. ${PIXEL_ART_STYLE}` },
  { id: 'ben-ranger', prompt: `A 6-year-old boy ranger named Ben, green hooded cloak, holding a small bow. ${PIXEL_ART_STYLE}` },
  { id: 'myla-ranger', prompt: `A 4-year-old girl ranger named Myla, green hooded cloak, holding a small bow. ${PIXEL_ART_STYLE}` },
  { id: 'ben-bard', prompt: `A 6-year-old boy bard named Ben, yellow tunic, playing a small lute. ${PIXEL_ART_STYLE}` },
  { id: 'myla-bard', prompt: `A 4-year-old girl bard named Myla, yellow tunic, playing a small lute. ${PIXEL_ART_STYLE}` },
];

const MONSTER_ASSETS = [
  { id: 'goblin', prompt: `A small grumpy green goblin with a wooden club. ${PIXEL_ART_STYLE}` },
  { id: 'dragon-small', prompt: `A tiny cute red teacup dragon. ${PIXEL_ART_STYLE}` },
  { id: 'wolf-alpha', prompt: `A large silver wolf with glowing blue eyes. ${PIXEL_ART_STYLE}` },
  { id: 'thorn-king', prompt: `A king made of dark wood and thorns, briar crown. ${PIXEL_ART_STYLE}` },
  { id: 'spider-wood', prompt: `A silver-marked wood spider with long legs. ${PIXEL_ART_STYLE}` },
  { id: 'willow-guard', prompt: `A tree creature with branch arms and root feet. ${PIXEL_ART_STYLE}` },
];

async function generateImage(asset, subfolder) {
  const filePath = path.join(__dirname, 'public', 'assets', subfolder, `${asset.id}.png`);
  
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
        quality: "high",
        background: "transparent",
        output_format: "png"
      })
    });

    if (!response.ok) throw new Error(`OpenAI error: ${await response.text()}`);

    const data = await response.json();
    const imageUrl = data.data[0].url;
    
    // Fetch the PNG from the URL
    const imgResponse = await fetch(imageUrl);
    const buffer = await imgResponse.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
    console.log(`Saved transparent PNG: ${asset.id}.png`);
    
  } catch (error) {
    console.error(`Failed to generate ${asset.id}:`, error);
  }
}

async function run() {
  for (const asset of PLAYER_ASSETS) await generateImage(asset, 'characters');
  for (const asset of MONSTER_ASSETS) await generateImage(asset, 'monsters');
  console.log("All native transparent assets generated!");
}

run();
