import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { analyticsApi } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

function HeatCell({ reviews, retention }) {
  let bg = 'bg-surface-container-high';
  if (reviews > 0) {
    if (retention >= 0.8) bg = 'bg-tertiary';
    else if (retention >= 0.5) bg = 'bg-primary/60';
    else if (retention >= 0.2) bg = 'bg-secondary/60';
    else bg = 'bg-red-300';
  }
  return (
    <div
      className={`w-5 h-5 rounded-sm ${bg} transition-all hover:scale-125 cursor-default`}
      title={`${reviews} reviews, ${Math.round(retention * 100)}% retention`}
    />
  );
}

export default function TeacherHeatmap() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    analyticsApi.teacherHeatmap(user.id).then(setData).catch(() => null).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="w-8 h-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin" /></div>;

  if (!data || data.students.length === 0) {
    return (
      <div className="text-center py-20">
        <Users className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
        <h2 className="headline-md text-on-surface">No student data yet</h2>
        <p className="body-md mt-2">Heatmap will appear once students start reviewing.</p>
      </div>
    );
  }

  const dates = data.dates || [];
  const shortDates = dates.map(d => { const dt = new Date(d + 'T00:00:00'); return dt.getDate().toString(); });

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show" data-testid="teacher-heatmap">
      <motion.div variants={fadeUp}>
        <p className="label-md text-primary mb-2">Student Heatmap</p>
        <h1 className="headline-lg text-on-surface">Study Activity (30 days)</h1>
      </motion.div>

      {/* Legend */}
      <motion.div variants={fadeUp} className="flex items-center gap-4">
        <span className="label-sm text-on-surface-variant">Activity:</span>
        {[
          { label: 'None', bg: 'bg-surface-container-high' },
          { label: 'Low', bg: 'bg-red-300' },
          { label: 'Medium', bg: 'bg-secondary/60' },
          { label: 'Good', bg: 'bg-primary/60' },
          { label: 'Excellent', bg: 'bg-tertiary' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded-sm ${l.bg}`} />
            <span className="text-xs text-on-surface-variant">{l.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Heatmap Grid */}
      <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6 overflow-x-auto">
        {/* Date header row */}
        <div className="flex items-center gap-0.5 mb-2 pl-36">
          {shortDates.map((d, i) => (
            <div key={i} className="w-5 text-center label-sm text-[8px] text-on-surface-variant">{i % 3 === 0 ? d : ''}</div>
          ))}
        </div>

        {/* Student rows */}
        <div className="space-y-1">
          {data.students.map((student) => (
            <div key={student.student_id} className="flex items-center gap-2" data-testid={`heatmap-row-${student.student_id}`}>
              <div className="w-32 shrink-0 truncate">
                <p className="text-sm font-semibold text-on-surface truncate">{student.student_name}</p>
                <p className="text-[10px] text-on-surface-variant">{student.total_reviews} reviews · {Math.round(student.avg_retention * 100)}%</p>
              </div>
              <div className="flex gap-0.5">
                {student.days.map((day, i) => (
                  <HeatCell key={i} reviews={day.reviews} retention={day.retention} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
