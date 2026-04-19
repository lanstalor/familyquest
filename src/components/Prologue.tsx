import { getClass } from '../game/classes';
import type {
  Player,
  Quest,
  StoryAnswer,
  StoryQuestion,
  StoryQuestionOption,
} from '../types';

interface Props {
  quest: Quest;
  players: Player[];
  storyQuestions: StoryQuestion[];
  storyAnswers: StoryAnswer[];
  loadingQuestions: boolean;
  note?: string;
  onAnswer: (question: StoryQuestion, option: StoryQuestionOption) => void;
  onBegin: () => void;
}

export function Prologue({
  quest,
  players,
  storyQuestions,
  storyAnswers,
  loadingQuestions,
  note,
  onAnswer,
  onBegin,
}: Props) {
  const partyNames = players.map((p) => p.name).join(' and ');
  const answeredIds = new Set(storyAnswers.map((answer) => answer.questionId));
  const nextQuestion = storyQuestions.find((question) => !answeredIds.has(question.id));
  const readyToBegin =
    storyQuestions.length > 0 && storyAnswers.length >= storyQuestions.length;

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 no-print scanlines">
      <section className="pixel-panel p-6 sm:p-8">
        <div className="font-display text-[10px] text-coin tracking-widest">
          FAMILY STORY SETUP
        </div>
        <h1 className="font-display text-xl sm:text-2xl mt-3 leading-snug">
          {quest.name.toUpperCase()}
        </h1>
        <p className="font-pixel text-2xl mt-3 text-ink-muted italic">
          {quest.theme}
        </p>
        <div className="dialogue-box mt-6">
          {quest.briefing.map((line) => (
            <p key={line} className="font-pixel text-2xl leading-snug mb-3 last:mb-0">
              {line}
            </p>
          ))}
        </div>
        <div className="mt-5 pixel-panel dark p-4">
          <div className="font-display text-[10px] text-coin tracking-widest">
            GM NOTE
          </div>
          <p className="font-pixel text-2xl mt-2">
            You read the options aloud. {partyNames} answer together, then the
            app folds those choices into the adventure.
          </p>
        </div>
      </section>

      <section className="mt-6 pixel-panel p-6 sm:p-8">
        <div className="font-display text-[10px] text-coin tracking-widest mb-4">
          BUILD THIS VERSION OF THE STORY
        </div>
        {loadingQuestions || storyQuestions.length === 0 ? (
          <div className="dialogue-box">
            <p className="font-pixel text-2xl">
              The narrator is preparing a few questions for Ben and Myla...
            </p>
          </div>
        ) : nextQuestion ? (
          <div className="pixel-panel dark p-5">
            <div className="font-display text-[10px] text-coin tracking-widest">
              ASK {nextQuestion.askedTo.toUpperCase()}
            </div>
            <p className="font-pixel text-3xl mt-4 leading-snug">
              {nextQuestion.prompt}
            </p>
            <div className="grid gap-4 md:grid-cols-2 mt-5">
              {nextQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onAnswer(nextQuestion, option)}
                  className="pixel-btn touch-big text-left justify-start px-5"
                >
                  <span className="flex flex-col items-start gap-2">
                    <span className="font-display text-[11px] leading-snug">
                      {option.label}
                    </span>
                    {option.detail && (
                      <span className="font-pixel text-xl normal-case">
                        {option.detail}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="pixel-panel dark p-5">
              <div className="font-display text-[10px] text-coin tracking-widest">
                YOUR STORY SO FAR
              </div>
              <ul className="mt-4 space-y-3 font-pixel text-2xl">
                {storyAnswers.map((answer) => (
                  <li key={answer.questionId} className="border-l-4 border-coin pl-3">
                    <span className="text-ink-muted">{answer.askedTo} chose:</span>{' '}
                    {answer.answerLabel}
                    {answer.answerDetail ? (
                      <span className="block text-ink-muted mt-1">
                        {answer.answerDetail}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pixel-panel p-4">
                <div className="font-display text-[10px] text-coin tracking-widest">
                  YOUR GOAL
                </div>
                <p className="font-pixel text-2xl mt-2">{quest.goal}</p>
              </div>
            </div>
            <div className="pixel-panel dark p-5">
              <div className="font-display text-[10px] text-coin tracking-widest mb-4">
                HOW TO RUN IT
              </div>
              <div className="space-y-4">
                <RuleCard
                  step="1"
                  title="Let Them Talk"
                  body={`Ask ${partyNames} to agree on a plan out loud before tapping a choice.`}
                />
                <RuleCard
                  step="2"
                  title="Share The Spotlight"
                  body="One hero acts, but the other can suggest clues, sounds, or helper ideas."
                />
                <RuleCard
                  step="3"
                  title="Keep It Moving"
                  body="When the result panel appears, use the big bottom button for the next room or next turn."
                />
              </div>
            </div>
          </div>
        )}
        {note && (
          <div className="mt-4 font-pixel text-lg text-hp italic">⚠ {note}</div>
        )}
      </section>

      <section className="mt-6 pixel-panel p-6 sm:p-8">
        <div className="font-display text-[10px] text-coin tracking-widest mb-4">
          PARTY ROLL CALL
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {players.map((player) => {
            const cls = getClass(player.classId);
            return (
              <div key={player.id} className="pixel-panel dark p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="sprite-frame"
                    style={{ background: player.color, color: '#f0f0e8' }}
                  >
                    {cls.emoji}
                  </div>
                  <div>
                    <div className="font-display text-[11px] leading-snug">
                      {player.name.toUpperCase()}
                    </div>
                    <div className="font-pixel text-xl text-ink-muted">
                      {cls.name}
                    </div>
                  </div>
                </div>
                <p className="font-pixel text-xl mt-4 italic">{cls.tagline}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 pixel-panel p-6 sm:p-8">
        <div className="font-display text-[10px] text-coin tracking-widest mb-4">
          HOW THIS WORKS
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <RuleCard
            step="1"
            title="Reveal The Room"
            body="The app sets the scene while your paper board keeps the map and tokens visible on the table."
          />
          <RuleCard
            step="2"
            title="Pick An Action"
            body="One hero acts at a time, but let the other hero help think before you choose."
          />
          <RuleCard
            step="3"
            title="Continue The Story"
            body="After the result panel appears, tap the big bottom button to move on or take the next turn in the same room."
          />
        </div>
        <button
          onClick={onBegin}
          disabled={!readyToBegin}
          className="pixel-btn primary w-full mt-6 py-6 text-lg"
        >
          ▶ ENTER THE VALLEY
        </button>
      </section>
    </main>
  );
}

function RuleCard({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="pixel-panel dark p-4">
      <div className="font-display text-[10px] text-coin tracking-widest">
        STEP {step}
      </div>
      <div className="font-display text-[11px] mt-3 leading-snug">
        {title.toUpperCase()}
      </div>
      <p className="font-pixel text-xl mt-3">{body}</p>
    </div>
  );
}
