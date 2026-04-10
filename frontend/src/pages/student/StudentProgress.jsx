import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { analyticsApi } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function StudentProgress() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    analyticsApi.student(user.id).then(setAnalytics).catch(() => null).finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20">
        <p className="body-lg">No progress data yet. Start studying to see your progress!</p>
      </div>
    );
  }

  const retention = analytics.average_retention ? Math.round(analytics.average_retention * 100) : 0;

  return (
    <motion.div className="space-y-8" variants={stagger} initial="hidden" animate="show" data-testid="student-progress">
      <motion.div variants={fadeUp}>
        <p className="label-md text-primary mb-2">Progress</p>
        <h1 className="headline-lg text-on-surface">Your learning journey</h1>
      </motion.div>

      {/* Overview Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Total Reviews', value: analytics.total_reviews, icon: BarChart3, color: 'primary' },
          { label: 'Cards Mastered', value: analytics.cards_mastered, icon: TrendingUp, color: 'tertiary' },
          { label: 'Cards Learning', value: analytics.cards_learning, icon: BookOpen, color: 'secondary' },
          { label: 'Avg Retention', value: `${retention}%`, icon: BarChart3, color: 'primary' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6 card-ethereal">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${stat.color === 'primary' ? 'bg-primary/10' : stat.color === 'secondary' ? 'bg-secondary/10' : 'bg-tertiary/10'}`}>
                <Icon className={`w-5 h-5 ${stat.color === 'primary' ? 'text-primary' : stat.color === 'secondary' ? 'text-secondary' : 'text-tertiary'}`} />
              </div>
              <p className="text-2xl font-extrabold text-on-surface tracking-tight">{stat.value}</p>
              <p className="label-sm mt-1">{stat.label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Deck Progress */}
      {analytics.deck_progress?.length > 0 && (
        <motion.div variants={fadeUp}>
          <p className="label-md text-on-surface-variant mb-4">Deck Progress</p>
          <div className="space-y-4">
            {analytics.deck_progress.map((deck) => {
              const total = deck.total_cards || 1;
              const masteredPct = Math.round((deck.mastered / total) * 100);
              const learningPct = Math.round((deck.learning / total) * 100);
              return (
                <div key={deck.deck_id} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6 card-ethereal">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-on-surface">{deck.deck_name}</h3>
                    <span className="label-sm text-primary">{deck.due_today} due today</span>
                  </div>
                  <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-surface-container-high">
                    <div className="h-full bg-tertiary rounded-full" style={{ width: `${masteredPct}%` }} />
                    <div className="h-full bg-primary rounded-full" style={{ width: `${learningPct}%` }} />
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-xs text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-tertiary" /> {deck.mastered} mastered</span>
                    <span className="flex items-center gap-1.5 text-xs text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-primary" /> {deck.learning} learning</span>
                    <span className="flex items-center gap-1.5 text-xs text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-surface-container-high" /> {deck.new} new</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
