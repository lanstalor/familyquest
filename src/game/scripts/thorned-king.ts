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

export const THORNED_KING: AdventureScript = {
  questId: 'quest-long',
  narrativeSpine:
    'A brave family quest across the valley to gather three tokens of trust and free the Thorned King from the bramble crown that has trapped him for a hundred years. The valley is wary and quiet — kindness and patience unlock what force alone cannot.',
  plotBeats: {
    'room-gate':
      'The party earns the valley\'s first token of trust by choosing respect over haste.',
    'room-market':
      'The party discovers the world has more to offer those who give as well as take.',
    'room-rest1':
      'The inn offers genuine warmth — the party rests and hears a rumour about the King.',
    'room-puzzle':
      'The Whispering Bridge tests whether the party thinks together before acting.',
    'room-mushrooms':
      'The Mushroom Choir offers a second token of trust to those who can match its song.',
    'room-goblin':
      'A real fight tests the party\'s mettle — the valley watches to see if they fight fair.',
    'room-riddle':
      'The Singing Door holds the third token of trust — only a true answer opens it.',
    'room-rest2':
      'Starlight Clearing offers rest and a final moment of quiet before the King.',
    'room-boss-long':
      'The Thorned King tests everything the party has learned — courage, kindness, and cleverness together.',
  },
  scenes: {
    // ── Room 1: The Mossy Gate ─────────────────────────────────────────────
    'room-gate': [
      // Variant: lantern-golden mood
      scene(
        'room-gate',
        'lantern-golden',
        hasAnswer('long-guide', 'lantern'),
        'Warm light glows from the lanterns hung on the Mossy Gate archway. Two crows sit in the glow, their eyes like polished buttons. The gate is beautiful — and firmly closed.',
        [
          {
            id: 'c1',
            label: 'Bow to the crows and wait',
            requiresRoll: false,
            successText:
              'The crow on the right bobs its head, impressed by your patience. The gate clicks open and a small gold coin rolls to your feet — a gift from the lantern-keepers.',
            failureText: '',
            rewardGold: 3,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Ask what the gate is guarding',
            stat: 'cha',
            requiresRoll: true,
            target: 10,
            successText:
              'The crow explains: the gate holds a piece of the King\'s old road. It opens only for those who understand what they are walking into. It hops aside.',
            failureText:
              'The crow stares. Then lets you through anyway — but does not explain.',
            advancesQuest: true,
          },
        ],
        {
          plotPurpose:
            'The party earns the valley\'s first token of trust by choosing respect over haste.',
        }
      ),

      // Variant: default
      scene(
        'room-gate',
        'default',
        always,
        'A stone archway swallowed by green. Two crows sit on the keystone, watching. The whole valley feels like it is watching with them.',
        [
          {
            id: 'c1',
            label: 'Greet them with your best bow',
            stat: 'cha',
            requiresRoll: true,
            target: 10,
            successText:
              'The crow on the left bows back, then hops aside. A coin falls from its beak.',
            failureText:
              'The crow bobs but does not move. You squeeze through sideways.',
            rewardGold: 2,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Slip through while they look away',
            stat: 'dex',
            requiresRoll: true,
            target: 11,
            successText:
              'A stone clatters — naturally — and you slip through before they look back.',
            failureText:
              'The crow snaps its beak twice. You go through anyway.',
            advancesQuest: true,
          },
        ],
        {
          activity: 'Fold a small paper crow. Give it a name and place it on the table.',
          activityKind: 'craft',
          plotPurpose:
            'The party earns the valley\'s first token of trust by choosing respect over haste.',
        }
      ),
    ],

    // ── Room 2: Sunmarket Square ───────────────────────────────────────────
    'room-market': [
      // Variant: song token chosen — music matters in this quest
      scene(
        'room-market',
        'song-token',
        hasAnswer('long-token', 'song'),
        'Sunmarket Square smells like apples and warm bread. A fortune-teller waves you over from her stall — but the more interesting thing is the old busker in the corner, playing a tune you almost recognise.',
        [
          {
            id: 'c1',
            label: 'Ask the busker about the song',
            stat: 'cha',
            requiresRoll: true,
            target: 10,
            successText:
              'He grins. "That\'s the King\'s old marching song. He\'d have liked you." He teaches you the first four notes. Something feels unlocked.',
            failureText:
              'He shrugs. "Just an old tune." He goes back to playing.',
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Sing for coins in the square',
            stat: 'cha',
            requiresRoll: true,
            target: 11,
            successText:
              'A small crowd gathers. You earn 5 gold and the fortune-teller presses a warm coin into your hand — "for the journey ahead," she says.',
            failureText:
              'One person claps. Politely.',
            rewardGold: 5,
            advancesQuest: true,
          },
        ],
        {
          activity: 'Everyone hum a made-up marching tune for 10 seconds. The table votes on the best.',
          activityKind: 'story',
          plotPurpose:
            'The party discovers the world has more to offer those who give as well as take.',
        }
      ),

      // Variant: default
      scene(
        'room-market',
        'default',
        always,
        'Sunmarket Square smells like apples and old books. A fortune-teller waves you over, and the stalls are full of interesting things.',
        [
          {
            id: 'c1',
            label: 'Buy an apple and share it (1 gold)',
            requiresRoll: false,
            successText:
              'Crunchy, sweet, and somehow lucky. The whole party feels a little better.',
            failureText: '',
            rewardGold: -1,
            rewardHp: 1,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Hear your fortune',
            stat: 'int',
            requiresRoll: true,
            target: 10,
            successText:
              'Her words match something you have been thinking. You feel ready.',
            failureText:
              'She says something confusing, but winks kindly.',
            advancesQuest: true,
          },
          {
            id: 'c3',
            label: 'Sing for coins',
            stat: 'cha',
            requiresRoll: true,
            target: 11,
            successText:
              'A small crowd gathers. You earn 5 gold and a new friend.',
            failureText: 'One person claps. Politely.',
            rewardGold: 5,
            advancesQuest: true,
          },
        ],
        {
          activity: 'Draw a small map of Sunmarket Square on an index card.',
          activityKind: 'draw',
          plotPurpose:
            'The party discovers the world has more to offer those who give as well as take.',
        }
      ),
    ],

    // ── Room 3: The Friendly Inn (rest) ────────────────────────────────────
    'room-rest1': [
      scene(
        'room-rest1',
        'default',
        always,
        'The innkeeper insists you eat before you talk. The stew is good. Everyone feels better — and between spoonfuls, the innkeeper mentions something: the King wasn\'t always trapped. Someone put those thorns there on purpose.',
        [
          {
            id: 'c1',
            label: 'Rest by the fire',
            requiresRoll: false,
            successText:
              'You breathe out the day. The whole party recovers. The innkeeper leaves a warm roll by each door.',
            failureText: '',
            rewardHp: 3,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Tell the room a story',
            stat: 'cha',
            requiresRoll: true,
            target: 10,
            successText:
              'A stranger tips you 4 gold and slips you a note: "The Singing Door asks for something kept by giving away."',
            failureText: 'Polite applause. Still worth it.',
            rewardGold: 4,
            advancesQuest: true,
          },
        ],
        {
          plotPurpose:
            'The inn offers genuine warmth — the party rests and hears a rumour about the King.',
        }
      ),
    ],

    // ── Room 4: The Whispering Bridge ──────────────────────────────────────
    'room-puzzle': [
      // Variant: mage in party — magical insight
      scene(
        'room-puzzle',
        'magic-sense',
        hasMageOrBard,
        'The Whispering Bridge again. You have been here before — but now the letters S, T, R seem to hum with a slightly different frequency. Your magical sense catches it.',
        [
          {
            id: 'c1',
            label: 'Follow the magical hum to the right plank',
            stat: 'int',
            requiresRoll: true,
            target: 10,
            successText:
              'The T plank sings clearly. You cross without a wobble.',
            failureText:
              'The hum is faint. You step carefully but wobble on the crossing.',
            consequenceHp: 1,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Cross together in single file',
            stat: 'dex',
            requiresRoll: true,
            target: 11,
            successText:
              'One at a time, careful and steady. You all make it.',
            failureText:
              'The bridge swings. You grab the ropes and hold on.',
            consequenceHp: 1,
            advancesQuest: true,
          },
        ],
        {
          hint: 'S, T, R — what three-letter word meaning "correct" can you find?',
          plotPurpose:
            'The Whispering Bridge tests whether the party thinks together before acting.',
        }
      ),

      // Variant: default
      scene(
        'room-puzzle',
        'default',
        always,
        'The Whispering Bridge hangs over a deep ravine. Three worn planks — S, T, R — sway in the wind. The wind hums, almost like a word.',
        [
          {
            id: 'c1',
            label: 'Step on the plank that spells TRUE',
            stat: 'int',
            requiresRoll: true,
            target: 12,
            successText:
              'The T plank glows warm. The bridge sings once and steadies. You cross.',
            failureText:
              'The bridge swings hard. You catch the ropes.',
            consequenceHp: 1,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Cross one at a time, carefully',
            stat: 'dex',
            requiresRoll: true,
            target: 12,
            successText:
              'Patient and careful, you all make it across.',
            failureText:
              'The R plank is slippery. You slide and scrape your knee.',
            consequenceHp: 1,
            advancesQuest: true,
          },
        ],
        {
          hint: 'The wind hummed "trrrue"...',
          activity:
            'Arrange three small pieces of paper labelled S, T, R — find all the words you can make.',
          activityKind: 'puzzle',
          plotPurpose:
            'The Whispering Bridge tests whether the party thinks together before acting.',
        }
      ),
    ],

    // ── Room 5: The Mushroom Choir ─────────────────────────────────────────
    'room-mushrooms': [
      // Variant: "fighting smart" strategy chosen
      scene(
        'room-mushrooms',
        'fight-smart',
        hasAnswer('long-strength', 'smart'),
        'The ring of glowing mushrooms plays a melody — red, blue, yellow, red. Your party is good at reading patterns. This might be simpler than it looks.',
        [
          {
            id: 'c1',
            label: 'Study the pattern once, then match it perfectly',
            stat: 'int',
            requiresRoll: true,
            target: 11,
            successText:
              'You get it first try. The song finishes with a delighted giggle and all the mushrooms glow at once. A gold coin rises from the centre.',
            failureText:
              'One note off. The mushrooms play it again, slower.',
            rewardGold: 5,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Improvise a counter-melody',
            stat: 'cha',
            requiresRoll: true,
            target: 11,
            successText:
              'The mushrooms love it. One bows — and grows into a little umbrella shaped like a shield.',
            failureText:
              'You are off-key. The mushrooms politely cover their ears — they have none.',
            advancesQuest: true,
          },
        ],
        {
          activity:
            'The GM taps three things on the table in a pattern. Everyone must repeat it perfectly, adding one new tap each round.',
          activityKind: 'puzzle',
          plotPurpose:
            'The Mushroom Choir offers a second token of trust to those who can match its song.',
        }
      ),

      // Variant: default
      scene(
        'room-mushrooms',
        'default',
        always,
        'A ring of glowing mushrooms plays a tune. It goes: red, blue, yellow, red. Then they look at you expectantly.',
        [
          {
            id: 'c1',
            label: 'Match the pattern',
            stat: 'int',
            requiresRoll: true,
            target: 12,
            successText:
              'The song finishes with a giggle. A gold coin rises from the centre of the ring.',
            failureText:
              'The mushrooms look disappointed. They play it again, slower.',
            rewardGold: 5,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Sing along',
            stat: 'cha',
            requiresRoll: true,
            target: 11,
            successText:
              'The mushrooms love you. One bows and grows into a little umbrella.',
            failureText:
              'You are off-key. The mushrooms politely cover their ears.',
            advancesQuest: true,
          },
        ],
        {
          activity:
            'The GM taps a four-beat pattern on the table. Each player must repeat it and add one tap. Keep going until someone breaks the chain.',
          activityKind: 'puzzle',
          plotPurpose:
            'The Mushroom Choir offers a second token of trust to those who can match its song.',
        }
      ),
    ],

    // ── Room 6: Goblin Snare ───────────────────────────────────────────────
    'room-goblin': [
      // Variant: "hitting hard" strategy chosen
      scene(
        'room-goblin',
        'hit-hard',
        hasAnswer('long-strength', 'hard'),
        'A goblin jumps from behind a log with a club and a bad attitude. It picked the wrong party.',
        [
          {
            id: 'c1',
            label: 'Crash through its guard',
            stat: 'str',
            requiresRoll: true,
            target: 10,
            successText:
              'You hit like you mean it. The goblin goes through the bush and does not come back.',
            failureText:
              'It blocks better than expected and clubs you hard.',
            consequenceHp: 2,
          },
          {
            id: 'c2',
            label: 'Knock it off balance, then push',
            stat: 'dex',
            requiresRoll: true,
            target: 11,
            successText:
              'You sweep its legs and push it over. It stays down.',
            failureText:
              'The goblin stumbles but recovers fast.',
            consequenceHp: 2,
          },
        ],
        {
          plotPurpose:
            'A real fight tests the party\'s mettle — the valley watches to see if they fight fair.',
        }
      ),

      // Variant: default
      scene(
        'room-goblin',
        'default',
        always,
        'A goblin raider bursts from behind a log with a club and a scrap-wood shield. It charges before you can step around it.',
        [
          {
            id: 'c1',
            label: 'Hit it head-on',
            stat: 'str',
            requiresRoll: true,
            target: 11,
            successText:
              'Your hit slams through its guard and drives it backward through the brush.',
            failureText:
              'You swing wide, and the goblin cracks you in the side.',
            consequenceHp: 2,
          },
          {
            id: 'c2',
            label: 'Flank and trip it',
            stat: 'dex',
            requiresRoll: true,
            target: 11,
            successText:
              'You cut around the shield side and sweep its legs out.',
            failureText:
              'The goblin reads the move and shoulder-checks you away.',
            consequenceHp: 2,
          },
        ],
        {
          plotPurpose:
            'A real fight tests the party\'s mettle — the valley watches to see if they fight fair.',
        }
      ),
    ],

    // ── Room 7: The Singing Door ───────────────────────────────────────────
    'room-riddle': [
      scene(
        'room-riddle',
        'default',
        always,
        'The Singing Door clears its throat: "I am kept by giving away. What am I?"',
        [
          {
            id: 'c1',
            label: 'Answer: a promise',
            stat: 'int',
            requiresRoll: true,
            target: 13,
            successText:
              'The door beams. "Walk through, friend." It swings wide. Beyond it, starlight and an open road.',
            failureText:
              '"Almost. Keep thinking." The door hums politely.',
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Answer: a secret',
            stat: 'int',
            requiresRoll: true,
            target: 13,
            successText:
              'The door laughs — a warm, wooden sound. "Exactly so." It opens.',
            failureText:
              '"Close, traveler. Try again." No damage.',
          },
          {
            id: 'c3',
            label: 'Sing the answer instead of saying it',
            stat: 'cha',
            requiresRoll: true,
            target: 12,
            successText:
              'The door has never been sung to before. It opens at once, delighted.',
            failureText:
              'The door listens carefully. "I appreciate the effort. But I need the word."',
            advancesQuest: true,
          },
        ],
        {
          plotPurpose:
            'The Singing Door holds the third token of trust — only a true answer opens it.',
        }
      ),
    ],

    // ── Room 8: Starlight Clearing (rest) ──────────────────────────────────
    'room-rest2': [
      scene(
        'room-rest2',
        'default',
        always,
        'Starlight Clearing. Quiet. Clean. A small spring bubbles with water that smells faintly of tea. The valley feels very close here — like it is holding its breath for what comes next.',
        [
          {
            id: 'c1',
            label: 'Drink from the spring',
            requiresRoll: false,
            successText:
              'Warm tea-water fills you. The whole party recovers.',
            failureText: '',
            rewardHp: 4,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Sleep under the stars',
            requiresRoll: false,
            successText:
              'You wake with clear heads and 3 gold left on your cloaks — a gift from the clearing itself.',
            failureText: '',
            rewardGold: 3,
            rewardHp: 2,
            advancesQuest: true,
          },
        ],
        {
          activity:
            'Everyone says one thing they are proud of from the journey so far. Then the party decides together: hit hard or fight smart for the final room?',
          activityKind: 'story',
          plotPurpose:
            'Starlight Clearing offers rest and a final moment of quiet before the King.',
        }
      ),
    ],

    // ── Room 9: The Thorned King (Boss) ────────────────────────────────────
    'room-boss-long': [
      // Variant: "hitting hard" strategy
      scene(
        'room-boss-long',
        'hit-hard',
        hasAnswer('long-strength', 'hard'),
        'The Thorned King tears his thorn-blade free and strides forward. "Then come," he growls. He is massive and dangerous — but the party is built for exactly this.',
        [
          {
            id: 'c1',
            label: 'Hammer the thorn-crown directly',
            stat: 'str',
            requiresRoll: true,
            target: 14,
            successText:
              'Your blow lands square and splits part of the thorn-crown loose. The king staggers.',
            failureText:
              'He catches the strike and lashes thorn-vines across your guard.',
            consequenceHp: 4,
          },
          {
            id: 'c2',
            label: 'Drive him back with everything',
            stat: 'str',
            requiresRoll: true,
            target: 15,
            successText:
              'You push forward with everything you have. He gives ground — three full steps.',
            failureText:
              'He braces and the push fails. Vines sweep you sideways.',
            consequenceHp: 4,
          },
          {
            id: 'c3',
            label: 'Break the crown, not the man',
            stat: 'cha',
            requiresRoll: true,
            target: 13,
            successText:
              'You shout: "We are not here to beat you — we are here to free you." He stops. The crown cracks on its own.',
            failureText:
              'He does not hear it over the sound of the fight.',
            advancesQuest: true,
          },
        ],
        {
          plotPurpose:
            'The Thorned King tests everything the party has learned — courage, kindness, and cleverness together.',
        }
      ),

      // Variant: low HP — the King shows respect
      scene(
        'room-boss-long',
        'wounded-party',
        allLowHp,
        'The Thorned King looks at your battered party and the thorn-vines on his crown pull back slightly. "You came this far," he says. "You have already passed the test that matters most."',
        [
          {
            id: 'c1',
            label: 'Tell him what you have done to get here',
            stat: 'cha',
            requiresRoll: true,
            target: 12,
            successText:
              'You name every token of trust, every creature helped, every door opened. The crown begins to crack. "Then take it," he says quietly.',
            failureText:
              'Your voice is rough. He listens but shifts his grip on the thorn-blade.',
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Stand firm and face him',
            stat: 'str',
            requiresRoll: true,
            target: 14,
            successText:
              'You stand firm. He strikes — and pulls the blow at the last second. "Good," he says. The crown falls.',
            failureText:
              'The blow lands. You stagger but do not fall.',
            consequenceHp: 3,
          },
        ],
        {
          plotPurpose:
            'The Thorned King tests everything the party has learned — courage, kindness, and cleverness together.',
        }
      ),

      // Variant: default / "fighting smart"
      scene(
        'room-boss-long',
        'default',
        always,
        'The Thorned King stands between your party and the last path home. The thorn-crown pulses with old, trapped magic. He looks tired — not just angry.',
        [
          {
            id: 'c1',
            label: 'Slip inside his reach',
            stat: 'dex',
            requiresRoll: true,
            target: 15,
            successText:
              'You cut under the sweeping vines and strike where the crown binds tightest. A thorn cracks.',
            failureText:
              'The vines close around you and slam you to the ground.',
            consequenceHp: 5,
          },
          {
            id: 'c2',
            label: 'Speak to him — say why you came',
            stat: 'cha',
            requiresRoll: true,
            target: 13,
            successText:
              'You tell him about the valley going quiet, the creatures afraid, the family that sent you. He lowers the thorn-blade. "Then finish it," he says.',
            failureText:
              'He shakes his head. The vines tighten.',
            advancesQuest: true,
          },
          {
            id: 'c3',
            label: 'Strike the crown with everything you have',
            stat: 'str',
            requiresRoll: true,
            target: 15,
            successText:
              'Your hit lands square on the crown and it shatters into pieces. He stands free.',
            failureText:
              'He catches your strike and lashes vines across your guard hard.',
            consequenceHp: 4,
          },
        ],
        {
          plotPurpose:
            'The Thorned King tests everything the party has learned — courage, kindness, and cleverness together.',
        }
      ),
    ],
  },
};
