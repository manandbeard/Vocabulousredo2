import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Send, BookOpen, CheckCircle2, AlertCircle, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { analyticsApi, blurtingApi } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function StudentBlurting() {
  const { user } = useAuth();
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [content, setContent] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      analyticsApi.researchDecks(user.id).catch(() => []),
      blurtingApi.list(user.id).catch(() => []),
    ]).then(([d, h]) => {
      setDecks(d);
      setHistory(h);
      if (d.length > 0) setSelectedDeck(d[0].deck_id);
      setLoading(false);
    });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeck || !content.trim()) return;
    setSubmitting(true);
    try {
      const res = await blurtingApi.create({
        student_id: user.id,
        deck_id: selectedDeck,
        content: content.trim(),
      });
      setResult(res);
      setContent('');
      const updated = await blurtingApi.list(user.id).catch(() => []);
      setHistory(updated);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="w-8 h-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin" /></div>;

  const selectedDeckInfo = decks.find(d => d.deck_id === selectedDeck);

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show" data-testid="student-blurting">
      <motion.div variants={fadeUp}>
        <p className="label-md text-primary mb-2 flex items-center gap-2"><Brain className="w-4 h-4" /> Blurting Exercise</p>
        <h1 className="headline-lg text-on-surface">Write everything you know</h1>
        <p className="body-md mt-1">Pick a deck, then write down everything you remember. We'll analyze what you covered and what you missed.</p>
      </motion.div>

      {/* Deck Selector */}
      <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6">
        <label className="label-sm block mb-3">Select a Deck</label>
        <div className="relative">
          <select
            value={selectedDeck || ''}
            onChange={(e) => { setSelectedDeck(Number(e.target.value)); setResult(null); }}
            className="input-ethereal appearance-none pr-10 cursor-pointer"
            data-testid="blurting-deck-select"
          >
            {decks.map(d => (
              <option key={d.deck_id} value={d.deck_id}>{d.deck_name} ({d.class_name}) — {d.card_count} cards</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
        </div>
      </motion.div>

      {/* Writing Area */}
      <motion.div variants={fadeUp}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6">
            <label className="label-sm block mb-3">
              Your Knowledge Dump {selectedDeckInfo && <span className="text-primary">— {selectedDeckInfo.deck_name}</span>}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="input-ethereal !rounded-2xl resize-none text-base leading-relaxed"
              placeholder="Start writing everything you remember about this topic... Don't worry about being perfect, just get your thoughts out."
              data-testid="blurting-textarea"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-on-surface-variant">{content.split(/\s+/).filter(Boolean).length} words</span>
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="btn-primary flex items-center gap-2 text-sm"
                data-testid="blurting-submit-btn"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </span>
                ) : (
                  <><Send className="w-4 h-4" /> Analyze</>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Result */}
      {result && (
        <motion.div variants={fadeUp} className="space-y-4" data-testid="blurting-result">
          <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6">
            <p className="label-md text-primary mb-3">Results — {result.deck_name}</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className={`text-3xl font-extrabold ${result.coverage >= 0.5 ? 'text-tertiary' : result.coverage >= 0.25 ? 'text-secondary' : 'text-red-500'}`}>
                  {Math.round(result.coverage * 100)}%
                </p>
                <p className="label-sm mt-1">Coverage</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-primary">{result.matched_terms}</p>
                <p className="label-sm mt-1">Terms Matched</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-on-surface">{result.total_terms}</p>
                <p className="label-sm mt-1">Total Terms</p>
              </div>
            </div>

            {/* Coverage bar */}
            <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden mb-4">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.round(result.coverage * 100)}%`, background: 'linear-gradient(135deg, #8b6cc1, #7cc5a8)' }} />
            </div>

            <p className="text-sm text-on-surface-variant">
              {result.coverage >= 0.7 ? 'Excellent recall! You have strong command of this material.' :
               result.coverage >= 0.4 ? 'Good effort! Review the missed cards below to fill the gaps.' :
               'Keep practicing! Focus on the cards you missed to strengthen your recall.'}
            </p>
          </div>

          {/* Missed Cards */}
          {result.missed_cards?.length > 0 && (
            <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6">
              <p className="label-sm text-secondary mb-3 flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5" /> Cards You Might Have Missed</p>
              <div className="space-y-2">
                {result.missed_cards.map((card) => (
                  <div key={card.card_id} className="bg-surface-container-low rounded-2xl p-4">
                    <p className="font-semibold text-on-surface text-sm">{card.front}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{card.back}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* History */}
      {history.length > 0 && (
        <motion.div variants={fadeUp}>
          <p className="label-md text-on-surface-variant mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Past Sessions</p>
          <div className="space-y-3">
            {history.map((session) => (
              <div key={session.id} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-5 card-ethereal" data-testid={`blurting-history-${session.id}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-on-surface">{session.deck_name}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {new Date(session.created_at).toLocaleDateString()} — {session.matched_terms}/{session.total_terms} terms
                    </p>
                  </div>
                  <div className={`text-2xl font-extrabold ${session.coverage >= 0.5 ? 'text-tertiary' : 'text-secondary'}`}>
                    {Math.round(session.coverage * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {decks.length === 0 && (
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-12 text-center">
          <BookOpen className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
          <p className="font-bold text-on-surface">No decks available</p>
          <p className="body-md text-sm mt-1">Enroll in a class to start blurting exercises.</p>
        </div>
      )}
    </motion.div>
  );
}
