import type { GameState, Scene } from '../../types';
import { uid } from '../engine';
import type { AdventureScript, ScriptedScene } from './teacup-dragon';

function scene(
  roomId: string,
  variantId: string,
  condition: (state: GameState) => boolean,
  narration: string,
  choices: Scene['choices'],
  opts: { hint?: string; activity?: string; activityKind?: Scene['activityKind']; plotPurpose?: string } = {}
): ScriptedScene {
  return {
    id: uid(`scene-${roomId}`),
    roomId,
    variantId,
    condition,
    narration,
    choices,
    ...opts,
  };
}

const hasClass = (cls: string) => (s: GameState) =>
  s.players.some((p) => p.classId === cls);
const hasAnswer = (qId: string, aId: string) => (s: GameState) =>
  s.storyAnswers.some((a) => a.questionId === qId && a.answerId === aId);
const allLowHp = (s: GameState) =>
  s.players.length > 0 && s.players.every((p) => p.hp / p.maxHp < 0.5);
const always = () => true;
const hasMageOrBard = (s: GameState) =>
  s.players.some((p) => p.classId === 'mage' || p.classId === 'bard');

export const WHISPERING_WOODS: AdventureScript = {
  questId: 'quest-medium',
  narrativeSpine:
    'A quiet forest journey to wake the sleeping spirit of the Whispering Woods. The woods reward those who listen carefully, treat its creatures kindly, and work together — the spirit will only wake for friends.',
  plotBeats: {
    'room-start':
      'The party learns the woods demands respect — whisper first, and the forest will whisper back.',
    'room-riddle-wood':
      'The Great Owl tests the party\'s wisdom before letting them deeper in.',
    'room-spider':
      'A real danger blocks the path — cleverness and speed matter more than strength here.',
    'room-statue':
      'Joy unlocks what force cannot — the party must make the stone smile.',
    'room-pond':
      'The Mirror Pond tests inner calm; doubt makes the crossing fail.',
    'room-rest-woods':
      'The campfire offers rest and a chance to bond before the final challenge.',
    'room-boss-medium':
      'The Willow Guard tests whether the party is truly a friend of the forest.',
  },
  scenes: {
    // ── Room 1: The Trailhead ─────────────────────────────────────────────
    'room-start': [
      // Variant: mushroom vibe chosen
      scene(
        'room-start',
        'mushroom-vibe',
        hasAnswer('medium-vibe', 'mushrooms'),
        'The trailhead glows with clusters of soft blue mushrooms lining the path. The sign says "Whisper if you want to be heard" — and as you read it, a mushroom nearby blinks.',
        [
          {
            id: 'c1',
            label: 'Whisper hello to the mushroom',
            requiresRoll: false,
            successText:
              'The mushroom blinks twice and then hums a gentle three-note melody. The path ahead brightens just a little.',
            failureText: '',
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Search for glowing pawprints',
            stat: 'dex',
            requiresRoll: true,
            target: 11,
            successText:
              'You find soft, luminous prints in the moss leading deeper into the blue-lit forest.',
            failureText:
              'The mushrooms are too bright — it is hard to see any tracks. You head in anyway.',
            advancesQuest: true,
          },
        ],
        {
          activity:
            'Draw a mushroom map: where would mushrooms glow brightest in this forest? Mark three spots.',
          activityKind: 'draw',
          plotPurpose:
            'The party learns the woods demands respect — whisper first, and the forest will whisper back.',
        }
      ),

      // Variant: default (flower vibe or no choice)
      scene(
        'room-start',
        'default',
        always,
        'A dusty path leads into the deep woods. The sign reads: "Whisper if you want to be heard." Something in the trees rustles, as if the forest is already listening.',
        [
          {
            id: 'c1',
            label: 'Whisper a greeting to the woods',
            stat: 'cha',
            requiresRoll: true,
            target: 10,
            successText:
              'The trees rustle in approval. A gentle breeze guides you forward and the path seems to lean in.',
            failureText:
              'You speak too loud. The woods go stiff and silent for a moment.',
            consequenceHp: 1,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Follow hidden tracks into the brush',
            stat: 'dex',
            requiresRoll: true,
            target: 11,
            successText:
              'You find soft glowing pawprints leading deeper into the forest. Someone friendly was here recently.',
            failureText:
              'The ground is too thick with leaves. You head in by feel.',
            advancesQuest: true,
          },
        ],
        {
          plotPurpose:
            'The party learns the woods demands respect — whisper first, and the forest will whisper back.',
        }
      ),
    ],

    // ── Room 2: The Owl Tree ───────────────────────────────────────────────
    'room-riddle-wood': [
      // Variant: mage or bard in party
      scene(
        'room-riddle-wood',
        'magic-party',
        hasMageOrBard,
        'The Great Owl opens one amber eye as your party approaches. It sees your mage or bard and blinks slowly — the forest equivalent of a respectful nod. "You may know this already," it says. "But I still ask."',
        [
          {
            id: 'c1',
            label: 'Answer the riddle with magic insight',
            stat: 'int',
            requiresRoll: true,
            target: 10,
            successText:
              'The answer comes easily — the owl expected nothing less. "Pass, clever ones," it says, and steps aside with a flourish of its wing.',
            failureText:
              '"Close," the owl says gently. "But a cloud has a path. Think again."',
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Play or sing the answer rather than say it',
            stat: 'cha',
            requiresRoll: true,
            target: 11,
            successText:
              'The owl leans forward, delighted. No one has ever answered it in song before. It steps aside immediately.',
            failureText:
              'The owl tilts its head — it does not quite understand the melody. It waits for words.',
            advancesQuest: true,
          },
        ],
        {
          hint: 'The riddle: "I have no wings but I can fly. I have no eyes but I can cry. What am I?"',
          plotPurpose:
            'The Great Owl tests the party\'s wisdom before letting them deeper in.',
        }
      ),

      // Variant: default
      scene(
        'room-riddle-wood',
        'default',
        always,
        'The Great Owl tilts its enormous head. "I have no wings," it begins, "but I can fly. I have no eyes, but I can cry. What am I?"',
        [
          {
            id: 'c1',
            label: 'Answer: a cloud',
            stat: 'int',
            requiresRoll: true,
            target: 12,
            successText:
              'The owl hoots softly and steps aside. "Pass, clever ones."',
            failureText:
              '"A cloud has no heart, but it has a path. Try again."',
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Answer: the wind',
            stat: 'int',
            requiresRoll: true,
            target: 11,
            successText:
              'The owl blinks — surprised. "That is not what I meant, but it is just as true. Go on."',
            failureText:
              '"The wind is a cousin. I am the one who wanders farther."',
            advancesQuest: true,
          },
        ],
        {
          hint: 'Think about things in the sky that move but have no body.',
          plotPurpose:
            'The Great Owl tests the party\'s wisdom before letting them deeper in.',
        }
      ),
    ],

    // ── Room 3: The Webbed Glen ────────────────────────────────────────────
    'room-spider': [
      // Variant: "webs" fear was chosen — extra sticky, more dramatic
      scene(
        'room-spider',
        'web-fear',
        hasAnswer('medium-fear', 'webs'),
        'You expected the webs — but not this many. The entire glen is wrapped in silver strands from tree to tree. In the centre, a giant wood-spider with silver markings watches you approach, completely still.',
        [
          {
            id: 'c1',
            label: 'Dodge under its legs before it reacts',
            stat: 'dex',
            requiresRoll: true,
            target: 12,
            successText:
              'You slide through the gap before the spider can snap its mandibles. The webs brush your cloak but do not hold.',
            failureText:
              'A web catches your arm and the spider lunges. You tear free but take a hit.',
            consequenceHp: 2,
          },
          {
            id: 'c2',
            label: 'Chop a clear path through the webs',
            stat: 'str',
            requiresRoll: true,
            target: 12,
            successText:
              'You slash fast and wide — faster than the spider can patch the gaps — and force it up into the canopy.',
            failureText:
              'The webs are thick. You get tangled and the spider moves in.',
            consequenceHp: 2,
          },
          {
            id: 'c3',
            label: 'Stay still and let it come close, then dart',
            stat: 'int',
            requiresRoll: true,
            target: 11,
            successText:
              'You wait until the spider is almost on you — then dart sideways. It overshoots badly.',
            failureText:
              'The spider is patient too. It waits longer than you do.',
            consequenceHp: 2,
          },
        ],
        {
          plotPurpose:
            'A real danger blocks the path — cleverness and speed matter more than strength here.',
        }
      ),

      // Variant: default
      scene(
        'room-spider',
        'default',
        always,
        'A giant wood-spider with silver markings drops from a branch, blocking the narrow path. Its eight eyes fix on your party and it takes one slow step forward.',
        [
          {
            id: 'c1',
            label: 'Chop through the webs',
            stat: 'str',
            requiresRoll: true,
            target: 12,
            successText:
              'You clear a path and force the spider to retreat higher into the canopy.',
            failureText:
              'The webs are sticky and the spider lunges.',
            consequenceHp: 2,
          },
          {
            id: 'c2',
            label: 'Dodge under its legs',
            stat: 'dex',
            requiresRoll: true,
            target: 12,
            successText:
              'You slide through the gap before the spider can snap its mandibles.',
            failureText:
              'You slip on a root and the spider catches your cloak.',
            consequenceHp: 2,
          },
        ],
        {
          plotPurpose:
            'A real danger blocks the path — cleverness and speed matter more than strength here.',
        }
      ),
    ],

    // ── Room 4: The Laughing Statue ────────────────────────────────────────
    'room-statue': [
      // Variant: "friends" talent chosen (party is good at making friends)
      scene(
        'room-statue',
        'friend-talent',
        hasAnswer('medium-fear', 'lost'),
        'The Laughing Statue looks serious — but your party has a gift for this. You can tell it wants to smile. It just needs exactly the right kind of reason.',
        [
          {
            id: 'c1',
            label: 'Tell it the funniest thing that happened on the road',
            stat: 'cha',
            requiresRoll: true,
            target: 10,
            successText:
              'The stone cracks into a wide grin and three gold coins tumble from its open mouth. It stays smiling — you have made a friend.',
            failureText:
              'The statue looks more serious. Tough audience.',
            rewardGold: 3,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Ask it a question it has never heard before',
            stat: 'int',
            requiresRoll: true,
            target: 11,
            successText:
              'The statue blinks — then laughs. "In a hundred years, nobody has asked me that." The path ahead clears.',
            failureText:
              'The statue has heard that one before.',
            advancesQuest: true,
          },
        ],
        {
          activity:
            'Everyone at the table must say one funny thing that has happened on a real trip together. The funniest one wins a pretend gold coin.',
          activityKind: 'story',
          plotPurpose:
            'Joy unlocks what force cannot — the party must make the stone smile.',
        }
      ),

      // Variant: default
      scene(
        'room-statue',
        'default',
        always,
        'The stone face looks very serious. A carved sign at its base reads: "I only move for laughter." It has probably been waiting a long time.',
        [
          {
            id: 'c1',
            label: 'Tell a funny story',
            stat: 'cha',
            requiresRoll: true,
            target: 11,
            successText:
              'The stone cracks into a grin and three gold coins fall from its mouth.',
            failureText:
              'The statue looks even more serious. Tough crowd.',
            rewardGold: 3,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Do a silly dance',
            stat: 'dex',
            requiresRoll: true,
            target: 10,
            successText:
              'You hear a deep, stony chuckle. The path ahead clears.',
            failureText:
              'You trip. The statue remains unimpressed.',
            advancesQuest: true,
          },
        ],
        {
          activity:
            'Each player does a silly dance move for five seconds. The best one wins bragging rights.',
          activityKind: 'move',
          plotPurpose:
            'Joy unlocks what force cannot — the party must make the stone smile.',
        }
      ),
    ],

    // ── Room 5: Mirror Pond ────────────────────────────────────────────────
    'room-pond': [
      // Variant: party is at low health — doubt is more dangerous
      scene(
        'room-pond',
        'worn-party',
        allLowHp,
        'The Mirror Pond is perfectly still. It shows not the ground beneath — but each of your faces, looking tired but still here. The crossing does not require strength. It requires believing you will make it.',
        [
          {
            id: 'c1',
            label: 'Cross slowly, one steady breath at a time',
            stat: 'int',
            requiresRoll: true,
            target: 12,
            successText:
              'You believe the water will hold you. It does. Not a single ripple.',
            failureText:
              'Doubt creeps in halfway across. Splash — but the pond is shallow.',
            consequenceHp: 1,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Cross together, holding hands',
            requiresRoll: false,
            successText:
              'You cross as one. The pond accepts that. Not a ripple.',
            failureText: '',
            advancesQuest: true,
          },
        ],
        {
          hint: 'The water does not test your feet — it tests your belief.',
          activity:
            'Everyone hold hands and walk slowly across the room together without letting go or making a sound.',
          activityKind: 'move',
          plotPurpose:
            'The Mirror Pond tests inner calm; doubt makes the crossing fail.',
        }
      ),

      // Variant: default
      scene(
        'room-pond',
        'default',
        always,
        'The pond is perfectly still. To cross, you must walk on the water without making a single ripple. The surface shows your reflection — but the reflection looks steadier than you feel.',
        [
          {
            id: 'c1',
            label: 'Step lightly as a feather',
            stat: 'dex',
            requiresRoll: true,
            target: 14,
            successText:
              'You glide across. The water feels like solid glass beneath your feet.',
            failureText:
              'Splash. You fall in — it is cold.',
            consequenceHp: 2,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Believe the water will hold you',
            stat: 'int',
            requiresRoll: true,
            target: 13,
            successText:
              'You believe it, and it does. Not a ripple.',
            failureText:
              'Doubt creeps in halfway. Splash.',
            consequenceHp: 1,
            advancesQuest: true,
          },
        ],
        {
          plotPurpose:
            'The Mirror Pond tests inner calm; doubt makes the crossing fail.',
        }
      ),
    ],

    // ── Room 6: Campfire Hollow (rest) ─────────────────────────────────────
    'room-rest-woods': [
      // Variant: song chosen to wake spirit
      scene(
        'room-rest-woods',
        'song-wake',
        hasAnswer('medium-wake', 'song'),
        'The campfire is already lit, and the air smells like pine and old music. A fox sits on the far side of the flames, watching. It knows about the song.',
        [
          {
            id: 'c1',
            label: 'Rest and hum a song together',
            stat: 'cha',
            requiresRoll: true,
            target: 10,
            successText:
              'The fox tilts its head and joins in — a perfect harmony. Everyone feels INSPIRED. You know a piece of the forest spirit\'s melody now.',
            failureText:
              'You are off-key but honest. The fox yawns and curls up. Still, everyone heals.',
            rewardHp: 3,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Rest quietly by the fire',
            requiresRoll: false,
            successText:
              'The fire is warm and the party breathes out the day. Everyone recovers.',
            failureText: '',
            rewardHp: 4,
            advancesQuest: true,
          },
        ],
        {
          activity:
            'Everyone hum or whistle a made-up tune for 10 seconds. Then one person adds a second part. What does your song sound like?',
          activityKind: 'story',
          plotPurpose:
            'The campfire offers rest and a chance to bond before the final challenge.',
        }
      ),

      // Variant: default
      scene(
        'room-rest-woods',
        'default',
        always,
        'The campfire is already lit. A pile of soft moss waits beside it, as if someone knew you were coming.',
        [
          {
            id: 'c1',
            label: 'Share a meal and stories',
            requiresRoll: false,
            successText:
              'The party eats together. Everyone recovers. The woods feel friendlier after.',
            failureText: '',
            rewardHp: 4,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Keep watch and talk through the night',
            stat: 'cha',
            requiresRoll: true,
            target: 10,
            successText:
              'You talk through the night. Everyone feels INSPIRED heading into the last room.',
            failureText:
              'You stay awake but tired. Still, you rest.',
            rewardHp: 2,
            advancesQuest: true,
          },
        ],
        {
          plotPurpose:
            'The campfire offers rest and a chance to bond before the final challenge.',
        }
      ),
    ],

    // ── Room 7: The Willow Guard (Boss) ────────────────────────────────────
    'room-boss-medium': [
      // Variant: low HP — the guard shows mercy
      scene(
        'room-boss-medium',
        'wounded-party',
        allLowHp,
        'The Willow Guard stands tall — but it looks at your worn party and its branch-arms lower slightly. It is testing, not crushing. "Prove you are a friend of the forest," it says, "and I will step aside."',
        [
          {
            id: 'c1',
            label: 'Show it the kindness you showed the woods on the way here',
            stat: 'cha',
            requiresRoll: true,
            target: 12,
            successText:
              'You name every creature you helped and every whisper you offered. The guard\'s roots soften. It steps back.',
            failureText:
              'The guard is not convinced yet. It sweeps a branch to block the path.',
            consequenceHp: 2,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Hold your ground and push through',
            stat: 'str',
            requiresRoll: true,
            target: 14,
            successText:
              'You dig in and push. It is like moving a mountain — but you do it.',
            failureText:
              'It is like pushing a mountain. You get knocked back instead.',
            consequenceHp: 3,
          },
        ],
        {
          plotPurpose:
            'The Willow Guard tests whether the party is truly a friend of the forest.',
        }
      ),

      // Variant: default
      scene(
        'room-boss-medium',
        'default',
        always,
        'The Willow Guard stands tall, its branch-arms spread wide, roots digging into the earth. It is as big as a house and it is not moving.',
        [
          {
            id: 'c1',
            label: 'Climb its trunk to find the weak spot',
            stat: 'dex',
            requiresRoll: true,
            target: 14,
            successText:
              'You scramble up its back and find the soft knot that controls its movements.',
            failureText:
              'It shakes you off like a leaf.',
            consequenceHp: 3,
          },
          {
            id: 'c2',
            label: 'Brace and push it back',
            stat: 'str',
            requiresRoll: true,
            target: 14,
            successText:
              'You dig your heels in and shove the ancient guard back three full paces.',
            failureText:
              'It is like pushing a mountain. You get knocked back.',
            consequenceHp: 4,
          },
          {
            id: 'c3',
            label: 'Speak to it as a friend of the forest',
            stat: 'cha',
            requiresRoll: true,
            target: 13,
            successText:
              'You name everything kind you did on the way here. The guard\'s roots loosen. It steps back.',
            failureText:
              'The guard is not convinced. Its branches sweep hard.',
            consequenceHp: 3,
            advancesQuest: true,
          },
        ],
        {
          plotPurpose:
            'The Willow Guard tests whether the party is truly a friend of the forest.',
        }
      ),
    ],
  },
};
