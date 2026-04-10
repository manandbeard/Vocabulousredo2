import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { analyticsApi } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const CATEGORY_ICONS = {
  streak: '🔥', reviews: '📚', mastery: '🏆',
};

export default function StudentAchievements() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    analyticsApi.achievements(user.id).then(setData).catch(() => null).finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div className="space-y-8" variants={stagger} initial="hidden" animate="show" data-testid="student-achievements">
      <motion.div variants={fadeUp}>
        <p className="label-md text-primary mb-2">Achievements</p>
        <h1 className="headline-lg text-on-surface">Your badges & milestones</h1>
      </motion.div>

      {/* Earned */}
      {data?.earned?.length > 0 && (
        <motion.div variants={fadeUp}>
          <p className="label-md text-tertiary mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Earned</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.earned.map((ua) => (
              <div key={ua.id} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6 card-ethereal">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, rgba(139,108,193,0.1), rgba(232,168,124,0.1))' }}>
                    {CATEGORY_ICONS[ua.achievement.category] || '⭐'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-on-surface">{ua.achievement.name}</h3>
                    <p className="text-xs text-on-surface-variant mt-1">{ua.achievement.description}</p>
                    <p className="label-sm text-primary mt-2">Earned {new Date(ua.earned_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Locked */}
      {data?.locked?.length > 0 && (
        <motion.div variants={fadeUp}>
          <p className="label-md text-on-surface-variant mb-4 flex items-center gap-2"><Lock className="w-4 h-4" /> Locked</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.locked.map((ach) => (
              <div key={ach.id} className="bg-surface-container-low rounded-[2rem] p-6 opacity-60">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center">
                    <Lock className="w-6 h-6 text-on-surface-variant" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-on-surface">{ach.name}</h3>
                    <p className="text-xs text-on-surface-variant mt-1">{ach.description}</p>
                    <p className="label-sm text-on-surface-variant mt-2">Target: {ach.target_value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {!data?.earned?.length && !data?.locked?.length && (
        <div className="text-center py-20">
          <Award className="w-16 h-16 text-on-surface-variant/30 mx-auto mb-4" />
          <p className="body-lg">Start studying to earn achievements!</p>
        </div>
      )}
    </motion.div>
  );
}
