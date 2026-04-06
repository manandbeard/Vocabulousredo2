import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetDueCards, useSubmitReview, getGetDueCardsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, RotateCcw, Frown, Smile, ThumbsUp, Medal, ArrowLeft } from "lucide-react";

export default function StudentStudy() {
  const { userId } = useRole();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: cards, isLoading } = useGetDueCards(userId);
  const submitReviewMut = useSubmitReview();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards?.[currentIndex];

  useEffect(() => {
    if (!isFlipped && currentCard) {
      // reset flip state when navigating to a new card
    }
  }, [currentIndex, isFlipped, currentCard]);

  const handleGrade = async (grade: number) => {
    if (!currentCard) return;
    try {
      await submitReviewMut.mutateAsync({
        data: {
          studentId: userId,
          cardId: currentCard.cardId,
          deckId: currentCard.deckId,
          grade,
          // elapsedDays is computed server-side from cardStatesTable.lastReviewedAt;
          // the field is kept in the request body for API compatibility but ignored
          // by the server when computing the actual inter-review interval.
          elapsedDays: 0,
        }
      });
      setIsFlipped(false);
      setTimeout(() => {
        if (cards && currentIndex < cards.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          queryClient.invalidateQueries({ queryKey: getGetDueCardsQueryKey(userId) });
          setLocation("/student/progress");
        }
      }, 200);
    } catch (err) {
      console.error("Failed to submit review", err);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!cards || cards.length === 0 || currentIndex >= cards.length) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in duration-700 font-['Inter']">
          <div className="h-28 w-28 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
            <CheckCircle2 className="h-14 w-14" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">You're all caught up!</h2>
          <p className="text-slate-500 mt-3 text-lg max-w-md text-center font-light">
            You've completed all your due reviews for today. Check back tomorrow or view your progress.
          </p>
          <button
            onClick={() => setLocation("/student/progress")}
            className="mt-8 px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors"
          >
            View My Progress
          </button>
        </div>
      </AppLayout>
    );
  }

  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-8 font-['Inter']">
        {/* Nav bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setLocation("/student")}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Exit Session
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
              {currentIndex + 1} / {cards.length}
            </span>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Flashcard — swipe-away card transition + 3D bounce flip */}
        <div className="overflow-hidden rounded-3xl mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.cardId}
            initial={{ x: "110%", opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-110%", opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.9 }}
            className="relative h-[380px] w-full"
            style={{ perspective: "1200px" }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, mass: 1 }}
              style={{ transformStyle: "preserve-3d", width: "100%", height: "100%", position: "relative" }}
            >
              {/* Front face — question */}
              <div
                className="absolute inset-0 w-full h-full rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col p-10 items-center justify-center text-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                <h2 className="text-3xl md:text-4xl font-bold leading-tight text-slate-900 tracking-tight">
                  {currentCard.front}
                </h2>
              </div>
              {/* Back face — answer */}
              <div
                className="absolute inset-0 w-full h-full rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col p-10 items-center justify-center text-center"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5 border-b border-slate-100 pb-2 inline-block px-4">
                  Answer
                </div>
                <h2 className="text-2xl md:text-3xl font-medium leading-relaxed text-slate-900">
                  {currentCard.back}
                </h2>
                {currentCard.hint && (
                  <p className="mt-8 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                    Hint: {currentCard.hint}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="mt-10 flex justify-center">
          {!isFlipped ? (
            <button
              onClick={() => setIsFlipped(true)}
              className="px-12 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold transition-all hover:-translate-y-0.5 shadow-sm"
            >
              Show Answer
            </button>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full animate-in slide-in-from-bottom-4 fade-in duration-300">
              <button
                onClick={() => handleGrade(1)}
                className="h-20 rounded-2xl border border-red-200 hover:bg-red-50 hover:border-red-400 flex flex-col gap-1 items-center justify-center text-sm transition-all group"
              >
                <Frown className="h-5 w-5 text-red-400 group-hover:text-red-600" />
                <span className="font-bold text-slate-900">Again</span>
                <span className="text-[10px] text-slate-400">&lt; 1m</span>
              </button>
              <button
                onClick={() => handleGrade(2)}
                className="h-20 rounded-2xl border border-orange-200 hover:bg-orange-50 hover:border-orange-400 flex flex-col gap-1 items-center justify-center text-sm transition-all group"
              >
                <RotateCcw className="h-5 w-5 text-orange-400 group-hover:text-orange-600" />
                <span className="font-bold text-slate-900">Hard</span>
                <span className="text-[10px] text-slate-400">1.2d</span>
              </button>
              <button
                onClick={() => handleGrade(3)}
                className="h-20 rounded-2xl border border-blue-200 hover:bg-blue-50 hover:border-blue-400 flex flex-col gap-1 items-center justify-center text-sm transition-all group"
              >
                <Smile className="h-5 w-5 text-blue-400 group-hover:text-blue-600" />
                <span className="font-bold text-slate-900">Good</span>
                <span className="text-[10px] text-slate-400">2.5d</span>
              </button>
              <button
                onClick={() => handleGrade(4)}
                className="h-20 rounded-2xl border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400 flex flex-col gap-1 items-center justify-center text-sm transition-all group"
              >
                <Medal className="h-5 w-5 text-emerald-400 group-hover:text-emerald-600" />
                <span className="font-bold text-slate-900">Easy</span>
                <span className="text-[10px] text-slate-400">4d</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
