import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, RotateCcw, Frown, Smile, Medal, ArrowLeft, FlaskConical, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { reviewsApi, analyticsApi } from '@/lib/api';

export default function StudentStudy() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deckIdParam = searchParams.get('deckId');
  const isResearchMode = searchParams.get('mode') === 'research';

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (isResearchMode && deckIdParam) {
      analyticsApi.practiceCards(user.id, Number(deckIdParam))
        .then(setCards)
        .catch(() => setCards([]))
        .finally(() => setLoading(false));
    } else {
      reviewsApi.dueCards(user.id, deckIdParam ? Number(deckIdParam) : undefined)
        .then(setCards)
        .catch(() => setCards([]))
        .finally(() => setLoading(false));
    }
  }, [user, deckIdParam, isResearchMode]);

  const currentCard = cards[currentIndex];

  const handleGrade = async (grade) => {
    if (!currentCard) return;

    if (isResearchMode) {
      setIsFlipped(false);
      setTimeout(() => {
        if (currentIndex < cards.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          navigate('/student/research');
        }
      }, 200);
      return;
    }

    try {
      await reviewsApi.submit({
        student_id: user.id,
        card_id: currentCard.card_id,
        deck_id: currentCard.deck_id,
        grade,
      });
      setIsFlipped(false);
      setTimeout(() => {
        if (currentIndex < cards.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          navigate('/student/progress');
        }
      }, 200);
    } catch (err) {
      console.error('Failed to submit review', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!cards.length || currentIndex >= cards.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] animate-fade-in" data-testid="study-complete">
        <div className="w-28 h-28 rounded-full bg-tertiary/10 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-14 h-14 text-tertiary" />
        </div>
        <h2 className="headline-lg text-on-surface">{isResearchMode ? 'Practice complete!' : "You're all caught up!"}</h2>
        <p className="body-lg mt-3 max-w-md text-center">
          {isResearchMode
            ? "You've reviewed all the cards in this deck. No progress was saved."
            : 'All due reviews completed. Check back tomorrow or view your progress.'}
        </p>
        <button onClick={() => navigate(isResearchMode ? '/student/research' : '/student/progress')} className="btn-primary mt-8" data-testid="view-progress-btn">
          {isResearchMode ? 'Back to Research' : 'View My Progress'}
        </button>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="max-w-3xl mx-auto py-8" data-testid="study-session">
      {/* Research mode banner */}
      {isResearchMode && (
        <div className="mb-6 flex items-center gap-2 px-5 py-3 rounded-full bg-primary/8 text-primary text-sm font-semibold" data-testid="research-mode-banner">
          <FlaskConical className="w-4 h-4 shrink-0" />
          Practice Mode — no progress saved
        </div>
      )}

      {/* Nav bar */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(isResearchMode ? '/student/research' : '/student')} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors" data-testid="exit-session-btn">
          <ArrowLeft className="w-4 h-4" /> Exit Session
        </button>
        <div className="flex items-center gap-3">
          <span className="label-sm">{currentIndex + 1} / {cards.length}</span>
          <div className="w-32 h-2.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(135deg, #8b6cc1, #e8a87c)' }} />
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="overflow-hidden rounded-[2rem] mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.card_id}
            initial={{ x: '110%', opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-110%', opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28, mass: 0.9 }}
            className="relative h-[380px] w-full"
            style={{ perspective: '1200px' }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, mass: 1 }}
              style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
            >
              {/* Front */}
              <div className="absolute inset-0 w-full h-full rounded-[2rem] bg-surface-container-lowest shadow-float flex flex-col p-10 items-center justify-center text-center" style={{ backfaceVisibility: 'hidden' }} data-testid="card-front">
                <h2 className="headline-lg leading-tight text-on-surface">{currentCard.front}</h2>
              </div>
              {/* Back */}
              <div className="absolute inset-0 w-full h-full rounded-[2rem] bg-surface-container-lowest shadow-float flex flex-col p-10 items-center justify-center text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} data-testid="card-back">
                <div className="label-sm text-on-surface-variant mb-5">Answer</div>
                <h2 className="text-2xl font-medium leading-relaxed text-on-surface">{currentCard.back}</h2>
                {currentCard.hint && (
                  <p className="mt-6 text-sm text-primary bg-primary/5 px-4 py-2 rounded-full">Hint: {currentCard.hint}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col items-center gap-3">
        {!isFlipped ? (
          <div className="flex items-center gap-3">
            <button onClick={() => setIsFlipped(true)} className="btn-primary text-lg py-4 px-12" data-testid="show-answer-btn">Show Answer</button>
            <button
              onClick={() => navigate(`/student/coach?cardFront=${encodeURIComponent(currentCard.front)}&cardBack=${encodeURIComponent(currentCard.back)}&cardHint=${encodeURIComponent(currentCard.hint || '')}`)}
              className="btn-ghost flex items-center gap-2 py-4 px-5 text-sm"
              data-testid="ask-coach-btn"
            >
              <Sparkles className="w-4 h-4" /> Ask Coach
            </button>
          </div>
        ) : isResearchMode ? (
          <div className="w-full max-w-sm animate-slide-up">
            <button onClick={() => handleGrade(1)} className="w-full h-16 rounded-[2rem] bg-surface-container-lowest shadow-ambient hover:shadow-float flex items-center justify-center text-sm font-bold text-on-surface transition-all" data-testid="next-card-btn">
              Next Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 w-full animate-slide-up" data-testid="grade-buttons">
            {[
              { grade: 1, icon: Frown, label: 'Again', time: '< 1m', bg: 'hover:bg-red-50', ring: 'hover:ring-red-200', iconColor: 'text-red-400 group-hover:text-red-600' },
              { grade: 2, icon: RotateCcw, label: 'Hard', time: '1.2d', bg: 'hover:bg-secondary/10', ring: 'hover:ring-secondary/30', iconColor: 'text-secondary group-hover:text-secondary' },
              { grade: 3, icon: Smile, label: 'Good', time: '2.5d', bg: 'hover:bg-primary/10', ring: 'hover:ring-primary/30', iconColor: 'text-primary group-hover:text-primary' },
              { grade: 4, icon: Medal, label: 'Easy', time: '4d', bg: 'hover:bg-tertiary/10', ring: 'hover:ring-tertiary/30', iconColor: 'text-tertiary group-hover:text-tertiary' },
            ].map(({ grade, icon: Icon, label, time, bg, ring, iconColor }) => (
              <button
                key={grade}
                onClick={() => handleGrade(grade)}
                data-testid={`grade-${label.toLowerCase()}-btn`}
                className={`h-20 rounded-[2rem] bg-surface-container-lowest shadow-ambient ${bg} ${ring} hover:ring-2 flex flex-col gap-1 items-center justify-center text-sm transition-all group`}
              >
                <Icon className={`w-5 h-5 ${iconColor}`} />
                <span className="font-bold text-on-surface">{label}</span>
                <span className="label-sm text-[10px]">{time}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
