import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BookOpen, Plus, ChevronRight, Copy, Check, Layers } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { classesApi, decksApi } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function TeacherClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [classDecks, setClassDecks] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', subject: '' });
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchData = async () => {
    if (!user) return;
    try {
      const cls = await classesApi.list(user.id);
      setClasses(cls);
      const decksByClass = {};
      for (const c of cls) {
        const d = await decksApi.list({ class_id: c.id }).catch(() => []);
        decksByClass[c.id] = d;
      }
      setClassDecks(decksByClass);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await classesApi.create({ ...form, teacher_id: user.id });
      setForm({ name: '', description: '', subject: '' });
      setShowCreate(false);
      fetchData();
    } catch (err) { console.error(err); }
    setCreating(false);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Create Deck inline
  const [showDeckForm, setShowDeckForm] = useState(null);
  const [deckForm, setDeckForm] = useState({ name: '', description: '' });
  const [creatingDeck, setCreatingDeck] = useState(false);

  const handleCreateDeck = async (e, classId) => {
    e.preventDefault();
    setCreatingDeck(true);
    try {
      await decksApi.create({ name: deckForm.name, description: deckForm.description, class_id: classId, teacher_id: user.id });
      setDeckForm({ name: '', description: '' });
      setShowDeckForm(null);
      fetchData();
    } catch (err) { console.error(err); }
    setCreatingDeck(false);
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="w-8 h-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin" /></div>;

  return (
    <motion.div className="space-y-8" variants={stagger} initial="hidden" animate="show" data-testid="teacher-classes">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <p className="label-md text-secondary mb-2">Classes</p>
          <h1 className="headline-lg text-on-surface">Manage your classes</h1>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2 text-sm" data-testid="create-class-btn">
          <Plus className="w-4 h-4" /> New Class
        </button>
      </motion.div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6">
          <h3 className="font-bold text-on-surface mb-4">Create New Class</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label-sm block mb-2">Class Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-ethereal" placeholder="e.g. AP Chemistry" data-testid="class-name-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-sm block mb-2">Subject</label>
                <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-ethereal" placeholder="e.g. Chemistry" data-testid="class-subject-input" />
              </div>
              <div>
                <label className="label-sm block mb-2">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-ethereal" placeholder="Optional" data-testid="class-desc-input" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary text-sm" data-testid="submit-class-btn">{creating ? 'Creating...' : 'Create Class'}</button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Classes with Decks */}
      <div className="space-y-6">
        {classes.map((cls) => {
          const decks = classDecks[cls.id] || [];
          return (
            <motion.div key={cls.id} variants={fadeUp} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient overflow-hidden" data-testid={`class-item-${cls.id}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <span className="label-sm text-on-surface-variant">{cls.subject}</span>
                    <h3 className="text-lg font-bold text-on-surface mt-1">{cls.name}</h3>
                    {cls.description && <p className="text-sm text-on-surface-variant mt-0.5">{cls.description}</p>}
                  </div>
                  {/* Class Code */}
                  {cls.class_code && (
                    <button
                      onClick={() => copyCode(cls.class_code)}
                      className="flex items-center gap-2 bg-primary/8 px-3 py-1.5 rounded-full transition-all hover:bg-primary/15"
                      data-testid={`class-code-${cls.id}`}
                    >
                      <span className="label-sm text-primary tracking-[0.15em]">{cls.class_code}</span>
                      {copiedCode === cls.class_code ? <Check className="w-3.5 h-3.5 text-tertiary" /> : <Copy className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-sm text-on-surface-variant"><Users className="w-3.5 h-3.5" /> {cls.enrollment_count} students</span>
                  <span className="flex items-center gap-1.5 text-sm text-on-surface-variant"><Layers className="w-3.5 h-3.5" /> {decks.length} decks</span>
                </div>
              </div>

              {/* Decks within class */}
              <div className="bg-surface-container-low px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="label-sm text-on-surface-variant">Decks</p>
                  <button onClick={() => setShowDeckForm(showDeckForm === cls.id ? null : cls.id)} className="label-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors" data-testid={`add-deck-btn-${cls.id}`}>
                    <Plus className="w-3 h-3" /> Add Deck
                  </button>
                </div>

                {showDeckForm === cls.id && (
                  <form onSubmit={(e) => handleCreateDeck(e, cls.id)} className="flex gap-3 mb-3">
                    <input type="text" value={deckForm.name} onChange={(e) => setDeckForm({ ...deckForm, name: e.target.value })} required className="input-ethereal flex-1 py-2 text-sm" placeholder="Deck name" data-testid={`deck-name-input-${cls.id}`} />
                    <button type="submit" disabled={creatingDeck} className="btn-primary text-xs py-2 px-4" data-testid={`submit-deck-btn-${cls.id}`}>{creatingDeck ? '...' : 'Add'}</button>
                  </form>
                )}

                {decks.length > 0 ? (
                  <div className="space-y-2">
                    {decks.map((deck) => (
                      <Link key={deck.id} to={`/teacher/decks/${deck.id}`} data-testid={`deck-link-${deck.id}`}>
                        <div className="flex items-center justify-between bg-surface-container-lowest rounded-2xl px-4 py-3 hover:shadow-ambient transition-all group cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-on-surface">{deck.name}</p>
                              <p className="text-xs text-on-surface-variant">{deck.card_count} cards</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-on-surface transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant">No decks yet. Add one to start creating cards.</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {classes.length === 0 && !showCreate && (
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-12 text-center">
          <Users className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
          <h3 className="font-bold text-on-surface">No classes yet</h3>
          <p className="body-md text-sm mt-2">Create your first class to start organizing your content.</p>
        </div>
      )}
    </motion.div>
  );
}
