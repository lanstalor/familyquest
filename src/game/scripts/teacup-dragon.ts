import type { GameState, Scene } from '../../types';
import { uid } from '../engine';

export interface ScriptedScene extends Scene {
  variantId: string;
  condition: (state: GameState) => boolean;
}

export interface AdventureScript {
  questId: string;
  narrativeSpine: string;
  plotBeats: Record<string, string>;
  scenes: Record<string, ScriptedScene[]>;
}

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

// ── helpers ────────────────────────────────────────────────────────────────
const hasClass = (cls: string) => (s: GameState) =>
  s.players.some((p) => p.classId === cls);
const hasAnswer = (qId: string, aId: string) => (s: GameState) =>
  s.storyAnswers.some((a) => a.questionId === qId && a.answerId === aId);
const allLowHp = (s: GameState) =>
  s.players.length > 0 && s.players.every((p) => p.hp / p.maxHp < 0.5);
const lastSuccess = (s: GameState) => s.outcome?.success === true;
const always = () => true;
const hasMageOrBard = (s: GameState) =>
  s.players.some((p) => p.classId === 'mage' || p.classId === 'bard');

// ── The Teacup Dragon script ───────────────────────────────────────────────
export const TEACUP_DRAGON: AdventureScript = {
  questId: 'quest-short',
  narrativeSpine:
    'A family quest through a cozy valley to politely ask the Teacup Dragon for the garden key that locked itself with a puff of steam. The valley rewards good manners and brave hearts over brute force alone.',
  plotBeats: {
    'room-gate':
      'The party learns the valley pays attention — good manners open more doors than a sword swing.',
    'room-puzzle':
      'The party must think together to cross the bridge — a test of cooperation under pressure.',
    'room-goblin':
      'The valley has real dangers; the goblin will not move without being beaten or outwitted.',
    'room-treasure':
      'Courage earns its reward: something useful waits inside the chest.',
    'room-boss-short':
      'The Teacup Dragon gives the party one final test before deciding whether they deserve the key.',
  },
  scenes: {
    // ── Room 1: The Mossy Gate ─────────────────────────────────────────────
    'room-gate': [
      // Variant: Myla chose the glowing fox helper
      scene(
        'room-gate',
        'fox-helper',
        hasAnswer('short-helper', 'fox'),
        'Your glowing fox darts up to the arch and freezes, one paw raised. Two crows are watching from the keystone — and one of them bows, ever so slightly, to the fox.',
        [
          {
            id: 'c1',
            label: 'Let the fox lead the greeting',
            requiresRoll: false,
            successText:
              'The fox trots forward and dips its head. The crows part at once, ruffling their feathers with approval. A copper coin tumbles from the arch — left there long ago for a hero the crows would like.',
            failureText: '',
            rewardGold: 3,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Ask the crows what they guard',
            stat: 'cha',
            requiresRoll: true,
            target: 9,
            successText:
              "The crow on the left puffs up importantly, then explains: the gate only opens for those who ask first. It hops aside. The crow on the right drops a small note — 'the goblin road has a trick to it.'",
            failureText:
              'The crow squints, then lets you through anyway. It seems to respect that you tried.',
            advancesQuest: true,
          },
        ],
        {
          activity:
            'Draw your glowing fox on a piece of paper and give it a name. Fold it so it can stand up on the table.',
          activityKind: 'draw',
          plotPurpose:
            'The party learns the valley pays attention — good manners open more doors than a sword swing.',
        }
      ),

      // Variant: default (no fox)
      scene(
        'room-gate',
        'default',
        always,
        'A stone archway under a thick green canopy. Two crows sit on the keystone, eyeing you with the air of creatures who have seen braver heroes and are not yet impressed.',
        [
          {
            id: 'c1',
            label: 'Greet them with your best bow',
            stat: 'cha',
            requiresRoll: true,
            target: 10,
            successText:
              'The crow on the left does a tiny bow in return, then hops aside. A coin falls from its beak — a gift for whoever was polite enough to ask.',
            failureText:
              'The crow bobs its head but does not move. You squeeze through sideways while it watches with clear disapproval. No coin.',
            rewardGold: 2,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Move through while they are distracted',
            stat: 'dex',
            requiresRoll: true,
            target: 11,
            successText:
              'A stone clatters on the far side of the arch — naturally, of course — and the crows turn left. You slip through before they look back.',
            failureText:
              'The crow on the right snaps its beak twice — a warning. You shuffle through anyway, a little embarrassed.',
            advancesQuest: true,
          },
        ],
        {
          activity:
            'Fold a small paper crow. Give it a name and place it next to your token.',
          activityKind: 'craft',
          plotPurpose:
            'The party learns the valley pays attention — good manners open more doors than a sword swing.',
        }
      ),
    ],

    // ── Room 2: The Whispering Bridge ──────────────────────────────────────
    'room-puzzle': [
      // Variant: party has a mage or bard
      scene(
        'room-puzzle',
        'magic-sense',
        hasMageOrBard,
        'The Whispering Bridge hangs over a deep green ravine. Three planks — S, T, R — sway gently. Your magical senses catch something: the bridge is humming a word underneath all that wind noise.',
        [
          {
            id: 'c1',
            label: 'Listen with your magic for the right plank',
            stat: 'int',
            requiresRoll: true,
            target: 11,
            successText:
              'You hear it clearly — the wood sings a single syllable: TRUE. You step forward onto the T plank and cross without a wobble.',
            failureText:
              'The hum slips away just as you reach for it. You take a careful step onto the T plank but the bridge lurches sideways.',
            consequenceHp: 1,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Cross carefully, one at a time',
            stat: 'dex',
            requiresRoll: true,
            target: 12,
            successText:
              'Light-footed and focused, you make it across. The planks bounce gently but hold.',
            failureText:
              'Halfway across, the rope snaps sideways. You catch yourself but lose your balance — and one knee.',
            consequenceHp: 1,
            advancesQuest: true,
          },
        ],
        {
          hint: 'Which three-letter word can you spell from S, T, and R that means "correct"?',
          activity:
            'Write S, T, and R on three small pieces of paper. Everyone tries to arrange them into a word — no talking, only pointing.',
          activityKind: 'puzzle',
          plotPurpose:
            'The party must think together to cross the bridge — a test of cooperation under pressure.',
        }
      ),

      // Variant: default
      scene(
        'room-puzzle',
        'default',
        always,
        'The Whispering Bridge stretches over a deep ravine. Three worn planks hang from the ropes — each carved with a letter: S, T, R. The wind hums, almost like a word trying to get out.',
        [
          {
            id: 'c1',
            label: 'Step on the plank that spells TRUE',
            stat: 'int',
            requiresRoll: true,
            target: 12,
            successText:
              'The T plank glows warm under your foot. The whole bridge sings once, then steadies. You cross easily.',
            failureText:
              'The bridge swings hard. You grab the ropes and catch yourself — just.',
            consequenceHp: 1,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Cross all three planks carefully',
            stat: 'dex',
            requiresRoll: true,
            target: 12,
            successText:
              'Careful and patient, you find your footing on each plank in turn and reach the other side.',
            failureText:
              'The R plank is slippery. You slide and scrape your knee on the rope.',
            consequenceHp: 1,
            advancesQuest: true,
          },
        ],
        {
          hint: 'The wind hummed "trrrue"...',
          activity:
            'Cut three small paper planks and label them S, T, R. Arrange them on the board and work out the right word together.',
          activityKind: 'puzzle',
          plotPurpose:
            'The party must think together to cross the bridge — a test of cooperation under pressure.',
        }
      ),
    ],

    // ── Room 3: Goblin Snare ───────────────────────────────────────────────
    'room-goblin': [
      // Variant: party has a warrior
      scene(
        'room-goblin',
        'warrior-party',
        hasClass('warrior'),
        'A goblin in a dented helmet jumps from behind a mossy log, swinging a knobby club. It spots your warrior and hesitates — just for a beat — its shield arm wavering.',
        [
          {
            id: 'c1',
            label: 'Warrior charges through that hesitation',
            stat: 'str',
            requiresRoll: true,
            target: 10,
            successText:
              "You're already moving. The goblin barely gets its shield up before you push it clean off the path and into the bushes.",
            failureText:
              'The goblin shakes off its nerves and clubs your arm hard.',
            consequenceHp: 2,
          },
          {
            id: 'c2',
            label: 'Feint left and sweep its legs',
            stat: 'dex',
            requiresRoll: true,
            target: 11,
            successText:
              'You step left, then go right fast. The goblin\'s club sweeps empty air and it goes down in a tangle of limbs.',
            failureText:
              'It reads the feint and shoulder-checks you away hard.',
            consequenceHp: 2,
          },
          {
            id: 'c3',
            label: 'Demand it stand aside — firmly',
            stat: 'cha',
            requiresRoll: true,
            target: 11,
            successText:
              "To everyone's surprise — including yours — the goblin squints at your warrior, mutters something, and steps off the path. Maybe it was never that serious.",
            failureText:
              'The goblin blows a raspberry and raises its club again. You will have to do this the hard way.',
            advancesQuest: true,
          },
        ],
        {
          plotPurpose:
            'The valley has real dangers; the goblin will not move without being beaten or outwitted.',
        }
      ),

      // Variant: default
      scene(
        'room-goblin',
        'default',
        always,
        'A goblin raider bursts from behind a log with a club and a battered shield. It charges before you can step around it, and it does not look like it is here to talk.',
        [
          {
            id: 'c1',
            label: 'Hit it head-on',
            stat: 'str',
            requiresRoll: true,
            target: 11,
            successText:
              'Your hit slams through its guard and drives it backward through the brush. It does not get up.',
            failureText:
              'You swing wide, and the goblin cracks you in the side with its club.',
            consequenceHp: 2,
          },
          {
            id: 'c2',
            label: 'Flank and trip it',
            stat: 'dex',
            requiresRoll: true,
            target: 11,
            successText:
              'You cut around the shield side and sweep its legs out from under it.',
            failureText:
              'The goblin reads the move and shoulder-checks you away.',
            consequenceHp: 2,
          },
        ],
        {
          plotPurpose:
            'The valley has real dangers; the goblin will not move without being beaten or outwitted.',
        }
      ),
    ],

    // ── Room 4: The Forgotten Chest ───────────────────────────────────────
    'room-treasure': [
      // Variant: last room was a success
      scene(
        'room-treasure',
        'on-a-roll',
        lastSuccess,
        'The Forgotten Chest sits on a velvet cushion in a beam of light. A small bunny crouches beside it, wearing a brass key around its neck. It sees you coming and seems — somehow — impressed.',
        [
          {
            id: 'c1',
            label: 'Ask the bunny nicely for the key',
            stat: 'cha',
            requiresRoll: true,
            target: 9,
            successText:
              'The bunny hops forward and places the key in your hand. The chest swings open on its own: gold and a glowing ring inside, left for a hero just like you.',
            failureText:
              'The bunny sniffs the air and tucks the key behind its ear. Not quite there yet.',
            rewardGold: 10,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Work the locks yourself',
            stat: 'dex',
            requiresRoll: true,
            target: 12,
            successText:
              'Each lock clicks open with a small, pleased chime. Inside: a ring and a pile of gold.',
            failureText:
              'One lock bites you lightly. This chest is temperamental.',
            consequenceHp: 1,
            rewardGold: 10,
            advancesQuest: true,
          },
        ],
        {
          plotPurpose: 'Courage earns its reward: something useful waits inside the chest.',
        }
      ),

      // Variant: default
      scene(
        'room-treasure',
        'default',
        always,
        'The Forgotten Chest sits on a velvet cushion. Three locks. A small bunny watches from a nearby root, holding what looks like a tiny key on a string.',
        [
          {
            id: 'c1',
            label: 'Solve the locks by trial and wit',
            stat: 'int',
            requiresRoll: true,
            target: 12,
            successText:
              'Each lock clicks open in turn with a small, pleased chime. Gold and a glowing ring inside.',
            failureText:
              'The first lock bites back lightly. This chest is temperamental.',
            consequenceHp: 1,
            rewardGold: 10,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Ask the bunny for help',
            stat: 'cha',
            requiresRoll: true,
            target: 10,
            successText:
              'The bunny hops forward and drops a tiny key at your feet. It was just waiting to be asked.',
            failureText:
              'The bunny considers you for a long moment, then shrugs its little shoulders and hops away.',
            rewardGold: 10,
            advancesQuest: true,
          },
        ],
        {
          activity:
            'Draw what you imagine is inside the chest before you open it. Then compare everyone\'s drawings.',
          activityKind: 'draw',
          plotPurpose: 'Courage earns its reward: something useful waits inside the chest.',
        }
      ),
    ],

    // ── Room 5: The Sleepy Dragon (Boss) ───────────────────────────────────
    'room-boss-short': [
      // Variant: "showdown" prize chosen — family wants a real fight
      scene(
        'room-boss-short',
        'showdown',
        hasAnswer('short-prize', 'showdown'),
        '"Finally," the Teacup Dragon says, springing up from her hoard with steam curling from her nostrils. She is small but fast, and her golden eyes say she has been waiting for exactly this. "Someone who looks ready."',
        [
          {
            id: 'c1',
            label: 'Charge through the steam',
            stat: 'str',
            requiresRoll: true,
            target: 13,
            successText:
              'You crash through the cloud and hammer the dragon backward off the key pile. She skids to a stop and dips her head — respect.',
            failureText:
              'She snaps her tail and slams you sideways across the stones.',
            consequenceHp: 3,
          },
          {
            id: 'c2',
            label: 'Challenge her to a proper duel',
            stat: 'cha',
            requiresRoll: true,
            target: 12,
            successText:
              'She pauses. "A duel? With terms?" Her tail lowers. The fight becomes something more like a dance — and when it ends, she hands over the key herself.',
            failureText:
              '"A duel? You are not ready for a duel." She attacks.',
            advancesQuest: true,
          },
          {
            id: 'c3',
            label: 'Circle and feint for the key',
            stat: 'dex',
            requiresRoll: true,
            target: 13,
            successText:
              'You draw her full spin left, then dart right. Her claws close on air. You have the key.',
            failureText:
              'She reads the feint and counter-attacks hard.',
            consequenceHp: 3,
          },
        ],
        {
          plotPurpose:
            'The Teacup Dragon tests the party one final time before deciding whether they deserve the key.',
        }
      ),

      // Variant: low HP — wounded party gets a different opening
      scene(
        'room-boss-short',
        'wounded-party',
        allLowHp,
        'The Teacup Dragon looks up from her hoard as your battered party enters. She tilts her head — not with pride, but with something like curiosity. "You made it here looking like that?" she says. "That is actually quite something."',
        [
          {
            id: 'c1',
            label: 'Tell her how you got here',
            stat: 'cha',
            requiresRoll: true,
            target: 11,
            successText:
              'You tell her about the bridge, the goblin road, the chest. She listens — really listens. Then she pushes the key across the floor. "That was a proper journey," she says.',
            failureText:
              'Your voice is rough and she tilts her head, still listening. She is not convinced yet.',
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Ask if you can both rest first',
            stat: 'cha',
            requiresRoll: true,
            target: 10,
            successText:
              'She stares. Then laughs — a small steam-puff of a laugh. "Five minutes," she says. The party breathes and recovers a little before the real test.',
            failureText:
              'She shakes her head. "No. But I admire the nerve." She shifts into a fighting stance.',
            rewardHp: 3,
          },
          {
            id: 'c3',
            label: 'One last charge — everything you have left',
            stat: 'str',
            requiresRoll: true,
            target: 13,
            successText:
              'Everything left, in one move. She was not expecting that kind of grit. She staggers backward and the key slides free.',
            failureText:
              'You stumble. She catches you — gently — with one careful claw. You take less damage than you should.',
            consequenceHp: 2,
          },
        ],
        {
          plotPurpose:
            'The Teacup Dragon tests the party one final time before deciding whether they deserve the key.',
        }
      ),

      // Variant: default (key prize or general)
      scene(
        'room-boss-short',
        'default',
        always,
        'The Teacup Dragon curls over the silver key, steam rising from her nostrils. She is smaller than you expected, but her eyes are quick. "If you want it," she says, "you will have to earn it."',
        [
          {
            id: 'c1',
            label: 'Try to reason with her',
            stat: 'cha',
            requiresRoll: true,
            target: 12,
            successText:
              'You speak of the locked garden, of the family waiting, of small things that matter. After a long breath of steam, she slides the key forward.',
            failureText:
              '"I have heard that story before," she says, and attacks.',
          },
          {
            id: 'c2',
            label: 'Rush her directly',
            stat: 'str',
            requiresRoll: true,
            target: 13,
            successText:
              'You push through the steam and reach the key before she can stop you.',
            failureText:
              'She tail-whips you into the far wall.',
            consequenceHp: 3,
          },
          {
            id: 'c3',
            label: 'Find a gap and slip past',
            stat: 'dex',
            requiresRoll: true,
            target: 13,
            successText:
              'You spot a gap — not to hurt, but to get past. You are already holding the key before she realizes.',
            failureText:
              'She spins faster than expected.',
            consequenceHp: 3,
          },
        ],
        {
          plotPurpose:
            'The Teacup Dragon tests the party one final time before deciding whether they deserve the key.',
        }
      ),
    ],
  },
};
