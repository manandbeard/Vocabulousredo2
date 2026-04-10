import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FlaskConical, BookOpen, ChevronRight, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { analyticsApi } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const MASTERY_COLORS = { mastered: 'text-tertiary bg-tertiary/10', learning: 'text-primary bg-primary/10', new: 'text-secondary bg-secondary/10' };

export default function StudentResearch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!user) return;
    analyticsApi.researchDecks(user.id).then(setDecks).catch(() => []).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="w-8 h-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin" /></div>;

  const filtered = decks.filter(d =>
    !filter || d.deck_name.toLowerCase().includes(filter.toLowerCase()) || d.tags.some(t => t.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show" data-testid="student-research">
      <motion.div variants={fadeUp}>
        <p className="label-md text-primary mb-2 flex items-center gap-2"><FlaskConical className="w-4 h-4" /> Research Library</p>
        <h1 className="headline-lg text-on-surface">Practice any deck freely</h1>
        <p className="body-md mt-1">Browse and practice cards from all your enrolled classes. No progress is saved in practice mode.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input
          type="text" value={filter} onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by deck name or tag..."
          className="input-ethereal pl-12" data-testid="research-search"
        />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((deck) => (
          <div key={deck.deck_id} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6 card-ethereal" data-testid={`research-deck-${deck.deck_id}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-on-surface">{deck.deck_name}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{deck.class_name}</p>
              </div>
              <span className={`label-sm px-2.5 py-1 rounded-full ${MASTERY_COLORS[deck.mastery_level]}`}>
                {deck.mastery_level}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm text-on-surface-variant">{deck.card_count} cards</span>
              <div className="flex-1 h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.round(deck.mastery_pct * 100)}%`, background: 'linear-gradient(135deg, #8b6cc1, #7cc5a8)' }} />
              </div>
              <span className="label-sm text-[10px]">{Math.round(deck.mastery_pct * 100)}%</span>
            </div>

            {deck.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {deck.tags.slice(0, 4).map(t => (
                  <span key={t} className="label-sm text-[10px] text-primary bg-primary/8 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate(`/student/study?deckId=${deck.deck_id}&mode=research`)}
              className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2.5"
              data-testid={`practice-deck-${deck.deck_id}`}
            >
              <FlaskConical className="w-4 h-4" /> Practice
            </button>
          </div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-12 text-center">
          <BookOpen className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
          <p className="font-bold text-on-surface">{decks.length === 0 ? 'No decks available' : 'No matching decks'}</p>
          <p className="body-md text-sm mt-1">{decks.length === 0 ? 'Enroll in a class to access decks.' : 'Try a different search term.'}</p>
        </div>
      )}
    </motion.div>
  );
}
