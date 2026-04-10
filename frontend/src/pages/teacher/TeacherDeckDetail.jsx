import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, BookOpen, ArrowLeft, X, Check, Tag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { decksApi, cardsApi } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function TeacherDeckDetail() {
  const { deckId } = useParams();
  const { user } = useAuth();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ front: '', back: '', hint: '', tags: '' });

  const fetchData = async () => {
    try {
      const [d, c] = await Promise.all([
        decksApi.get(Number(deckId)),
        cardsApi.listByDeck(Number(deckId)),
      ]);
      setDeck(d);
      setCards(c);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [deckId]);

  const resetForm = () => { setForm({ front: '', back: '', hint: '', tags: '' }); setShowCreate(false); setEditingId(null); };

  const handleCreate = async (e) => {
    e.preventDefault();
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    await cardsApi.create(Number(deckId), { front: form.front, back: form.back, hint: form.hint, tags });
    resetForm();
    fetchData();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    await cardsApi.update(editingId, { front: form.front, back: form.back, hint: form.hint, tags });
    resetForm();
    fetchData();
  };

  const startEdit = (card) => {
    setEditingId(card.id);
    setForm({ front: card.front, back: card.back, hint: card.hint || '', tags: (card.tags || []).join(', ') });
    setShowCreate(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this card?')) return;
    await cardsApi.delete(id);
    fetchData();
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="w-8 h-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin" /></div>;

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show" data-testid="teacher-deck-detail">
      <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
        <Link to="/teacher/classes" className="text-on-surface-variant hover:text-on-surface transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <p className="label-md text-primary mb-1">Deck Detail</p>
          <h1 className="headline-lg text-on-surface">{deck?.name || 'Deck'}</h1>
          {deck?.description && <p className="body-md text-sm mt-1">{deck.description}</p>}
        </div>
        <button onClick={() => { resetForm(); setShowCreate(true); }} className="btn-primary flex items-center gap-2 text-sm" data-testid="add-card-btn">
          <Plus className="w-4 h-4" /> Add Card
        </button>
      </motion.div>

      {/* Create / Edit Form */}
      {(showCreate || editingId) && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6" data-testid="card-form">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-on-surface">{editingId ? 'Edit Card' : 'New Card'}</h3>
            <button onClick={resetForm} className="text-on-surface-variant hover:text-on-surface"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-4">
            <div>
              <label className="label-sm block mb-2">Front (Question)</label>
              <textarea value={form.front} onChange={(e) => setForm({ ...form, front: e.target.value })} required rows={2}
                className="input-ethereal !rounded-2xl resize-none" placeholder="What is the question?" data-testid="card-front-input" />
            </div>
            <div>
              <label className="label-sm block mb-2">Back (Answer)</label>
              <textarea value={form.back} onChange={(e) => setForm({ ...form, back: e.target.value })} required rows={2}
                className="input-ethereal !rounded-2xl resize-none" placeholder="What is the answer?" data-testid="card-back-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-sm block mb-2">Hint (optional)</label>
                <input value={form.hint} onChange={(e) => setForm({ ...form, hint: e.target.value })}
                  className="input-ethereal" placeholder="A helpful clue" data-testid="card-hint-input" />
              </div>
              <div>
                <label className="label-sm block mb-2">Tags (comma separated)</label>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="input-ethereal" placeholder="biology, cells" data-testid="card-tags-input" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary text-sm" data-testid="save-card-btn">
                {editingId ? 'Save Changes' : 'Create Card'}
              </button>
              <button type="button" onClick={resetForm} className="btn-ghost text-sm">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Cards List */}
      <motion.div variants={fadeUp} className="space-y-3">
        <p className="label-md text-on-surface-variant">{cards.length} Cards</p>
        {cards.map((card, i) => (
          <motion.div key={card.id} variants={fadeUp}
            className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-5 card-ethereal group" data-testid={`card-item-${card.id}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="label-sm text-on-surface-variant">#{i + 1}</span>
                  {(card.tags || []).map(t => (
                    <span key={t} className="inline-flex items-center gap-1 label-sm text-[10px] text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                      <Tag className="w-2.5 h-2.5" />{t}
                    </span>
                  ))}
                </div>
                <p className="font-semibold text-on-surface">{card.front}</p>
                <p className="text-sm text-on-surface-variant mt-1">{card.back}</p>
                {card.hint && <p className="text-xs text-primary mt-1 italic">Hint: {card.hint}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => startEdit(card)} className="p-2 rounded-full hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all" data-testid={`edit-card-${card.id}`}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(card.id)} className="p-2 rounded-full hover:bg-red-50 text-on-surface-variant hover:text-red-500 transition-all" data-testid={`delete-card-${card.id}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {cards.length === 0 && (
          <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-12 text-center">
            <BookOpen className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
            <p className="font-bold text-on-surface">No cards yet</p>
            <p className="body-md text-sm mt-1">Add your first card to this deck.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
