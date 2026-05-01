/**
 * Student Feed — Mobile-first game feed
 *
 * A vertical swipe-feed of due concepts / bounty flicks / social events.
 * The FSRS-powered spaced repetition is "disguised" as a social Jigsaw puzzle feed.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDueCards } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useMomentumStore, TIER_META } from "@/stores/momentum-store";
import { useMemoryBankStore, GRADE_POINTS } from "@/stores/memory-bank-store";
import { useCoyoteStore } from "@/stores/coyote-store";
import {
  Flame,
  Zap,
  ArrowUp,
  ArrowDown,
  Send,
  Clock,
  BookOpen,
} from "lucide-react";

/** How many pixels of drag constitute a definitive swipe */
const SWIPE_THRESHOLD = 60;

type FeedCard =
  | { type: "concept"; cardId: number; deckId: number; front: string; back: string; hint?: string }
  | { type: "bounty_incoming"; bountyId: number; fromAlias: string; front: string; back: string; conceptId: number }
  | { type: "streak_milestone"; streakDays: number };

export default function StudentFeed() {
  const { userId } = useRole();
  const [, setLocation] = useLocation();
  const safeUserId = userId ?? 0;

  const { data: dueCards } = useGetDueCards(safeUserId);
  const { tier, multiplier, streakDays } = useMomentumStore();
  const { awardPoints, totalPoints, spentPoints } = useMemoryBankStore();
  const { isPending: isCoyotePending, startBuffer, cancelBuffer, remainingMs } = useCoyoteStore();

  const [index, setIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const tierMeta = TIER_META[tier];
  const balance  = totalPoints - spentPoints;

  // Build a unified feed: milestone card first if streak is a milestone, then concepts
  const feed: FeedCard[] = [];
  if (streakDays > 0 && streakDays % 5 === 0) {
    feed.push({ type: "streak_milestone", streakDays });
  }
  (dueCards ?? []).slice(0, 20).forEach((c) =>
    feed.push({ type: "concept", cardId: c.cardId, deckId: c.deckId, front: c.front, back: c.back, hint: c.hint ?? undefined }),
  );

  const currentCard = feed[index];

  function advanceCard() {
    setIsRevealed(false);
    setTimeout(() => setIndex((i) => Math.min(i + 1, feed.length - 1)), 150);
  }

  function handleSwipe(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (!isRevealed || currentCard?.type !== "concept") return;
    const grade = info.offset.y < -SWIPE_THRESHOLD ? 4 /* Easy */ : info.offset.y > SWIPE_THRESHOLD ? 1 /* Again */ : null;
    if (!grade) return;
    if (grade === 1) {
      startBuffer(() => {
        awardPoints(GRADE_POINTS[1]!, "Feed swipe: Again", multiplier);
        advanceCard();
      }, 1);
    } else {
      awardPoints(GRADE_POINTS[grade]!, `Feed swipe: grade ${grade}`, multiplier);
      advanceCard();
    }
  }

  if (feed.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4 text-center px-8">
          <BookOpen className="h-12 w-12 text-slate-300" />
          <h2 className="text-2xl font-bold text-slate-900">All caught up!</h2>
          <p className="text-slate-500">No cards due. Great work — check back tomorrow.</p>
          <button
            onClick={() => setLocation("/student")}
            className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-sm mx-auto py-6 font-['Inter']">
        {/* Top HUD */}
        <div className="flex items-center justify-between mb-5 px-1">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600">
            <Flame className="h-4 w-4 text-orange-400" />
            {streakDays}d
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold">
            <span>{tierMeta.emoji}</span>
            <span className={tierMeta.color}>{tierMeta.label}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">{multiplier}×</span>
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
            <Zap className="h-4 w-4" />
            {balance.toLocaleString()} pts
          </span>
        </div>

        {/* Card feed */}
        <div className="relative h-[500px] overflow-hidden rounded-3xl">
          <AnimatePresence mode="wait">
            {currentCard && (
              <motion.div
                key={index}
                drag={isRevealed && currentCard.type === "concept" ? "y" : false}
                dragConstraints={{ top: -80, bottom: 80 }}
                onDragEnd={handleSwipe}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="absolute inset-0"
              >
                {currentCard.type === "streak_milestone" ? (
                  <StreakMilestoneCard days={currentCard.streakDays} onNext={advanceCard} />
                ) : currentCard.type === "concept" ? (
                  <ConceptCard
                    card={currentCard}
                    isRevealed={isRevealed}
                    onReveal={() => setIsRevealed(true)}
                    isCoyotePending={isCoyotePending}
                    remainingMs={remainingMs}
                    onCancel={cancelBuffer}
                  />
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Swipe hints */}
        {isRevealed && currentCard?.type === "concept" && (
          <div className="flex justify-between mt-4 px-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1"><ArrowDown className="h-3 w-3 text-red-400" /> Swipe down = Again</span>
            <span className="flex items-center gap-1">Swipe up = Easy <ArrowUp className="h-3 w-3 text-emerald-400" /></span>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {feed.slice(0, 10).map((_, i) => (
            <span
              key={i}
              className={`inline-block h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-slate-700" : "w-1.5 bg-slate-300"}`}
            />
          ))}
        </div>

        {/* Bounty Flick shortcut */}
        <button
          onClick={() => setLocation("/student/bounty")}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Send className="h-4 w-4" /> Send a Bounty Flick
        </button>
      </div>
    </AppLayout>
  );
}

function ConceptCard({
  card,
  isRevealed,
  onReveal,
  isCoyotePending,
  remainingMs,
  onCancel,
}: {
  card: Extract<FeedCard, { type: "concept" }>;
  isRevealed: boolean;
  onReveal: () => void;
  isCoyotePending: boolean;
  remainingMs: number;
  onCancel: () => void;
}) {
  return (
    <div className="h-full w-full rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col p-8 items-center justify-center text-center relative">
      {!isRevealed ? (
        <>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Concept</p>
          <h2 className="text-2xl font-bold text-slate-900 leading-snug">{card.front}</h2>
          <button
            onClick={onReveal}
            className="mt-8 px-8 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            Reveal Answer
          </button>
          <p className="mt-4 text-xs text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Swipe to grade after revealing
          </p>
        </>
      ) : (
        <>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Answer</p>
          <h2 className="text-xl font-medium text-slate-900 leading-relaxed">{card.back}</h2>
          {card.hint && (
            <p className="mt-4 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">{card.hint}</p>
          )}

          {/* Coyote Time undo toast */}
          <AnimatePresence>
            {isCoyotePending && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-6 left-4 right-4 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-red-50 border border-red-200"
              >
                <span className="text-xs font-semibold text-red-700">Logging "Again"…</span>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1 bg-red-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-red-400 rounded-full"
                      initial={{ width: "100%" }}
                      animate={{ width: `${(remainingMs / 500) * 100}%` }}
                      transition={{ ease: "linear" }}
                    />
                  </div>
                  <button onClick={onCancel} className="text-xs font-bold text-red-600">Undo</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

function StreakMilestoneCard({ days, onNext }: { days: number; onNext: () => void }) {
  const tierMeta = TIER_META[days >= 6 ? "crown" : days >= 3 ? "aura" : "spark"];
  return (
    <div className="h-full w-full rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
      <span className="text-6xl mb-4">{tierMeta.emoji}</span>
      <h2 className="text-2xl font-black text-slate-900">🎉 {days}-Day Streak!</h2>
      <p className="mt-2 text-slate-600 font-medium">You've reached <strong>{tierMeta.label}</strong> Vibe!</p>
      <button
        onClick={onNext}
        className="mt-6 px-8 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
      >
        Let's Go!
      </button>
    </div>
  );
}
