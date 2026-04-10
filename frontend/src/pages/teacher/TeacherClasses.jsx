import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { classesApi, decksApi } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function TeacherClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', subject: '' });
  const [creating, setCreating] = useState(false);

  const fetchClasses = () => {
    if (!user) return;
    classesApi.list(user.id).then(setClasses).catch(() => []).finally(() => setLoading(false));
  };

  useEffect(fetchClasses, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await classesApi.create({ ...form, teacher_id: user.id });
      setForm({ name: '', description: '', subject: '' });
      setShowCreate(false);
      fetchClasses();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

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

      {/* Create form */}
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
              <button type="submit" disabled={creating} className="btn-primary text-sm" data-testid="submit-class-btn">
                {creating ? 'Creating...' : 'Create Class'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Classes List */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient overflow-hidden card-ethereal group" data-testid={`class-item-${cls.id}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="label-sm text-on-surface-variant">{cls.subject}</span>
                <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-on-surface transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">{cls.name}</h3>
              {cls.description && <p className="text-sm text-on-surface-variant mt-1">{cls.description}</p>}
            </div>
            <div className="px-6 py-3 bg-surface-container-low flex items-center gap-6">
              <span className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                <Users className="w-3.5 h-3.5" /> {cls.enrollment_count} students
              </span>
              <span className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                <BookOpen className="w-3.5 h-3.5" /> {cls.deck_count} decks
              </span>
            </div>
          </div>
        ))}
      </motion.div>

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
