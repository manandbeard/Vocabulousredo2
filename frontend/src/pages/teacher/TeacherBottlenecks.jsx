import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Tag, BookOpen, ArrowDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { analyticsApi } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function TeacherBottlenecks() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    analyticsApi.teacherBottlenecks(user.id).then(setData).catch(() => null).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="w-8 h-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin" /></div>;

  if (!data) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
        <h2 className="headline-md text-on-surface">No data available</h2>
      </div>
    );
  }

  return (
    <motion.div className="space-y-8" variants={stagger} initial="hidden" animate="show" data-testid="teacher-bottlenecks">
      <motion.div variants={fadeUp}>
        <p className="label-md text-secondary mb-2">Content Bottlenecks</p>
        <h1 className="headline-lg text-on-surface">Where students struggle most</h1>
      </motion.div>

      {/* Tag Retention */}
      {data.tag_retention?.length > 0 && (
        <motion.div variants={fadeUp}>
          <p className="label-md text-on-surface-variant mb-4 flex items-center gap-2"><Tag className="w-4 h-4" /> Tag Retention</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.tag_retention.map((tag) => (
              <div key={tag.tag} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-5 card-ethereal" data-testid={`tag-${tag.tag}`}>
                <p className="font-bold text-on-surface capitalize">{tag.tag}</p>
                <p className={`text-2xl font-extrabold mt-1 ${tag.avg_recall >= 0.7 ? 'text-tertiary' : tag.avg_recall >= 0.4 ? 'text-secondary' : 'text-red-500'}`}>
                  {Math.round(tag.avg_recall * 100)}%
                </p>
                <p className="text-xs text-on-surface-variant mt-1">{tag.card_count} cards</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Class Overdue */}
      {data.class_overdue?.length > 0 && (
        <motion.div variants={fadeUp}>
          <p className="label-md text-on-surface-variant mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Overdue by Class</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.class_overdue.map((cls) => (
              <div key={cls.class_id} className={`rounded-[2rem] shadow-ambient p-5 card-ethereal ${cls.overdue_count > 0 ? 'bg-red-50' : 'bg-surface-container-lowest'}`}>
                <p className="font-bold text-on-surface">{cls.class_name}</p>
                <p className={`text-3xl font-extrabold mt-1 ${cls.overdue_count > 0 ? 'text-red-500' : 'text-tertiary'}`}>{cls.overdue_count}</p>
                <p className="text-xs text-on-surface-variant mt-1">overdue card-states</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Struggle Cards */}
      {data.struggle_cards?.length > 0 && (
        <motion.div variants={fadeUp}>
          <p className="label-md text-on-surface-variant mb-4 flex items-center gap-2"><ArrowDown className="w-4 h-4" /> Lowest Recall Cards</p>
          <div className="space-y-3">
            {data.struggle_cards.slice(0, 10).map((card) => (
              <div key={card.card_id} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-5 card-ethereal" data-testid={`struggle-card-${card.card_id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="label-sm text-on-surface-variant">{card.deck_name}</span>
                      {(card.tags || []).map(t => (
                        <span key={t} className="label-sm text-[10px] text-primary bg-primary/8 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                    <p className="font-semibold text-on-surface">{card.front}</p>
                    <p className="text-sm text-on-surface-variant mt-1">{card.back}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-2xl font-extrabold ${card.recall_rate >= 0.5 ? 'text-secondary' : 'text-red-500'}`}>
                      {Math.round(card.recall_rate * 100)}%
                    </p>
                    <p className="text-xs text-on-surface-variant">{card.review_count} reviews</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
