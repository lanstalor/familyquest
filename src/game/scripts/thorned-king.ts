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
    'room-outpost':
      'A fortified wall blocks the road. The Guard Captain stands firm at the gate.',
    'room-rest1':
      'The inn offers genuine warmth — the party rests and hears a rumour about the King.',
    'room-puzzle':
      'The Whispering Bridge tests whether the party thinks together before acting.',
    'room-stone-pass':
      'A heavy stone golem blocks the mountain ledge.',
    'room-mushrooms':
      'The Mushroom Choir offers a second token of trust to those who can match its song.',
    'room-crystals':
      'Giant glowing crystals fill the cavern, pulsing with blue and purple light.',
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
            successText: 'The crow bows back and hops aside. A gold coin falls from its beak.',
            failureText: 'The crow bobs but does not move. You squeeze through sideways.',
            rewardGold: 2,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Slip through while they look away',
            stat: 'dex',
            requiresRoll: true,
            target: 11,
            successText: 'A stone clatters — naturally — and you slip through before they look back.',
            failureText: 'The crow snaps its beak twice. You go through anyway.',
            advancesQuest: true,
          },
        ],
        { activityKind: 'craft', activity: 'Fold a small paper crow.' }
      ),
    ],

    // ── Room 2: Sunmarket Square ───────────────────────────────────────────
    'room-market': [
      scene(
        'room-market',
        'default',
        always,
        'Sunmarket Square smells like apples and old books. Stalls are full of interesting things, and a merchant waves you over.',
        [
          {
            id: 'c1',
            label: 'Buy an apple and share it (1 gold)',
            requiresRoll: false,
            successText: 'Crunchy and sweet. The whole party feels a little better.',
            failureText: '',
            rewardGold: -1,
            rewardHp: 1,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Listen to the merchant\'s tales',
            stat: 'int',
            requiresRoll: true,
            target: 10,
            successText: 'The merchant tells you of the King\'s old road. You feel ready.',
            failureText: 'He says something confusing, but winks kindly.',
            advancesQuest: true,
          },
        ],
        { activityKind: 'draw', activity: 'Draw a small map of Sunmarket Square.' }
      ),
    ],

    // ── Room 3: The Valley Outpost ─────────────────────────────────────────
    'room-outpost': [
      scene(
        'room-outpost',
        'default',
        always,
        'A fortified wall blocks the road. The Guard Captain stands firm at the gate, his hand on his sword-hilt. High above, a skeleton archer tracks your every move.',
        [
          {
            id: 'c1',
            label: 'Try to reason with the Captain',
            stat: 'cha',
            requiresRoll: true,
            target: 14,
            successText: 'The Captain listens and lowers his sword. "We were once the King\'s men," he sighs. "Pass, and bring him peace."',
            failureText: 'The Captain shakes his head. "None pass without the King\'s word." The archer looses a warning shot!',
            consequenceHp: 2,
          },
          {
            id: 'c2',
            label: 'Charge the gate',
            stat: 'str',
            requiresRoll: true,
            target: 15,
            successText: 'You burst through! The Captain is caught off guard, and the archer\'s arrow clatters uselessly.',
            failureText: 'The gate is heavy and the archer is quick. You take a hit before you reach the wall.',
            consequenceHp: 3,
          },
        ],
      ),
    ],

    // ── Room 4: The Friendly Inn (rest) ────────────────────────────────────
    'room-rest1': [
      scene(
        'room-rest1',
        'default',
        always,
        'The innkeeper insists you eat before you talk. The stew is warm and the fire is bright. Everyone heals.',
        [
          {
            id: 'c1',
            label: 'Rest by the fire',
            requiresRoll: false,
            successText: 'You breathe out the day. The whole party recovers.',
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
            successText: 'A stranger tips you 4 gold and slips you a note about the Singing Door.',
            failureText: 'Polite applause. Still worth it.',
            rewardGold: 4,
            advancesQuest: true,
          },
        ],
      ),
    ],

    // ── Room 5: The Whispering Bridge ──────────────────────────────────────
    'room-puzzle': [
      scene(
        'room-puzzle',
        'default',
        always,
        'The Whispering Bridge hangs over a deep ravine. Three worn planks — S, T, R — sway in the wind. The wind hums a secret word.',
        [
          {
            id: 'c1',
            label: 'Step on the plank that spells TRUE',
            stat: 'int',
            requiresRoll: true,
            target: 12,
            successText: 'The T plank glows warm. The bridge sings once and steadies. You cross.',
            failureText: 'The bridge swings hard. You catch the ropes.',
            consequenceHp: 1,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Cross one at a time, carefully',
            stat: 'dex',
            requiresRoll: true,
            target: 12,
            successText: 'Patient and careful, you all make it across.',
            failureText: 'The R plank is slippery. You slide and scrape your knee.',
            consequenceHp: 1,
            advancesQuest: true,
          },
        ],
        { activityKind: 'puzzle', activity: 'Find all the words you can make with S, T, R.' }
      ),
    ],

    // ── Room 6: The Stone Pass ─────────────────────────────────────────────
    'room-stone-pass': [
      scene(
        'room-stone-pass',
        'default',
        always,
        'A heavy stone golem steps out from the mountain-side, its eyes glowing with old magic. It is slow, but it blocks the entire path.',
        [
          {
            id: 'c1',
            label: 'Strike its crystal core',
            stat: 'str',
            requiresRoll: true,
            target: 13,
            successText: 'Your blow lands square. The golem rumbles and steps back into the mountain.',
            failureText: 'Its hide is like iron. It swats you aside!',
            consequenceHp: 2,
          },
          {
            id: 'c2',
            label: 'Leap over its sweeping arms',
            stat: 'dex',
            requiresRoll: true,
            target: 14,
            successText: 'You tumble past its reach. It cannot turn fast enough to catch you.',
            failureText: 'It is quicker than it looks. You get caught in its grip.',
            consequenceHp: 2,
          },
        ],
      ),
    ],

    // ── Room 7: The Mushroom Choir ─────────────────────────────────────────
    'room-mushrooms': [
      scene(
        'room-mushrooms',
        'default',
        always,
        'A ring of glowing mushrooms plays a tune: red, blue, yellow, red. A wise forest druid watches to see if you can match the song.',
        [
          {
            id: 'c1',
            label: 'Match the pattern perfectly',
            stat: 'int',
            requiresRoll: true,
            target: 11,
            successText: 'The song finishes with a delighted giggle and all the mushrooms glow. A gold coin rises from the centre.',
            failureText: 'One note off. The mushrooms play it again, slower.',
            rewardGold: 5,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Improvise a counter-melody',
            stat: 'cha',
            requiresRoll: true,
            target: 11,
            successText: 'The mushrooms love it. One bows and grows into a little umbrella shield.',
            failureText: 'You are off-key. The mushrooms cover their ears.',
            advancesQuest: true,
          },
        ],
        { activityKind: 'puzzle', activity: 'Repeat the pattern of taps on the table.' }
      ),
    ],

    // ── Room 8: The Crystal Cavern ─────────────────────────────────────────
    'room-crystals': [
      scene(
        'room-crystals',
        'default',
        always,
        'Giant glowing crystals fill the cavern, pulsing with blue and purple light. A riddle of light is carved into the central stone.',
        [
          {
            id: 'c1',
            label: 'Solve the light puzzle with logic',
            stat: 'int',
            requiresRoll: true,
            target: 14,
            successText: 'You trace the beams of light through the crystals until they all focus on the exit. The cavern sings.',
            failureText: 'The light is blinding and you bump your head against a crystal shelf.',
            consequenceHp: 1,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Feel the vibrations of the crystals',
            stat: 'cha',
            requiresRoll: true,
            target: 13,
            successText: 'You hum along with the crystals until they vibrate in sympathy and the way forward opens.',
            failureText: 'The crystals are out of tune. The hum grows painful.',
            consequenceHp: 1,
            advancesQuest: true,
          },
        ],
      ),
    ],

    // ── Room 9: Goblin Snare ───────────────────────────────────────────────
    'room-goblin': [
      scene(
        'room-goblin',
        'default',
        always,
        'A goblin raider bursts from behind a log with a club. It charges before you can step around it.',
        [
          {
            id: 'c1',
            label: 'Hit it head-on',
            stat: 'str',
            requiresRoll: true,
            target: 11,
            successText: 'Your hit slams through its guard and drives it backward.',
            failureText: 'You swing wide, and the goblin cracks you in the side.',
            consequenceHp: 2,
          },
          {
            id: 'c2',
            label: 'Flank and trip it',
            stat: 'dex',
            requiresRoll: true,
            target: 11,
            successText: 'You cut around the shield side and sweep its legs out.',
            failureText: 'The goblin reads the move and shoulder-checks you away hard.',
            consequenceHp: 2,
          },
        ],
      ),
    ],

    // ── Room 10: The Singing Door ───────────────────────────────────────────
    'room-riddle': [
      scene(
        'room-riddle',
        'default',
        always,
        'The Singing Door clears its throat: "I am kept by giving away. What am I?" A wizard stands nearby, curious.',
        [
          {
            id: 'c1',
            label: 'Answer: a promise',
            stat: 'int',
            requiresRoll: true,
            target: 13,
            successText: 'The door beams. "Walk through, friend." It swings wide to starlight.',
            failureText: '"Almost. Keep thinking." The door hums politely.',
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Sing the answer',
            stat: 'cha',
            requiresRoll: true,
            target: 12,
            successText: 'The door has never been sung to before. It opens at once, delighted.',
            failureText: '"I appreciate the effort. But I need the word."',
            advancesQuest: true,
          },
        ],
      ),
    ],

    // ── Room 11: Starlight Clearing (rest) ──────────────────────────────────
    'room-rest2': [
      scene(
        'room-rest2',
        'default',
        always,
        'Starlight Clearing. A small spring bubbles with water that smells faintly of tea. A fox watches from the edge of the light.',
        [
          {
            id: 'c1',
            label: 'Drink from the spring',
            requiresRoll: false,
            successText: 'Warm tea-water fills you. The whole party recovers.',
            failureText: '',
            rewardHp: 4,
            advancesQuest: true,
          },
          {
            id: 'c2',
            label: 'Sleep under the stars',
            requiresRoll: false,
            successText: 'You wake with clear heads and 3 gold left on your cloaks.',
            failureText: '',
            rewardGold: 3,
            rewardHp: 2,
            advancesQuest: true,
          },
        ],
      ),
    ],

    // ── Room 12: The Thorned King (Boss) ────────────────────────────────────
    'room-boss-long': [
      scene(
        'room-boss-long',
        'default',
        always,
        'The Thorned King stands between your party and the last path home. The thorn-crown pulses with trapped magic.',
        [
          {
            id: 'c1',
            label: 'Strike the crown with everything',
            stat: 'str',
            requiresRoll: true,
            target: 15,
            successText: 'Your hit lands square on the crown and it shatters. He stands free.',
            failureText: 'He catches your strike and lashes vines across your guard hard.',
            consequenceHp: 4,
          },
          {
            id: 'c2',
            label: 'Speak to him — say why you came',
            stat: 'cha',
            requiresRoll: true,
            target: 13,
            successText: 'You tell him about the valley going quiet. He lowers his blade. "Then finish it," he says.',
            failureText: 'He shakes his head. The vines tighten.',
            advancesQuest: true,
          },
        ],
      ),
    ],
  },
};
