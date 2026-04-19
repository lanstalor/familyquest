import type { Quest, Room, Monster, Item } from '../types';

const monster = (
  id: string,
  name: string,
  description: string,
  hp: number,
  attackBonus: number,
  defense: number,
  xp: number,
  avatarUrl?: string
): Monster => ({ id, name, description, hp, attackBonus, defense, xp, avatarUrl });

const item = (
  id: string,
  name: string,
  description: string,
  type: Item['type'],
  opts: Partial<Item> = {}
): Item => ({ 
  id, 
  name, 
  description, 
  type, 
  imageUrl: `/assets/items/${id}.png`, 
  ...opts 
});

// ── New items from imported assets ────────────────────────────────────────────
const ITEM_POTION = item('item-potion', 'Health Potion', 'A stoppered vial of shimmering red liquid.', 'loot', { goldValue: 8 });
const ITEM_BOOTS = item('item-boots', 'Aero-Boots', 'Boots so light they practically float.', 'artifact', { effect: '+1 DEX per room', bonus: { dex: 1 } });
const ITEM_GAUNTLET = item('item-gauntlet', 'Iron Gauntlet', 'Heavy, dependable, leaves a mark.', 'artifact', { effect: '+1 STR per room', bonus: { str: 1 } });
const ITEM_SPECTACLES = item('item-spectacles', "Sage's Spectacles", 'Thick lenses that show the hidden shapes of things.', 'artifact', { effect: '+1 INT per room', bonus: { int: 1 } });
const ITEM_SUNSTONE = item('item-sunstone', 'Sun-Stone', 'A warm, glowing gem that hums with sunlight.', 'artifact', { effect: '+1 CHA per room', bonus: { cha: 1 } });
const ITEM_WHISTLE = item('item-whistle', 'Silver Whistle', 'Calls for help from the forest friends.', 'artifact', { effect: 'Once per quest: +5 to one roll' });
const ITEM_DRAGON_SHIELD = item('item-dragon-glass-shield', 'Dragon-Glass Shield', 'Translucent and strong as mountain-stone.', 'armor', { effect: 'Ignore 1 damage every turn' });
const ITEM_EMERALD_SEED = item('item-emerald-seed', 'Emerald Heart Seed', 'A seed that pulses with the life of the woods.', 'key');

const ROOMS_SHORT: Room[] = [
  {
    id: 'room-gate',
    name: 'The Mossy Gate',
    type: 'story',
    emoji: '🌿',
    description: 'A stone archway swallowed by green. Birds argue overhead.',
    suggestedStat: 'cha',
    target: 10,
    npcAvatarUrl: '/assets/characters/owl.png',
  },
  {
    id: 'room-puzzle',
    name: 'The Whispering Bridge',
    type: 'puzzle',
    emoji: '🌉',
    description:
      'An old rope bridge with four worn planks. Each plank has a letter carved into it: T, R, U, E.',
    suggestedStat: 'int',
    target: 12,
    npcAvatarUrl: '/assets/characters/squirrel.png',
    backgroundUrl: '/assets/scenes/enchanted-forest.png',
  },
  {
    id: 'room-goblin',
    name: 'Goblin Snare',
    type: 'combat',
    emoji: '👺',
    description: 'A goblin raider blocks the path with a club, a shield, and no intention of letting you pass.',
    suggestedStat: 'str',
    target: 11,
    monster: monster(
      'goblin-1',
      'Grumpy Goblin',
      'Short, mean, and fast enough to be a real problem.',
      6,
      2,
      11,
      3,
      '/assets/characters/goblin.png'
    ),
    possibleLoot: [
      item('loot-coins', 'Pouch of Copper', 'Mostly buttons, but some coins.', 'loot', { goldValue: 4 }),
    ],
  },
  {
    id: 'room-treasure',
    name: 'The Forgotten Chest',
    type: 'treasure',
    emoji: '🎁',
    description: 'Someone left a chest on a velvet cushion. That seems fine.',
    suggestedStat: 'dex',
    target: 10,
    npcAvatarUrl: '/assets/characters/bunny.png',
    possibleLoot: [
      item('loot-ring', 'Humming Ring', 'Hums when danger is near.', 'artifact', {
        effect: '+1 to first DEX roll each turn',
        bonus: { dex: 1 },
      }),
    ],
  },
  {
    id: 'room-boss-short',
    name: 'The Sleepy Dragon',
    type: 'boss',
    emoji: '🐉',
    description:
      'A compact dragon crouches over the key pile, steam curling from its teeth.',
    suggestedStat: 'cha',
    target: 13,
    monster: monster(
      'dragon-small',
      'Teacup Dragon',
      'Fast, proud, and fully ready to throw down.',
      14,
      3,
      13,
      10,
      '/assets/characters/dragon-small.png'
    ),
    possibleLoot: [
      ITEM_DRAGON_SHIELD,
      item('loot-gold-pile', 'Pile of Gold', 'A small, but real, pile of gold.', 'loot', {
        goldValue: 20,
      }),
    ],
  },
];

const ROOM_RATTLED_HOLLOW: Room = {
  id: 'room-rattled-hollow',
  name: 'Rattled Hollow',
  type: 'combat',
  emoji: '💀',
  description: 'Two chattering skeletons emerge from a mossy hollow, their bones rattling with each step.',
  suggestedStat: 'str',
  target: 12,
  monster: monster(
    'rattlebones',
    'Rattlebones',
    'Old bones, old grudges, and a surprising amount of energy.',
    10,
    2,
    11,
    6,
    '/assets/characters/rattlebones1.png'
  ),
  possibleLoot: [ITEM_GAUNTLET, ITEM_BOOTS],
};

const ROOM_STONE_PASS: Room = {
  id: 'room-stone-pass',
  name: 'The Stone Pass',
  type: 'combat',
  emoji: '🏔️',
  description: 'A heavy stone golem steps out from the mountain-side, blocking the narrow ledge.',
  suggestedStat: 'str',
  target: 13,
  monster: monster(
    'stone-golem',
    'Stone Golem',
    'Hard as iron and slow as a mountain, but its hits are heavy.',
    16,
    3,
    14,
    10,
    '/assets/characters/stone-golem.png'
  ),
  possibleLoot: [ITEM_SUNSTONE],
};

const ROOMS_LONG: Room[] = [
  ROOMS_SHORT[0],
  {
    id: 'room-market',
    name: 'Sunmarket Square',
    type: 'story',
    emoji: '🏪',
    description:
      'Stalls of apples, charms, and one very loud fortune-teller.',
    suggestedStat: 'cha',
    target: 10,
    npcAvatarUrl: '/assets/characters/merchant.png',
    possibleLoot: [ITEM_SPECTACLES],
  },
  {
    id: 'room-outpost',
    name: 'The Valley Outpost',
    type: 'combat',
    emoji: '🛡️',
    description: 'A fortified wall blocks the road. The Guard Captain stands firm while a skeleton archer aims from the battlements.',
    suggestedStat: 'cha',
    target: 14,
    npcAvatarUrl: '/assets/characters/guard-captain.png',
    monster: monster(
      'skeleton-archer',
      'Skeleton Archer',
      'Quick, bony, and surprisingly good with a bow.',
      12,
      2,
      12,
      8,
      '/assets/characters/skeleton-archer.png'
    ),
  },
  ROOM_RATTLED_HOLLOW,
  {
    id: 'room-rest1',
    name: 'The Friendly Inn',
    type: 'rest',
    emoji: '🛏️',
    description: 'Warm soup, warm fire, warm welcome. Everyone heals.',
    target: 0,
    npcAvatarUrl: '/assets/characters/npc-bartender.png',
  },
  ROOMS_SHORT[1],
  ROOM_STONE_PASS,
  {
    id: 'room-mushrooms',
    name: 'The Mushroom Choir',
    type: 'puzzle',
    emoji: '🍄',
    description:
      'A ring of mushrooms glows in turn, humming a melody. Repeat the pattern.',
    suggestedStat: 'int',
    target: 12,
    npcAvatarUrl: '/assets/characters/druid.png',
  },
  {
    id: 'room-crystals',
    name: 'The Crystal Cavern',
    type: 'puzzle',
    emoji: '💎',
    description: 'Giant glowing crystals fill the cavern, pulsing with blue and purple light. A puzzle of light and shadow awaits.',
    suggestedStat: 'int',
    target: 14,
    backgroundUrl: '/assets/scenes/crystal-caves.png',
  },
  ROOMS_SHORT[2],
  {
    id: 'room-riddle',
    name: 'The Singing Door',
    type: 'puzzle',
    emoji: '🚪',
    description: 'A carved door sings a riddle and waits for your answer.',
    suggestedStat: 'int',
    target: 13,
    npcAvatarUrl: '/assets/characters/npc-wizard.png',
  },
  {
    id: 'room-rest2',
    name: 'Starlight Clearing',
    type: 'rest',
    emoji: '✨',
    description: 'A clearing so quiet you can hear your own heartbeat. Rest.',
    target: 0,
    npcAvatarUrl: '/assets/characters/fox.png',
  },
  {
    id: 'room-boss-long',
    name: 'The Thorned King',
    type: 'boss',
    emoji: '👑',
    description:
      'A king wrapped in iron-hard briars stands between your party and the last key.',
    suggestedStat: 'str',
    target: 15,
    monster: monster(
      'thorn-king',
      'Thorned King',
      'Ancient, furious, and dangerous even when half-bound.',
      22,
      4,
      14,
      20,
      '/assets/characters/troll.png'
    ),
    possibleLoot: [
      item('loot-crown', 'Crown of Thorns (Calm)', 'Light, no longer sharp.', 'artifact', {
        effect: '+1 to all stats, once per quest',
      }),
      item('loot-final-key', 'Heartwood Key', 'Opens the way home.', 'key'),
    ],
  },
];

const ROOM_SLIME_CROSSING: Room = {
  id: 'room-slime-crossing',
  name: 'Slime Crossing',
  type: 'combat',
  emoji: '💙',
  description: 'A cheerful blue slime bounces in the path, blocking the way with surprising determination.',
  suggestedStat: 'str',
  target: 10,
  monster: monster(
    'blue-slime',
    'Blue Slime',
    'Wobbly, bouncy, and harder to squash than it looks.',
    8,
    1,
    10,
    3,
    '/assets/characters/blue-slime.png'
  ),
  possibleLoot: [ITEM_POTION],
};

const ROOM_SHADOW_WOODS: Room = {
  id: 'room-shadow-woods',
  name: 'Shadow Woods',
  type: 'combat',
  emoji: '🌑',
  description: 'The trees here are made of smoke and silence. A shadow-stalker leaps from the branches.',
  suggestedStat: 'dex',
  target: 13,
  monster: monster(
    'shadow-stalker',
    'Shadow-Stalker',
    'A lean, smoky cat that blends perfectly into the dark.',
    12,
    3,
    12,
    8,
    '/assets/characters/shadow-stalker.png'
  ),
  possibleLoot: [ITEM_WHISTLE],
};

const ROOMS_MEDIUM: Room[] = [
  {
    id: 'room-start',
    name: 'The Trailhead',
    type: 'story',
    emoji: '🥾',
    description: 'A dusty path leads into the deep woods. A sign says: "Whisper if you want to be heard."',
    suggestedStat: 'cha',
    target: 10,
    npcAvatarUrl: '/assets/characters/elder-oak.png',
  },
  ROOM_SLIME_CROSSING,
  {
    id: 'room-riddle-wood',
    name: 'The Owl Tree',
    type: 'puzzle',
    emoji: '🦉',
    description: 'A great white owl asks for a riddle before it lets you pass the hollow trunk.',
    suggestedStat: 'int',
    target: 12,
    npcAvatarUrl: '/assets/characters/owl.png',
  },
  ROOM_SHADOW_WOODS,
  {
    id: 'room-spider',
    name: 'The Webbed Glen',
    type: 'combat',
    emoji: '🕷️',
    description: 'A giant wood-spider drops from the canopy, its eyes like dark glass.',
    suggestedStat: 'dex',
    target: 12,
    monster: monster(
      'spider-wood',
      'Wood Spider',
      'Eight legs, one goal: keeping you wrapped up for later.',
      12,
      2,
      12,
      5,
      '/assets/characters/will-o-wisp.png' // Using wisp for spider for now as wisp is more "woodland"
    ),
  },
  {
    id: 'room-statue',
    name: 'The Laughing Statue',
    type: 'story',
    emoji: '🗿',
    description: 'A stone face that only smiles when it hears a joke.',
    suggestedStat: 'cha',
    target: 11,
    npcAvatarUrl: '/assets/characters/npc-knight.png',
  },
  {
    id: 'room-pond',
    name: 'Mirror Pond',
    type: 'puzzle',
    emoji: '💧',
    description: 'The water shows not your face, but your heart. Walk across without a ripple.',
    suggestedStat: 'dex',
    target: 14,
  },
  {
    id: 'room-rest-woods',
    name: 'Campfire Hollow',
    type: 'rest',
    emoji: '🔥',
    description: 'A safe spot where the woods seem to watch over you. Rest up.',
    target: 0,
    npcAvatarUrl: '/assets/characters/fox.png',
  },
  {
    id: 'room-boss-medium',
    name: 'The Willow Guard',
    type: 'boss',
    emoji: '🌳',
    description: 'An ancient tree that moves like a man, guarding the heart of the woods.',
    suggestedStat: 'str',
    target: 14,
    monster: monster(
      'willow-guard',
      'The Willow Guard',
      'Roots for feet and branches for arms. It is as strong as the earth.',
      18,
      3,
      13,
      15,
      '/assets/characters/ogre.png'
    ),
    possibleLoot: [ITEM_EMERALD_SEED],
  },
];

export const ADVENTURES: Quest[] = [
  {
    id: 'quest-short',
    name: 'The Teacup Dragon',
    length: 45,
    theme: 'a cozy woodland adventure',
    goal: 'Find the Teacup Dragon and ask — politely — for the garden key.',
    briefing: [
      'The garden gate at home has locked itself with a sleepy puff of steam, and only the Teacup Dragon keeps the silver key.',
      'The valley is friendly, but it pays attention. Good manners, brave hearts, and clever choices will open more doors than a sword swing alone.',
      'Travel room by room, listen closely, and help one another. This is a family quest, not a race.',
    ],
    closing: [
      'The Teacup Dragon curls around the key, yawns once more, and decides your party has earned it.',
      'When you return home, the garden gate clicks open as if it had been waiting for your story all along.',
      'The valley settles back to its soft evening hush, but it remembers the heroes who passed through politely.',
    ],
    rooms: ROOMS_SHORT,
    currentRoomIndex: 0,
    completed: false,
  },
  {
    id: 'quest-medium',
    name: 'The Whispering Woods',
    length: 45, // Using 45 for medium as well or maybe we should define a new length?
    theme: 'a mysterious but gentle forest journey',
    goal: 'Reach the heart of the Whispering Woods and wake the sleeping forest spirit.',
    briefing: [
      'The Whispering Woods have gone quiet, and the forest spirit has fallen into a deep sleep.',
      'To wake the spirit, you must travel to the center of the woods and show that you are friends of the forest.',
      'Listen to the trees, be kind to the creatures, and work together to find the way.',
    ],
    closing: [
      'The Willow Guard bows, its branches rustling like laughter, and the forest spirit finally wakes.',
      'The woods are filled with whispers again, but now they are happy songs of thanks.',
      'You leave the woods knowing that you have a new friend in the ancient heart of the valley.',
    ],
    rooms: ROOMS_MEDIUM,
    currentRoomIndex: 0,
    completed: false,
    backgroundUrl: '/assets/scenes/enchanted-forest.png',
  },
  {
    id: 'quest-long',
    name: 'The Thorned King',
    length: 90,
    theme: 'a brave, bright-hearted quest across the valley',
    goal: 'Travel the valley, gather three tokens of trust, and free the Thorned King from his bramble crown.',
    briefing: [
      'Long ago, the Thorned King guarded the valley. Now he is trapped inside his own bramble crown, and the whole land has grown wary and quiet.',
      'To reach him safely, your party must gather tokens of trust from the places and creatures along the road.',
      'This journey asks for patience as much as courage. Every room is part of the story, so slow down and let the world answer back.',
    ],
    closing: [
      'The last thorn falls away, and the king beneath the brambles finally stands in the clear air again.',
      'The valley loosens its grip, paths brighten, and every promise you kept on the road comes back as a blessing.',
      'You return home carrying more than treasure: proof that your family can mend even very old stories together.',
    ],
    rooms: ROOMS_LONG,
    currentRoomIndex: 0,
    completed: false,
  },
];

export function getAdventure(id: string): Quest | null {
  const a = ADVENTURES.find((q) => q.id === id);
  return a ? JSON.parse(JSON.stringify(a)) : null;
}
