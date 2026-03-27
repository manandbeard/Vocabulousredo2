import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetDueCards, useSubmitReview, getGetDueCardsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, RotateCcw, Frown, Smile, ThumbsUp, Medal, ArrowLeft } from "lucide-react";

export default function StudentStudy() {
  const { userId } = useRole();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // In a real app, parse URL params for deckId. We'll fetch all due cards for the student.
  const { data: cards, isLoading } = useGetDueCards(userId);
  const submitReviewMut = useSubmitReview();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  
  const currentCard = cards?.[currentIndex];

  useEffect(() => {
    if (!isFlipped && currentCard) {
      setStartTime(Date.now());
    }
  }, [currentIndex, isFlipped, currentCard]);

  const handleGrade = async (grade: number) => {
    if (!currentCard) return;
    
    // Calculate tiny fractional days for demo purposes
    const elapsedDays = (Date.now() - startTime) / (1000 * 60 * 60 * 24);
    
    try {
      await submitReviewMut.mutateAsync({
        data: {
          studentId: userId,
          cardId: currentCard.cardId,
          deckId: currentCard.deckId,
          grade,
          elapsedDays
        }
      });
      
      // Move to next card
      setIsFlipped(false);
      setTimeout(() => {
        if (cards && currentIndex < cards.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          // Finished session
          queryClient.invalidateQueries({ queryKey: getGetDueCardsQueryKey(userId) });
          setLocation("/student/progress");
        }
      }, 200);

    } catch (err) {
      console.error("Failed to submit review", err);
    }
  };

  if (isLoading) return <AppLayout><div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div></AppLayout>;

  if (!cards || cards.length === 0 || currentIndex >= cards.length) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in duration-700">
          <div className="h-32 w-32 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6">
            <CheckCircle2 className="h-16 w-16" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground">You're all caught up!</h2>
          <p className="text-muted-foreground mt-3 text-lg max-w-md text-center">
            You've completed all your due reviews for today. Check back tomorrow or view your progress.
          </p>
          <Button onClick={() => setLocation("/student/progress")} className="mt-8 rounded-xl px-8 h-12 text-md">
            View My Progress
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => setLocation("/student")} className="rounded-xl text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Exit Session
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Card {currentIndex + 1} of {cards.length}
            </div>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out" 
                style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="perspective-1000 relative h-[400px] w-full mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.cardId + (isFlipped ? "-back" : "-front")}
              initial={{ rotateX: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="w-full h-full rounded-3xl bg-card border border-border/60 shadow-xl shadow-black/5 flex flex-col p-10 items-center justify-center text-center">
                {!isFlipped ? (
                  <>
                    <h2 className="text-3xl md:text-4xl font-display font-medium leading-tight text-foreground">
                      {currentCard.front}
                    </h2>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 border-b border-border/50 pb-2 inline-block">Answer</div>
                    <h2 className="text-2xl md:text-3xl font-medium leading-relaxed text-foreground">
                      {currentCard.back}
                    </h2>
                    {currentCard.hint && (
                      <p className="mt-8 text-muted-foreground italic">Hint was: {currentCard.hint}</p>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex justify-center">
          {!isFlipped ? (
            <Button 
              size="lg" 
              onClick={() => setIsFlipped(true)}
              className="rounded-2xl px-12 h-14 text-lg font-bold shadow-lg shadow-primary/20 hover:-translate-y-1 transition-transform"
            >
              Show Answer
            </Button>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full animate-in slide-in-from-bottom-4 fade-in duration-300">
              <Button 
                onClick={() => handleGrade(1)} 
                variant="outline"
                className="h-20 rounded-2xl flex flex-col gap-1 border-destructive/20 hover:bg-destructive/10 hover:border-destructive hover:text-destructive group transition-all"
              >
                <Frown className="h-6 w-6 text-destructive/70 group-hover:text-destructive" />
                <span className="font-bold">Again</span>
                <span className="text-[10px] opacity-70">&lt; 1m</span>
              </Button>
              <Button 
                onClick={() => handleGrade(2)} 
                variant="outline"
                className="h-20 rounded-2xl flex flex-col gap-1 border-orange-500/20 hover:bg-orange-500/10 hover:border-orange-500 hover:text-orange-500 group transition-all"
              >
                <RotateCcw className="h-6 w-6 text-orange-500/70 group-hover:text-orange-500" />
                <span className="font-bold">Hard</span>
                <span className="text-[10px] opacity-70">1.2d</span>
              </Button>
              <Button 
                onClick={() => handleGrade(3)} 
                variant="outline"
                className="h-20 rounded-2xl flex flex-col gap-1 border-primary/20 hover:bg-primary/10 hover:border-primary hover:text-primary group transition-all"
              >
                <Smile className="h-6 w-6 text-primary/70 group-hover:text-primary" />
                <span className="font-bold">Good</span>
                <span className="text-[10px] opacity-70">2.5d</span>
              </Button>
              <Button 
                onClick={() => handleGrade(4)} 
                variant="outline"
                className="h-20 rounded-2xl flex flex-col gap-1 border-accent/20 hover:bg-accent/10 hover:border-accent hover:text-accent group transition-all"
              >
                <Medal className="h-6 w-6 text-accent/70 group-hover:text-accent" />
                <span className="font-bold">Easy</span>
                <span className="text-[10px] opacity-70">4d</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
