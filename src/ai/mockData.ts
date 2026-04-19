import type { Item, Quest, Scene, StatusEffect, StoryQuestion, Stat } from '../types';
import { STATUS_INSPIRED, createStatusEffect } from '../game/statusEffects';

const mk = (
  roomId: string,
  narration: string,
  a: { id: string; label: string; stat?: string; target?: number; success: string; failure: string; gold?: number; hp?: number; loseGold?: number; damage?: number; advance?: boolean; item?: Item; status?: StatusEffect; rewardStat?: Stat },
  b: { id: string; label: string; stat?: string; target?: number; success: string; failure: string; gold?: number; hp?: number; loseGold?: number; damage?: number; advance?: boolean; item?: Item; status?: StatusEffect; rewardStat?: Stat },
  c?: { id: string; label: string; stat?: string; target?: number; success: string; failure: string; gold?: number; hp?: number; loseGold?: number; damage?: number; advance?: boolean; item?: Item; status?: StatusEffect; rewardStat?: Stat },
  activity?: string,
  hint?: string,
  activityKind?: Scene['activityKind']
): Scene => ({
  id: `scene-${roomId}-${Math.random().toString(36).slice(2, 7)}`,
  roomId,
  narration,
  hint,
  activity,
  activityKind,
  choices: [a, b, ...(c ? [c] : [])].map((x) => ({
    id: x.id,
    label: x.label,
    stat: x.stat as Scene['choices'][number]['stat'],
    requiresRoll: !!x.stat,
    target: x.target,
    successText: x.success,
    failureText: x.failure,
    rewardGold: x.gold,
    rewardHp: x.hp,
    rewardStatus: x.status,
    rewardStat: x.rewardStat,
    consequenceGold: x.loseGold,
    consequenceHp: x.damage,
    rewardItem: x.item,
    advancesQuest: x.advance,
  })),
});

export const MOCK_SCENES: Record<string, Scene[]> = {
  'room-gate': [
    mk(
      'room-gate',
      'You step to the Mossy Gate. Two crows tilt their heads and one of them clears its throat, as if preparing to speak.',
      {
        id: 'c1',
        label: 'Greet the crows politely',
        stat: 'cha',
        target: 10,
        success: 'The crow bows back and points a wing at a hidden path ahead.',
        failure: 'The crow squawks and drops an acorn on your head. (1 damage)',
        damage: 1,
        gold: 2,
        advance: true,
      },
      {
        id: 'c2',
        label: 'Slip through quietly',
        stat: 'dex',
        target: 11,
        success: 'You move like a cat. The crows never notice. You slip through.',
        failure: 'A twig snaps. The crows scold you but let you pass anyway.',
        advance: true,
      },
      undefined,
      'Fold a small paper crow to sit on top of a token. Give it a name.',
      undefined,
      'craft'
    ),
  ],
  'room-market': [
    mk(
      'room-market',
      'Sunmarket Square smells like apples and old books. A fortune-teller waves you over.',
      {
        id: 'c1',
        label: 'Buy an apple (1 gold)',
        success: 'Crunchy, sweet, and somehow lucky. +1 HP.',
        failure: 'The apple is fine, but it cost you 1 gold.',
        gold: -1,
        hp: 1,
        advance: true,
      },
      {
        id: 'c2',
        label: 'Hear your fortune',
        stat: 'int',
        target: 10,
        success: 'Her words match what you saw in a dream. You feel ready.',
        failure: 'She says something confusing, but winks kindly.',
        advance: true,
      },
      {
        id: 'c3',
        label: 'Sing for coins',
        stat: 'cha',
        target: 11,
        success: 'A small crowd gathers. You earn 5 gold and a new friend.',
        failure: 'One person claps. Politely.',
        gold: 5,
        advance: true,
      },
      'Draw a small map of Sunmarket Square on an index card.',
      undefined,
      'draw'
    ),
  ],
  'room-rest1': [
    mk(
      'room-rest1',
      'The innkeeper insists you eat before you talk. The stew is good. Everyone feels better.',
      {
        id: 'c1',
        label: 'Rest by the fire',
        success: 'You breathe out the day. +3 HP for the whole party (tracked on your sheet).',
        failure: 'You still rest. You still heal.',
        hp: 3,
        advance: true,
      },
      {
        id: 'c2',
        label: 'Tell a story to the room',
        stat: 'cha',
        target: 10,
        success: 'A stranger tips you 4 gold and gives a secret: the bridge asks for a word.',
        failure: 'Polite applause. Still worth it.',
        gold: 4,
        advance: true,
      }
    ),
  ],
  'room-puzzle': [
    mk(
      'room-puzzle',
      'The Whispering Bridge. Three planks: S, T, R. The wind hums a word. Which plank leads across?',
      {
        id: 'c1',
        label: 'Choose S',
        stat: 'int',
        target: 12,
        success: 'The plank glows. You cross safely.',
        failure: 'The plank fades. You wobble, catch yourself. Try again next turn.',
        damage: 1,
      },
      {
        id: 'c2',
        label: 'Choose T',
        stat: 'int',
        target: 12,
        success: 'TRUE — the plank hums approval. You cross.',
        failure: 'The plank is cold. You wait and think.',
        damage: 0,
        advance: true,
      },
      {
        id: 'c3',
        label: 'Choose R',
        stat: 'int',
        target: 12,
        success: 'The plank sings for a moment, then lifts you gently across.',
        failure: 'Not quite right. You slip but climb back up.',
        damage: 1,
      },
      'Cut three small paper planks and label them S, T, R. Place on the board.',
      'The wind hummed "trrrue"...',
      'puzzle'
    ),
  ],
  'room-mushrooms': [
    mk(
      'room-mushrooms',
      'A ring of glowing mushrooms plays a tune. It looks like a simple order: red, blue, yellow, red.',
      {
        id: 'c1',
        label: 'Match the pattern',
        stat: 'int',
        target: 12,
        success: 'The song finishes with a giggle. A small mushroom gives you a gold coin.',
        failure: 'The mushrooms look disappointed. They play it again, slower.',
        gold: 5,
        advance: true,
      },
      {
        id: 'c2',
        label: 'Sing along',
        stat: 'cha',
        target: 11,
        success: 'The mushrooms love you. One bows and grows into a little umbrella.',
        failure: 'You are off-key. The mushrooms politely cover their ears (they have none).',
        advance: true,
      }
    ),
  ],
  'room-goblin': [
    mk(
      'room-goblin',
      'A goblin raider jumps from behind a log with a club and a scrap-wood shield. It charges before you can step around it.',
      {
        id: 'c1',
        label: 'Hit it head-on',
        stat: 'str',
        target: 11,
        success: 'Your hit slams through its guard and drives it backward through the brush.',
        failure: 'You swing wide, and the goblin cracks you in the side with its club.',
        damage: 2,
      },
      {
        id: 'c2',
        label: 'Flank and trip it',
        stat: 'dex',
        target: 11,
        success: 'You cut around the shield side and sweep its legs out from under it.',
        failure: 'The goblin reads the move and shoulder-checks you away.',
        damage: 2,
      }
    ),
  ],
  'room-wolf': [
    mk(
      'room-wolf',
      'Three silver wolves fan out in a half-circle. Their leader lowers its head and then bursts forward.',
      {
        id: 'c1',
        label: 'Meet the alpha head-on',
        stat: 'str',
        target: 13,
        success: 'You slam into the alpha and force it skidding sideways across the dirt.',
        failure: 'The alpha clips you hard and nearly knocks you off your feet.',
        damage: 3,
      },
      {
        id: 'c2',
        label: 'Wheel a branch like a spear',
        stat: 'dex',
        target: 12,
        success: 'You jab fast and keep the pack back long enough to seize control of the clearing.',
        failure: 'A wolf darts inside your reach and snaps at your arm.',
        damage: 2,
      }
    ),
  ],
  'room-treasure': [
    mk(
      'room-treasure',
      'The Forgotten Chest. It has three locks. Each lock has a riddle scratched next to it.',
      {
        id: 'c1',
        label: 'Pick the locks',
        stat: 'dex',
        target: 12,
        success: 'Each lock clicks open with a small, pleased chime.',
        failure: 'One lock bites you (ouch).',
        damage: 1,
        gold: 10,
        advance: true,
      },
      {
        id: 'c2',
        label: 'Solve the riddles',
        stat: 'int',
        target: 12,
        success: 'You whisper the answers. The chest opens by itself.',
        failure: 'The locks re-lock smugly.',
        advance: false,
      }
    ),
  ],
  'room-riddle': [
    mk(
      'room-riddle',
      'The Singing Door clears its throat: "I am kept by giving away. What am I?"',
      {
        id: 'c1',
        label: 'Answer: a secret',
        stat: 'int',
        target: 13,
        success: 'The door laughs and swings open. Beyond it, starlight.',
        failure: 'The door hums. "Close, traveler. Try again." (no damage)',
      },
      {
        id: 'c2',
        label: 'Answer: a promise',
        stat: 'int',
        target: 13,
        success: 'The door beams. "Walk through, friend." It opens.',
        failure: 'Almost. The door waits kindly.',
        advance: true,
      }
    ),
  ],
  'room-rest2': [
    mk(
      'room-rest2',
      'Starlight Clearing. Quiet. Clean. A small spring bubbles with tea-smelling water.',
      {
        id: 'c1',
        label: 'Drink from the spring',
        success: 'Warm tea-water fills you. +4 HP.',
        failure: 'Still nourishing. +2 HP.',
        hp: 4,
        advance: true,
      },
      {
        id: 'c2',
        label: 'Sleep under the stars',
        success: 'You wake with a clear head and a small gift: 3 gold left on your cloak.',
        failure: 'You wake a little stiff but happy.',
        gold: 3,
        advance: true,
      }
    ),
  ],
  'room-boss-short': [
    mk(
      'room-boss-short',
      'The Teacup Dragon springs up from her hoard with steam pouring from her nostrils. "If you want the key, take it from me," she snaps.',
      {
        id: 'c1',
        label: 'Charge through the steam',
        stat: 'str',
        target: 13,
        success: 'You crash through the steam cloud and hammer the dragon backward off the key pile.',
        failure: 'The dragon whips her tail through your guard and batters you backward.',
        damage: 3,
      },
      {
        id: 'c2',
        label: 'Circle and strike for the claw',
        stat: 'dex',
        target: 13,
        success: 'You slash across her foreclaw and make her drop the key for a second.',
        failure: 'She feints, then shoulder-slams you across the stones.',
        damage: 3,
      }
    ),
  ],
  'room-boss-long': [
    mk(
      'room-boss-long',
      'The Thorned King tears his thorn-blade free and strides down from the roots. "Then come and prove it," he growls.',
      {
        id: 'c1',
        label: 'Hammer the thorn-crown',
        stat: 'str',
        target: 15,
        success: 'Your blow lands square and splits part of the thorn-crown loose from his head.',
        failure: 'He catches your strike and lashes thorn-vines across your guard.',
        damage: 4,
      },
      {
        id: 'c2',
        label: 'Slip inside his reach',
        stat: 'dex',
        target: 15,
        success: 'You cut under the sweeping vines and strike where the crown binds tightest.',
        failure: 'The vines close around you and slam you hard to the ground.',
        damage: 5,
      }
    ),
  ],
  'room-start': [
    mk(
      'room-start',
      'The trailhead is quiet. The sign "Whisper if you want to be heard" seems to hum as you approach.',
      {
        id: 'c1',
        label: 'Whisper a greeting',
        stat: 'cha',
        target: 10,
        success: 'The trees rustle in approval. You feel a gentle breeze guide you.',
        failure: 'You speak too loud. The woods go stiff and silent. (1 damage)',
        damage: 1,
        advance: true,
      },
      {
        id: 'c2',
        label: 'Search for hidden tracks',
        stat: 'dex',
        target: 11,
        success: 'You find soft, glowing pawprints leading deeper into the brush.',
        failure: 'The ground is too thick with leaves. You just have to guess.',
        advance: true,
      }
    ),
  ],
  'room-riddle-wood': [
    mk(
      'room-riddle-wood',
      'The Great Owl tilts its head. "I have no wings, but I can fly. I have no eyes, but I can cry. What am I?"',
      {
        id: 'c1',
        label: 'Answer: A cloud',
        stat: 'int',
        target: 12,
        success: 'The owl hoots softly and steps aside. "Pass, clever ones."',
        failure: '"A cloud has no heart, but it has a path. Try again."',
        advance: true,
      },
      {
        id: 'c2',
        label: 'Answer: A ghost',
        stat: 'int',
        target: 12,
        success: 'The owl blinks. "Not what I meant, but true enough. Go on."',
        failure: '"A ghost is but a memory. I ask for something real."',
      }
    ),
  ],
  'room-spider': [
    mk(
      'room-spider',
      'A wood-spider with silver markings drops from a branch, blocking the narrow path.',
      {
        id: 'c1',
        label: 'Chop through the webs',
        stat: 'str',
        target: 12,
        success: 'You clear a path and force the spider to retreat higher into the canopy.',
        failure: 'The webs are sticky! You get tangled and the spider lunges.',
        damage: 2,
      },
      {
        id: 'c2',
        label: 'Dodge under its legs',
        stat: 'dex',
        target: 12,
        success: 'You slide through the gap before the spider can snap its mandibles.',
        failure: 'You slip on a root, and the spider catches your cloak.',
        damage: 2,
      }
    ),
  ],
  'room-statue': [
    mk(
      'room-statue',
      'The stone face looks very serious. It needs a reason to smile.',
      {
        id: 'c1',
        label: 'Tell a funny story',
        stat: 'cha',
        target: 11,
        success: 'The stone cracks into a grin. A gold coin falls from its mouth.',
        failure: 'The statue looks even more serious. Tough crowd.',
        gold: 3,
        advance: true,
      },
      {
        id: 'c2',
        label: 'Do a silly dance',
        stat: 'dex',
        target: 10,
        success: 'You hear a deep, stony chuckle. The path ahead clears.',
        failure: 'You trip. The statue remains unimpressed.',
        advance: true,
      }
    ),
  ],
  'room-pond': [
    mk(
      'room-pond',
      'The pond is perfectly still. To cross, you must walk on the water without making a single ripple.',
      {
        id: 'c1',
        label: 'Step lightly as a feather',
        stat: 'dex',
        target: 14,
        success: 'You glide across. The water feels like solid glass.',
        failure: 'Splash! You fall in. It’s cold! (2 damage)',
        damage: 2,
        advance: true,
      },
      {
        id: 'c2',
        label: 'Focus your mind',
        stat: 'int',
        target: 13,
        success: 'You believe the water will hold you, and it does.',
        failure: 'Doubt creeps in, and so does the water.',
        damage: 1,
      }
    ),
  ],
  'room-rest-woods': [
    mk(
      'room-rest-woods',
      'The campfire is already lit, and someone left a pile of soft moss to sleep on.',
      {
        id: 'c1',
        label: 'Share a meal',
        success: 'The party eats together. Everyone recovers 4 HP.',
        failure: 'Still a good rest. +2 HP.',
        hp: 4,
        advance: true,
      },
      {
        id: 'c2',
        label: 'Keep watch together',
        stat: 'cha',
        target: 10,
        success: 'You talk through the night. Everyone feels INSPIRED!',
        failure: 'You stay awake but tired.',
        status: createStatusEffect(STATUS_INSPIRED, 1),
        advance: true,
      }
    ),
  ],
  'room-boss-medium': [
    mk(
      'room-boss-medium',
      'The Willow Guard stands tall, its branch-arms ready to sweep you aside.',
      {
        id: 'c1',
        label: 'Climb its trunk',
        stat: 'dex',
        target: 14,
        success: 'You scramble up its back and find the soft knot that controls its movements.',
        failure: 'It shakes you off like a leaf.',
        damage: 3,
      },
      {
        id: 'c2',
        label: 'Brace and push',
        stat: 'str',
        target: 14,
        success: 'You dig your heels in and shove the ancient guard back a full three paces.',
        failure: 'It is like pushing a mountain. You get knocked back instead.',
        damage: 4,
      }
    ),
  ],
};

const STORY_SETUP: Record<string, StoryQuestion[]> = {
  'quest-short': [
    {
      id: 'short-helper',
      askedTo: 'Myla',
      prompt: 'Myla, should the team have a tiny glowing fox helper or a pocket-sized cloud helper?',
      options: [
        { id: 'fox', label: 'Glowing fox', detail: 'It trots ahead and finds safe paths.' },
        { id: 'cloud', label: 'Cloud helper', detail: 'It floats overhead and puffs shapes as clues.' },
      ],
    },
    {
      id: 'short-talent',
      askedTo: 'Ben',
      prompt: 'Ben, what is this team best at when things get tricky: noticing clues or making friends?',
      options: [
        { id: 'clues', label: 'Noticing clues', detail: 'The party spots hidden patterns and secret doors.' },
        { id: 'friends', label: 'Making friends', detail: 'The party can calm creatures and win helpers quickly.' },
      ],
    },
    {
      id: 'short-prize',
      askedTo: 'Both',
      prompt: 'What should matter more at the end: winning the garden key or beating the dragon in a real showdown?',
      options: [
        { id: 'key', label: 'Winning the key', detail: 'The quest should feel like a hard run toward a clear prize.' },
        { id: 'showdown', label: 'Dragon showdown', detail: 'The last room should feel like a real fight before the finish.' },
      ],
    },
  ],
  'quest-medium': [
    {
      id: 'medium-vibe',
      askedTo: 'Myla',
      prompt: 'Myla, should the Whispering Woods be filled with colorful flowers or glowing mushrooms?',
      options: [
        { id: 'flowers', label: 'Colorful flowers', detail: 'The woods are bright and smell like spring.' },
        { id: 'mushrooms', label: 'Glowing mushrooms', detail: 'The woods are dim but filled with magical light.' },
      ],
    },
    {
      id: 'medium-fear',
      askedTo: 'Ben',
      prompt: 'Ben, what is the biggest danger in the woods: getting lost or being caught in giant spider webs?',
      options: [
        { id: 'lost', label: 'Getting lost', detail: 'The paths keep shifting and changing.' },
        { id: 'webs', label: 'Spider webs', detail: 'Sticky webs are everywhere, and things hide in them.' },
      ],
    },
    {
      id: 'medium-wake',
      askedTo: 'Both',
      prompt: 'How should you wake the forest spirit: with a song or by bringing a gift?',
      options: [
        { id: 'song', label: 'A song', detail: 'You must find the right tune to wake the forest.' },
        { id: 'gift', label: 'A gift', detail: 'You must find a special object to show you are friends.' },
      ],
    },
  ],
  'quest-long': [
    {
      id: 'long-guide',
      askedTo: 'Myla',
      prompt: 'Myla, should the valley feel moon-silvery or lantern-golden when the story begins?',
      options: [
        { id: 'moon', label: 'Moon-silvery', detail: 'Soft moonlight makes the path feel calm and magical.' },
        { id: 'lantern', label: 'Lantern-golden', detail: 'Warm lights glow from fences, windows, and safe places.' },
      ],
    },
    {
      id: 'long-strength',
      askedTo: 'Ben',
      prompt: 'Ben, how should the team beat the Thorned King: by hitting hard or by fighting smart?',
      options: [
        { id: 'hard', label: 'Hitting hard', detail: 'The story should reward bold attacks and standing firm.' },
        { id: 'smart', label: 'Fighting smart', detail: 'The story should reward timing, feints, and quick teamwork.' },
      ],
    },
    {
      id: 'long-token',
      askedTo: 'Both',
      prompt: 'What kind of trust-token should matter most in this journey: a song or a shining leaf?',
      options: [
        { id: 'song', label: 'A song', detail: 'Music and kind words should unlock important moments.' },
        { id: 'leaf', label: 'A shining leaf', detail: 'Nature signs and found objects should guide the quest.' },
      ],
    },
  ],
};

export function pickMockScene(roomId: string): Scene | null {
  const list = MOCK_SCENES[roomId];
  if (!list || !list.length) return null;
  const base = list[Math.floor(Math.random() * list.length)];
  return {
    ...base,
    id: `scene-${roomId}-${Math.random().toString(36).slice(2, 8)}`,
  };
}

export function pickStoryQuestions(quest: Quest): StoryQuestion[] {
  const questions = STORY_SETUP[quest.id] ?? STORY_SETUP['quest-short'];
  return questions.map((question) => ({
    ...question,
    options: question.options.map((option) => ({ ...option })),
  }));
}

export function mockArtifact(name: string): Item {
  const descriptors = [
    'Gleams faintly in low light.',
    'Warm to the touch, like it remembers being loved.',
    'A little crooked — in the best way.',
    'Hums when you hold it quietly.',
  ];
  const effects = [
    '+1 to your next CHA roll',
    'Grants +1 gold per quiet room',
    'Once per quest: ignore 1 damage',
    '+1 to your next INT roll',
  ];
  return {
    id: `artifact-${Math.random().toString(36).slice(2, 8)}`,
    name: name || 'Mystery Keepsake',
    description:
      descriptors[Math.floor(Math.random() * descriptors.length)],
    type: 'artifact',
    effect: effects[Math.floor(Math.random() * effects.length)],
    fromPhoto: true,
  };
}
